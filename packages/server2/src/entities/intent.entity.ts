import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IntentFilterEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  data: string;
}
