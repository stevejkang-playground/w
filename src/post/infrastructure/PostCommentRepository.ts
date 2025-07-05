import { PostComment } from '../domain/PostComment';

export const POST_COMMENT_REPOSITORY = Symbol('POST_COMMENT_REPOSITORY');

export interface PostCommentRepository {
  findByPostId(postId: number): Promise<PostComment[]>;
  findByPostIdWithCursor(postId: number, cursor?: string, limit?: number): Promise<{ comments: PostComment[]; hasNext: boolean; nextCursor?: string; }>;

  save(comment: PostComment): Promise<PostComment>;
}
