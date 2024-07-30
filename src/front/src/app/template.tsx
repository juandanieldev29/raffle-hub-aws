'use client';

import '@aws-amplify/ui-react/styles.css';
import { Amplify, ResourcesConfig } from 'aws-amplify';

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_V4TbSN7YN',
      userPoolClientId: '7gr6lvbo1gk4393l49tqjtu0ud',
      identityPoolId: 'us-west-2:f8083d71-091a-44fa-860c-32e27bda0c3b',
      loginWith: {
        oauth: {
          domain: 'raffle-hub.auth.us-west-2.amazoncognito.com',
          scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['https://www.raffle-hub.net', 'http://localhost:3000/'],
          redirectSignOut: ['https://www.raffle-hub.net', 'http://localhost:3000/'],
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
