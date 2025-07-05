import { Test } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { Post } from '../../../../domain/Post';
import { POST_REPOSITORY, PostRepository } from '../../../../infrastructure/PostRepository';
import { FindAllPostsUseCase } from '../FindAllPostsUseCase';
import { FindAllPostsUseCaseRequest } from '../dto/FindAllPostsUseCaseRequest';

describe('FindAllPostsUseCase', () => {
  let useCase: FindAllPostsUseCase;
  let mockPostRepository: MockProxy<PostRepository>;

  beforeEach(async () => {
    mockPostRepository = mock<PostRepository>();

    const module = await Test.createTestingModule({
      providers: [
        FindAllPostsUseCase,
        {
          provide: POST_REPOSITORY,
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllPostsUseCase>(FindAllPostsUseCase);

    jest.clearAllMocks();
  });

  const createMockPost = (id: number, title: string = '제목입니다', author: string = '작성자입니다') => {
    return Post.create({
      title,
      content: `Test Content ${id}`,
      author,
      password: 'hashed-password',
      createdBy: author,
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date('2025-01-01T10:00:00Z'),
      isDeleted: false,
      deletedAt: null,
    }, new UniqueEntityID(id)).value!;
  };

  describe('execute', () => {
    describe('without pagination and search', () => {
      it('should return all posts successfully', async () => {
        const mockPosts = [
          createMockPost(1),
          createMockPost(2),
          createMockPost(3),
        ];

        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: mockPosts,
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {};
        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual(mockPosts);
        expect(result.hasNext).toBe(false);
        expect(result.nextCursor).toBeUndefined();
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(undefined, 10, undefined, undefined);
      });

      it('should use default limit when not provided', async () => {
        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {};
        await useCase.execute(request);

        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(undefined, 10, undefined, undefined);
      });
    });

    describe('with pagination', () => {
      it('should handle cursor-based pagination', async () => {
        const mockPosts = [createMockPost(4), createMockPost(5)];
        const cursor = 'eyJpZCI6M30='; // base64 encoded cursor
        const nextCursor = 'eyJpZCI6NX0=';

        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: mockPosts,
          hasNext: true,
          nextCursor,
        });

        const request: FindAllPostsUseCaseRequest = {
          cursor,
          limit: 5,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual(mockPosts);
        expect(result.hasNext).toBe(true);
        expect(result.nextCursor).toBe(nextCursor);
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(cursor, 5, undefined, undefined);
      });

      it('should handle custom limit', async () => {
        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {
          limit: 20,
        };

        await useCase.execute(request);

        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(undefined, 20, undefined, undefined);
      });

      it('should handle cursor without limit', async () => {
        const cursor = 'eyJpZCI6MX0=';
        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {
          cursor,
        };

        await useCase.execute(request);

        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(cursor, 10, undefined, undefined);
      });
    });

    describe('with search', () => {
      it('should search by title only', async () => {
        const searchTerm = '검색대상';
        const mockPosts = [createMockPost(1, '검색대상 제목입니다')];

        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: mockPosts,
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {
          title: searchTerm,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual(mockPosts);
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(undefined, 10, searchTerm, undefined);
      });

      it('should search by author only', async () => {
        const authorName = '검색대상';
        const mockPosts = [createMockPost(1, '제목입니다', authorName)];

        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: mockPosts,
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {
          author: authorName,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual(mockPosts);
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(undefined, 10, undefined, authorName);
      });

      it('should search by both title and author', async () => {
        const titleSearch = '검색대상';
        const authorSearch = '홍길동';
        const mockPosts = [createMockPost(1, '검색대상 제목', '홍길동 동동')];

        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: mockPosts,
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {
          title: titleSearch,
          author: authorSearch,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual(mockPosts);
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(undefined, 10, titleSearch, authorSearch);
      });
    });

    describe('combined pagination and search', () => {
      it('should handle cursor pagination with title search', async () => {
        const cursor = 'eyJpZCI6MX0=';
        const titleSearch = '검색대상';
        const mockPosts = [createMockPost(2, '검색대상 제목')];

        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: mockPosts,
          hasNext: true,
          nextCursor: 'eyJpZCI6Mn0=',
        });

        const request: FindAllPostsUseCaseRequest = {
          cursor,
          limit: 15,
          title: titleSearch,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual(mockPosts);
        expect(result.hasNext).toBe(true);
        expect(result.nextCursor).toBe('eyJpZCI6Mn0=');
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(cursor, 15, titleSearch, undefined);
      });

      it('should handle cursor pagination with author search', async () => {
        const cursor = 'eyJpZCI6NX0=';
        const authorSearch = '검색대상';
        const mockPosts = [createMockPost(6, '검색대상 제목', '검색대상 작성자')];

        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: mockPosts,
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {
          cursor,
          limit: 5,
          author: authorSearch,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual(mockPosts);
        expect(result.hasNext).toBe(false);
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(cursor, 5, undefined, authorSearch);
      });

      it('should handle full search and pagination parameters', async () => {
        const cursor = 'eyJpZCI6MTB9';
        const titleSearch = '검색대상';
        const authorSearch = '색인대상';
        const limit = 25;
        const mockPosts = [createMockPost(11, '검색대상 제목', '색인대상 작성자')];

        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: mockPosts,
          hasNext: true,
          nextCursor: 'eyJpZCI6MTV9',
        });

        const request: FindAllPostsUseCaseRequest = {
          cursor,
          limit,
          title: titleSearch,
          author: authorSearch,
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual(mockPosts);
        expect(result.hasNext).toBe(true);
        expect(result.nextCursor).toBe('eyJpZCI6MTV9');
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(cursor, limit, titleSearch, authorSearch);
      });
    });

    describe('empty results', () => {
      it('should handle empty results with no next page', async () => {
        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {};
        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual([]);
        expect(result.hasNext).toBe(false);
        expect(result.nextCursor).toBeUndefined();
      });

      it('should handle search with no results', async () => {
        mockPostRepository.findWithCursor.mockResolvedValue({
          posts: [],
          hasNext: false,
          nextCursor: undefined,
        });

        const request: FindAllPostsUseCaseRequest = {
          title: '존재X 제목',
          author: '존재X 작성자',
        };

        const result = await useCase.execute(request);

        expect(result.ok).toBe(true);
        expect(result.posts).toEqual([]);
        expect(result.hasNext).toBe(false);
        expect(result.nextCursor).toBeUndefined();
      });
    });

    describe('repository failures', () => {
      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        mockPostRepository.findWithCursor.mockRejectedValue(repositoryError);

        const request: FindAllPostsUseCaseRequest = {};

        await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
        expect(mockPostRepository.findWithCursor).toHaveBeenCalledWith(undefined, 10, undefined, undefined);
      });
    });
  });
});
