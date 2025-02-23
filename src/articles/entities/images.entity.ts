import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class Image {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string; // Chemin ou URL de l'image

  @ManyToOne(() => Article, (article) => article.images)
  article: Article; // Relation vers l'article
}
