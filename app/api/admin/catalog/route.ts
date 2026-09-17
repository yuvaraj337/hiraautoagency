export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, logActivity } from '@/lib/auth';

export async function GET() {
  try {
    const session = getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const bikes = db.prepare('SELECT * FROM bikes ORDER BY order_index ASC').all() as any[];
    const variants = db.prepare('SELECT * FROM bike_variants ORDER BY order_index ASC, ex_showroom_price ASC').all() as any[];

    const result = bikes.map(b => ({
      ...b,
      variants: variants.filter(v => v.bike_id === b.id)
    }));

    return NextResponse.json({ success: true, bikes: result });
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
    const { action } = body;

    if (action === 'UPDATE_VARIANT_PRICE') {
      const { variantId, price, inStock } = body;
      if (!variantId || price === undefined) return NextResponse.json({ success: false, error: 'Variant ID and price required' }, { status: 400 });

      const oldVariant = db.prepare('SELECT * FROM bike_variants WHERE id = ?').get(variantId) as any;
      if (!oldVariant) return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });

      db.prepare(`
        UPDATE bike_variants
        SET ex_showroom_price = ?, in_stock = COALESCE(?, in_stock)
        WHERE id = ?
      `).run(parseInt(price, 10), inStock !== undefined ? (inStock ? 1 : 0) : null, variantId);

      logActivity(session.id, session.name, 'PRICE_UPDATED', 'BIKE_VARIANT', variantId, {
        variantName: oldVariant.name,
        oldPrice: oldVariant.ex_showroom_price,
        newPrice: parseInt(price, 10)
      });

      return NextResponse.json({ success: true, message: 'Price updated successfully. Public website reflects change immediately.' });
    }

    if (action === 'ADD_VARIANT') {
      const { bikeId, name, ex_showroom_price, color_name, color_hex, image_url } = body;
      const id = `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO bike_variants (id, bike_id, name, ex_showroom_price, color_name, color_hex, image_url, in_stock, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 99)
      `).run(id, bikeId, name, parseInt(ex_showroom_price, 10), color_name || 'Standard', color_hex || '#0020B2', image_url || null);

      logActivity(session.id, session.name, 'VARIANT_ADDED', 'BIKE_VARIANT', id, { name, price: ex_showroom_price });
      return NextResponse.json({ success: true, id, message: 'Variant added' });
    }

    if (action === 'UPDATE_BIKE') {
      const { id, name, category, tagline, description, engine_cc, max_power, max_torque, is_featured } = body;
      db.prepare(`
        UPDATE bikes
        SET name = COALESCE(?, name),
            category = COALESCE(?, category),
            tagline = COALESCE(?, tagline),
            description = COALESCE(?, description),
            engine_cc = COALESCE(?, engine_cc),
            max_power = COALESCE(?, max_power),
            max_torque = COALESCE(?, max_torque),
            is_featured = COALESCE(?, is_featured)
        WHERE id = ?
      `).run(name, category, tagline, description, engine_cc, max_power, max_torque, is_featured, id);

      logActivity(session.id, session.name, 'BIKE_UPDATED', 'BIKE', id, { name });
      return NextResponse.json({ success: true, message: 'Bike updated' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
