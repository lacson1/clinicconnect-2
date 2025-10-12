import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, Search, X, Users, Building2, AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StaffMember {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  email: string | null;
  title: string | null;
  isDefault: boolean;
  joinedAt: string;
}

interface SearchResult {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  email: string | null;
  title: string | null;
}

export default function OrganizationStaff() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get current staff members
  const { data: staffMembers, isLoading: loadingStaff } = useQuery<StaffMember[]>({
    queryKey: ['/api/organizations/staff-members'],
  });

  // Search for staff to add
  const { data: searchResults, isLoading: searching } = useQuery<SearchResult[]>({
    queryKey: ['/api/organizations/search-staff', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/organizations/search-staff?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to search staff');
      }
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Add staff mutation
  const addStaffMutation = useMutation({
    mutationFn: async (userId: number) => {
      // Get current organization from user context (this should come from session)
      const profileResponse = await fetch('/api/profile', { credentials: 'include' });
      const profile = await profileResponse.json();
      
      return apiRequest('/api/organizations/add-staff', 'POST', {
        userId,
        organizationId: profile.organizationId,
        setAsDefault: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations/staff-members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations/search-staff'] });
      setSearchQuery("");
      setIsDialogOpen(false);
      toast({
        title: "Staff Added",
        description: "Clinical staff has been successfully added to your organization",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Add Staff",
        description: error.message || "An error occurred",
      });
    },
  });

  // Remove staff mutation
  const removeStaffMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/organizations/remove-staff/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations/staff-members'] });
      toast({
        title: "Staff Removed",
        description: "Staff member has been removed from your organization",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Remove Staff",
        description: error.message || "An error occurred",
      });
    },
  });

  const getDisplayName = (staff: StaffMember | SearchResult) => {
    if (staff.firstName && staff.lastName) {
      return `${staff.firstName} ${staff.lastName}`;
    }
    return staff.username;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization Staff Management</h1>
        <p className="text-muted-foreground">
          Manage clinical staff who work across multiple organizations
        </p>
      </div>

      <Alert className="mb-6">
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          Clinical staff can now work in multiple organizations. Add existing staff members 
          to your organization to enable them to access your facility's patient data and systems.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members
              </CardTitle>
              <CardDescription>
                Manage staff who have access to this organization
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-staff">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Existing Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Existing Clinical Staff</DialogTitle>
                  <DialogDescription>
                    Search for clinical staff from other organizations to add them to yours
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, username, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-staff"
                    />
                  </div>

                  {searching && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                    </div>
                  )}

                  {searchQuery.length >= 2 && !searching && searchResults && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No staff members found
                          </p>
                        </div>
                      ) : (
                        searchResults.map((staff) => (
                          <Card key={staff.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="font-semibold">{getDisplayName(staff)}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Badge variant="outline">{staff.role}</Badge>
                                  {staff.title && <span>{staff.title}</span>}
                                  {staff.email && <span>• {staff.email}</span>}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addStaffMutation.mutate(staff.id)}
                                disabled={addStaffMutation.isPending}
                                data-testid={`button-add-staff-${staff.id}`}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  )}

                  {searchQuery.length < 2 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Enter at least 2 characters to search</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loadingStaff ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-4">Loading staff members...</p>
            </div>
          ) : staffMembers && staffMembers.length > 0 ? (
            <div className="space-y-3">
              {staffMembers.map((staff) => (
                <Card key={staff.id} className="p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{getDisplayName(staff)}</h3>
                        {staff.isDefault && (
                          <Badge variant="secondary">Default Org</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge>{staff.role}</Badge>
                        {staff.title && <span className="font-medium">{staff.title}</span>}
                        {staff.email && <span>• {staff.email}</span>}
                        <span>• Joined {new Date(staff.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStaffMutation.mutate(staff.id)}
                      disabled={removeStaffMutation.isPending}
                      data-testid={`button-remove-staff-${staff.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Staff Members</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add existing clinical staff to your organization
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
