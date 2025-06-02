import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskRound, Plus, Eye, Printer, Calendar, User, Clock, TestTube } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import LabOrderForm from "@/components/lab-order-form";

interface PatientLabResultsProps {
  patientId: number;
}

interface LabOrder {
  id: number;
  patientId: number;
  orderedBy: number;
  status: string;
  priority: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface LabOrderItem {
  id: number;
  labOrderId: number;
  labTestId: number;
  result: string | null;
  remarks: string | null;
  status: string;
  completedBy: number | null;
  completedAt: string | null;
  testName: string;
  testCategory: string;
  referenceRange: string;
  units: string;
}

export default function PatientLabResults({ patientId }: PatientLabResultsProps) {
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Fetch lab orders for this patient
  const { data: labOrders = [], isLoading: ordersLoading } = useQuery<LabOrder[]>({
    queryKey: [`/api/patients/${patientId}/lab-orders`],
  });

  // Fetch lab order items for selected order
  const { data: orderItems = [] } = useQuery<LabOrderItem[]>({
    queryKey: [`/api/lab-orders/${selectedOrderId}/items`],
    enabled: !!selectedOrderId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (ordersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <TestTube className="w-4 h-4 animate-pulse" />
              Loading lab results...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlaskRound className="w-5 h-5 text-green-500" />
                Laboratory Results
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                View lab orders and test results for this patient
              </p>
            </div>
            <Button 
              onClick={() => setShowLabOrderModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Order Lab Test
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {labOrders.length > 0 ? (
                <div className="space-y-4">
                  {labOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">Lab Order #{order.id}</h4>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-700 block">Order Date</span>
                              <p className="text-gray-900">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-700 block">Status</span>
                              <p className="text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-700 block">Priority</span>
                              <p className="text-gray-900 capitalize">{order.priority}</p>
                            </div>
                          </div>
                          
                          {order.notes && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                              <span className="font-medium text-blue-800 block mb-1">Notes:</span>
                              <p className="text-blue-900 text-sm">{order.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {selectedOrderId === order.id ? 'Hide' : 'View'} Tests
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="w-4 h-4 mr-1" />
                            Print
                          </Button>
                        </div>
                      </div>

                      {/* Show order items when expanded */}
                      {selectedOrderId === order.id && orderItems.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h5 className="font-medium text-gray-900 mb-3">Test Results</h5>
                          <div className="space-y-3">
                            {orderItems.map((item) => (
                              <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h6 className="font-medium text-gray-900">{item.testName}</h6>
                                      <Badge variant="outline" className="text-xs">
                                        {item.testCategory}
                                      </Badge>
                                      <Badge className={getStatusColor(item.status)} variant="outline">
                                        {item.status}
                                      </Badge>
                                    </div>
                                    
                                    {item.result && (
                                      <div className="bg-white border rounded p-2 mb-2">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                          <div>
                                            <span className="font-medium text-gray-700">Result:</span>
                                            <p className="text-gray-900">{item.result} {item.units}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Reference Range:</span>
                                            <p className="text-gray-900">{item.referenceRange}</p>
                                          </div>
                                          {item.completedAt && (
                                            <div>
                                              <span className="font-medium text-gray-700">Completed:</span>
                                              <p className="text-gray-900">{format(new Date(item.completedAt), 'MMM dd, yyyy')}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {item.remarks && (
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Remarks:</span> {item.remarks}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FlaskRound className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No lab orders yet</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Lab orders and results will appear here when available.
                  </p>
                  <Button 
                    onClick={() => setShowLabOrderModal(true)}
                    className="mt-4 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Order First Lab Test
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {labOrders.filter(order => order.status === 'pending').map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Lab Order #{order.id}</h4>
                    <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ordered on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {labOrders.filter(order => order.status === 'completed').map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Lab Order #{order.id}</h4>
                    <Badge className="bg-green-100 text-green-800">COMPLETED</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Completed on {format(new Date(order.updatedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4 mt-4">
              {labOrders.filter(order => order.status === 'in_progress').map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Lab Order #{order.id}</h4>
                    <Badge className="bg-blue-100 text-blue-800">IN PROGRESS</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Started on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lab Order Modal */}
      <Dialog open={showLabOrderModal} onOpenChange={setShowLabOrderModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Laboratory Tests</DialogTitle>
          </DialogHeader>
          <LabOrderForm 
            patientId={patientId}
            onOrderCreated={() => setShowLabOrderModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}