import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToPDF, printElement, type Organization, type PrintOptions } from './print-export-utils';

interface PrintExportToolbarProps {
  elementId: string;
  filename: string;
  organization?: Organization;
  data?: any[];
  showCSV?: boolean;
  showPDF?: boolean;
  showPrint?: boolean;
  className?: string;
}

export function PrintExportToolbar({
  elementId,
  filename,
  organization,
  data,
  showCSV = true,
  showPDF = true,
  showPrint = true,
  className = ""
}: PrintExportToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExportCSV = async () => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading('csv');
      exportToCSV(data, filename);
      toast({
        title: "Export Successful",
        description: "CSV file downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV file",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading('pdf');
      const options: PrintOptions = {
        filename,
        organization,
        showHeader: true,
        format: 'a4',
        orientation: 'portrait'
      };
      await exportToPDF(elementId, options);
      toast({
        title: "Export Successful",
        description: "PDF file downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF file",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handlePrint = () => {
    try {
      setLoading('print');
      printElement(elementId);
      toast({
        title: "Print Initiated",
        description: "Print dialog opened"
      });
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Failed to open print dialog",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showPrint && (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          disabled={loading === 'print'}
          className="flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>{loading === 'print' ? 'Printing...' : 'Print'}</span>
        </Button>
      )}

      {showPDF && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          disabled={loading === 'pdf'}
          className="flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>{loading === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
        </Button>
      )}

      {showCSV && data && data.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={loading === 'csv'}
          className="flex items-center space-x-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{loading === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
        </Button>
      )}
    </div>
  );
}