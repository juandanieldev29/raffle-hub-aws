import {
  Cors,
  JsonSchemaType,
  LambdaIntegration,
  LambdaRestApi,
  Model,
  RequestValidator,
} from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface RaffleHubApiGatewayProps {
  raffleIndexMicroservice: IFunction;
  raffleNewMicroservice: IFunction;
  signInMicroservice: IFunction;
}

export class RaffleHubApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: RaffleHubApiGatewayProps) {
    super(scope, id);
    this.createApiGateway(
      props.raffleIndexMicroservice,
      props.raffleNewMicroservice,
      props.signInMicroservice,
    );
  }

  private createApiGateway(
    raffleIndexMicroservice: IFunction,
    raffleNewMicroservice: IFunction,
    signInMicroservice: IFunction,
  ) {
    const apigw = new LambdaRestApi(this, 'raffleApi', {
      restApiName: 'Raffle Hub Service',
      handler: raffleIndexMicroservice,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://www.raffle-hub.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });

    const createRaffleModel = new Model(this, 'createrafflevalidator', {
      restApi: apigw,
      contentType: 'application/json',
      description: 'Validates the request body for creating a new raffle',
      modelName: 'createrafflevalidator',
      schema: {
        type: JsonSchemaType.OBJECT,
        required: ['prize', 'description', 'ticketPrice'],
        properties: {
          prize: { type: JsonSchemaType.INTEGER, minimum: 1 },
          ticketPrice: { type: JsonSchemaType.INTEGER, minimum: 1 },
          description: { type: JsonSchemaType.STRING, minLength: 1, maxLength: 255 },
          quantityNumbers: { type: JsonSchemaType.INTEGER, minimum: 1, default: 100 },
          quantitySeries: { type: JsonSchemaType.INTEGER, minimum: 1, default: 1000 },
        },
      },
    });

    const raffle = apigw.root.addResource('raffle', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://www.raffle-hub.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });
    raffle.addMethod('GET', new LambdaIntegration(raffleIndexMicroservice));
    raffle.addMethod('POST', new LambdaIntegration(raffleNewMicroservice), {
      requestValidator: new RequestValidator(this, 'createraffle-body-validator', {
        restApi: apigw,
        requestValidatorName: 'createraffle-body-validator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': createRaffleModel,
      },
    });

    const signInModel = new Model(this, 'signinvalidator', {
      restApi: apigw,
      contentType: 'application/json',
      description: 'Validates the request body for signing in',
      modelName: 'signinvalidator',
      schema: {
        type: JsonSchemaType.OBJECT,
        required: ['code'],
        properties: {
          code: { type: JsonSchemaType.STRING, minLength: 1, maxLength: 255 },
        },
      },
    });

    const auth = apigw.root.addResource('auth', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://www.raffle-hub.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });
    auth.addMethod('POST', new LambdaIntegration(signInMicroservice), {
      requestValidator: new RequestValidator(this, 'signin-body-validator', {
        restApi: apigw,
        requestValidatorName: 'signin-body-validator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': signInModel,
      },
    });
  }
}
