import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';
import Stripe from 'stripe';

import { eventBridgeClient } from './eventBridgeClient';
import { IPaymentSuccessPayload } from '../types';
import { CORS_HEADERS } from '../constants';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(event.body);
    const stripeSecretKey = await getSecretValue('StripeSecretKey');
    if (!stripeSecretKey) {
      return {
        statusCode: 500,
        body: JSON.stringify('Stripe secret key not defined'),
        headers: CORS_HEADERS,
      };
    }
    const stripeWebhookSecretKey = await getSecretValue('StripeWebhookSecretKey');
    if (!stripeWebhookSecretKey) {
      return {
        statusCode: 500,
        body: JSON.stringify('Stripe webhook secret key not defined'),
        headers: CORS_HEADERS,
      };
    }
    const stripeClient = new Stripe(stripeSecretKey);
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify('Body is not present'),
        headers: CORS_HEADERS,
      };
    }
    const signature = event.headers['Stripe-Signature'];
    if (!signature) {
      return {
        statusCode: 400,
        body: JSON.stringify('Signature is not present'),
        headers: CORS_HEADERS,
      };
    }
    const stripeEvent = stripeClient.webhooks.constructEvent(
      event.body,
      signature,
      stripeWebhookSecretKey,
    );
    if (
      stripeEvent.type === 'checkout.session.completed' ||
      stripeEvent.type === 'checkout.session.async_payment_succeeded'
    ) {
      const raffleId = stripeEvent.data.object.metadata?.raffleId;
      const paymentId = stripeEvent.data.object.id;
      if (!raffleId) {
        return {
          statusCode: 400,
          body: 'Raffle id is not present',
          headers: CORS_HEADERS,
        };
      }
      const paymentSuccessPayload: IPaymentSuccessPayload = {
        raffle: {
          id: raffleId,
        },
        payment: {
          id: paymentId,
        },
      };
      const expireTicketParams: PutEventsCommandInput = {
        Entries: [
          {
            Source: 'com.rafflehub.payment.success',
            Detail: JSON.stringify(paymentSuccessPayload),
            DetailType: 'PaymentSuccess',
            Resources: [],
            EventBusName: 'RaffleHubEventBus',
          },
        ],
      };
      await eventBridgeClient.send(new PutEventsCommand(expireTicketParams));
    }
    return {
      statusCode: 200,
      body: '',
      headers: CORS_HEADERS,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify('some error happened'),
      headers: CORS_HEADERS,
    };
  }
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
