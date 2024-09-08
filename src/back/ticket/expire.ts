import { SQSEvent, SQSHandler } from 'aws-lambda';
import {
  QueryCommand,
  QueryCommandInput,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IExpireTicketPayload, ITicket, ITicketStatus } from '../types';

interface IExpireTicketPayloadBody {
  detail: IExpireTicketPayload;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const message of event.Records) {
    const expireTicketEventRequest: IExpireTicketPayloadBody = JSON.parse(message.body);
    const messageDetail = expireTicketEventRequest.detail;
    const tickets = await getTicketByRaffleAndPayment(messageDetail);
    if (tickets.length) {
      await setTicketsStatusToExpired(tickets);
    }
  }
};

const setTicketsStatusToExpired = async (tickets: Array<ITicket>) => {
  let putRequestItems: Record<string, WriteRequest[]> | undefined = {
    [`${process.env.TICKET_DYNAMODB_TABLE_NAME}`]: tickets.map(
      ({ raffleId, id, number, payment, raffle, createdAt }) => {
        const ticket: ITicket = {
          raffleId,
          id,
          number,
          payment,
          raffle,
          status: ITicketStatus.Expired,
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
  expireTicketPayload: IExpireTicketPayload,
): Promise<Array<ITicket>> => {
  const { payment, raffle } = expireTicketPayload;
  const queryCommandParams: QueryCommandInput = {
    TableName: process.env.TICKET_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: `raffleId = :raffleId`,
    FilterExpression: `payment.id = :paymentId and #status = :status`,
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: marshall({
      ':raffleId': raffle.id,
      ':paymentId': payment.id,
      ':status': ITicketStatus.PendingPayment,
    }),
  };
  const { Items } = await ddbClient.send(new QueryCommand(queryCommandParams));
  if (!Items) {
    return [];
  }
  return Items.map((item) => {
    const ticket = unmarshall(item) as ITicket;
    return ticket;
  });
};
