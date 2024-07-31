'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';

export default function Avatar() {
  const { user } = useAuthenticator((context) => [context.user]);

  return <h1>{user ? user.username : ''}</h1>;
}
