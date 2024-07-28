import { Construct } from 'constructs';
import { Secret, ISecret } from 'aws-cdk-lib/aws-secretsmanager';

export class RaffleHubSecrets extends Construct {
  public readonly googleOAuthConfigSecret: ISecret;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.googleOAuthConfigSecret = this.createGoogleOAuthConfigSecret();
  }

  private createGoogleOAuthConfigSecret(): ISecret {
    return Secret.fromSecretNameV2(this, `google-oauth-config`, 'GoogleClientConfig');
  }
}
