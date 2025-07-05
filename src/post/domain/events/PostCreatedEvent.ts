import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { BaseDomainEvent } from '@shared/core/domain/DomainEvent';

export class PostCreatedEvent extends BaseDomainEvent {
  public readonly title: string;
  public readonly content: string;
  public readonly author: string;

  constructor(aggregateId: UniqueEntityID, title: string, content: string, author: string) {
    super(aggregateId, 'PostCreatedEvent');
    this.title = title;
    this.content = content;
    this.author = author;
  }
}