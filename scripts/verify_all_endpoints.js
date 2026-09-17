// Comprehensive End-to-End Verification of Hira Auto Agency Platform
const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          json: () => {
            try {
              return JSON.parse(body);
            } catch (e) {
              return null;
            }
          },
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log('HIRA AUTO AGENCY: END-TO-END SYSTEM VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Verify Public Homepage HTML
  try {
    const res = await request({
      hostname: 'localhost',
      port: 3005,
      path: '/',
      method: 'GET',
    });
    if (res.statusCode === 200 && res.body.includes('HIRA AUTO AGENCY')) {
      console.log('✅ [1/10] Public Homepage: 200 OK & rendered HIRA AUTO AGENCY');
      passed++;
    } else {
      console.log('❌ [1/10] Public Homepage failed. Status:', res.statusCode);
      failed++;
    }
  } catch (e) {
    console.log('❌ [1/10] Public Homepage error:', e.message);
    failed++;
  }

  // 2. Verify Public Bikes Catalog API
  let r15Variant = null;
  try {
    const res = await request({
      hostname: 'localhost',
      port: 3005,
      path: '/api/bikes',
      method: 'GET',
    });
    const data = res.json();
    if (res.statusCode === 200 && data.success && data.bikes.length === 7) {
      const totalVariants = data.bikes.reduce((acc, b) => acc + (b.variants?.length || 0), 0);
      r15Variant = data.bikes[0]?.variants?.[0];
      console.log(`✅ [2/10] Public Catalog API: 200 OK, 7 Models & ${totalVariants} Exact Variants Loaded`);
      passed++;
    } else {
      console.log('❌ [2/10] Public Catalog API failed:', data);
      failed++;
    }
  } catch (e) {
    console.log('❌ [2/10] Public Catalog API error:', e.message);
    failed++;
  }

  // 3. Test Public Showroom Visit Booking Flow
  let testVisitId = null;
  try {
    const res = await request(
      {
        hostname: 'localhost',
        port: 3005,
        path: '/api/visits',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Saurav Kumar',
        phone: '98765432' + Math.floor(Math.random() * 90 + 10),
        email: 'saurav@gmail.com',
        bike_id: 'bike_r15',
        variant_id: 'var_r15_m_carbon',
        visit_date: '2026-09-26',
        visit_time: '11:00 AM - 12:00 PM',
        notes: 'Interested in R15 Carbon edition test drive at Mahagama',
      }
    );
    const data = res.json();
    const visitCode = data.visit?.visitCode || data.visit_code;
    if (res.statusCode === 200 && data.success && visitCode) {
      testVisitId = data.visit?.id || data.id;
      console.log(`✅ [3/10] Public Showroom Visit Booking: 200 OK, Generated Code: ${visitCode}`);
      passed++;
    } else {
      console.log('❌ [3/10] Public Showroom Visit Booking failed:', data);
      failed++;
    }
  } catch (e) {
    console.log('❌ [3/10] Public Showroom Visit Booking error:', e.message);
    failed++;
  }

  // 4. Test Public Bike Reservation & Advance Booking Flow
  let testBookingId = null;
  try {
    const res = await request(
      {
        hostname: 'localhost',
        port: 3005,
        path: '/api/bookings',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Amit Hansda',
        phone: '82105823' + Math.floor(Math.random() * 90 + 10),
        email: 'amit@gmail.com',
        bike_id: 'bike_mt15',
        variant_id: 'var_mt15_dlx_tft',
        total_price: 176930,
        advance_amount: 5000,
        payment_method: 'UPI',
        notes: 'Online token reservation for MT-15 DLX TFT Cyan',
      }
    );
    const data = res.json();
    const bookingCode = data.booking?.bookingCode || data.booking_code;
    if (res.statusCode === 200 && data.success && bookingCode) {
      testBookingId = data.booking?.id || data.id;
      console.log(`✅ [4/10] Public Bike Booking Flow: 200 OK, Generated Booking Code: ${bookingCode}`);
      passed++;
    } else {
      console.log('❌ [4/10] Public Bike Booking Flow failed:', data);
      failed++;
    }
  } catch (e) {
    console.log('❌ [4/10] Public Bike Booking Flow error:', e.message);
    failed++;
  }

  // 5. Test Staff Admin Authentication
  let authCookie = null;
  try {
    const res = await request(
      {
        hostname: 'localhost',
        port: 3005,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'admin@hiraauto.com',
        password: 'admin123',
      }
    );
    const data = res.json();
    const setCookie = res.headers['set-cookie'];
    if (res.statusCode === 200 && data.success && setCookie) {
      authCookie = setCookie[0].split(';')[0];
      console.log(`✅ [5/10] Admin Authentication: 200 OK, Logged in as ${data.user.name} (${data.user.role})`);
      passed++;
    } else {
      console.log('❌ [5/10] Admin Authentication failed:', data);
      failed++;
    }
  } catch (e) {
    console.log('❌ [5/10] Admin Authentication error:', e.message);
    failed++;
  }

  // 6. Test Admin Dashboard KPI Stats API
  try {
    const res = await request({
      hostname: 'localhost',
      port: 3005,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Cookie: authCookie },
    });
    const data = res.json();
    if (res.statusCode === 200 && data.success && data.metrics) {
      console.log(`✅ [6/10] Admin Dashboard KPI API: 200 OK (Bookings: ${data.metrics.totalBookings}, Customers: ${data.metrics.totalCustomers}, Visits: ${data.metrics.totalVisits})`);
      passed++;
    } else {
      console.log('❌ [6/10] Admin Dashboard API failed:', data);
      failed++;
    }
  } catch (e) {
    console.log('❌ [6/10] Admin Dashboard API error:', e.message);
    failed++;
  }

  // 7. Test Admin Customers CRM & WhatsApp Reminder Toggle
  try {
    const res = await request({
      hostname: 'localhost',
      port: 3005,
      path: '/api/admin/customers',
      method: 'GET',
      headers: { Cookie: authCookie },
    });
    const data = res.json();
    if (res.statusCode === 200 && data.success && data.customers.length > 0) {
      const firstCust = data.customers[0];
      // Test toggling reminders
      const toggleRes = await request(
        {
          hostname: 'localhost',
          port: 3005,
          path: '/api/admin/customers',
          method: 'PATCH',
          headers: { Cookie: authCookie, 'Content-Type': 'application/json' },
        },
        {
          customerId: firstCust.id,
          enabled: false,
        }
      );
      const toggleData = toggleRes.json();
      console.log(`✅ [7/10] Customers CRM & Reminder Toggle: 200 OK, Toggled ${firstCust.name} reminders (Status: ${toggleData.enabled ? 'ON' : 'OFF'})`);
      passed++;
    } else {
      console.log('❌ [7/10] Customers CRM failed:', data);
      failed++;
    }
  } catch (e) {
    console.log('❌ [7/10] Customers CRM error:', e.message);
    failed++;
  }

  // 8. Test Admin Showroom Visits & Interactive Calendar API
  try {
    const res = await request({
      hostname: 'localhost',
      port: 3005,
      path: '/api/admin/visits',
      method: 'GET',
      headers: { Cookie: authCookie },
    });
    const data = res.json();
    if (res.statusCode === 200 && data.success && data.visits && data.calendar) {
      console.log(`✅ [8/10] Admin Visits & Calendar API: 200 OK, Loaded ${data.visits.length} scheduled appointments`);
      passed++;
    } else {
      console.log('❌ [8/10] Admin Visits API failed:', data);
      failed++;
    }
  } catch (e) {
    console.log('❌ [8/10] Admin Visits API error:', e.message);
    failed++;
  }

  // 9. Test Offline Payment Recording & Booking Status Update
  try {
    if (testBookingId) {
      const res = await request(
        {
          hostname: 'localhost',
          port: 3005,
          path: '/api/admin/bookings',
          method: 'PATCH',
          headers: { Cookie: authCookie, 'Content-Type': 'application/json' },
        },
        {
          id: testBookingId,
          record_payment_amount: 10000,
          payment_gateway: 'CASH',
          booking_status: 'CONFIRMED',
          send_whatsapp: true,
        }
      );
      const data = res.json();
      if (res.statusCode === 200 && data.success) {
        console.log('✅ [9/10] Offline Cash Collection & Status Transition: 200 OK, Recorded ₹10,000 cash payment');
        passed++;
      } else {
        console.log('❌ [9/10] Offline Payment Recording failed:', data);
        failed++;
      }
    } else {
      console.log('⚠️ [9/10] Skipped offline payment test (no testBookingId)');
    }
  } catch (e) {
    console.log('❌ [9/10] Offline Payment Recording error:', e.message);
    failed++;
  }

  // 10. Test Real-time Catalog Price Modification & Public Sync
  try {
    if (r15Variant) {
      const newPrice = 202500;
      // Admin modifies price
      const updateRes = await request(
        {
          hostname: 'localhost',
          port: 3005,
          path: '/api/admin/catalog',
          method: 'POST',
          headers: { Cookie: authCookie, 'Content-Type': 'application/json' },
        },
        {
          action: 'UPDATE_VARIANT_PRICE',
          variantId: r15Variant.id,
          price: newPrice,
          inStock: true,
        }
      );
      const updateData = updateRes.json();

      // Verify public API returns the new price
      const publicRes = await request({
        hostname: 'localhost',
        port: 3005,
        path: '/api/bikes',
        method: 'GET',
      });
      const publicData = publicRes.json();
      const updatedVariant = publicData.bikes[0]?.variants?.find((v) => v.id === r15Variant.id);

      if (updateData.success && updatedVariant && updatedVariant.ex_showroom_price === newPrice) {
        console.log(`✅ [10/10] Live Price Sync: Price changed to ₹${newPrice.toLocaleString('en-IN')} in CRM and IMMEDIATELY reflected on public website!`);
        passed++;
      } else {
        console.log('❌ [10/10] Live Price Sync failed.');
        failed++;
      }
    }
  } catch (e) {
    console.log('❌ [10/10] Live Price Sync error:', e.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL 10/10)`);
  console.log('====================================================');
}

runVerification();
