import { AggregateRoot } from '@shared/core/domain/AggregateRoot';
import { Result } from '@shared/core/domain/Result';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { PostCommentCreatedEvent } from './events/PostCommentCreatedEvent';

interface PostCommentNewProps {
  postId: number;
  parentCommentId: number | null;
  content: string;
  depth: number;
  author: string;
}

interface PostCommentProps extends PostCommentNewProps {
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const POST_COMMENT_DEPTH_DEFAULT = 0;
export const POST_COMMENT_DEPTH_MAX = 1;

export class PostComment extends AggregateRoot<PostCommentProps> {
  private constructor(props: PostCommentProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: PostCommentProps, id?: UniqueEntityID): Result<PostComment> {
    if (props.depth > POST_COMMENT_DEPTH_MAX) {
      return Result.fail('Depth cannot be greater than max depth');
    }

    if (props.parentCommentId !== null && props.depth === POST_COMMENT_DEPTH_DEFAULT) {
      return Result.fail('ParentCommentId should be null when depth is default');
    }

    if (props.parentCommentId === null && props.depth !== POST_COMMENT_DEPTH_DEFAULT) {
      return Result.fail('ParentCommentId cannot be null when depth is not default');
    }

    return Result.ok(new PostComment(props, id));
  }

  static createNew(props: PostCommentNewProps): Result<PostComment> {
    const commentOrError = this.create({
      ...props,
      createdBy: props.author, // assume that it is same as 'author' in this assignment. TODO: It should be a unique value for anonymous user
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (commentOrError.isSuccess) {
      const comment = commentOrError.value;
      comment.addDomainEvent(new PostCommentCreatedEvent(
        comment.id,
        comment.postId,
        comment.content,
        comment.author,
      ));
    }

    return commentOrError;
  }

  get postId(): number {
    return this.props.postId;
  }

  get parentCommentId(): number | null {
    return this.props.parentCommentId;
  }

  get content(): string {
    return this.props.content;
  }

  get depth(): number {
    return this.props.depth;
  }

  get author(): string {
    return this.props.author;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  canHaveChildComment(): boolean {
    return this.props.depth === POST_COMMENT_DEPTH_DEFAULT;
  }
}
