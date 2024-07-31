'use client';

import '@aws-amplify/ui-react/styles.css';
import { Amplify, ResourcesConfig } from 'aws-amplify';

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_USER_POOL_DOMAIN_URL!,
          scopes: ['openid', 'profile', 'email'],
          redirectSignIn: ['https://www.raffle-hub.net/'],
          redirectSignOut: ['https://www.raffle-hub.net/'],
          responseType: 'code',
        },
      },
    },
  },
};

Amplify.configure(config);

export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
