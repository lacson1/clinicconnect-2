// Admin Dashboard Enhanced - System Management and Monitoring
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  UserPlus,
  FileText,
  Download,
  RefreshCw,
  Bell,
  Settings,
  BarChart3,
  Stethoscope,
  Pill,
  FlaskRound,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  WifiOff
} from "lucide-react";
import { Link } from "wouter";
import { useRole } from "@/components/role-guard";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { exportDashboardStats, exportActivityLog, exportStaffActivity } from "@/utils/export-utils";

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  dbConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
  apiCallsLastHour: number;
  errorRate: number;
}

interface DashboardStats {
  totalPatients: number;
  patientsChange: number;
  todayVisits: number;
  visitsChange: number;
  pendingLabs: number;
  labsChange: number;
  lowStockItems: number;
  stockChange: number;
  activeStaff: number;
  totalRevenue: number;
  revenueChange: number;
  appointmentsToday: number;
  completedAppointments: number;
  averageWaitTime: number;
  patientSatisfaction: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  user: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface StaffActivity {
  id: number;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  tasksCompleted: number;
  currentTask: string;
  lastActive: string;
}

export default function AdminDashboardEnhanced() {
  const { user } = useRole();
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default
  const [refreshInterval, setRefreshInterval] = useState(60000); // 60 seconds (was 30)
  const [filterAbsent, setFilterAbsent] = useState<'all' | 'absent'>('all');

  // Fetch system health - only poll if auto-refresh enabled
  const { data: systemHealth, refetch: refetchHealth } = useQuery<SystemHealth>({
    queryKey: ['/api/admin/system-health'],
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Fetch dashboard stats - only poll if auto-refresh enabled
  const { data: stats, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Fetch recent activity - only poll if auto-refresh enabled
  const { data: recentActivity = [] } = useQuery<RecentActivity[]>({
    queryKey: ['/api/admin/recent-activity', 100], // Request up to 100 activities
    queryFn: async () => {
      const response = await fetch('/api/admin/recent-activity?limit=100');
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      return response.json();
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Fetch staff activity - no auto-refresh, use manual refresh
  const { data: staffActivity = [] } = useQuery<StaffActivity[]>({
    queryKey: ['/api/admin/staff-activity'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch trend data for charts - static data, longer cache
  const { data: trendData = [] } = useQuery({
    queryKey: ['/api/admin/trends', '7days'],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const handleRefresh = () => {
    refetchHealth();
    refetchStats();
  };

  const handleExportStats = () => {
    if (stats) {
      exportDashboardStats(stats);
    }
  };

  const handleExportActivity = () => {
    if (recentActivity) {
      exportActivityLog(recentActivity);
    }
  };

  const handleExportStaffActivity = () => {
    if (staffActivity) {
      exportStaffActivity(staffActivity);
    }
  };

  // Filter staff activity based on absent filter
  const filteredStaffActivity = filterAbsent === 'absent' 
    ? staffActivity.filter(staff => staff.status === 'offline')
    : staffActivity;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'busy':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
      case 'error':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'critical':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-blue-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      {/* Enhanced Header */}
      <div className="healthcare-header px-6 py-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Administrator Dashboard
              </h1>
              <p className="text-white/90 text-lg">
                Welcome back, {user?.username} • Real-time System Overview
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`${autoRefresh ? 'bg-green-500/20 border-green-300/50' : 'bg-white/20 border-white/30'} text-white hover:bg-white/30`}
              >
                {autoRefresh ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
                Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportStats}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Stats
              </Button>
              <Link href="/settings">
                <Button variant="outline" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* System Health Status Bar */}
        <Card className={`border-2 ${systemHealth?.status === 'healthy' ? 'border-green-200 bg-green-50/50' : systemHealth?.status === 'warning' ? 'border-orange-200 bg-orange-50/50' : 'border-red-200 bg-red-50/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(systemHealth?.status || 'healthy')}
                <div>
                  <h3 className="font-semibold text-lg">System Status: {systemHealth?.status?.toUpperCase() || 'HEALTHY'}</h3>
                  <p className="text-sm text-muted-foreground">
                    Uptime: {formatUptime(systemHealth?.uptime || 0)} • Response Time: {systemHealth?.responseTime || 0}ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{systemHealth?.activeUsers || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{systemHealth?.apiCallsLastHour || 0}</p>
                  <p className="text-xs text-muted-foreground">API Calls/Hour</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{systemHealth?.errorRate?.toFixed(2) || 0}%</p>
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                </div>
              </div>
            </div>
            
            {/* Resource Usage Bars */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">CPU Usage</span>
                  <span className="text-xs text-muted-foreground">{systemHealth?.cpuUsage || 0}%</span>
                </div>
                <Progress value={systemHealth?.cpuUsage || 0} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Memory Usage</span>
                  <span className="text-xs text-muted-foreground">{systemHealth?.memoryUsage || 0}%</span>
                </div>
                <Progress value={systemHealth?.memoryUsage || 0} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">DB Connections</span>
                  <span className="text-xs text-muted-foreground">{systemHealth?.dbConnections || 0}/100</span>
                </div>
                <Progress value={(systemHealth?.dbConnections || 0)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Patients */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stats?.totalPatients?.toLocaleString() || 0}</div>
                <div className={`flex items-center gap-1 text-sm ${(stats?.patientsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.patientsChange || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(stats?.patientsChange || 0)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">vs. last month</p>
            </CardContent>
          </Card>

          {/* Today's Visits */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Visits</CardTitle>
              <Stethoscope className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stats?.todayVisits || 0}</div>
                <div className={`flex items-center gap-1 text-sm ${(stats?.visitsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.visitsChange || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(stats?.visitsChange || 0)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stats?.completedAppointments || 0} completed</p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">₦{stats?.totalRevenue?.toLocaleString() || 0}</div>
                <div className={`flex items-center gap-1 text-sm ${(stats?.revenueChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.revenueChange || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(stats?.revenueChange || 0)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">vs. last month</p>
            </CardContent>
          </Card>

          {/* Active Staff */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Staff</CardTitle>
              <Activity className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stats?.activeStaff || 0}</div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Online
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Currently working</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>7-Day Patient Visits Trend</CardTitle>
                  <CardDescription>Daily patient visit statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Service Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Breakdown by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Consultations', value: 45 },
                          { name: 'Laboratory', value: 25 },
                          { name: 'Pharmacy', value: 20 },
                          { name: 'Procedures', value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2, 3].map((index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/user-management">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <UserPlus className="h-6 w-6" />
                      <span className="text-sm">Add User</span>
                    </Button>
                  </Link>
                  <Link href="/audit-logs">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">View Audit Logs</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Download className="h-6 w-6" />
                    <span className="text-sm">Export Report</span>
                  </Button>
                  <Link href="/settings">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                      <Settings className="h-6 w-6" />
                      <span className="text-sm">System Settings</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent System Activity</CardTitle>
                  <CardDescription>
                    {recentActivity.length > 0 
                      ? `Showing ${recentActivity.length} recent administrative actions`
                      : 'No recent activity'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportActivity}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {recentActivity.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recent activity</p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className={`p-2 rounded-full ${getStatusColor(activity.severity)}`}>
                          {getStatusIcon(activity.severity)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            by {activity.user} • {activity.timestamp}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(activity.type)}>
                          {activity.type}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Staff Activity Monitor</CardTitle>
                  <CardDescription>Real-time staff status and productivity</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={filterAbsent === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilterAbsent('all')}
                  >
                    All Staff
                  </Button>
                  <Button 
                    variant={filterAbsent === 'absent' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilterAbsent('absent')}
                  >
                    Absent Only
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportStaffActivity}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStaffActivity.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {filterAbsent === 'absent' ? 'No absent staff members' : 'No staff activity data'}
                    </p>
                  ) : (
                    filteredStaffActivity.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${staff.status === 'online' ? 'bg-green-500' : staff.status === 'busy' ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">{staff.role}</p>
                            <p className="text-xs text-muted-foreground">Last active: {staff.lastActive}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{staff.tasksCompleted} tasks completed</p>
                          <p className="text-xs text-muted-foreground">{staff.currentTask}</p>
                          {staff.status === 'offline' && (
                            <Badge variant="secondary" className="mt-1">Absent</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-orange-600">{stats?.lowStockItems || 0}</p>
                    <p className="text-sm text-muted-foreground">Items need restocking</p>
                    <Link href="/inventory">
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        View Inventory
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskRound className="h-5 w-5 text-red-600" />
                    Pending Lab Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-red-600">{stats?.pendingLabs || 0}</p>
                    <p className="text-sm text-muted-foreground">Results awaiting review</p>
                    <Link href="/laboratory">
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        View Lab Orders
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

