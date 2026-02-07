import {
  createParamDecorator,
  ExecutionContext
} from "@nestjs/common";

import { TOKEN_NAME } from "@core/constants";
import { Request } from "express";

export const JWTSession = createParamDecorator(
  (data:unknown, ctx: ExecutionContext) => {
    const http = ctx.switchToHttp();
    const request = http.getRequest<Request>();
    return extractTokenFromCookie(request);
  }
);

const extractTokenFromCookie = (request: Request): string | null => {
  const cookie = request.cookies[TOKEN_NAME];
  return cookie ? String(cookie) : null;
}
