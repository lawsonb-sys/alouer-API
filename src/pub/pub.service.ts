import { Injectable } from '@nestjs/common';
import { CreatePubDto } from './dto/create-pub.dto';
import { UpdatePubDto } from './dto/update-pub.dto';

@Injectable()
export class PubService {
  create(createPubDto: CreatePubDto) {
    return 'This action adds a new pub';
  }

  findAll() {
    return `This action returns all pub`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pub`;
  }

  update(id: number, updatePubDto: UpdatePubDto) {
    return `This action updates a #${id} pub`;
  }

  remove(id: number) {
    return `This action removes a #${id} pub`;
  }
}
