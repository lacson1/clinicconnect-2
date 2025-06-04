import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  TestTube, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Filter,
  Download,
  Search,
  Users,
  Activity,
  BarChart3,
  Settings,
  Upload,
  Plus,
  FileText,
  Microscope,
  Printer,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  User,
  FlaskRound,
  MoreVertical,
  ArrowUpDown,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

// Form schemas
const labOrderSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  tests: z.array(z.object({
    id: z.number(),
    name: z.string(),
    category: z.string()
  })).min(1, "At least one test is required"),
  clinicalNotes: z.string().optional(),
  priority: z.enum(["routine", "urgent", "stat"])
});

const resultEntrySchema = z.object({
  orderItemId: z.number(),
  value: z.string().min(1, "Result value is required"),
  units: z.string().optional(),
  referenceRange: z.string().optional(),
  status: z.enum(["normal", "abnormal", "critical"]),
  notes: z.string().optional()
});

// Type definitions
interface Patient {
  id: number;
  title?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
}

interface LabTest {
  id: number;
  name: string;
  category: string;
  description?: string;
  units?: string;
  referenceRange?: string;
}

interface LabOrderItem {
  id: number;
  labOrderId: number;
  labTestId: number;
  status: string;
  priority: string;
  result?: string;
  resultDate?: string;
  labTest: LabTest;
}

interface LabOrder {
  id: number;
  patientId: number;
  orderedBy: string;
  status: string;
  notes?: string;
  createdAt: string;
  patient: Patient;
  items: LabOrderItem[];
  totalCost?: number;
}

interface LabResult {
  id: number;
  orderItemId: number;
  value: string;
  units?: string;
  referenceRange?: string;
  status: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  orderItem: LabOrderItem & {
    labOrder: LabOrder;
  };
}

export default function LaboratoryUnified() {
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<LabOrderItem | null>(null);
  const [showCustomViewDialog, setShowCustomViewDialog] = useState(false);
  const [customViewSettings, setCustomViewSettings] = useState({
    showPatientInfo: true,
    showTestDetails: true,
    showTimestamps: true,
    showStatus: true,
    showPriority: true,
    showNotes: true,
    compactView: false,
    itemsPerPage: 10
  });

  const queryClient = useQueryClient();

  // Upload existing results mutation
  const uploadExistingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/lab-results/upload-existing', 'POST', {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-results/reviewed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lab-orders/enhanced'] });
      toast({ 
        title: "Existing lab results uploaded successfully", 
        description: `${data.count} results connected to the system` 
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload existing lab results", 
        variant: "destructive" 
      });
    }
  });

  // Upload existing results function
  const uploadExistingResults = () => {
    uploadExistingMutation.mutate();
  };

  // Print functionality
  const handlePrintOrder = (order: LabOrder) => {
    const printContent = generateLabOrderPrintContent(order);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const generateLabOrderPrintContent = (order: LabOrder) => {
    const patient = patients.find(p => p.id === order.patientId);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Order #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .patient-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
            .test-list { margin-bottom: 20px; }
            .test-item { border: 1px solid #ddd; padding: 10px; margin-bottom: 5px; }
            .footer { margin-top: 30px; border-top: 1px solid #333; padding-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laboratory Order</h1>
            <p>Order #${order.id} | Date: ${format(new Date(order.createdAt), 'PPP')}</p>
          </div>
          
          <div class="patient-info">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${patient?.firstName} ${patient?.lastName}</p>
            <p><strong>Phone:</strong> ${patient?.phone}</p>
            <p><strong>Date of Birth:</strong> ${patient?.dateOfBirth ? format(new Date(patient.dateOfBirth), 'PP') : 'N/A'}</p>
            <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
          </div>
          
          <div class="test-list">
            <h3>Ordered Tests</h3>
            ${order.items?.map(item => `
              <div class="test-item">
                <strong>${item.labTest?.name || 'Unknown Test'}</strong><br>
                <small>Category: ${item.labTest?.category || 'N/A'}</small><br>
                <small>Status: ${item.status}</small>
              </div>
            `).join('') || '<p>No tests found</p>'}
          </div>
          
          <div class="footer">
            <p><small>Generated on ${format(new Date(), 'PPP')} at ${format(new Date(), 'p')}</small></p>
          </div>
        </body>
      </html>
    `;
  };

  const generateLabResultPrintContent = (result: any) => {
    const patient = result.orderItem?.labOrder?.patient;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Result - ${result.orderItem?.labTest?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .patient-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
            .result-box { border: 2px solid #333; padding: 20px; margin: 20px 0; text-align: center; }
            .abnormal { border-color: #dc2626; background: #fef2f2; }
            .normal { border-color: #16a34a; background: #f0fdf4; }
            .footer { margin-top: 30px; border-top: 1px solid #333; padding-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laboratory Result</h1>
            <p>Test: ${result.orderItem?.labTest?.name || 'Unknown Test'}</p>
            <p>Date: ${format(new Date(result.createdAt), 'PPP')}</p>
          </div>
          
          <div class="patient-info">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${patient?.firstName} ${patient?.lastName}</p>
            <p><strong>Order ID:</strong> #${result.orderItem?.labOrder?.id}</p>
            <p><strong>Test Category:</strong> ${result.orderItem?.labTest?.category}</p>
          </div>
          
          <div class="result-box ${result.status === 'normal' ? 'normal' : 'abnormal'}">
            <h2>Test Result</h2>
            <p style="font-size: 24px; font-weight: bold;">${result.value} ${result.units}</p>
            <p><strong>Reference Range:</strong> ${result.referenceRange || 'N/A'}</p>
            <p><strong>Status:</strong> ${result.status.toUpperCase()}</p>
          </div>
          
          ${result.notes ? `
            <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #333;">
              <h4>Clinical Notes</h4>
              <p>${result.notes}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p><strong>Reviewed by:</strong> ${result.reviewedBy || 'Pending Review'}</p>
            <p><small>Generated on ${format(new Date(), 'PPP')} at ${format(new Date(), 'p')}</small></p>
          </div>
        </body>
      </html>
    `;
  };

  // Data queries
  const { data: labOrders = [], isLoading: ordersLoading } = useQuery<LabOrder[]>({
    queryKey: ['/api/lab-orders/enhanced']
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ['/api/patients']
  });

  const { data: labTests = [] } = useQuery<LabTest[]>({
    queryKey: ['/api/lab-tests']
  });

  const { data: labResults = [] } = useQuery<LabResult[]>({
    queryKey: ['/api/lab-results/reviewed']
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/lab-analytics']
  });

  // Forms
  const orderForm = useForm({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      patientId: "",
      tests: [],
      clinicalNotes: "",
      priority: "routine" as const
    }
  });

  const resultForm = useForm({
    resolver: zodResolver(resultEntrySchema),
    defaultValues: {
      orderItemId: 0,
      value: "",
      units: "",
      referenceRange: "",
      status: "normal" as const,
      notes: ""
    }
  });

  // Mutations
  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/lab-orders', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-orders/enhanced'] });
      setShowOrderDialog(false);
      orderForm.reset();
      toast({ title: "Lab order created successfully" });
    }
  });

  const submitResult = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/lab-results', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-orders/enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lab-results/reviewed'] });
      setShowResultDialog(false);
      resultForm.reset();
      setSelectedOrderItem(null);
      toast({ title: "Lab result submitted successfully" });
    }
  });

  // Filter data
  const filteredOrders = labOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      `${order.patient.firstName} ${order.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.labTest.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPatient = !selectedPatient || order.patientId === selectedPatient;
    const matchesCategory = categoryFilter === "all" || 
      (order.items && order.items.some(item => item.labTest?.category === categoryFilter));
    
    return matchesSearch && matchesStatus && matchesPatient && matchesCategory;
  });

  const filteredResults = labResults.filter(result => {
    const matchesSearch = !searchTerm || 
      `${result.orderItem?.labOrder?.patient?.firstName || ''} ${result.orderItem?.labOrder?.patient?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.orderItem?.labTest?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPatient = !selectedPatient || result.orderItem?.labOrder?.patientId === selectedPatient;
    const matchesCategory = categoryFilter === "all" || 
      result.orderItem?.labTest?.category === categoryFilter;
    
    return matchesSearch && matchesPatient && matchesCategory;
  });

  // Medical specialty categories for lab tests
  const medicalCategories = [
    'Hematology', 'Clinical Chemistry', 'Microbiology', 'Immunology', 
    'Endocrinology', 'Cardiology', 'Nephrology', 'Hepatology',
    'Oncology', 'Toxicology', 'Serology', 'Parasitology'
  ];

  // Test categories for filtering (from database + medical specialties)
  const testCategories = Array.from(new Set([
    ...labTests.map(test => test.category).filter(Boolean),
    ...medicalCategories
  ]));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'routine': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleOrderSubmit = (data: any) => {
    createOrder.mutate({
      patientId: parseInt(data.patientId),
      testIds: data.tests.map((test: any) => test.id),
      clinicalNotes: data.clinicalNotes,
      priority: data.priority
    });
  };

  const handleResultSubmit = (data: any) => {
    if (!selectedOrderItem) return;
    
    submitResult.mutate({
      ...data,
      orderItemId: selectedOrderItem.id
    });
  };

  const openResultDialog = (orderItem: LabOrderItem) => {
    setSelectedOrderItem(orderItem);
    resultForm.setValue('orderItemId', orderItem.id);
    resultForm.setValue('units', orderItem.labTest.units || '');
    resultForm.setValue('referenceRange', orderItem.labTest.referenceRange || '');
    setShowResultDialog(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Microscope className="w-8 h-8 text-blue-600" />
            </div>
            Laboratory Management
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive lab orders, results, and analytics</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowOrderDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lab Order
          </Button>
          <Button 
            onClick={uploadExistingResults}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Existing Results
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.metrics?.totalOrders || '0'}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TestTube className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.metrics?.completedOrders || '0'}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{analytics.metrics?.pendingOrders || '0'}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Results</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.metrics?.criticalResults || '0'}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Filters */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Laboratory Filters</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCustomViewDialog(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Settings className="w-4 h-4 mr-1" />
                Custom View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPatient(null);
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients, tests, or order numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Patient</Label>
              <Select value={selectedPatient?.toString() || "all"} onValueChange={(value) => setSelectedPatient(value === "all" ? null : parseInt(value))}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="All Patients" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      All Patients
                    </div>
                  </SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                          <div className="text-xs text-gray-500">{patient.phone}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-500" />
                      All Status
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="processing">
                    <div className="flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-blue-500" />
                      Processing
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Medical Specialty</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500">
                  <div className="flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="All Specialties" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Microscope className="w-4 h-4 text-gray-500" />
                      All Specialties
                    </div>
                  </SelectItem>
                  {testCategories.sort().map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600">
                            {category.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <FlaskRound className="w-4 h-4" />
            Lab Orders
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Lab Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {ordersLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading lab orders...</p>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lab orders found</h3>
                <p className="text-gray-600 mb-4">Create your first lab order to get started</p>
                <Button onClick={() => setShowOrderDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Lab Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {order.patient.title} {order.patient.firstName} {order.patient.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Order #{order.id} • {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getStatusColor(order.status)} variant="outline">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          {order.items && order.items.length > 0 && order.items[0] && (
                            <Badge className={getPriorityColor(order.items[0].priority)} variant="outline">
                              {order.items[0].priority.charAt(0).toUpperCase() + order.items[0].priority.slice(1)}
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {order.items?.length || 0} test{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.labTest?.name || 'Unknown Test'}</p>
                                <p className="text-sm text-gray-600">{item.labTest?.category || 'Unknown Category'}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(item.status)} variant="outline">
                                  {item.status}
                                </Badge>
                                
                                {item.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openResultDialog(item)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Result
                                  </Button>
                                )}
                                
                                {item.result && (
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{item.result}</p>
                                    {item.resultDate && (
                                      <p className="text-xs text-gray-500">
                                        {format(new Date(item.resultDate), 'MMM dd')}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {order.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Printer className="w-4 h-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {filteredResults.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Lab results will appear here once processed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {result.orderItem?.labOrder?.patient?.firstName || 'Unknown'} {result.orderItem?.labOrder?.patient?.lastName || 'Patient'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {result.orderItem?.labTest?.name || 'Unknown Test'} • Order #{result.orderItem?.labOrder?.id || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Result</p>
                            <p className="text-lg font-semibold text-gray-900">{result.value} {result.units}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Reference Range</p>
                            <p className="text-sm text-gray-700">{result.referenceRange || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Status</p>
                            <Badge className={
                              result.status === 'normal' ? 'bg-green-100 text-green-800' :
                              result.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {result.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {result.notes}
                            </p>
                          </div>
                        )}

                        {result.reviewedBy && (
                          <div className="mt-2 text-xs text-gray-500">
                            Reviewed by {result.reviewedBy} on {result.reviewedAt && format(new Date(result.reviewedAt), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Download lab result as PDF
                            const resultContent = generateLabResultPrintContent(result);
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(resultContent);
                              printWindow.document.close();
                              setTimeout(() => printWindow.print(), 250);
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const resultContent = generateLabResultPrintContent(result);
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(resultContent);
                              printWindow.document.close();
                              setTimeout(() => {
                                printWindow.print();
                                printWindow.close();
                              }, 250);
                            }
                          }}
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Test Volume by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testCategories.slice(0, 5).map((category) => {
                    const categoryCount = labOrders.reduce((count, order) => 
                      count + (order.items?.filter(item => item.labTest?.category === category)?.length || 0), 0
                    );
                    const percentage = labOrders.length > 0 ? (categoryCount / labOrders.length * 100) : 0;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span className="text-gray-600">{categoryCount} tests</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {labOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <TestTube className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New order for {order.patient.firstName} {order.patient.lastName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Lab Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lab Order</DialogTitle>
            <DialogDescription>
              Select a patient and lab tests to create a new order
            </DialogDescription>
          </DialogHeader>

          <Form {...orderForm}>
            <form onSubmit={orderForm.handleSubmit(handleOrderSubmit)} className="space-y-6">
              <FormField
                control={orderForm.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.title} {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={orderForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="stat">STAT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={orderForm.control}
                name="tests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Tests</FormLabel>
                    <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                      {testCategories.map((category) => (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium text-gray-900 border-b pb-1">{category}</h4>
                          {labTests
                            .filter(test => test.category === category)
                            .map((test) => (
                              <div key={test.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`test-${test.id}`}
                                  checked={field.value.some(t => t.id === test.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, test]);
                                    } else {
                                      field.onChange(field.value.filter(t => t.id !== test.id));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`test-${test.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {test.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={orderForm.control}
                name="clinicalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinical Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter clinical notes or special instructions..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOrderDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createOrder.isPending}>
                  {createOrder.isPending ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Result Entry Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Lab Result</DialogTitle>
            <DialogDescription>
              {selectedOrderItem && (
                <>Enter result for {selectedOrderItem.labTest.name}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedOrderItem && (
            <Form {...resultForm}>
              <form onSubmit={resultForm.handleSubmit(handleResultSubmit)} className="space-y-4">
                <FormField
                  control={resultForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Result Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter result value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={resultForm.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Units</FormLabel>
                        <FormControl>
                          <Input placeholder="mg/dL, mmol/L, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resultForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={resultForm.control}
                  name="referenceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Range</FormLabel>
                      <FormControl>
                        <Input placeholder="Normal range for this test" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resultForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes or comments..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResultDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitResult.isPending}>
                    {submitResult.isPending ? "Submitting..." : "Submit Result"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}