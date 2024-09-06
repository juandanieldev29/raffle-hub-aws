import { RemovalPolicy } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class RaffleHubStorage extends Construct {
  public readonly raffleImageBucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.raffleImageBucket = this.createRaffleStorage();
  }

  private createRaffleStorage(): Bucket {
    const bucket = new Bucket(this, 'RaffleStorage', {
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT],
          allowedOrigins: ['https://raffle-hub.net'],
          allowedHeaders: ['*'],
        },
      ],
    });
    return bucket;
  }
}
