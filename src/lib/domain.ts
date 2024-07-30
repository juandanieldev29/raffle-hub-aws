import { DomainName, EndpointType, SecurityPolicy } from 'aws-cdk-lib/aws-apigateway';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

interface RaffleHubDomainProps {
  certificate: ICertificate;
}

export class RaffleHubDomain extends Construct {
  public readonly domain: DomainName;

  constructor(scope: Construct, id: string, props: RaffleHubDomainProps) {
    super(scope, id);
    this.domain = this.createDomain(props.certificate);
  }

  private createDomain(certificate: ICertificate): DomainName {
    const domain = new DomainName(this, 'ApiGwDomain', {
      domainName: 'api.raffle-hub.net',
      certificate,
      securityPolicy: SecurityPolicy.TLS_1_2,
      endpointType: EndpointType.REGIONAL,
    });
    return domain;
  }
}
