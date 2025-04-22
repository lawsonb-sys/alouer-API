import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pub } from './entities/pub.entity';
import { PubController } from './pub.controller';
import { PubService } from './pub.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pub])],
  controllers: [PubController],
  providers: [PubService],
})
export class PubModule {}
