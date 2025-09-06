import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Photo } from './photo.entity';

@Entity()
export class Pub {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  namePub: string;
  @OneToMany(() => Photo, (photo) => photo.pub, { cascade: true })
  photos: Photo[];
}
