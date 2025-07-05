import { ApiProperty } from '@nestjs/swagger';
import { ControllerResponse } from '@shared/core/presentation/ControllerResponse';

export class PostCommandControllerCreatePostResponseBodyResult {
  @ApiProperty({
    name: 'id',
    type: Number,
    description: '게시글 ID',
    example: 1,
    required: true,
    nullable: false,
  })
  id: number;
}

export class PostCommandControllerCreatePostResponseBody extends ControllerResponse {
  result: PostCommandControllerCreatePostResponseBodyResult;
}
