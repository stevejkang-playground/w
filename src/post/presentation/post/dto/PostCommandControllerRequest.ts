import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import TransformToNumber from '@shared/core/presentation/TransformToNumber';

export class PostCommandControllerCreatePostRequestBody {
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
    name: 'password',
    type: String,
    description: '게시글 비밀번호',
    example: 'Password123',
    required: true,
    nullable: false,
  })
  password: string;
}

export class PostCommandControllerUpdatePostRequestParams {
  @ApiProperty({
    name: 'id',
    description: '게시글 ID',
    type: Number,
    required: true,
    nullable: false,
    example: 1,
  })
  @Transform(TransformToNumber)
  id: number;
}

export class PostCommandControllerUpdatePostRequestBody {
  @ApiProperty({
    name: 'title',
    type: String,
    description: '게시글 제목',
    example: '제목입니다',
    required: true,
    nullable: false,
  })
  title?: string;

  @ApiProperty({
    name: 'content',
    type: String,
    description: '게시글 내용',
    example: '내용입니다',
    required: true,
    nullable: false,
  })
  content?: string;

  @ApiProperty({
    name: 'password',
    type: String,
    description: '게시글 비밀번호',
    example: 'Password123',
    required: true,
    nullable: false,
  })
  password: string;
}

export class PostCommandControllerDeletePostRequestBody {
  @ApiProperty({
    name: 'password',
    type: String,
    description: '게시글 비밀번호',
    example: 'Password123',
    required: true,
    nullable: false,
  })
  password: string;
}
