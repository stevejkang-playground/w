import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import TransformToNumber from '@shared/core/presentation/TransformToNumber';

export class PostCommentQueryControllerGetPostCommentsRequestParams {
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

export class PostCommentQueryControllerGetPostCommentsRequestQuery {
  @ApiProperty({
    name: 'cursor',
    description: '페이징 커서',
    type: String,
    required: false,
    nullable: true,
    example: 'eyJpZCI6MTB9',
  })
  cursor?: string;

  @ApiProperty({
    name: 'limit',
    description: '페이지 크기 (기본값: 10, 최대: 50)',
    type: Number,
    required: false,
    nullable: true,
    example: 10,
  })
  @Transform(TransformToNumber)
  limit?: number;
}
