import { Article } from 'src/articles/entities/article.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profile: string;

  @OneToMany(() => Article, (articles) => articles.author)
  articles: Article[];
}
