'use server';

import { cookies } from 'next/headers';

export async function syncCookies(clientCookies: Record<string, string>) {
  const cookieStore = cookies();
  // Set all client cookies on server
  Object.entries(clientCookies).forEach(([name, value]) => {
    cookieStore.set(name, value);
  });
}
