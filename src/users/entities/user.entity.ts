import { Article } from 'src/articles/entities/article.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;
  @Column()
  prenom: string;

  @Column()
  email: string;

  @Column()
  password: string;
  @Column()
  phone: number;

  @Column({ nullable: true })
  profile: string;

  @OneToMany(() => Article, (articles) => articles.author)
  articles: Article[];
}
