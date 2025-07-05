import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { PostComment } from '../../../domain/PostComment';
import { PostCommentEntity } from '../../entities/PostCommentEntity';

export class MysqlPostCommentRepositoryMapper {
  static toDomain(entity: PostCommentEntity): PostComment {
    return PostComment.create({
      postId: entity.pc_p_index,
      parentCommentId: entity.pc_parent_pc_index,
      content: entity.pc_content,
      depth: entity.pc_depth,
      author: entity.pc_author,
      createdBy: entity.pc_created_by,
      createdAt: entity.pc_created_at,
      updatedAt: entity.pc_updated_at,
    }, new UniqueEntityID(entity.pc_index)).value;
  }

  static toDomains(entities: PostCommentEntity[]): PostComment[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
