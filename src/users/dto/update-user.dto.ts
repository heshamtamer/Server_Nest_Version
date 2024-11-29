import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { Roles } from 'src/utility/common/user-roles.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(Roles, { each: true })
  roles?: Roles[]; // Allow optional role updates, restricted by the service layer
}
