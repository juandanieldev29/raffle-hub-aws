'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useEffect } from 'react';

export default function Avatar() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

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
      <h1 className="text-slate-50 dark:text-slate-400">
        {user ? user.username : 'User not logged in'}
      </h1>
      <button className="text-slate-50 dark:text-slate-400" onClick={signOut}>
        Sign Out
      </button>
    </>
  );
}
