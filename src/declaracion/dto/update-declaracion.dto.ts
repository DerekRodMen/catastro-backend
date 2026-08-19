import { PartialType } from '@nestjs/mapped-types';
import { CreateDeclaracionDto } from './create-declaracion.dto';

export class UpdateDeclaracionDto extends PartialType(
  CreateDeclaracionDto,
) {}