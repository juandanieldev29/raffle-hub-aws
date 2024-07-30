import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { App, GitHubSourceCodeProvider } from '@aws-cdk/aws-amplify-alpha';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';

interface HostingStackProps {
  readonly githubTokenSecret: ISecret;
}

export class RaffleHubAmplifyHostingStack extends Stack {
  constructor(scope: Construct, id: string, props: HostingStackProps) {
    super(scope, id);
    this.buildAppStack(props.githubTokenSecret);
  }

  private buildAppStack(githubTokenSecret: ISecret) {
    const amplifyApp = new App(this, 'AmplifyApp', {
      appName: 'raffle-hub',
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: 'juandanieldev29',
        repository: 'raffle-hub-aws',
        oauthToken: githubTokenSecret.secretValue,
      }),
      autoBranchDeletion: true,
      environmentVariables: {
        AMPLIFY_MONOREPO_APP_ROOT: 'src/front',
      },
    });
    amplifyApp.addBranch('main', {
      stage: 'PRODUCTION',
    });
    amplifyApp.addBranch('dev', {
      stage: 'DEVELOPMENT',
    });
  }
}