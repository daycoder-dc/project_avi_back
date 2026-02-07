import { JWT_SECRET, TOKEN_NAME } from "@core/constants";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor () {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req.cookies[TOKEN_NAME];
        return token && token != "" ? token : null;
      },
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET
    })
  }

  validate(payload: any) {
    return { user: payload.sub }
  }
}
