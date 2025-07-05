import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mock, MockProxy } from 'jest-mock-extended';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { Post } from '../../../../domain/Post';
import { POST_COMMENT_DEPTH_DEFAULT, POST_COMMENT_DEPTH_MAX, PostComment } from '../../../../domain/PostComment';
import { POST_COMMENT_REPOSITORY, PostCommentRepository } from '../../../../infrastructure/PostCommentRepository';
import { FindPostUseCase } from '../../../post/FindPostUseCase/FindPostUseCase';
import { FindAllPostCommentsUseCase } from '../../FindAllPostCommentsUseCase/FindAllPostCommentsUseCase';
import { CreatePostCommentUseCase } from '../CreatePostCommentUseCase';
import { CreatePostCommentUseCaseRequest } from '../dto/CreatePostCommentUseCaseRequest';

describe('CreatePostCommentUseCase', () => {
  let useCase: CreatePostCommentUseCase;
  let mockPostCommentRepository: MockProxy<PostCommentRepository>;
  let mockFindPostUseCase: MockProxy<FindPostUseCase>;
  let mockFindAllPostCommentsUseCase: MockProxy<FindAllPostCommentsUseCase>;
  let mockEventEmitter: MockProxy<EventEmitter2>;

  beforeEach(async () => {
    mockPostCommentRepository = mock<PostCommentRepository>();
    mockFindPostUseCase = mock<FindPostUseCase>();
    mockFindAllPostCommentsUseCase = mock<FindAllPostCommentsUseCase>();
    mockEventEmitter = mock<EventEmitter2>();

    const module = await Test.createTestingModule({
      providers: [
        CreatePostCommentUseCase,
        {
          provide: POST_COMMENT_REPOSITORY,
          useValue: mockPostCommentRepository,
        },
        {
          provide: FindPostUseCase,
          useValue: mockFindPostUseCase,
        },
        {
          provide: FindAllPostCommentsUseCase,
          useValue: mockFindAllPostCommentsUseCase,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    useCase = module.get<CreatePostCommentUseCase>(CreatePostCommentUseCase);

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

  const createMockParentComment = (id: number = 1, depth: number = POST_COMMENT_DEPTH_DEFAULT) => {
    return PostComment.create({
      postId: 1,
      parentCommentId: depth === 0 ? null : 1,
      content: '부모코멘트',
      depth,
      author: '작성자입니다',
      createdBy: '작성자입니다',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, new UniqueEntityID(id)).value!;
  };

  describe('execute', () => {
    const validRequest: CreatePostCommentUseCaseRequest = {
      postId: 1,
      parentCommentId: null,
      content: '내용입니다',
      author: '작성자입니다',
    };

    const mockPost = createMockPost(1);

    beforeEach(() => {
      mockFindPostUseCase.execute.mockResolvedValue({
        ok: true,
        post: mockPost,
      });
    });

    describe('successful creation', () => {
      describe('parent comments (depth 0)', () => {
        it('should create a parent comment successfully', async () => {
          const savedComment = PostComment.createNew({
            postId: 1,
            parentCommentId: null,
            content: validRequest.content,
            depth: POST_COMMENT_DEPTH_DEFAULT,
            author: validRequest.author,
          }).value!;

          mockPostCommentRepository.save.mockResolvedValue(savedComment);

          const result = await useCase.execute(validRequest);

          expect(result.ok).toBe(true);
          expect(result.comment).toBe(savedComment);
          expect(mockFindPostUseCase.execute).toHaveBeenCalledWith({ id: 1 });
          expect(mockPostCommentRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              props: expect.objectContaining({
                postId: 1,
                parentCommentId: null,
                content: validRequest.content,
                depth: POST_COMMENT_DEPTH_DEFAULT,
                author: validRequest.author,
              }),
            })
          );
        });

        it('should not query for parent comment when parentCommentId is null', async () => {
          const savedComment = PostComment.createNew({
            postId: 1,
            parentCommentId: null,
            content: validRequest.content,
            depth: POST_COMMENT_DEPTH_DEFAULT,
            author: validRequest.author,
          }).value!;

          mockPostCommentRepository.save.mockResolvedValue(savedComment);

          await useCase.execute(validRequest);

          expect(mockFindAllPostCommentsUseCase.execute).not.toHaveBeenCalled();
        });
      });

      describe('child comments (depth 1)', () => {
        it('should create a child comment successfully', async () => {
          const parentComment = createMockParentComment(2, POST_COMMENT_DEPTH_DEFAULT);
          const requestWithParent = {
            ...validRequest,
            parentCommentId: 2,
          };

          mockFindAllPostCommentsUseCase.execute.mockResolvedValue({
            ok: true,
            comments: [parentComment],
            hasNext: false,
            nextCursor: undefined,
          });

          const savedComment = PostComment.createNew({
            postId: 1,
            parentCommentId: 2,
            content: validRequest.content,
            depth: 1,
            author: validRequest.author,
          }).value!;

          mockPostCommentRepository.save.mockResolvedValue(savedComment);

          const result = await useCase.execute(requestWithParent);

          expect(result.ok).toBe(true);
          expect(result.comment).toBe(savedComment);
          expect(mockFindAllPostCommentsUseCase.execute).toHaveBeenCalledWith({ postId: 1 });
          expect(mockPostCommentRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              props: expect.objectContaining({
                postId: 1,
                parentCommentId: 2,
                content: validRequest.content,
                depth: 1,
                author: validRequest.author,
              }),
            })
          );
        });

        it('should calculate correct depth based on parent comment', async () => {
          const parentComment = createMockParentComment(2, POST_COMMENT_DEPTH_DEFAULT);
          const requestWithParent = {
            ...validRequest,
            parentCommentId: 2,
          };

          mockFindAllPostCommentsUseCase.execute.mockResolvedValue({
            ok: true,
            comments: [parentComment],
            hasNext: false,
            nextCursor: undefined,
          });

          const savedComment = PostComment.createNew({
            postId: 1,
            parentCommentId: 2,
            content: validRequest.content,
            depth: 1,
            author: validRequest.author,
          }).value!;

          mockPostCommentRepository.save.mockResolvedValue(savedComment);

          await useCase.execute(requestWithParent);

          expect(mockPostCommentRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              props: expect.objectContaining({
                depth: 1,
              }),
            })
          );
        });
      });
    });

    describe('validation failures', () => {
      describe('post validation', () => {
        it('should propagate post not found error', async () => {
          const postNotFoundError = new Error('Post not found');
          mockFindPostUseCase.execute.mockRejectedValue(postNotFoundError);

          await expect(useCase.execute(validRequest)).rejects.toThrow(postNotFoundError);
          expect(mockPostCommentRepository.save).not.toHaveBeenCalled();
        });
      });

      describe('parent comment validation', () => {
        it('should throw BadRequestException when parent comment cannot have child comment', async () => {
          const maxDepthComment = createMockParentComment(2, POST_COMMENT_DEPTH_MAX);
          const requestWithParent = {
            ...validRequest,
            parentCommentId: 2,
          };

          mockFindAllPostCommentsUseCase.execute.mockResolvedValue({
            ok: true,
            comments: [maxDepthComment],
            hasNext: false,
            nextCursor: undefined,
          });

          await expect(useCase.execute(requestWithParent)).rejects.toThrow(BadRequestException);
          await expect(useCase.execute(requestWithParent)).rejects.toThrow('Parent comment cannot have child comment');
          expect(mockPostCommentRepository.save).not.toHaveBeenCalled();
        });
      });
    });

    describe('repository failures', () => {
      beforeEach(() => {
        mockFindAllPostCommentsUseCase.execute.mockResolvedValue({
          ok: true,
          comments: [],
          hasNext: false,
          nextCursor: undefined,
        });
      });

      it('should propagate repository errors (save)', async () => {
        const repositoryError = new Error('Database save failed');
        mockPostCommentRepository.save.mockRejectedValue(repositoryError);

        await expect(useCase.execute(validRequest)).rejects.toThrow(repositoryError);
      });
    });
  });
});
