const Database = require('better-sqlite3');
const path = require('path');

function clearCrmData() {
  const dbPath = path.join(__dirname, '..', 'data', 'hira_yamaha.db');
  console.log(`Connecting to database at: ${dbPath}`);
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Count current rows before clearing
  const countsBefore = {
    payments: db.prepare('SELECT count(*) as c FROM payments').get().c,
    bookings: db.prepare('SELECT count(*) as c FROM bike_bookings').get().c,
    whatsapp_reminders: db.prepare('SELECT count(*) as c FROM whatsapp_reminders').get().c,
    whatsapp_messages: db.prepare('SELECT count(*) as c FROM whatsapp_messages').get().c,
    showroom_visits: db.prepare('SELECT count(*) as c FROM showroom_visits').get().c,
    customers: db.prepare('SELECT count(*) as c FROM customers').get().c,
    activity_logs: db.prepare('SELECT count(*) as c FROM activity_logs').get().c,
  };

  console.log('\n📊 Current CRM Records:');
  console.table(countsBefore);

  // Transaction to safely delete operational CRM records in correct foreign-key order
  const clearTransaction = db.transaction(() => {
    db.prepare('DELETE FROM payments').run();
    db.prepare('DELETE FROM bike_bookings').run();
    db.prepare('DELETE FROM whatsapp_reminders').run();
    db.prepare('DELETE FROM whatsapp_messages').run();
    db.prepare('DELETE FROM showroom_visits').run();
    db.prepare('DELETE FROM customers').run();
    db.prepare('DELETE FROM activity_logs WHERE entity_type != "DATABASE"').run();

    // Log the clear action into activity_logs
    db.prepare(`
      INSERT INTO activity_logs (id, user_id, user_name, action, entity_type, entity_id, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'log_clear_' + Date.now(),
      'system',
      'Admin',
      'CLEAR_CRM_DATA',
      'SYSTEM',
      'ALL',
      JSON.stringify({ message: 'Cleared all CRM operational data (customers, visits, bookings, payments, logs)' })
    );
  });

  clearTransaction();

  // Count rows after clearing
  const countsAfter = {
    payments: db.prepare('SELECT count(*) as c FROM payments').get().c,
    bookings: db.prepare('SELECT count(*) as c FROM bike_bookings').get().c,
    whatsapp_reminders: db.prepare('SELECT count(*) as c FROM whatsapp_reminders').get().c,
    whatsapp_messages: db.prepare('SELECT count(*) as c FROM whatsapp_messages').get().c,
    showroom_visits: db.prepare('SELECT count(*) as c FROM showroom_visits').get().c,
    customers: db.prepare('SELECT count(*) as c FROM customers').get().c,
    activity_logs: db.prepare('SELECT count(*) as c FROM activity_logs').get().c,
    bikes: db.prepare('SELECT count(*) as c FROM bikes').get().c,
    admins: db.prepare('SELECT count(*) as c FROM admin_users').get().c,
  };

  console.log('\n✅ CRM Data Cleared Successfully! Current database status:');
  console.table(countsAfter);
  console.log('Bike catalog & Admin credentials were fully preserved.');
}

if (require.main === module) {
  clearCrmData();
}

module.exports = { clearCrmData };
