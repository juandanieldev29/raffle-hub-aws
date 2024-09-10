import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IRaffle, ITicket, ITicketStatus } from '../types';
import { CORS_HEADERS } from '../constants';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const ownerId = event.queryStringParameters?.ownerId;
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
        headers: CORS_HEADERS,
      };
    }
    if (!ownerId) {
      return {
        statusCode: 400,
        body: 'You must provide an owner id',
        headers: CORS_HEADERS,
      };
    }
    const raffle = await getRaffle(ownerId, id);
    if (!raffle) {
      return {
        statusCode: 404,
        body: 'Raffle not found',
        headers: CORS_HEADERS,
      };
    }
    const raffleWithAvailableNumbers = await getTickets(raffle);
    return {
      statusCode: 200,
      body: JSON.stringify(raffleWithAvailableNumbers),
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

const getRaffle = async (ownerId: string, id: string): Promise<IRaffle | null> => {
  const params: GetItemCommandInput = {
    TableName: process.env.RAFFLE_DYNAMODB_TABLE_NAME,
    Key: marshall({ ownerId, id }),
  };
  const { Item } = await ddbClient.send(new GetItemCommand(params));
  if (!Item) {
    return null;
  }
  const raffle = unmarshall(Item) as IRaffle;
  return raffle;
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
