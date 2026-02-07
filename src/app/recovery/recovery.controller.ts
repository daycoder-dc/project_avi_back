import {
  RecoveryCodeVerifyDto,
  RecoveryEmailVerifyDto,
  RecoveryPasswordDto
} from "./recovery.dto";

import { PublicEndPoint } from "@core/decorator/public_endpoint";
import { Body, Controller, Post } from "@nestjs/common";
import { RecoveryService } from "./recovery.service";

@PublicEndPoint()
@Controller({ path: "recovery", version: "1" })
export class RecoveryController {
  constructor (private readonly recovery:RecoveryService) {}

  @Post("verify/email")
  async verify_email(@Body() data:RecoveryEmailVerifyDto) {
    return this.recovery.verify_email(data);
  }

  @Post("verify/code")
  async verify_code(@Body() data:RecoveryCodeVerifyDto) {
    return this.recovery.verify_code(data);
  }

  @Post("update")
  async update_password(@Body() data:RecoveryPasswordDto) {
    return this.recovery.update_password(data);
  }
}
