import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  CalendarIcon,
  Plus,
  FlaskRound,
  Pill,
  FileText,
  Stethoscope,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PatientQuickActionsProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  action: 'appointment' | 'lab' | 'prescription' | 'visit' | 'vitals' | null;
}

export default function PatientQuickActions({
  patientId,
  patientName,
  isOpen,
  onClose,
  action
}: PatientQuickActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Generic mutation for all quick actions
  const actionMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoints = {
        appointment: '/api/appointments',
        lab: `/api/patients/${patientId}/lab-orders`,
        prescription: `/api/patients/${patientId}/prescriptions`,
        visit: `/api/patients/${patientId}/visits`,
        vitals: `/api/patients/${patientId}/vitals`
      };

      return await apiRequest(endpoints[action!], {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/visits`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/labs`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/prescriptions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/vitals`] });
      
      toast({
        title: "Success",
        description: `${action} created successfully`,
      });
      onClose();
      setFormData({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create ${action}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const data = {
      ...formData,
      patientId: parseInt(patientId),
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    };

    // Add action-specific required fields
    if (action === 'appointment') {
      data.appointmentDate = selectedDate;
      data.status = 'scheduled';
    } else if (action === 'visit') {
      data.visitDate = selectedDate || new Date();
      data.visitType = 'consultation';
    } else if (action === 'vitals') {
      data.recordedAt = new Date();
      data.recordedBy = 'Current User'; // Should come from auth context
    }

    actionMutation.mutate(data);
  };

  const getActionConfig = () => {
    switch (action) {
      case 'appointment':
        return {
          title: 'Schedule Appointment',
          icon: CalendarIcon,
          fields: [
            { key: 'appointmentTime', label: 'Time', type: 'time', required: true },
            { key: 'reason', label: 'Reason', type: 'textarea', required: true },
            { key: 'duration', label: 'Duration (minutes)', type: 'number', required: true },
            { key: 'appointmentType', label: 'Type', type: 'select', options: ['consultation', 'follow-up', 'emergency'], required: true }
          ]
        };
      case 'lab':
        return {
          title: 'Order Lab Test',
          icon: FlaskRound,
          fields: [
            { key: 'testName', label: 'Test Name', type: 'text', required: true },
            { key: 'priority', label: 'Priority', type: 'select', options: ['routine', 'urgent', 'stat'], required: true },
            { key: 'instructions', label: 'Special Instructions', type: 'textarea', required: false },
            { key: 'expectedDate', label: 'Expected Completion', type: 'date', required: false }
          ]
        };
      case 'prescription':
        return {
          title: 'Prescribe Medication',
          icon: Pill,
          fields: [
            { key: 'medicationName', label: 'Medication', type: 'text', required: true },
            { key: 'dosage', label: 'Dosage', type: 'text', required: true },
            { key: 'frequency', label: 'Frequency', type: 'text', required: true },
            { key: 'duration', label: 'Duration', type: 'text', required: true },
            { key: 'instructions', label: 'Instructions', type: 'textarea', required: false }
          ]
        };
      case 'visit':
        return {
          title: 'Record Visit',
          icon: Stethoscope,
          fields: [
            { key: 'chiefComplaint', label: 'Chief Complaint', type: 'textarea', required: true },
            { key: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: false },
            { key: 'treatment', label: 'Treatment', type: 'textarea', required: false },
            { key: 'notes', label: 'Notes', type: 'textarea', required: false }
          ]
        };
      case 'vitals':
        return {
          title: 'Record Vital Signs',
          icon: Activity,
          fields: [
            { key: 'bloodPressureSystolic', label: 'Systolic BP', type: 'number', required: true },
            { key: 'bloodPressureDiastolic', label: 'Diastolic BP', type: 'number', required: true },
            { key: 'heartRate', label: 'Heart Rate', type: 'number', required: true },
            { key: 'temperature', label: 'Temperature (°C)', type: 'number', required: true },
            { key: 'oxygenSaturation', label: 'O2 Saturation (%)', type: 'number', required: true },
            { key: 'weight', label: 'Weight (kg)', type: 'number', required: false },
            { key: 'height', label: 'Height (cm)', type: 'number', required: false }
          ]
        };
      default:
        return { title: '', icon: Plus, fields: [] };
    }
  };

  const config = getActionConfig();
  const IconComponent = config.icon;

  if (!action) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <IconComponent className="w-5 h-5" />
            <span>{config.title}</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Patient: {patientName}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date picker for relevant actions */}
          {(action === 'appointment' || action === 'lab') && (
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Dynamic form fields */}
          {config.fields.map((field) => (
            <div key={field.key}>
              <Label>{field.label} {field.required && '*'}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={formData[field.key] || ''}
                  onValueChange={(value) => setFormData({...formData, [field.key]: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'date' ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData[field.key] ? format(new Date(formData[field.key]), "PPP") : `Select ${field.label.toLowerCase()}`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData[field.key] ? new Date(formData[field.key]) : undefined}
                      onSelect={(date) => setFormData({...formData, [field.key]: date ? format(date, 'yyyy-MM-dd') : ''})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={actionMutation.isPending}
          >
            {actionMutation.isPending ? 'Creating...' : `Create ${action}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}