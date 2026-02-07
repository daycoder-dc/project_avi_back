import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    res.status(exception.getStatus()).json({
      value: exception.message,
      description: exception.getResponse(),
      timestamp: Date.now(),
      path: req.url,
      cause: exception?.cause
    });
  }
}
