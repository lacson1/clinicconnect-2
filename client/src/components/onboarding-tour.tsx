import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  Users, 
  FileText, 
  TestTube, 
  Pill, 
  Calendar,
  BarChart3,
  Stethoscope,
  Heart,
  Shield,
  Star,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Minimize2,
  Maximize2,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips?: string[];
}

interface OnboardingTourProps {
  userRole: string;
  userName: string;
  onComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingTour({ 
  userRole, 
  userName, 
  onComplete, 
  isOpen, 
  onClose 
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Slide in after a short delay
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsExpanded(false);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setIsVisible(false);
      onClose();
    }, 200);
  }, [onClose]);

  const handleComplete = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setIsVisible(false);
      onComplete();
      onClose();
    }, 200);
  }, [onComplete, onClose]);

  // Simplified role-specific steps
  const getTourSteps = (): TourStep[] => {
    const roleSteps: Record<string, TourStep[]> = {
      doctor: [
        { id: 'patients', title: 'Patient Records', description: 'View and manage patient histories', icon: <Users className="h-4 w-4" /> },
        { id: 'consultations', title: 'Consultations', description: 'Smart forms with auto-suggestions', icon: <FileText className="h-4 w-4" /> },
        { id: 'lab-orders', title: 'Lab Orders', description: 'Order tests with one click', icon: <TestTube className="h-4 w-4" /> },
        { id: 'prescriptions', title: 'Prescriptions', description: 'Digital Rx with drug checks', icon: <Pill className="h-4 w-4" /> },
      ],
      nurse: [
        { id: 'patients', title: 'Patient Care', description: 'Monitor and coordinate care', icon: <Users className="h-4 w-4" /> },
        { id: 'vitals', title: 'Vital Signs', description: 'Track vitals with trend alerts', icon: <Stethoscope className="h-4 w-4" /> },
        { id: 'appointments', title: 'Appointments', description: 'Manage schedules easily', icon: <Calendar className="h-4 w-4" /> },
      ],
      pharmacist: [
        { id: 'pharmacy', title: 'Pharmacy', description: 'Process prescriptions safely', icon: <Pill className="h-4 w-4" /> },
        { id: 'inventory', title: 'Inventory', description: 'Track stock and expiry dates', icon: <BarChart3 className="h-4 w-4" /> },
      ],
      admin: [
        { id: 'users', title: 'Staff Management', description: 'Manage accounts and roles', icon: <Shield className="h-4 w-4" /> },
        { id: 'analytics', title: 'Analytics', description: 'Monitor clinic performance', icon: <BarChart3 className="h-4 w-4" /> },
      ],
      receptionist: [
        { id: 'appointments', title: 'Appointments', description: 'Schedule and manage visits', icon: <Calendar className="h-4 w-4" /> },
        { id: 'patients', title: 'Check-in', description: 'Register and check in patients', icon: <Users className="h-4 w-4" /> },
      ],
    };

    return roleSteps[userRole] || roleSteps.receptionist;
  };

  const tourSteps = getTourSteps();

  if (!isOpen) return null;

  // Compact welcome card (default view)
  if (!isExpanded) {
    return (
      <div
        className={cn(
          "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out",
          isVisible && !isExiting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
      >
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-2xl max-w-sm overflow-hidden">
          {/* Quick dismiss bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-black/10 border-b border-white/10">
            <span className="text-xs text-white/80 font-medium flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Quick Start Guide
            </span>
            <button 
              onClick={handleDismiss}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">
                  Welcome, {userName}! 👋
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Ready to explore your {userRole} dashboard?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 bg-white text-blue-700 hover:bg-white/90 text-xs h-8"
                onClick={() => setIsExpanded(true)}
              >
                <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                Show me around
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs h-8"
                onClick={handleDismiss}
              >
                Maybe later
              </Button>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="px-4 pb-2">
            <p className="text-[10px] text-white/50 text-center">
              Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">ESC</kbd> to dismiss
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Expanded tour view
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const currentStepData = tourSteps[currentStep];

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out",
        isVisible && !isExiting ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Quick Tour</span>
            <Badge variant="secondary" className="bg-white/20 text-white text-[10px] px-1.5">
              {currentStep + 1}/{tourSteps.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-1.5 hover:bg-white/20 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Minimize"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
              {currentStepData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                {currentStepData.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentStep 
                    ? "bg-blue-600 w-4" 
                    : idx < currentStep 
                      ? "bg-blue-300" 
                      : "bg-slate-200 dark:bg-slate-700"
                )}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="h-7 text-xs px-2"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-7 text-xs text-slate-500 hover:text-slate-700"
          >
            Skip
          </Button>

          {currentStep < tourSteps.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="h-7 text-xs px-2 bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleComplete}
              className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700"
            >
              <Star className="h-3.5 w-3.5 mr-1" />
              Done
            </Button>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="px-3 pb-2 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[10px] text-slate-400 text-center">
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px]">ESC</kbd> to dismiss • 
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px] mx-1">←</kbd>
            <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px]">→</kbd> to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
