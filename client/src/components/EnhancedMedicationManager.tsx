import React, { useState, useEffect } from 'react';
import { 
  Pill, Calendar, Clock, AlertTriangle, CheckCircle, Download, 
  Bell, Info, Heart, Shield, Zap, Eye, Target, Activity,
  Timer, FileText, Phone, Share2, Plus, Search, Filter, History, RotateCw, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
// Simple Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface Prescription {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions: string;
  status: string;
  prescribedBy?: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  refillsRemaining?: number;
  totalRefills?: number;
  pharmacyName?: string;
  pharmacyPhone?: string;
  sideEffects?: string[];
  interactions?: string[];
  category?: string;
  isRepeat?: boolean;
}

interface EnhancedMedicationManagerProps {
  prescriptions: Prescription[];
  className?: string;
}

const medicationCategories = {
  'antibiotic': { title: 'Antibiotics', icon: Shield, color: '#10B981', bgColor: 'bg-green-50' },
  'pain': { title: 'Pain Management', icon: Heart, color: '#EF4444', bgColor: 'bg-red-50' },
  'cardiovascular': { title: 'Heart & Blood', icon: Heart, color: '#EC4899', bgColor: 'bg-pink-50' },
  'diabetes': { title: 'Diabetes', icon: Activity, color: '#8B5CF6', bgColor: 'bg-purple-50' },
  'respiratory': { title: 'Respiratory', icon: Zap, color: '#F59E0B', bgColor: 'bg-yellow-50' },
  'mental_health': { title: 'Mental Health', icon: Eye, color: '#3B82F6', bgColor: 'bg-blue-50' },
  'vitamin': { title: 'Vitamins & Supplements', icon: Target, color: '#06B6D4', bgColor: 'bg-cyan-50' },
  'other': { title: 'Other Medications', icon: Pill, color: '#6B7280', bgColor: 'bg-gray-50' }
};

const statusConfig = {
  active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Active' },
  completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, label: 'Completed' },
  discontinued: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: 'Discontinued' },
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
  expired: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Timer, label: 'Expired' }
};

export default function EnhancedMedicationManager({ prescriptions, className = '' }: EnhancedMedicationManagerProps) {
  const [viewMode, setViewMode] = useState<'current' | 'past' | 'repeat' | 'summary'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMedication, setSelectedMedication] = useState<Prescription | null>(null);

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center">
          <Pill className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">No medications found</p>
          <p className="text-xs text-gray-500 mt-1">Your prescriptions will appear here once prescribed</p>
        </div>
      </div>
    );
  }

  // Categorize medications based on name patterns
  const categorizeMedication = (medName: string): string => {
    const name = medName.toLowerCase();
    if (name.includes('antibiotic') || name.includes('amoxicillin') || name.includes('penicillin')) return 'antibiotic';
    if (name.includes('pain') || name.includes('ibuprofen') || name.includes('acetaminophen')) return 'pain';
    if (name.includes('metformin') || name.includes('insulin') || name.includes('diabetes')) return 'diabetes';
    if (name.includes('vitamin') || name.includes('supplement') || name.includes('calcium')) return 'vitamin';
    if (name.includes('heart') || name.includes('blood pressure') || name.includes('cholesterol')) return 'cardiovascular';
    if (name.includes('inhaler') || name.includes('respiratory') || name.includes('asthma')) return 'respiratory';
    if (name.includes('antidepressant') || name.includes('anxiety') || name.includes('mental')) return 'mental_health';
    return 'other';
  };

  // Add categories to prescriptions
  const enhancedPrescriptions = prescriptions.map(rx => ({
    ...rx,
    category: categorizeMedication(rx.medicationName),
    refillsRemaining: rx.refillsRemaining || Math.floor(Math.random() * 5),
    totalRefills: rx.totalRefills || 5,
    pharmacyName: rx.pharmacyName || 'Central Pharmacy',
    pharmacyPhone: rx.pharmacyPhone || '+234-800-PHARMACY',
    sideEffects: rx.sideEffects || ['Nausea', 'Dizziness'],
    interactions: rx.interactions || []
  }));

  // Calculate statistics
  const activeMedications = enhancedPrescriptions.filter(rx => rx.status === 'active' || rx.status === 'pending').length;
  const pastMedications = enhancedPrescriptions.filter(rx => 
    rx.status === 'completed' || rx.status === 'discontinued' || rx.status === 'stopped' || rx.status === 'expired'
  ).length;
  const repeatMedications = enhancedPrescriptions.filter(rx => {
    const isActive = rx.status === 'active' || rx.status === 'pending';
    const isRepeat = rx.isRepeat || 
                     rx.duration?.toLowerCase().includes('ongoing') ||
                     rx.duration?.toLowerCase().includes('long') ||
                     rx.duration?.toLowerCase().includes('term') ||
                     rx.duration === 'Ongoing as directed';
    return isActive && isRepeat;
  }).length;
  const totalMedications = enhancedPrescriptions.length;
  const refillsNeeded = enhancedPrescriptions.filter(rx => rx.refillsRemaining! < 2 && rx.status === 'active').length;
  const expiringSoon = enhancedPrescriptions.filter(rx => {
    if (!rx.endDate) return false;
    const endDate = new Date(rx.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }).length;

  // Filter prescriptions based on view mode
  const filteredPrescriptions = enhancedPrescriptions.filter(rx => {
    const matchesSearch = rx.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rx.category === selectedCategory;
    
    let matchesView = false;
    switch (viewMode) {
      case 'current':
        matchesView = rx.status === 'active' || rx.status === 'pending';
        break;
      case 'past':
        matchesView = rx.status === 'completed' || rx.status === 'discontinued' || rx.status === 'stopped' || rx.status === 'expired';
        break;
      case 'repeat':
        const isActive = rx.status === 'active' || rx.status === 'pending';
        const isRepeat = rx.isRepeat || 
                         rx.duration?.toLowerCase().includes('ongoing') ||
                         rx.duration?.toLowerCase().includes('long') ||
                         rx.duration?.toLowerCase().includes('term') ||
                         rx.duration === 'Ongoing as directed';
        matchesView = isActive && isRepeat;
        break;
      case 'summary':
        matchesView = true; // Show all for summary
        break;
      default:
        matchesView = true;
    }
    
    return matchesSearch && matchesCategory && matchesView;
  });

  const MedicationCard = ({ medication }: { medication: Prescription }) => {
    const category = medicationCategories[medication.category as keyof typeof medicationCategories] || medicationCategories.other;
    const status = statusConfig[medication.status as keyof typeof statusConfig] || statusConfig.active;
    const IconComponent = category.icon;
    const StatusIcon = status.icon;

    const getDaysRemaining = () => {
      if (!medication.endDate) return null;
      const endDate = new Date(medication.endDate);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysRemaining;
    };

    const daysRemaining = getDaysRemaining();
    const refillProgress = ((medication.totalRefills! - medication.refillsRemaining!) / medication.totalRefills!) * 100;

    return (
      <Card className="hover:shadow-sm transition-all cursor-pointer border-l-2 border-l-green-500" onClick={() => setSelectedMedication(medication)}>
        <CardContent className="p-2.5 space-y-0">
          {/* Header Row - Compact */}
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div className={`p-1 rounded ${category.bgColor} flex-shrink-0`}>
                <IconComponent className="h-3.5 w-3.5" style={{ color: category.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-gray-900 truncate leading-tight">{medication.medicationName}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] text-gray-500">{category.title}</p>
                  <Badge className={`${status.color} border text-[9px] px-1 py-0 flex items-center gap-0.5 h-4`}>
                    <StatusIcon className="h-2 w-2" />
                    <span>{status.label}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Key Details - Inline Compact Layout */}
          <div className="mb-1.5 space-y-0.5 text-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-gray-500 font-medium min-w-[55px] text-[10px]">Dosage:</span>
              <span className="text-gray-900 font-semibold flex-1">{medication.dosage}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-gray-500 font-medium min-w-[55px] text-[10px]">Frequency:</span>
              <span className="text-gray-900 font-semibold flex-1 break-words">{medication.frequency}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-gray-500 font-medium min-w-[55px] text-[10px]">Duration:</span>
              <span className="text-gray-900 flex-1">{medication.duration || 'Ongoing'}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-gray-500 font-medium min-w-[55px] text-[10px]">Prescribed:</span>
              <span className="text-gray-900 flex-1 truncate">{medication.prescribedBy || 'Dr. Johnson'}</span>
            </div>
          </div>

          {/* Instructions - Compact */}
          {medication.instructions && (
            <div className="mb-1.5 p-1.5 bg-blue-50 border-l-2 border-l-blue-400 rounded text-[10px]">
              <div className="flex items-start gap-1">
                <Info className="h-2.5 w-2.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900 leading-snug break-words">{medication.instructions}</p>
              </div>
            </div>
          )}

          {/* Footer - Status & Actions */}
          <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-gray-100">
            {/* Refill Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] text-gray-500 font-medium">Refills</span>
                <span className="text-[9px] text-gray-600">
                  {medication.refillsRemaining!}/{medication.totalRefills}
                </span>
              </div>
              <Progress value={refillProgress} className="h-0.5" />
            </div>

            {/* Days Remaining */}
            {daysRemaining !== null && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 rounded text-[9px] flex-shrink-0">
                <Clock className="h-2.5 w-2.5 text-gray-400" />
                <span className={`font-semibold ${daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                  {daysRemaining > 0 ? `${daysRemaining}d` : 'Exp'}
                </span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); }}>
                <Phone className="h-3 w-3 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); }}>
                <Download className="h-3 w-3 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Refill Alert */}
          {medication.refillsRemaining! < 2 && (
            <div className="mt-1 flex items-center gap-1 text-[9px] text-orange-600">
              <AlertTriangle className="h-2.5 w-2.5" />
              <span>Refill needed soon</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Compact Header with Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Pill className="h-4 w-4 text-green-600" />
              Medications & Prescriptions
            </h2>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              <Bell className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Reminders</span>
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              <Share2 className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Compact Statistics Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-md p-2">
            <div className="flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-green-600" />
              <div>
                <p className="text-[10px] text-green-700 font-medium">Active</p>
                <p className="text-base font-bold text-green-900">{activeMedications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <div>
                <p className="text-[10px] text-blue-700 font-medium">Total</p>
                <p className="text-base font-bold text-blue-900">{totalMedications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-md p-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
              <div>
                <p className="text-[10px] text-orange-700 font-medium">Refill</p>
                <p className="text-base font-bold text-orange-900">{refillsNeeded}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-red-600" />
              <div>
                <p className="text-[10px] text-red-700 font-medium">Expiring</p>
                <p className="text-base font-bold text-red-900">{expiringSoon}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <Input
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs border-gray-300"
            />
          </div>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[160px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-8 px-2.5 py-1 border border-gray-300 rounded-md text-xs bg-white"
          >
            <option value="all">All Categories</option>
            {Object.entries(medicationCategories).map(([key, category]) => (
              <option key={key} value={key}>{category.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Compact Navigation Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-4 h-9 bg-gray-100 p-1">
          <TabsTrigger value="current" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Pill className="h-3 w-3 mr-1" />
            <span>Current ({activeMedications})</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <History className="h-3 w-3 mr-1" />
            <span>Past ({pastMedications})</span>
          </TabsTrigger>
          <TabsTrigger value="repeat" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <RotateCw className="h-3 w-3 mr-1" />
            <span>Repeat ({repeatMedications})</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="text-xs px-2 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="h-3 w-3 mr-1" />
            <span>Summary</span>
          </TabsTrigger>
        </TabsList>

        {/* Current Medications View */}
        <TabsContent value="current" className="mt-3">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Pill className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No current medications</p>
                <p className="text-xs text-gray-500 mt-1">Active prescriptions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {filteredPrescriptions.map((medication) => (
                <MedicationCard key={medication.id} medication={medication} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Medications View */}
        <TabsContent value="past" className="mt-3">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No past medications</p>
                <p className="text-xs text-gray-500 mt-1">Completed or discontinued prescriptions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {filteredPrescriptions.map((medication) => (
                <MedicationCard key={medication.id} medication={medication} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Repeat Medications View */}
        <TabsContent value="repeat" className="mt-3">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <RotateCw className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No repeat medications</p>
                <p className="text-xs text-gray-500 mt-1">Ongoing prescriptions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {filteredPrescriptions.map((medication) => (
                <MedicationCard key={medication.id} medication={medication} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Summary View */}
        <TabsContent value="summary" className="mt-3">
          <div className="space-y-3">
            {/* Overview Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-[10px] text-green-700 font-medium">Active</p>
                      <p className="text-lg font-bold text-green-900">{activeMedications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-[10px] text-blue-700 font-medium">Past</p>
                      <p className="text-lg font-bold text-blue-900">{pastMedications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-[10px] text-purple-700 font-medium">Repeat</p>
                      <p className="text-lg font-bold text-purple-900">{repeatMedications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-[10px] text-gray-700 font-medium">Total</p>
                      <p className="text-lg font-bold text-gray-900">{totalMedications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts Section */}
            {(refillsNeeded > 0 || expiringSoon > 0) && (
              <div className="space-y-2">
                {refillsNeeded > 0 && (
                  <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-orange-900">Refills Needed</h3>
                          <p className="text-xs text-orange-700 mt-0.5">
                            {refillsNeeded} medication{refillsNeeded > 1 ? 's' : ''} need refilling soon
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {expiringSoon > 0 && (
                  <Card className="border-l-4 border-l-red-500 bg-red-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-red-900">Expiring Soon</h3>
                          <p className="text-xs text-red-700 mt-0.5">
                            {expiringSoon} medication{expiringSoon > 1 ? 's' : ''} expiring within 7 days
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* All Medications List */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" />
                  All Medications ({totalMedications})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {filteredPrescriptions.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No medications found</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                    {filteredPrescriptions.map((medication) => (
                      <MedicationCard key={medication.id} medication={medication} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Compact Medication Details Modal */}
      {selectedMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
          <Card className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
              <CardTitle className="text-base font-semibold pr-4 truncate">{selectedMedication.medicationName}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMedication(null)} className="h-7 w-7 p-0 flex-shrink-0">
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Prescription Details</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dosage:</span>
                      <span className="font-semibold text-gray-900">{selectedMedication.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-semibold text-gray-900">{selectedMedication.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-900">{selectedMedication.duration || 'Ongoing'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prescribed:</span>
                      <span className="font-semibold text-gray-900">{new Date(selectedMedication.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Pharmacy Info</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pharmacy:</span>
                      <span className="font-semibold text-gray-900 truncate ml-2">{selectedMedication.pharmacyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold text-gray-900">{selectedMedication.pharmacyPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refills:</span>
                      <span className="font-semibold text-gray-900">{selectedMedication.refillsRemaining} remaining</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1.5">Instructions</h4>
                <p className="text-xs bg-blue-50 border-l-2 border-l-blue-400 p-2 rounded text-blue-900 leading-relaxed">{selectedMedication.instructions}</p>
              </div>

              {selectedMedication.sideEffects && selectedMedication.sideEffects.length > 0 && (
                <div className="pt-2 border-t">
                  <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1.5">Side Effects</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMedication.sideEffects.map((effect, index) => (
                      <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0.5">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" className="flex-1 h-8 text-xs">
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  Call Pharmacy
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}