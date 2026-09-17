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
    const date = searchParams.get('date');

    let query = `
      SELECT v.*, 
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        b.name as bike_name, vr.name as variant_name
      FROM showroom_visits v
      JOIN customers c ON c.id = v.customer_id
      LEFT JOIN bikes b ON b.id = v.bike_id
      LEFT JOIN bike_variants vr ON vr.id = v.variant_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      query += ' AND v.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND v.visit_date = ?';
      params.push(date);
    }

    query += ' ORDER BY v.visit_date ASC, v.visit_time ASC';

    const visits = db.prepare(query).all(...params);

    // Group visits by date for Calendar view
    const calendarMap: Record<string, any[]> = {};
    (visits as any[]).forEach(v => {
      if (!calendarMap[v.visit_date]) calendarMap[v.visit_date] = [];
      calendarMap[v.visit_date].push(v);
    });

    return NextResponse.json({ success: true, visits, calendar: calendarMap });
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
    const { id, status, visit_date, visit_time, notes } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Visit ID required' }, { status: 400 });

    const visit = db.prepare(`
      SELECT v.*, c.name as customer_name, c.phone as customer_phone, b.name as bike_name, vr.name as variant_name
      FROM showroom_visits v
      JOIN customers c ON c.id = v.customer_id
      LEFT JOIN bikes b ON b.id = v.bike_id
      LEFT JOIN bike_variants vr ON vr.id = v.variant_id
      WHERE v.id = ?
    `).get(id) as any;

    if (!visit) return NextResponse.json({ success: false, error: 'Visit not found' }, { status: 404 });

    // Update fields
    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (visit_date) {
      updates.push('visit_date = ?');
      params.push(visit_date);
    }
    if (visit_time) {
      updates.push('visit_time = ?');
      params.push(visit_time);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE showroom_visits SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    logActivity(session.id, session.name, 'VISIT_STATUS_UPDATED', 'VISIT', id, {
      oldStatus: visit.status,
      newStatus: status || visit.status,
      visitDate: visit_date || visit.visit_date
    });

    // If confirmed or rescheduled, trigger notification
    if (status === 'Confirmed') {
      try {
        await sendWhatsAppMessage({
          customerId: visit.customer_id,
          phone: visit.customer_phone,
          templateName: 'tpl_visit_booked',
          variables: {
            customer_name: visit.customer_name,
            bike: visit.bike_name || 'Yamaha Motorcycle',
            variant: visit.variant_name || 'Standard',
            booking_id: visit.visit_code,
            visit_date: visit_date || visit.visit_date,
            visit_time: visit_time || visit.visit_time
          }
        });
      } catch (e) {
        console.warn('WhatsApp confirm notice failed non-fatally:', e);
      }
    }

    return NextResponse.json({ success: true, message: `Visit ${status || 'updated'} successfully` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
