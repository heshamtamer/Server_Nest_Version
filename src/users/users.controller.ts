// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { UserSignUpDto } from './dto/user-signup.dto';
// import { UserEntity } from './entities/user.entity';
// import { UserSignInDto } from './dto/user-signin.dto';
// import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
// import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
// import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
// import { Roles } from 'src/utility/common/user-roles.enum';


// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post('signup')
//   async signup(@Body() userSignUpDto:UserSignUpDto):Promise<{user:UserEntity}>{
//     return {user:await this.usersService.signup(userSignUpDto)};
//   }

//   @Post('signin')
//   async signin(@Body() userSignInDto:UserSignInDto):Promise<{accessToken:string,user:UserEntity}>{
//     const { user } = await this.usersService.signin(userSignInDto);
//     const accessToken = await this.usersService.accessToken(user);

//     return {accessToken, user};
//   }

//   @Post()
//   create(@Body() createUserDto: CreateUserDto) {
//     // return this.usersService.create(createUserDto);
//     return "User created successfully";
//   }

//   @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
//   @Get('all')
//   async findAll() : Promise<UserEntity[]> {
//     return await this.usersService.findAll();
//   }

//   @Get('single/:id')
//   async findOne(@Param('id') id: string): Promise<UserEntity> {
//     return await this.usersService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
//     return this.usersService.update(+id, updateUserDto);
//   }

//   @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
//   @Delete('remove/:id')
//   async remove(@Param('id') id: string): Promise<{ message: string }> {
//     await this.usersService.remove(+id);
//     return { message: 'User removed successfully' };
//   }

//   @UseGuards(AuthenticationGuard)
//   @Get('current')
//   getProfile(@CurrentUser() CurrentUser:UserEntity){
//     return CurrentUser;
//   }
// }

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { UserSignInDto } from './dto/user-signin.dto';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() userSignUpDto: UserSignUpDto): Promise<{ user: UserEntity }> {
    return { user: await this.usersService.signup(userSignUpDto) };
  }

  @Post('signin')
  async signin(@Body() userSignInDto: UserSignInDto): Promise<{ accessToken: string; user: UserEntity }> {
    const { user } = await this.usersService.signin(userSignInDto);
    const accessToken = await this.usersService.accessToken(user);

    return { accessToken, user };
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SUPER_ADMIN]))
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: UserEntity): Promise<{ message: string }> {
    await this.usersService.create(createUserDto, currentUser);
    return { message: 'User created successfully' };
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SUPER_ADMIN, Roles.ADMIN]))
  @Get('all')
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SUPER_ADMIN, Roles.ADMIN]))
  @Get('single/:id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    return await this.usersService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<{ message: string }> {
    if (currentUser.roles.includes(Roles.SUPER_ADMIN)) {
      await this.usersService.update(+id, updateUserDto, currentUser);
    } else if (currentUser.roles.includes(Roles.ADMIN) && currentUser.id === +id) {
      await this.usersService.update(+id, updateUserDto, currentUser);
    } else {
      throw new UnauthorizedException('You do not have permission to update this user.');
    }
    return { message: 'User updated successfully' };
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SUPER_ADMIN]))
  @Delete('remove/:id')
  async remove(@Param('id') id: string, 
              @CurrentUser() currentUser:UserEntity): Promise<{ message: string }> {
    await this.usersService.remove(+id, currentUser);
    return { message: 'User removed successfully' };
  }

  @UseGuards(AuthenticationGuard)
  @Get('current')
  getProfile(@CurrentUser() currentUser: UserEntity): UserEntity {
    return currentUser;
  }
}

