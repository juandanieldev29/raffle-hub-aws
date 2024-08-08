import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { App, GitHubSourceCodeProvider, Platform } from '@aws-cdk/aws-amplify-alpha';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';

interface HostingStackProps {
  readonly githubTokenSecret: ISecret;
  readonly userPoolId: string;
  readonly userPoolClientId: string;
  readonly identityPoolId: string;
  readonly userPoolDomainUrl: string;
}

export class RaffleHubAmplifyHostingStack extends Stack {
  constructor(scope: Construct, id: string, props: HostingStackProps) {
    super(scope, id);
    this.buildAppStack(
      props.githubTokenSecret,
      props.userPoolId,
      props.userPoolClientId,
      props.identityPoolId,
      props.userPoolDomainUrl,
    );
  }

  private buildAppStack(
    githubTokenSecret: ISecret,
    userPoolId: string,
    userPoolClientId: string,
    identityPoolId: string,
    userPoolDomainUrl: string,
  ) {
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
        NEXT_PUBLIC_USER_POOL_ID: userPoolId,
        NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClientId,
        NEXT_PUBLIC_IDENTITY_POOL_ID: identityPoolId,
        NEXT_PUBLIC_USER_POOL_DOMAIN_URL: userPoolDomainUrl,
        NEXT_PUBLIC_STRIPE_PUBLIC_KEY:
          'pk_test_51PLuDe2N0fiS7hVtr7iDwK8NTJryJUHorhdbEVzwspr4dLhD6xE5USymlcEvpfRFIPDttg37txO2S32ZT8cuODvu00Z46vMLQS',
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
