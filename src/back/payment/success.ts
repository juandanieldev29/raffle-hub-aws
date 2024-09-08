import { SQSEvent, SQSHandler } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IPayment, IPaymentStatus, IPaymentSuccessPayload } from '../types';

interface IPaymentSuccessPayloadBody {
  detail: IPaymentSuccessPayload;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const message of event.Records) {
    const expireTicketEventRequest: IPaymentSuccessPayloadBody = JSON.parse(message.body);
    const messageDetail = expireTicketEventRequest.detail;
    const payment = await getPaymentById(messageDetail);
    if (payment && payment.status !== IPaymentStatus.Complete) {
      await setPaymentStatusToComplete(payment, messageDetail);
    }
  }
};

const setPaymentStatusToComplete = async (
  payment: IPayment,
  paymentSuccessPayload: IPaymentSuccessPayload,
) => {
  const pendingPayment: IPayment = {
    raffleId: payment.raffleId,
    id: payment.id,
    raffle: payment.raffle,
    currency: payment.currency,
    buyer: payment.buyer,
    customerDetails: paymentSuccessPayload.customerDetails,
    total: paymentSuccessPayload.total,
    status: IPaymentStatus.Complete,
    url: payment.url,
    createdAt: payment.createdAt,
    updatedAt: new Date().toISOString(),
    expiresAt: payment.expiresAt,
  };
  const params: PutItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: marshall(pendingPayment),
  };
  await ddbClient.send(new PutItemCommand(params));
};

const getPaymentById = async (
  paymentSuccessPayload: IPaymentSuccessPayload,
): Promise<IPayment | null> => {
  const { raffle: payloadRaffle, payment: payloadPayment } = paymentSuccessPayload;
  const getItemCommandParams: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ raffleId: payloadRaffle.id, id: payloadPayment.id }),
  };
  const { Item } = await ddbClient.send(new GetItemCommand(getItemCommandParams));
  if (!Item) {
    return null;
  }
  const payment: IPayment = unmarshall(Item) as IPayment;
  return payment;
};
