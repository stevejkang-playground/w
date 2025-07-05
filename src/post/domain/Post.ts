import { AggregateRoot } from '@shared/core/domain/AggregateRoot';
import { Result } from '@shared/core/domain/Result';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { PostSnapshot } from './PostSnapshot';
import { PostCreatedEvent } from './events/PostCreatedEvent';

interface PostNewProps {
  title: string;
  content: string;
  author: string;
  password: string;
}

interface PostProps extends PostNewProps {
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt: Date | null;
}

export class Post extends AggregateRoot<PostProps> {
  private constructor(props: PostProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: PostProps, id?: UniqueEntityID): Result<Post> {
    if (props.title.trim().length === 0) {
      return Result.fail('Title cannot be empty');
    }

    if (props.content.trim().length === 0) {
      return Result.fail('Content cannot be empty');
    }

    if (props.author.trim().length === 0) {
      return Result.fail('CreatedBy cannot be empty');
    }

    return Result.ok(new Post(props, id));
  }

  static createNew(props: PostNewProps): Result<Post> {
    const postOrError = this.create({
      ...props,
      createdBy: props.author, // assume that it is same as 'author' in this assignment. TODO: It should be a unique value for anonymous user
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    });

    if (postOrError.isSuccess) {
      const post = postOrError.value;
      post.addDomainEvent(new PostCreatedEvent(
        post.id,
        post.title,
        post.content,
        post.author,
      ));
    }

    return postOrError;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get author(): string {
    return this.props.author;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get password(): string {
    return this.props.password;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  createSnapshot(createdBy: string): Result<PostSnapshot> {
    return PostSnapshot.createNew({
      postId: this.id.toNumber(),
      title: this.title,
      content: this.content,
      createdBy: createdBy,
      createdAt: new Date(),
    });
  }

  delete(): Result<Post> {
    return Post.create({
      ...this.props,
      isDeleted: true,
      deletedAt: new Date(),
    }, this.id);
  }

  update(props: Partial<PostProps>): Result<Post> {
    return Post.create({
      ...this.props,
      ...props,
    }, this.id);
  }
}
