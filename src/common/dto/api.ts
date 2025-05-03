import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty()
  @Type((options?: { newObject?: { dataType?: any } }) => {
    return options?.newObject?.dataType || Object;
  })
  data: T;

  @ApiProperty({ example: 'success' })
  msg: string;

  @ApiProperty({ example: 1746277900679 })
  timestamp: number;
}
