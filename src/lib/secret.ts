import { Construct } from 'constructs';
import { Secret, ISecret } from 'aws-cdk-lib/aws-secretsmanager';

export class RaffleHubSecrets extends Construct {
  public readonly googleOAuthConfigSecret: ISecret;
  public readonly githubTokenSecret: ISecret;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.googleOAuthConfigSecret = this.createGoogleOAuthConfigSecret();
    this.githubTokenSecret = this.createGithubTokenSecret();
  }

  private createGoogleOAuthConfigSecret(): ISecret {
    return Secret.fromSecretNameV2(this, 'GoogleOauthConfig', 'GoogleClientConfig');
  }

  private createGithubTokenSecret(): ISecret {
    return Secret.fromSecretNameV2(this, 'GithubTokenConfig', 'GithubToken');
  }
}
