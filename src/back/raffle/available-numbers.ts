import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IRaffle, ITicket } from '../types';

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
      TableName: process.env.RAFFLE_DYNAMODB_TABLE_NAME,
      Key: marshall({ id }),
    };
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    if (!Item) {
      return {
        statusCode: 404,
        body: '',
      };
    }
    const raffle: IRaffle = unmarshall(Item) as IRaffle;
    const scanCommandParams: ScanCommandInput = {
      TableName: process.env.TICKET_DYNAMODB_TABLE_NAME,
      FilterExpression: 'raffle.id = :raffleId',
      ExpressionAttributeNames: {
        '#number': 'number',
      },
      ExpressionAttributeValues: marshall({
        ':raffleId': id,
      }),
      ProjectionExpression: 'raffle, #number',
    };
    const { Items = [] } = await ddbClient.send(new ScanCommand(scanCommandParams));
    const tickets: ITicket[] = Items.map((item) => unmarshall(item)) as ITicket[];
    const boughtNumbers = tickets.map((x) => x.number);
    const availableNumbers = Array.from({ length: raffle.quantityNumbers }, (_, i) => i).filter(
      (x) => {
        return !boughtNumbers.includes(x);
      },
    );
    return {
      statusCode: 200,
      body: JSON.stringify(availableNumbers),
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
