'use client';

import { useEffect, useContext } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { UserContext } from '@/contexts/user-context';

export default function Avatar() {
  const [currentUser, setCurrentUser] = useContext(UserContext);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  const fetchCurrentUser = async () => {
    const { email, given_name, family_name, picture } = await fetchUserAttributes();
    if (!email || !given_name) {
      console.error('User does not have an email or name');
      signOut();
      return;
    }
    const name = formatName(given_name, family_name);
    setCurrentUser({
      id: user.userId,
      email,
      name,
      photoURL: picture,
    });
  };

  const formatName = (givenName: string, familyName: string | undefined) => {
    if (!familyName) {
      return givenName;
    }
    return `${givenName} ${familyName}`;
  };

  useEffect(() => {
    if (user && !currentUser) {
      fetchCurrentUser();
    }
  }, [user, currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <img src={currentUser.photoURL} className="w-8 h-8 my-auto rounded-full" />
    </>
  );
}
