// import { CanActivate, ExecutionContext, Injectable, mixin, UnauthorizedException } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";
// import { Observable } from "rxjs";

// export const AuthorizeGuard = (roles:string[]) => {
//   class RolesGuardMixin implements CanActivate {
//     canActivate(context: ExecutionContext): boolean {
//       const request = context.switchToHttp().getRequest();
//       const result = request?.currentUser?.roles.map((role:string) => roles.includes(role))
//       .find((val:boolean) => val === true);
//       if(result) return true;
//       throw new UnauthorizedException("Unauthorized access");
//     }
//   }
//   const guard = mixin(RolesGuardMixin);
//   return guard;
// }
import { CanActivate, ExecutionContext, Injectable, mixin, UnauthorizedException, ForbiddenException } from '@nestjs/common';

/**
 * Dynamic Role-Based Authorization Guard
 * @param allowedRoles - Roles permitted to access the resource.
 */
export const AuthorizeGuard = (allowedRoles: string[]) => {
  class RolesGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request?.currentUser;

      // Check if user exists
      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      // Check if the user has any of the allowed roles
      const hasRole = user.roles.some((role: string) => allowedRoles.includes(role));

      if (!hasRole) {
        throw new ForbiddenException('User does not have the required role to access this resource');
      }

      return true;
    }
  }

  // Use mixin to create a dynamic guard
  return mixin(RolesGuardMixin);
};
