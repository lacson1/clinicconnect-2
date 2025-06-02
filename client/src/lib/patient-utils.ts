/**
 * Utility functions for patient-related operations
 */

export interface PatientName {
  title?: string | null;
  firstName: string;
  lastName: string;
}

/**
 * Format patient name with title consistently across the application
 */
export function formatPatientName(patient: PatientName): string {
  const { title, firstName, lastName } = patient;
  
  // Build the full name with title if available
  const titlePart = title ? `${title} ` : '';
  const namePart = `${firstName} ${lastName}`.trim();
  
  return `${titlePart}${namePart}`;
}

/**
 * Format patient name for display in dropdowns or lists (shorter format)
 */
export function formatPatientNameShort(patient: PatientName): string {
  return formatPatientName(patient);
}

/**
 * Get patient initials for avatar display
 */
export function getPatientInitials(patient: PatientName): string {
  const firstName = patient.firstName || '';
  const lastName = patient.lastName || '';
  
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  return `${firstInitial}${lastInitial}`;
}