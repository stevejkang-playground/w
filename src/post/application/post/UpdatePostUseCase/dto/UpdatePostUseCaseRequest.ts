export interface UpdatePostUseCaseRequest {
  id: number;
  password: string;
  title?: string;
  content?: string;
  isDeleted?: boolean;
}
