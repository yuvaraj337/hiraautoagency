import { getDb } from './index';
import bcrypt from 'bcryptjs';

export function seedDatabase(passedDb?: any) {
  const db = passedDb || getDb();

  // 1. Admin Users (ensure default admin accounts exist)
  try {
    const adminCount = (db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number })?.count || 0;
    if (adminCount === 0) {
      const salt = bcrypt.genSaltSync(10);
      const adminPasswordHash = bcrypt.hashSync('admin123', salt);

      const insertAdmin = db.prepare(`
        INSERT OR REPLACE INTO admin_users (id, name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertAdmin.run('usr_super_admin', 'Hira Agency Admin', 'admin@hiraauto.com', adminPasswordHash, 'Super Admin', 'active');
      insertAdmin.run('usr_sales_manager', 'Sales Manager Mohanpur', 'sales@hiraauto.com', adminPasswordHash, 'Sales', 'active');
      insertAdmin.run('usr_service_lead', 'Service Head Mohanpur', 'service@hiraauto.com', adminPasswordHash, 'Service', 'active');
    }
  } catch (e) {
    console.warn('Error checking admin users:', e);
  }

  // Check if bikes already seeded
  const bikeCount = (db.prepare('SELECT COUNT(*) as count FROM bikes').get() as { count: number })?.count || 0;
  if (bikeCount > 0) {
    console.log('Database already seeded with bikes. Skipping bike seeding.');
    return;
  }

  console.log('Seeding initial database data...');

  // 2. Bikes and Exact Variants (23 Variants matching verified client price list)
  const insertBike = db.prepare(`
    INSERT INTO bikes (id, slug, name, category, tagline, description, engine_cc, max_power, max_torque, fuel_capacity, mileage, curb_weight, image_url, is_featured, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO bike_variants (id, bike_id, name, ex_showroom_price, color_name, color_hex, image_url, in_stock, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Bike 1: R15 V4 & V3 Series
  insertBike.run(
    'bike_r15',
    'yamaha-r15-v4',
    'Yamaha R15 V4',
    'R15',
    'Born of Racing DNA',
    'The R15 V4 brings the pure spirit of Yamaha MotoGP racing to the streets with Variable Valve Actuation (VVA), Upside Down Front Forks, Quick Shifter, and Traction Control.',
    '155 cc',
    '18.4 PS @ 10,000 RPM',
    '14.2 Nm @ 7,500 RPM',
    '11 L',
    '45 kmpl',
    '141 kg',
    '/assets/bikes/hero_r15_v4.jpg',
    1,
    1
  );

  // 6 R15 Variants from client catalog:
  insertVariant.run('var_r15_m_carbon', 'bike_r15', 'R-15 V4 (M) Carbon', 201340, 'Carbon Edition', '#1C1D21', '/assets/bikes/hero_r15_v4.jpg', 1, 1);
  insertVariant.run('var_r15_m_silver', 'bike_r15', 'R-15 (M) Silver', 191130, 'Metallic Silver', '#C0C0C0', '/assets/bikes/hero_r15_v4.jpg', 1, 2);
  insertVariant.run('var_r15_v4_qs', 'bike_r15', 'R-15 V4 (Quick Shifter)', 180300, 'Racing Blue', '#0020B2', '/assets/bikes/hero_r15_v4.jpg', 1, 3);
  insertVariant.run('var_r15_v4_std', 'bike_r15', 'R-15 V4', 175650, 'Metallic Red', '#D41427', '/assets/bikes/hero_r15_v4.jpg', 1, 4);
  insertVariant.run('var_r15_v3_s', 'bike_r15', 'R-15 V3 (S)', 159970, 'Matte Black', '#222222', '/assets/bikes/hero_r15_v4.jpg', 1, 5);
  insertVariant.run('var_r15_v4_monster', 'bike_r15', 'R-15 V4 (Monster)', 176850, 'Monster Energy Edition', '#111111', '/assets/bikes/hero_r15_v4.jpg', 1, 6);

  // Bike 2: MT-15 V2 Series
  insertBike.run(
    'bike_mt15',
    'yamaha-mt-15-v2',
    'Yamaha MT-15 V2',
    'MT',
    'The Dark Side of Japan',
    'Unleash the street predator with hyper-naked styling, Bi-Functional LED projector headlamp, inverted front fork, aluminum swingarm and connected TFT cockpit.',
    '155 cc',
    '18.4 PS @ 10,000 RPM',
    '14.1 Nm @ 7,500 RPM',
    '10 L',
    '48 kmpl',
    '139 kg',
    '/assets/bikes/hero_mt15_v2.jpg',
    1,
    2
  );

  // 4 MT-15 Variants from client catalog:
  insertVariant.run('var_mt15_dlx_tft', 'bike_mt15', 'MT-15 V2 (DLX TFT)', 176930, 'Ice Fluo-Vermillion', '#EAEAEA', '/assets/bikes/hero_mt15_v2.jpg', 1, 1);
  insertVariant.run('var_mt15_std_black', 'bike_mt15', 'MT-15 (STD) Black', 166710, 'Metallic Black', '#151515', '/assets/bikes/hero_mt15_v2.jpg', 1, 2);
  insertVariant.run('var_mt15_monster', 'bike_mt15', 'MT-15 (Monster)', 169110, 'Monster Energy MotoGP', '#0A0E1A', '/assets/bikes/hero_mt15_v2.jpg', 1, 3);
  insertVariant.run('var_mt15_cyan_blue', 'bike_mt15', 'MT-15 (STD) Cyan Blue', 167610, 'Cyan Storm', '#00E5FF', '/assets/bikes/hero_mt15_v2.jpg', 1, 4);

  // Bike 3: FZ Series
  insertBike.run(
    'bike_fzs',
    'yamaha-fzs-v4-hybrid',
    'Yamaha FZ-S V4 Hybrid',
    'FZ',
    'Lord of the Streets',
    'Crafted for commanding urban presence, featuring Traction Control System (TCS), Class-D Bi-functional LED headlight, and Bluetooth Y-Connect technology.',
    '149 cc',
    '12.4 PS @ 7,250 RPM',
    '13.3 Nm @ 5,500 RPM',
    '13 L',
    '50 kmpl',
    '136 kg',
    '/assets/bikes/hero_fzs_v4.jpg',
    1,
    3
  );

  // 4 FZ Variants from client catalog:
  insertVariant.run('var_fz_v3', 'bike_fzs', 'F-Z V3', 117560, 'Metallic Black', '#1A1A1A', '/assets/bikes/hero_fzs_v4.jpg', 1, 1);
  insertVariant.run('var_fz_rave', 'bike_fzs', 'F-Z Rave', 125880, 'Rave Matte Grey', '#3E424B', '/assets/bikes/hero_fzs_v4.jpg', 1, 2);
  insertVariant.run('var_fzs_v3_std', 'bike_fzs', 'FZ-S V3 (STD)', 131680, 'Matte Red', '#B32428', '/assets/bikes/hero_fzs_v4.jpg', 1, 3);
  insertVariant.run('var_fzs_v4_hybrid', 'bike_fzs', 'FZ-S V4 Hybrid', 142000, 'Metallic Grey / Chrome', '#646D7E', '/assets/bikes/hero_fzs_v4.jpg', 1, 4);

  // Bike 4: XSR Series (Heritage)
  insertBike.run(
    'bike_xsr',
    'yamaha-xsr-155',
    'Yamaha XSR 155',
    'XSR',
    'Born to be Timeless',
    'A masterpiece of Neo-Retro design with a teardrop fuel tank, round LED headlamp, tuck-and-roll heritage seat, and the high-revving 155cc liquid-cooled heart.',
    '155 cc',
    '19.3 PS @ 10,000 RPM',
    '14.7 Nm @ 8,500 RPM',
    '10.4 L',
    '46 kmpl',
    '134 kg',
    '/assets/bikes/bike_xsr155.webp',
    0,
    4
  );

  // 5 XSR Variants from client catalog:
  insertVariant.run('var_xsr_black', 'bike_xsr', 'XSR Black', 163900, 'Heritage Black', '#181818', '/assets/bikes/bike_xsr155.webp', 1, 1);
  insertVariant.run('var_xsr_silver', 'bike_xsr', 'XSR Silver', 161900, 'Timeless Silver', '#D8D8D8', '/assets/bikes/bike_xsr155.webp', 1, 2);
  insertVariant.run('var_xsr_red', 'bike_xsr', 'XSR Red', 157900, 'Vintage Red', '#C82333', '/assets/bikes/bike_xsr155.webp', 1, 3);
  insertVariant.run('var_xsr_blue', 'bike_xsr', 'XSR Blue', 157090, 'Classic Blue', '#0047AB', '/assets/bikes/bike_xsr155.webp', 1, 4);
  insertVariant.run('var_xsr_green', 'bike_xsr', 'XSR Green', 163900, 'Military Green', '#354B3E', '/assets/bikes/bike_xsr155.webp', 1, 5);

  // Bike 5: Scooters - Ray ZR 125 Fi
  insertBike.run(
    'bike_rayzr',
    'yamaha-ray-zr-125',
    'Yamaha Ray ZR 125',
    'SCOOTERS',
    'The Armoured Street Fighter',
    'Tough, aggressive scooter styling with knuckle guards, block pattern tires, hybrid assist engine, and ultra-light 99 kg kerb weight for effortless maneuvering.',
    '125 cc',
    '8.2 PS @ 6,500 RPM',
    '10.3 Nm @ 5,000 RPM',
    '5.2 L',
    '58 kmpl',
    '99 kg',
    '/assets/bikes/bike_rayzr.webp',
    0,
    5
  );

  insertVariant.run('var_rayzr_drum', 'bike_rayzr', 'Ray ZR (Drum)', 82880, 'Metallic Black', '#111111', '/assets/bikes/bike_rayzr.webp', 1, 1);
  insertVariant.run('var_rayzr_rally', 'bike_rayzr', 'Ray ZR (Street Rally)', 96930, 'Matte Copper / Black', '#A55D35', '/assets/bikes/bike_rayzr.webp', 1, 2);

  // Bike 6: Scooters - Fascino (Drum)
  insertBike.run(
    'bike_fascino',
    'yamaha-fascino-125',
    'Yamaha Fascino (Drum)',
    'SCOOTERS',
    'Classic European Elegance',
    'Rich curves, signature chrome accents, quiet start motor generator, hybrid assist technology, and plush comfortable ride for discerning city commuters.',
    '125 cc',
    '8.2 PS @ 6,500 RPM',
    '10.3 Nm @ 5,000 RPM',
    '5.2 L',
    '60 kmpl',
    '99 kg',
    '/bikes/fascino-drum.png',
    0,
    6
  );

  insertVariant.run('var_fascino_drum', 'bike_fascino', 'Fascino (Drum)', 80980, 'Vivid Red', '#D71920', '/bikes/fascino-drum.png', 1, 1);

  // Bike 7: Aerox S (Maxi Sports Scooter) - 4th Hero Bike!
  insertBike.run(
    'bike_aerox',
    'yamaha-aerox-s',
    'Yamaha Aerox S',
    'SCOOTERS',
    'The Maxi-Sports Scooter with Smart Key',
    'Pure motorcycle performance in a maxi-sports scooter chassis: 155cc liquid-cooled VVA engine, Smart Key keyless system, Traction Control System (TCS), wide 14-inch sports wheels, and 24.5L underseat storage.',
    '155 cc',
    '15.0 PS @ 8,000 RPM',
    '13.9 Nm @ 6,500 RPM',
    '5.5 L',
    '42 kmpl',
    '126 kg',
    '/bikes/aerox-s.png',
    1,
    7
  );

  insertVariant.run('var_aerox_s', 'bike_aerox', 'Aerox (S)', 150350, 'Racing Blue (Version S Smart Key)', '#0020B2', '/bikes/aerox-s.png', 1, 1);

  // 3. WhatsApp Templates
  const insertTemplate = db.prepare(`
    INSERT INTO whatsapp_templates (id, name, description, body)
    VALUES (?, ?, ?, ?)
  `);

  insertTemplate.run(
    'tpl_visit_booked',
    'Showroom Visit Confirmed',
    'Sent immediately when customer books a showroom appointment',
    'Dear {{customer_name}}, greetings from {{dealership_name}}! 🏍️\n\nYour showroom visit for {{bike}} ({{variant}}) is confirmed for *{{visit_date}} at {{visit_time}}*.\n\n📍 Address: {{dealership_address}}\n📞 Helpdesk: {{dealership_phone}}\n\nWe look forward to welcoming you for an exhilarating Yamaha test ride!'
  );

  insertTemplate.run(
    'tpl_reminder_24h',
    '24-Hour Visit Reminder',
    'Sent 24 hours prior to scheduled showroom visit',
    'Hi {{customer_name}}! This is a friendly reminder that your Yamaha showroom visit at {{dealership_name}} is scheduled tomorrow, *{{visit_date}} at {{visit_time}}*.\n\nYour selected model: {{bike}} ({{variant}}).\n\nReply "RESCHEDULE" if you need to adjust timings. See you soon!'
  );

  insertTemplate.run(
    'tpl_reminder_2h',
    '2-Hour Visit Reminder',
    'Sent 2 hours prior to scheduled showroom visit',
    'Hi {{customer_name}}, our team at {{dealership_name}} has prepared the {{bike}} for your visit today at *{{visit_time}}*! 🏁\n\nShowroom Location: Kechua Chowk, Mohanpur.\nCall: {{dealership_phone}} if you need directions.'
  );

  insertTemplate.run(
    'tpl_booking_advance',
    'Bike Advance Booking Receipt',
    'Sent after advance payment confirmation',
    '🎉 Congratulations {{customer_name}}! Your booking for the {{bike}} ({{variant}}) is CONFIRMED at {{dealership_name}}.\n\nBooking ID: *{{booking_id}}*\nAdvance Paid: *₹{{amount}}*\nRemaining Balance: *₹{{balance}}*\n\nOur sales executive will contact you shortly regarding delivery schedule and documentation. Thank you for choosing Yamaha!'
  );

  // 4. Dealership Settings
  const insertSetting = db.prepare(`
    INSERT INTO settings (key, value, category)
    VALUES (?, ?, ?)
  `);

  insertSetting.run('dealership_name', 'Hira Auto Agency', 'general');
  insertSetting.run('dealership_tagline', 'Authorized Yamaha Dealership | Mohanpur, Godda', 'general');
  insertSetting.run('dealership_address', 'Opp. Honda Showroom, Kechua Chowk, Mohanpur, Godda, Jharkhand 814154', 'contact');
  insertSetting.run('dealership_phone', '+91 62012 38401', 'contact');
  insertSetting.run('dealership_phone_alt', '+91 62012 38401', 'contact');
  insertSetting.run('dealership_email', 'hiramotors007@gmail.com', 'contact');
  insertSetting.run('advance_booking_fixed_amount', '5000', 'booking');
  insertSetting.run('advance_booking_type', 'FIXED', 'booking'); // FIXED or PERCENTAGE
  insertSetting.run('advance_booking_percentage', '10', 'booking');
  insertSetting.run('whatsapp_enabled_default', '1', 'whatsapp');
  insertSetting.run('whatsapp_reminder_24h', '1', 'whatsapp');
  insertSetting.run('whatsapp_reminder_2h', '1', 'whatsapp');
  insertSetting.run('whatsapp_business_phone', '916201238401', 'whatsapp');
  insertSetting.run('business_hours', 'Monday - Sunday: 9:00 AM - 7:30 PM', 'general');
  insertSetting.run('ticker_text', '🏁 FESTIVE OFFER: ₹5,000 EXCHANGE BONUS ON R15 V4 & MT-15 • ZERO DOWN PAYMENT FINANCE SCHEMES AVAILABLE • 100% GENUINE YAMAHA SPARE PARTS & CERTIFIED SERVICE BAYS • VISIT HIRA AUTO AGENCY MOHANPUR TODAY', 'general');

  // 5. Seed Initial Real Customer Operations & Activity
  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, name, phone, email, whatsapp_reminders_enabled, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertCustomer.run('cust_1', 'Rajesh Kumar Soren', '9876543210', 'rajesh.soren@gmail.com', 1, 'Booked', 'Interested in R15 Carbon edition for Diwali');
  insertCustomer.run('cust_2', 'Amitesh Dubey', '9431287654', 'amitesh.dubey@outlook.com', 1, 'Active', 'Scheduled test ride for MT-15 V2 Cyan Blue');
  insertCustomer.run('cust_3', 'Pooja Kumari', '8709123456', 'pooja.kumari88@gmail.com', 1, 'Active', 'Looking for Fascino Vivid Red for daily commute');
  insertCustomer.run('cust_4', 'Vikramaditya Roy', '7004123456', 'v.roy@yahoo.in', 1, 'Completed', 'Delivered Aerox Version S Racing Blue');

  // Seed Showroom Visits
  const insertVisit = db.prepare(`
    INSERT INTO showroom_visits (id, visit_code, customer_id, bike_id, variant_id, visit_date, visit_time, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVisit.run('vis_1', 'YAM-VS-10492', 'cust_2', 'bike_mt15', 'var_mt15_cyan_blue', '2026-09-18', '11:30 AM', 'Confirmed', 'Test ride requested on main road stretch');
  insertVisit.run('vis_2', 'YAM-VS-10493', 'cust_3', 'bike_fascino', 'var_fascino_drum', '2026-09-19', '03:00 PM', 'New', 'Customer will bring exchange two-wheeler');
  insertVisit.run('vis_3', 'YAM-VS-10490', 'cust_4', 'bike_aerox', 'var_aerox_s', '2026-09-15', '05:00 PM', 'Completed', 'Visit completed and bike delivered');

  // Seed Bike Bookings
  const insertBooking = db.prepare(`
    INSERT INTO bike_bookings (id, booking_code, customer_id, bike_id, variant_id, total_price, payment_type, advance_amount, balance_amount, booking_status, payment_status, preferred_date, preferred_time, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBooking.run(
    'bk_1',
    'YAM-BK-88219',
    'cust_1',
    'bike_r15',
    'var_r15_m_carbon',
    201340,
    'ADVANCE',
    5000,
    196340,
    'Confirmed',
    'Partially Paid',
    '2026-09-22',
    '10:30 AM',
    'Customer paid ₹5,000 advance online. Remaining ₹1,96,340 via bank finance.'
  );

  // Seed Payments
  const insertPayment = db.prepare(`
    INSERT INTO payments (id, payment_code, booking_id, customer_id, amount, payment_type, gateway, transaction_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPayment.run('pay_1', 'PAY-904128', 'bk_1', 'cust_1', 5000, 'ADVANCE', 'RAZORPAY', 'rzp_test_trx_841029', 'Paid');

  // Seed WhatsApp Reminders
  const insertReminder = db.prepare(`
    INSERT INTO whatsapp_reminders (id, visit_id, customer_id, reminder_type, scheduled_for, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertReminder.run('rem_1', 'vis_1', 'cust_2', '24_HOURS', '2026-09-17 11:30:00', 'SENT');
  insertReminder.run('rem_2', 'vis_1', 'cust_2', '2_HOURS', '2026-09-18 09:30:00', 'PENDING');
  insertReminder.run('rem_3', 'vis_2', 'cust_3', '24_HOURS', '2026-09-18 15:00:00', 'PENDING');

  // Seed Activity Log
  const insertLog = db.prepare(`
    INSERT INTO activity_logs (id, user_id, user_name, action, entity_type, entity_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertLog.run('log_1', 'usr_super_admin', 'System Init', 'SYSTEM_INIT', 'DATABASE', 'ALL', JSON.stringify({ message: 'Seeded 23 catalog variants from verified 2026 price list' }));
  insertLog.run('log_2', 'usr_super_admin', 'Hira Agency Admin', 'BOOKING_CONFIRMED', 'BOOKING', 'bk_1', JSON.stringify({ booking_code: 'YAM-BK-88219', amount: 5000 }));

  console.log('Seeded database with 23 exact catalog variants, admin users, settings, and active records!');
}
