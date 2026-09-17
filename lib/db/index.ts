import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { seedDatabase } from './seed';

let dbInstance: Database.Database | null = null;

function resolveDbPath(): string {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'hira_yamaha.db');
    const bundledDbPath = path.join(process.cwd(), 'data', 'hira_yamaha.db');

    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(bundledDbPath)) {
        try {
          fs.copyFileSync(bundledDbPath, tmpDbPath);
          console.log('[DB] Copied bundled database to /tmp/hira_yamaha.db');
        } catch (err) {
          console.warn('[DB] Failed copying bundled database, will initialize fresh in /tmp:', err);
        }
      }
    }
    return tmpDbPath;
  }

  // Local development: ensure data directory exists
  const localDataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(localDataDir)) {
    fs.mkdirSync(localDataDir, { recursive: true });
  }
  return path.join(localDataDir, 'hira_yamaha.db');
}

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = resolveDbPath();
    dbInstance = new Database(dbPath);

    try {
      dbInstance.pragma('journal_mode = WAL');
    } catch {
      dbInstance.pragma('journal_mode = DELETE');
    }
    dbInstance.pragma('foreign_keys = ON');

    initTables(dbInstance);

    // Ensure database contains essential seed data (especially on Vercel cold starts)
    try {
      const adminRow = (dbInstance.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number })?.count || 0;
      if (adminRow === 0) {
        console.log('[DB] Initializing seed data in database...');
        seedDatabase(dbInstance);
      }
    } catch (e) {
      console.warn('[DB] Auto-seed check notice:', e);
    }
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Admin',
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      whatsapp_reminders_enabled INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bikes (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      engine_cc TEXT,
      max_power TEXT,
      max_torque TEXT,
      fuel_capacity TEXT,
      mileage TEXT,
      curb_weight TEXT,
      image_url TEXT NOT NULL,
      is_featured INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bike_variants (
      id TEXT PRIMARY KEY,
      bike_id TEXT NOT NULL,
      name TEXT NOT NULL,
      ex_showroom_price INTEGER NOT NULL,
      color_name TEXT,
      color_hex TEXT,
      image_url TEXT,
      in_stock INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS showroom_visits (
      id TEXT PRIMARY KEY,
      visit_code TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      bike_id TEXT,
      variant_id TEXT,
      visit_date TEXT NOT NULL,
      visit_time TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (bike_id) REFERENCES bikes(id),
      FOREIGN KEY (variant_id) REFERENCES bike_variants(id)
    );

    CREATE TABLE IF NOT EXISTS bike_bookings (
      id TEXT PRIMARY KEY,
      booking_code TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      bike_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      payment_type TEXT NOT NULL,
      advance_amount INTEGER NOT NULL,
      balance_amount INTEGER NOT NULL,
      booking_status TEXT DEFAULT 'New',
      payment_status TEXT DEFAULT 'Pending',
      preferred_date TEXT,
      preferred_time TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (bike_id) REFERENCES bikes(id),
      FOREIGN KEY (variant_id) REFERENCES bike_variants(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      payment_code TEXT UNIQUE NOT NULL,
      booking_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      payment_type TEXT NOT NULL,
      gateway TEXT NOT NULL DEFAULT 'RAZORPAY',
      transaction_id TEXT,
      status TEXT DEFAULT 'Paid',
      raw_response_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bike_bookings(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      phone TEXT NOT NULL,
      template_name TEXT NOT NULL,
      variables_json TEXT,
      message_body TEXT NOT NULL,
      status TEXT DEFAULT 'Sent',
      provider_message_id TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      error_text TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS whatsapp_reminders (
      id TEXT PRIMARY KEY,
      visit_id TEXT,
      customer_id TEXT,
      reminder_type TEXT NOT NULL,
      scheduled_for DATETIME NOT NULL,
      status TEXT DEFAULT 'PENDING',
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visit_id) REFERENCES showroom_visits(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS whatsapp_templates (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      bike_id TEXT,
      discount_text TEXT,
      start_date TEXT,
      end_date TEXT,
      cta_text TEXT DEFAULT 'Claim Offer',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bike_id) REFERENCES bikes(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create optimal indexes
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_visits_date ON showroom_visits(visit_date);
    CREATE INDEX IF NOT EXISTS idx_visits_status ON showroom_visits(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_code ON bike_bookings(booking_code);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bike_bookings(booking_status);
    CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
    CREATE INDEX IF NOT EXISTS idx_variants_bike ON bike_variants(bike_id);
  `);
}

export default getDb;
