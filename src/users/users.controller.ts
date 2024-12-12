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
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FirstLoginGuard } from 'src/utility/guards/first-login.guard';


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

  @Post('send-otp')
  async sendOTP(@Body() sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    return await this.usersService.sendOTP(sendOtpDto.email);

  }

  @Post('verify-otp')
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto): Promise<{ message: string; accessToken: string; user: UserEntity }> {
    const { user, accessToken } = await this.usersService.verifyOTP(verifyOtpDto.email, verifyOtpDto.otp);
    return { message: 'OTP verified successfully', accessToken, user };
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SUPER_ADMIN, Roles.ADMIN]), FirstLoginGuard)
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: UserEntity): Promise<{ message: string }> {
    if (
      currentUser.roles.includes(Roles.ADMIN) &&
      createUserDto.roles.includes(Roles.SUPER_ADMIN)
    ) {
      throw new UnauthorizedException('Admins can not create super admins.');
    }
    await this.usersService.create(createUserDto, currentUser);
    return { message: 'User created successfully' };
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SUPER_ADMIN, Roles.ADMIN]))
  @Get('all')
  async findAll(@CurrentUser() currentUser: UserEntity): Promise<UserEntity[]> {
    const users = await this.usersService.findAll();
    return users.filter(user => user.id !== currentUser.id); // Exclude myself
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SUPER_ADMIN, Roles.ADMIN]))
  @Get('single/:id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<UserEntity> {
    const user = await this.usersService.findOne(+id);
    if (
      currentUser.roles.includes(Roles.ADMIN) &&
      user.roles.includes(Roles.SUPER_ADMIN)
    ) {
      throw new UnauthorizedException('Admins cannot view super admins.');
    }
    return user;
  }

  @UseGuards(AuthenticationGuard, FirstLoginGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<{ message: string }> {
    const targetUser = await this.usersService.findOne(+id);
    if (
      currentUser.roles.includes(Roles.ADMIN) &&
      targetUser.roles.includes(Roles.SUPER_ADMIN)
    ) {
      throw new UnauthorizedException('Admins cannot update super admins.');
    }
    if (currentUser.roles.includes(Roles.SUPER_ADMIN)) {
      await this.usersService.update(+id, updateUserDto, currentUser);
    } else if (currentUser.roles.includes(Roles.ADMIN) && currentUser.id === +id) {
      await this.usersService.update(+id, updateUserDto, currentUser);
    } else {
      throw new UnauthorizedException('You do not have permission to update this user.');
    }
    return { message: 'User updated successfully' };
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SUPER_ADMIN, Roles.ADMIN]), FirstLoginGuard)
  @Delete('remove/:id')
  async remove(@Param('id') id: string, 
              @CurrentUser() currentUser: UserEntity): Promise<{ message: string }> {
    const targetUser = await this.usersService.findOne(+id);
    if (
      currentUser.roles.includes(Roles.ADMIN) &&
      targetUser.roles.includes(Roles.SUPER_ADMIN)
    ) {
      throw new UnauthorizedException('Admins cannot remove super admins.');
    }
    await this.usersService.remove(+id, currentUser);
    return { message: 'User removed successfully' };
  }

  @UseGuards(AuthenticationGuard, FirstLoginGuard)
  @Get('current')
  getProfile(@CurrentUser() currentUser: UserEntity): UserEntity {
    return currentUser;
  }

  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    const { email, oldPassword, newPassword } = changePasswordDto;
    return this.usersService.changePassword(email, oldPassword, newPassword);
  }
}