export interface FindAllPostCommentsUseCaseRequest {
  postId: number;
  cursor?: string;
  limit?: number;
}
