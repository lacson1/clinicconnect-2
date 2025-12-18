import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Users, Plus, Edit, Trash2, AlertCircle, CheckCircle2, LayoutGrid, List, Table2, Columns3, Grid3X3, ChevronDown, Check, MoreVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: Permission[];
  createdAt: string;
}

interface PermissionGroup {
  all: Permission[];
  grouped: Record<string, Permission[]>;
}

export default function RoleManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table" | "compact" | "detailed">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/access-control/roles"],
  });

  // Fetch permissions
  const { data: permissionsData } = useQuery<PermissionGroup>({
    queryKey: ["/api/access-control/permissions"],
  });

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.permissions.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; permissionIds: number[] }) => {
      return apiRequest("/api/access-control/roles", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/roles"] });
      setCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Role created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Update role permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (data: { roleId: number; permissionIds: number[] }) => {
      return apiRequest(`/api/access-control/roles/${data.roleId}/permissions`, "PUT", {
        permissionIds: data.permissionIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/roles"] });
      setEditDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Role permissions updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const response = await apiRequest(`/api/access-control/roles/${roleId}`, "DELETE");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to delete role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/roles"] });
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setSelectedRole(null);
  };

  const handleCreateRole = () => {
    if (!roleName.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    createRoleMutation.mutate({
      name: roleName,
      description: roleDescription,
      permissionIds: selectedPermissions,
    });
  };

  const handleUpdatePermissions = () => {
    if (!selectedRole) return;

    updatePermissionsMutation.mutate({
      roleId: selectedRole.id,
      permissionIds: selectedPermissions,
    });
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions.map(p => p.id));
    setEditDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.userCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This role is assigned to ${role.userCount} user(s). Please reassign them first.`,
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const selectAllInCategory = (permissions: Permission[]) => {
    const permIds = permissions.map(p => p.id);
    const allSelected = permIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !permIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...permIds])]);
    }
  };

  if (rolesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Role Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage roles and permissions for your staff members
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-role">
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role and assign permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  data-testid="input-role-name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Senior Doctor"
                />
              </div>
              <div>
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  data-testid="input-role-description"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Brief description of the role"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Permissions</Label>
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  {permissionsData?.grouped && Object.entries(permissionsData.grouped).map(([category, perms]) => (
                    <div key={category} className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold capitalize text-sm">{category}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-select-all-${category}`}
                          onClick={() => selectAllInCategory(perms)}
                        >
                          {perms.every(p => selectedPermissions.includes(p.id)) ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      <div className="space-y-2 ml-4">
                        {perms.map((perm) => (
                          <div key={perm.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perm-${perm.id}`}
                              data-testid={`checkbox-permission-${perm.name}`}
                              checked={selectedPermissions.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                            />
                            <Label htmlFor={`perm-${perm.id}`} className="text-sm cursor-pointer flex-1">
                              <div className="font-medium">{perm.name}</div>
                              <div className="text-xs text-muted-foreground">{perm.description}</div>
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    resetForm();
                  }}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={createRoleMutation.isPending}
                  data-testid="button-confirm-create"
                >
                  {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <Input
              placeholder="Search roles by name, description, or permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
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
      </div>

      {filteredRoles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No roles found' : 'No roles yet'}
            </h4>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search to find what you\'re looking for.' 
                : 'Get started by creating your first role.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Role
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-semibold">{role.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {role.userCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[300px]">
                          {role.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm.id} variant="outline" className="text-xs">
                              {perm.name.split('.')[1] || perm.name}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRole(role)}
                            disabled={role.userCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{role.name}</h3>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {role.description || "No description"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 8).map((perm) => (
                          <Badge key={perm.id} variant="outline" className="text-xs">
                            {perm.name.split('.')[1] || perm.name}
                          </Badge>
                        ))}
                        {role.permissions.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
                      disabled={role.userCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "compact" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{role.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {role.permissions.length} permissions
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {role.userCount}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRole(role);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role);
                      }}
                      disabled={role.userCount > 0}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "detailed" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-xl transition-all border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-xl">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{role.name}</CardTitle>
                      <CardDescription className="text-base">
                        {role.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Permissions ({role.permissions.length})
                    </Label>
                    <ScrollArea className="h-32 border rounded-md p-3">
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((perm) => (
                          <Badge key={perm.id} variant="outline" className="text-xs">
                            {perm.name}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteRole(role)}
                      disabled={role.userCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <Card key={role.id} data-testid={`card-role-${role.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{role.name}</span>
                <Badge variant="secondary" data-testid={`badge-user-count-${role.id}`}>
                  <Users className="h-3 w-3 mr-1" />
                  {role.userCount}
                </Badge>
              </CardTitle>
              <CardDescription>{role.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Permissions ({role.permissions.length})
                  </Label>
                  <ScrollArea className="h-24">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 10).map((perm) => (
                        <Badge key={perm.id} variant="outline" className="text-xs">
                          {perm.name.split('.')[1] || perm.name}
                        </Badge>
                      ))}
                      {role.permissions.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditRole(role)}
                    data-testid={`button-edit-role-${role.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRole(role)}
                    disabled={role.userCount > 0}
                    data-testid={`button-delete-role-${role.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Update permissions for this role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">{selectedRole?.name}</p>
              <p className="text-xs text-muted-foreground">{selectedRole?.description}</p>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Permissions</Label>
              <ScrollArea className="h-[400px] border rounded-md p-4">
                {permissionsData?.grouped && Object.entries(permissionsData.grouped).map(([category, perms]) => (
                  <div key={category} className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize text-sm">{category}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => selectAllInCategory(perms)}
                      >
                        {perms.every(p => selectedPermissions.includes(p.id)) ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="space-y-2 ml-4">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-perm-${perm.id}`}
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <Label htmlFor={`edit-perm-${perm.id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium">{perm.name}</div>
                            <div className="text-xs text-muted-foreground">{perm.description}</div>
                          </Label>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePermissions}
                disabled={updatePermissionsMutation.isPending}
              >
                {updatePermissionsMutation.isPending ? "Updating..." : "Update Permissions"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
