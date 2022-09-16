import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ClubEntity } from '../club/club.entity';

@Entity()
export class MemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  birthDate: Date;

  @ManyToMany(() => ClubEntity, (club) => club.members)
  @JoinTable()
  clubs: ClubEntity[];
}
