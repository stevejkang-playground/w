CREATE TABLE IF NOT EXISTS `post`
(
    `p_index`      INT(11)      NOT NULL AUTO_INCREMENT COMMENT '관리번호',
    `p_title`      VARCHAR(255) NOT NULL COMMENT '제목',
    `p_content`    TEXT         NOT NULL COMMENT '내용',
    `p_author`     VARCHAR(100) NOT NULL COMMENT '작성자',
    `p_created_by` VARCHAR(100) NOT NULL COMMENT '등록자',
    `p_created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    `p_updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    `p_is_deleted` TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '삭제여부',
    `p_deleted_at` DATETIME              DEFAULT NULL COMMENT '삭제일',
    `p_password`   VARCHAR(255) NOT NULL COMMENT '비밀번호',
    PRIMARY KEY (`p_index`),
    FULLTEXT `I_p_title` (`p_title`),
    KEY `I_p_created_by` (`p_created_by`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT 'Post';

CREATE TABLE IF NOT EXISTS `post_snapshot`
(
    `ps_index`      INT(11)      NOT NULL AUTO_INCREMENT COMMENT '관리번호',
    `ps_p_index`    INT(11)      NOT NULL COMMENT 'Post 관리번호',
    `ps_p_title`    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '제목',
    `ps_p_content`  TEXT         NOT NULL COMMENT '내용',
    `ps_created_by` VARCHAR(100) NOT NULL COMMENT '등록자',
    `ps_created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    PRIMARY KEY (`ps_index`),
    KEY `I_ps_p_index` (`ps_p_index`),
    KEY `I_ps_created_by` (`ps_created_by`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT 'Post Snapshot for audit';

CREATE TABLE IF NOT EXISTS `post_comment`
(
    `pc_index`           INT(11)      NOT NULL AUTO_INCREMENT COMMENT '관리번호',
    `pc_p_index`         INT(11)      NOT NULL COMMENT 'Post 관리번호',
    `pc_parent_pc_index` INT(11)               DEFAULT NULL COMMENT 'Parent Comment 관리번호',
    `pc_content`         TEXT         NOT NULL COMMENT '내용',
    `pc_depth`           TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '댓글 깊이',
    `pc_author`          VARCHAR(100) NOT NULL COMMENT '등록자',
    `pc_created_by`      VARCHAR(100) NOT NULL COMMENT '작성자',
    `pc_created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    `pc_updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    PRIMARY KEY (`pc_index`),
    KEY `I_pc_p_index` (`pc_p_index`),
    KEY `I_pc_parent_pc_index` (`pc_parent_pc_index`),
    CONSTRAINT `CHK_pc_depth` CHECK (`pc_depth` BETWEEN 0 AND 1),
    CONSTRAINT `CHK_pc_parent_relation` CHECK (
        (`pc_parent_pc_index` IS NULL AND `pc_depth` = 0) OR
        (`pc_parent_pc_index` IS NOT NULL AND `pc_depth` <> 0)
    )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT 'Post Comment';

CREATE TABLE IF NOT EXISTS `post_keyword_subscription`
(
    `pks_index`      INT(11)      NOT NULL AUTO_INCREMENT COMMENT '관리번호',
    `pks_keyword`    VARCHAR(255) NOT NULL COMMENT '키워드',
    `pks_created_by` VARCHAR(100) NOT NULL COMMENT '등록자',
    `pks_created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    `pks_updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    `pks_is_deleted` TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '삭제여부',
    `pks_deleted_at` DATETIME              DEFAULT NULL COMMENT '삭제일',
    PRIMARY KEY (`pks_index`),
    KEY `I_pks_created_by` (`pks_created_by`),
    KEY `CI_pks_created_by_keyword` (`pks_created_by`, `pks_keyword`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT 'Post Keyword Subscription';
