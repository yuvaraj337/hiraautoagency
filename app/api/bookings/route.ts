export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createPaymentOrder } from '@/lib/payment';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { logActivity } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name;
    const phone = body.phone;
    const email = body.email;
    const bikeId = body.bikeId || body.bike_id;
    const variantId = body.variantId || body.variant_id;
    const paymentType = body.paymentType || body.payment_type || 'ADVANCE';
    const preferredDate = body.preferredDate || body.preferred_date;
    const preferredTime = body.preferredTime || body.preferred_time;
    const notes = body.notes;

    if (!name || !phone || !bikeId || !variantId) {
      return NextResponse.json({ success: false, error: 'Name, phone, bike and variant are required.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Please provide a valid 10-digit mobile number.' }, { status: 400 });
    }

    const db = getDb();

    // 1. Fetch variant and bike directly from DB (NEVER trust frontend price)
    const variant = db.prepare(`
      SELECT v.*, b.name as bike_name
      FROM bike_variants v
      JOIN bikes b ON b.id = v.bike_id
      WHERE v.id = ? AND v.bike_id = ?
    `).get(variantId, bikeId) as {
      id: string;
      bike_id: string;
      name: string;
      bike_name: string;
      ex_showroom_price: number;
    } | undefined;

    if (!variant) {
      return NextResponse.json({ success: false, error: 'Selected motorcycle variant was not found.' }, { status: 404 });
    }

    const totalPrice = variant.ex_showroom_price;

    // 2. Fetch configurable advance booking amount from settings
    const settings = db.prepare('SELECT key, value FROM settings WHERE key IN (?, ?, ?)').all(
      'advance_booking_type',
      'advance_booking_fixed_amount',
      'advance_booking_percentage'
    ) as { key: string; value: string }[];

    const configMap: Record<string, string> = {};
    settings.forEach(s => { configMap[s.key] = s.value; });

    const advanceType = configMap['advance_booking_type'] || 'FIXED';
    let advanceAmount = 5000;
    if (advanceType === 'PERCENTAGE') {
      const pct = parseFloat(configMap['advance_booking_percentage'] || '10');
      advanceAmount = Math.round((totalPrice * pct) / 100);
    } else {
      advanceAmount = parseInt(configMap['advance_booking_fixed_amount'] || '5000', 10);
    }

    const actualPaymentType = paymentType === 'FULL' ? 'FULL' : 'ADVANCE';
    const amountToPay = actualPaymentType === 'FULL' ? totalPrice : advanceAmount;
    const balanceAmount = totalPrice - amountToPay;

    // 3. Find or create customer
    let customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(cleanPhone) as { id: string } | undefined;
    let customerId = customer?.id;

    if (!customerId) {
      customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO customers (id, name, phone, email, status, notes)
        VALUES (?, ?, ?, ?, 'Booked', ?)
      `).run(customerId, name.trim(), cleanPhone, email?.trim() || null, `Booked ${variant.bike_name} (${variant.name})`);
    } else {
      db.prepare(`
        UPDATE customers 
        SET name = ?, email = COALESCE(?, email), status = 'Booked', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name.trim(), email?.trim() || null, customerId);
    }

    // 4. Generate unique Booking ID
    const bookingCode = `YAM-BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 5. Insert Booking record
    db.prepare(`
      INSERT INTO bike_bookings (
        id, booking_code, customer_id, bike_id, variant_id, total_price,
        payment_type, advance_amount, balance_amount, booking_status, payment_status,
        preferred_date, preferred_time, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 'Pending', ?, ?, ?)
    `).run(
      bookingId,
      bookingCode,
      customerId,
      bikeId,
      variantId,
      totalPrice,
      actualPaymentType,
      amountToPay,
      balanceAmount,
      preferredDate || null,
      preferredTime || null,
      notes?.trim() || null
    );

    // 6. Create payment order
    const paymentOrder = createPaymentOrder({
      bookingId,
      customerId,
      amount: amountToPay,
      paymentType: actualPaymentType
    });

    // 7. Dispatch WhatsApp Booking notification
    try {
      await sendWhatsAppMessage({
        customerId,
        phone: cleanPhone,
        templateName: 'tpl_booking_advance',
        variables: {
          customer_name: name,
          bike: variant.bike_name,
          variant: variant.name,
          booking_id: bookingCode,
          amount: amountToPay.toLocaleString('en-IN'),
          balance: balanceAmount.toLocaleString('en-IN')
        }
      });
    } catch (waErr) {
      console.warn('WhatsApp booking notice failed non-fatally:', waErr);
    }

    // 8. Log activity
    logActivity('public_customer', name, 'BOOKING_CREATED', 'BOOKING', bookingId, {
      bookingCode,
      bike: variant.bike_name,
      variant: variant.name,
      amount: amountToPay
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        bookingCode,
        bikeName: variant.bike_name,
        variantName: variant.name,
        totalPrice,
        amountToPay,
        balanceAmount,
        paymentType: actualPaymentType
      },
      paymentOrder
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
