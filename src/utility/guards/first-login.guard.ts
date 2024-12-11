import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  @Injectable()
  export class FirstLoginGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.currentUser;
  
      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }
  
      if (user.isFirstLogin) {
        throw new UnauthorizedException(
          'Please change your password to access this resource.',
        );
      }
  
      return true;
    }
  }
  