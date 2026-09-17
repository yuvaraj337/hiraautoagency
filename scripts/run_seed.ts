import { seedDatabase } from '../lib/db/seed';
import { getDb } from '../lib/db';

console.log('Initializing database schema and seeding...');
seedDatabase();

const db = getDb();
const bikes = db.prepare('SELECT count(*) as count FROM bikes').get() as { count: number };
const variants = db.prepare('SELECT count(*) as count FROM bike_variants').get() as { count: number };
const list = db.prepare(`
  SELECT b.name as bike_name, v.name as variant_name, v.ex_showroom_price
  FROM bike_variants v
  JOIN bikes b ON b.id = v.bike_id
  ORDER BY v.ex_showroom_price DESC
`).all();

console.log(`Bikes count: ${bikes.count}`);
console.log(`Variants count: ${variants.count}`);
console.log('Sample catalog items:');
for (const item of (list as any[]).slice(0, 8)) {
  console.log(`  - ${item.variant_name}: ₹${item.ex_showroom_price.toLocaleString('en-IN')}`);
}
