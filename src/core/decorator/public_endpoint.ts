import { IS_PUBLIC_ENDPOINT } from "@core/constants";
import { SetMetadata } from "@nestjs/common";

export const PublicEndPoint = () => SetMetadata(IS_PUBLIC_ENDPOINT, true);
