import { NextResponse } from 'next/server';

const AWS_API = 'http://32.196.225.218:8000';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${AWS_API}/api/graph`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`AWS Server responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: 'Failed to communicate with AWS backend.' }, { status: 500 });
  }
}
