import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BooleanInteger } from '@shared/core/domain/BooleanInteger';
import { PostKeywordSubscription } from '../../domain/PostKeywordSubscription';
import { PostKeywordSubscriptionEntity } from '../entities/PostKeywordSubscriptionEntity';
import { PostKeywordSubscriptionRepository } from '../PostKeywordSubscriptionRepository';
import { MysqlPostKeywordSubscriptionRepositoryMapper } from './mapper/MysqlPostKeywordSubscriptionRepositoryMapper';

export class MysqlPostKeywordSubscriptionRepository implements PostKeywordSubscriptionRepository {
  constructor(
    @InjectRepository(PostKeywordSubscriptionEntity)
    private readonly postKeywordSubscriptionRepository: Repository<PostKeywordSubscriptionEntity>,
  ) {}

  async findMatchingSubscriptions(content: string): Promise<PostKeywordSubscription[]> {
    const entities = await this.postKeywordSubscriptionRepository
      .createQueryBuilder()
      .where('pks_is_deleted = :isDeleted', { isDeleted: BooleanInteger.FALSE })
      .getMany();

    const matchingEntities = entities.filter(entity => content.toLowerCase().includes(entity.pks_keyword.toLowerCase()));

    return MysqlPostKeywordSubscriptionRepositoryMapper.toDomains(matchingEntities);
  }
}
