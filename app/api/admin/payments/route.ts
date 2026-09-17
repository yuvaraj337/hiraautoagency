export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT p.*,
        c.name as customer_name, c.phone as customer_phone,
        bb.booking_code,
        b.name as bike_name,
        vr.name as variant_name
      FROM payments p
      JOIN customers c ON c.id = p.customer_id
      LEFT JOIN bike_bookings bb ON bb.id = p.booking_id
      LEFT JOIN bikes b ON b.id = bb.bike_id
      LEFT JOIN bike_variants vr ON vr.id = bb.variant_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.created_at DESC';

    const payments = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
