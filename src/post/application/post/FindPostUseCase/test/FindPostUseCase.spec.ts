import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { Post } from '../../../../domain/Post';
import { POST_REPOSITORY, PostRepository } from '../../../../infrastructure/PostRepository';
import { FindPostUseCase } from '../FindPostUseCase';
import { FindPostUseCaseRequest } from '../dto/FindPostUseCaseRequest';

describe('FindPostUseCase', () => {
  let useCase: FindPostUseCase;
  let mockPostRepository: MockProxy<PostRepository>;

  beforeEach(async () => {
    mockPostRepository = mock<PostRepository>();

    const module = await Test.createTestingModule({
      providers: [
        FindPostUseCase,
        {
          provide: POST_REPOSITORY,
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindPostUseCase>(FindPostUseCase);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: FindPostUseCaseRequest = {
      id: 1,
    };

    const mockPost = Post.create({
      title: '제목입니다',
      content: '내용입니다',
      author: '작성자입니다',
      password: 'hashed-password',
      createdBy: '작성자입니다',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date('2025-01-01T10:00:00Z'),
      isDeleted: false,
      deletedAt: null,
    }, new UniqueEntityID(1)).value!;

    describe('successful retrieval', () => {
      it('should find and return a post successfully', async () => {
        mockPostRepository.findOne.mockResolvedValue(mockPost);

        const result = await useCase.execute(validRequest);

        expect(result.ok).toBe(true);
        expect(result.post).toBe(mockPost);
        expect(mockPostRepository.findOne).toHaveBeenCalledWith(1);
      });

      it('should call repository with correct id', async () => {
        mockPostRepository.findOne.mockResolvedValue(mockPost);

        await useCase.execute({ id: 42 });

        expect(mockPostRepository.findOne).toHaveBeenCalledWith(42);
      });

      it('should return the exact post from repository', async () => {
        const specificPost = Post.create({
          title: '제목입니다',
          content: '내용입니다',
          author: '작성자입니다',
          password: 'specific-password',
          createdBy: '작성자입니다',
          createdAt: new Date('2025-02-01T15:30:00Z'),
          updatedAt: new Date('2025-02-01T15:30:00Z'),
          isDeleted: false,
          deletedAt: null,
        }, new UniqueEntityID(123)).value!;

        mockPostRepository.findOne.mockResolvedValue(specificPost);

        const result = await useCase.execute({ id: 123 });

        expect(result.post).toBe(specificPost);
        expect(result.post.id.toNumber()).toBe(123);
        expect(result.post.title).toBe('제목입니다');
        expect(result.post.content).toBe('내용입니다');
        expect(result.post.author).toBe('작성자입니다');
      });
    });

    describe('post not found', () => {
      it('should throw NotFoundException when post does not exist', async () => {
        mockPostRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute(validRequest)).rejects.toThrow(NotFoundException);
        await expect(useCase.execute(validRequest)).rejects.toThrow('Post not found');
        
        expect(mockPostRepository.findOne).toHaveBeenCalledWith(1);
      });

      it('should throw NotFoundException for different post ids', async () => {
        mockPostRepository.findOne.mockResolvedValue(null);

        await expect(useCase.execute({ id: 999 })).rejects.toThrow(NotFoundException);
        await expect(useCase.execute({ id: 0 })).rejects.toThrow(NotFoundException);
        await expect(useCase.execute({ id: -1 })).rejects.toThrow(NotFoundException);
        
        expect(mockPostRepository.findOne).toHaveBeenCalledTimes(3);
      });
    });

    describe('repository failures', () => {
      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        mockPostRepository.findOne.mockRejectedValue(repositoryError);

        await expect(useCase.execute(validRequest)).rejects.toThrow(repositoryError);
        expect(mockPostRepository.findOne).toHaveBeenCalledWith(1);
      });
    });

    describe('deleted posts', () => {
      it('should return deleted posts if repository returns them', async () => {
        const deletedPost = Post.create({
          title: '삭제된 포스트 제목',
          content: '삭제된 포스트 내용',
          author: '작성자입니다',
          password: 'hashed-password',
          createdBy: '작성자입니다',
          createdAt: new Date('2025-01-01T10:00:00Z'),
          updatedAt: new Date('2025-01-01T11:00:00Z'),
          isDeleted: true,
          deletedAt: new Date('2025-01-01T11:00:00Z'),
        }, new UniqueEntityID(1)).value!;

        mockPostRepository.findOne.mockResolvedValue(deletedPost);

        const result = await useCase.execute(validRequest);

        expect(result.ok).toBe(true);
        expect(result.post).toBe(deletedPost);
        expect(result.post.isDeleted).toBe(true);
      });
    });
  });
});
