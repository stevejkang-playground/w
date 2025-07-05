import { ApiProperty } from '@nestjs/swagger';
import { ControllerResponse } from '@shared/core/presentation/ControllerResponse';

export class PostCommentQueryControllerGetPostCommentsResponseBodyComment {
  @ApiProperty({
    name: 'id',
    type: Number,
    description: '댓글 ID',
    example: 1,
    required: true,
    nullable: false,
  })
  id: number;

  @ApiProperty({
    name: 'content',
    type: String,
    description: '댓글 내용',
    example: '댓글 내용입니다',
    required: true,
    nullable: false,
  })
  content: string;

  @ApiProperty({
    name: 'author',
    type: String,
    description: '댓글 작성자',
    example: '작성자',
    required: true,
    nullable: false,
  })
  author: string;

  @ApiProperty({
    name: 'createdAt',
    type: String,
    description: '댓글 작성일',
    example: '2025-01-01T00:00:00+09:00',
    required: true,
    nullable: false,
  })
  createdAt: string;

  @ApiProperty({
    name: 'updatedAt',
    type: String,
    description: '댓글 수정일',
    example: '2025-01-01T00:00:00+09:00',
    required: true,
    nullable: false,
  })
  updatedAt: string;

  @ApiProperty({
    name: 'replies',
    type: PostCommentQueryControllerGetPostCommentsResponseBodyComment,
    isArray: true,
    description: '대댓글 목록',
    required: false,
  })
  replies?: PostCommentQueryControllerGetPostCommentsResponseBodyComment[];
}

export class PostCommentQueryControllerGetPostCommentsResponseBodyResult {
  @ApiProperty({
    name: 'comments',
    type: PostCommentQueryControllerGetPostCommentsResponseBodyComment,
    isArray: true,
  })
  comments: PostCommentQueryControllerGetPostCommentsResponseBodyComment[];

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

export class PostCommentQueryControllerGetPostCommentsResponseBody extends ControllerResponse {
  @ApiProperty({
    name: 'result',
    type: PostCommentQueryControllerGetPostCommentsResponseBodyResult,
  })
  result: PostCommentQueryControllerGetPostCommentsResponseBodyResult;
}
