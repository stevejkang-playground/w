import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { PostCreatedEvent } from '../../domain/events/PostCreatedEvent';
import { POST_KEYWORD_SUBSCRIPTION_REPOSITORY, PostKeywordSubscriptionRepository } from '../../infrastructure/PostKeywordSubscriptionRepository';

@Injectable()
export class PostCreatedEventHandler {
  private readonly logger = new Logger(PostCreatedEventHandler.name);

  constructor(
    @Inject(POST_KEYWORD_SUBSCRIPTION_REPOSITORY)
    private readonly postKeywordSubscriptionRepository: PostKeywordSubscriptionRepository,
  ) {}

  @OnEvent('PostCreatedEvent')
  async handle(event: PostCreatedEvent): Promise<void> {
    try {
      const searchText = `${event.title} ${event.content}`;
      const matchingSubscriptions = await this.postKeywordSubscriptionRepository.findMatchingSubscriptions(searchText);

      for (const subscription of matchingSubscriptions) {
        if (subscription.createdBy === event.author) {
          continue;
        }

        this.logger.debug(`Keyword notification received! ${event.title} (author: ${event.author})`);
      }
    } catch (error) {
      this.logger.error(`Error while handling PostCreatedEvent: ${error.message}`);
    }
  }
}
