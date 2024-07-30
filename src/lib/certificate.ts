import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class RaffleHubCertificate extends Construct {
  public readonly certificate: ICertificate;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.certificate = this.createCertificate();
  }

  private createCertificate(): ICertificate {
    const certificateArn =
      'arn:aws:acm:us-west-2:008971652026:certificate/ff682f3b-c1fd-40d0-9af0-57f27f2108e7';
    const domainCert = Certificate.fromCertificateArn(this, 'DomainCertificate', certificateArn);
    return domainCert;
  }
}
