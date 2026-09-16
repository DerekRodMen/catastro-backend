import { PartialType } from '@nestjs/mapped-types';
import { CreateParqueDto } from './create-parque.dto';

export class UpdateParqueDto extends PartialType(
  CreateParqueDto,
) {}
