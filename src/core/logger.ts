import { LoggerModule } from "nestjs-pino";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        name: "avi",
        autoLogging: true,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: false,
            ignore: "pid,hostname",
            translateTime: "SYS:HH:MM:ss",
            singleLine: true
          }
        },
        serializers: {
          req(req) {
            return `${req.method} - ${req.url}`
          },
          res(res) {
            return `status - ${res.statusCode}`
          }
        }
      }
    })
  ],
  exports: [
    LoggerModule
  ]
})
export class LoggerPinoConfig {}
