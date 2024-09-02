import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';

export const dynamic = 'force-dynamic';

export default async function MyRaffle() {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    return (
      <>
        <h1>Hola {session.userSub}</h1>
      </>
    );
  } catch (error) {
    console.error(error);
    return <p>Something went wrong...</p>;
  }
}
