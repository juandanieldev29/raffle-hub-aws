import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RaffleHubApiGateway } from './apigateway';
import { RaffleHubDatabase } from './database';
import { RaffleHubMicroservices } from './microservice';
import { RaffleHubSecrets } from './secret';
import { RaffleHubDomain } from './domain';
import { RaffleHubCertificate } from './certificate';
import { RaffleHubHostedZone } from './hosted-zone';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { raffleTable } = new RaffleHubDatabase(this, 'Database');

    const { googleOAuthConfigSecret } = new RaffleHubSecrets(this, 'Secret');

    const { raffleIndexMicroservice, raffleNewMicroservice, signInMicroservice } =
      new RaffleHubMicroservices(this, 'Microservices', {
        raffleTable: raffleTable,
        googleOAuthConfigSecret: googleOAuthConfigSecret,
      });

    const { certificate } = new RaffleHubCertificate(this, 'Certificate');

    const { domain } = new RaffleHubDomain(this, 'Domain', {
      certificate: certificate,
    });

    new RaffleHubHostedZone(this, 'HostedZone', {
      domain: domain,
    });

    new RaffleHubApiGateway(this, 'ApiGateway', {
      raffleIndexMicroservice: raffleIndexMicroservice,
      raffleNewMicroservice: raffleNewMicroservice,
      signInMicroservice: signInMicroservice,
      domain: domain,
    });
  }
}
