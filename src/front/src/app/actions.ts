'use server';

import { redirect } from 'next/navigation';

export async function navigateToRaffleDetail(id: string, ownerId: string) {
  redirect(`/raffle/${id}?ownerId=${ownerId}`);
}

export async function navigateToHome() {
  redirect('/');
}

export async function navigateTo(path: string) {
  redirect(path);
}
