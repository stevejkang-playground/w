export interface CreatePostCommentUseCaseRequest {
  postId: number;
  parentCommentId: number | null;
  content: string;
  author: string;
}
