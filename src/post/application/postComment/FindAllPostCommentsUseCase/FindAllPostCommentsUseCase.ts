import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/core/application/UseCase';
import { POST_COMMENT_REPOSITORY, PostCommentRepository } from '../../../infrastructure/PostCommentRepository';
import { FindPostUseCase } from '../../post/FindPostUseCase/FindPostUseCase';
import { FindAllPostCommentsUseCaseRequest } from './dto/FindAllPostCommentsUseCaseRequest';
import { FindAllPostCommentsUseCaseResponse } from './dto/FindAllPostCommentsUseCaseResponse';

@Injectable()
export class FindAllPostCommentsUseCase implements UseCase<FindAllPostCommentsUseCaseRequest, FindAllPostCommentsUseCaseResponse> {
  constructor(
    @Inject(POST_COMMENT_REPOSITORY)
    private readonly postCommentRepository: PostCommentRepository,
    private readonly findPostUseCase: FindPostUseCase,
  ) {}

  async execute(request: FindAllPostCommentsUseCaseRequest): Promise<FindAllPostCommentsUseCaseResponse> {
    const { post } = await this.findPostUseCase.execute({ id: request.postId });

    const { cursor, limit = 10 } = request;
    const { comments, hasNext, nextCursor } = await this.postCommentRepository.findByPostIdWithCursor(post.id.toNumber(), cursor, limit);

    return { 
      ok: true, 
      comments,
      hasNext,
      nextCursor,
    };
  }
}
