import { CoreResponse } from '@shared/core/application/CoreResponse';
import { Post } from '../../../../domain/Post';

export interface FindAllPostsUseCaseResponse extends CoreResponse {
  posts: Post[];
  hasNext: boolean;
  nextCursor?: string;
}
