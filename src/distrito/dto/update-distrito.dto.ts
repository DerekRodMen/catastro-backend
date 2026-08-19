import { PartialType } from '@nestjs/mapped-types';
import { CreateDistritoDto } from './create-distrito.dto';

export class UpdateDistritoDto extends PartialType(CreateDistritoDto) {}