import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import Stripe from 'stripe';

interface NewTicketItem {
  number: number;
  ticketPrice: number;
}

interface NewTicketBody extends Array<NewTicketItem> {}

export const getSecretValue = async (secretName: string) => {
  const client = new SecretsManagerClient();
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );
  return response.SecretString;
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const body: NewTicketBody = JSON.parse(event.body!);
    if (!id) {
      return {
        statusCode: 400,
        body: 'You must provide a raffle id',
      };
    }
    if (!body.length) {
      return {
        statusCode: 400,
        body: 'You must provide the numbers to buy',
      };
    }
    const validNumbers = validateNumbers(body);
    if (!validNumbers) {
      return {
        statusCode: 400,
        body: `Number must be above 0`,
      };
    }
    const stripeSecretKey = await getSecretValue('StripeSecretKey');
    if (!stripeSecretKey) {
      return {
        statusCode: 500,
        body: JSON.stringify('stripe secret key not defined'),
      };
    }
    const stripeClient = new Stripe(stripeSecretKey);
    const referer = event.headers['referer'];
    const session = await stripeClient.checkout.sessions.create({
      line_items: body.map(({ number, ticketPrice }) => {
        return {
          price_data: {
            currency: 'crc',
            product_data: {
              name: `Tiquete de rifa para el número ${number}`,
            },
            unit_amount: ticketPrice * 100,
          },
          quantity: 1,
        };
      }),
      mode: 'payment',
      success_url: `${referer}raffle/${id}`,
      cancel_url: `${referer}raffle/${id}`,
    });
    return {
      statusCode: 200,
      body: JSON.stringify(session),
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': 'https://raffle-hub.net',
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

const validateNumbers = (body: NewTicketBody) => {
  const numbersToBuy = body.map(({ number }) => number);
  const validNumbers = numbersToBuy.every((number) => {
    return number >= 0;
  });
  return validNumbers;
};
