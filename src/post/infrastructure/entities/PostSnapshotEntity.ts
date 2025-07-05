import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeColumn } from '@shared/typeorm/DateTimeColumn';
import { PostEntity } from './PostEntity';

@Entity({ name: 'post_snapshot' })
export class PostSnapshotEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  ps_index: number;

  @Column()
  ps_p_index: number;

  @Column()
  ps_p_title: string;

  @Column()
  ps_p_content: string;

  @Column()
  ps_created_by: string;

  @DateTimeColumn()
  ps_created_at: Date;

  @ManyToOne(() => PostEntity, (entity) => entity.snapshots)
  @JoinColumn({ name: 'ps_p_index' })
  post: PostEntity;
}
