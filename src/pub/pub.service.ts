import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm/repository/Repository';
import { UpdatePubDto } from './dto/update-pub.dto';
import { Photo } from './entities/photo.entity';
import { Pub } from './entities/pub.entity';

@Injectable()
export class PubService {
  constructor(
    @InjectRepository(Pub)
    private readonly pubRepository: Repository<Pub>,
  ) {}
  async create(createPub: Pub, photos: Express.Multer.File[]): Promise<Pub> {
    if (photos.length === 0) {
      throw new Error('At least one photo is required');
    }
    const pub = this.pubRepository.create(createPub);
    pub.photos = photos.map((file) => {
      const photo = new Photo();
      photo.url = `${process.env.BASE_URL}/uploads/pub/${file.filename}`;
      return photo;
    });
    try {
      const savedPub = await this.pubRepository.save(pub);
      return savedPub;
    } catch (error) {
      throw new Error('Failed to save the pub');
    }
  }

  async findAll(): Promise<Pub[]> {
    return await this.pubRepository.find({ relations: ['photos'] });
  }

  findOne(id: number) {
    return `This action returns a #${id} pub`;
  }

  update(id: number, updatePubDto: UpdatePubDto) {
    return `This action updates a #${id} pub`;
  }

  async remove(id: number): Promise<string> {
    const query = this.pubRepository.manager.connection.createQueryRunner();

    await query.connect();
    await query.startTransaction();

    try {
      const pub = await this.pubRepository.findOne({
        where: { id },
        relations: ['photos'],
      });

      if (!pub) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }

      if (pub.photos && pub.photos.length > 0) {
        for (const photo of pub.photos) {
          const filnam = photo.url.split('/').pop()!;
          if (!filnam) {
            throw new Error(
              `Erreur lors de la suppression de l'image ${photo.url}:`,
            );
          }
          const filePath = join(process.cwd(), 'uploads/pub', filnam);
          console.log('Chemin du fichier :', filePath);

          if (existsSync(filePath)) {
            try {
              unlinkSync(filePath);
            } catch (error) {
              console.error(
                `Erreur lors de la suppression de l'image ${error}:`,
              );
            }
          } else {
            console.warn(`Le fichier ${filePath} n'existe pas.`);
          }

          await query.manager.remove(photo);
        }
      }

      await query.manager.remove(pub);
      await query.commitTransaction();
      return `La Pub avec l'ID ${id} a été supprimé avec succès.`;
      console.log(`Article avec l'ID ${id} supprimé avec succès.`);
    } catch (error) {
      await query.rollbackTransaction();
      throw error;
    } finally {
      await query.release();
    }
  }
}
