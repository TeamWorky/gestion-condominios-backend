import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const MIN_ROLE_KEY = 'minRole';

/**
 * Decorator to set minimum required role for a route
 * Uses role hierarchy - higher roles automatically have access
 * 
 * @example
 * @MinRole(Role.ADMIN) // ADMIN and SUPER_ADMIN can access
 * @Get()
 * findAll() { ... }
 */
export const MinRole = (role: Role) => SetMetadata(MIN_ROLE_KEY, role);
