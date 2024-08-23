import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { CORS_HEADERS } from '../constants';

const DEFAULT_PAGINATION_LIMIT = 10;
const MAX_PAGINATION_LIMIT = 25;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const limitQueryString = event.queryStringParameters?.limit;
    const exclusiveStartKey = event.queryStringParameters?.exclusiveStartKey;
    const limit = getPaginationLimit(limitQueryString);
    const params: ScanCommandInput = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Limit: limit,
      ExclusiveStartKey: exclusiveStartKey ? marshall({ id: exclusiveStartKey }) : undefined,
    };
    const { Items = [], LastEvaluatedKey } = await ddbClient.send(new ScanCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({
        raffles: Items.map((item) => unmarshall(item)),
        lastEvaluatedKey: LastEvaluatedKey ? unmarshall(LastEvaluatedKey) : null,
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
