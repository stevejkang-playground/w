import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import TransformToNumber from '@shared/core/presentation/TransformToNumber';

export class PostQueryControllerGetPostRequestParams {
  @ApiProperty({
    name: 'id',
    description: '게시글 ID',
    type: Number,
    required: true,
    nullable: false,
    example: '1',
  })
  @Transform(TransformToNumber)
  id: number;
}

export class PostQueryControllerGetAllPostsRequestQuery {
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

  @ApiProperty({
    name: 'title',
    description: '제목 검색어',
    type: String,
    required: false,
    nullable: true,
    example: '검색할 제목',
  })
  title?: string;

  @ApiProperty({
    name: 'author',
    description: '작성자 검색어',
    type: String,
    required: false,
    nullable: true,
    example: '검색할 작성자',
  })
  author?: string;
}
