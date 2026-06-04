import { getRoles, RoleData } from "./googleSheets";

// Simple in-memory cache for roles to prevent spamming Google Sheets API
let cachedRoles: RoleData[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export async function fetchAllRoles(forceRefresh = false): Promise<RoleData[]> {
  const now = Date.now();
  if (!forceRefresh && cachedRoles.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedRoles;
  }

  try {
    cachedRoles = await getRoles();
    cacheTimestamp = now;
    return cachedRoles;
  } catch (error) {
    console.error("[PERMISSIONS] Failed to fetch roles:", error);
    return cachedRoles; // Return stale cache if error occurs
  }
}

/**
 * Checks if a given role has the required permission.
 * By default, the built-in "admin" role has all permissions.
 * 
 * @param userRole The role string (e.g. "admin", "editor")
 * @param requiredPermission The specific permission required (e.g. "manage_news")
 */
export async function hasPermission(userRole: string | undefined | null, requiredPermission: string): Promise<boolean> {
  if (!userRole) return false;
  
  // Built-in absolute admin fallback
  if (userRole === "admin") return true;

  const roles = await fetchAllRoles();
  const roleData = roles.find(r => r.roleName.toLowerCase() === userRole.toLowerCase());

  if (!roleData || !roleData.permissions) {
    return false;
  }

  const userPermissions = roleData.permissions.split(",").map(p => p.trim());
  return userPermissions.includes(requiredPermission) || userPermissions.includes("*");
}

/**
 * Get the default rank associated with a role.
 */
export async function getRankForRole(userRole: string | undefined | null): Promise<string> {
  if (!userRole) return "Member";
  if (userRole === "admin") return "Diamond"; // Default for built-in admin

  const roles = await fetchAllRoles();
  const roleData = roles.find(r => r.roleName.toLowerCase() === userRole.toLowerCase());

  if (roleData && roleData.rank) {
    return roleData.rank;
  }

  return "Member";
}

/**
 * Get all permissions as an array of strings for a given role.
 */
export async function getRolePermissions(userRole: string | undefined | null): Promise<string[]> {
  if (!userRole) return [];
  if (userRole === "admin") return ["*"]; // admin gets wildcard

  const roles = await fetchAllRoles();
  const roleData = roles.find(r => r.roleName.toLowerCase() === userRole.toLowerCase());

  if (roleData && roleData.permissions) {
    return roleData.permissions.split(",").map(p => p.trim());
  }

  return [];
}
