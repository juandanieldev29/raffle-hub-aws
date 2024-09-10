import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { CORS_HEADERS, DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } from '../constants';
import { IRaffle, ITicket, ITicketStatus } from '../types';

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
    const exclusiveStartKey = event.queryStringParameters?.exclusiveStartKey;
    const limit = getPaginationLimit(limitQueryString);
    const { raffles, lastEvaluatedKey } = await getRaffles(
      limit,
      userSession.sub,
      exclusiveStartKey,
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
  ownerId: string,
  exclusiveStartKey: string | undefined,
): Promise<{ raffles: IRaffle[]; lastEvaluatedKey: { id: string } | null }> => {
  const params: QueryCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Limit: limit,
    KeyConditionExpression: `ownerId = :ownerId`,
    ExpressionAttributeValues: marshall({
      ':ownerId': ownerId,
    }),
    ExclusiveStartKey: exclusiveStartKey ? marshall({ id: exclusiveStartKey }) : undefined,
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
