export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, logActivity } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function GET() {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = getDb();

    const messages = db.prepare(`
      SELECT m.*, c.name as customer_name
      FROM whatsapp_messages m
      LEFT JOIN customers c ON c.id = m.customer_id
      ORDER BY m.sent_at DESC
      LIMIT 100
    `).all();

    const reminders = db.prepare(`
      SELECT r.*, c.name as customer_name, c.phone as customer_phone, c.whatsapp_reminders_enabled,
             v.visit_date, v.visit_time, b.name as bike_name
      FROM whatsapp_reminders r
      JOIN showroom_visits v ON v.id = r.visit_id
      JOIN customers c ON c.id = r.customer_id
      LEFT JOIN bikes b ON b.id = v.bike_id
      ORDER BY r.scheduled_for ASC
    `).all();

    const templates = db.prepare('SELECT * FROM whatsapp_templates ORDER BY name ASC').all();

    return NextResponse.json({ success: true, messages, reminders, templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    const db = getDb();

    if (action === 'SEND_DIRECT') {
      const { phone, customerId, templateName, variables } = body;
      const res = await sendWhatsAppMessage({
        customerId,
        phone,
        templateName: templateName || 'tpl_visit_booked',
        variables: variables || {}
      });

      logActivity(session.id, session.name, 'WHATSAPP_MANUAL_SENT', 'WHATSAPP', res.messageId, {
        phone,
        templateName
      });

      return NextResponse.json(res);
    }

    if (action === 'UPDATE_TEMPLATE') {
      const { id, body: templateBody } = body;
      if (!id || !templateBody) return NextResponse.json({ success: false, error: 'Missing template ID or body' }, { status: 400 });

      db.prepare('UPDATE whatsapp_templates SET body = ? WHERE id = ?').run(templateBody, id);
      logActivity(session.id, session.name, 'WHATSAPP_TEMPLATE_UPDATED', 'TEMPLATE', id);

      return NextResponse.json({ success: true, message: 'Template updated' });
    }

    if (action === 'PROCESS_REMINDERS') {
      // Trigger processing of pending reminders
      const now = new Date().toISOString();
      const dueReminders = db.prepare(`
        SELECT r.*, c.name as customer_name, c.phone as customer_phone, c.whatsapp_reminders_enabled,
               v.visit_date, v.visit_time, b.name as bike_name, vr.name as variant_name, v.visit_code
        FROM whatsapp_reminders r
        JOIN showroom_visits v ON v.id = r.visit_id
        JOIN customers c ON c.id = r.customer_id
        LEFT JOIN bikes b ON b.id = v.bike_id
        LEFT JOIN bike_variants vr ON vr.id = v.variant_id
        WHERE r.status = 'PENDING' AND r.scheduled_for <= ?
      `).all(now) as any[];

      let processed = 0;
      for (const r of dueReminders) {
        if (r.whatsapp_reminders_enabled === 0) {
          db.prepare("UPDATE whatsapp_reminders SET status = 'SKIPPED' WHERE id = ?").run(r.id);
          continue;
        }

        const templateName = r.reminder_type === '24_HOURS' ? 'tpl_reminder_24h' : 'tpl_reminder_2h';
        await sendWhatsAppMessage({
          customerId: r.customer_id,
          phone: r.customer_phone,
          templateName,
          variables: {
            customer_name: r.customer_name,
            bike: r.bike_name || 'Yamaha Motorcycle',
            variant: r.variant_name || 'Standard',
            booking_id: r.visit_code,
            visit_date: r.visit_date,
            visit_time: r.visit_time
          }
        });

        db.prepare("UPDATE whatsapp_reminders SET status = 'SENT', sent_at = CURRENT_TIMESTAMP WHERE id = ?").run(r.id);
        processed++;
      }

      return NextResponse.json({ success: true, processed, totalFound: dueReminders.length });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
