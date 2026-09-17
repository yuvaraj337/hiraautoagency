export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, logActivity } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = `
      SELECT bb.*,
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        b.name as bike_name, b.category as bike_category, b.image_url as bike_image,
        vr.name as variant_name, vr.color_name as variant_color
      FROM bike_bookings bb
      JOIN customers c ON c.id = bb.customer_id
      JOIN bikes b ON b.id = bb.bike_id
      JOIN bike_variants vr ON vr.id = bb.variant_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      query += ' AND bb.booking_status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (bb.booking_code LIKE ? OR c.name LIKE ? OR c.phone LIKE ? OR b.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY bb.created_at DESC';

    const bookings = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const body = await request.json();
    const { id, booking_status, payment_status, record_payment_amount, payment_gateway, notes, send_whatsapp } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });

    const booking = db.prepare(`
      SELECT bb.*, c.name as customer_name, c.phone as customer_phone, b.name as bike_name, vr.name as variant_name
      FROM bike_bookings bb
      JOIN customers c ON c.id = bb.customer_id
      JOIN bikes b ON b.id = bb.bike_id
      JOIN bike_variants vr ON vr.id = bb.variant_id
      WHERE bb.id = ?
    `).get(id) as any;

    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });

    // Handle recording offline/manual payment
    if (record_payment_amount && record_payment_amount > 0) {
      const amount = parseInt(record_payment_amount, 10);
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const paymentCode = `PAY-${Date.now().toString().slice(-6)}`;
      const gateway = payment_gateway || 'CASH';

      db.prepare(`
        INSERT INTO payments (id, payment_code, booking_id, customer_id, amount, payment_type, gateway, transaction_id, status)
        VALUES (?, ?, ?, ?, ?, 'PARTIAL', ?, ?, 'Paid')
      `).run(paymentId, paymentCode, booking.id, booking.customer_id, amount, gateway, `OFFLINE_${Date.now()}`);

      const newAdvance = booking.advance_amount + amount;
      const newBalance = Math.max(0, booking.total_price - newAdvance);
      const newPayStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';

      db.prepare(`
        UPDATE bike_bookings
        SET advance_amount = ?, balance_amount = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newAdvance, newBalance, newPayStatus, id);

      logActivity(session.id, session.name, 'PAYMENT_RECORDED', 'BOOKING', id, {
        amount,
        gateway,
        remainingBalance: newBalance
      });
    }

    // Status updates
    if (booking_status) {
      db.prepare(`
        UPDATE bike_bookings
        SET booking_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(booking_status, id);

      logActivity(session.id, session.name, 'BOOKING_STATUS_CHANGED', 'BOOKING', id, {
        oldStatus: booking.booking_status,
        newStatus: booking_status
      });
    }

    if (payment_status) {
      db.prepare(`
        UPDATE bike_bookings
        SET payment_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(payment_status, id);
    }

    if (notes !== undefined) {
      db.prepare(`
        UPDATE bike_bookings
        SET notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(notes, id);
    }

    // Optional WhatsApp dispatch
    if (send_whatsapp) {
      try {
        await sendWhatsAppMessage({
          customerId: booking.customer_id,
          phone: booking.customer_phone,
          templateName: 'tpl_booking_advance',
          variables: {
            customer_name: booking.customer_name,
            bike: booking.bike_name,
            variant: booking.variant_name,
            booking_id: booking.booking_code,
            amount: booking.advance_amount.toLocaleString('en-IN'),
            balance: booking.balance_amount.toLocaleString('en-IN')
          }
        });
      } catch (waErr) {
        console.warn('Manual WhatsApp trigger error:', waErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Booking updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
