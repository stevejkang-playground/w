import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { PostComment } from '../../domain/PostComment';
import { PostCommentEntity } from '../entities/PostCommentEntity';
import { PostCommentRepository } from '../PostCommentRepository';
import { MysqlPostCommentRepositoryMapper } from './mapper/MysqlPostCommentRepositoryMapper';

export class MysqlPostCommentRepository implements PostCommentRepository {
  constructor(
    @InjectRepository(PostCommentEntity)
    private readonly postCommentRepository: Repository<PostCommentEntity>,
  ) {}

  async findByPostId(postId: number): Promise<PostComment[]> {
    const entities = await this.postCommentRepository
      .createQueryBuilder()
      .where('pc_p_index = :postId', { postId })
      .orderBy('pc_index', 'ASC')
      .getMany();

    return MysqlPostCommentRepositoryMapper.toDomains(entities);
  }

  async findByPostIdWithCursor(postId: number, cursor?: string, limit: number = 10): Promise<{ comments: PostComment[]; hasNext: boolean; nextCursor?: string; }> {
    const queryBuilder = this.postCommentRepository
      .createQueryBuilder()
      .where('pc_p_index = :postId', { postId })
      .orderBy('pc_index', 'ASC');

    if (cursor) {
      const decodedCursor = parseInt(Buffer.from(cursor, 'base64').toString('ascii'), 10);
      queryBuilder.andWhere('pc_index > :cursor', { cursor: decodedCursor });
    }

    const allEntities = await this.postCommentRepository
      .createQueryBuilder()
      .where('pc_p_index = :postId', { postId })
      .orderBy('pc_index', 'ASC')
      .getMany();

    const allComments = MysqlPostCommentRepositoryMapper.toDomains(allEntities);

    const parentComments = allComments.filter(comment => comment.depth === 0);

    let filteredParentComments = parentComments;
    if (cursor) {
      const decodedCursor = parseInt(Buffer.from(cursor, 'base64').toString('ascii'), 10);
      filteredParentComments = parentComments.filter(comment => comment.id.toNumber() > decodedCursor);
    }

    const hasNext = filteredParentComments.length > limit;
    const paginatedParentComments = filteredParentComments.slice(0, limit);

    const parentCommentIds = paginatedParentComments.map(comment => comment.id.toNumber());
    const resultComments = allComments.filter(comment => 
      comment.depth === 0 && parentCommentIds.includes(comment.id.toNumber()) ||
      comment.depth === 1 && comment.parentCommentId !== null && parentCommentIds.includes(comment.parentCommentId),
    );
    
    let nextCursor: string | undefined = undefined;
    if (hasNext && paginatedParentComments.length > 0) {
      const lastParentComment = paginatedParentComments[paginatedParentComments.length - 1];
      if (lastParentComment) {
        nextCursor = Buffer.from(lastParentComment.id.toNumber().toString()).toString('base64');
      }
    }

    return {
      comments: resultComments,
      hasNext,
      nextCursor,
    };
  }

  async save(comment: PostComment): Promise<PostComment> {
    const isNewDomain = comment.id.isNewIdentifier();
    if (isNewDomain) {
      const insert = await this.postCommentRepository
        .createQueryBuilder()
        .insert()
        .into(PostCommentEntity)
        .values({
          pc_p_index: comment.postId,
          pc_parent_pc_index: comment.parentCommentId,
          pc_content: comment.content,
          pc_depth: comment.depth,
          pc_author: comment.author,
          pc_created_by: comment.createdBy,
          pc_created_at: comment.createdAt,
        })
        .execute();

      const insertId = insert.raw.insertId;

      return PostComment.create({ ...comment.props }, new UniqueEntityID(insertId)).value;
    } else {
      await this.postCommentRepository
        .createQueryBuilder()
        .update(PostCommentEntity)
        .set({
          pc_content: comment.content,
        })
        .where('pc_index = :id', { id: comment.id.toNumber() })
        .execute();

      return comment;
    }
  }
}
