import { ExecutionContext, Injectable } from "@nestjs/common";
import { IS_PUBLIC_ENDPOINT } from "@core/constants";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor (private readonly reflector: Reflector) { super() }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ENDPOINT, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
