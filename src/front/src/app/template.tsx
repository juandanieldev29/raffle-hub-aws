'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify, ResourcesConfig } from 'aws-amplify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_USER_POOL_DOMAIN_URL!,
          scopes: ['openid', 'profile', 'email', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['https://raffle-hub.net/'],
          redirectSignOut: ['https://raffle-hub.net/'],
          responseType: 'code',
        },
      },
    },
  },
  Storage: {
    S3: {
      bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
      region: process.env.NEXT_PUBLIC_BUCKET_REGION,
    },
  },
};

Amplify.configure(config, { ssr: true });

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator.Provider>
      <ToastContainer />
      {children}
    </Authenticator.Provider>
  );
}
