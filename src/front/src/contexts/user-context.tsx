'use client';

import { useState, createContext, Dispatch, SetStateAction, ReactNode } from 'react';

import { CurrentUser } from '@/types/current-user';

export const UserContext = createContext<
  [CurrentUser | null, Dispatch<SetStateAction<CurrentUser | null>>]
>(null!);

export default function UserContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  return (
    <UserContext.Provider value={[currentUser, setCurrentUser]}>{children}</UserContext.Provider>
  );
}
