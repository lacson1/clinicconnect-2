import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, Filter, Calendar, User, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("");

  const { data: logs = [], isLoading, error } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
  });

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesEntity = !entityFilter || log.entityType === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionIcon = (action: string) => {
    if (action.includes("Created") || action.includes("Added")) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (action.includes("Updated") || action.includes("Modified")) {
      return <Activity className="h-4 w-4 text-blue-600" />;
    }
    if (action.includes("Deleted") || action.includes("Removed")) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    return <Shield className="h-4 w-4 text-gray-600" />;
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("Created") || action.includes("Added")) return "bg-green-100 text-green-800";
    if (action.includes("Updated") || action.includes("Modified")) return "bg-blue-100 text-blue-800";
    if (action.includes("Deleted") || action.includes("Removed")) return "bg-red-100 text-red-800";
    if (action.includes("Login") || action.includes("Access")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const getEntityBadgeColor = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "patient": return "bg-teal-100 text-teal-800";
      case "user": return "bg-indigo-100 text-indigo-800";
      case "visit": return "bg-orange-100 text-orange-800";
      case "prescription": return "bg-pink-100 text-pink-800";
      case "lab": return "bg-cyan-100 text-cyan-800";
      case "system": return "bg-gray-100 text-gray-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  // Get unique actions and entities for filters
  const uniqueActions = Array.from(new Set(logs.map(log => log.action))).sort();
  const uniqueEntities = Array.from(new Set(logs.map(log => log.entityType))).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load audit logs</p>
          <p className="text-gray-600 text-sm">Please check your permissions and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3 h-8 w-8 text-teal-600" />
            Audit Logs
          </h1>
          <p className="text-gray-600 mt-1">Monitor system activities and maintain compliance</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredLogs.length} of {logs.length} records
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Entities</SelectItem>
                {uniqueEntities.map(entity => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setActionFilter("");
                setEntityFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No audit logs found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm || actionFilter || entityFilter 
                    ? "Try adjusting your filters to see more results"
                    : "System activities will appear here as they occur"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getActionIcon(log.action)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline" className={getEntityBadgeColor(log.entityType)}>
                          {log.entityType}
                        </Badge>
                        {log.entityId && (
                          <Badge variant="outline" className="text-xs">
                            ID: {log.entityId}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4 mb-2">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          User ID: {log.userId}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(log.timestamp), "MMM dd, yyyy 'at' HH:mm:ss")}
                        </span>
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="bg-gray-50 rounded-md p-3 mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Details:</p>
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.ipAddress && (
                        <div className="text-xs text-gray-500 mt-2">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredLogs.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          Showing {filteredLogs.length} audit log entries
        </div>
      )}
    </div>
  );
}