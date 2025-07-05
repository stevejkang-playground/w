import { CoreResponse } from '@shared/core/application/CoreResponse';
import { Post } from '../../../../domain/Post';

export interface FindPostUseCaseResponse extends CoreResponse {
  post: Post;
}
