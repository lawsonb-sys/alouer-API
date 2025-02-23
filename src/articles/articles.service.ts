import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, unlink } from 'fs';
import { join } from 'path';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm/repository/Repository';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { Image } from './entities/images.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(
    articleData: Article,
    userId: number,
    imagesUrls: Express.Multer.File[],
  ): Promise<Article> {
    console.log('userId:', userId);
    const author = await this.userRepository.findOne({ where: { id: userId } });
    if (!author) {
      throw new Error('User not found');
    }
    const article = this.articleRepository.create({
      ...articleData,
      author,
    });

    article.images = imagesUrls.map((file) => {
      const image = new Image();
      image.url = `${process.env.BASE_URL || 'http://localhost:3002'}/uploads/${file.filename}`;
      console.log('voici l image):', image.url);
      return image;
    });
    try {
      const savedArticle = await this.articleRepository.save(article);
      console.log('Article créé avec succès :', savedArticle.id); // Log pour le débogage
      return savedArticle;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'article :", error);
      throw new InternalServerErrorException('Failed to save the article');
    }
  }

  findAll(): Promise<Article[]> {
    return this.articleRepository.find({
      relations: ['author', 'images'],
    });
  }

  async findOne(id: number) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'images'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }
  async findAllByUserId(userId: number): Promise<Article[]> {
    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      throw new NotFoundException('Invalid userId');
    }

    const articles = await this.articleRepository.find({
      where: {
        author: { id: userIdNumber },
      },
      relations: ['author', 'images'],
    });

    if (articles.length === 0) {
      throw new NotFoundException(
        `No articles found for author ID ${userIdNumber}`,
      );
    }

    return articles;
  }
  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
    imagesUrls: Express.Multer.File[],
  ): Promise<Article> {
    // Trouver l'article existant
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Mettre à jour les champs de l'article
    const updatedArticle = this.articleRepository.merge(
      article,
      updateArticleDto,
    );

    // Mettre à jour les images
    if (imagesUrls && imagesUrls.length > 0) {
      updatedArticle.images = imagesUrls.map((file) => {
        const image = new Image();
        image.url = `${process.env.BASE_URL || 'http://localhost:3002'}/uploads/${file.filename}`;
        return image;
      });
    }

    // Sauvegarder l'article mis à jour
    try {
      const savedArticle = await this.articleRepository.save(updatedArticle);
      console.log('Article mis à jour avec succès :', savedArticle.id);
      return savedArticle;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article :", error);
      throw new InternalServerErrorException('Failed to update the article');
    }
  }

  async remove(id: number): Promise<string> {
    const query = this.articleRepository.manager.connection.createQueryRunner();

    await query.connect();
    await query.startTransaction();

    try {
      const article = await this.articleRepository.findOne({
        where: { id },
        relations: ['images'],
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }

      if (article.images && article.images.length > 0) {
        for (const image of article.images) {
          const filnam = image.url.split('/').pop()!;
          if (!filnam) {
            throw new Error(
              `Erreur lors de la suppression de l'image ${image.url}:`,
            );
          }
          const filePath = join(process.cwd(), 'uploads', filnam);
          console.log('Chemin du fichier :', filePath);

          if (existsSync(filePath)) {
            try {
              await unlink(filePath, (error) => {
                if (error) {
                  console.error(
                    `Erreur lors de la suppression de l'image ${image.url}:`,
                    error,
                  );
                } else {
                  console.log(`Image ${image.url} supprimée avec succès.`);
                }
              });
              console.log(`Image ${image.url} supprimée avec succès.`);
            } catch (error) {
              console.error(
                `Erreur lors de la suppression de l'image ${image.url}:`,
              );
            }
          } else {
            console.warn(`Le fichier ${filePath} n'existe pas.`);
          }

          await query.manager.remove(image);
        }
      }

      await query.manager.remove(article);
      await query.commitTransaction();
      return `L'article avec l'ID ${id} a été supprimé avec succès.`;
      console.log(`Article avec l'ID ${id} supprimé avec succès.`);
    } catch (error) {
      await query.rollbackTransaction();
      throw error;
    } finally {
      await query.release();
    }
  }
}
