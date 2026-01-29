import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    console.log('[API Route] Fetching from:', `${API}/delivery/customers-with-items`);
    
    const response = await fetch(`${API}/delivery/customers-with-items`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[API Route] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    console.log('[API Route] Data received:', data.length, 'customers');
    console.log('[API Route] Customers:', data.map((c: any) => ({ id: c.id, podnik: c.podnik })));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
