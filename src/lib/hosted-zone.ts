import { DomainName } from 'aws-cdk-lib/aws-apigateway';
import { CnameRecord, HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface RaffleHubHostedZoneProps {
  domain: DomainName;
}

export class RaffleHubHostedZone extends Construct {
  constructor(scope: Construct, id: string, props: RaffleHubHostedZoneProps) {
    super(scope, id);
    this.createCnameRecord(props.domain);
  }

  private createCnameRecord(domain: DomainName): void {
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: 'Z00403901PUHDNUBMBRKE',
      zoneName: 'raffle-hub.net',
    });
    new CnameRecord(this, 'ApiGwCustomDomainCnameRecord', {
      recordName: 'api',
      zone: hostedZone,
      domainName: domain.domainNameAliasDomainName,
    });
  }
}
