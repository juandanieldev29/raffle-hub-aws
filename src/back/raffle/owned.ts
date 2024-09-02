import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';
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
  ownedId: string,
  initialExclusiveStartKey: string | undefined,
) => {
  let exclusiveStartKey: string | null = initialExclusiveStartKey ? initialExclusiveStartKey : null;
  let raffles: IRaffle[] = [];
  do {
    const params: ScanCommandInput = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Limit: limit,
      FilterExpression: `#owner.id = :ownerId`,
      ExpressionAttributeNames: {
        '#owner': 'owner',
      },
      ExpressionAttributeValues: marshall({
        ':ownerId': ownedId,
      }),
      ExclusiveStartKey: exclusiveStartKey ? marshall({ id: exclusiveStartKey }) : undefined,
    };
    const { Items = [], LastEvaluatedKey } = await ddbClient.send(new ScanCommand(params));
    const items = Items.map((item) => {
      const raffle = unmarshall(item) as IRaffle;
      return raffle;
    });
    raffles = [...raffles, ...items];
    const lastEvaluatedKey = LastEvaluatedKey
      ? (unmarshall(LastEvaluatedKey) as { id: string })
      : null;
    exclusiveStartKey = lastEvaluatedKey ? lastEvaluatedKey.id : null;
  } while (exclusiveStartKey !== null && raffles.length < limit);
  const upperLimitItemId = raffles.at(limit - 1)?.id;
  const lastEvaluatedKey =
    raffles.length > limit && upperLimitItemId ? upperLimitItemId : exclusiveStartKey;
  const rafflesUpperLimit = Math.min(raffles.length, limit);
  return { raffles: raffles.slice(0, rafflesUpperLimit), lastEvaluatedKey };
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
