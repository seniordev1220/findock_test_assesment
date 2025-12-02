import { AuthUser } from '../types/auth';

/**
 * Generate user initials from first and last name
 */
export const getUserInitials = (user: AuthUser | { firstName: string; lastName: string }): string => {
  const first = user.firstName?.charAt(0).toUpperCase() || '';
  const last = user.lastName?.charAt(0).toUpperCase() || '';
  return `${first}${last}` || '?';
};

/**
 * Generate a consistent color for a user based on their ID
 * Returns a color in HSL format
 */
export const getUserColor = (userId: string): string => {
  // Generate a hash from the user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate hue (0-360) and saturation/lightness for a nice color palette
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 15); // 65-80%
  const lightness = 50 + (Math.abs(hash) % 10); // 50-60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Get a background color for avatar (lighter version)
 */
export const getAvatarBackgroundColor = (userId: string): string => {
  const color = getUserColor(userId);
  // Extract HSL values and make it lighter
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    const [, h, s, l] = match;
    const lighterL = Math.min(95, parseInt(l) + 30); // Make it lighter
    return `hsl(${h}, ${s}%, ${lighterL}%)`;
  }
  return color;
};

