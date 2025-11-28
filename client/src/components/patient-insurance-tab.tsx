import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { 
  Shield, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw
} from 'lucide-react';

interface PatientInsurance {
  id: number;
  patientId: number;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  membershipNumber?: string;
  coverageType: string;
  policyStatus: string;
  effectiveDate: string;
  expirationDate?: string;
  deductible?: string;
  copay?: string;
  coinsurance?: string;
  maximumBenefit?: string;
  notes?: string;
  providerPhone?: string;
  providerEmail?: string;
  providerAddress?: string;
  coverageDetails?: string;
  preAuthRequired?: boolean;
  referralRequired?: boolean;
  organizationId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PatientInsuranceTabProps {
  patientId: number;
}

const insuranceFormSchema = z.object({
  provider: z.string().min(1, 'Provider name is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  groupNumber: z.string().optional(),
  membershipNumber: z.string().optional(),
  coverageType: z.enum(['primary', 'secondary', 'tertiary']),
  policyStatus: z.enum(['active', 'inactive', 'suspended', 'expired']),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  expirationDate: z.string().optional(),
  deductible: z.string().optional(),
  copay: z.string().optional(),
  coinsurance: z.string().optional(),
  maximumBenefit: z.string().optional(),
  notes: z.string().optional(),
  providerPhone: z.string().optional(),
  providerEmail: z.string().email().optional().or(z.literal('')),
  providerAddress: z.string().optional(),
  coverageDetails: z.string().optional(),
  preAuthRequired: z.boolean().default(false),
  referralRequired: z.boolean().default(false),
});

type InsuranceFormValues = z.infer<typeof insuranceFormSchema>;

export function PatientInsuranceTab({ patientId }: PatientInsuranceTabProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<PatientInsurance | null>(null);

  const { data: insuranceRecords = [], isLoading, isError, refetch } = useQuery<PatientInsurance[]>({
    queryKey: [`/api/patients/${patientId}/insurance`],
  });

  const form = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceFormSchema),
    defaultValues: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
      membershipNumber: '',
      coverageType: 'primary',
      policyStatus: 'active',
      effectiveDate: '',
      expirationDate: '',
      deductible: '',
      copay: '',
      coinsurance: '',
      maximumBenefit: '',
      notes: '',
      providerPhone: '',
      providerEmail: '',
      providerAddress: '',
      coverageDetails: '',
      preAuthRequired: false,
      referralRequired: false,
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: InsuranceFormValues) => {
      return apiRequest(`/api/patients/${patientId}/insurance`, 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/insurance`] });
      toast({ title: "Success", description: "Insurance policy added successfully" });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add insurance policy", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsuranceFormValues }) => {
      return apiRequest(`/api/patients/${patientId}/insurance/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/insurance`] });
      toast({ title: "Success", description: "Insurance policy updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedInsurance(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update insurance policy", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/patients/${patientId}/insurance/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/insurance`] });
      toast({ title: "Success", description: "Insurance policy deleted successfully" });
      setIsDeleteDialogOpen(false);
      setSelectedInsurance(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete insurance policy", variant: "destructive" });
    },
  });

  const today = new Date();
  const activeInsurance = insuranceRecords.filter(ins => 
    ins.policyStatus === 'active' && 
    (!ins.expirationDate || isAfter(parseISO(ins.expirationDate), today))
  );
  const expiredInsurance = insuranceRecords.filter(ins => 
    ins.policyStatus === 'expired' || 
    (ins.expirationDate && isBefore(parseISO(ins.expirationDate), today))
  );
  const inactiveInsurance = insuranceRecords.filter(ins => 
    ins.policyStatus === 'inactive' || ins.policyStatus === 'suspended'
  );

  const getStatusBadge = (status: string, expirationDate?: string) => {
    if (expirationDate && isBefore(parseISO(expirationDate), today)) {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Expired</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Inactive</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Suspended</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCoverageBadge = (type: string) => {
    switch (type) {
      case 'primary':
        return <Badge className="bg-blue-100 text-blue-800">Primary</Badge>;
      case 'secondary':
        return <Badge className="bg-purple-100 text-purple-800">Secondary</Badge>;
      case 'tertiary':
        return <Badge className="bg-gray-100 text-gray-800">Tertiary</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatCurrency = (value?: string) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : `₦${num.toLocaleString()}`;
  };

  const handleEdit = (insurance: PatientInsurance) => {
    setSelectedInsurance(insurance);
    form.reset({
      provider: insurance.provider,
      policyNumber: insurance.policyNumber,
      groupNumber: insurance.groupNumber || '',
      membershipNumber: insurance.membershipNumber || '',
      coverageType: insurance.coverageType as 'primary' | 'secondary' | 'tertiary',
      policyStatus: insurance.policyStatus as 'active' | 'inactive' | 'suspended' | 'expired',
      effectiveDate: insurance.effectiveDate,
      expirationDate: insurance.expirationDate || '',
      deductible: insurance.deductible || '',
      copay: insurance.copay || '',
      coinsurance: insurance.coinsurance || '',
      maximumBenefit: insurance.maximumBenefit || '',
      notes: insurance.notes || '',
      providerPhone: insurance.providerPhone || '',
      providerEmail: insurance.providerEmail || '',
      providerAddress: insurance.providerAddress || '',
      coverageDetails: insurance.coverageDetails || '',
      preAuthRequired: insurance.preAuthRequired || false,
      referralRequired: insurance.referralRequired || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (insurance: PatientInsurance) => {
    setSelectedInsurance(insurance);
    setIsDeleteDialogOpen(true);
  };

  const onSubmitAdd = (data: InsuranceFormValues) => {
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data: InsuranceFormValues) => {
    if (selectedInsurance) {
      updateMutation.mutate({ id: selectedInsurance.id, data });
    }
  };

  const renderInsuranceCard = (insurance: PatientInsurance) => (
    <Card key={insurance.id} className="mb-4" data-testid={`insurance-card-${insurance.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{insurance.provider}</CardTitle>
              <p className="text-sm text-muted-foreground">Policy #{insurance.policyNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getCoverageBadge(insurance.coverageType)}
            {getStatusBadge(insurance.policyStatus, insurance.expirationDate)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid={`insurance-menu-${insurance.id}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(insurance)} data-testid={`edit-insurance-${insurance.id}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Policy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(insurance)} 
                  className="text-red-600"
                  data-testid={`delete-insurance-${insurance.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Policy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {insurance.groupNumber && (
            <div>
              <p className="text-xs text-muted-foreground">Group Number</p>
              <p className="text-sm font-medium">{insurance.groupNumber}</p>
            </div>
          )}
          {insurance.membershipNumber && (
            <div>
              <p className="text-xs text-muted-foreground">Member ID</p>
              <p className="text-sm font-medium">{insurance.membershipNumber}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Effective Date
            </p>
            <p className="text-sm font-medium">{format(parseISO(insurance.effectiveDate), 'MMM d, yyyy')}</p>
          </div>
          {insurance.expirationDate && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Expiration Date
              </p>
              <p className="text-sm font-medium">{format(parseISO(insurance.expirationDate), 'MMM d, yyyy')}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg mb-4">
          {formatCurrency(insurance.deductible) && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Deductible
              </p>
              <p className="text-sm font-medium">{formatCurrency(insurance.deductible)}</p>
            </div>
          )}
          {formatCurrency(insurance.copay) && (
            <div>
              <p className="text-xs text-muted-foreground">Copay</p>
              <p className="text-sm font-medium">{formatCurrency(insurance.copay)}</p>
            </div>
          )}
          {insurance.coinsurance && (
            <div>
              <p className="text-xs text-muted-foreground">Coinsurance</p>
              <p className="text-sm font-medium">{insurance.coinsurance}%</p>
            </div>
          )}
          {formatCurrency(insurance.maximumBenefit) && (
            <div>
              <p className="text-xs text-muted-foreground">Max Benefit</p>
              <p className="text-sm font-medium">{formatCurrency(insurance.maximumBenefit)}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {insurance.providerPhone && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="w-3 h-3" />
              {insurance.providerPhone}
            </div>
          )}
          {insurance.providerEmail && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Mail className="w-3 h-3" />
              {insurance.providerEmail}
            </div>
          )}
          {insurance.preAuthRequired && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Pre-Auth Required
            </Badge>
          )}
          {insurance.referralRequired && (
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              Referral Required
            </Badge>
          )}
        </div>

        {insurance.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3" /> Notes
            </p>
            <p className="text-sm text-muted-foreground">{insurance.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = (type: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center" data-testid={`empty-${type}-insurance`}>
      <Shield className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {type} insurance policies
      </h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md">
        {type === 'active' 
          ? 'Add insurance information to track patient coverage and benefits.' 
          : `No ${type} insurance policies found for this patient.`}
      </p>
      {type === 'active' && (
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-insurance-empty">
          <Plus className="w-4 h-4 mr-2" />
          Add Insurance Policy
        </Button>
      )}
    </div>
  );

  const renderForm = (isEdit: boolean) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(isEdit ? onSubmitEdit : onSubmitAdd)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Provider *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., NHIS, HMO Nigeria" {...field} data-testid="input-provider" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="policyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Policy number" {...field} data-testid="input-policy-number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="groupNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Number</FormLabel>
                <FormControl>
                  <Input placeholder="Group number (optional)" {...field} data-testid="input-group-number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="membershipNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membership ID</FormLabel>
                <FormControl>
                  <Input placeholder="Member ID (optional)" {...field} data-testid="input-membership-number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="coverageType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-coverage-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="tertiary">Tertiary</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="policyStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-policy-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-effective-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-expiration-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="deductible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deductible (₦)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} data-testid="input-deductible" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="copay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Copay (₦)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} data-testid="input-copay" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coinsurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coinsurance (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="20" {...field} data-testid="input-coinsurance" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maximumBenefit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Benefit (₦)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} data-testid="input-max-benefit" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="providerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+234..." {...field} data-testid="input-provider-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="providerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="claims@provider.com" {...field} data-testid="input-provider-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="providerAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Address</FormLabel>
              <FormControl>
                <Input placeholder="Provider address" {...field} data-testid="input-provider-address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="preAuthRequired"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-pre-auth" />
                </FormControl>
                <FormLabel className="!mt-0">Pre-Authorization Required</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referralRequired"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-referral" />
                </FormControl>
                <FormLabel className="!mt-0">Referral Required</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this policy..." {...field} data-testid="input-notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending} data-testid="button-submit-insurance">
            {(addMutation.isPending || updateMutation.isPending) ? 'Saving...' : (isEdit ? 'Update Policy' : 'Add Policy')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500">Loading insurance information...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="text-red-500">Failed to load insurance information</div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger 
              value="active" 
              className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              data-testid="tab-active-insurance"
            >
              <CheckCircle className="w-4 h-4" />
              Active ({activeInsurance.length})
            </TabsTrigger>
            <TabsTrigger 
              value="expired" 
              className="flex items-center gap-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
              data-testid="tab-expired-insurance"
            >
              <AlertTriangle className="w-4 h-4" />
              Expired ({expiredInsurance.length})
            </TabsTrigger>
            <TabsTrigger 
              value="inactive" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700"
              data-testid="tab-inactive-insurance"
            >
              <Clock className="w-4 h-4" />
              Inactive ({inactiveInsurance.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-insurance">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-insurance">
              <Plus className="w-4 h-4 mr-2" />
              Add Insurance
            </Button>
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          {activeInsurance.length > 0 ? (
            <div>{activeInsurance.map(renderInsuranceCard)}</div>
          ) : renderEmptyState('active')}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredInsurance.length > 0 ? (
            <div>{expiredInsurance.map(renderInsuranceCard)}</div>
          ) : renderEmptyState('expired')}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveInsurance.length > 0 ? (
            <div>{inactiveInsurance.map(renderInsuranceCard)}</div>
          ) : renderEmptyState('inactive')}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Add Insurance Policy
            </DialogTitle>
            <DialogDescription>
              Add new insurance coverage information for this patient.
            </DialogDescription>
          </DialogHeader>
          {renderForm(false)}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Insurance Policy
            </DialogTitle>
            <DialogDescription>
              Update insurance coverage information.
            </DialogDescription>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Insurance Policy
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this insurance policy? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedInsurance && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedInsurance.provider}</p>
                <p className="text-sm text-muted-foreground">Policy #{selectedInsurance.policyNumber}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedInsurance && deleteMutation.mutate(selectedInsurance.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
