import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface PatientBillingTabProps {
  patient: any;
}

export function PatientBillingTab({ patient }: PatientBillingTabProps) {
  // Guard against undefined patient
  if (!patient?.id) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading patient data...</p>
      </div>
    );
  }

  // Fetch patient-specific invoices from server
  const { data: patientInvoices = [], isLoading, error } = useQuery<any[]>({
    queryKey: [`/api/invoices?patientId=${patient.id}`],
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: "secondary", label: "Draft" },
      sent: { variant: "outline", label: "Sent" },
      paid: { variant: "default", label: "Paid" },
      partial: { variant: "destructive", label: "Partial" },
      overdue: { variant: "destructive", label: "Overdue" },
      cancelled: { variant: "secondary", label: "Cancelled" }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billing & Invoices</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage invoices for {patient.firstName} {patient.lastName}
          </p>
        </div>
        <Link href="/billing">
          <Button data-testid="go-to-billing" title="Manage Billing">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoices...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Failed to load invoices</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Please try again later</p>
          </CardContent>
        </Card>
      ) : patientInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No invoices found for this patient</p>
            <Link href="/billing">
              <Button variant="outline">
                Go to Billing Page
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>View all invoices for this patient</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientInvoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>₦{Number.parseFloat(invoice.totalAmount || 0).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>₦{Number.parseFloat(invoice.balanceAmount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
