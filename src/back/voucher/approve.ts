import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IRaffle, IVoucher, IUserSession, IVoucherStatus } from '../types';
import { CORS_HEADERS } from '../constants';

interface ApproveVoucherBody {
  voucherId: string;
}

export const handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const userSession: IUserSession = event.requestContext.authorizer.claims as {
      [x in keyof IUserSession]: string;
    };
    const id = event.pathParameters?.id;
    const body: ApproveVoucherBody = JSON.parse(event.body!);
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
        headers: CORS_HEADERS,
      };
    }
    const raffle = await getRaffle(userSession.sub, id);
    if (!raffle) {
      return {
        statusCode: 404,
        body: 'Raffle not found',
        headers: CORS_HEADERS,
      };
    }
    if (raffle.ownerId !== userSession.sub) {
      return {
        statusCode: 403,
        body: `You are not authorized to approve this raffle's vouchers`,
        headers: CORS_HEADERS,
      };
    }
    const voucher = await getVoucher(raffle.id, body.voucherId);
    if (!voucher) {
      return {
        statusCode: 404,
        body: 'Voucher not found',
        headers: CORS_HEADERS,
      };
    }
    await setVoucherStatusToComplete(voucher);
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

const getVoucher = async (raffleId: string, id: string): Promise<IVoucher | null> => {
  const params: GetItemCommandInput = {
    TableName: process.env.VOUCHER_DYNAMODB_TABLE_NAME,
    Key: marshall({ raffleId, id }),
  };
  const { Item } = await ddbClient.send(new GetItemCommand(params));
  if (!Item) {
    return null;
  }
  const voucher = unmarshall(Item) as IVoucher;
  return voucher;
};

const setVoucherStatusToComplete = async (voucher: IVoucher) => {
  const completeVoucher: IVoucher = {
    raffleId: voucher.raffleId,
    id: voucher.id,
    raffle: voucher.raffle,
    url: voucher.url,
    buyer: voucher.buyer,
    status: IVoucherStatus.Complete,
    createdAt: voucher.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const params: PutItemCommandInput = {
    TableName: process.env.VOUCHER_DYNAMODB_TABLE_NAME,
    Item: marshall(completeVoucher),
  };
  await ddbClient.send(new PutItemCommand(params));
};
