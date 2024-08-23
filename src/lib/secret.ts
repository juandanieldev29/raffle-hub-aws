import { Construct } from 'constructs';
import { Secret, ISecret } from 'aws-cdk-lib/aws-secretsmanager';

export class RaffleHubSecrets extends Construct {
  public readonly githubTokenSecret: ISecret;
  public readonly stripeKeySecret: ISecret;
  public readonly stripeWebookKeySecret: ISecret;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.githubTokenSecret = this.createGithubTokenSecret();
    this.stripeKeySecret = this.createStripeKeySecret();
    this.stripeWebookKeySecret = this.createStripeWebookKeySecret();
  }

  private createGithubTokenSecret(): ISecret {
    return Secret.fromSecretNameV2(this, 'GithubTokenConfig', 'GithubToken');
  }

  private createStripeKeySecret(): ISecret {
    return Secret.fromSecretNameV2(this, 'StripeKeySecret', 'StripeSecretKey');
  }

  private createStripeWebookKeySecret(): ISecret {
    return Secret.fromSecretNameV2(this, 'StripeWebhookKeySecret', 'StripeWebhookSecretKey');
  }
}
