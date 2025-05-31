// Utility functions for consistent name display across the application

interface UserProfile {
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string;
}

/**
 * Get the display name for a user with proper priority:
 * 1. Title + First Name + Last Name (if available)
 * 2. First Name + Last Name (if available)
 * 3. Username (fallback)
 */
export function getDisplayName(profile: UserProfile): string {
  const { title, firstName, lastName, username } = profile;
  
  // Check if we have first or last name
  const hasPersonalName = firstName?.trim() || lastName?.trim();
  
  if (hasPersonalName) {
    const fullName = `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim();
    
    // Add title if available and not "none"
    if (title && title !== 'none') {
      return `${title} ${fullName}`;
    }
    
    return fullName;
  }
  
  // Fallback to username if no personal name is available
  return username || 'User';
}

/**
 * Get formal display name (always includes title if available)
 */
export function getFormalName(profile: UserProfile): string {
  const { title, firstName, lastName, username } = profile;
  
  const hasPersonalName = firstName?.trim() || lastName?.trim();
  
  if (hasPersonalName) {
    const fullName = `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim();
    
    if (title && title !== 'none') {
      return `${title} ${fullName}`;
    }
    
    return fullName;
  }
  
  return username || 'User';
}

/**
 * Get initials for avatar display
 */
export function getInitials(profile: UserProfile): string {
  const { firstName, lastName, username } = profile;
  
  if (firstName || lastName) {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }
  
  // Fallback to username initials
  if (username) {
    const parts = username.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }
  
  return 'U';
}

/**
 * Check if user has complete personal information
 */
export function hasPersonalInfo(profile: UserProfile): boolean {
  return !!(profile.firstName?.trim() || profile.lastName?.trim());
}

/**
 * Get name for administrative contexts (shows username if no personal name)
 */
export function getAdminDisplayName(profile: UserProfile): string {
  const displayName = getDisplayName(profile);
  const { username } = profile;
  
  if (hasPersonalInfo(profile) && username && displayName !== username) {
    return `${displayName} (${username})`;
  }
  
  return displayName;
}