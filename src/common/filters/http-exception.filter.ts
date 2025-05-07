import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    this.logger.error(
      '捕获到异常',
      exception instanceof Error ? exception.stack : String(exception),
    );

    if (exception instanceof Error) {
      const errorMessage = exception.message;

      // JSON 解析错误处理
      if (
        errorMessage.includes('JSON') ||
        errorMessage.includes('double-quoted property name')
      ) {
        let message = '请求体 JSON 格式错误';

        if (errorMessage.includes('double-quoted property name')) {
          message = 'JSON 属性名必须使用双引号，请检查请求数据格式';
        } else if (errorMessage.includes('Unexpected token')) {
          message = 'JSON 格式不正确，请检查语法';
        } else if (errorMessage.includes('Unexpected end of JSON input')) {
          message = 'JSON 数据不完整，请检查请求数据';
        }

        response.status(400).json({
          code: 400,
          msg: message,
          data: null,
        });

        return;
      }
    }

    // HTTP 异常处理
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const errorResponse = {
        code: status,
        msg:
          typeof exceptionResponse === 'object'
            ? (exceptionResponse as any).message || exception.message
            : exceptionResponse,
        data: null,
      };

      response.status(status).json(errorResponse);
      return;
    }

    // 处理其他未知异常
    response.status(500).json({
      code: 500,
      msg: '服务器内部错误',
      data: null,
    });
  }
}
