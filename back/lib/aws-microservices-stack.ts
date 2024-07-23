import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RaffleHubApiGateway } from './apigateway';
import { RaffleHubDatabase } from './database';
import { RaffleHubMicroservices } from './microservice';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new RaffleHubDatabase(this, 'Database');

    const microservices = new RaffleHubMicroservices(this, 'Microservices', {
      raffleTable: database.raffleTable,
    });

    const apigateway = new RaffleHubApiGateway(this, 'ApiGateway', {
      raffleIndexMicroservice: microservices.raffleIndexMicroservice,
      raffleNewMicroservice: microservices.raffleNewMicroservice,
    });
  }
}
