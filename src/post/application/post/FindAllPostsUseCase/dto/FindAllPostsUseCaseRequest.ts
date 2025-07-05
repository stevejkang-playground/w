export interface FindAllPostsUseCaseRequest {
  cursor?: string;
  limit?: number;
  title?: string;
  author?: string;
}
