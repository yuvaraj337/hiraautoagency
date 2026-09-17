export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, logActivity } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const customerId = searchParams.get('id');

    // Return single customer profile with 360 timeline
    if (customerId) {
      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId) as any;
      if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });

      const visits = db.prepare(`
        SELECT v.*, b.name as bike_name, vr.name as variant_name
        FROM showroom_visits v
        LEFT JOIN bikes b ON b.id = v.bike_id
        LEFT JOIN bike_variants vr ON vr.id = v.variant_id
        WHERE v.customer_id = ?
        ORDER BY v.created_at DESC
      `).all(customerId);

      const bookings = db.prepare(`
        SELECT bb.*, b.name as bike_name, vr.name as variant_name
        FROM bike_bookings bb
        LEFT JOIN bikes b ON b.id = bb.bike_id
        LEFT JOIN bike_variants vr ON vr.id = bb.variant_id
        WHERE bb.customer_id = ?
        ORDER BY bb.created_at DESC
      `).all(customerId);

      const payments = db.prepare(`
        SELECT p.*, bb.booking_code
        FROM payments p
        LEFT JOIN bike_bookings bb ON bb.id = p.booking_id
        WHERE p.customer_id = ?
        ORDER BY p.created_at DESC
      `).all(customerId);

      const whatsappMessages = db.prepare(`
        SELECT * FROM whatsapp_messages WHERE customer_id = ? OR phone = ?
        ORDER BY sent_at DESC
      `).all(customerId, customer.phone);

      const reminders = db.prepare(`
        SELECT * FROM whatsapp_reminders WHERE customer_id = ?
        ORDER BY scheduled_for DESC
      `).all(customerId);

      // Build consolidated chronological timeline
      const timeline: any[] = [];

      timeline.push({
        type: 'CUSTOMER_CREATED',
        title: 'Customer Profile Created',
        description: `Customer ${customer.name} registered via platform.`,
        timestamp: customer.created_at
      });

      visits.forEach((v: any) => {
        timeline.push({
          type: 'VISIT_BOOKED',
          title: `Showroom Visit Booked (${v.visit_code})`,
          description: `Appointment scheduled for ${v.visit_date} at ${v.visit_time} for ${v.bike_name || 'Yamaha'} (${v.variant_name || 'Standard'}). Status: ${v.status}`,
          timestamp: v.created_at
        });
      });

      bookings.forEach((b: any) => {
        timeline.push({
          type: 'BOOKING_CREATED',
          title: `Bike Booking Created (${b.booking_code})`,
          description: `${b.bike_name} (${b.variant_name}) - Total: ₹${b.total_price.toLocaleString('en-IN')}, Advance: ₹${b.advance_amount.toLocaleString('en-IN')}, Status: ${b.booking_status}`,
          timestamp: b.created_at
        });
      });

      payments.forEach((p: any) => {
        timeline.push({
          type: 'PAYMENT_RECEIVED',
          title: `Payment Received (${p.payment_code})`,
          description: `₹${p.amount.toLocaleString('en-IN')} via ${p.gateway} (Trx: ${p.transaction_id || 'N/A'}). Status: ${p.status}`,
          timestamp: p.created_at
        });
      });

      whatsappMessages.forEach((w: any) => {
        timeline.push({
          type: 'WHATSAPP_SENT',
          title: `WhatsApp Dispatched (${w.template_name})`,
          description: w.message_body,
          timestamp: w.sent_at
        });
      });

      // Sort timeline descending
      timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return NextResponse.json({
        success: true,
        customer,
        visits,
        bookings,
        payments,
        whatsappMessages,
        reminders,
        timeline
      });
    }

    // List all customers
    let query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM bike_bookings WHERE customer_id = c.id) as booking_count,
        (SELECT COUNT(*) FROM showroom_visits WHERE customer_id = c.id) as visit_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE customer_id = c.id AND status = 'Paid') as total_spent,
        (SELECT created_at FROM activity_logs WHERE entity_id = c.id ORDER BY created_at DESC LIMIT 1) as last_activity
      FROM customers c
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY c.created_at DESC';

    const customers = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error('Customer API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const body = await request.json();
    const { id, whatsapp_reminders_enabled, status, notes } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Customer ID required' }, { status: 400 });

    if (whatsapp_reminders_enabled !== undefined) {
      db.prepare(`
        UPDATE customers
        SET whatsapp_reminders_enabled = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(whatsapp_reminders_enabled ? 1 : 0, id);

      logActivity(session.id, session.name, 'CUSTOMER_REMINDER_TOGGLED', 'CUSTOMER', id, {
        remindersEnabled: !!whatsapp_reminders_enabled
      });
    }

    if (status) {
      db.prepare(`
        UPDATE customers
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, id);
    }

    if (notes !== undefined) {
      db.prepare(`
        UPDATE customers
        SET notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(notes, id);
    }

    return NextResponse.json({ success: true, message: 'Customer updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
