import { Module } from '@nestjs/common';
import { PubService } from './pub.service';
import { PubController } from './pub.controller';

@Module({
  controllers: [PubController],
  providers: [PubService],
})
export class PubModule {}
