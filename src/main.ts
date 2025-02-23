import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', './uploads'), {});
  app.useStaticAssets(join(__dirname, '..', './uploads/profile'), {});

  console.log(join(__dirname, '..', '/uploads/profile'));

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription(
      'Description : cette API sert à la publication des articles comme des chambre a louer',
    )
    .setVersion('1.0')
    .addTag('articles', 'users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
