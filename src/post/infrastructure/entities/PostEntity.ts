import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeColumn } from '@shared/typeorm/DateTimeColumn';
import { PostCommentEntity } from './PostCommentEntity';
import { PostSnapshotEntity } from './PostSnapshotEntity';

@Entity({ name: 'post' })
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  p_index: number;

  @Column()
  p_title: string;

  @Column()
  p_content: string;

  @Column()
  p_author: string;

  @Column()
  p_created_by: string;

  @DateTimeColumn()
  p_created_at: Date;

  @DateTimeColumn()
  p_updated_at: Date;

  @Column()
  p_is_deleted: number;

  @DateTimeColumn({ nullable: true })
  p_deleted_at: Date | null;

  @Column()
  p_password: string;

  @OneToMany(() => PostCommentEntity, (entity) => entity.post)
  comments: PostCommentEntity[];

  @OneToMany(() => PostSnapshotEntity, (entity) => entity.post)
  snapshots: PostSnapshotEntity[];
}
