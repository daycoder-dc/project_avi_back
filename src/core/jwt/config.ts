import { JWT_SECRET } from "@core/constants";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          global: true,
          secret: JWT_SECRET,
          signOptions: {
            expiresIn: "8h"
          }
        }
      }
    })
  ],
  exports: [
    JwtModule
  ]
})
export class JwtConfig {}
