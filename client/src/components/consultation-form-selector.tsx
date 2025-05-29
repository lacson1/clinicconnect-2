import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Clock, User, Calendar, Activity, Pill } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import ConsultationHistoryDisplay from "./consultation-history-display";

interface ConsultationForm {
  id: number;
  name: string;
  description: string;
  specialistRole: string;
  formStructure: {
    fields: FormField[];
  };
  isActive: boolean;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'number' | 'date' | 'time' | 'email' | 'phone';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  section?: string;
  medicalCategory?: 'symptoms' | 'vitals' | 'history' | 'examination' | 'diagnosis' | 'treatment' | 'followup';
}

interface ConsultationFormSelectorProps {
  patientId: number;
  visitId?: number;
  onFormSubmit?: (data: any) => void;
}

export default function ConsultationFormSelector({ 
  patientId, 
  visitId, 
  onFormSubmit 
}: ConsultationFormSelectorProps) {
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available consultation forms
  const { data: forms = [], isLoading: formsLoading } = useQuery<ConsultationForm[]>({
    queryKey: ['/api/consultation-forms'],
  });

  // Get selected form details
  const selectedForm = forms.find(form => form.id === selectedFormId);

  // Create consultation record mutation
  const createConsultationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/consultation-records', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Consultation record created successfully",
      });
      setFormData({});
      setSelectedFormId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'consultation-records'] });
      if (onFormSubmit) onFormSubmit(formData);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create consultation record",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    if (!selectedForm) return;

    const consultationData = {
      patientId,
      visitId,
      formId: selectedForm.id,
      formName: selectedForm.name,
      formDescription: selectedForm.description,
      specialistRole: selectedForm.specialistRole,
      formData: formData,
    };

    createConsultationMutation.mutate(consultationData);
  };

  const renderFormField = (field: FormField) => {
    const fieldValue = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, parseFloat(e.target.value) || '')}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleInputChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={fieldValue === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(fieldValue) ? fieldValue.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                    if (e.target.checked) {
                      handleInputChange(field.id, [...currentValues, option]);
                    } else {
                      handleInputChange(field.id, currentValues.filter((v: any) => v !== option));
                    }
                  }}
                  className="checkbox"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  // Group fields by section if sections exist
  const groupedFields = selectedForm?.formStructure.fields.reduce((acc, field) => {
    const section = field.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, FormField[]>) || {};

  if (formsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            Loading consultation forms...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Consultation Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {forms.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No consultation forms available. Please create forms first.
            </p>
          ) : (
            <div className="grid gap-3">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedFormId === form.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFormId(form.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{form.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {form.specialistRole}
                      </Badge>
                      <Badge variant="outline">
                        {form.formStructure.fields.length} fields
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Form */}
      {selectedForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedForm.name}
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedForm.specialistRole}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">{selectedForm.description}</p>
            </div>

            {/* Render form fields by section */}
            {Object.entries(groupedFields).map(([sectionName, fields]) => (
              <div key={sectionName} className="space-y-4">
                {sectionName !== 'General' && (
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {sectionName}
                  </h3>
                )}
                <div className="grid gap-4">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderFormField(field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleSubmit}
                disabled={createConsultationMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {createConsultationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Save Consultation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultation History */}
      <ConsultationHistoryDisplay patientId={patientId} />
    </div>
  );
}