import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeColumn } from '@shared/typeorm/DateTimeColumn';
import { PostEntity } from './PostEntity';

@Entity({ name: 'post_comment' })
export class PostCommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  pc_index: number;

  @Column()
  pc_p_index: number;

  @Column({ type: 'int', nullable: true })
  pc_parent_pc_index: number | null;

  @Column()
  pc_content: string;

  @Column()
  pc_depth: number;

  @Column()
  pc_author: string;

  @Column()
  pc_created_by: string;

  @DateTimeColumn()
  pc_created_at: Date;

  @DateTimeColumn()
  pc_updated_at: Date;

  @ManyToOne(() => PostEntity, (entity) => entity.comments)
  @JoinColumn({ name: 'pc_p_index' })
  post: PostEntity;
}
