import {
  IdentityPool,
  UserPoolAuthenticationProvider,
} from '@aws-cdk/aws-cognito-identitypool-alpha';
import {
  AccountRecovery,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolDomain,
  UserPoolIdentityProviderGoogle,
  VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class RaffleHubCognito extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly identityPool: IdentityPool;
  public readonly userPoolDomain: UserPoolDomain;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    const { userPool, userPoolClient, identityPool, userPoolDomain } = this.createCognitoAuth();
    this.userPool = userPool;
    this.userPoolClient = userPoolClient;
    this.identityPool = identityPool;
    this.userPoolDomain = userPoolDomain;
  }

  private createCognitoAuth() {
    const userPool = new UserPool(this, 'CognitoAuth', {
      userPoolName: 'RaffleHubUserPool',
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolDomain = new UserPoolDomain(this, 'RaffleHubUserPoolDomain', {
      userPool: userPool,
      cognitoDomain: {
        domainPrefix: 'raffle-hub',
      },
    });

    const googleSecretValue = Secret.fromSecretNameV2(
      this,
      'GoogleOauthConfig',
      'GoogleClientConfig',
    );
    const googleProvider = new UserPoolIdentityProviderGoogle(this, 'RaffleHubGoogleProvider', {
      clientId: '822068828971-84m1l68k8h0bhn3edkom8udrqka2dm80.apps.googleusercontent.com',
      clientSecretValue: googleSecretValue.secretValue,
      scopes: ['openid', 'profile', 'email'],
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
        familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
        profilePicture: ProviderAttribute.GOOGLE_PICTURE,
      },
      userPool,
    });
    userPool.registerIdentityProvider(googleProvider);
    const userPoolClient = new UserPoolClient(this, 'CognitoAuthClient', {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        callbackUrls: ['https://www.raffle-hub.net/'],
        logoutUrls: ['https://www.raffle-hub.net/logout'],
      },
    });
    const identityPool = new IdentityPool(this, 'CognitoAuthPool', {
      identityPoolName: 'RaffleHubUserIdentityPool',
      allowUnauthenticatedIdentities: true,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool: userPool,
            userPoolClient: userPoolClient,
          }),
        ],
      },
    });
    return { userPool, userPoolClient, identityPool, userPoolDomain };
  }
}
