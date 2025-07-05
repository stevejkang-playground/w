import { PostKeywordSubscription } from '../domain/PostKeywordSubscription';

export const POST_KEYWORD_SUBSCRIPTION_REPOSITORY = Symbol('POST_KEYWORD_SUBSCRIPTION_REPOSITORY');

export interface PostKeywordSubscriptionRepository {
  findMatchingSubscriptions(content: string): Promise<PostKeywordSubscription[]>;
}
