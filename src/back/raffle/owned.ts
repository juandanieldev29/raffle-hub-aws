import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { CORS_HEADERS, DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } from '../constants';
import {
  IRaffle,
  IOwnedRaffle,
  ITicket,
  ITicketStatus,
  IPaymentStatus,
  IPayment,
  IVoucher,
} from '../types';

interface CognitoUserSession {
  sub: string;
  email: string;
  given_name: string;
  family_name?: string;
  picture?: string;
}

export const handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const userSession: CognitoUserSession = event.requestContext.authorizer.claims as {
      [x in keyof CognitoUserSession]: string;
    };
    const limitQueryString = event.queryStringParameters?.limit;
    const exclusiveStartKeyOwnerId = event.queryStringParameters?.exclusiveStartKeyOwnerId;
    const exclusiveStartKeyId = event.queryStringParameters?.exclusiveStartKeyId;
    const limit = getPaginationLimit(limitQueryString);
    const { raffles, lastEvaluatedKey } = await getRaffles(
      limit,
      userSession.sub,
      exclusiveStartKeyOwnerId,
      exclusiveStartKeyId,
    );
    const adminRaffles = await Promise.all(
      raffles.map((raffle) => {
        return getAdminData(raffle);
      }),
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        raffles: adminRaffles,
        lastEvaluatedKey,
      }),
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

const getAdminData = async (raffle: IRaffle): Promise<IOwnedRaffle> => {
  const [tickets, payments, vouchers] = await Promise.all([
    getTickets(raffle),
    getPayments(raffle),
    getVouchers(raffle),
  ]);
  const availableNumbers = tickets.map(({ number }) => number);
  return { ...raffle, tickets, payments, vouchers, boughtTickets: availableNumbers };
};

const getRaffles = async (
  limit: number,
  ownerId: string,
  exclusiveStartKeyOwnerId?: string,
  exclusiveStartKeyId?: string,
): Promise<{ raffles: IRaffle[]; lastEvaluatedKey: { id: string } | null }> => {
  const params: QueryCommandInput = {
    TableName: process.env.RAFFLE_DYNAMODB_TABLE_NAME,
    Limit: limit,
    KeyConditionExpression: `ownerId = :ownerId`,
    ExpressionAttributeValues: marshall({
      ':ownerId': ownerId,
    }),
    ExclusiveStartKey:
      exclusiveStartKeyOwnerId && exclusiveStartKeyId
        ? marshall({ ownerId: exclusiveStartKeyOwnerId, id: exclusiveStartKeyId })
        : undefined,
  };
  const { Items = [], LastEvaluatedKey } = await ddbClient.send(new QueryCommand(params));
  const items = Items.map((item) => {
    const raffle = unmarshall(item) as IRaffle;
    return raffle;
  });
  const lastEvaluatedKey = LastEvaluatedKey
    ? (unmarshall(LastEvaluatedKey) as { id: string })
    : null;
  return { raffles: items, lastEvaluatedKey };
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

const getTickets = async (raffle: IRaffle): Promise<ITicket[]> => {
  const queryCommandParams: QueryCommandInput = {
    TableName: process.env.TICKET_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: `raffleId = :raffleId`,
    FilterExpression: '#status <> :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: marshall({
      ':raffleId': raffle.id,
      ':status': ITicketStatus.Expired,
    }),
  };
  const { Items = [] } = await ddbClient.send(new QueryCommand(queryCommandParams));
  const tickets = Items.map((item) => unmarshall(item)) as ITicket[];
  return tickets;
};

const getPaginationLimit = (queryString: string | undefined): number => {
  if (!queryString) {
    return DEFAULT_PAGINATION_LIMIT;
  }
  const parsedValue = Number.parseInt(queryString, 10);
  if (Number.isNaN(parsedValue)) {
    return DEFAULT_PAGINATION_LIMIT;
  }
  return Math.min(parsedValue, MAX_PAGINATION_LIMIT);
};
