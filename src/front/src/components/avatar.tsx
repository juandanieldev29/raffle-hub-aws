'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';

export default function Avatar() {
  const { user, route } = useAuthenticator((context) => [context.user, context.route]);

  return (
    <>
      <h1>{user ? user.username : 'User not logged in'}</h1>
      <p>Current route {route}</p>
    </>
  );
}
