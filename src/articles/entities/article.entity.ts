import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from './images.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.articles)
  author: User;
  @Column()
  quartier: string;

  @Column()
  type: string;

  @Column()
  categorie: string;

  @OneToMany(() => Image, (image) => image.article, { cascade: true })
  images: Image[];
}
