// API route to trigger a Pusher event
import Pusher from 'pusher';
import { NextRequest, NextResponse } from 'next/server';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const { message, channel, event } = await req.json();

  await pusher.trigger(channel as string, event as string, {
    message,
  });

  return NextResponse.json({ message: 'Message sent!' });
}
