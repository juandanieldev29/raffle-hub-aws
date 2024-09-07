import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { CORS_HEADERS, DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } from '../constants';
import { IRaffle } from '../types';

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
    const { raffles, lastEvaluatedKey } = await fetchItems(
      limit,
      userSession.sub,
      exclusiveStartKey,
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        raffles,
        lastEvaluatedKey: lastEvaluatedKey ? { id: lastEvaluatedKey } : null,
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

const fetchItems = async (
  limit: number,
  ownerId: string,
  exclusiveStartKey: string | undefined,
) => {
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
