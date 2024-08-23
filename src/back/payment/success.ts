import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import Stripe from 'stripe';

import { CORS_HEADERS } from '../constants';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
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
      console.log('Payment successfully processed');
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
