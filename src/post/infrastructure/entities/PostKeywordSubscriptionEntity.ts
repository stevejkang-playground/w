import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeColumn } from '@shared/typeorm/DateTimeColumn';

@Entity({ name: 'post_keyword_subscription' })
export class PostKeywordSubscriptionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  pks_index: number;

  @Column()
  pks_keyword: string;

  @Column()
  pks_created_by: string;

  @DateTimeColumn()
  pks_created_at: Date;

  @DateTimeColumn()
  pks_updated_at: Date;

  @Column()
  pks_is_deleted: number;

  @DateTimeColumn({ nullable: true })
  pks_deleted_at: Date | null;
}
