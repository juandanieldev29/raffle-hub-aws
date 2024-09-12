import { SQSEvent, SQSHandler } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IVoucher, IVoucherStatus, IPendingVoucherPayload } from '../types';

interface IPendingVoucherPayloadBody {
  detail: IPendingVoucherPayload;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const message of event.Records) {
    const pendingVoucherEventRequest: IPendingVoucherPayloadBody = JSON.parse(message.body);
    const messageDetail = pendingVoucherEventRequest.detail;
    const voucher = await getVoucherById(messageDetail);
    if (voucher) {
      await setVoucherStatusToPendingVerification(voucher);
    }
  }
};

const setVoucherStatusToPendingVerification = async (voucher: IVoucher) => {
  const pendingVoucher: IVoucher = {
    raffleId: voucher.raffleId,
    id: voucher.id,
    raffle: voucher.raffle,
    url: voucher.url,
    buyer: voucher.buyer,
    status: IVoucherStatus.PendingVerification,
    createdAt: voucher.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const params: PutItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: marshall(pendingVoucher),
  };
  await ddbClient.send(new PutItemCommand(params));
};

const getVoucherById = async (
  pendingVoucherPayload: IPendingVoucherPayload,
): Promise<IVoucher | null> => {
  const { raffle: payloadRaffle, voucher: payloadVoucher } = pendingVoucherPayload;
  const getItemCommandParams: GetItemCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ raffleId: payloadRaffle.id, id: payloadVoucher.id }),
  };
  const { Item } = await ddbClient.send(new GetItemCommand(getItemCommandParams));
  if (!Item) {
    return null;
  }
  const voucher: IVoucher = unmarshall(Item) as IVoucher;
  return voucher;
};
