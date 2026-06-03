'use server'

import { redirect } from 'next/navigation'
import { verifyPassword, setSessionCookie } from '@/src/lib/admin-auth'

export async function loginAction(_prev: string | undefined, formData: FormData): Promise<string | undefined> {
  const password = String(formData.get('password') ?? '')
  if (!verifyPassword(password)) {
    return 'invalid password'
  }
  await setSessionCookie()
  redirect('/admin')
}
