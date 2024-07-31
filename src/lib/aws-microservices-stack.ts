import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RaffleHubApiGateway } from './apigateway';
import { RaffleHubDatabase } from './database';
import { RaffleHubMicroservices } from './microservice';
import { RaffleHubSecrets } from './secret';
import { RaffleHubDomain } from './domain';
import { RaffleHubCertificate } from './certificate';
import { RaffleHubHostedZone } from './hosted-zone';
import { RaffleHubCognito } from './cognito';
import { RaffleHubAmplifyHostingStack } from './amplify';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { raffleTable } = new RaffleHubDatabase(this, 'Database');

    const { googleOAuthConfigSecret, githubTokenSecret } = new RaffleHubSecrets(this, 'Secret');

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
    const cognito = new RaffleHubCognito(this, 'Cognito');
    new RaffleHubAmplifyHostingStack(this, 'Amplify', {
      githubTokenSecret: githubTokenSecret,
      userPoolId: cognito.userPool.userPoolId,
      userPoolClientId: cognito.userPoolClient.userPoolClientId,
      identityPoolId: cognito.identityPool.identityPoolId,
      userPoolDomainUrl: `${cognito.userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
    });

    new CfnOutput(this, 'region', { value: this.region });
    new CfnOutput(this, 'userPoolId', { value: cognito.userPool.userPoolId });
    new CfnOutput(this, 'userPoolWebClientId', { value: cognito.userPoolClient.userPoolClientId });
    new CfnOutput(this, 'identityPoolId', { value: cognito.identityPool.identityPoolId });
    new CfnOutput(this, 'UserPoolDomainUrl', {
      value: `${cognito.userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
    });
    new CfnOutput(this, 'AuthorizedRedirectUserPoolDomainURL', {
      value: `https://${cognito.userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com/oauth2/idpresponse`,
    });
  }
}
