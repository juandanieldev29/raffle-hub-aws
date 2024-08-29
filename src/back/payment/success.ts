import { SQSEvent, SQSHandler } from 'aws-lambda';
import {
  ScanCommand,
  ScanCommandInput,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IProcessPaymentPayload, ITicket, ITicketStatus } from '../types';

interface IProcessPaymentPayloadBody {
  detail: IProcessPaymentPayload;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const message of event.Records) {
    const expireTicketEventRequest: IProcessPaymentPayloadBody = JSON.parse(message.body);
    const messageDetail = expireTicketEventRequest.detail;
    const tickets = await getTicketByRaffleAndPayment(messageDetail);
    if (tickets.length) {
      await setTicketsStatusToComplete(tickets);
    }
  }
};

const setTicketsStatusToComplete = async (tickets: Array<ITicket>) => {
  let putRequestItems: Record<string, WriteRequest[]> | undefined = {
    [`${process.env.TICKET_DYNAMODB_TABLE_NAME}`]: tickets.map(
      ({ id, number, payment, raffle, createdAt }) => {
        const ticket: ITicket = {
          id,
          number,
          payment,
          raffle,
          status: ITicketStatus.Complete,
          createdAt,
          updatedAt: new Date().toISOString(),
        };
        return {
          PutRequest: {
            Item: marshall(ticket),
          },
        };
      },
    ),
  };
  do {
    const batchItemsCommandParams: BatchWriteItemCommandInput = {
      RequestItems: putRequestItems,
    };
    const batchWriteResponse = await ddbClient.send(
      new BatchWriteItemCommand(batchItemsCommandParams),
    );
    putRequestItems = batchWriteResponse.UnprocessedItems;
  } while (putRequestItems && Object.keys(putRequestItems).length != 0);
};

const getTicketByRaffleAndPayment = async (
  paymentSuccessPayload: IProcessPaymentPayload,
): Promise<Array<ITicket>> => {
  const { payment, raffle } = paymentSuccessPayload;
  const scanCommandParams: ScanCommandInput = {
    TableName: process.env.TICKET_DYNAMODB_TABLE_NAME,
    FilterExpression: `raffle.id = :raffleId and payment.id = :paymentId and #status = :status`,
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: marshall({
      ':raffleId': raffle.id,
      ':paymentId': payment.id,
      ':status': ITicketStatus.PendingPayment,
    }),
  };
  const { Items } = await ddbClient.send(new ScanCommand(scanCommandParams));
  if (!Items) {
    return [];
  }
  return Items.map((item) => {
    const ticket = unmarshall(item) as ITicket;
    return ticket;
  });
};
