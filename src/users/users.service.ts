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

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async signup(userSignUpDto: UserSignUpDto): Promise<UserEntity> {
    const userExists = await this.findByEmail(userSignUpDto.email);
    if (userExists) {
      throw new BadRequestException('Email already exists');
    }
    userSignUpDto.password = await hash(userSignUpDto.password, 10);
    let user = this.usersRepository.create({ ...userSignUpDto, roles: [Roles.USER] }); // Default role as USER
    user = await this.usersRepository.save(user);
    delete user.password;
    return user;
  }

  async signin(userSignInDto: UserSignInDto): Promise<{ message: string; user: UserEntity }> {
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
    return { message: 'Login Successful', user: userExists };
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

  async findByEmail(email: string): Promise<UserEntity> {
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

