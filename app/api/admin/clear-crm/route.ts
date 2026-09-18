export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, logActivity } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'Super Admin' && session.role !== 'Admin') {
      return NextResponse.json({ success: false, error: 'Only Super Admins can clear CRM data' }, { status: 403 });
    }

    const db = getDb();

    // Perform safe cascade clear in a single transaction
    db.transaction(() => {
      db.prepare('DELETE FROM payments').run();
      db.prepare('DELETE FROM bike_bookings').run();
      db.prepare('DELETE FROM whatsapp_reminders').run();
      db.prepare('DELETE FROM whatsapp_messages').run();
      db.prepare('DELETE FROM showroom_visits').run();
      db.prepare('DELETE FROM customers').run();
      db.prepare('DELETE FROM activity_logs WHERE entity_type != "DATABASE"').run();
    })();

    logActivity(
      session.id,
      session.name,
      'CLEAR_CRM_DATA',
      'SYSTEM',
      'ALL',
      { cleared_by: session.name, timestamp: new Date().toISOString() }
    );

    return NextResponse.json({
      success: true,
      message: 'All CRM customer records, bookings, visits, and payments cleared successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
