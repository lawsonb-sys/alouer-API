import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createStorage } from 'src/storage';
import { UpdatePubDto } from './dto/update-pub.dto';
import { Pub } from './entities/pub.entity';
import { PubService } from './pub.service';

@Controller('pub')
export class PubController {
  constructor(private readonly pubService: PubService) {}

  @Post('post')
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: createStorage('pub', 'pub'),
    }),
  )
  create(
    @Body() createPubDto: Pub,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Pub> {
    return this.pubService.create(createPubDto, files);
  }

  @Get('get')
  findAll() {
    return this.pubService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pubService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePubDto: UpdatePubDto) {
    return this.pubService.update(+id, updatePubDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pubService.remove(+id);
  }
}
