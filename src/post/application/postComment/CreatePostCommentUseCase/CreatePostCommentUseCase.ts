import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UseCase } from '@shared/core/application/UseCase';
import { POST_COMMENT_DEPTH_DEFAULT, PostComment } from '../../../domain/PostComment';
import { POST_COMMENT_REPOSITORY, PostCommentRepository } from '../../../infrastructure/PostCommentRepository';
import { FindAllPostCommentsUseCase } from '../FindAllPostCommentsUseCase/FindAllPostCommentsUseCase';
import { FindPostUseCase } from '../../post/FindPostUseCase/FindPostUseCase';
import { CreatePostCommentUseCaseRequest } from './dto/CreatePostCommentUseCaseRequest';
import { CreatePostCommentUseCaseResponse } from './dto/CreatePostCommentUseCaseResponse';

@Injectable()
export class CreatePostCommentUseCase implements UseCase<CreatePostCommentUseCaseRequest, CreatePostCommentUseCaseResponse> {
  constructor(
    @Inject(POST_COMMENT_REPOSITORY)
    private readonly postCommentRepository: PostCommentRepository,
    private readonly findPostUseCase: FindPostUseCase,
    private readonly findAllPostCommentsUseCase: FindAllPostCommentsUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(request: CreatePostCommentUseCaseRequest): Promise<CreatePostCommentUseCaseResponse> {
    const { post } = await this.findPostUseCase.execute({ id: request.postId });

    let commentDepth = POST_COMMENT_DEPTH_DEFAULT;

    if (request.parentCommentId !== null) {
      const parentComment = await this.getPostComment(post.id.toNumber(), request.parentCommentId);
      if (!parentComment) {
        throw new BadRequestException('Parent comment not found');
      }
      if (!parentComment.canHaveChildComment()) {
        throw new BadRequestException('Parent comment cannot have child comment');
      }

      commentDepth = parentComment.depth + 1;
    }

    const commentOrError = PostComment.createNew({
      postId: post.id.toNumber(),
      parentCommentId: request.parentCommentId,
      content: request.content,
      depth: commentDepth,
      author: request.author,
    });
    if (commentOrError.isFailure) {
      throw new BadRequestException(commentOrError.error);
    }

    const savedComment = await this.postCommentRepository.save(commentOrError.value);

    for (const event of commentOrError.value.domainEvents) {
      this.eventEmitter.emit(event.eventType, event);
    }
    commentOrError.value.clearEvents();

    return { ok: true, comment: savedComment };
  }

  private async getPostComment(postId: number, commentId: number): Promise<PostComment | null> {
    const { comments } = await this.findAllPostCommentsUseCase.execute({ postId: postId });
    return comments.find(comment => comment.id.toNumber() === commentId) || null;
  }
}
