import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/components/role-guard';
import { apiRequest } from '@/lib/queryClient';
import { UserCheck, UserX, Clock, Plus, Loader2 } from 'lucide-react';
import ReferralModal from '@/components/referral-modal';

export default function Referrals() {
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const { user, hasAnyRole } = useRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: referrals = [], isLoading, error } = useQuery({
    queryKey: ['/api/referrals'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest(`/api/referrals/${id}`, 'PATCH', { status });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to update referral status');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Referral status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update referral status',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600"><UserCheck className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><UserX className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canCreateReferrals = hasAnyRole(['nurse', 'doctor', 'admin']);
  const canUpdateReferrals = hasAnyRole(['pharmacist', 'physiotherapist', 'doctor', 'admin']);

  // Filter referrals based on user role
  const filteredReferrals = referrals.filter((referral: any) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'doctor' || user?.role === 'nurse') return true;
    return referral.toRole === user?.role;
  });

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage patient referrals between departments
          </p>
        </div>
        {canCreateReferrals && (
          <Button 
            onClick={() => setIsReferralModalOpen(true)} 
            className="flex items-center gap-2 w-full sm:w-auto"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Create Referral
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Referral List</CardTitle>
          <CardDescription className="text-xs">
            {user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse' 
              ? 'All referrals in the system' 
              : `Referrals assigned to ${user?.role}s`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading referrals...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Failed to load referrals</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No referrals found</p>
              <p className="text-sm mt-1">
                {canCreateReferrals ? 'Create your first referral to get started' : 'No referrals have been assigned to you yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Patient</TableHead>
                    <TableHead className="text-xs font-semibold hidden sm:table-cell">From</TableHead>
                    <TableHead className="text-xs font-semibold">To Role</TableHead>
                    <TableHead className="text-xs font-semibold">Reason</TableHead>
                    <TableHead className="text-xs font-semibold hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    {canUpdateReferrals && <TableHead className="text-xs font-semibold text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral: any) => (
                    <TableRow key={referral.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-sm">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap">
                            {referral.patient?.firstName} {referral.patient?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground sm:hidden mt-0.5">
                            From: {referral.fromUser?.username || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {referral.fromUser?.username || 'Unknown'}
                      </TableCell>
                      <TableCell className="capitalize text-sm">
                        <Badge variant="outline" className="text-xs">
                          {referral.toRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="max-w-xs">
                          <p className="truncate" title={referral.reason}>
                            {referral.reason}
                          </p>
                          <span className="text-xs text-muted-foreground md:hidden mt-1 block">
                            {new Date(referral.date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(referral.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      {canUpdateReferrals && (
                        <TableCell className="text-right">
                          {referral.status === 'pending' && (referral.toRole === user?.role || user?.role === 'admin') && (
                            <div className="flex gap-1.5 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50 h-7 px-2 text-xs"
                                onClick={() => updateStatusMutation.mutate({ id: referral.id, status: 'accepted' })}
                                disabled={updateStatusMutation.isPending}
                              >
                                {updateStatusMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Accept'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50 h-7 px-2 text-xs"
                                onClick={() => updateStatusMutation.mutate({ id: referral.id, status: 'rejected' })}
                                disabled={updateStatusMutation.isPending}
                              >
                                {updateStatusMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Reject'
                                )}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReferralModal
        open={isReferralModalOpen}
        onOpenChange={setIsReferralModalOpen}
      />
    </div>
  );
}