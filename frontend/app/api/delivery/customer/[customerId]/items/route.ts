import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    const response = await fetch(
      `${API}/delivery/customer/${customerId}/items`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order items' },
      { status: 500 }
    );
  }
}
