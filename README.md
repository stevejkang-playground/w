# w

## Local Development
### 1. 환경변수 설정
```bash
cp .env.example .env.local
vim .env.local

# .env.local
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=api
MYSQL_PASSWORD=apipass
MYSQL_DATABASE=api
```

### 2. Docker Compose
> [!NOTE]
> 자주 쓰이는 80/3306 포트를 사용하므로 수정이 필요한 경우 docker-compose.local.yaml 의 host 포트를 변경해주세요.
```bash
docker-compose -f docker-compose.local.yaml up
```

### 3. 데이터베이스 DDL 생성
> [!NOTE]
> docker-compose로 띄워진 mysql 데이터베이스에 CREATE TABLE IF NOT EXISTS 명령을 사용하여 테이블을 생성합니다.
- refer [scheme/DDL.sql](scheme/DDL.sql)

### 4. 접속
- http://localhost
- http://localhost/docs (Swagger UI)

## Project Abstract
- Nest.js 기반의 REST API입니다.
- 게시글(Post)과 댓글(PostComment) 도메인을 설계하고 관련된 application/presentation/infrastructure layer를 구현했습니다.
- 전체적인 구조로는 Layered Architecture를 사용했으며, 모든 행위를 Use Case로 작성, Domain Object와 Domain Entity를 분리하여 구현했습니다.
- 키워드 알림은 Domain Event를 Event Emitter를 이용하여 발행하는 예제로 간단히 구현했습니다.
- 데이터베이스 스키마에는 FK 관계를 사용하지 않았습니다.
- 수정가능한 게시글의 Audit 목적으로 Snapshot 테이블을 구현했습니다.
- "댓글의 댓글까지 작성이 가능" => 2depth까지 구현가능한 것으로 이해하여 CONSTRAINT와 도메인 불변식으로 적용했습니다.
- 게시물과 댓글의 페이징은 cusor-based 페이징을 사용하였으며, 댓글의 경우 1depth 단위 커서로 구현했습니다.
- **그 외 정의된 요구사항을 모두 구현했습니다.**

### APIs
> 모든 API 명세는 Swagger UI로 게시되어 있습니다.
#### GET /posts
- 게시글 목록 API
- 게시글 검색을 Query Parameter로 포함합니다.
- 게시글 페이징을 Query Parameter로 포함합니다.(DESC)

#### GET /posts/:id
- 게시글 상세 API
- 요구사항에는 존재하지 않지만, 리스트와 별개로 필요할 것으로 예상되어 구현했습니다.

#### POST /posts
- 게시글 작성 API

#### PATCH /posts/:id
- 게시글 수정 API

#### DELETE /posts/:id
- 게시글 삭제 API

#### GET /posts/:id/comments
- 댓글 목록 API
- 댓글 페이징을 Query Parameter로 포함합니다.(ASC)

#### POST /posts/:id/comments
- 댓글 작성 API

## Disclaimer
- src/shared 디렉토리에 있는 대부분의 코드와 루트의 configuration들은 개인적으로 작업에 사용하고 있는 코드를 가져와 사용했습니다. [stevejkang/nestjs-starter](https://github.com/stevejkang/nestjs-starter)
