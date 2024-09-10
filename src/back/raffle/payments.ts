import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IRaffle, IPayment, IUserSession, IPaymentStatus } from '../types';
import { CORS_HEADERS } from '../constants';

export const handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const userSession: IUserSession = event.requestContext.authorizer.claims as {
      [x in keyof IUserSession]: string;
    };
    const id = event.pathParameters?.id;
    const ownerId = event.queryStringParameters?.ownerId;
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
        headers: CORS_HEADERS,
      };
    }
    if (!ownerId) {
      return {
        statusCode: 400,
        body: 'You must provide an owner id',
        headers: CORS_HEADERS,
      };
    }
    const raffle = await getRaffle(ownerId, id);
    if (!raffle) {
      return {
        statusCode: 404,
        body: 'Raffle not found',
        headers: CORS_HEADERS,
      };
    }
    if (raffle.ownerId !== userSession.sub) {
      return {
        statusCode: 403,
        body: `You are not authorized to see this raffle's payments`,
        headers: CORS_HEADERS,
      };
    }
    const payments = await getPayments(raffle);
    return {
      statusCode: 200,
      body: JSON.stringify(payments),
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

const getRaffle = async (ownerId: string, id: string): Promise<IRaffle | null> => {
  const params: GetItemCommandInput = {
    TableName: process.env.RAFFLE_DYNAMODB_TABLE_NAME,
    Key: marshall({ ownerId, id }),
  };
  const { Item } = await ddbClient.send(new GetItemCommand(params));
  if (!Item) {
    return null;
  }
  const raffle = unmarshall(Item) as IRaffle;
  return raffle;
};

const getPayments = async (raffle: IRaffle): Promise<IPayment[]> => {
  const queryCommandParams: QueryCommandInput = {
    TableName: process.env.PAYMENT_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: `raffleId = :raffleId`,
    FilterExpression: '#status <> :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: marshall({
      ':raffleId': raffle.id,
      ':status': IPaymentStatus.Created,
    }),
  };
  const { Items = [] } = await ddbClient.send(new QueryCommand(queryCommandParams));
  const payments = Items.map((item) => unmarshall(item)) as IPayment[];
  return payments;
};
