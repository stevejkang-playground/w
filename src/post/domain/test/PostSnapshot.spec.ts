import { PostSnapshot } from '../PostSnapshot';

describe('PostSnapshot', () => {
  const validPostSnapshotProps = {
    postId: 1,
    title: '제목입니다',
    content: '내용입니다',
    createdBy: '작성자입니다',
    createdAt: new Date('2025-01-01T10:00:00Z'),
  };

  describe('createNew', () => {
    it('should create a new post snapshot with valid properties', () => {
      const result = PostSnapshot.createNew(validPostSnapshotProps);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(PostSnapshot);
      expect(result.value!.postId).toBe(validPostSnapshotProps.postId);
      expect(result.value!.title).toBe(validPostSnapshotProps.title);
      expect(result.value!.content).toBe(validPostSnapshotProps.content);
      expect(result.value!.createdBy).toBe(validPostSnapshotProps.createdBy);
      expect(result.value!.createdAt).toBe(validPostSnapshotProps.createdAt);
    });

    it('should create multiple snapshots with different properties', () => {
      const props1 = {
        postId: 1,
        title: '제목1',
        content: '내용1',
        createdBy: '작성자1',
        createdAt: new Date('2025-01-01T10:00:00Z'),
      };

      const props2 = {
        postId: 2,
        title: '제목2',
        content: '내용2',
        createdBy: '작성자1',
        createdAt: new Date('2025-01-02T10:00:00Z'),
      };

      const result1 = PostSnapshot.createNew(props1);
      const result2 = PostSnapshot.createNew(props2);

      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      expect(result1.value!.postId).toBe(1);
      expect(result2.value!.postId).toBe(2);
      expect(result1.value!.title).toBe('제목1');
      expect(result2.value!.title).toBe('제목2');
    });
  });

  describe('getters', () => {
    let postSnapshot: PostSnapshot;

    beforeEach(() => {
      const result = PostSnapshot.createNew(validPostSnapshotProps);
      postSnapshot = result.value!;
    });

    it('should return correct value', () => {
      expect(postSnapshot.postId).toBe(validPostSnapshotProps.postId);
      expect(postSnapshot.title).toBe(validPostSnapshotProps.title);
      expect(postSnapshot.content).toBe(validPostSnapshotProps.content);
      expect(postSnapshot.createdBy).toBe(validPostSnapshotProps.createdBy);
      expect(postSnapshot.createdAt).toBe(validPostSnapshotProps.createdAt);
    });
  });

  describe('value object behavior', () => {
    it('should be equal when all properties are the same', () => {
      const snapshot1 = PostSnapshot.createNew(validPostSnapshotProps).value!;
      const snapshot2 = PostSnapshot.createNew(validPostSnapshotProps).value!;

      expect(snapshot1.equals(snapshot2)).toBe(true);
    });

    it('should not be equal when properties differ', () => {
      const props1 = { ...validPostSnapshotProps };
      const props2 = { ...validPostSnapshotProps, title: '변경' };

      const snapshot1 = PostSnapshot.createNew(props1).value!;
      const snapshot2 = PostSnapshot.createNew(props2).value!;

      expect(snapshot1.equals(snapshot2)).toBe(false);
    });
  });
});
