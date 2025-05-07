import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SKIP_GLOBAL_INTERCEPTOR } from '../decorators/skip-global-interceptor.decorator';

export interface Response<T> {
  code: number;
  data: T;
  msg: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const skipInterceptor = this.reflector.get<boolean>(
      SKIP_GLOBAL_INTERCEPTOR,
      context.getHandler(),
    );

    if (skipInterceptor) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        code: 200,
        data,
        msg: '查询成功',
      })),
    );
  }
}
@Injectable()
export class ConfigurableResponseInterceptor implements NestInterceptor {
  constructor(private readonly dataKey: string = 'data') {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = {
          code: 200,
          msg: '查询成功',
        };

        response[this.dataKey] = data;

        return response;
      }),
    );
  }
}
