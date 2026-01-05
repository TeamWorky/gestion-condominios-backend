export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

/**
 * Role hierarchy levels
 * Higher number = more permissions
 */
export const RoleHierarchy: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 4,
  [Role.ADMIN]: 3,
  [Role.USER]: 2,
  [Role.GUEST]: 1,
};

/**
 * Check if a role has permission based on hierarchy
 * @param userRole - The role of the user
 * @param requiredRole - The minimum required role
 * @returns true if user has sufficient permissions
 */
export function hasRolePermission(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}
