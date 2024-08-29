import { SQSEvent, SQSHandler } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IPayment, IPaymentStatus, IPendingPaymentPayload } from '../types';

interface IPendingPaymentPayloadBody {
  detail: IPendingPaymentPayload;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const message of event.Records) {
    const pendingPaymentEventRequest: IPendingPaymentPayloadBody = JSON.parse(message.body);
    const messageDetail = pendingPaymentEventRequest.detail;
    const payment = await getPaymentById(messageDetail);
    if (payment) {
      await setPaymentStatusToPendingPayment(payment);
    }
  }
};

const setPaymentStatusToPendingPayment = async (payment: IPayment) => {
  const pendingPayment = {
    id: payment.id,
    raffle: payment.raffle,
    currency: payment.currency,
    buyer: payment.buyer,
    customerDetails: payment.customerDetails,
    total: payment.total,
    status: IPaymentStatus.PendingPayment,
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
  pendingPaymentPayload: IPendingPaymentPayload,
): Promise<IPayment | null> => {
  const { payment: payloadPayment } = pendingPaymentPayload;
  const scanCommandParams: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ id: payloadPayment.id }),
  };
  const { Item } = await ddbClient.send(new GetItemCommand(scanCommandParams));
  if (!Item) {
    return null;
  }
  const payment: IPayment = unmarshall(Item) as IPayment;
  return payment;
};
