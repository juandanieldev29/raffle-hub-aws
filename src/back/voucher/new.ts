import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { v4 as uuidv4 } from 'uuid';

import { ddbClient } from './ddbClient';
import { IVoucher, IVoucherStatus } from '../types';
import { CORS_HEADERS } from '../constants';

interface NewVoucherBody {
  voucherURL: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const body: NewVoucherBody = JSON.parse(event.body!);
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
        headers: CORS_HEADERS,
      };
    }
    const authorizationHeader = event.headers['Authorization'] || event.headers['authorization'];
    const voucher = await createVoucher(id, body.voucherURL, authorizationHeader);
    return {
      statusCode: 200,
      body: JSON.stringify(voucher),
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

const extractToken = (authorizationHeader: string) => {
  return authorizationHeader.replace('Bearer ', '');
};

const verifyToken = async (
  authorizationHeader: string | undefined,
): Promise<{ id: string } | null> => {
  if (!authorizationHeader) {
    return null;
  }
  if (!process.env.USER_POOL_ID || !process.env.USER_POOL_CLIENT_ID) {
    console.log('User pool id or user pool client id not defined');
    return null;
  }
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: 'id',
    clientId: process.env.USER_POOL_CLIENT_ID,
  });
  try {
    const token = extractToken(authorizationHeader);
    const payload = await verifier.verify(token);
    return { id: payload.sub };
  } catch (err) {
    console.log(err);
    console.log('Access token not valid');
  }
  return null;
};

const createVoucher = async (
  raffleId: string,
  voucherURL: string,
  authorizationHeader: string | undefined,
) => {
  const buyer = await verifyToken(authorizationHeader);
  const voucher: IVoucher = {
    raffleId: raffleId,
    id: uuidv4(),
    raffle: {
      id: raffleId,
    },
    url: voucherURL,
    buyer,
    status: IVoucherStatus.Created,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: marshall(voucher),
  };
  await ddbClient.send(new PutItemCommand(params));
  return voucher;
};
