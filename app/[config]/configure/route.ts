import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { config: string } }
) {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  return NextResponse.redirect(`${baseUrl}/?restore=${params.config}`);
}
