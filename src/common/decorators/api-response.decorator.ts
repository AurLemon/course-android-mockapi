import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface SchemaObject {
  type?: string;
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
  $ref?: string;
  example?: any;
  [key: string]: any;
}

interface ApiResponseOptions {
  description?: string;
  isArray?: boolean;
}

/**
 * 创建API响应Schema
 */
function createDataSchema(data: any, isArray = false): SchemaObject {
  // 类
  if (typeof data === 'function') {
    if (isArray) {
      return {
        type: 'array',
        items: { $ref: getSchemaPath(data) },
      };
    }
    return { $ref: getSchemaPath(data) };
  }

  // 对象
  if (typeof data === 'object') {
    if (isArray) {
      return {
        type: 'array',
        items: {
          type: 'object',
          properties: createPropertiesFromObject(data),
        },
      };
    }
    return {
      type: 'object',
      properties: createPropertiesFromObject(data),
    };
  }

  // 基本类型
  if (isArray) {
    return {
      type: 'array',
      items: { type: typeof data },
    };
  }
  return { type: typeof data };
}

/**
 * 从对象创建属性描述
 */
function createPropertiesFromObject(
  obj: Record<string, any>,
): Record<string, SchemaObject> {
  const properties: Record<string, SchemaObject> = {};

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'boolean') {
      properties[key] = { type: 'boolean', example: value };
    } else if (typeof value === 'number') {
      properties[key] = { type: 'number', example: value };
    } else if (typeof value === 'string') {
      properties[key] = { type: 'string', example: value };
    } else if (Array.isArray(value)) {
      const itemType = value.length > 0 ? typeof value[0] : 'string';
      properties[key] = {
        type: 'array',
        items: { type: itemType },
      };
    } else if (typeof value === 'object' && value !== null) {
      properties[key] = {
        type: 'object',
        properties: createPropertiesFromObject(value),
      };
    }
  }

  return properties;
}

/**
 * 创建API成功响应装饰器
 * @param data - 响应数据类型 (DTO类 或 对象示例)
 * @param options - 配置选项
 */
export function ApiSuccessResponse(
  data: Type<unknown> | Record<string, any>,
  options: ApiResponseOptions = {},
) {
  const { description = '操作成功', isArray = false } = options;

  const extraModels = typeof data === 'function' ? [data] : [];

  return applyDecorators(
    ApiExtraModels(...extraModels),
    ApiResponse({
      status: 200,
      description,
      schema: {
        properties: {
          code: { type: 'number', example: 200 },
          msg: { type: 'string', example: '查询成功' },
          data: createDataSchema(data, isArray),
        },
      },
    }),
  );
}

/**
 * 创建自定义字段响应装饰器 - 可以指定任意字段名替代data
 * @param fieldName - 自定义字段名
 * @param fieldSchema - 字段Schema定义
 * @param options - 配置选项
 */
export function ApiCustomFieldResponse(
  fieldName: string,
  fieldSchema: SchemaObject,
  options: ApiResponseOptions = {},
) {
  const { description = '操作成功' } = options;

  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        properties: {
          code: { type: 'number', example: 200 },
          msg: { type: 'string', example: '查询成功' },
          [fieldName]: fieldSchema,
        },
      },
    }),
  );
}
