import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PubService } from './pub.service';
import { CreatePubDto } from './dto/create-pub.dto';
import { UpdatePubDto } from './dto/update-pub.dto';

@Controller('pub')
export class PubController {
  constructor(private readonly pubService: PubService) {}

  @Post()
  create(@Body() createPubDto: CreatePubDto) {
    return this.pubService.create(createPubDto);
  }

  @Get()
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
