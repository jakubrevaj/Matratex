import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    const response = await fetch(`${API}/delivery/list`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch deliveries');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}
