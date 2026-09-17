export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { logActivity } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name;
    const phone = body.phone;
    const email = body.email;
    const bikeId = body.bikeId || body.bike_id;
    const variantId = body.variantId || body.variant_id;
    const visitDate = body.visitDate || body.visit_date;
    const visitTime = body.visitTime || body.visit_time;
    const notes = body.notes;

    if (!name || !phone || !visitDate || !visitTime) {
      return NextResponse.json({ success: false, error: 'Name, phone, visit date and time are required.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Please provide a valid 10-digit mobile number.' }, { status: 400 });
    }

    const db = getDb();

    // 1. Prevent double booking: Check if customer already has an active visit on the same date
    const existingVisit = db.prepare(`
      SELECT v.* FROM showroom_visits v
      JOIN customers c ON c.id = v.customer_id
      WHERE c.phone = ? AND v.visit_date = ? AND v.status NOT IN ('Cancelled', 'Completed', 'No Show')
    `).get(cleanPhone, visitDate) as any;

    if (existingVisit) {
      return NextResponse.json({
        success: false,
        error: `You already have an active showroom visit scheduled for ${visitDate} (Booking Ref: ${existingVisit.visit_code}). You may reschedule or call us directly.`
      }, { status: 409 });
    }

    // 2. Fetch bike details if specified
    let bikeName = 'Yamaha Motorcycle';
    let variantName = 'Standard';
    if (bikeId) {
      const bike = db.prepare('SELECT name FROM bikes WHERE id = ?').get(bikeId) as { name: string } | undefined;
      if (bike) bikeName = bike.name;
    }
    if (variantId) {
      const variant = db.prepare('SELECT name FROM bike_variants WHERE id = ?').get(variantId) as { name: string } | undefined;
      if (variant) variantName = variant.name;
    }

    // 3. Find or create customer
    let customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(cleanPhone) as { id: string } | undefined;
    let customerId = customer?.id;

    if (!customerId) {
      customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO customers (id, name, phone, email, status, notes)
        VALUES (?, ?, ?, ?, 'Active', ?)
      `).run(customerId, name.trim(), cleanPhone, email?.trim() || null, `Requested visit for ${bikeName}`);
    } else {
      db.prepare(`
        UPDATE customers 
        SET name = ?, email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name.trim(), email?.trim() || null, customerId);
    }

    // 4. Generate unique Visit Code
    const visitCode = `YAM-VS-${Math.floor(10000 + Math.random() * 90000)}`;
    const visitId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 5. Insert Visit
    db.prepare(`
      INSERT INTO showroom_visits (
        id, visit_code, customer_id, bike_id, variant_id, visit_date, visit_time, status, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'New', ?)
    `).run(
      visitId,
      visitCode,
      customerId,
      bikeId || null,
      variantId || null,
      visitDate,
      visitTime,
      notes?.trim() || null
    );

    // 6. Schedule automated reminders (24h and 2h)
    try {
      let hour = 11;
      const match = (visitTime || '').match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const isPM = match[3]?.toUpperCase() === 'PM';
        if (isPM && h < 12) h += 12;
        if (!isPM && h === 12) h = 0;
        hour = h;
      }
      const visitDateTime = new Date(`${visitDate}T${String(hour).padStart(2, '0')}:00:00`);
      const validTime = !isNaN(visitDateTime.getTime()) ? visitDateTime.getTime() : Date.now() + 24 * 3600 * 1000;
      const reminder24h = new Date(validTime - 24 * 60 * 60 * 1000);
      const reminder2h = new Date(validTime - 2 * 60 * 60 * 1000);

      const insertReminder = db.prepare(`
        INSERT INTO whatsapp_reminders (id, visit_id, customer_id, reminder_type, scheduled_for, status)
        VALUES (?, ?, ?, ?, ?, 'PENDING')
      `);

      insertReminder.run(`rem_${Date.now()}_24h`, visitId, customerId, '24_HOURS', reminder24h.toISOString());
      insertReminder.run(`rem_${Date.now()}_2h`, visitId, customerId, '2_HOURS', reminder2h.toISOString());
    } catch (e) {
      console.warn('Could not compute reminder dates:', e);
    }

    // 7. Dispatch instant confirmation WhatsApp message
    try {
      await sendWhatsAppMessage({
        customerId,
        phone: cleanPhone,
        templateName: 'tpl_visit_booked',
        variables: {
          customer_name: name,
          bike: bikeName,
          variant: variantName,
          booking_id: visitCode,
          visit_date: visitDate,
          visit_time: visitTime
        }
      });
    } catch (waErr) {
      console.warn('WhatsApp visit notice failed non-fatally:', waErr);
    }

    // 8. Log activity
    logActivity('public_customer', name, 'VISIT_BOOKED', 'VISIT', visitId, {
      visitCode,
      bike: bikeName,
      date: visitDate,
      time: visitTime
    });

    return NextResponse.json({
      success: true,
      visit: {
        id: visitId,
        visitCode,
        customerName: name,
        bikeName,
        variantName,
        visitDate,
        visitTime
      }
    });
  } catch (error: any) {
    console.error('Error booking visit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
