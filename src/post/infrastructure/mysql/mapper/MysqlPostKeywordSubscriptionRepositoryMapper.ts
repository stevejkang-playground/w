import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { PostKeywordSubscription } from '../../../domain/PostKeywordSubscription';
import { PostKeywordSubscriptionEntity } from '../../entities/PostKeywordSubscriptionEntity';

export class MysqlPostKeywordSubscriptionRepositoryMapper {
  static toDomain(entity: PostKeywordSubscriptionEntity): PostKeywordSubscription {
    return PostKeywordSubscription.create({
      keyword: entity.pks_keyword,
      createdBy: entity.pks_created_by,
      createdAt: entity.pks_created_at,
      updatedAt: entity.pks_updated_at,
      isDeleted: entity.pks_is_deleted === 1,
      deletedAt: entity.pks_deleted_at,
    }, new UniqueEntityID(entity.pks_index)).value;
  }

  static toDomains(entities: PostKeywordSubscriptionEntity[]): PostKeywordSubscription[] {
    return entities.map(entity => this.toDomain(entity));
  }
}
