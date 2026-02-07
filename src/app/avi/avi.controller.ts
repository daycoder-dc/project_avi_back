import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AVIService } from "./avi.service";
import { AVITotalUsersDto } from "./avi.dto";

@Controller({ path:"avi", version: "1" })
export class AVIController {
  constructor (
    private readonly service: AVIService
  ) {}

  @Get("planned")
  async get_planned(@Query("value") value: string) {
    return this.service.get_planned(value);
  }

  @Get("executed")
  async get_executed(@Query("value") value: string) {
    return this.service.get_executed(value);
  }

  @Get("effective")
  async get_effective(@Query("value") value: string) {
    return this.service.get_effective(value);
  }

  @Get("map")
  async get_map(@Query("value") value: string) {
    return this.service.get_map(value);
  }

  @Get("metrics")
  async get_metrics_evolutions(@Query("value") value: string) {
    return this.service.get_metrics_evolutions(value);
  }

  @Get("distribution")
  async get_distribution(@Query("value") value: string) {
    return this.service.get_distribution(value);
  }

  @Get("attributes")
  async get_attributes() {
    return this.service.get_attributes();
  }

  @Get("attribute-values")
  async get_attribute_values(@Query("value") value: string) {
    return this.service.get_attribute_values(value);
  }

  @Post("total-users")
  async get_total_users(@Body() data: AVITotalUsersDto) {
    return this.service.get_total_users(data);
  }
}
