export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, logActivity } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const offers = db.prepare(`
      SELECT o.*, b.name as bike_name
      FROM offers o
      LEFT JOIN bikes b ON b.id = o.bike_id
      ORDER BY o.created_at DESC
    `).all();
    return NextResponse.json({ success: true, offers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const body = await request.json();
    const { title, description, bike_id, discount_text, start_date, end_date, cta_text, is_active } = body;

    const id = `off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO offers (id, title, description, bike_id, discount_text, start_date, end_date, cta_text, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description || '', bike_id || null, discount_text || '', start_date || null, end_date || null, cta_text || 'Claim Offer', is_active ? 1 : 0);

    logActivity(session.id, session.name, 'OFFER_CREATED', 'OFFER', id, { title });
    return NextResponse.json({ success: true, id, message: 'Offer created' });
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
    const { id, is_active } = body;

    db.prepare('UPDATE offers SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, id);
    logActivity(session.id, session.name, 'OFFER_TOGGLED', 'OFFER', id, { is_active });

    return NextResponse.json({ success: true, message: 'Offer updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
