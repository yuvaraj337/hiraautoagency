export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let bikeQuery = `
      SELECT b.*, 
        (SELECT MIN(ex_showroom_price) FROM bike_variants WHERE bike_id = b.id) as starting_price,
        (SELECT COUNT(*) FROM bike_variants WHERE bike_id = b.id) as variant_count
      FROM bikes b
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category && category !== 'ALL') {
      bikeQuery += ' AND b.category = ?';
      params.push(category);
    }

    if (search) {
      bikeQuery += ' AND (b.name LIKE ? OR b.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    bikeQuery += ' ORDER BY b.order_index ASC, b.name ASC';

    const bikes = db.prepare(bikeQuery).all(...params) as any[];

    // Attach variants for each bike
    const getVariants = db.prepare(`
      SELECT * FROM bike_variants 
      WHERE bike_id = ? 
      ORDER BY order_index ASC, ex_showroom_price ASC
    `);

    const result = bikes.map(bike => {
      const variants = getVariants.all(bike.id);
      return {
        ...bike,
        variants
      };
    });

    return NextResponse.json({ success: true, bikes: result });
  } catch (error: any) {
    console.error('Error fetching bikes:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
