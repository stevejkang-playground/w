import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
/** Use cases */
import { CreatePostUseCase } from './application/post/CreatePostUseCase/CreatePostUseCase';
import { UpdatePostUseCase } from './application/post/UpdatePostUseCase/UpdatePostUseCase';
import { FindAllPostsUseCase } from './application/post/FindAllPostsUseCase/FindAllPostsUseCase';
import { FindPostUseCase } from './application/post/FindPostUseCase/FindPostUseCase';
import { CreatePostCommentUseCase } from './application/postComment/CreatePostCommentUseCase/CreatePostCommentUseCase';
import { FindAllPostCommentsUseCase } from './application/postComment/FindAllPostCommentsUseCase/FindAllPostCommentsUseCase';
/** Event Handlers */
import { PostCreatedEventHandler } from './application/post/PostCreatedEventHandler';
import { PostCommentCreatedEventHandler } from './application/postComment/PostCommentCreatedEventHandler';
/** Entities */
import { PostEntity } from './infrastructure/entities/PostEntity';
import { PostSnapshotEntity } from './infrastructure/entities/PostSnapshotEntity';
import { PostCommentEntity } from './infrastructure/entities/PostCommentEntity';
import { PostKeywordSubscriptionEntity } from './infrastructure/entities/PostKeywordSubscriptionEntity';
/** Repositories */
import { POST_REPOSITORY } from './infrastructure/PostRepository';
import { MysqlPostRepository } from './infrastructure/mysql/MysqlPostRepository';
import { POST_COMMENT_REPOSITORY } from './infrastructure/PostCommentRepository';
import { MysqlPostCommentRepository } from './infrastructure/mysql/MysqlPostCommentRepository';
import { POST_KEYWORD_SUBSCRIPTION_REPOSITORY } from './infrastructure/PostKeywordSubscriptionRepository';
import { MysqlPostKeywordSubscriptionRepository } from './infrastructure/mysql/MysqlPostKeywordSubscriptionRepository';
/** Controllers */
import { PostCommandController } from './presentation/post/PostCommandController';
import { PostQueryController } from './presentation/post/PostQueryController';
import { PostCommentCommandController } from './presentation/postComment/PostCommentCommandController';
import { PostCommentQueryController } from './presentation/postComment/PostCommentQueryController';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      PostSnapshotEntity,
      PostCommentEntity,
      PostKeywordSubscriptionEntity,
    ]),
  ],
  controllers: [
    PostQueryController,
    PostCommandController,
    PostCommentQueryController,
    PostCommentCommandController,
  ],
  providers: [
    CreatePostUseCase,
    UpdatePostUseCase,
    FindAllPostsUseCase,
    FindPostUseCase,
    CreatePostCommentUseCase,
    FindAllPostCommentsUseCase,
    PostCreatedEventHandler,
    PostCommentCreatedEventHandler,
    {
      provide: POST_REPOSITORY,
      useClass: MysqlPostRepository,
    },
    {
      provide: POST_COMMENT_REPOSITORY,
      useClass: MysqlPostCommentRepository,
    },
    {
      provide: POST_KEYWORD_SUBSCRIPTION_REPOSITORY,
      useClass: MysqlPostKeywordSubscriptionRepository,
    },
  ],
})
export class PostModule {}
