//1- Code without any changes

// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UserEntity } from './entities/user.entity';
// import { UserSignUpDto } from './dto/user-signup.dto';
// import { hash, compare } from 'bcrypt';
// import { UserSignInDto } from './dto/user-signin.dto';
// import { sign } from 'jsonwebtoken';

// @Injectable()
// export class UsersService {

//   constructor(
//     @InjectRepository(UserEntity)
//     private usersRepository: Repository<UserEntity>,
//   ) {}

//   async signup(userSignUpDto:UserSignUpDto):Promise<UserEntity>{
//     const userExists = await this.findByEmail(userSignUpDto.email);
//     if(userExists){
//       throw new BadRequestException("Email already exists");
//     }
//     userSignUpDto.password = await hash(userSignUpDto.password,10);
//     let user = this.usersRepository.create(userSignUpDto);
//     user = await this.usersRepository.save(user);
//     delete user.password;
//     return user;
//   }

//   async signin(userSignInDto:UserSignInDto):Promise<{message:string,user:UserEntity}>{
//     const userExists = await this.usersRepository.createQueryBuilder('users').addSelect('users.password')
//     .where('users.email = :email',{email:userSignInDto.email}).getOne();
//     if(!userExists){
//       throw new BadRequestException("Invalid email or password");
//     }
//     const passwordMatch = await compare(userSignInDto.password,userExists.password);
//     if(!passwordMatch){
//       throw new BadRequestException("Invalid email or password");
//     }
//     delete userExists.password;
//     return { message: "Login Successful", user: userExists };
//   }
  
//   create(createUserDto: CreateUserDto) {
//     return 'This action adds a new user';
//   }

//   async findAll(): Promise<UserEntity[]> {
//     return await this.usersRepository.find();
//   }

//   async findOne(id: number): Promise<UserEntity> {
//     const user = await this.usersRepository.findOneBy({ id });
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }
//     return user;
//   }

//   update(id: number, updateUserDto: UpdateUserDto) {
//     return `This action updates a #${id} user`;
//   }

//   async remove(id: number): Promise<{message:string}> {
//     const user = await this.usersRepository.findOneBy({id});
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }
//     await this.usersRepository.delete(id);
//     return { message: 'User deleted successfully' };
//   }
   
//   async findByEmail(email: string): Promise<UserEntity> {
//     return await this.usersRepository.findOneBy({email});
//   }

//   async accessToken(user: UserEntity): Promise<string> {
//     return sign({id: user.id, email: user.email},process.env.ACCESS_TOKEN_SECRET_KEY,
//       {expiresIn: process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRE});
//   }
// }

//2- Code with User Mangement updates 
// import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UserEntity } from './entities/user.entity';
// import { UserSignUpDto } from './dto/user-signup.dto';
// import { hash, compare } from 'bcrypt';
// import { UserSignInDto } from './dto/user-signin.dto';
// import { sign } from 'jsonwebtoken';
// import { Roles } from 'src/utility/common/user-roles.enum';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(UserEntity)
//     private usersRepository: Repository<UserEntity>,
//   ) {}

//   async signup(userSignUpDto: UserSignUpDto): Promise<UserEntity> {
//     const userExists = await this.findByEmail(userSignUpDto.email);
//     if (userExists) {
//       throw new BadRequestException('Email already exists');
//     }
//     userSignUpDto.password = await hash(userSignUpDto.password, 10);
//     let user = this.usersRepository.create({ ...userSignUpDto, roles: [Roles.USER] }); // Default role as USER
//     user = await this.usersRepository.save(user);
//     delete user.password;
//     return user;
//   }

//   async signin(userSignInDto: UserSignInDto): Promise<{ message: string; user: UserEntity }> {
//     const userExists = await this.usersRepository
//       .createQueryBuilder('users')
//       .addSelect('users.password')
//       .where('users.email = :email', { email: userSignInDto.email })
//       .getOne();
//     if (!userExists) {
//       throw new BadRequestException('Invalid email or password');
//     }
//     const passwordMatch = await compare(userSignInDto.password, userExists.password);
//     if (!passwordMatch) {
//       throw new BadRequestException('Invalid email or password');
//     }
//     delete userExists.password;
//     return { message: 'Login Successful', user: userExists };
//   }

//   async create(createUserDto: CreateUserDto, currentUser: UserEntity): Promise<UserEntity> {
//     if (!currentUser.roles.includes(Roles.SUPER_ADMIN)) {
//       throw new UnauthorizedException('Only SUPER_ADMIN can create new users');
//     }
//     const userExists = await this.findByEmail(createUserDto.email);
//     if (userExists) {
//       throw new BadRequestException('Email already exists');
//     }
//     createUserDto.password = await hash(createUserDto.password, 10);
//     let user = this.usersRepository.create(createUserDto);
//     user = await this.usersRepository.save(user);
//     delete user.password;
//     return user;
//   }

//   async findAll(): Promise<UserEntity[]> {
//     return await this.usersRepository.find();
//   }

//   async findOne(id: number): Promise<UserEntity> {
//     const user = await this.usersRepository.findOneBy({ id });
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }
//     return user;
//   }

//   async update(
//     id: number,
//     updateUserDto: UpdateUserDto,
//     currentUser: UserEntity,
//   ): Promise<{ message: string }> {
//     const userToUpdate = await this.findOne(id);

//     if (currentUser.roles.includes(Roles.SUPER_ADMIN)) {
//       await this.usersRepository.update(id, updateUserDto);
//     } else if (currentUser.roles.includes(Roles.ADMIN) && currentUser.id === id) {
//       // Allow admin to update their own profile
//       const { roles, ...allowedUpdates } = updateUserDto; // Prevent role updates by admin
//       await this.usersRepository.update(id, allowedUpdates);
//     } else {
//       throw new UnauthorizedException('You do not have permission to update this user.');
//     }
//     return { message: 'User updated successfully' };
//   }

//   async remove(id: number, currentUser: UserEntity): Promise<{ message: string }> {
//     if (!currentUser.roles.includes(Roles.SUPER_ADMIN)) {
//       throw new UnauthorizedException('Only SUPER_ADMIN can delete users');
//     }
//     const user = await this.findOne(id);
//     await this.usersRepository.delete(id);
//     return { message: 'User deleted successfully' };
//   }

//   async findByEmail(email: string): Promise<UserEntity> {
//     return await this.usersRepository.findOneBy({ email });
//   }

//   async accessToken(user: UserEntity): Promise<string> {
//     return sign(
//       { id: user.id, email: user.email, roles: user.roles },
//       process.env.ACCESS_TOKEN_SECRET_KEY,
//       { expiresIn: process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRE },
//     );
//   }
// }

//3- Code with OTP Management updates addded
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserSignUpDto } from './dto/user-signup.dto';
import { hash, compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign } from 'jsonwebtoken';
import { Roles } from 'src/utility/common/user-roles.enum';
import { generateOTP } from 'src/utility/common/otp.util';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  generateOTP() {
    throw new Error('Method not implemented.');
  }
  // jwtService: any;
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // User Sign-Up Logic
  async signup(userSignUpDto: UserSignUpDto): Promise<UserEntity> {
    const userExists = await this.findByEmail(userSignUpDto.email);
    if (userExists) {
      throw new BadRequestException('Email already exists');
    }

    userSignUpDto.password = await hash(userSignUpDto.password, 10);

    let user = this.usersRepository.create({ 
      ...userSignUpDto, 
      roles: [Roles.USER], 
      isFirstLogin: true // Set first login flag to true 
    }); // Default role as USER
    user = await this.usersRepository.save(user);
    delete user.password;
    return user;
  }

  // User Sign-In Logic with First Login Check
  async signin(userSignInDto: UserSignInDto): Promise<{ message: string; user: UserEntity; isFirstLogin: boolean }> {
    const userExists = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email = :email', { email: userSignInDto.email })
      .getOne();

    if (!userExists) {
      throw new BadRequestException('Invalid email or password');
    }

    const passwordMatch = await compare(userSignInDto.password, userExists.password);
    if (!passwordMatch) {
      throw new BadRequestException('Invalid email or password');
    }

    delete userExists.password;
    // Return isFirstLogin to enforce password change
    return { message: 'Login Successful', user: userExists, isFirstLogin: userExists.isFirstLogin };
  }

  // OTP Generation Logic
  async sendOTP(email: string): Promise<{ message: string; otp: string }> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const unhashedOTP = await generateOTP(); // Generate a 6-digit OTP
    const otp = await crypto.createHash('sha256').update(unhashedOTP).digest('hex');
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    await this.usersRepository.update(user.id, { otp, otpExpiry });

    // Send OTP to the user's email
    await this.mailService.sendOTP(email, unhashedOTP);

    return { message: 'OTP generated successfully', otp }; // Replace this with email sending logic
  }

  // OTP Verification Logic
  async verifyOTP(email: string, otp: string): Promise<{ message: string; accessToken: string; user: UserEntity }> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otpExpiry || user.otp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const currentTime = new Date();
    if (user.otpExpiry < currentTime) {
      throw new BadRequestException('OTP has expired');
    }

    await this.usersRepository.update(user.id, { otp: null, otpExpiry: null });

    const accessToken = await this.jwtService.signAsync({ userId: user.id });

    return { message: 'OTP verified successfully', accessToken, user };
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Step 1: Retrieve the user by email
    const user = await this.findByEmail(email,true);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Step 2: Compare the old password with the stored password hash
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect old password');
    }
  
    // Step 3: Check if the new password is different from the old password
    if (oldPassword === newPassword) {
      throw new BadRequestException('New password cannot be the same as the old password');
    }
  
    // Step 4: Hash the new password and update the user's password
    const hashedNewPassword = await hash(newPassword, 10);
    user.password = hashedNewPassword;
  
    // Step 5: Set isFirstLogin to false after password change if it's the user's first login
    user.isFirstLogin = false;
  
    // Step 6: Save the updated user entity with the new password
    await this.usersRepository.save(user);
  
    // Step 7: Return success message
    return { message: 'Password changed successfully' };
  }

  async create(createUserDto: CreateUserDto, currentUser: UserEntity): Promise<UserEntity> {
    if (!currentUser.roles.includes(Roles.SUPER_ADMIN)) {
      throw new UnauthorizedException('Only SUPER_ADMIN can create new users');
    }
    const userExists = await this.findByEmail(createUserDto.email);
    if (userExists) {
      throw new BadRequestException('Email already exists');
    }
    createUserDto.password = await hash(createUserDto.password, 10);
    let user = this.usersRepository.create(createUserDto);
    user = await this.usersRepository.save(user);
    delete user.password;
    return user;
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: UserEntity,
  ): Promise<{ message: string }> {
    const userToUpdate = await this.findOne(id);

    if (currentUser.roles.includes(Roles.SUPER_ADMIN)) {
      await this.usersRepository.update(id, updateUserDto);
    } else if (currentUser.roles.includes(Roles.ADMIN) && currentUser.id === id) {
      // Allow admin to update their own profile
      const { roles, ...allowedUpdates } = updateUserDto; // Prevent role updates by admin
      await this.usersRepository.update(id, allowedUpdates);
    } else {
      throw new UnauthorizedException('You do not have permission to update this user.');
    }
    return { message: 'User updated successfully' };
  }

  async remove(id: number, currentUser: UserEntity): Promise<{ message: string }> {
    if (!currentUser.roles.includes(Roles.SUPER_ADMIN)) {
      throw new UnauthorizedException('Only SUPER_ADMIN can delete users');
    }
    const user = await this.findOne(id);
    await this.usersRepository.delete(id);
    return { message: 'User deleted successfully' };
  }

  async findByEmail(email: string, includePassword = false): Promise<UserEntity> {
    if (includePassword) {
      // Include password in query result
      return await this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password') // Explicitly include the password field
        .where('user.email = :email', { email })
        .getOne();
    }
    // Exclude password by default
    return await this.usersRepository.findOneBy({ email });
  }
  
  async accessToken(user: UserEntity): Promise<string> {
    return sign(
      { id: user.id, email: user.email, roles: user.roles },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRE },
    );
  }
}