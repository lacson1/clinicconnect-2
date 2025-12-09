import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Upload,
  Download,
  Users,
  UserX,
  UserCheck,
  Shield,
  Mail,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  FileText,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import ExcelJS from 'exceljs';

interface BulkUserOperationsProps {
  selectedUsers: number[];
  onComplete?: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkUserOperations({ selectedUsers, onComplete }: BulkUserOperationsProps) {
  const [open, setOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/users/bulk-update', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bulk operation completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/management"] });
      setOpen(false);
      if (onComplete) onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Bulk operation failed",
        variant: "destructive",
      });
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (users: any[]) => {
      return apiRequest('/api/admin/users/bulk-import', 'POST', { users });
    },
    onSuccess: (data: ImportResult) => {
      setImportResult(data);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.success} users, ${data.failed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/management"] });
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import users",
        variant: "destructive",
      });
    },
  });

  // Handle file upload and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        const worksheet = workbook.worksheets[0];
        const jsonData: any[] = [];
        
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row
          
          const rowData: any = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const headerCell = worksheet.getRow(1).getCell(colNumber);
            const header = headerCell.value?.toString() || `Column${colNumber}`;
            rowData[header] = cell.value?.toString() || '';
          });
          jsonData.push(rowData);
        });
        
        setImportPreview(jsonData.slice(0, 5)); // Preview first 5 rows
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to read Excel file",
          variant: "destructive",
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Execute import
  const handleImport = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        const worksheet = workbook.worksheets[0];
        const jsonData: any[] = [];
        
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row
          
          const rowData: any = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const headerCell = worksheet.getRow(1).getCell(colNumber);
            const header = headerCell.value?.toString() || `Column${colNumber}`;
            rowData[header] = cell.value?.toString() || '';
          });
          jsonData.push(rowData);
        });
        
        bulkImportMutation.mutate(jsonData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to read Excel file",
          variant: "destructive",
        });
      }
    };

    reader.readAsArrayBuffer(importFile);
  };

  // Export template
  const handleDownloadTemplate = async () => {
    const template = [
      {
        username: 'johndoe',
        password: 'SecurePass123!',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'doctor',
        phone: '+2341234567890',
        organizationId: 1
      }
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');
    
    // Add headers
    const headers = Object.keys(template[0]);
    worksheet.addRow(headers);
    
    // Add data
    template.forEach(row => {
      worksheet.addRow(headers.map(header => row[header as keyof typeof row]));
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-import-template.xlsx';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Export selected users
  const handleExportUsers = async () => {
    try {
      const response = await apiRequest(
        `/api/admin/users/export?ids=${selectedUsers.join(',')}`, 
        'GET'
      );
      const users = await response.json();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');
      
      if (users.length > 0) {
        const headers = Object.keys(users[0]);
        worksheet.addRow(headers);
        
        users.forEach((user: any) => {
          worksheet.addRow(headers.map(header => user[header] ?? ''));
        });

        // Auto-fit columns
        worksheet.columns.forEach((column) => {
          let maxLength = 0;
          column.eachCell?.({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${users.length} users`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export users",
        variant: "destructive",
      });
    }
  };

  // Bulk operations
  const handleBulkOperation = (operation: string) => {
    const operations: any = {
      assignRole: {
        action: 'assign-role',
        data: { userIds: selectedUsers, roleId: selectedRole }
      },
      activate: {
        action: 'activate',
        data: { userIds: selectedUsers }
      },
      deactivate: {
        action: 'deactivate',
        data: { userIds: selectedUsers }
      },
      delete: {
        action: 'delete',
        data: { userIds: selectedUsers }
      },
      resetPassword: {
        action: 'reset-password',
        data: { userIds: selectedUsers }
      },
      sendWelcomeEmail: {
        action: 'send-welcome-email',
        data: { userIds: selectedUsers }
      }
    };

    const operationData = operations[operation];
    if (operationData) {
      bulkUpdateMutation.mutate(operationData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Bulk Operations ({selectedUsers.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk User Operations</DialogTitle>
          <DialogDescription>
            Perform operations on {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="actions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="actions">Bulk Actions</TabsTrigger>
            <TabsTrigger value="import">Import Users</TabsTrigger>
            <TabsTrigger value="export">Export Users</TabsTrigger>
          </TabsList>

          {/* Bulk Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Assignment</CardTitle>
                <CardDescription>Assign a role to all selected users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="lab_technician">Lab Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => handleBulkOperation('assignRole')}
                  disabled={!selectedRole || selectedUsers.length === 0}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Assign Role to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>Activate, deactivate, or delete user accounts</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleBulkOperation('activate')}
                  disabled={selectedUsers.length === 0}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                >
                  <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                  Activate
                </Button>
                <Button 
                  onClick={() => handleBulkOperation('deactivate')}
                  disabled={selectedUsers.length === 0}
                  variant="outline"
                  className="border-orange-200 hover:bg-orange-50"
                >
                  <UserX className="h-4 w-4 mr-2 text-orange-600" />
                  Deactivate
                </Button>
                <Button 
                  onClick={() => handleBulkOperation('resetPassword')}
                  disabled={selectedUsers.length === 0}
                  variant="outline"
                  className="border-blue-200 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2 text-blue-600" />
                  Reset Passwords
                </Button>
                <Button 
                  onClick={() => handleBulkOperation('delete')}
                  disabled={selectedUsers.length === 0}
                  variant="outline"
                  className="border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                  Delete
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication</CardTitle>
                <CardDescription>Send emails to selected users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleBulkOperation('sendWelcomeEmail')}
                  disabled={selectedUsers.length === 0}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Welcome Email to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Users from Excel/CSV</CardTitle>
                <CardDescription>Upload a file to create multiple users at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Label htmlFor="import-file" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50">
                      <Upload className="h-4 w-4" />
                      <span>Choose File</span>
                    </div>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </Label>
                  {importFile && (
                    <span className="text-sm text-muted-foreground">{importFile.name}</span>
                  )}
                </div>

                {importPreview.length > 0 && (
                  <div className="space-y-2">
                    <Label>Preview (first 5 rows)</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            {Object.keys(importPreview[0]).map((key) => (
                              <th key={key} className="px-4 py-2 text-left font-medium">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, idx) => (
                            <tr key={idx} className="border-t">
                              {Object.values(row).map((value: any, vIdx) => (
                                <td key={vIdx} className="px-4 py-2">{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleImport}
                  disabled={!importFile || bulkImportMutation.isPending}
                  className="w-full"
                >
                  {bulkImportMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Users
                    </>
                  )}
                </Button>

                {importResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Import Complete</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <p className="text-2xl font-bold text-green-700">{importResult.success}</p>
                          <p className="text-sm text-green-600">Successful</p>
                        </CardContent>
                      </Card>
                      <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <p className="text-2xl font-bold text-red-700">{importResult.failed}</p>
                          <p className="text-sm text-red-600">Failed</p>
                        </CardContent>
                      </Card>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-red-600">Errors:</Label>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                          {importResult.errors.map((error, idx) => (
                            <p key={idx} className="text-sm text-red-700">• {error}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Users</CardTitle>
                <CardDescription>
                  Download selected users data to Excel format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Export Information</p>
                      <p className="text-sm text-blue-700 mt-1">
                        The export will include: username, email, name, role, phone, organization, 
                        status, and creation date for all {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleExportUsers}
                  disabled={selectedUsers.length === 0}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''} to Excel
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

