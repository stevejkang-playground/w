import { BooleanInteger } from '@shared/core/domain/BooleanInteger';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { Post } from '../../../domain/Post';
import { PostEntity } from '../../entities/PostEntity';

export class MysqlPostRepositoryMapper {
  static toDomain(entity: PostEntity): Post {
    return Post.create({
      title: entity.p_title,
      content: entity.p_content,
      author: entity.p_author,
      createdBy: entity.p_created_by,
      createdAt: entity.p_created_at,
      updatedAt: entity.p_updated_at,
      isDeleted: entity.p_is_deleted === BooleanInteger.TRUE,
      deletedAt: entity.p_deleted_at,
      password: entity.p_password,
    }, new UniqueEntityID(entity.p_index)).value;
  }

  static toDomains(entities: PostEntity[]): Post[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
