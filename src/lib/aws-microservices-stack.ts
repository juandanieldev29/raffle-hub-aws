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
import { RaffleHubQueue } from './queue';
import { RaffleHubEventBus } from './event-bus';
import { RaffleHubStorage } from './storage';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { raffleImageBucket } = new RaffleHubStorage(this, 'Storage');
    const cognito = new RaffleHubCognito(this, 'Cognito', {
      raffleImageBucket: raffleImageBucket,
    });
    const { raffleTable, ticketTable, paymentTable, voucherTable } = new RaffleHubDatabase(
      this,
      'Database',
    );
    const { githubTokenSecret, stripeKeySecret, stripeWebookKeySecret } = new RaffleHubSecrets(
      this,
      'Secret',
    );

    const {
      raffleIndexMicroservice,
      raffleNewMicroservice,
      raffleShowMicroservice,
      raffleOwnedMicroservice,
      raffleVouchersMicroservice,
      rafflePaymentsMicroservice,
      raffleAvailableNumbersMicroservice,
      ticketNewMicroservice,
      paymentNewMicroservice,
      ticketCompleteMicroservice,
      processPaymentMicroservice,
      paymentSuccessMicroservice,
      pendingPaymentMicroservice,
      ticketExpireMicroservice,
      voucherNewMicroservice,
      paymentExpireMicroservice,
      pendingVoucherMicroservice,
    } = new RaffleHubMicroservices(this, 'Microservices', {
      raffleTable: raffleTable,
      ticketTable: ticketTable,
      paymentTable: paymentTable,
      voucherTable: voucherTable,
      stripeKeySecret: stripeKeySecret,
      stripeWebookKeySecret: stripeWebookKeySecret,
      userPoolId: cognito.userPool.userPoolId,
      userPoolClientId: cognito.userPoolClient.userPoolClientId,
    });

    const {
      expireTicketQueue,
      ticketCompleteQueue,
      paymentSuccessQueue,
      pendingPaymentQueue,
      expirePaymentQueue,
      pendingVoucherQueue,
    } = new RaffleHubQueue(this, 'Queue', {
      ticketExpireConsumer: ticketExpireMicroservice,
      ticketCompleteConsumer: ticketCompleteMicroservice,
      processPaymentConsumer: paymentSuccessMicroservice,
      pendingPaymentConsumer: pendingPaymentMicroservice,
      expirePaymentConsumer: paymentExpireMicroservice,
      pendingVoucherConsumer: pendingVoucherMicroservice,
    });

    new RaffleHubEventBus(this, 'EventBus', {
      expireTicketPublisher: ticketNewMicroservice,
      expireTicketQueue: expireTicketQueue,
      ticketCompleteQueue: ticketCompleteQueue,
      paymentSuccessPublisher: processPaymentMicroservice,
      paymentSuccessQueue: paymentSuccessQueue,
      pendingPaymentPublisher: ticketNewMicroservice,
      pendingPaymentQueue: pendingPaymentQueue,
      expirePaymentPublisher: ticketNewMicroservice,
      expirePaymentQueue: expirePaymentQueue,
      pendingVoucherPublisher: ticketNewMicroservice,
      pendingVoucherQueue: pendingVoucherQueue,
    });

    const { certificate } = new RaffleHubCertificate(this, 'Certificate');

    const { domain } = new RaffleHubDomain(this, 'Domain', {
      certificate: certificate,
    });

    new RaffleHubHostedZone(this, 'HostedZone', {
      domain: domain,
    });

    new RaffleHubApiGateway(this, 'ApiGateway', {
      raffleIndexMicroservice,
      raffleNewMicroservice,
      raffleShowMicroservice,
      raffleOwnedMicroservice,
      raffleVouchersMicroservice,
      rafflePaymentsMicroservice,
      raffleAvailableNumbersMicroservice,
      ticketNewMicroservice,
      paymentNewMicroservice,
      processPaymentMicroservice,
      voucherNewMicroservice,
      domain: domain,
      userPool: cognito.userPool,
    });
    new RaffleHubAmplifyHostingStack(this, 'Amplify', {
      githubTokenSecret: githubTokenSecret,
      userPoolId: cognito.userPool.userPoolId,
      userPoolClientId: cognito.userPoolClient.userPoolClientId,
      identityPoolId: cognito.identityPool.identityPoolId,
      userPoolDomainUrl: `${cognito.userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
      raffleImageBucketName: raffleImageBucket.bucketName,
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
