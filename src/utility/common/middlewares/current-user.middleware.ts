
// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { isArray } from 'class-validator';
// import { verify } from 'jsonwebtoken';
// import { Request, Response, NextFunction } from 'express';
// import { UsersService } from 'src/users/users.service';
// import { UserEntity } from 'src/users/entities/user.entity';

// declare global{
//     namespace Express{
//         interface Request{
//             currentUser?:UserEntity;
//         }
//     }
// }

// @Injectable()
// export class CurrentUserMiddleware implements NestMiddleware {
//     constructor(private readonly usersService:UsersService) {}
//   async use(req: Request, res: Response, next: NextFunction) {
//     const authHeader = req.headers.authorization || req.headers.Authorization;
//     if(!authHeader || isArray(authHeader) || !authHeader.startsWith('Bearer ')){
//         req.currentUser = null;
//         next();
//         return;
//     }
//     else{
//         try{
//             const token = authHeader.split(' ')[1];
//             const {id} = <JwtPayload>verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);
//             const currentUser = await this.usersService.findOne(+id);
//             req.currentUser = currentUser;
//             next();
//         }
//         catch(e){
//             req.currentUser = null;
//             next();
//         }
//     }
// }
// }
// interface JwtPayload{
//     id:string;
// }
import { Injectable, NestMiddleware } from '@nestjs/common';
import { isArray } from 'class-validator';
import { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserEntity;
      isFirstLogin?: boolean; // Add this for convenience if needed
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // If no valid Authorization header is found
    if (!authHeader || isArray(authHeader) || !authHeader.startsWith('Bearer ')) {
      req.currentUser = null;
      req.isFirstLogin = null; // Reset `isFirstLogin`
      next();
      return;
    }

    try {
      // Extract token and verify
      const token = authHeader.split(' ')[1];
      const { id } = <JwtPayload>verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

      // Fetch current user from the database
      const currentUser = await this.usersService.findOne(+id);

      if (!currentUser) {
        req.currentUser = null;
        req.isFirstLogin = null; // Reset `isFirstLogin`
      } else {
        req.currentUser = currentUser;
        req.isFirstLogin = currentUser.isFirstLogin; // Attach `isFirstLogin` to request
      }
    } catch (error) {
      req.currentUser = null;
      req.isFirstLogin = null; // Reset `isFirstLogin`
    }

    next();
  }
}

interface JwtPayload {
  id: string;
}
