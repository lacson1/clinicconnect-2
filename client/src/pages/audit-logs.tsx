import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Shield, 
  User, 
  Clock, 
  Eye, 
  FileText,
  Download,
  Filter,
  Calendar
} from "lucide-react";
import { RoleGuard } from "@/components/role-guard";

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  user?: {
    username: string;
    role: string;
  };
}

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit-logs', searchTerm, actionFilter, entityTypeFilter, userFilter],
    enabled: true
  });

  // Get unique values for filters
  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));
  const uniqueEntityTypes = Array.from(new Set(auditLogs.map(log => log.entityType)));
  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.user?.username).filter(Boolean)));

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntityType = entityTypeFilter === "all" || log.entityType === entityTypeFilter;
    const matchesUser = userFilter === "all" || log.user?.username === userFilter;

    return matchesSearch && matchesAction && matchesEntityType && matchesUser;
  });

  const getActionColor = (action: string) => {
    if (action.includes("Created")) return "bg-green-100 text-green-800";
    if (action.includes("Updated")) return "bg-blue-100 text-blue-800";
    if (action.includes("Viewed")) return "bg-gray-100 text-gray-800";
    if (action.includes("Deleted")) return "bg-red-100 text-red-800";
    if (action.includes("Login")) return "bg-purple-100 text-purple-800";
    return "bg-slate-100 text-slate-800";
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "patient": return "👤";
      case "visit": return "🏥";
      case "prescription": return "💊";
      case "lab_result": return "🧪";
      case "medicine": return "💉";
      case "user": return "👨‍⚕️";
      case "referral": return "📋";
      default: return "📄";
    }
  };

  const exportAuditLogs = () => {
    const csvContent = [
      "Timestamp,User,Action,Entity Type,Entity ID,IP Address,Details",
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user?.username || "Unknown",
        log.action,
        log.entityType,
        log.entityId || "",
        log.ipAddress || "",
        log.details ? JSON.stringify(log.details) : ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RoleGuard allowedRoles={['admin']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Access Restricted</h3>
          <p className="text-slate-500">Only administrators can view audit logs</p>
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-primary" />
              Security Audit Logs
            </h1>
            <p className="text-slate-600 mt-2">
              Complete activity trail for regulatory compliance and security monitoring
            </p>
          </div>
          <Button onClick={exportAuditLogs} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search actions, users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Action
                </label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Entity Type
                </label>
                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {uniqueEntityTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {getEntityIcon(type)} {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  User
                </label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {uniqueUsers.map(username => (
                      <SelectItem key={username} value={username!}>{username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setActionFilter("all");
                    setEntityTypeFilter("all");
                    setUserFilter("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Activity Log ({filteredLogs.length} entries)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">No audit logs found</h3>
                <p className="text-slate-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          <span className="text-sm text-slate-600">
                            {getEntityIcon(log.entityType)} {log.entityType.replace('_', ' ')}
                            {log.entityId && ` #${log.entityId}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {log.user?.username || "Unknown"} ({log.user?.role || "Unknown role"})
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          {log.ipAddress && (
                            <div className="text-xs text-slate-500">
                              IP: {log.ipAddress}
                            </div>
                          )}
                        </div>

                        {log.details && (
                          <div className="mt-2 text-xs text-slate-600 bg-slate-100 p-2 rounded">
                            <strong>Details:</strong> {log.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}