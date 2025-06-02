import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskRound, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";

interface LabOrder {
  id: number;
  patientId: number;
  orderedBy: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt: string | null;
  doctorName: string;
}

interface PatientLabOrdersSummaryProps {
  patientId: number;
}

export default function PatientLabOrdersSummary({ patientId }: PatientLabOrdersSummaryProps) {
  const { data: labOrders, isLoading } = useQuery<LabOrder[]>({
    queryKey: [`/api/patients/${patientId}/lab-orders`],
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!labOrders || labOrders.length === 0) {
    return (
      <div className="text-center py-4">
        <FlaskRound className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No lab orders</p>
      </div>
    );
  }

  const recentOrders = labOrders.slice(0, 3);
  const pendingCount = labOrders.filter(order => order.status === 'pending').length;
  const completedCount = labOrders.filter(order => order.status === 'completed').length;

  return (
    <div className="space-y-3">
      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-orange-50 p-2 rounded-md text-center">
          <div className="text-orange-600 text-xs font-medium">Pending</div>
          <div className="text-lg font-bold text-orange-800">{pendingCount}</div>
        </div>
        <div className="bg-green-50 p-2 rounded-md text-center">
          <div className="text-green-600 text-xs font-medium">Complete</div>
          <div className="text-lg font-bold text-green-800">{completedCount}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-2">
        {recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {order.status === 'pending' && <Clock className="w-3 h-3 text-orange-500" />}
                {order.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                {order.status === 'cancelled' && <AlertCircle className="w-3 h-3 text-red-500" />}
                <span className="font-medium text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                By Dr. {order.doctorName || `Doctor #${order.orderedBy}`}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                order.status === 'pending' ? 'border-orange-200 text-orange-700' :
                order.status === 'completed' ? 'border-green-200 text-green-700' :
                'border-red-200 text-red-700'
              }`}
            >
              {order.status}
            </Badge>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {labOrders.length > 3 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs mt-2 h-8"
          onClick={() => {
            // This will be handled by the parent component's tab switching
            const event = new CustomEvent('switchToLabsTab');
            window.dispatchEvent(event);
          }}
        >
          <Eye className="w-3 h-3 mr-1" />
          View All ({labOrders.length})
        </Button>
      )}
    </div>
  );
}