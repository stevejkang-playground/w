import { Post } from '../domain/Post';

export const POST_REPOSITORY = Symbol('POST_REPOSITORY');

export interface PostRepository {
  findOne(id: number): Promise<Post | null>;
  findAll(): Promise<Post[]>;
  findWithCursor(cursor?: string, limit?: number, title?: string, author?: string): Promise<{ posts: Post[]; hasNext: boolean; nextCursor?: string; }>;

  save(post: Post): Promise<Post>;
}
