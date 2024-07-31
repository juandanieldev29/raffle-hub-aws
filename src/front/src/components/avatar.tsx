'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useEffect } from 'react';

export default function Avatar() {
  const { user } = useAuthenticator((context) => [context.user]);

  const fetchCurrentUser = async () => {
    const user = await fetchUserAttributes();
    console.log(user);
  };

  useEffect(() => {
    if (user) {
      fetchCurrentUser();
    }
  }, [user]);

  return (
    <>
      <h1>{user ? user.username : 'User not logged in'}</h1>
    </>
  );
}
