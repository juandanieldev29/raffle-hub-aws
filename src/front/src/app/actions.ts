'use server';

import { redirect } from 'next/navigation';

export async function navigateToRaffleDetail(id: string) {
  redirect(`/raffle/${id}`);
}

export async function navigateToHome() {
  redirect('/');
}
