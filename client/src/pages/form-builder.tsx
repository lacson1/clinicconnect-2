import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Move, Save, Eye, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface ConsultationForm {
  id: number;
  name: string;
  description: string;
  specialistRole: string;
  formSchema: {
    fields: FormField[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FormBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [specialistRole, setSpecialistRole] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingForm, setEditingForm] = useState<ConsultationForm | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch existing forms
  const { data: forms = [], isLoading } = useQuery<ConsultationForm[]>({
    queryKey: ['/api/consultation-forms'],
  });

  // Create/Update form mutation
  const createFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (editingForm) {
        return apiRequest(`/api/consultation-forms/${editingForm.id}`, {
          method: 'PATCH',
          body: formData
        });
      } else {
        return apiRequest('/api/consultation-forms', {
          method: 'POST',
          body: formData
        });
      }
    },
    onSuccess: () => {
      toast({
        title: editingForm ? "Form Updated" : "Form Created",
        description: `Consultation form has been ${editingForm ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/consultation-forms'] });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save consultation form.",
        variant: "destructive",
      });
    },
  });

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "",
      type: "text",
      required: false,
      placeholder: ""
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === id);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < fields.length - 1)
    ) {
      const newFields = [...fields];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(fields.find(f => f.id === fieldId)?.options || []), ""]
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field?.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const deleteOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field?.options) {
      const newOptions = field.options.filter((_, i) => i !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const saveForm = () => {
    if (!formName.trim() || !specialistRole.trim() || fields.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in form name, specialist role, and add at least one field.",
        variant: "destructive",
      });
      return;
    }

    const formData = {
      name: formName,
      description: formDescription,
      specialistRole,
      formSchema: { fields },
      isActive: true
    };

    createFormMutation.mutate(formData);
  };

  const loadForm = (form: ConsultationForm) => {
    setEditingForm(form);
    setFormName(form.name);
    setFormDescription(form.description);
    setSpecialistRole(form.specialistRole);
    setFields(form.formSchema.fields);
  };

  const resetForm = () => {
    setEditingForm(null);
    setFormName("");
    setFormDescription("");
    setSpecialistRole("");
    setFields([]);
    setPreviewMode(false);
  };

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input 
            placeholder={field.placeholder || field.label}
            disabled
          />
        );
      case 'textarea':
        return (
          <Textarea 
            placeholder={field.placeholder || field.label}
            disabled
            rows={3}
          />
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="radio" disabled />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="checkbox" disabled />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
          </Select>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading forms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Consultation Form Builder
        </h1>
        <p className="text-gray-600">
          Create and manage custom consultation forms for different medical specialties
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Builder Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                {editingForm ? 'Edit Form' : 'Create New Form'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formName">Form Name</Label>
                  <Input
                    id="formName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Cardiology Assessment"
                  />
                </div>
                <div>
                  <Label htmlFor="specialistRole">Specialist Role</Label>
                  <Select value={specialistRole} onValueChange={setSpecialistRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialist role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiologist">Cardiologist</SelectItem>
                      <SelectItem value="neurologist">Neurologist</SelectItem>
                      <SelectItem value="orthopedist">Orthopedist</SelectItem>
                      <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                      <SelectItem value="dermatologist">Dermatologist</SelectItem>
                      <SelectItem value="endocrinologist">Endocrinologist</SelectItem>
                      <SelectItem value="pulmonologist">Pulmonologist</SelectItem>
                      <SelectItem value="gastroenterologist">Gastroenterologist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="formDescription">Description</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the purpose of this consultation form..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Form Fields</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addField}
                    disabled={previewMode}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>
              </div>

              <div className="space-y-4 min-h-[200px] border rounded-lg p-4">
                {fields.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No fields added yet</p>
                    <Button
                      variant="outline"
                      onClick={addField}
                      className="mt-2"
                      disabled={previewMode}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Field
                    </Button>
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      {previewMode ? (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </Label>
                          {renderFieldPreview(field)}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{field.type}</Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveField(field.id, 'up')}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveField(field.id, 'down')}
                                disabled={index === fields.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteField(field.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Field Label</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                placeholder="Enter field label"
                              />
                            </div>
                            <div>
                              <Label>Field Type</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value: any) => updateField(field.id, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text Input</SelectItem>
                                  <SelectItem value="textarea">Text Area</SelectItem>
                                  <SelectItem value="radio">Radio Buttons</SelectItem>
                                  <SelectItem value="checkbox">Checkboxes</SelectItem>
                                  <SelectItem value="select">Dropdown</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Placeholder</Label>
                              <Input
                                value={field.placeholder || ""}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                placeholder="Enter placeholder text"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                              />
                              <Label>Required Field</Label>
                            </div>
                          </div>

                          {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') && (
                            <div>
                              <Label>Options</Label>
                              <div className="space-y-2">
                                {field.options?.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex gap-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                      placeholder="Enter option text"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteOption(field.id, optionIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(field.id)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveForm}
                  disabled={createFormMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {createFormMutation.isPending ? 'Saving...' : (editingForm ? 'Update Form' : 'Save Form')}
                </Button>
                {editingForm && (
                  <Button
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Forms Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Existing Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forms.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No forms created yet
                  </p>
                ) : (
                  forms.map((form) => (
                    <Card key={form.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{form.name}</h4>
                          <Badge variant={form.isActive ? "default" : "secondary"}>
                            {form.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{form.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{form.specialistRole}</span>
                          <span>{form.formSchema.fields.length} fields</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadForm(form)}
                          className="w-full"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}