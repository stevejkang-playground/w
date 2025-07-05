import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { PasswordHandler } from '@shared/security/PasswordHandler';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';
import { Post } from '../../../../domain/Post';
import { POST_REPOSITORY, PostRepository } from '../../../../infrastructure/PostRepository';
import { UpdatePostUseCase } from '../UpdatePostUseCase';
import { UpdatePostUseCaseRequest } from '../dto/UpdatePostUseCaseRequest';

jest.mock('@shared/security/PasswordHandler');

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;
  let mockPostRepository: MockProxy<PostRepository>;
  let mockPasswordHandler: jest.Mocked<typeof PasswordHandler>;

  beforeAll(() => {
    mockPasswordHandler = PasswordHandler as jest.Mocked<typeof PasswordHandler>;
  });

  beforeEach(async () => {
    mockPostRepository = mock<PostRepository>();

    const module = await Test.createTestingModule({
      providers: [
        UpdatePostUseCase,
        {
          provide: POST_REPOSITORY,
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePostUseCase>(UpdatePostUseCase);

    jest.clearAllMocks();
  });

  const createMockPost = (id: number = 1) => {
    return Post.create({
      title: '원래제목',
      content: '원래내용',
      author: '작성자입니다',
      password: 'hashed-password',
      createdBy: '작성자입니다',
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date('2025-01-01T10:00:00Z'),
      isDeleted: false,
      deletedAt: null,
    }, new UniqueEntityID(id)).value!;
  };

  describe('execute', () => {
    let mockPost: Post;

    beforeEach(() => {
      mockPost = createMockPost();
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPasswordHandler.comparePasswords.mockResolvedValue(true);
    });

    describe('successful updates', () => {
      describe('content updates', () => {
        it('should update title and content successfully', async () => {
          const request: UpdatePostUseCaseRequest = {
            id: 1,
            title: '수정제목',
            content: '수정내용',
            password: 'Password123',
          };

          const result = await useCase.execute(request);

          expect(result.ok).toBe(true);
          expect(mockPostRepository.findOne).toHaveBeenCalledWith(1);
          expect(mockPasswordHandler.comparePasswords).toHaveBeenCalledWith('Password123', 'hashed-password');
          expect(mockPostRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              props: expect.objectContaining({
                title: '수정제목',
                content: '수정내용',
              }),
            })
          );
        });

        it('should update only title when content is not provided', async () => {
          const request: UpdatePostUseCaseRequest = {
            id: 1,
            title: '수정제목',
            password: 'Password123',
          };

          await useCase.execute(request);

          expect(mockPostRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              props: expect.objectContaining({
                title: '수정제목',
                content: '원래내용',
              }),
            })
          );
        });

        it('should update only content when title is not provided', async () => {
          const request: UpdatePostUseCaseRequest = {
            id: 1,
            content: '수정내용',
            password: 'Password123',
          };

          await useCase.execute(request);

          expect(mockPostRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              props: expect.objectContaining({
                title: '원래제목',
                content: '수정내용',
              }),
            })
          );
        });
      });

      describe('deletion', () => {
        it('should delete post successfully', async () => {
          const request: UpdatePostUseCaseRequest = {
            id: 1,
            password: 'Password123',
            isDeleted: true,
          };

          await useCase.execute(request);

          expect(mockPostRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
              props: expect.objectContaining({
                isDeleted: true,
                deletedAt: expect.any(Date),
              }),
            })
          );
        });
      });
    });

    describe('validation failures', () => {
      describe('request validation', () => {
        it('should throw BadRequestException when trying to restore deleted post', async () => {
          const request: UpdatePostUseCaseRequest = {
            id: 1,
            password: 'Password123',
            isDeleted: false,
          };

          await expect(useCase.execute(request)).rejects.toThrow(BadRequestException);
          await expect(useCase.execute(request)).rejects.toThrow('Cannot restore deleted post');
          
          expect(mockPostRepository.findOne).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when trying to update title while deleting', async () => {
          const request: UpdatePostUseCaseRequest = {
            id: 1,
            password: 'Password123',
            isDeleted: true,
            title: '수정제목',
          };

          await expect(useCase.execute(request)).rejects.toThrow(BadRequestException);
          await expect(useCase.execute(request)).rejects.toThrow('Cannot update title or content when deleting post');
          
          expect(mockPostRepository.findOne).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when trying to update content while deleting', async () => {
          const request: UpdatePostUseCaseRequest = {
            id: 1,
            password: 'Password123',
            isDeleted: true,
            content: '수정내용',
          };

          await expect(useCase.execute(request)).rejects.toThrow(BadRequestException);
          await expect(useCase.execute(request)).rejects.toThrow('Cannot update title or content when deleting post');
        });

        it('should throw BadRequestException when trying to update both title and content while deleting', async () => {
          const request: UpdatePostUseCaseRequest = {
            id: 1,
            password: 'Password123',
            isDeleted: true,
            title: '수정제목',
            content: '수정내용',
          };

          await expect(useCase.execute(request)).rejects.toThrow(BadRequestException);
          await expect(useCase.execute(request)).rejects.toThrow('Cannot update title or content when deleting post');
        });
      });

      describe('post not found', () => {
        it('should throw NotFoundException when post does not exist', async () => {
          mockPostRepository.findOne.mockResolvedValue(null);

          const request: UpdatePostUseCaseRequest = {
            id: 999,
            password: 'any-password',
            title: '수정제목',
          };

          await expect(useCase.execute(request)).rejects.toThrow(NotFoundException);
          await expect(useCase.execute(request)).rejects.toThrow('Post not found');
          
          expect(mockPostRepository.findOne).toHaveBeenCalledWith(999);
          expect(mockPostRepository.save).not.toHaveBeenCalled();
        });
      });

      describe('password validation', () => {
        it('should throw ForbiddenException when password is incorrect', async () => {
          mockPasswordHandler.comparePasswords.mockResolvedValue(false);

          const request: UpdatePostUseCaseRequest = {
            id: 1,
            password: 'wrong-password',
            title: '수정제목',
          };

          await expect(useCase.execute(request)).rejects.toThrow(ForbiddenException);
          await expect(useCase.execute(request)).rejects.toThrow('Invalid password');
          
          expect(mockPostRepository.findOne).toHaveBeenCalledWith(1);
          expect(mockPasswordHandler.comparePasswords).toHaveBeenCalledWith('wrong-password', 'hashed-password');
          expect(mockPostRepository.save).not.toHaveBeenCalled();
        });
      });
    });

    describe('repository failures', () => {
      it('should propagate repository errors (findOne)', async () => {
        const repositoryError = new Error('Database connection failed');
        mockPostRepository.findOne.mockRejectedValue(repositoryError);

        const request: UpdatePostUseCaseRequest = {
          id: 1,
          password: 'Password123',
          title: '수정제목',
        };

        await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
      });

      it('should propagate repository errors (save)', async () => {
        const repositoryError = new Error('Save operation failed');
        mockPostRepository.save.mockRejectedValue(repositoryError);

        const request: UpdatePostUseCaseRequest = {
          id: 1,
          password: 'Password123',
          title: '수정제목',
        };

        await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
      });
    });

    describe('password comparison failures', () => {
      it('should propagate password comparison errors', async () => {
        const passwordError = new Error('Password comparison failed');
        mockPasswordHandler.comparePasswords.mockRejectedValue(passwordError);

        const request: UpdatePostUseCaseRequest = {
          id: 1,
          password: 'any-password',
          title: '수정제목',
        };

        await expect(useCase.execute(request)).rejects.toThrow(passwordError);
      });
    });
  });
});
