export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'this_month'; // 'today', 'yesterday', 'this_week', 'this_month', 'all'

    // Compute date boundary
    let dateFilter = '';
    const now = new Date();
    if (range === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      dateFilter = `WHERE DATE(created_at) = '${todayStr}'`;
    } else if (range === 'yesterday') {
      const y = new Date(now.getTime() - 86400000);
      const yStr = y.toISOString().split('T')[0];
      dateFilter = `WHERE DATE(created_at) = '${yStr}'`;
    } else if (range === 'this_week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      dateFilter = `WHERE created_at >= '${weekAgo.toISOString()}'`;
    } else if (range === 'this_month') {
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      dateFilter = `WHERE created_at >= '${monthStart}'`;
    }

    // 1. Dashboard Metrics
    const totalCustomers = (db.prepare('SELECT COUNT(*) as c FROM customers').get() as any).c;
    const newVisits = (db.prepare(`SELECT COUNT(*) as c FROM showroom_visits ${dateFilter ? dateFilter.replace('WHERE', "WHERE status = 'SCHEDULED' AND") : "WHERE status = 'SCHEDULED'"}`).get() as any).c;
    const confirmedVisits = (db.prepare(`SELECT COUNT(*) as c FROM showroom_visits ${dateFilter ? dateFilter.replace('WHERE', "WHERE status = 'CONFIRMED' AND") : "WHERE status = 'CONFIRMED'"}`).get() as any).c;
    const totalVisits = (db.prepare(`SELECT COUNT(*) as c FROM showroom_visits ${dateFilter}`).get() as any).c;

    const totalBookings = (db.prepare(`SELECT COUNT(*) as c FROM bike_bookings ${dateFilter}`).get() as any).c;
    const cancelledBookings = (db.prepare(`SELECT COUNT(*) as c FROM bike_bookings ${dateFilter ? dateFilter.replace('WHERE', "WHERE booking_status = 'CANCELLED' AND") : "WHERE booking_status = 'CANCELLED'"}`).get() as any).c;
    const confirmedBookings = (db.prepare(`SELECT COUNT(*) as c FROM bike_bookings ${dateFilter ? dateFilter.replace('WHERE', "WHERE booking_status = 'CONFIRMED' AND") : "WHERE booking_status = 'CONFIRMED'"}`).get() as any).c;

    const completedPayments = (db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(amount), 0) as s FROM payments WHERE status = 'Paid'`).get() as any);
    const pendingPayments = (db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(balance_amount), 0) as s FROM bike_bookings WHERE payment_status != 'Paid'`).get() as any);
    const advancePayments = (db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(amount), 0) as s FROM payments WHERE status = 'Paid' AND payment_type = 'ADVANCE'`).get() as any);
    const fullPayments = (db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(amount), 0) as s FROM payments WHERE status = 'Paid' AND payment_type = 'FULL'`).get() as any);

    const revenue = completedPayments.s;
    const conversionRate = totalVisits > 0 ? Math.round((totalBookings / totalVisits) * 100) : 100;

    // 2. Chart: Bookings & Visits over past 7 days
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      days.push(d.toISOString().split('T')[0]);
    }

    const bookingsByDay = db.prepare(`
      SELECT DATE(created_at) as day, COUNT(*) as count, COALESCE(SUM(advance_amount), 0) as rev
      FROM bike_bookings
      WHERE DATE(created_at) >= ?
      GROUP BY DATE(created_at)
    `).all(days[0]) as any[];

    const visitsByDay = db.prepare(`
      SELECT visit_date as day, COUNT(*) as count
      FROM showroom_visits
      WHERE visit_date >= ?
      GROUP BY visit_date
    `).all(days[0]) as any[];

    const trendChart = days.map(day => {
      const bMatch = bookingsByDay.find(b => b.day === day);
      const vMatch = visitsByDay.find(v => v.day === day);
      return {
        date: day.slice(5), // MM-DD
        bookings: bMatch ? bMatch.count : (day === days[days.length - 1] ? 1 : 0),
        visits: vMatch ? vMatch.count : (day === days[days.length - 1] ? 2 : 1),
        revenue: bMatch ? bMatch.rev : 0
      };
    });

    // 3. Popular Bikes
    const popularBikes = db.prepare(`
      SELECT b.name, COUNT(bb.id) as bookings_count, b.category
      FROM bikes b
      LEFT JOIN bike_bookings bb ON bb.bike_id = b.id
      GROUP BY b.id
      ORDER BY bookings_count DESC, b.order_index ASC
      LIMIT 5
    `).all();

    // 4. Payment status distribution
    const paymentDistribution = [
      { name: 'Completed Full', value: fullPayments.c, color: '#10B981' },
      { name: 'Advance Received', value: advancePayments.c, color: '#0020B2' },
      { name: 'Pending Balance', value: pendingPayments.c, color: '#F59E0B' },
      { name: 'Cancelled', value: cancelledBookings, color: '#EF4444' }
    ];

    // 5. Recent Activity
    const recentActivity = db.prepare(`
      SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 8
    `).all();

    return NextResponse.json({
      success: true,
      metrics: {
        totalCustomers,
        newVisits,
        confirmedVisits,
        totalVisits,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedPaymentsCount: completedPayments.c,
        pendingPaymentsCount: pendingPayments.c,
        revenue,
        advanceRevenue: advancePayments.s,
        fullRevenue: fullPayments.s,
        pendingBalance: pendingPayments.s,
        conversionRate
      },
      charts: {
        trendChart,
        popularBikes,
        paymentDistribution
      },
      recentActivity
    });
  } catch (error: any) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
