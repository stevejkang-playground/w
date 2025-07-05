import { Request } from 'express';
import { Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Param, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerResponseOnError } from '@shared/core/presentation/ControllerResponse';
import { FindAllPostsUseCase } from '../../application/post/FindAllPostsUseCase/FindAllPostsUseCase';
import { FindPostUseCase } from '../../application/post/FindPostUseCase/FindPostUseCase';
import { PostQueryControllerGetPostRequestParams, PostQueryControllerGetAllPostsRequestQuery } from './dto/PostQueryControllerRequest';
import { PostQueryControllerGetAllPostsResponseBody, PostQueryControllerGetPostResponseBody } from './dto/PostQueryControllerResponse';

@Controller('posts')
@ApiTags('Post')
export class PostQueryController {
  constructor(
    private readonly findAllPostsUseCase: FindAllPostsUseCase,
    private readonly findPostUseCase: FindPostUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: '게시글 목록' })
  @ApiOkResponse({ description: 'Success', type: PostQueryControllerGetAllPostsResponseBody })
  @ApiBadRequestResponse({ description: 'Bad request', type: ControllerResponseOnError })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ControllerResponseOnError })
  async getAllPosts(
    @Req() request: Request,
    @Query() query: PostQueryControllerGetAllPostsRequestQuery,
  ) {
    const limit = Math.min(query.limit || 10, 50);
    const { ok, posts, hasNext, nextCursor } = await this.findAllPostsUseCase.execute({
      cursor: query.cursor,
      limit,
      title: query.title,
      author: query.author,
    });
    if (!ok) {
      throw new InternalServerErrorException();
    }

    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      path: request.url,
      ok: true,
      result: {
        posts: posts.map(post => ({
          id: post.id.toNumber(),
          title: post.title,
          content: post.content,
          author: post.author,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })),
        hasNext,
        nextCursor,
      },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: '게시글 상세 정보' })
  @ApiOkResponse({ description: 'Success', type: PostQueryControllerGetPostResponseBody })
  @ApiNotFoundResponse({ description: 'Not found', type: ControllerResponseOnError })
  @ApiBadRequestResponse({ description: 'Bad request', type: ControllerResponseOnError })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ControllerResponseOnError })
  async getPost(
    @Req() request: Request,
    @Param() params: PostQueryControllerGetPostRequestParams,
  ) {
    const { ok, post } = await this.findPostUseCase.execute({
      id: params.id,
    });
    if (!ok) {
      throw new InternalServerErrorException();
    }

    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      path: request.url,
      ok: true,
      result: {
        id: post.id.toNumber(),
        title: post.title,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    };
  }
}
