import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';

const DEFAULT_PAGINATION_LIMIT = 10;
const MAX_PAGINATION_LIMIT = 25;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const limitQueryString = event.queryStringParameters?.limit;
    const limit = getPaginationLimit(limitQueryString);
    const params: ScanCommandInput = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Limit: limit,
    };
    const { Items = [] } = await ddbClient.send(new ScanCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(Items.map((item) => unmarshall(item))),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify('some error happened'),
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
