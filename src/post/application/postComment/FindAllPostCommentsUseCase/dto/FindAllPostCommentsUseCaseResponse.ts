import { CoreResponse } from '@shared/core/application/CoreResponse';
import { PostComment } from '../../../../domain/PostComment';

export interface FindAllPostCommentsUseCaseResponse extends CoreResponse {
  comments: PostComment[];
  hasNext: boolean;
  nextCursor?: string;
}
