import { Test } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { Post } from '../../../../domain/Post';
import { PostComment } from '../../../../domain/PostComment';
import { POST_COMMENT_REPOSITORY, PostCommentRepository } from '../../../../infrastructure/PostCommentRepository';
import { FindPostUseCase } from '../../../post/FindPostUseCase/FindPostUseCase';
import { FindAllPostCommentsUseCase } from '../FindAllPostCommentsUseCase';
import { FindAllPostCommentsUseCaseRequest } from '../dto/FindAllPostCommentsUseCaseRequest';

describe('FindAllPostCommentsUseCase', () => {
  let useCase: FindAllPostCommentsUseCase;
  let mockPostCommentRepository: MockProxy<PostCommentRepository>;
  let mockFindPostUseCase: MockProxy<FindPostUseCase>;

  beforeEach(async () => {
    mockPostCommentRepository = mock<PostCommentRepository>();
    mockFindPostUseCase = mock<FindPostUseCase>();

    const module = await Test.createTestingModule({
      providers: [
        FindAllPostCommentsUseCase,
        {
          provide: POST_COMMENT_REPOSITORY,
          useValue: mockPostCommentRepository,
        },
        {
          provide: FindPostUseCase,
          useValue: mockFindPostUseCase,
        },
      ],
    }).compile();

    useCase = module.get<FindAllPostCommentsUseCase>(FindAllPostCommentsUseCase);

    jest.clearAllMocks();
  });

  const createMockPost = (id: number = 1) => {
    return Post.create({
      title: '제목입니다',
      content: '내용입니다',
      author: '작성자입니다',
      password: 'hashed-password',
      createdBy: '작성자입니다',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    }, new UniqueEntityID(id)).value!;
  };

  const createMockComment = (id: number, postId: number = 1, depth: number = 0, parentCommentId: number | null = null) => {
    return PostComment.create({
      postId,
      parentCommentId,
      content: `내용 ${id}`,
      depth,
      author: `작성자 ${id}`,
      createdBy: `작성자 ${id}`,
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date('2025-01-01T10:00:00Z'),
    }, new UniqueEntityID(id)).value!;
  };

  describe('execute', () => {
    const mockPost = createMockPost(1);

    beforeEach(() => {
      mockFindPostUseCase.execute.mockResolvedValue({
        ok: true,
        post: mockPost,
      });
    });

    describe('without pagination', () => {
      it('should return all comments successfully', async () => {
        const mockComments = [
          createMockComment(1, 1, 0, null),
          createMockComment(2, 1, 1, 1),
          createMockComment(3, 1, 0, null),
        ];

        mockPostCommentRepository.findByPostIdWithCursor.mockResolvedValue({
          comments: mockComments,
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 1,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.comments).toEqual(mockComments);
        expect(result.hasNext).toBe(false);
        expect(result.nextCursor).toBeUndefined();
        expect(mockFindPostUseCase.execute).toHaveBeenCalledWith({ id: 1 });
        expect(mockPostCommentRepository.findByPostIdWithCursor).toHaveBeenCalledWith(1, undefined, 10);
      });

      it('should use default limit when not provided', async () => {
        mockPostCommentRepository.findByPostIdWithCursor.mockResolvedValue({
          comments: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 1,
        };

        await useCase.execute(request);

        expect(mockPostCommentRepository.findByPostIdWithCursor).toHaveBeenCalledWith(1, undefined, 10);
      });
    });

    describe('with pagination', () => {
      it('should handle cursor-based pagination', async () => {
        const mockComments = [
          createMockComment(4, 1, 0, null),
          createMockComment(5, 1, 1, 4),
        ];
        const cursor = 'eyJpZCI6M30='; // base64 encoded cursor
        const nextCursor = 'eyJpZCI6NX0=';

        mockPostCommentRepository.findByPostIdWithCursor.mockResolvedValue({
          comments: mockComments,
          hasNext: true,
          nextCursor,
        });

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 1,
          cursor,
          limit: 5,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.comments).toEqual(mockComments);
        expect(result.hasNext).toBe(true);
        expect(result.nextCursor).toBe(nextCursor);
        expect(mockPostCommentRepository.findByPostIdWithCursor).toHaveBeenCalledWith(1, cursor, 5);
      });

      it('should handle custom limit', async () => {
        mockPostCommentRepository.findByPostIdWithCursor.mockResolvedValue({
          comments: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 1,
          limit: 20,
        };

        await useCase.execute(request);

        expect(mockPostCommentRepository.findByPostIdWithCursor).toHaveBeenCalledWith(1, undefined, 20);
      });

      it('should handle cursor without limit', async () => {
        const cursor = 'eyJpZCI6MX0=';
        mockPostCommentRepository.findByPostIdWithCursor.mockResolvedValue({
          comments: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 1,
          cursor,
        };

        await useCase.execute(request);

        expect(mockPostCommentRepository.findByPostIdWithCursor).toHaveBeenCalledWith(1, cursor, 10);
      });

      it('should handle pagination with mixed depth comments', async () => {
        const parentComment1 = createMockComment(1, 1, 0, null);
        const childComment1 = createMockComment(2, 1, 1, 1);
        const parentComment2 = createMockComment(3, 1, 0, null);
        const childComment2 = createMockComment(4, 1, 1, 3);

        const mockComments = [parentComment1, childComment1, parentComment2, childComment2];

        mockPostCommentRepository.findByPostIdWithCursor.mockResolvedValue({
          comments: mockComments,
          hasNext: true,
          nextCursor: 'eyJpZCI6M30=',
        });

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 1,
          limit: 2,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.comments).toEqual(mockComments);
        expect(result.hasNext).toBe(true);
        expect(result.nextCursor).toBe('eyJpZCI6M30=');
      });
    });

    describe('empty results', () => {
      it('should handle empty results with no next page', async () => {
        mockPostCommentRepository.findByPostIdWithCursor.mockResolvedValue({
          comments: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 1,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.comments).toEqual([]);
        expect(result.hasNext).toBe(false);
        expect(result.nextCursor).toBeUndefined();
      });
    });

    describe('post validation', () => {
      it('should propagate post not found error', async () => {
        const postNotFoundError = new Error('Post not found');
        mockFindPostUseCase.execute.mockRejectedValue(postNotFoundError);

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 999,
        };

        await expect(useCase.execute(request)).rejects.toThrow(postNotFoundError);
        expect(mockPostCommentRepository.findByPostIdWithCursor).not.toHaveBeenCalled();
      });
    });

    describe('repository failures', () => {
      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        mockPostCommentRepository.findByPostIdWithCursor.mockRejectedValue(repositoryError);

        const request: FindAllPostCommentsUseCaseRequest = {
          postId: 1,
        };

        await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
        expect(mockPostCommentRepository.findByPostIdWithCursor).toHaveBeenCalledWith(1, undefined, 10);
      });
    });
  });
});
