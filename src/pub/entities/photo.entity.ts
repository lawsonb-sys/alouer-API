import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pub } from './pub.entity';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  url: string; // Chemin ou URL de l'image
  @ManyToOne(() => Pub, (pub) => pub.photos)
  pub: Pub; // Relation vers le pub
}
