import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatusDto = (typeof TASK_STATUSES)[number];

export class CreateTaskDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long.' })
  @MaxLength(120, { message: 'Title must be at most 120 characters long.' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be at most 2000 characters long.' })
  description?: string;

  @IsOptional()
  @IsEnum(TASK_STATUSES, {
    message: `Status must be one of: ${TASK_STATUSES.join(', ')}.`,
  })
  status?: TaskStatusDto;

  @IsOptional()
  @IsArray({ message: 'assigneeIds must be an array of user IDs.' })
  @ArrayNotEmpty({ message: 'assigneeIds cannot be an empty array.' })
  assigneeIds?: string[];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long.' })
  @MaxLength(120, { message: 'Title must be at most 120 characters long.' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be at most 2000 characters long.' })
  description?: string;

  @IsOptional()
  @IsEnum(TASK_STATUSES, {
    message: `Status must be one of: ${TASK_STATUSES.join(', ')}.`,
  })
  status?: TaskStatusDto;

  @IsOptional()
  @IsArray({ message: 'assigneeIds must be an array of user IDs.' })
  assigneeIds?: string[];
}


