import { ApiProperty } from '@nestjs/swagger';
import { ControllerResponse } from '@shared/core/presentation/ControllerResponse';

export class PostQueryControllerGetPostResponseBodyResult {
  @ApiProperty({
    name: 'id',
    type: Number,
    description: '게시글 ID',
    example: 1,
    required: true,
    nullable: false,
  })
  id: number;

  @ApiProperty({
    name: 'title',
    type: String,
    description: '게시글 제목',
    example: '제목입니다',
    required: true,
    nullable: false,
  })
  title: string;

  @ApiProperty({
    name: 'content',
    type: String,
    description: '게시글 내용',
    example: '내용입니다',
    required: true,
    nullable: false,
  })
  content: string;

  @ApiProperty({
    name: 'author',
    type: String,
    description: '게시글 작성자',
    example: '작성자입니다',
    required: true,
    nullable: false,
  })
  author: string;

  @ApiProperty({
    name: 'createdAt',
    type: String,
    description: '게시글 작성일',
    example: '2025-01-01T00:00:00+09:00',
    required: true,
    nullable: false,
  })
  createdAt: string;

  @ApiProperty({
    name: 'updatedAt',
    type: String,
    description: '게시글 수정일',
    example: '2025-01-01T00:00:00+09:00',
    required: true,
    nullable: false,
  })
  updatedAt: string;
}

export class PostQueryControllerGetAllPostsResponseBodyResult {
  @ApiProperty({
    name: 'posts',
    type: PostQueryControllerGetPostResponseBodyResult,
    isArray: true,
  })
  posts: PostQueryControllerGetPostResponseBodyResult[];

  @ApiProperty({
    name: 'hasNext',
    type: Boolean,
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    name: 'nextCursor',
    type: String,
    description: '다음 페이지 커서',
    example: 'eyJpZCI6MTB9',
    required: false,
  })
  nextCursor?: string;
}

export class PostQueryControllerGetAllPostsResponseBody extends ControllerResponse {
  @ApiProperty({
    name: 'result',
    type: PostQueryControllerGetAllPostsResponseBodyResult,
  })
  result: PostQueryControllerGetAllPostsResponseBodyResult;
}

export class PostQueryControllerGetPostResponseBody extends ControllerResponse {
  @ApiProperty({
    name: 'result',
    type: PostQueryControllerGetPostResponseBodyResult,
  })
  result: PostQueryControllerGetPostResponseBodyResult;
}
