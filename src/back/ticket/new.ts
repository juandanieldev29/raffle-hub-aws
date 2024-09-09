import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  GetItemCommand,
  GetItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

import { ddbClient } from './ddbClient';
import { eventBridgeClient } from './eventBridgeClient';
import {
  IExpireTicketPayload,
  IPendingPaymentPayload,
  IRaffle,
  ITicket,
  ITicketStatus,
} from '../types';
import { CORS_HEADERS } from '../constants';

interface NewTicketItem {
  number: number;
  paymentId?: string;
  voucherId?: string;
}

interface NewTicketBody extends Array<NewTicketItem> {}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const ownerId = event.queryStringParameters?.ownerId;
    const body: NewTicketBody = JSON.parse(event.body!);
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
        headers: CORS_HEADERS,
      };
    }
    if (!body.length) {
      return {
        statusCode: 400,
        body: 'You must provide the numbers to buy',
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
    const params: GetItemCommandInput = {
      TableName: process.env.RAFFLE_DYNAMODB_TABLE_NAME,
      Key: marshall({ ownerId, id }),
    };
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    if (!Item) {
      return {
        statusCode: 404,
        body: 'Raffle not found',
        headers: CORS_HEADERS,
      };
    }
    const raffle = unmarshall(Item) as IRaffle;
    const validNumbers = validateNumbers(body, raffle);
    if (!validNumbers) {
      return {
        statusCode: 400,
        body: `Number must be above 0 and below ${raffle.lastAvailableNumber}`,
        headers: CORS_HEADERS,
      };
    }
    const count = await validateNumbersAreNotBought(body, raffle);
    if (count === undefined) {
      return {
        statusCode: 500,
        body: `Could not retrieve tickets count`,
        headers: CORS_HEADERS,
      };
    }
    if (count > 0) {
      return {
        statusCode: 400,
        body: `Some of the numbers are already reserved`,
        headers: CORS_HEADERS,
      };
    }
    await writeTicketsInBatch(body, raffle);
    const paymentId = body[0].paymentId;
    if (paymentId) {
      await Promise.all([
        await publishExpireTicketEvent(raffle.id, paymentId),
        await publishPendingPaymentEvent(raffle.id, paymentId),
      ]);
    }
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

const publishExpireTicketEvent = async (raffleId: string, paymentId: string) => {
  const expireTicketPayload: IExpireTicketPayload = {
    raffle: {
      id: raffleId,
    },
    payment: {
      id: paymentId,
    },
  };
  const expireTicketParams: PutEventsCommandInput = {
    Entries: [
      {
        Source: 'com.rafflehub.ticket.expireTicket',
        Detail: JSON.stringify(expireTicketPayload),
        DetailType: 'ExpireTicket',
        Resources: [],
        EventBusName: 'RaffleHubEventBus',
      },
    ],
  };
  await eventBridgeClient.send(new PutEventsCommand(expireTicketParams));
};

const publishPendingPaymentEvent = async (raffleId: string, paymentId: string) => {
  const pendingPaymentPayload: IPendingPaymentPayload = {
    raffle: {
      id: raffleId,
    },
    payment: {
      id: paymentId,
    },
  };
  const pendingPaymentParams: PutEventsCommandInput = {
    Entries: [
      {
        Source: 'com.rafflehub.payment.pending',
        Detail: JSON.stringify(pendingPaymentPayload),
        DetailType: 'PendingPayment',
        Resources: [],
        EventBusName: 'RaffleHubEventBus',
      },
    ],
  };
  await eventBridgeClient.send(new PutEventsCommand(pendingPaymentParams));
};

const getUniqueNumbers = (numbers: Array<number>) => {
  return [...new Set(numbers)];
};

const formatNumbersFilter = (numbers: Array<number>): Record<string, number> => {
  const uniqueNumbers = getUniqueNumbers(numbers);
  return uniqueNumbers.reduce((accumulator, currentValue) => {
    return {
      ...accumulator,
      [`:numberValue${currentValue}`]: currentValue,
    };
  }, {});
};

const validateNumbers = (body: NewTicketBody, raffle: IRaffle) => {
  const { lastAvailableNumber } = raffle;
  const numbersToBuy = body.map(({ number }) => number);
  const validNumbers = numbersToBuy.every((number) => {
    return number >= 0 && number <= lastAvailableNumber;
  });
  return validNumbers;
};

const validateNumbersAreNotBought = async (body: NewTicketBody, raffle: IRaffle) => {
  const { id } = raffle;
  const numbersToBuy = body.map(({ number }) => number);
  const numbersRangeQuery = formatNumbersFilter(numbersToBuy);
  const numbersRangeQueryKeys = Object.keys(formatNumbersFilter(numbersToBuy));
  const queryCommandParams: QueryCommandInput = {
    TableName: process.env.TICKET_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: `raffleId = :raffleId`,
    FilterExpression: `#status <> :status and #number in (${numbersRangeQueryKeys.join(',')})`,
    ExpressionAttributeNames: {
      '#status': 'status',
      '#number': 'number',
    },
    ExpressionAttributeValues: marshall({
      ':raffleId': id,
      ':status': ITicketStatus.Expired,
      ...numbersRangeQuery,
    }),
    ProjectionExpression: 'raffle, #number',
    Limit: 1,
  };
  const { Count } = await ddbClient.send(new QueryCommand(queryCommandParams));
  return Count;
};

const writeTicketsInBatch = async (body: NewTicketBody, raffle: IRaffle) => {
  let putRequestItems: Record<string, WriteRequest[]> | undefined = {
    [`${process.env.TICKET_DYNAMODB_TABLE_NAME}`]: body.map(({ number, paymentId, voucherId }) => {
      const payment = paymentId ? { id: paymentId } : null;
      const voucher = voucherId ? { id: voucherId } : null;
      const status = voucher ? ITicketStatus.PendingVerification : ITicketStatus.PendingPayment;
      const ticket: ITicket = {
        raffleId: raffle.id,
        id: uuidv4(),
        number,
        raffle: {
          id: raffle.id,
          ticketPrice: raffle.ticketPrice,
        },
        payment,
        voucher,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        PutRequest: {
          Item: marshall(ticket),
        },
      };
    }),
  };
  do {
    const batchItemsCommandParams: BatchWriteItemCommandInput = {
      RequestItems: putRequestItems,
    };
    const batchWriteResponse = await ddbClient.send(
      new BatchWriteItemCommand(batchItemsCommandParams),
    );
    putRequestItems = batchWriteResponse.UnprocessedItems;
  } while (putRequestItems && Object.keys(putRequestItems).length != 0);
};
