import { PostComment, POST_COMMENT_DEPTH_DEFAULT, POST_COMMENT_DEPTH_MAX } from '../PostComment';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';

describe('PostComment', () => {
  const validPostCommentProps = {
    postId: 1,
    parentCommentId: null,
    content: '내용입니다.',
    depth: POST_COMMENT_DEPTH_DEFAULT,
    author: '작성자입니다',
    createdBy: '작성자입니다',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    it('should create a comment with valid properties', () => {
      const result = PostComment.create(validPostCommentProps);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(PostComment);
      expect(result.value!.postId).toBe(validPostCommentProps.postId);
      expect(result.value!.content).toBe(validPostCommentProps.content);
      expect(result.value!.author).toBe(validPostCommentProps.author);
      expect(result.value!.depth).toBe(POST_COMMENT_DEPTH_DEFAULT);
      expect(result.value!.parentCommentId).toBeNull();
    });

    describe('depth validation', () => {
      it('should fail when depth exceeds maximum', () => {
        const propsWithInvalidDepth = { 
          ...validPostCommentProps, 
          depth: POST_COMMENT_DEPTH_MAX + 1 
        };
        const result = PostComment.create(propsWithInvalidDepth);

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('Depth cannot be greater than max depth');
      });

      it('should create successfully with maximum depth', () => {
        const propsWithMaxDepth = { 
          ...validPostCommentProps, 
          depth: POST_COMMENT_DEPTH_MAX,
          parentCommentId: 1
        };
        const result = PostComment.create(propsWithMaxDepth);

        expect(result.isSuccess).toBe(true);
        expect(result.value!.depth).toBe(POST_COMMENT_DEPTH_MAX);
      });
    });

    describe('parent comment validation', () => {
      it('should fail when parentCommentId is not null but depth is default', () => {
        const propsWithInvalidParent = { 
          ...validPostCommentProps, 
          parentCommentId: 1,
          depth: POST_COMMENT_DEPTH_DEFAULT
        };
        const result = PostComment.create(propsWithInvalidParent);

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('ParentCommentId should be null when depth is default');
      });

      it('should fail when parentCommentId is null but depth is not default', () => {
        const propsWithInvalidParent = { 
          ...validPostCommentProps, 
          parentCommentId: null,
          depth: 1
        };
        const result = PostComment.create(propsWithInvalidParent);

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('ParentCommentId cannot be null when depth is not default');
      });

      it('should create successfully with valid parent-depth relationship', () => {
        const validReplyProps = { 
          ...validPostCommentProps, 
          parentCommentId: 1,
          depth: 1
        };
        const result = PostComment.create(validReplyProps);

        expect(result.isSuccess).toBe(true);
        expect(result.value!.parentCommentId).toBe(1);
        expect(result.value!.depth).toBe(1);
      });
    });
  });

  describe('createNew', () => {
    describe('for parent comments (depth 0)', () => {
      const newParentCommentProps = {
        postId: 1,
        parentCommentId: null,
        content: '내용입니다',
        depth: POST_COMMENT_DEPTH_DEFAULT,
        author: '작성자입니다',
      };

      it('should create a new parent comment with default values', () => {
        const result = PostComment.createNew(newParentCommentProps);

        expect(result.isSuccess).toBe(true);
        expect(result.value!.postId).toBe(newParentCommentProps.postId);
        expect(result.value!.content).toBe(newParentCommentProps.content);
        expect(result.value!.author).toBe(newParentCommentProps.author);
        expect(result.value!.createdBy).toBe(newParentCommentProps.author);
        expect(result.value!.depth).toBe(POST_COMMENT_DEPTH_DEFAULT);
        expect(result.value!.parentCommentId).toBeNull();
        expect(result.value!.createdAt).toBeInstanceOf(Date);
        expect(result.value!.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('for child comments (depth 1)', () => {
      const newChildCommentProps = {
        postId: 1,
        parentCommentId: 5,
        content: '내용입니다',
        depth: 1,
        author: '작성자입니다',
      };

      it('should create a new child comment with default values', () => {
        const result = PostComment.createNew(newChildCommentProps);

        expect(result.isSuccess).toBe(true);
        expect(result.value!.postId).toBe(newChildCommentProps.postId);
        expect(result.value!.content).toBe(newChildCommentProps.content);
        expect(result.value!.author).toBe(newChildCommentProps.author);
        expect(result.value!.createdBy).toBe(newChildCommentProps.author);
        expect(result.value!.depth).toBe(1);
        expect(result.value!.parentCommentId).toBe(5);
        expect(result.value!.createdAt).toBeInstanceOf(Date);
        expect(result.value!.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should fail with invalid new comment properties', () => {
      const invalidProps = {
        postId: 1,
        parentCommentId: 1,
        content: '내용입니다',
        depth: POST_COMMENT_DEPTH_DEFAULT,
        author: '작성자입니다',
      };
      const result = PostComment.createNew(invalidProps);

      expect(result.isFailure).toBe(true);
    });
  });

  describe('getters', () => {
    let parentComment: PostComment;
    let childComment: PostComment;

    beforeEach(() => {
      const parentResult = PostComment.create(validPostCommentProps);
      parentComment = parentResult.value!;

      const childProps = {
        ...validPostCommentProps,
        parentCommentId: 1,
        depth: 1,
        content: '내용입니다',
      };
      const childResult = PostComment.create(childProps);
      childComment = childResult.value!;
    });

    it('should return correct value', () => {
      expect(parentComment.postId).toBe(validPostCommentProps.postId);
      expect(parentComment.parentCommentId).toBeNull();
      expect(childComment.parentCommentId).toBe(1);
      expect(parentComment.content).toBe(validPostCommentProps.content);
      expect(parentComment.depth).toBe(POST_COMMENT_DEPTH_DEFAULT);
      expect(childComment.depth).toBe(1);
      expect(parentComment.author).toBe(validPostCommentProps.author);
      expect(parentComment.createdBy).toBe(validPostCommentProps.createdBy);
      expect(parentComment.createdAt).toBe(validPostCommentProps.createdAt);
      expect(parentComment.updatedAt).toBe(validPostCommentProps.updatedAt);
    });
  });

  describe('canHaveChildComment', () => {
    let parentComment: PostComment;
    let childComment: PostComment;

    beforeEach(() => {
      const parentResult = PostComment.create({
        ...validPostCommentProps,
        depth: POST_COMMENT_DEPTH_DEFAULT,
      });
      parentComment = parentResult.value!;

      const childProps = {
        ...validPostCommentProps,
        parentCommentId: 1,
        depth: 1,
      };
      const childResult = PostComment.create(childProps);
      childComment = childResult.value!;
    });

    it('should return true for parent comments (depth 0)', () => {
      expect(parentComment.canHaveChildComment()).toBe(true);
    });

    it('should return false for child comments (depth 1)', () => {
      expect(childComment.canHaveChildComment()).toBe(false);
    });
  });

  describe('constants', () => {
    it('should have correct default depth', () => {
      expect(POST_COMMENT_DEPTH_DEFAULT).toBe(0);
    });

    it('should have correct maximum depth', () => {
      expect(POST_COMMENT_DEPTH_MAX).toBe(1);
    });
  });
});
