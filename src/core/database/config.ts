import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: "postgres",
          host: process.env.DB_HOST ?? "localhost",
          port: parseInt(process.env.DB_PORT || "5432"),
          username: process.env.DB_USER,
          password: process.env.DB_PWD,
          database: process.env.DB_NAME,
          synchronize: process.env.ENV == "dev",
          logging: false,
          autoLoadEntities: true,
          ssl: {
            rejectUnauthorized:false
          }
        }
      }
    })
  ],
  exports: [
    TypeOrmModule
  ]
})
export class DataBaseConfig {}
