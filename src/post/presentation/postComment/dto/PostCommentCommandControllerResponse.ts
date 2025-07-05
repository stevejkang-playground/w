import { ApiProperty } from '@nestjs/swagger';
import { ControllerResponse } from '@shared/core/presentation/ControllerResponse';

export class PostCommentCommandControllerCreatePostCommentResponseBodyResult {
  @ApiProperty({
    name: 'id',
    description: '댓글 ID',
    type: Number,
    required: true,
    nullable: false,
    example: 1,
  })
  id: number;
}

export class PostCommentCommandControllerCreatePostCommentResponseBody extends ControllerResponse {
  result: PostCommentCommandControllerCreatePostCommentResponseBodyResult;
}
