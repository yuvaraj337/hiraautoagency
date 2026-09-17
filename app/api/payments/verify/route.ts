export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/payment';
import { logActivity } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, orderId, gatewayTransactionId, signature } = body;

    if (!paymentId || !gatewayTransactionId) {
      return NextResponse.json({ success: false, error: 'Missing required payment verification parameters' }, { status: 400 });
    }

    const result = verifyPaymentSignature({
      paymentId,
      orderId: orderId || `ord_${Date.now()}`,
      gatewayTransactionId,
      signature
    });

    if (!result.verified) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    logActivity('payment_gateway', 'SYSTEM', 'PAYMENT_VERIFIED', 'PAYMENT', paymentId, {
      gatewayTransactionId,
      verified: true
    });

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error('Error in payment verification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
