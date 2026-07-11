import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | T> {
  intercept(_ctx: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((value: any) => {
        // If controller already returned the envelope (paginated), pass through
        if (value && typeof value === 'object' && ('data' in value) && ('meta' in value || value.data !== undefined)) {
          return value;
        }
        return { data: value };
      }),
    );
  }
}