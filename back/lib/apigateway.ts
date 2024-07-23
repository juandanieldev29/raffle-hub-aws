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
}

export class RaffleHubApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: RaffleHubApiGatewayProps) {
    super(scope, id);
    this.createRaffleApi(props.raffleIndexMicroservice, props.raffleNewMicroservice);
  }

  private createRaffleApi(raffleIndexMicroservice: IFunction, raffleNewMicroservice: IFunction) {
    const apigw = new LambdaRestApi(this, 'raffleApi', {
      restApiName: 'Raffle Service',
      handler: raffleIndexMicroservice,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true,
      },
    });

    const createRaffleModel = new Model(this, 'model-validator', {
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

    const raffle = apigw.root.addResource('raffle');
    raffle.addMethod('GET');
    raffle.addMethod('POST', new LambdaIntegration(raffleNewMicroservice), {
      requestValidator: new RequestValidator(this, 'body-validator', {
        restApi: apigw,
        requestValidatorName: 'body-validator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': createRaffleModel,
      },
    });
  }
}
