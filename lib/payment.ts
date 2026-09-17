import crypto from 'crypto';
import { getDb } from './db';

export interface CreateOrderParams {
  bookingId: string;
  customerId: string;
  amount: number;
  paymentType: 'ADVANCE' | 'FULL';
}

export function createPaymentOrder(params: CreateOrderParams) {
  const db = getDb();
  const paymentCode = `PAY-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Check if Razorpay keys are configured
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const orderData = {
    paymentId,
    paymentCode,
    bookingId: params.bookingId,
    customerId: params.customerId,
    amount: params.amount,
    paymentType: params.paymentType,
    currency: 'INR',
    gateway: keyId ? 'RAZORPAY' : 'DIRECT_GATEWAY',
    orderId: `order_${Date.now()}`
  };

  // Record pending payment in DB
  db.prepare(`
    INSERT INTO payments (id, payment_code, booking_id, customer_id, amount, payment_type, gateway, transaction_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `).run(
    paymentId,
    paymentCode,
    params.bookingId,
    params.customerId,
    params.amount,
    params.paymentType,
    orderData.gateway,
    orderData.orderId
  );

  return orderData;
}

export function verifyPaymentSignature(params: {
  paymentId: string;
  orderId: string;
  gatewayTransactionId: string;
  signature?: string;
}): { verified: boolean; message: string } {
  const db = getDb();
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keySecret && params.signature) {
    // Cryptographic HMAC SHA256 verification
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${params.orderId}|${params.gatewayTransactionId}`)
      .digest('hex');

    if (expected !== params.signature) {
      return { verified: false, message: 'Invalid payment signature' };
    }
  }

  // Update payment record in database
  db.prepare(`
    UPDATE payments
    SET status = 'Paid', transaction_id = ?, raw_response_json = ?
    WHERE id = ? OR transaction_id = ?
  `).run(
    params.gatewayTransactionId,
    JSON.stringify({ verifiedAt: new Date().toISOString(), ...params }),
    params.paymentId,
    params.orderId
  );

  // Update the booking status
  const payment = db.prepare('SELECT booking_id, amount, payment_type FROM payments WHERE id = ? OR transaction_id = ?').get(
    params.paymentId,
    params.gatewayTransactionId
  ) as { booking_id: string; amount: number; payment_type: string } | undefined;

  if (payment) {
    const booking = db.prepare('SELECT total_price, advance_amount FROM bike_bookings WHERE id = ?').get(payment.booking_id) as { total_price: number; advance_amount: number } | undefined;
    if (booking) {
      const isFull = payment.payment_type === 'FULL' || payment.amount >= booking.total_price;
      const newPayStatus = isFull ? 'Paid' : 'Partially Paid';
      db.prepare(`
        UPDATE bike_bookings
        SET payment_status = ?, booking_status = 'Confirmed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newPayStatus, payment.booking_id);
    }
  }

  return { verified: true, message: 'Payment verified and booking confirmed server-side.' };
}
