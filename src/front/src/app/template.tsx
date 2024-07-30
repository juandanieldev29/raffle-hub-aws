'use client';

import '@aws-amplify/ui-react/styles.css';
import { Amplify, ResourcesConfig } from 'aws-amplify';

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_tGFAnJPxy',
      userPoolClientId: 'fam3rusigd8te742bqrunv28g',
      identityPoolId: 'us-west-2:5e9f3d98-110e-4613-b3e9-11df304c1366',
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
