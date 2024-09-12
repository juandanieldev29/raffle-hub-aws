import { SQSEvent, SQSHandler } from 'aws-lambda';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import {
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import Stripe from 'stripe';

import { ddbClient } from './ddbClient';
import { IPayment, IPaymentStatus, IExpirePaymentPayload } from '../types';

interface IExpirePaymentPayloadBody {
  detail: IExpirePaymentPayload;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const message of event.Records) {
    const pendingPaymentEventRequest: IExpirePaymentPayloadBody = JSON.parse(message.body);
    const messageDetail = pendingPaymentEventRequest.detail;
    const payment = await getPaymentById(messageDetail);
    if (payment && payment.status === IPaymentStatus.PendingPayment) {
      await setPaymentStatusToExpiredPayment(payment);
      await expireStripePayment(messageDetail);
    }
  }
};

const setPaymentStatusToExpiredPayment = async (payment: IPayment) => {
  const pendingPayment: IPayment = {
    raffleId: payment.raffleId,
    id: payment.id,
    raffle: payment.raffle,
    currency: payment.currency,
    buyer: payment.buyer,
    customerDetails: payment.customerDetails,
    total: payment.total,
    status: IPaymentStatus.Expired,
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
  pendingPaymentPayload: IExpirePaymentPayload,
): Promise<IPayment | null> => {
  const { raffle: payloadRaffle, payment: payloadPayment } = pendingPaymentPayload;
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

const expireStripePayment = async (pendingPaymentPayload: IExpirePaymentPayload): Promise<void> => {
  const { payment: payloadPayment } = pendingPaymentPayload;
  const stripeSecretKey = await getSecretValue('StripeSecretKey');
  if (!stripeSecretKey) {
    console.log('Stripe secret key not defined');
    return;
  }
  const stripeClient = new Stripe(stripeSecretKey);
  await stripeClient.checkout.sessions.expire(payloadPayment.id);
};

const getSecretValue = async (secretName: string) => {
  const client = new SecretsManagerClient();
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );
  return response.SecretString;
};
