import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import TransformToNumber from '@shared/core/presentation/TransformToNumber';

export class PostCommentCommandControllerCreatePostCommentRequestParams {
  @ApiProperty({
    name: 'postId',
    description: '게시글 ID',
    type: Number,
    required: true,
    nullable: false,
    example: 1,
  })
  @Transform(TransformToNumber)
  postId: number;
}

export class PostCommentCommandControllerCreatePostCommentRequestBody {
  @ApiProperty({
    name: 'parentCommentId',
    description: '부모 댓글 ID',
    type: Number,
    required: false,
    nullable: false,
    example: 1,
  })
  parentCommentId?: number;

  @ApiProperty({
    name: 'content',
    description: '내용',
    type: String,
    required: true,
    nullable: false,
    example: '내용입니다',
  })
  content: string;

  @ApiProperty({
    name: 'author',
    description: '댓글 작성자',
    type: String,
    required: true,
    nullable: false,
    example: '작성자입니다',
  })
  author: string;
}
