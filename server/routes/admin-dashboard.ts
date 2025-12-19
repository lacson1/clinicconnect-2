import { Router } from "express";
import { db } from "../db";
import { users, patients, visits, labOrders, medicines, appointments, auditLogs, performanceMetrics, invoices } from "@shared/schema";
import { authenticateToken, requireAnyRole, type AuthRequest } from "../middleware/auth";
import { eq, and, gte, desc, sql, count, avg, sum } from "drizzle-orm";

const router = Router();

// System Health Endpoint
router.get('/system-health', authenticateToken, requireAnyRole(['admin', 'super_admin', 'superadmin']), async (req: AuthRequest, res) => {
  try {
    const startTime = Date.now();
    
    // Get database connection count (simplified - actual implementation would query pg_stat_activity)
    const dbConnections = 15; // Mock value - in production, query actual DB stats
    
    // Get active users in last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        gte(users.lastLoginAt, thirtyMinutesAgo),
        eq(users.isActive, true)
      ));
    
    // Get API calls from last hour (from performance metrics)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [apiCallsResult] = await db
      .select({ count: count() })
      .from(performanceMetrics)
      .where(gte(performanceMetrics.timestamp, oneHourAgo));
    
    // Calculate error rate from performance metrics
    const [errorStatsResult] = await db
      .select({ 
        total: count(),
        errors: sql<number>`COUNT(CASE WHEN ${performanceMetrics.statusCode} >= 400 THEN 1 END)`
      })
      .from(performanceMetrics)
      .where(gte(performanceMetrics.timestamp, oneHourAgo));
    
    const errorRate = errorStatsResult.total > 0 
      ? (Number(errorStatsResult.errors) / errorStatsResult.total) * 100 
      : 0;
    
    // System uptime (in seconds) - mock value, real implementation would use process.uptime()
    const uptime = process.uptime();
    
    // Calculate response time from recent performance metrics
    const [avgResponseTime] = await db
      .select({ avgTime: avg(performanceMetrics.responseTime) })
      .from(performanceMetrics)
      .where(gte(performanceMetrics.timestamp, new Date(Date.now() - 5 * 60 * 1000)));
    
    const responseTime = Math.round(Number(avgResponseTime?.avgTime) || 0);
    
    // Get memory and CPU usage (mock values - real implementation would use OS metrics)
    const memoryUsage = Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100);
    const cpuUsage = Math.round(Math.random() * 30 + 10); // Mock CPU usage between 10-40%
    
    // Determine overall system status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errorRate > 5 || memoryUsage > 90 || cpuUsage > 80) {
      status = 'critical';
    } else if (errorRate > 2 || memoryUsage > 75 || cpuUsage > 60) {
      status = 'warning';
    }
    
    const health = {
      status,
      uptime: Math.round(uptime),
      responseTime,
      dbConnections,
      memoryUsage,
      cpuUsage,
      activeUsers: activeUsersResult.count || 0,
      apiCallsLastHour: apiCallsResult.count || 0,
      errorRate: Math.round(errorRate * 100) / 100,
      timestamp: new Date().toISOString()
    };
    
    res.json(health);
  } catch (error) {
    console.error("Error fetching system health:", error);
    res.status(500).json({ 
      message: "Failed to fetch system health",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced Dashboard Stats
router.get('/dashboard/stats', authenticateToken, requireAnyRole(['admin', 'super_admin', 'superadmin']), async (req: AuthRequest, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Total Patients
    const [totalPatientsResult] = await db
      .select({ count: count() })
      .from(patients)
      .where(organizationId ? eq(patients.organizationId, organizationId) : sql`true`);
    
    const [lastMonthPatientsResult] = await db
      .select({ count: count() })
      .from(patients)
      .where(and(
        organizationId ? eq(patients.organizationId, organizationId) : sql`true`,
        gte(patients.createdAt, lastMonth)
      ));
    
    const totalPatients = totalPatientsResult.count || 0;
    const newPatientsThisMonth = lastMonthPatientsResult.count || 0;
    const patientsChange = totalPatients > 0 ? Math.round((newPatientsThisMonth / totalPatients) * 100) : 0;
    
    // Today's Visits
    const [todayVisitsResult] = await db
      .select({ count: count() })
      .from(visits)
      .where(and(
        organizationId ? eq(visits.organizationId, organizationId) : sql`true`,
        gte(visits.visitDate, today)
      ));
    
    const [yesterdayVisitsResult] = await db
      .select({ count: count() })
      .from(visits)
      .where(and(
        organizationId ? eq(visits.organizationId, organizationId) : sql`true`,
        gte(visits.visitDate, new Date(today.getTime() - 24 * 60 * 60 * 1000)),
        sql`${visits.visitDate} < ${today}`
      ));
    
    const todayVisits = todayVisitsResult.count || 0;
    const yesterdayVisits = yesterdayVisitsResult.count || 0;
    const visitsChange = yesterdayVisits > 0 ? Math.round(((todayVisits - yesterdayVisits) / yesterdayVisits) * 100) : 0;
    
    // Pending Lab Orders
    const [pendingLabsResult] = await db
      .select({ count: count() })
      .from(labOrders)
      .where(and(
        organizationId ? eq(labOrders.organizationId, organizationId) : sql`true`,
        eq(labOrders.status, 'pending')
      ));
    
    const pendingLabs = pendingLabsResult.count || 0;
    
    // Low Stock Items
    const [lowStockResult] = await db
      .select({ count: count() })
      .from(medicines)
      .where(and(
        organizationId ? eq(medicines.organizationId, organizationId) : sql`true`,
        sql`${medicines.quantity} <= ${medicines.lowStockThreshold}`
      ));
    
    const lowStockItems = lowStockResult.count || 0;
    
    // Active Staff (logged in within last 8 hours)
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
    const [activeStaffResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        organizationId ? eq(users.organizationId, organizationId) : sql`true`,
        eq(users.isActive, true),
        gte(users.lastLoginAt, eightHoursAgo)
      ));
    
    const activeStaff = activeStaffResult.count || 0;
    
    // Total Revenue (this month)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [revenueResult] = await db
      .select({ total: sum(invoices.totalAmount) })
      .from(invoices)
      .where(and(
        organizationId ? eq(invoices.organizationId, organizationId) : sql`true`,
        gte(invoices.issueDate, firstDayOfMonth),
        sql`${invoices.status} != 'cancelled'`
      ));
    
    const totalRevenue = Number(revenueResult?.total) || 0;
    
    // Today's Appointments
    const [todayAppointmentsResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(
        organizationId ? eq(appointments.organizationId, organizationId) : sql`true`,
        eq(appointments.appointmentDate, sql`CURRENT_DATE`)
      ));
    
    const [completedAppointmentsResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(
        organizationId ? eq(appointments.organizationId, organizationId) : sql`true`,
        eq(appointments.appointmentDate, sql`CURRENT_DATE`),
        eq(appointments.status, 'completed')
      ));
    
    const appointmentsToday = todayAppointmentsResult.count || 0;
    const completedAppointments = completedAppointmentsResult.count || 0;
    
    const stats = {
      totalPatients,
      patientsChange,
      todayVisits,
      visitsChange,
      pendingLabs,
      labsChange: 0, // Can be calculated with historical data
      lowStockItems,
      stockChange: 0,
      activeStaff,
      totalRevenue,
      revenueChange: 5, // Mock value - calculate from historical data
      appointmentsToday,
      completedAppointments,
      averageWaitTime: 15, // Mock value - calculate from actual appointment data
      patientSatisfaction: 4.5 // Mock value - calculate from patient feedback
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ 
      message: "Failed to fetch dashboard stats",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Recent Activity
router.get('/recent-activity', authenticateToken, requireAnyRole(['admin', 'super_admin', 'superadmin']), async (req: AuthRequest, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const limit = parseInt(req.query.limit as string) || 100; // Increased default from 20 to 100
    
    // Build conditions array for filtering
    const conditions = [];
    
    // Filter by organization if organizationId is provided (for multi-tenant security)
    if (organizationId) {
      conditions.push(eq(users.organizationId, organizationId));
    }
    
    const activities = await db
      .select({
        id: auditLogs.id,
        type: auditLogs.action,
        description: auditLogs.details,
        user: users.username,
        timestamp: auditLogs.timestamp,
        entityType: auditLogs.entityType,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : sql`true`)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
    
    // Map to frontend format with severity
    const formattedActivities = activities.map(activity => {
      let severity: 'info' | 'warning' | 'error' | 'success' = 'info';
      
      if (activity.type?.toLowerCase().includes('delete') || activity.type?.toLowerCase().includes('suspend')) {
        severity = 'warning';
      } else if (activity.type?.toLowerCase().includes('error') || activity.type?.toLowerCase().includes('fail')) {
        severity = 'error';
      } else if (activity.type?.toLowerCase().includes('create') || activity.type?.toLowerCase().includes('success')) {
        severity = 'success';
      }
      
      return {
        id: activity.id,
        type: activity.entityType || 'system',
        description: activity.type || 'Unknown action',
        user: activity.user || 'System',
        timestamp: new Date(activity.timestamp!).toLocaleString(),
        severity
      };
    });
    
    res.json(formattedActivities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
});

// Staff Activity Monitor
router.get('/staff-activity', authenticateToken, requireAnyRole(['admin', 'super_admin', 'superadmin']), async (req: AuthRequest, res) => {
  try {
    const organizationId = req.user?.organizationId;
    
    const staffMembers = await db
      .select({
        id: users.id,
        name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        role: users.role,
        lastLoginAt: users.lastLoginAt,
        isActive: users.isActive
      })
      .from(users)
      .where(and(
        organizationId ? eq(users.organizationId, organizationId) : sql`true`,
        eq(users.isActive, true),
        sql`${users.role} != 'patient'`
      ))
      .orderBy(desc(users.lastLoginAt))
      .limit(20);
    
    // Determine online status based on last login
    const now = Date.now();
    const staffActivity = staffMembers.map(staff => {
      const lastActive = staff.lastLoginAt ? new Date(staff.lastLoginAt).getTime() : 0;
      const minutesSinceActive = (now - lastActive) / (1000 * 60);
      
      let status: 'online' | 'busy' | 'offline' = 'offline';
      if (minutesSinceActive < 15) {
        status = 'online';
      } else if (minutesSinceActive < 60) {
        status = 'busy';
      }
      
      return {
        id: staff.id,
        name: staff.name || 'Unknown',
        role: staff.role,
        status,
        tasksCompleted: Math.floor(Math.random() * 20), // Mock - calculate from actual task data
        currentTask: status === 'online' ? 'Working on patient records' : status === 'busy' ? 'In consultation' : 'Idle',
        lastActive: staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleString() : 'Never'
      };
    });
    
    res.json(staffActivity);
  } catch (error) {
    console.error("Error fetching staff activity:", error);
    res.status(500).json({ message: "Failed to fetch staff activity" });
  }
});

// 7-Day Trends
router.get('/trends/:period', authenticateToken, requireAnyRole(['admin', 'super_admin', 'superadmin']), async (req: AuthRequest, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const period = req.params.period || '7days';
    
    // Calculate date range
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 7;
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const [visitsResult] = await db
        .select({ count: count() })
        .from(visits)
        .where(and(
          organizationId ? eq(visits.organizationId, organizationId) : sql`true`,
          gte(visits.visitDate, date),
          sql`${visits.visitDate} < ${nextDate}`
        ));
      
      trends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visits: visitsResult.count || 0,
        revenue: Math.floor(Math.random() * 50000 + 20000), // Mock revenue
        patients: Math.floor(Math.random() * 30 + 10) // Mock new patients
      });
    }
    
    res.json(trends);
  } catch (error) {
    console.error("Error fetching trends:", error);
    res.status(500).json({ message: "Failed to fetch trends" });
  }
});

export default router;

