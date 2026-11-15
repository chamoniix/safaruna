import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VipConfirmation from './VipConfirmation'

export default async function VipConfirmationPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
  if (!ref || !/^VIP-[A-F0-9]{32}$/.test(ref)) redirect('/reservation-vip')
  return <><Navbar /><VipConfirmation refNumber={ref} /><Footer /></>
}
