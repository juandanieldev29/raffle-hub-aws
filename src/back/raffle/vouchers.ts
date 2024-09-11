import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IRaffle, IVoucher, IUserSession } from '../types';
import { CORS_HEADERS } from '../constants';

export const handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const userSession: IUserSession = event.requestContext.authorizer.claims as {
      [x in keyof IUserSession]: string;
    };
    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
        headers: CORS_HEADERS,
      };
    }
    const raffle = await getRaffle(userSession.sub, id);
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
        body: `You are not authorized to see this raffle's vouchers`,
        headers: CORS_HEADERS,
      };
    }
    const vouchers = await getVouchers(raffle);
    return {
      statusCode: 200,
      body: JSON.stringify(vouchers),
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

const getVouchers = async (raffle: IRaffle): Promise<IVoucher[]> => {
  const queryCommandParams: QueryCommandInput = {
    TableName: process.env.VOUCHER_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: `raffleId = :raffleId`,
    ExpressionAttributeValues: marshall({
      ':raffleId': raffle.id,
    }),
  };
  const { Items = [] } = await ddbClient.send(new QueryCommand(queryCommandParams));
  const vouchers = Items.map((item) => unmarshall(item)) as IVoucher[];
  return vouchers;
};
