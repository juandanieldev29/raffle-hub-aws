'use client';

import { useEffect, useContext } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { UserContext } from '@/contexts/user-context';
import { LoadingContext } from '@/contexts/loading-context';

import { LoadingAction } from '@/enums/loading-action';

export default function Avatar() {
  const [currentUser, setCurrentUser] = useContext(UserContext);
  const { state, dispatch } = useContext(LoadingContext);
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  const fetchCurrentUser = async () => {
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
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
    } catch (err) {
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
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

  useEffect(() => {
    console.log(state);
  }, [state]);

  useEffect(() => {
    console.log(authStatus);
    if (authStatus === 'configuring') {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
    } else {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  }, [authStatus]);

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <img src={currentUser.photoURL} className="w-8 h-8 my-auto rounded-full" />
    </>
  );
}
