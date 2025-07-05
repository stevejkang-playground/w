import { Request } from 'express';
import { Body, Controller, Delete, HttpCode, HttpStatus, InternalServerErrorException, Param, Patch, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerResponseOnError } from '@shared/core/presentation/ControllerResponse';
import { CreatePostUseCase } from '../../application/post/CreatePostUseCase/CreatePostUseCase';
import { UpdatePostUseCase } from '../../application/post/UpdatePostUseCase/UpdatePostUseCase';
import { PostCommandControllerCreatePostRequestBody, PostCommandControllerDeletePostRequestBody, PostCommandControllerUpdatePostRequestBody, PostCommandControllerUpdatePostRequestParams } from './dto/PostCommandControllerRequest';
import { PostCommandControllerCreatePostResponseBody } from './dto/PostCommandControllerResponse';

@Controller('posts')
@ApiTags('Post')
export class PostCommandController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '게시글 작성' })
  @ApiCreatedResponse({ description: 'Success', type: PostCommandControllerCreatePostResponseBody })
  @ApiBadRequestResponse({ description: 'Bad request', type: ControllerResponseOnError })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ControllerResponseOnError })
  async createPost(
    @Req() request: Request,
    @Body() body: PostCommandControllerCreatePostRequestBody,
  ) {
    const { ok, post } = await this.createPostUseCase.execute({
      title: body.title,
      content: body.content,
      author: body.author,
      password: body.password,
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
        id: post.id.toNumber(),
      },
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: '게시글 수정' })
  @ApiNoContentResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'Not found', type: ControllerResponseOnError })
  @ApiBadRequestResponse({ description: 'Bad request', type: ControllerResponseOnError })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ControllerResponseOnError })
  async updatePost(
    @Param() params: PostCommandControllerUpdatePostRequestParams,
    @Body() body: PostCommandControllerUpdatePostRequestBody,
  ) {
    const { ok } = await this.updatePostUseCase.execute({
      id: params.id,
      password: body.password,
      title: body.title,
      content: body.content,
    });
    if (!ok) {
      throw new InternalServerErrorException();
    }

    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiNoContentResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'Not found', type: ControllerResponseOnError })
  @ApiBadRequestResponse({ description: 'Bad request', type: ControllerResponseOnError })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ControllerResponseOnError })
  async deletePost(
    @Param() params: PostCommandControllerUpdatePostRequestParams,
    @Body() body: PostCommandControllerDeletePostRequestBody,
  ) {
    const { ok } = await this.updatePostUseCase.execute({
      id: params.id,
      isDeleted: true,
      password: body.password,
    });
    if (!ok) {
      throw new InternalServerErrorException();
    }

    return;
  }
}
