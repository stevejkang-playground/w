import { Result } from '@shared/core/domain/Result';
import { ValueObject } from '@shared/core/domain/ValueObject';

interface PostSnapshotProps {
  postId: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export class PostSnapshot extends ValueObject<PostSnapshotProps> {
  private constructor(props: PostSnapshotProps) {
    super(props);
  }

  static createNew(props: PostSnapshotProps): Result<PostSnapshot> {
    return Result.ok(new PostSnapshot(props));
  }

  get postId(): number {
    return this.props.postId;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
