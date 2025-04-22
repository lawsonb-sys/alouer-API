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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { createStorage } from 'src/storage';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('post')
  @ApiOperation({ summary: 'Créer un article' })
  @ApiResponse({ status: 201, description: 'Article créé avec succès' })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: createStorage('articles', 'articles'),
    }),
  )
  create(
    @Body() articlesData: Article,
    @Body('authorId') userId: number,

    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Article> {
    return this.articlesService.create(articlesData, userId, files);
  }

  @Get('get')
  @ApiOperation({ summary: 'Recuperer tous les articles' })
  @ApiResponse({
    status: 201,
    description: 'Tous les articles recuperer avec succes',
  })
  findAll(): Promise<Article[]> {
    return this.articlesService.findAll();
  }

  @Get('get/:id')
  @ApiOperation({ summary: 'Recuperer un article' })
  @ApiResponse({ status: 201, description: 'Article recuperer avec succes' })
  findOne(@Param('id') id: number): Promise<Article> {
    return this.articlesService.findOne(id);
  }
  @Get('get/user/:id')
  @ApiOperation({ summary: 'Recuperer tous les articles d un utilisateur' })
  findByUuserId(@Param('id') id: number): Promise<Article[]> {
    return this.articlesService.findAllByUserId(id);
  }
  @Get('ville/:ville')
  @ApiOperation({ summary: 'Recuperer tous les articles d une ville' })
  @ApiResponse({
    status: 201,
    description: 'Tous les articles recuperer avec succes',
  })
  findByVille(@Param('ville') ville: string): Promise<Article[]> {
    return this.articlesService.findAllByVille(ville);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Modifier un article' })
  @ApiResponse({ status: 201, description: 'Article modifier avec succes' })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  update(
    @Param('id') id: number,
    @Body() updAteArticle: Article,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Article> {
    return this.articlesService.update(+id, updAteArticle, files);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Supprimer un article' })
  @ApiResponse({ status: 201, description: 'Article supprimer avec succes' })
  remove(@Param('id') id: number) {
    return this.articlesService.remove(+id);
  }
}
