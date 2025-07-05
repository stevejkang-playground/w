import { CoreResponse } from '@shared/core/application/CoreResponse';
import { Post } from '../../../../domain/Post';

export interface CreatePostUseCaseResponse extends CoreResponse {
  post: Post;
}
