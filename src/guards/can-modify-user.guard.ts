import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Role, RoleHierarchy } from '../common/enums/role.enum';

/**
 * Guard to prevent users from modifying users with higher or equal roles
 * Rules:
 * - SUPER_ADMIN can modify anyone
 * - ADMIN cannot modify SUPER_ADMIN
 * - USER cannot modify ADMIN or SUPER_ADMIN
 * - Users can modify themselves (except role change)
 */
@Injectable()
export class CanModifyUserGuard implements CanActivate {
  constructor(private readonly _usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;
    const targetUserId = request.params.id;

    if (!currentUser || !targetUserId) {
      return false;
    }

    // Get target user
    const targetUser = await this._usersService.findOne(targetUserId);

    // SUPER_ADMIN can modify anyone
    if (currentUser.role === Role.SUPER_ADMIN) {
      return true;
    }

    // Users can modify themselves (except role changes will be blocked in service)
    if (currentUser.sub === targetUserId) {
      return true;
    }

    // Check role hierarchy - cannot modify users with equal or higher role
    const currentUserLevel = RoleHierarchy[currentUser.role];
    const targetUserLevel = RoleHierarchy[targetUser.role];

    if (currentUserLevel <= targetUserLevel) {
      throw new ForbiddenException(
        'You cannot modify users with equal or higher role privileges',
      );
    }

    return true;
  }
}
