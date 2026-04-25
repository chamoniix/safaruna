import { redirect } from 'next/navigation';

export default function GuideMessageThread({ params }: { params: { id: string } }) {
  redirect(`/guide/messages`);
}
