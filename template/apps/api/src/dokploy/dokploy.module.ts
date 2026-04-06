import { Module } from '@nestjs/common';
import { DokployService } from './dokploy.service';

@Module({
  exports: [DokployService],
  providers: [DokployService],
})
export class DokployModule {}
