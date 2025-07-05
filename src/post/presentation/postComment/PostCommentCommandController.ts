import { Request } from 'express';
import { Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, Param, Post, Req } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerResponseOnError } from '@shared/core/presentation/ControllerResponse';
import { CreatePostCommentUseCase } from '../../application/postComment/CreatePostCommentUseCase/CreatePostCommentUseCase';
import { PostCommentCommandControllerCreatePostCommentRequestBody, PostCommentCommandControllerCreatePostCommentRequestParams } from './dto/PostCommentCommandControllerRequest';
import { PostCommentCommandControllerCreatePostCommentResponseBody } from './dto/PostCommentCommandControllerResponse';

@Controller()
@ApiTags('Post Comment')
export class PostCommentCommandController {
  constructor(
    private readonly createPostCommentUseCase: CreatePostCommentUseCase,
  ) {}

  @Post('posts/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '댓글 작성' })
  @ApiCreatedResponse({ description: 'Success', type: PostCommentCommandControllerCreatePostCommentResponseBody })
  @ApiBadRequestResponse({ description: 'Bad request', type: ControllerResponseOnError })
  @ApiNotFoundResponse({ description: 'Not found', type: ControllerResponseOnError })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ControllerResponseOnError })
  async createPostComment(
    @Req() request: Request,
    @Param() params: PostCommentCommandControllerCreatePostCommentRequestParams,
    @Body() body: PostCommentCommandControllerCreatePostCommentRequestBody,
  ) {
    const { ok, comment } = await this.createPostCommentUseCase.execute({
      postId: params.postId,
      parentCommentId: body.parentCommentId || null,
      content: body.content,
      author: body.author,
    });
    if (!ok) {
      throw new InternalServerErrorException();
    }

    return {
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      path: request.url,
      ok: true,
      result: {
        id: comment.id.toNumber(),
      },
    };
  }
}
