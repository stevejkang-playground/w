import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/core/application/UseCase';
import { POST_REPOSITORY, PostRepository } from '../../../infrastructure/PostRepository';
import { FindAllPostsUseCaseRequest } from './dto/FindAllPostsUseCaseRequest';
import { FindAllPostsUseCaseResponse } from './dto/FindAllPostsUseCaseResponse';

@Injectable()
export class FindAllPostsUseCase implements UseCase<FindAllPostsUseCaseRequest, FindAllPostsUseCaseResponse> {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(request: FindAllPostsUseCaseRequest): Promise<FindAllPostsUseCaseResponse> {
    const { cursor, limit = 10, title, author } = request;
    const { posts, hasNext, nextCursor } = await this.postRepository.findWithCursor(cursor, limit, title, author);

    return { 
      ok: true, 
      posts,
      hasNext,
      nextCursor,
    };
  }
}
