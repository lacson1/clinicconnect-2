import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Bell,
  Users,
  Stethoscope,
  X,
  CalendarDays,
  TrendingUp,
  Play
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface SmartAppointmentSchedulerProps {
  patientId?: number;
  defaultDate?: string;
}

export default function SmartAppointmentScheduler({ patientId, defaultDate }: SmartAppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [isBooking, setIsBooking] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: patientId || '',
    doctorId: '',
    appointmentTime: '',
    duration: '30',
    type: 'consultation',
    notes: '',
    priority: 'medium'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", selectedDate],
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["/api/users/doctors"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    enabled: !patientId, // Only fetch if we don't have a specific patient
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/appointments", "POST", {
      ...data,
      patientId: parseInt(data.patientId),
      doctorId: parseInt(data.doctorId),
      duration: parseInt(data.duration),
      appointmentDate: selectedDate,
      status: 'scheduled'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsBooking(false);
      setNewAppointment({
        patientId: patientId || '',
        doctorId: '',
        appointmentTime: '',
        duration: '30',
        type: 'consultation',
        notes: '',
        priority: 'medium'
      });
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest(`/api/appointments/${id}`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment status updated",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailableTimeSlots = () => {
    const bookedTimes = appointments.map(apt => apt.appointmentTime);
    const slots = [];
    
    for (let hour = 8; hour < 18; hour++) {
      for (let minutes of ['00', '30']) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minutes}`;
        if (!bookedTimes.includes(timeSlot)) {
          slots.push(timeSlot);
        }
      }
    }
    
    return slots;
  };

  const handleBookAppointment = () => {
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.appointmentTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    bookAppointmentMutation.mutate(newAppointment);
  };

  const todayAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
  );

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled'
  ).slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Quick Stats - Enhanced Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="healthcare-card border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Today's Appointments</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{todayAppointments.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="healthcare-card border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Available Slots</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{getAvailableTimeSlots().length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="healthcare-card border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {appointments.filter(apt => apt.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="healthcare-card border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Urgent Cases</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {appointments.filter(apt => apt.priority === 'urgent').length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Scheduler */}
      <Card className="healthcare-card shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="w-5 h-5 text-primary" />
            Appointment Scheduler
          </CardTitle>
          <Button
            onClick={() => setIsBooking(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Appointment</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selector - Enhanced */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Select Date:</Label>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto max-w-[200px] border-2 focus:border-primary/50"
            />
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>{getAvailableTimeSlots().length} slots available</span>
            </div>
          </div>

          {/* Appointments List - Enhanced */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Appointments for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              {appointments.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
                </Badge>
              )}
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <Card className="healthcare-card">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">No appointments scheduled</h4>
                  <p className="text-muted-foreground mb-4">
                    This date is available for scheduling. Click "Schedule Appointment" to book a slot.
                  </p>
                  <Button onClick={() => setIsBooking(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Schedule First Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {appointments
                  .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                  .map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="healthcare-card hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary"
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="flex flex-col items-center justify-center p-3 bg-primary/10 rounded-lg min-w-[80px]">
                              <Clock className="w-5 h-5 text-primary mb-1" />
                              <span className="text-base font-bold text-foreground">
                                {appointment.appointmentTime}
                              </span>
                              <span className="text-xs text-muted-foreground mt-0.5">
                                {appointment.duration} min
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-primary/60" />
                                  <span className="font-semibold text-base">{appointment.patientName}</span>
                                </div>
                                <Badge className={getPriorityColor(appointment.priority)}>
                                  {appointment.priority}
                                </Badge>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Stethoscope className="w-3.5 h-3.5 text-primary/60" />
                                  Dr. {appointment.doctorName}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="text-primary/60">•</span>
                                  <span className="capitalize">{appointment.type}</span>
                                </span>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded border-l-2 border-l-primary/30">
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {appointment.status === 'scheduled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus.mutate({
                                  id: appointment.id,
                                  status: 'confirmed'
                                })}
                                className="gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Confirm
                              </Button>
                            )}
                            
                            {appointment.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus.mutate({
                                  id: appointment.id,
                                  status: 'in-progress'
                                })}
                                className="gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Book Appointment Modal - Using Dialog Component */}
      <Dialog open={isBooking} onOpenChange={setIsBooking}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="w-5 h-5 text-primary" />
              Schedule New Appointment
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to schedule a new appointment for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {!patientId && (
              <div className="space-y-2">
                <Label htmlFor="patient" className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Patient *
                </Label>
                {patients.length > 0 ? (
                  <Select
                    value={newAppointment.patientId}
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient: any) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-11 w-full rounded-md border border-input bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                    No patients available
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor" className="text-sm font-semibold flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-muted-foreground" />
                  Doctor *
                </Label>
                {doctors.length > 0 ? (
                  <Select
                    value={newAppointment.doctorId}
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, doctorId: value }))}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor: any) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          Dr. {doctor.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-11 w-full rounded-md border border-input bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                    No doctors available
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Time Slot *
                </Label>
                {getAvailableTimeSlots().length > 0 ? (
                  <Select
                    value={newAppointment.appointmentTime}
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, appointmentTime: value }))}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimeSlots().map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-11 w-full rounded-md border border-input bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                    No time slots available for this date
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-semibold">Duration</Label>
                <Select
                  value={newAppointment.duration}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-semibold">Appointment Type</Label>
                <Select
                  value={newAppointment.type}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="check-up">Check-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="therapy">Therapy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                Priority
              </Label>
              <Select
                value={newAppointment.priority}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or special instructions..."
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[100px] resize-none"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsBooking(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookAppointment} 
              disabled={bookAppointmentMutation.isPending}
              className="gap-2"
            >
              {bookAppointmentMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Schedule Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upcoming Appointments Preview - Enhanced */}
      {upcomingAppointments.length > 0 && (
        <Card className="healthcare-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" />
              Upcoming Appointments
              <Badge variant="secondary" className="ml-2">
                {upcomingAppointments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className="healthcare-card hover:shadow-md transition-all border-l-4 border-l-primary/30"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{appointment.patientName}</span>
                            <Badge className={getPriorityColor(appointment.priority)}>
                              {appointment.priority}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })} at {appointment.appointmentTime}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5" />
                              Dr. {appointment.doctorName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}