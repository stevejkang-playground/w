import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '@shared/core/application/UseCase';
import { POST_REPOSITORY, PostRepository } from '../../../infrastructure/PostRepository';
import { FindPostUseCaseRequest } from './dto/FindPostUseCaseRequest';
import { FindPostUseCaseResponse } from './dto/FindPostUseCaseResponse';

@Injectable()
export class FindPostUseCase implements UseCase<FindPostUseCaseRequest, FindPostUseCaseResponse> {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(request: FindPostUseCaseRequest): Promise<FindPostUseCaseResponse> {
    const post = await this.postRepository.findOne(request.id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return { ok: true, post: post };
  }
}
