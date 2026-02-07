import { RecoveryModule } from './recovery/recovery.module';
import { ProfileModule } from './profile/profile.module';
import { DataBaseConfig } from '@core/database/config';
import { UsersModule } from './users/users.module';
import { MenusModule } from './menus/menus.module';
import { RolesModule } from './roles/roles.module';
import { JwtStrategy } from '@core/jwt/strategy';
import { LoggerPinoConfig } from '@core/logger';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AVIModule } from './avi/avi.module';
import { JwtGuard } from '@core/jwt/guard';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataBaseConfig,
    LoggerPinoConfig,
    UsersModule,
    RecoveryModule,
    AuthModule,
    MenusModule,
    RolesModule,
    AVIModule,
    ProfileModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtGuard },
    JwtStrategy,
  ]
})
export class AppModule {}
