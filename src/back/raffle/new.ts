import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { ddbClient } from './ddbClient';
import { IRaffle } from '../types';
import { CORS_HEADERS } from '../constants';

interface CreateRaffleBody {
  prize: number;
  quantityNumbers: number;
  quantitySeries: number;
  ticketPrice: number;
  description: string;
  completionDate: string;
}

interface CognitoUserSession {
  sub: string;
  email: string;
  given_name: string;
  family_name?: string;
  picture?: string;
}

interface Owner {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

export const handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const userSession: CognitoUserSession = event.requestContext.authorizer.claims as {
      [x in keyof CognitoUserSession]: string;
    };
    const owner: Owner = {
      id: userSession.sub,
      email: userSession.email,
      name: formatName(userSession.given_name, userSession.family_name),
      photoURL: userSession.picture,
    };
    const body: CreateRaffleBody = JSON.parse(event.body!);
    const {
      prize,
      quantityNumbers = 100,
      quantitySeries = null,
      ticketPrice,
      description,
      completionDate,
    } = body;
    if (new Date(completionDate).toString() === 'Invalid Date') {
      return {
        statusCode: 400,
        body: 'Invalid Date',
        headers: CORS_HEADERS,
      };
    }
    const id = uuidv4();
    const raffle: IRaffle = {
      ownerId: owner.id,
      id,
      prize,
      quantityNumbers,
      lastAvailableNumber: quantityNumbers - 1,
      quantitySeries,
      ticketPrice,
      description,
      boughtTickets: 0,
      completionDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner,
    };
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(raffle),
    };
    await ddbClient.send(new PutItemCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify(raffle),
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

const formatName = (givenName: string, familyName: string | undefined) => {
  if (!familyName) {
    return givenName;
  }
  return `${givenName} ${familyName}`;
};
