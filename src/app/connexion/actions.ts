'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { sendWelcomePelerin } from '@/lib/email'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/connexion?error=InvalidCredentials')
  }

  revalidatePath('/', 'layout')
  redirect('/espace/tableau-de-bord')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const whatsapp = formData.get('whatsapp') as string || null;
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        role: 'pilgrim',
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        phone_whatsapp: whatsapp,
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/inscription?error=SignupFailed')
  }

  const firstName = (data.options?.data?.first_name as string) ?? '';
  const lastName  = (data.options?.data?.last_name  as string) ?? '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ') || data.email.split('@')[0];
  sendWelcomePelerin(data.email, fullName).catch(() => {}); // fire-and-forget

  revalidatePath('/', 'layout')
  redirect('/espace/tableau-de-bord')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/connexion')
}
