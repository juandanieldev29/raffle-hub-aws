import { SecretValue, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { App, GitHubSourceCodeProvider, Platform } from '@aws-cdk/aws-amplify-alpha';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';

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
        AMPLIFY_DIFF_DEPLOY: 'false',
      },
      platform: Platform.WEB_COMPUTE,
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 1,
        applications: [
          {
            frontend: {
              phases: {
                preBuild: {
                  commands: ['npm ci --cache .npm --prefer-offline'],
                },
                build: {
                  commands: ['npm run build'],
                },
              },
              artifacts: {
                baseDirectory: '.next',
                files: ['**/*'],
              },
              cache: {
                paths: ['.next/cache/**/*', '.npm/**/*'],
              },
            },
            appRoot: 'src/front',
          },
        ],
      }),
    });
    const dev = amplifyApp.addBranch('dev', {
      stage: 'DEVELOPMENT',
    });
    amplifyApp.addBranch('main', {
      stage: 'PRODUCTION',
    });
    const domain = amplifyApp.addDomain('raffle-hub.net');
    domain.mapRoot(dev);
    domain.mapSubDomain(dev, 'www');
  }
}
