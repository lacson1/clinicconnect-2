import { useToast } from "@/hooks/use-toast";

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  userId?: number;
  organizationId?: number;
  patientId?: number;
  url?: string;
  userAgent?: string;
  timestamp: Date;
  sessionId?: string;
  action?: string;
  component?: string;
}

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context: ErrorContext;
  stack?: string;
  resolved?: boolean;
  retryable?: boolean;
}

class ErrorTracker {
  private errors: AppError[] = [];
  private maxErrors = 100;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        type: ErrorType.CLIENT,
        severity: ErrorSeverity.HIGH,
        message: event.message || 'Uncaught JavaScript error',
        originalError: event.error,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          sessionId: this.sessionId,
          component: 'Global'
        },
        stack: event.error?.stack
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: ErrorType.CLIENT,
        severity: ErrorSeverity.HIGH,
        message: `Unhandled promise rejection: ${event.reason}`,
        originalError: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          sessionId: this.sessionId,
          component: 'Promise'
        }
      });
    });
  }

  trackError(error: Omit<AppError, 'id'>): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const appError: AppError = {
      ...error,
      id: errorId,
      context: {
        ...error.context,
        sessionId: this.sessionId,
        timestamp: error.context.timestamp || new Date()
      }
    };

    this.errors.push(appError);

    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Tracked: ${error.type} - ${error.severity}`);
      console.error('Message:', error.message);
      console.error('Context:', error.context);
      if (error.originalError) {
        console.error('Original Error:', error.originalError);
      }
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
      console.groupEnd();
    }

    // Send to server for logging
    this.sendErrorToServer(appError);

    return errorId;
  }

  private async sendErrorToServer(error: AppError) {
    try {
      await fetch('/api/errors/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            id: error.id,
            type: error.type,
            severity: error.severity,
            message: error.message,
            stack: error.stack,
            context: error.context,
            retryable: error.retryable
          }
        })
      });
    } catch (serverError) {
      console.error('Failed to send error to server:', serverError);
    }
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  getErrorsByType(type: ErrorType): AppError[] {
    return this.errors.filter(error => error.type === type);
  }

  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  clearErrors(): void {
    this.errors = [];
  }

  markErrorAsResolved(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

// Helper functions for common error scenarios
export const trackAPIError = (error: any, context: Partial<ErrorContext> = {}) => {
  let errorType = ErrorType.SERVER;
  let severity = ErrorSeverity.MEDIUM;
  let message = 'API request failed';
  let retryable = false;

  if (error.response) {
    const status = error.response.status;
    message = error.response.data?.message || error.message || 'API request failed';
    
    if (status >= 400 && status < 500) {
      errorType = status === 401 ? ErrorType.AUTHENTICATION : 
                  status === 403 ? ErrorType.AUTHORIZATION : 
                  status === 422 ? ErrorType.VALIDATION : ErrorType.CLIENT;
      severity = status === 401 || status === 403 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
    } else if (status >= 500) {
      errorType = ErrorType.SERVER;
      severity = ErrorSeverity.HIGH;
      retryable = true;
    }
  } else if (error.request) {
    errorType = ErrorType.NETWORK;
    severity = ErrorSeverity.HIGH;
    message = 'Network request failed';
    retryable = true;
  }

  return errorTracker.trackError({
    type: errorType,
    severity,
    message,
    originalError: error,
    retryable,
    context: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      ...context
    }
  });
};

export const trackValidationError = (message: string, context: Partial<ErrorContext> = {}) => {
  return errorTracker.trackError({
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
    message,
    context: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      ...context
    }
  });
};

export const trackUserAction = (action: string, success: boolean, context: Partial<ErrorContext> = {}) => {
  if (!success) {
    return errorTracker.trackError({
      type: ErrorType.CLIENT,
      severity: ErrorSeverity.LOW,
      message: `User action failed: ${action}`,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        action,
        ...context
      }
    });
  }
};

// React hook for error handling
export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (error: any, context: Partial<ErrorContext> = {}) => {
    const errorId = trackAPIError(error, context);
    
    // Show user-friendly error message
    let title = "Something went wrong";
    let description = "Please try again later";
    let variant: "default" | "destructive" = "destructive";

    if (error.response?.status === 401) {
      title = "Authentication Required";
      description = "Please log in to continue";
    } else if (error.response?.status === 403) {
      title = "Access Denied";
      description = "You don't have permission to perform this action";
    } else if (error.response?.status === 422) {
      title = "Validation Error";
      description = error.response.data?.message || "Please check your input";
      variant = "default";
    } else if (error.response?.status >= 500) {
      title = "Server Error";
      description = "Our servers are experiencing issues. Please try again later";
    } else if (!error.response) {
      title = "Connection Error";
      description = "Please check your internet connection";
    }

    toast({
      title,
      description: `${description} (Error ID: ${errorId.slice(-8)})`,
      variant
    });

    return errorId;
  };

  return { handleError };
};