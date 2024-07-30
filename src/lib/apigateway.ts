import {
  BasePathMapping,
  Cors,
  DomainName,
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
  domain: DomainName;
}

export class RaffleHubApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: RaffleHubApiGatewayProps) {
    super(scope, id);
    this.createApiGateway(
      props.raffleIndexMicroservice,
      props.raffleNewMicroservice,
      props.signInMicroservice,
      props.domain,
    );
  }

  private createApiGateway(
    raffleIndexMicroservice: IFunction,
    raffleNewMicroservice: IFunction,
    signInMicroservice: IFunction,
    domain: DomainName,
  ) {
    const apigw = new LambdaRestApi(this, 'RaffleApi', {
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

    const createRaffleModel = new Model(this, 'CreateRaffleValidator', {
      restApi: apigw,
      contentType: 'application/json',
      description: 'Validates the request body for creating a new raffle',
      modelName: 'CreateRaffleValidator',
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
      requestValidator: new RequestValidator(this, 'CreateRaffleBodyValidator', {
        restApi: apigw,
        requestValidatorName: 'CreateRaffleBodyValidator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': createRaffleModel,
      },
    });

    const signInModel = new Model(this, 'SigninValidator', {
      restApi: apigw,
      contentType: 'application/json',
      description: 'Validates the request body for signing in',
      modelName: 'SigninValidator',
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
      requestValidator: new RequestValidator(this, 'SigninBodyValidator', {
        restApi: apigw,
        requestValidatorName: 'SigninBodyValidator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': signInModel,
      },
    });

    new BasePathMapping(this, 'api-gw-base-path-mapping', {
      domainName: domain,
      restApi: apigw,
    });
  }
}
