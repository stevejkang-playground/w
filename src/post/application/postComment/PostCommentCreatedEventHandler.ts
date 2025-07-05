import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { PostCommentCreatedEvent } from '../../domain/events/PostCommentCreatedEvent';
import { POST_KEYWORD_SUBSCRIPTION_REPOSITORY, PostKeywordSubscriptionRepository } from '../../infrastructure/PostKeywordSubscriptionRepository';

@Injectable()
export class PostCommentCreatedEventHandler {
  private readonly logger = new Logger(PostCommentCreatedEventHandler.name);

  constructor(
    @Inject(POST_KEYWORD_SUBSCRIPTION_REPOSITORY)
    private readonly postKeywordSubscriptionRepository: PostKeywordSubscriptionRepository,
  ) {}

  @OnEvent('PostCommentCreatedEvent')
  async handle(event: PostCommentCreatedEvent): Promise<void> {
    try {
      const matchingSubscriptions = await this.postKeywordSubscriptionRepository.findMatchingSubscriptions(event.content);

      for (const subscription of matchingSubscriptions) {
        if (subscription.createdBy === event.author) {
          continue;
        }

        this.logger.debug(`Keyword notification received! ${event.content} (author: ${event.author}, postId: ${event.postId})`);
      }
    } catch (error) {
      this.logger.error(`Error while handling PostCommentCreatedEvent: ${error.message}`);
    }
  }
}
