import { Post } from '../Post';
import { UniqueEntityID } from '@shared/core/domain/UniqueEntityID';

describe('Post', () => {
  const validPostProps = {
    title: '제목입니다',
    content: '내용입니다',
    author: '작성자입니다',
    password: 'Password123',
    createdBy: '작성자입니다',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    deletedAt: null,
  };

  describe('create', () => {
    it('should create a post with valid properties', () => {
      const result = Post.create(validPostProps);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(Post);
      expect(result.value!.title).toBe(validPostProps.title);
      expect(result.value!.content).toBe(validPostProps.content);
      expect(result.value!.author).toBe(validPostProps.author);
    });

    it('should fail when title is empty', () => {
      const propsWithEmptyTitle = { ...validPostProps, title: '' };
      const result = Post.create(propsWithEmptyTitle);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Title cannot be empty');
    });

    it('should fail when title is only whitespace', () => {
      const propsWithWhitespaceTitle = { ...validPostProps, title: '   ' };
      const result = Post.create(propsWithWhitespaceTitle);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Title cannot be empty');
    });

    it('should fail when content is empty', () => {
      const propsWithEmptyContent = { ...validPostProps, content: '' };
      const result = Post.create(propsWithEmptyContent);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Content cannot be empty');
    });

    it('should fail when content is only whitespace', () => {
      const propsWithWhitespaceContent = { ...validPostProps, content: '   ' };
      const result = Post.create(propsWithWhitespaceContent);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Content cannot be empty');
    });

    it('should fail when author is empty', () => {
      const propsWithEmptyAuthor = { ...validPostProps, author: '' };
      const result = Post.create(propsWithEmptyAuthor);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CreatedBy cannot be empty');
    });

    it('should fail when author is only whitespace', () => {
      const propsWithWhitespaceAuthor = { ...validPostProps, author: '   ' };
      const result = Post.create(propsWithWhitespaceAuthor);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CreatedBy cannot be empty');
    });
  });

  describe('createNew', () => {
    const newPostProps = {
      title: '제목입니다',
      content: '내용입니다',
      author: '작성자입니다',
      password: 'Password123',
    };

    it('should create a new post with default values', () => {
      const result = Post.createNew(newPostProps);

      expect(result.isSuccess).toBe(true);
      expect(result.value!.title).toBe(newPostProps.title);
      expect(result.value!.content).toBe(newPostProps.content);
      expect(result.value!.author).toBe(newPostProps.author);
      expect(result.value!.createdBy).toBe(newPostProps.author);
      expect(result.value!.isDeleted).toBe(false);
      expect(result.value!.deletedAt).toBeNull();
      expect(result.value!.createdAt).toBeInstanceOf(Date);
      expect(result.value!.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail with invalid new post properties', () => {
      const invalidProps = { ...newPostProps, title: '' };
      const result = Post.createNew(invalidProps);

      expect(result.isFailure).toBe(true);
    });
  });

  describe('createSnapshot', () => {
    let post: Post;

    beforeEach(() => {
      const result = Post.create(validPostProps, new UniqueEntityID(1));
      post = result.value!;
    });

    it('should create a snapshot with correct properties', () => {
      const createdBy = 'createdBy';
      const result = post.createSnapshot(createdBy);

      expect(result.isSuccess).toBe(true);
      expect(result.value!.postId).toBe(1);
      expect(result.value!.title).toBe(post.title);
      expect(result.value!.content).toBe(post.content);
      expect(result.value!.createdBy).toBe(createdBy);
      expect(result.value!.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('delete', () => {
    let post: Post;

    beforeEach(() => {
      const result = Post.create(validPostProps);
      post = result.value!;
    });

    it('should mark post as deleted', () => {
      const result = post.delete();

      expect(result.isSuccess).toBe(true);
      expect(result.value!.isDeleted).toBe(true);
      expect(result.value!.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    let post: Post;

    beforeEach(() => {
      const result = Post.create(validPostProps);
      post = result.value!;
    });

    it('should update post with new properties', () => {
      const updateProps = {
        title: '수정 제목',
        content: '수정 내용',
        updatedAt: new Date(),
      };
      const result = post.update(updateProps);

      expect(result.isSuccess).toBe(true);
      expect(result.value!.title).toBe(updateProps.title);
      expect(result.value!.content).toBe(updateProps.content);
      expect(result.value!.updatedAt).toBe(updateProps.updatedAt);
      expect(result.value!.author).toBe(validPostProps.author);
    });

    it('should fail with invalid update properties', () => {
      const result = post.update({ title: '' });

      expect(result.isFailure).toBe(true);
    });
  });
});
