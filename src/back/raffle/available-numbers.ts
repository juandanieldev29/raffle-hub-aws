import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IRaffle, ITicket, ITicketStatus } from '../types';
import { CORS_HEADERS } from '../constants';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
        headers: CORS_HEADERS,
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
        body: 'Raffle not found',
        headers: CORS_HEADERS,
      };
    }
    const raffle: IRaffle = unmarshall(Item) as IRaffle;
    const scanCommandParams: ScanCommandInput = {
      TableName: process.env.TICKET_DYNAMODB_TABLE_NAME,
      FilterExpression: 'raffle.id = :raffleId and #status <> :status',
      ExpressionAttributeNames: {
        '#number': 'number',
        '#status': 'status',
      },
      ExpressionAttributeValues: marshall({
        ':raffleId': id,
        ':status': ITicketStatus.Expired,
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
