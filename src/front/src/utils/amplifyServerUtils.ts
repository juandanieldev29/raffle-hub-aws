import { createServerRunner } from '@aws-amplify/adapter-nextjs';

export const { runWithAmplifyServerContext } = createServerRunner({
  config: {
    Auth: {
      Cognito: {
        userPoolId: process.env.USER_POOL_ID!,
        userPoolClientId: process.env.USER_POOL_CLIENT_ID!,
        identityPoolId: process.env.IDENTITY_POOL_ID!,
        loginWith: {
          oauth: {
            domain: process.env.USER_POOL_DOMAIN_URL!,
            scopes: ['openid', 'profile', 'email', 'aws.cognito.signin.user.admin'],
            redirectSignIn: ['https://raffle-hub.net/'],
            redirectSignOut: ['https://raffle-hub.net/'],
            responseType: 'code',
          },
        },
      },
    },
  },
});
