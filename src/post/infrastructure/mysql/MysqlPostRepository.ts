import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { InjectRepository } from '@nestjs/typeorm';
import { BooleanInteger } from '@shared/core/domain/BooleanInteger';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { Post } from '../../domain/Post';
import { PostSnapshot } from '../../domain/PostSnapshot';
import { PostEntity } from '../entities/PostEntity';
import { PostSnapshotEntity } from '../entities/PostSnapshotEntity';
import { PostRepository } from '../PostRepository';
import { MysqlPostRepositoryMapper } from './mapper/MysqlPostRepositoryMapper';

export class MysqlPostRepository implements PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PostSnapshotEntity)
    private readonly postSnapshotRepository: Repository<PostSnapshotEntity>,
  ) {}

  async findOne(id: number): Promise<Post | null> {
    const entity = await this.postRepository
      .createQueryBuilder()
      .where('p_index = :id', { id: id })
      .andWhere('p_is_deleted = :isDeleted', { isDeleted: BooleanInteger.FALSE })
      .getOne();

    if (!entity) {
      return null;
    }

    return MysqlPostRepositoryMapper.toDomain(entity);
  }

  async findAll(): Promise<Post[]> {
    const entities = await this.postRepository
      .createQueryBuilder()
      .where('p_is_deleted = :isDeleted', { isDeleted: BooleanInteger.FALSE })
      .getMany();

    return MysqlPostRepositoryMapper.toDomains(entities);
  }

  async findWithCursor(cursor?: string, limit: number = 10, title?: string, author?: string): Promise<{ posts: Post[]; hasNext: boolean; nextCursor?: string; }> {
    const queryBuilder = this.postRepository
      .createQueryBuilder()
      .where('p_is_deleted = :isDeleted', { isDeleted: BooleanInteger.FALSE })
      .orderBy('p_index', 'DESC');

    if (cursor) {
      const decodedCursor = parseInt(Buffer.from(cursor, 'base64').toString('ascii'), 10);
      queryBuilder.andWhere('p_index < :cursor', { cursor: decodedCursor });
    }

    if (title) {
      queryBuilder.andWhere('p_title LIKE :title', { title: `%${title}%` });
    }

    if (author) {
      queryBuilder.andWhere('p_author LIKE :author', { author: `%${author}%` });
    }

    const entities = await queryBuilder.limit(limit + 1).getMany();

    const hasNext = entities.length > limit;
    const posts = entities.slice(0, limit);
    
    let nextCursor: string | undefined = undefined;
    if (hasNext && posts.length > 0) {
      const lastPost = posts[posts.length - 1];
      if (lastPost) {
        nextCursor = Buffer.from(lastPost.p_index.toString()).toString('base64');
      }
    }

    return {
      posts: MysqlPostRepositoryMapper.toDomains(posts),
      hasNext,
      nextCursor,
    };
  }

  @Transactional()
  async save(post: Post): Promise<Post> {
    const isNewDomain = post.id.isNewIdentifier();
    if (isNewDomain) {
      const insert = await this.postRepository
        .createQueryBuilder()
        .insert()
        .into(PostEntity)
        .values({
          p_title: post.title,
          p_content: post.content,
          p_author: post.author,
          p_created_by: post.createdBy,
          p_created_at: post.createdAt,
          p_updated_at: post.updatedAt,
          p_is_deleted: post.isDeleted ? BooleanInteger.TRUE : BooleanInteger.FALSE,
          p_deleted_at: post.deletedAt,
          p_password: post.password,
        })
        .execute();

      const insertId = insert.raw.insertId;
      const createdPost = Post.create({ ...post.props }, new UniqueEntityID(insertId)).value;

      await this.createSnapshot(createdPost.createSnapshot(createdPost.createdBy).value);

      return createdPost;
    } else {
      await this.postRepository
        .createQueryBuilder()
        .update(PostEntity)
        .set({
          p_title: post.title,
          p_content: post.content,
          p_author: post.author,
          p_updated_at: post.updatedAt,
          p_is_deleted: post.isDeleted ? BooleanInteger.TRUE : BooleanInteger.FALSE,
          p_deleted_at: post.deletedAt,
          p_password: post.password,
        })
        .where('p_index = :id', { id: post.id.toNumber() })
        .execute();

      await this.createSnapshot(post.createSnapshot(post.createdBy).value);

      return post;
    }
  }

  private async createSnapshot(snapshot: PostSnapshot): Promise<void> {
    await this.postSnapshotRepository
      .createQueryBuilder()
      .insert()
      .into(PostSnapshotEntity)
      .values({
        ps_p_index: snapshot.postId,
        ps_p_title: snapshot.title,
        ps_p_content: snapshot.content,
        ps_created_by: snapshot.createdBy,
        ps_created_at: snapshot.createdAt,
      })
      .execute();
  }
}
