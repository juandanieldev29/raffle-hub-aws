import {
  AuthorizationType,
  BasePathMapping,
  CognitoUserPoolsAuthorizer,
  Cors,
  DomainName,
  JsonSchemaType,
  LambdaIntegration,
  LambdaRestApi,
  Model,
  RequestValidator,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface RaffleHubApiGatewayProps {
  raffleIndexMicroservice: IFunction;
  raffleNewMicroservice: IFunction;
  raffleShowMicroservice: IFunction;
  raffleOwnedMicroservice: IFunction;
  raffleAvailableNumbersMicroservice: IFunction;
  ticketNewMicroservice: IFunction;
  paymentNewMicroservice: IFunction;
  processPaymentMicroservice: IFunction;
  voucherNewMicroservice: IFunction;
  domain: DomainName;
  userPool: UserPool;
}

export class RaffleHubApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: RaffleHubApiGatewayProps) {
    super(scope, id);
    this.createApiGateway(
      props.raffleIndexMicroservice,
      props.raffleNewMicroservice,
      props.raffleShowMicroservice,
      props.raffleOwnedMicroservice,
      props.raffleAvailableNumbersMicroservice,
      props.ticketNewMicroservice,
      props.paymentNewMicroservice,
      props.processPaymentMicroservice,
      props.voucherNewMicroservice,
      props.domain,
      props.userPool,
    );
  }

  private createModelValidators(apiGateway: LambdaRestApi) {
    const createRaffleModel = new Model(this, 'CreateRaffleValidator', {
      restApi: apiGateway,
      contentType: 'application/json',
      description: 'Validates the request body for creating a new raffle',
      modelName: 'CreateRaffleValidator',
      schema: {
        type: JsonSchemaType.OBJECT,
        required: ['prize', 'description', 'ticketPrice', 'completionDate'],
        properties: {
          prize: { type: JsonSchemaType.INTEGER, minimum: 1 },
          ticketPrice: { type: JsonSchemaType.INTEGER, minimum: 1 },
          description: { type: JsonSchemaType.STRING, minLength: 1, maxLength: 255 },
          quantityNumbers: { type: JsonSchemaType.INTEGER, minimum: 1, default: 100 },
          quantitySeries: { type: JsonSchemaType.INTEGER, minimum: 1, default: 1000 },
          completionDate: { type: JsonSchemaType.STRING, minLength: 1, maxLength: 255 },
        },
      },
    });

    const createTicketModel = new Model(this, 'CreateTicketValidator', {
      restApi: apiGateway,
      contentType: 'application/json',
      description: 'Validates the request body for creating a new ticket',
      modelName: 'CreateTicketValidator',
      schema: {
        type: JsonSchemaType.ARRAY,
        minItems: 1,
        items: {
          properties: {
            number: {
              type: JsonSchemaType.INTEGER,
              minimum: 0,
            },
            paymentId: {
              type: JsonSchemaType.STRING,
              format: 'uuid',
            },
            voucherId: {
              type: JsonSchemaType.STRING,
              format: 'uuid',
            },
          },
        },
        required: ['number'],
        oneOf: [
          {
            required: ['paymentId'],
          },
          {
            required: ['voucherId'],
          },
        ],
        additionalProperties: false,
      },
    });

    const createPaymentModel = new Model(this, 'CreatePaymentValidator', {
      restApi: apiGateway,
      contentType: 'application/json',
      description: 'Validates the request body for creating a new payment',
      modelName: 'CreatePaymentValidator',
      schema: {
        type: JsonSchemaType.ARRAY,
        minItems: 1,
        items: {
          properties: {
            number: {
              type: JsonSchemaType.INTEGER,
              minimum: 0,
            },
            ticketPrice: {
              type: JsonSchemaType.NUMBER,
              minimum: 0,
              exclusiveMinimum: true,
            },
          },
        },
        required: ['number', 'ticketPrice'],
        additionalProperties: false,
      },
    });

    const createVoucherModel = new Model(this, 'CreateVoucherValidator', {
      restApi: apiGateway,
      contentType: 'application/json',
      description: 'Validates the request body for creating a new voucher',
      modelName: 'CreateVoucherValidator',
      schema: {
        type: JsonSchemaType.OBJECT,
        required: ['voucherURL'],
        properties: {
          voucherURL: { type: JsonSchemaType.STRING, format: 'uri' },
        },
      },
    });

    return { createRaffleModel, createTicketModel, createPaymentModel, createVoucherModel };
  }

  private createApiGateway(
    raffleIndexMicroservice: IFunction,
    raffleNewMicroservice: IFunction,
    raffleShowMicroservice: IFunction,
    raffleOwnedMicroservice: IFunction,
    raffleAvailableNumbersMicroservice: IFunction,
    ticketNewMicroservice: IFunction,
    paymentNewMicroservice: IFunction,
    processPaymentMicroservice: IFunction,
    voucherNewMicroservice: IFunction,
    domain: DomainName,
    userPool: UserPool,
  ) {
    const apigw = new LambdaRestApi(this, 'RaffleApi', {
      restApiName: 'Raffle Hub Service',
      handler: raffleIndexMicroservice,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://raffle-hub.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });

    const endpointAuthorizer = new CognitoUserPoolsAuthorizer(this, 'NewRaffleAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const { createRaffleModel, createTicketModel, createPaymentModel, createVoucherModel } =
      this.createModelValidators(apigw);

    const raffle = apigw.root.addResource('raffle', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://raffle-hub.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });
    raffle.addMethod('GET', new LambdaIntegration(raffleIndexMicroservice));
    raffle.addMethod('POST', new LambdaIntegration(raffleNewMicroservice), {
      authorizer: endpointAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
      requestValidator: new RequestValidator(this, 'CreateRaffleBodyValidator', {
        restApi: apigw,
        requestValidatorName: 'CreateRaffleBodyValidator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': createRaffleModel,
      },
    });
    const singleRaffle = raffle.addResource('{id}');
    singleRaffle.addMethod('GET', new LambdaIntegration(raffleShowMicroservice));

    const ownedRaffle = raffle.addResource('owned');
    ownedRaffle.addMethod('GET', new LambdaIntegration(raffleOwnedMicroservice), {
      authorizer: endpointAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
    });

    const raffleAvailableNumbers = singleRaffle.addResource('available-numbers');
    raffleAvailableNumbers.addMethod(
      'GET',
      new LambdaIntegration(raffleAvailableNumbersMicroservice),
    );

    const ticket = apigw.root.addResource('ticket', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://raffle-hub.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });
    const raffleTickets = ticket.addResource('{id}');
    raffleTickets.addMethod('POST', new LambdaIntegration(ticketNewMicroservice), {
      requestValidator: new RequestValidator(this, 'CreateTicketBodyValidator', {
        restApi: apigw,
        requestValidatorName: 'CreateTicketBodyValidator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': createTicketModel,
      },
    });

    const payment = apigw.root.addResource('payment', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://raffle-hub.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });
    const processPayment = payment.addResource('process');
    processPayment.addMethod('POST', new LambdaIntegration(processPaymentMicroservice));

    const rafflePayments = payment.addResource('{id}');
    rafflePayments.addMethod('POST', new LambdaIntegration(paymentNewMicroservice), {
      requestValidator: new RequestValidator(this, 'CreatePaymentBodyValidator', {
        restApi: apigw,
        requestValidatorName: 'CreatePaymentBodyValidator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': createPaymentModel,
      },
    });

    const voucher = apigw.root.addResource('voucher', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://raffle-hub.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });
    const raffleVouchers = voucher.addResource('{id}');
    raffleVouchers.addMethod('POST', new LambdaIntegration(voucherNewMicroservice), {
      requestValidator: new RequestValidator(this, 'CreateVoucherBodyValidator', {
        restApi: apigw,
        requestValidatorName: 'CreateVoucherBodyValidator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': createVoucherModel,
      },
    });

    new BasePathMapping(this, 'api-gw-base-path-mapping', {
      domainName: domain,
      restApi: apigw,
    });
  }
}
