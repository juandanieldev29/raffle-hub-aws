import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  ScanCommand,
  ScanCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IRaffle, ITicket, ITicketStatus } from '../types';
import { CORS_HEADERS, DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } from '../constants';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const limitQueryString = event.queryStringParameters?.limit;
    const exclusiveStartKeyOwnerId = event.queryStringParameters?.exclusiveStartKeyOwnerId;
    const exclusiveStartKeyId = event.queryStringParameters?.exclusiveStartKeyId;
    const limit = getPaginationLimit(limitQueryString);
    const { raffles, lastEvaluatedKey } = await getRaffles(
      limit,
      exclusiveStartKeyOwnerId,
      exclusiveStartKeyId,
    );
    const rafflesWithAvailableNumbers = await Promise.all(
      raffles.map((raffle) => {
        return getTickets(raffle);
      }),
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        raffles: rafflesWithAvailableNumbers,
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

const getRaffles = async (
  limit: number,
  exclusiveStartKeyOwnerId?: string,
  exclusiveStartKeyId?: string,
): Promise<{ raffles: IRaffle[]; lastEvaluatedKey: { ownerId: string; id: string } | null }> => {
  const params: ScanCommandInput = {
    TableName: process.env.RAFFLE_DYNAMODB_TABLE_NAME,
    Limit: limit,
    ExclusiveStartKey:
      exclusiveStartKeyOwnerId && exclusiveStartKeyId
        ? marshall({ ownerId: exclusiveStartKeyOwnerId, id: exclusiveStartKeyId })
        : undefined,
  };
  const { Items = [], LastEvaluatedKey } = await ddbClient.send(new ScanCommand(params));
  return {
    raffles: Items.map((item) => unmarshall(item) as IRaffle),
    lastEvaluatedKey: LastEvaluatedKey
      ? (unmarshall(LastEvaluatedKey) as { ownerId: string; id: string })
      : null,
  };
};

const getTickets = async (raffle: IRaffle): Promise<IRaffle> => {
  const queryCommandParams: QueryCommandInput = {
    TableName: process.env.TICKET_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: `raffleId = :raffleId`,
    FilterExpression: '#status <> :status',
    ExpressionAttributeNames: {
      '#number': 'number',
      '#status': 'status',
    },
    ExpressionAttributeValues: marshall({
      ':raffleId': raffle.id,
      ':status': ITicketStatus.Expired,
    }),
    ProjectionExpression: '#number',
  };
  const { Items = [] } = await ddbClient.send(new QueryCommand(queryCommandParams));
  const availableNumbers = Items.map((item) => unmarshall(item)) as Pick<ITicket, 'number'>[];
  return { ...raffle, boughtTickets: availableNumbers.map(({ number }) => number) };
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
