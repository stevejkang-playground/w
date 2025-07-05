import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { BaseDomainEvent } from '@shared/core/domain/DomainEvent';

export class PostCommentCreatedEvent extends BaseDomainEvent {
  public readonly postId: number;
  public readonly content: string;
  public readonly author: string;

  constructor(aggregateId: UniqueEntityID, postId: number, content: string, author: string) {
    super(aggregateId, 'PostCommentCreatedEvent');
    this.postId = postId;
    this.content = content;
    this.author = author;
  }
}