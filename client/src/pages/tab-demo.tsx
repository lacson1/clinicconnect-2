import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicTabRenderer } from '@/components/patient-tabs/DynamicTabRenderer';

export default function TabDemo() {
  // Mock patient data for demo
  const mockPatient = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-01-15',
    gender: 'male',
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Tab Management System Demo
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            This page demonstrates the dynamic tab management system. Click the settings icon to customize tabs.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Features:</h3>
            <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
              <li>Drag and drop to reorder tabs</li>
              <li>Toggle tab visibility with the eye icon</li>
              <li>Edit tab labels and icons</li>
              <li>Create custom tabs with markdown content</li>
              <li>Delete custom tabs (system tabs cannot be deleted)</li>
              <li>Changes persist across sessions and are organization-scoped</li>
            </ul>
          </div>

          <DynamicTabRenderer 
            patient={mockPatient}
            defaultTab="overview"
          />
        </CardContent>
      </Card>
    </div>
  );
}
