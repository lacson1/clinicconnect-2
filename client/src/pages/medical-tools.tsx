import React, { useState } from 'react';
import { MedicalCalculator } from '@/components/medical-calculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';

export function MedicalToolsPage() {
  const [activeTab, setActiveTab] = useState("calculators");

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="bg-gray-50 border-b border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Medical Tools</h1>
            <p className="text-sm text-gray-600">Clinical calculators and patient communication tools</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="calculators" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Medical Calculators
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full">
          {activeTab === "calculators" && (
            <MedicalCalculator />
          )}
        </div>
      </div>
    </div>
  );
}