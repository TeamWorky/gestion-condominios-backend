import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MIN_ROLE_KEY } from '../common/decorators/min-role.decorator';
import { Role, hasRolePermission } from '../common/enums/role.enum';

/**
 * Guard that checks if user has minimum required role based on hierarchy
 * SUPER_ADMIN > ADMIN > USER > GUEST
 */
@Injectable()
export class MinRoleGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const minRole = this._reflector.getAllAndOverride<Role>(MIN_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!minRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      return false;
    }

    return hasRolePermission(user.role, minRole);
  }
}
