import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import Stripe from 'stripe';

import { ddbClient } from './ddbClient';
import { IPayment, IPaymentStatus } from '../types';
import { CORS_HEADERS } from '../constants';

interface NewTicketItem {
  number: number;
  ticketPrice: number;
}

interface NewTicketBody extends Array<NewTicketItem> {}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const body: NewTicketBody = JSON.parse(event.body!);
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
        headers: CORS_HEADERS,
      };
    }
    if (!body.length) {
      return {
        statusCode: 400,
        body: 'You must provide the numbers to buy',
        headers: CORS_HEADERS,
      };
    }
    const validNumbers = validateNumbers(body);
    if (!validNumbers) {
      return {
        statusCode: 400,
        body: `Number must be above 0`,
        headers: CORS_HEADERS,
      };
    }
    const stripeSecretKey = await getSecretValue('StripeSecretKey');
    if (!stripeSecretKey) {
      return {
        statusCode: 500,
        body: JSON.stringify('stripe secret key not defined'),
        headers: CORS_HEADERS,
      };
    }
    const stripeClient = new Stripe(stripeSecretKey);
    const referer = event.headers['referer'];
    const session = await stripeClient.checkout.sessions.create({
      line_items: body.map(({ number, ticketPrice }) => {
        return {
          price_data: {
            currency: 'crc',
            product_data: {
              name: `Tiquete de rifa para el número ${number}`,
            },
            unit_amount: ticketPrice * 100,
          },
          quantity: 1,
        };
      }),
      metadata: {
        raffleId: id,
      },
      mode: 'payment',
      success_url: `${referer}raffle/${id}`,
      cancel_url: `${referer}raffle/${id}`,
    });
    const authorizationHeader = event.headers['Authorization'] || event.headers['authorization'];
    await createPayment(id, session, authorizationHeader);
    return {
      statusCode: 200,
      body: JSON.stringify(session),
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

const extractToken = (authorizationHeader: string) => {
  return authorizationHeader.replace('Bearer ', '');
};

const verifyToken = async (
  authorizationHeader: string | undefined,
): Promise<{ id: string } | null> => {
  if (!authorizationHeader) {
    return null;
  }
  if (!process.env.USER_POOL_ID || !process.env.USER_POOL_CLIENT_ID) {
    console.log('User pool id or user pool client id not defined');
    return null;
  }
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: 'access',
    clientId: process.env.USER_POOL_CLIENT_ID,
  });
  try {
    const token = extractToken(authorizationHeader);
    const payload = await verifier.verify(token);
    return { id: payload.sub };
  } catch {
    console.log('Access token not valid');
  }
  return null;
};

const createPayment = async (
  raffleId: string,
  session: Stripe.Response<Stripe.Checkout.Session>,
  authorizationHeader: string | undefined,
) => {
  const buyer = await verifyToken(authorizationHeader);
  const payment: IPayment = {
    id: session.id,
    raffle: {
      id: raffleId,
    },
    currency: session.currency,
    buyer,
    customerDetails: null,
    total: null,
    status: IPaymentStatus.Created,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: session.expires_at,
  };
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: marshall(payment),
  };
  await ddbClient.send(new PutItemCommand(params));
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

const validateNumbers = (body: NewTicketBody) => {
  const numbersToBuy = body.map(({ number }) => number);
  const validNumbers = numbersToBuy.every((number) => {
    return number >= 0;
  });
  return validNumbers;
};
