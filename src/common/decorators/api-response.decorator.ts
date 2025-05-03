import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiSuccessResponse(dataDto: any) {
  return applyDecorators(
    ApiExtraModels(dataDto),
    ApiResponse({
      status: 200,
      schema: {
        properties: {
          code: { type: 'number', example: 200 },
          msg: { type: 'string', example: 'success' },
          timestamp: { type: 'number' },
          data: { $ref: getSchemaPath(dataDto) },
        },
      },
    }),
  );
}
