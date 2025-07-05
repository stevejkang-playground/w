import { Request } from 'express';
import { Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Param, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerResponseOnError } from '@shared/core/presentation/ControllerResponse';
import { FindAllPostCommentsUseCase } from '../../application/postComment/FindAllPostCommentsUseCase/FindAllPostCommentsUseCase';
import { PostCommentQueryControllerGetPostCommentsRequestParams, PostCommentQueryControllerGetPostCommentsRequestQuery } from './dto/PostCommentQueryControllerRequest';
import { PostCommentQueryControllerGetPostCommentsResponseBody, PostCommentQueryControllerGetPostCommentsResponseBodyComment } from './dto/PostCommentQueryControllerResponse';

@Controller()
@ApiTags('Post Comment')
export class PostCommentQueryController {
  constructor(
    private readonly findAllPostCommentsUseCase: FindAllPostCommentsUseCase,
  ) {}

  @Get('posts/:postId/comments')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: '댓글 목록' })
  @ApiOkResponse({ description: 'Success', type: PostCommentQueryControllerGetPostCommentsResponseBody })
  @ApiBadRequestResponse({ description: 'Bad request', type: ControllerResponseOnError })
  @ApiNotFoundResponse({ description: 'Not found', type: ControllerResponseOnError })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ControllerResponseOnError })
  async getPostComments(
    @Req() request: Request,
    @Param() params: PostCommentQueryControllerGetPostCommentsRequestParams,
    @Query() query: PostCommentQueryControllerGetPostCommentsRequestQuery,
  ) {
    const limit = Math.min(query.limit || 10, 50);
    const { ok, comments, hasNext, nextCursor } = await this.findAllPostCommentsUseCase.execute({
      postId: params.postId,
      cursor: query.cursor,
      limit,
    });
    if (!ok) {
      throw new InternalServerErrorException();
    }

    const parentComments = comments
      .filter(comment => comment.depth === 0)
      .map(parentComment => {
        const replies = comments
          .filter(comment => 
            comment.depth === 1 && 
            comment.parentCommentId === parentComment.id.toNumber(),
          )
          .map(reply => this.mapCommentToResponse(reply));

        return {
          ...this.mapCommentToResponse(parentComment),
          replies,
        };
      });

    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      path: request.url,
      ok: true,
      result: {
        comments: parentComments,
        hasNext,
        nextCursor,
      },
    };
  }

  private mapCommentToResponse(comment: { id: { toNumber(): number; }; content: string; author: string; depth: number; parentCommentId: number | null; createdAt: Date; updatedAt: Date; }): PostCommentQueryControllerGetPostCommentsResponseBodyComment {
    return {
      id: comment.id.toNumber(),
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }
}
