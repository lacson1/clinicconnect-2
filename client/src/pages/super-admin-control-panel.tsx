import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Database, 
  Settings, 
  Users, 
  Building2, 
  Key, 
  AlertTriangle,
  Activity,
  Lock,
  Unlock,
  UserX,
  RefreshCw,
  Download,
  Upload,
  Server,
  Bell,
  Eye,
  Ban,
  Play,
  Pause,
  Trash2,
  UserPlus,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Zap,
  Clock
} from "lucide-react";
import GlobalPatientStatistics from '@/components/global-patient-statistics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminControlPanel() {
  const [systemMaintenance, setSystemMaintenance] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceDuration, setMaintenanceDuration] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch organizations data
  const { data: organizations = [], isLoading: organizationsLoading } = useQuery({
    queryKey: ['/api/organizations'],
  });

  // Fetch system analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/superadmin/analytics'],
  });

  // Fetch system health
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/superadmin/analytics/system-health'],
  });

  // Fetch features
  const { data: features = [], isLoading: featuresLoading } = useQuery({
    queryKey: ['/api/superadmin/features'],
  });

  // Maintenance mode mutation
  const maintenanceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/superadmin/system/maintenance', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Maintenance Mode Updated",
        description: "System maintenance mode has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update maintenance mode",
        variant: "destructive",
      });
    },
  });

  // Backup creation mutation
  const backupMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/superadmin/data/backup', 'POST', data),
    onSuccess: (data: any) => {
      toast({
        title: "Backup Initiated",
        description: `Backup ${data.backupId} has been started`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate backup",
        variant: "destructive",
      });
    },
  });

  // Feature toggle mutation
  const featureMutation = useMutation({
    mutationFn: ({ featureId, enabled }: { featureId: string; enabled: boolean }) => 
      apiRequest(`/api/superadmin/features/${featureId}`, 'PATCH', { enabled }),
    onSuccess: () => {
      toast({
        title: "Feature Updated",
        description: "Feature toggle has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/features'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update feature",
        variant: "destructive",
      });
    },
  });

  const handleMaintenanceToggle = () => {
    const enabled = !systemMaintenance;
    setSystemMaintenance(enabled);
    
    maintenanceMutation.mutate({
      enabled,
      message: maintenanceMessage || 'System maintenance in progress',
      estimatedDuration: maintenanceDuration || '30 minutes'
    });
  };

  const handleBackup = (backupType: string) => {
    backupMutation.mutate({
      backupType,
      includeFiles: true
    });
  };

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    featureMutation.mutate({ featureId, enabled });
  };

  // Organization management handlers
  const handleCreateOrganization = () => {
    toast({
      title: "Create Organization",
      description: "Organization creation modal would open here",
    });
  };

  const handleManageSuspensions = () => {
    toast({
      title: "Manage Suspensions",
      description: "Organization suspension management interface would open here",
    });
  };

  const handleGlobalPolicies = () => {
    toast({
      title: "Global Policies",
      description: "Global policy configuration panel would open here",
    });
  };

  // User management handlers
  const handleLockAccount = () => {
    toast({
      title: "Account Control",
      description: "User account locking interface would open here",
    });
  };

  const handleResetPassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset interface would open here",
    });
  };

  const handleImpersonateUser = () => {
    toast({
      title: "User Impersonation",
      description: "User impersonation interface would open here",
    });
  };

  // Data management handlers
  const handleImportData = () => {
    toast({
      title: "Import Data",
      description: "Data import interface would open here",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Data", 
      description: "Data export interface would open here",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-600">Super Admin Control Panel</h1>
          <p className="text-muted-foreground">System-wide controls and administrative functions</p>
        </div>
        <Badge variant="destructive" className="text-sm">
          <Shield className="w-4 h-4 mr-1" />
          SYSTEM ADMIN
        </Badge>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="users">User Control</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data Control</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Organization Management */}
        <TabsContent value="organizations" className="space-y-4">
          {/* Organization Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Organizations</p>
                    <p className="text-2xl font-bold">{analyticsLoading ? '...' : (analytics as any)?.totalOrganizations || 0}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Organizations</p>
                    <p className="text-2xl font-bold text-green-600">{analyticsLoading ? '...' : analytics?.activeOrganizations || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{analyticsLoading ? '...' : analytics?.totalUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                    <p className="text-2xl font-bold">{analyticsLoading ? '...' : analytics?.totalPatients || 0}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-cyan-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organization Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Create Organization
                </CardTitle>
                <CardDescription>Add new healthcare organizations to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleCreateOrganization} className="w-full">Create New Organization</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="w-5 h-5" />
                  Suspend Organizations
                </CardTitle>
                <CardDescription>Temporarily disable organization access</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleManageSuspensions} variant="destructive" className="w-full">Manage Suspensions</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Organization Settings
                </CardTitle>
                <CardDescription>Configure global organization policies</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGlobalPolicies} variant="outline" className="w-full">Global Policies</Button>
              </CardContent>
            </Card>
          </div>

          {/* Organizations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organizations Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {organizationsLoading ? (
                <div className="text-center py-8">Loading organizations...</div>
              ) : (
                <div className="space-y-4">
                  {organizations.map((org: any) => (
                    <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{org.name}</h3>
                          <p className="text-sm text-muted-foreground">{org.type} • {org.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={org.isActive ? "default" : "secondary"}>
                          {org.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Control */}
        <TabsContent value="system" className="space-y-4">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">System Status</p>
                    <p className="text-2xl font-bold text-green-600">Operational</p>
                  </div>
                  <Server className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold">{healthLoading ? '...' : Math.floor((systemHealth?.uptime || 0) / 3600)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                    <p className="text-2xl font-bold">{healthLoading ? '...' : systemHealth?.activeConnections || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                System Maintenance Mode
              </CardTitle>
              <CardDescription>Control system-wide maintenance and scheduled downtime</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Maintenance Mode</h3>
                  <p className="text-sm text-muted-foreground">Temporarily disable user access for system maintenance</p>
                </div>
                <Switch
                  checked={systemMaintenance}
                  onCheckedChange={handleMaintenanceToggle}
                  disabled={maintenanceMutation.isPending}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    placeholder="System is undergoing scheduled maintenance..."
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maintenance-duration">Estimated Duration</Label>
                  <Input
                    id="maintenance-duration"
                    placeholder="30 minutes"
                    value={maintenanceDuration}
                    onChange={(e) => setMaintenanceDuration(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Feature Management
              </CardTitle>
              <CardDescription>Enable or disable system features across all organizations</CardDescription>
            </CardHeader>
            <CardContent>
              {featuresLoading ? (
                <div className="text-center py-8">Loading features...</div>
              ) : (
                <div className="space-y-4">
                  {features.map((feature: any) => (
                    <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(enabled) => handleFeatureToggle(feature.id, enabled)}
                        disabled={featureMutation.isPending}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Control */}
        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  System Backup
                </CardTitle>
                <CardDescription>Create comprehensive system backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleBackup('full')}
                  disabled={backupMutation.isPending}
                  className="w-full"
                >
                  {backupMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Create Full Backup
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => handleBackup('database')}
                  disabled={backupMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Database Only
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Data Migration
                </CardTitle>
                <CardDescription>Import and export system data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleImportData} variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
                
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Memory Usage:</span>
                      <span className="text-sm font-medium">
                        {Math.round((systemHealth?.memoryUsage?.used || 0) / 1024 / 1024)}MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time:</span>
                      <span className="text-sm font-medium">{systemHealth?.responseTime || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Error Rate:</span>
                      <span className="text-sm font-medium">{((systemHealth?.errorRate || 0) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU Usage:</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Disk Usage:</span>
                    <span className="text-sm font-medium">{systemHealth?.diskUsage?.percentage || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Network I/O:</span>
                    <span className="text-sm font-medium">Normal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    All systems operational
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Scheduled maintenance: None
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Last backup: {systemHealth?.lastBackup ? new Date(systemHealth.lastBackup).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Control */}
        <TabsContent value="users" className="space-y-4">
          {/* User Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>Search and manage user accounts across all organizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search users by username, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Account Control
                </CardTitle>
                <CardDescription>Lock or unlock user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleLockAccount} variant="destructive" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Lock Account
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password Reset
                </CardTitle>
                <CardDescription>Force password reset for user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleResetPassword} variant="outline" className="w-full">
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  Impersonate Users
                </CardTitle>
                <CardDescription>Login as any user for troubleshooting</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleImpersonateUser} variant="outline" className="w-full">
                  <UserX className="w-4 h-4 mr-2" />
                  Impersonate User
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Account Controls
                </CardTitle>
                <CardDescription>Lock/unlock user accounts system-wide</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">Account Management</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Password Resets
                </CardTitle>
                <CardDescription>Force password resets for any user</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Password Controls</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Controls */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Maintenance Mode
                </CardTitle>
                <CardDescription>Enable system-wide maintenance mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Maintenance Mode</span>
                  <Switch 
                    checked={systemMaintenance} 
                    onCheckedChange={setSystemMaintenance}
                  />
                </div>
                <Button variant="destructive" className="w-full" disabled={!systemMaintenance}>
                  Activate Maintenance
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  System Restart
                </CardTitle>
                <CardDescription>Restart system services and clear caches</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">Restart System</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Feature Toggles
                </CardTitle>
                <CardDescription>Enable/disable features system-wide</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Manage Features</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  System Announcements
                </CardTitle>
                <CardDescription>Send notifications to all organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Create Announcement</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Controls */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Session Monitoring
                </CardTitle>
                <CardDescription>View and control active user sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Sessions</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Policies
                </CardTitle>
                <CardDescription>Configure global security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Security Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Audit Controls
                </CardTitle>
                <CardDescription>Configure system-wide audit logging</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Audit Configuration</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  System Backup
                </CardTitle>
                <CardDescription>Create full system backups</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Create Backup</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Data Migration
                </CardTitle>
                <CardDescription>Import/export data between systems</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Migration Tools</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Controls
                </CardTitle>
                <CardDescription>Direct database management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">Database Admin</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Data Cleanup
                </CardTitle>
                <CardDescription>Clean up orphaned or old data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Cleanup Tools</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health
                </CardTitle>
                <CardDescription>Monitor system performance and health</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Health Dashboard</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Activity
                </CardTitle>
                <CardDescription>Track user activity across all organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Activity Monitor</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Logs
                </CardTitle>
                <CardDescription>View and analyze system logs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Log Viewer</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}