import { AggregateRoot } from '@shared/core/domain/AggregateRoot';
import { Result } from '@shared/core/domain/Result';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';

interface PostKeywordSubscriptionProps {
  keyword: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt: Date | null;
}

export class PostKeywordSubscription extends AggregateRoot<PostKeywordSubscriptionProps> {
  private constructor(props: PostKeywordSubscriptionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: PostKeywordSubscriptionProps, id?: UniqueEntityID): Result<PostKeywordSubscription> {
    return Result.ok(new PostKeywordSubscription(props, id));
  }

  static createNew(props: PostKeywordSubscriptionProps): Result<PostKeywordSubscription> {
    return this.create({
      ...props,
      createdBy: props.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    });
  }

  get keyword(): string {
    return this.props.keyword;
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

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }
}
