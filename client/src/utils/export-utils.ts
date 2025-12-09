import ExcelJS from 'exceljs';

export interface ExportData {
  [key: string]: any;
}

export const exportToExcel = async (data: ExportData[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Get headers from first data object
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    
    // Add headers with styling
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add data rows
    data.forEach((row) => {
      const values = headers.map(header => row[header] ?? '');
      worksheet.addRow(values);
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

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToCSV = (data: ExportData[], filename: string) => {
  if (data.length === 0) {
    return;
  }

  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] ?? '';
        // Escape commas and quotes in values
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];
  
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = async (elementId: string, filename: string) => {
  // This would require a library like jsPDF or html2pdf
  // For now, we'll use the browser's print dialog
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #3B82F6; color: white; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

export const exportDashboardStats = (stats: any) => {
  const exportData = [
    {
      Metric: 'Total Patients',
      Value: stats.totalPatients || 0,
      Change: `${stats.patientsChange || 0}%`
    },
    {
      Metric: "Today's Visits",
      Value: stats.todayVisits || 0,
      Change: `${stats.visitsChange || 0}%`
    },
    {
      Metric: 'Total Revenue',
      Value: `₦${stats.totalRevenue?.toLocaleString() || 0}`,
      Change: `${stats.revenueChange || 0}%`
    },
    {
      Metric: 'Active Staff',
      Value: stats.activeStaff || 0,
      Change: 'N/A'
    },
    {
      Metric: 'Pending Labs',
      Value: stats.pendingLabs || 0,
      Change: `${stats.labsChange || 0}%`
    },
    {
      Metric: 'Low Stock Items',
      Value: stats.lowStockItems || 0,
      Change: `${stats.stockChange || 0}%`
    },
    {
      Metric: "Today's Appointments",
      Value: stats.appointmentsToday || 0,
      Change: 'N/A'
    },
    {
      Metric: 'Completed Appointments',
      Value: stats.completedAppointments || 0,
      Change: 'N/A'
    }
  ];
  
  const timestamp = new Date().toISOString().split('T')[0];
  exportToExcel(exportData, `dashboard-stats-${timestamp}`);
};

export const exportActivityLog = (activities: any[]) => {
  const exportData = activities.map(activity => ({
    Timestamp: activity.timestamp,
    User: activity.user,
    Action: activity.description,
    Type: activity.type,
    Severity: activity.severity
  }));
  
  const timestamp = new Date().toISOString().split('T')[0];
  exportToExcel(exportData, `activity-log-${timestamp}`);
};

export const exportStaffActivity = (staff: any[]) => {
  const exportData = staff.map(member => ({
    Name: member.name,
    Role: member.role,
    Status: member.status,
    'Tasks Completed': member.tasksCompleted,
    'Current Task': member.currentTask,
    'Last Active': member.lastActive
  }));
  
  const timestamp = new Date().toISOString().split('T')[0];
  exportToExcel(exportData, `staff-activity-${timestamp}`);
};

