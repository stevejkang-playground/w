import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { mock, MockProxy } from 'jest-mock-extended';
import { PasswordHandler } from '@shared/security/PasswordHandler';
import { Post } from '../../../../domain/Post';
import { POST_REPOSITORY, PostRepository } from '../../../../infrastructure/PostRepository';
import { CreatePostUseCase } from '../CreatePostUseCase';
import { CreatePostUseCaseRequest } from '../dto/CreatePostUseCaseRequest';

jest.mock('@shared/security/PasswordHandler');

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let mockPostRepository: MockProxy<PostRepository>;
  let mockPasswordHandler: jest.Mocked<typeof PasswordHandler>;
  let mockEventEmitter: MockProxy<EventEmitter2>;

  beforeAll(() => {
    mockPasswordHandler = PasswordHandler as jest.Mocked<typeof PasswordHandler>;
  });

  beforeEach(async () => {
    mockPostRepository = mock<PostRepository>();
    mockEventEmitter = mock<EventEmitter2>();

    const module = await Test.createTestingModule({
      providers: [
        CreatePostUseCase,
        {
          provide: POST_REPOSITORY,
          useValue: mockPostRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    useCase = module.get<CreatePostUseCase>(CreatePostUseCase);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: CreatePostUseCaseRequest = {
      title: '제목입니다',
      content: '내용입니다',
      author: '작성자입니다',
      password: 'Password123',
    };

    describe('successful creation', () => {
      beforeEach(() => {
        mockPasswordHandler.hashPassword.mockResolvedValue('hashed-password');
      });

      it('should create a post successfully', async () => {
        const savedPost = Post.createNew({
          title: validRequest.title,
          content: validRequest.content,
          author: validRequest.author,
          password: 'hashed-password',
        }).value!;
        
        mockPostRepository.save.mockResolvedValue(savedPost);

        const result = await useCase.execute(validRequest);

        expect(result.ok).toBe(true);
        expect(result.post).toBe(savedPost);
        expect(mockPasswordHandler.hashPassword).toHaveBeenCalledWith('Password123');
        expect(mockPostRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            props: expect.objectContaining({
              title: validRequest.title,
              content: validRequest.content,
              author: validRequest.author,
              password: 'hashed-password',
            }),
          })
        );
      });

      it('should hash the password before saving', async () => {
        const hashedPassword = 'hashed-password';
        mockPasswordHandler.hashPassword.mockResolvedValue(hashedPassword);

        const savedPost = Post.createNew({
          title: validRequest.title,
          content: validRequest.content,
          author: validRequest.author,
          password: hashedPassword,
        }).value!;
        
        mockPostRepository.save.mockResolvedValue(savedPost);

        await useCase.execute(validRequest);

        expect(mockPasswordHandler.hashPassword).toHaveBeenCalledWith(validRequest.password);
        expect(mockPostRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            props: expect.objectContaining({
              password: hashedPassword,
            }),
          })
        );
      });
    });

    describe('validation failures', () => {
      beforeEach(() => {
        mockPasswordHandler.hashPassword.mockResolvedValue('hashed-password');
      });

      it('should throw BadRequestException when title is empty', async () => {
        const invalidRequest = { ...validRequest, title: '' };

        await expect(useCase.execute(invalidRequest)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute(invalidRequest)).rejects.toThrow('Title cannot be empty');
        
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when title is only whitespace', async () => {
        const invalidRequest = { ...validRequest, title: '   ' };

        await expect(useCase.execute(invalidRequest)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute(invalidRequest)).rejects.toThrow('Title cannot be empty');
        
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when content is empty', async () => {
        const invalidRequest = { ...validRequest, content: '' };

        await expect(useCase.execute(invalidRequest)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute(invalidRequest)).rejects.toThrow('Content cannot be empty');
        
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when content is only whitespace', async () => {
        const invalidRequest = { ...validRequest, content: '   ' };

        await expect(useCase.execute(invalidRequest)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute(invalidRequest)).rejects.toThrow('Content cannot be empty');
        
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when author is empty', async () => {
        const invalidRequest = { ...validRequest, author: '' };

        await expect(useCase.execute(invalidRequest)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute(invalidRequest)).rejects.toThrow('CreatedBy cannot be empty');
        
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when author is only whitespace', async () => {
        const invalidRequest = { ...validRequest, author: '   ' };

        await expect(useCase.execute(invalidRequest)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute(invalidRequest)).rejects.toThrow('CreatedBy cannot be empty');
        
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('repository failures', () => {
      beforeEach(() => {
        mockPasswordHandler.hashPassword.mockResolvedValue('hashed-password');
      });

      it('should propagate repository errors', async () => {
        const repositoryError = new Error('Database connection failed');
        mockPostRepository.save.mockRejectedValue(repositoryError);

        await expect(useCase.execute(validRequest)).rejects.toThrow(repositoryError);
      });
    });

    describe('password hashing failures', () => {
      it('should propagate password hashing errors', async () => {
        const hashingError = new Error('Hashing failed');
        mockPasswordHandler.hashPassword.mockRejectedValue(hashingError);

        await expect(useCase.execute(validRequest)).rejects.toThrow(hashingError);
        expect(mockPostRepository.save).not.toHaveBeenCalled();
      });
    });
  });
});
