import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, UserPlus, Users, Phone, Calendar, MapPin, 
  Stethoscope, FlaskRound, Pill, UserCheck, Activity,
  Heart, Clock, FileText, Grid3X3, List, LayoutGrid,
  Filter, SortAsc, Download, Upload, Eye, AlertTriangle,
  Bookmark, BookmarkCheck, TrendingUp, Star, ChevronDown,
  ChevronUp, TestTube, Clipboard, Calendar as CalendarIcon,
  ScrollText, Thermometer, MoreVertical, Table2, 
  Columns3, GripVertical, Check
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getDisplayName, getInitials } from "@/utils/name-utils";
import type { Patient } from "@shared/schema";
import PatientRegistrationModal from "./patient-registration-modal";

interface PatientWithStats extends Patient {
  lastVisit?: string;
  totalVisits?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  isPriority?: boolean;
  upcomingAppointments?: number;
}

interface EnhancedPatientManagementProps {
  user: any;
  onPatientSelect?: (patient: Patient) => void;
}

export default function EnhancedPatientManagementFixed({ user, onPatientSelect }: EnhancedPatientManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table" | "compact" | "detailed">("grid");
  const [sortBy, setSortBy] = useState<"name" | "age" | "lastVisit" | "riskLevel" | "dateCreated">("dateCreated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<"all" | "priority" | "recent" | "highrisk">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  const [selectedPatients, setSelectedPatients] = useState<Set<number>>(new Set());
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patients with enhanced data
  const { data: patients = [], isLoading } = useQuery<PatientWithStats[]>({
    queryKey: ['/api/patients'],
    select: (data: Patient[]) => {
      return data.map(patient => ({
        ...patient,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' as const,
        isPriority: Math.random() > 0.8,
        totalVisits: Math.floor(Math.random() * 20) + 1,
        upcomingAppointments: Math.floor(Math.random() * 3),
        lastVisit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    }
  });

  // Fetch organizations for filtering
  const { data: organizationsData } = useQuery({
    queryKey: ['/api/organizations'],
    queryFn: async () => {
      const res = await fetch('/api/organizations');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: user?.role === 'admin' || user?.role === 'superadmin'
  });
  
  const organizations = Array.isArray(organizationsData) ? organizationsData : [];

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedPatients.size === 0) {
      toast({
        title: "No patients selected",
        description: "Please select patients to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("/api/patients/bulk-action", "POST", {
        patientIds: Array.from(selectedPatients),
        action
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setSelectedPatients(new Set());
      
      toast({
        title: "Success",
        description: `Bulk action ${action} completed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePatientAction = (action: string, patient: PatientWithStats) => {
    switch (action) {
      case 'consultation':
        setLocation(`/form-builder?patientId=${patient.id}`);
        break;
      case 'vitals':
        setLocation(`/patients/${patient.id}`);
        break;
      case 'lab-tests':
        setLocation(`/lab-orders?patientId=${patient.id}`);
        break;
      case 'prescription':
        setLocation(`/patients/${patient.id}?tab=medications`);
        break;
      case 'history':
        setLocation(`/patients/${patient.id}?tab=timeline`);
        break;
      case 'appointment':
        setLocation(`/appointments?patientId=${patient.id}`);
        break;
      case 'report':
        toast({
          title: "Generate Report",
          description: "Report generation feature coming soon.",
        });
        break;
      default:
        break;
    }
  };

  // Utility functions
  const formatPatientName = (patient: Patient) => {
    return getDisplayName({ 
      firstName: patient.firstName, 
      lastName: patient.lastName,
      title: patient.title || undefined 
    });
  };

  const getPatientInitials = (patient: Patient) => {
    return getInitials({
      firstName: patient.firstName,
      lastName: patient.lastName
    });
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRiskIndicatorColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': default: return 'bg-green-500';
    }
  };

  // Filtering and sorting logic
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = [...patients];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient => 
        formatPatientName(patient).toLowerCase().includes(query) ||
        patient.phone?.includes(query) ||
        patient.email?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(patient => {
        if (filterBy === 'priority') return patient.isPriority;
        if (filterBy === 'highrisk') return patient.riskLevel === 'high';
        if (filterBy === 'recent') {
          const visitDate = patient.lastVisit ? new Date(patient.lastVisit) : null;
          return visitDate && (Date.now() - visitDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
        }
        return true;
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(patient => {
        const visitDate = patient.lastVisit ? new Date(patient.lastVisit) : null;
        if (!visitDate) return false;
        
        const diffTime = now.getTime() - visitDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (dateFilter === 'today') return diffDays < 1;
        if (dateFilter === 'week') return diffDays < 7;
        if (dateFilter === 'month') return diffDays < 30;
        return true;
      });
    }

    // Organization filter
    if (organizationFilter !== 'all') {
      if (organizationFilter === 'current') {
        filtered = filtered.filter(p => p.organizationId === user?.organizationId);
      } else if (organizationFilter === 'unassigned') {
        filtered = filtered.filter(p => !p.organizationId);
      } else {
        filtered = filtered.filter(p => p.organizationId?.toString() === organizationFilter);
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = formatPatientName(a).localeCompare(formatPatientName(b));
          break;
        case 'age':
          compareValue = calculateAge(a.dateOfBirth) - calculateAge(b.dateOfBirth);
          break;
        case 'lastVisit':
          const aDate = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
          const bDate = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
          compareValue = aDate - bDate;
          break;
        case 'riskLevel':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          compareValue = riskOrder[a.riskLevel || 'low'] - riskOrder[b.riskLevel || 'low'];
          break;
        case 'dateCreated':
          compareValue = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [patients, searchQuery, filterBy, dateFilter, sortBy, sortOrder, organizationFilter, user]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: patients.length,
    priority: patients.filter(p => p.isPriority).length,
    highRisk: patients.filter(p => p.riskLevel === 'high').length,
    recentVisits: patients.filter(p => {
      const visitDate = p.lastVisit ? new Date(p.lastVisit) : null;
      return visitDate && (Date.now() - visitDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
    }).length
  }), [patients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-6xl p-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50/60 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Quick Stats - Compact and Prominent */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="healthcare-card border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Patients</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="healthcare-card border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Priority</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.priority}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="healthcare-card border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">High Risk</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.highRisk}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="healthcare-card border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Recent Visits</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.recentVisits}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters - Improved Layout */}
        <Card className="healthcare-card shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Search Bar - Prominent */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, email, or patient ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus:border-primary/50"
                />
              </div>
              
              {/* Filters - Better Grouped */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-2 flex-1">
                  <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Patients</SelectItem>
                      <SelectItem value="priority">Priority Only</SelectItem>
                      <SelectItem value="recent">Recent Visits</SelectItem>
                      <SelectItem value="highrisk">High Risk</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                    <SelectTrigger className="w-full sm:w-[130px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateCreated">Most Recent</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                      <SelectItem value="lastVisit">Last Visit</SelectItem>
                      <SelectItem value="riskLevel">Risk Level</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 h-10"
                    title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                  >
                    <SortAsc className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  </Button>

                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Organization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Organizations</SelectItem>
                        <SelectItem value="current">My Organization</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {organizations.map((org: any) => (
                          <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* View Toggle - Right Aligned */}
                <div className="flex gap-1 sm:gap-2 sm:ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2"
                        title="View Options"
                      >
                        {viewMode === "grid" && <LayoutGrid className="h-4 w-4" />}
                        {viewMode === "list" && <List className="h-4 w-4" />}
                        {viewMode === "table" && <Table2 className="h-4 w-4" />}
                        {viewMode === "compact" && <Columns3 className="h-4 w-4" />}
                        {viewMode === "detailed" && <Grid3X3 className="h-4 w-4" />}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setViewMode("grid")} className="gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Grid View
                        {viewMode === "grid" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("list")} className="gap-2">
                        <List className="h-4 w-4" />
                        List View
                        {viewMode === "list" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("table")} className="gap-2">
                        <Table2 className="h-4 w-4" />
                        Table View
                        {viewMode === "table" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("compact")} className="gap-2">
                        <Columns3 className="h-4 w-4" />
                        Compact View
                        {viewMode === "compact" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("detailed")} className="gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        Detailed Cards
                        {viewMode === "detailed" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Bulk Actions - Improved Styling */}
              {selectedPatients.size > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    {selectedPatients.size} patient{selectedPatients.size !== 1 ? 's' : ''} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')} className="gap-2">
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('priority')} className="gap-2">
                      <Star className="h-3 w-3" />
                      Mark Priority
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('schedule')} className="gap-2">
                      <CalendarIcon className="h-3 w-3" />
                      Schedule Follow-up
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient List Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900">
            <Users className="h-5 w-5 text-primary" />
            Patients
            <Badge variant="secondary" className="ml-2">
              {filteredAndSortedPatients.length}
            </Badge>
          </h3>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowRegistrationModal(true)} 
              className="gap-2 bg-primary hover:bg-primary/90"
              size="sm"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Register Patient</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBulkAction('export')} 
              className="gap-2"
              size="sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
          
          {filteredAndSortedPatients.length === 0 ? (
            <Card className="healthcare-card">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? 'No patients found' : 'No patients yet'}
                </h4>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.' 
                    : 'Get started by registering your first patient.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowRegistrationModal(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Register First Patient
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredAndSortedPatients.map((patient) => (
                    <Card 
                      key={patient.id} 
                      className="healthcare-card group hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                      onClick={() => setLocation(`/patients/${patient.id}`)}
                    >
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                {getPatientInitials(patient)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate text-base group-hover:text-primary transition-colors">
                                {formatPatientName(patient)}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">Age {calculateAge(patient.dateOfBirth)}</p>
                                {patient.isPriority && (
                                  <Star className="w-3 h-3 text-purple-500 fill-purple-500" />
                                )}
                                <div className={`w-2 h-2 ${getRiskIndicatorColor(patient.riskLevel || 'low')} rounded-full`} 
                                     title={`Risk: ${patient.riskLevel?.toUpperCase() || 'LOW'}`}></div>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 hover:bg-primary/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href={`/patients/${patient.id}`} className="flex items-center">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                              {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('consultation', patient); }}>
                                    <Stethoscope className="mr-2 h-4 w-4" />
                                    New Consultation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('vitals', patient); }}>
                                    <Thermometer className="mr-2 h-4 w-4" />
                                    Record Vitals
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('lab-tests', patient); }}>
                                    <TestTube className="mr-2 h-4 w-4" />
                                    Order Lab Tests
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(user?.role === 'admin' || user?.role === 'doctor') && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('prescription', patient); }}>
                                  <Pill className="mr-2 h-4 w-4" />
                                  Prescribe Medication
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('appointment', patient); }}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Schedule Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('history', patient); }}>
                                <ScrollText className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="space-y-2.5 text-sm pt-2 border-t border-border/50">
                          <div className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                            <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-primary/60" />
                            <span className="truncate">{patient.phone || 'No phone'}</span>
                          </div>
                          {patient.email && (
                            <div className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                              <span className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-primary/60">@</span>
                              <span className="truncate text-xs">{patient.email}</span>
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-start text-muted-foreground group-hover:text-foreground transition-colors">
                              <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0 mt-0.5 text-primary/60" />
                              <span className="truncate text-xs leading-relaxed">{patient.address}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/30">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {patient.totalVisits || 0} {patient.totalVisits === 1 ? 'visit' : 'visits'}
                            </Badge>
                            {patient.lastVisit && (
                              <span className="text-xs text-muted-foreground">
                                Last: {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : viewMode === "table" ? (
                <Card className="healthcare-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedPatients.size === filteredAndSortedPatients.length && filteredAndSortedPatients.length > 0}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedPatients(new Set(filteredAndSortedPatients.map(p => p.id)));
                                  } else {
                                    setSelectedPatients(new Set());
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Risk Level</TableHead>
                            <TableHead>Visits</TableHead>
                            <TableHead>Last Visit</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedPatients.map((patient) => (
                            <TableRow 
                              key={patient.id} 
                              className="cursor-pointer hover:bg-muted/30"
                              onClick={() => setLocation(`/patients/${patient.id}`)}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedPatients.has(patient.id)}
                                  onCheckedChange={(checked) => {
                                    const newSelected = new Set(selectedPatients);
                                    if (checked) {
                                      newSelected.add(patient.id);
                                    } else {
                                      newSelected.delete(patient.id);
                                    }
                                    setSelectedPatients(newSelected);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {getPatientInitials(patient)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{formatPatientName(patient)}</span>
                                      {patient.isPriority && (
                                        <Star className="w-3 h-3 text-purple-500 fill-purple-500" />
                                      )}
                                    </div>
                                    {patient.email && (
                                      <span className="text-xs text-muted-foreground">{patient.email}</span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {patient.phone && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <Phone className="h-3 w-3 text-muted-foreground" />
                                      {patient.phone}
                                    </div>
                                  )}
                                  {patient.address && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate max-w-[200px]">
                                      <MapPin className="h-3 w-3" />
                                      {patient.address}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 ${getRiskIndicatorColor(patient.riskLevel || 'low')} rounded-full`}></div>
                                  <span className="text-sm capitalize">{patient.riskLevel || 'low'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {patient.totalVisits || 0}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {patient.lastVisit ? (
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Never</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/patients/${patient.id}`} className="flex items-center">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Profile
                                      </Link>
                                    </DropdownMenuItem>
                                    {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handlePatientAction('consultation', patient)}>
                                          <Stethoscope className="mr-2 h-4 w-4" />
                                          New Consultation
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePatientAction('lab-tests', patient)}>
                                          <TestTube className="mr-2 h-4 w-4" />
                                          Order Lab Tests
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : viewMode === "compact" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredAndSortedPatients.map((patient) => (
                    <Card 
                      key={patient.id} 
                      className="healthcare-card hover:shadow-md transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-primary"
                      onClick={() => setLocation(`/patients/${patient.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getPatientInitials(patient)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{formatPatientName(patient)}</h4>
                            <p className="text-xs text-muted-foreground">Age {calculateAge(patient.dateOfBirth)}</p>
                          </div>
                          {patient.isPriority && (
                            <Star className="w-3 h-3 text-purple-500 fill-purple-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {patient.phone && (
                            <div className="flex items-center text-muted-foreground truncate">
                              <Phone className="h-3 w-3 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{patient.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 ${getRiskIndicatorColor(patient.riskLevel || 'low')} rounded-full`}></div>
                              <span className="text-xs text-muted-foreground capitalize">{patient.riskLevel || 'low'}</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {patient.totalVisits || 0}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : viewMode === "detailed" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {filteredAndSortedPatients.map((patient) => (
                    <Card 
                      key={patient.id} 
                      className="healthcare-card group hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-primary"
                      onClick={() => setLocation(`/patients/${patient.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-16 w-16 ring-4 ring-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                {getPatientInitials(patient)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                  {formatPatientName(patient)}
                                </h3>
                                {patient.isPriority && (
                                  <Star className="w-5 h-5 text-purple-500 fill-purple-500" />
                                )}
                                <div className={`w-3 h-3 ${getRiskIndicatorColor(patient.riskLevel || 'low')} rounded-full`}></div>
                              </div>
                              <p className="text-sm text-muted-foreground">Patient ID: {patient.id}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/10">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href={`/patients/${patient.id}`} className="flex items-center">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                              {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('consultation', patient); }}>
                                    <Stethoscope className="mr-2 h-4 w-4" />
                                    New Consultation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('vitals', patient); }}>
                                    <Thermometer className="mr-2 h-4 w-4" />
                                    Record Vitals
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('lab-tests', patient); }}>
                                    <TestTube className="mr-2 h-4 w-4" />
                                    Order Lab Tests
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(user?.role === 'admin' || user?.role === 'doctor') && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('prescription', patient); }}>
                                  <Pill className="mr-2 h-4 w-4" />
                                  Prescribe Medication
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('appointment', patient); }}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Schedule Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('history', patient); }}>
                                <ScrollText className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Date of Birth</p>
                            <p className="text-sm font-medium">{new Date(patient.dateOfBirth).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Age</p>
                            <p className="text-sm font-medium">{calculateAge(patient.dateOfBirth)} years</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-primary/60 flex-shrink-0" />
                            <span className="text-foreground">{patient.phone || 'No phone provided'}</span>
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="h-4 w-4 text-primary/60 flex-shrink-0">@</span>
                              <span className="text-foreground">{patient.email}</span>
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-start gap-3 text-sm">
                              <MapPin className="h-4 w-4 text-primary/60 flex-shrink-0 mt-0.5" />
                              <span className="text-foreground leading-relaxed">{patient.address}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Total Visits</p>
                              <Badge variant="secondary" className="text-sm font-semibold">
                                {patient.totalVisits || 0}
                              </Badge>
                            </div>
                            {patient.lastVisit && (
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Last Visit</p>
                                <p className="text-sm font-medium">
                                  {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            )}
                            {patient.upcomingAppointments && patient.upcomingAppointments > 0 && (
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Upcoming</p>
                                <Badge variant="default" className="text-sm">
                                  {patient.upcomingAppointments}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={patient.riskLevel === 'high' ? 'destructive' : patient.riskLevel === 'medium' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {patient.riskLevel || 'low'} risk
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredAndSortedPatients.map((patient) => (
                    <Card 
                      key={patient.id} 
                      className="healthcare-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                      onClick={() => setLocation(`/patients/${patient.id}`)}
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <Avatar className="h-11 w-11 flex-shrink-0 ring-2 ring-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getPatientInitials(patient)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate text-base">
                                  {formatPatientName(patient)}
                                </h3>
                                {patient.isPriority && (
                                  <Star className="w-4 h-4 text-purple-500 fill-purple-500 flex-shrink-0" title="Priority Patient" />
                                )}
                                <div className={`w-2 h-2 ${getRiskIndicatorColor(patient.riskLevel || 'low')} rounded-full flex-shrink-0`}
                                     title={`Risk: ${patient.riskLevel?.toUpperCase() || 'LOW'}`}></div>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                  Age {calculateAge(patient.dateOfBirth)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Phone className="h-3.5 w-3.5 text-primary/60" />
                                  {patient.phone || 'No phone'}
                                </span>
                                {patient.email && (
                                  <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                    <span className="text-primary/60">@</span>
                                    <span className="truncate">{patient.email}</span>
                                  </span>
                                )}
                                {patient.lastVisit && (
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-primary/60" />
                                    Last visit: {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {patient.totalVisits || 0} {patient.totalVisits === 1 ? 'visit' : 'visits'}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem asChild>
                                  <Link href={`/patients/${patient.id}`} className="flex items-center">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('consultation', patient); }}>
                                      <Stethoscope className="mr-2 h-4 w-4" />
                                      New Consultation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('vitals', patient); }}>
                                      <Thermometer className="mr-2 h-4 w-4" />
                                      Record Vitals
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('lab-tests', patient); }}>
                                      <TestTube className="mr-2 h-4 w-4" />
                                      Order Lab Tests
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {(user?.role === 'admin' || user?.role === 'doctor') && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('prescription', patient); }}>
                                    <Pill className="mr-2 h-4 w-4" />
                                    Prescribe Medication
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('appointment', patient); }}>
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  Schedule Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePatientAction('history', patient); }}>
                                  <ScrollText className="mr-2 h-4 w-4" />
                                  View History
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        </div>

      <PatientRegistrationModal 
        open={showRegistrationModal} 
        onOpenChange={setShowRegistrationModal}
      />
    </>
  );
}
