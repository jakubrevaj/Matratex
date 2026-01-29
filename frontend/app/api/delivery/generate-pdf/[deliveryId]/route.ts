import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const { deliveryId } = await params;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    const response = await fetch(`${API}/delivery/generate-pdf/${deliveryId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="delivery-${deliveryId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
