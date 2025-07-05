import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UseCase } from '@shared/core/application/UseCase';
import { PasswordHandler } from '@shared/security/PasswordHandler';
import { Post } from '../../../domain/Post';
import { POST_REPOSITORY, PostRepository } from '../../../infrastructure/PostRepository';
import { CreatePostUseCaseRequest } from './dto/CreatePostUseCaseRequest';
import { CreatePostUseCaseResponse } from './dto/CreatePostUseCaseResponse';

@Injectable()
export class CreatePostUseCase implements UseCase<CreatePostUseCaseRequest, CreatePostUseCaseResponse> {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(request: CreatePostUseCaseRequest): Promise<CreatePostUseCaseResponse> {
    const { title, content, author, password } = request;

    const encryptedPassword = await PasswordHandler.hashPassword(password);

    const postOrError = Post.createNew({
      title: title,
      content: content,
      author: author,
      password: encryptedPassword,
    });
    if (postOrError.isFailure) {
      throw new BadRequestException(postOrError.error);
    }

    const savedPost = await this.postRepository.save(postOrError.value);

    for (const event of postOrError.value.domainEvents) {
      this.eventEmitter.emit(event.eventType, event);
    }
    postOrError.value.clearEvents();

    return { ok: true, post: savedPost };
  }
}
