import { CoreResponse } from '@shared/core/application/CoreResponse';
import { PostComment } from '../../../../domain/PostComment';

export interface CreatePostCommentUseCaseResponse extends CoreResponse {
  comment: PostComment;
}
