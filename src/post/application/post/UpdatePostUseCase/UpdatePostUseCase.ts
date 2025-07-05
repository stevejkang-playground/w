import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '@shared/core/application/UseCase';
import { PasswordHandler } from '@shared/security/PasswordHandler';
import { POST_REPOSITORY, PostRepository } from '../../../infrastructure/PostRepository';
import { UpdatePostUseCaseRequest } from './dto/UpdatePostUseCaseRequest';
import { UpdatePostUseCaseResponse } from './dto/UpdatePostUseCaseResponse';

@Injectable()
export class UpdatePostUseCase implements UseCase<UpdatePostUseCaseRequest, UpdatePostUseCaseResponse> {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(request: UpdatePostUseCaseRequest): Promise<UpdatePostUseCaseResponse> {
    this.validateRequest(request);

    const post = await this.postRepository.findOne(request.id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.validatePassword(request.password, post.password);

    const isDeletionRequest = typeof request.isDeleted !== 'undefined' && request.isDeleted;

    if (isDeletionRequest) {
      const deletedPostOrError = post.delete();
      if (deletedPostOrError.isFailure) {
        throw new BadRequestException(deletedPostOrError.error);
      }

      await this.postRepository.save(deletedPostOrError.value);
    } else {
      const updatedPostOrError = post.update({
        title: request.title ?? post.title,
        content: request.content ?? post.content,
      });
      if (updatedPostOrError.isFailure) {
        throw new BadRequestException(updatedPostOrError.error);
      }

      await this.postRepository.save(updatedPostOrError.value);
    }

    return { ok: true };
  }

  private validateRequest(request: UpdatePostUseCaseRequest): void {
    if (typeof request.isDeleted !== 'undefined' && !request.isDeleted) {
      throw new BadRequestException('Cannot restore deleted post');
    }

    if (typeof request.isDeleted !== 'undefined' &&
      (typeof request.title !== 'undefined'
        || typeof request.content !== 'undefined')
    ) {
      throw new BadRequestException('Cannot update title or content when deleting post');
    }
  }

  private async validatePassword(providedPassword: string, storedEncryptedPassword: string): Promise<void> {
    const isValid = await PasswordHandler.comparePasswords(providedPassword, storedEncryptedPassword);
    if (!isValid) {
      throw new ForbiddenException('Invalid password');
    }
  }
}
