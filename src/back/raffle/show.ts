import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AttributeValue, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import {
  marshall,
  NativeAttributeValue,
  NativeScalarAttributeValue,
  unmarshall,
} from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';

export interface IRaffle {
  id: string;
  owner: {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
  };
  prize: number;
  description: string;
  quantityNumbers: number;
  quantitySeries?: number;
  ticketPrice: number;
  boughtTickets: number;
  lastAvailableNumber: number;
  createdAt: string;
  updatedAt: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
      };
    }
    const params: GetItemCommandInput = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id }),
    };
    const { Item }: { Item?: Record<keyof IRaffle, AttributeValue> } = await ddbClient.send(
      new GetItemCommand(params),
    );
    if (!Item) {
      return {
        statusCode: 404,
        body: '',
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(unmarshall(Item)),
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': 'https://www.raffle-hub.net',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify('some error happened'),
    };
  }
};
