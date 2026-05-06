# テンプレート: Go API + React (GraphQL) フルスタック構成

このプロジェクト構成を新規プロジェクトで流用するためのリファレンス。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 19 + TypeScript 6 + Vite 8 |
| API通信 | Apollo Client 3 (GraphQL) |
| バックエンド | Go 1.22 + Echo v4 |
| API形式 | GraphQL (gqlgen v0.17) |
| 認証 | JWT Bearer Token (golang-jwt/jwt v5) |
| DB | MySQL 8.0 |
| ORM | GORM v2 |
| ファイルストレージ | Supabase Storage |
| コンテナ | Docker + Docker Compose |
| テスト | testing + testify |

---

## ディレクトリ構成

### フロントエンド (`src/`)

```
src/
├── main.tsx                    # エントリポイント (ApolloProvider + Contexts)
├── App.tsx                     # ルートコンポーネント
├── App.css / index.css
├── env.d.ts                    # Vite環境変数の型定義
├── assets/
├── components/
│   ├── pages/                  # ページ単位のコンポーネント
│   │   ├── auth/
│   │   ├── community/
│   │   ├── messages/
│   │   ├── mypage/
│   │   └── search/
│   └── ui/                     # 再利用可能なUIコンポーネント
├── contexts/                   # React Context (AuthContext など)
├── data/                       # モックデータ
├── hooks/                      # カスタムフック (useXxx)
├── lib/
│   ├── apolloClient.ts         # Apollo Client設定 (authLink付き)
│   ├── errorEmitter.ts         # グローバルエラーハンドラ
│   ├── firebase.ts             # Firebase設定
│   └── graphql/
│       └── operations.ts       # 全 Query / Mutation の gql 定義
├── types/                      # TypeScript型定義
└── utils/                      # ユーティリティ関数
```

### バックエンド (`backend/`)

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # エントリポイント・DI・Echo起動
├── graph/                       # GraphQL層 (gqlgen)
│   ├── schema.graphqls          # スキーマ定義
│   ├── generated/
│   │   └── generated.go         # gqlgen自動生成 (コミット対象)
│   ├── model/
│   │   └── models_gen.go        # gqlgen自動生成モデル
│   ├── resolver.go              # Resolverルート定義 (依存注入)
│   └── resolvers/              # リゾルバ実装
│       ├── query.resolvers.go
│       └── mutation/
│           ├── users/
│           ├── communities/
│           ├── matching/
│           └── messaging/
├── usecase/                     # Application層 (1機能1構造体, Executeメソッド)
│   ├── user/
│   ├── community/
│   ├── matching/
│   └── messaging/
├── domain/                      # Domain層 (純粋Go, フレームワーク依存なし)
│   ├── model/
│   └── service/
├── infrastructure/              # Infrastructure層
│   ├── persistence/             # リポジトリ実装 (GORM)
│   └── storage/                 # Supabase Storageクライアント
├── middleware/
│   └── auth.go                  # JWT認証ミドルウェア (Echo)
├── pkg/
│   └── jwtutil/
│       └── jwt.go               # JWT encode/decode
├── gqlgen.yml                   # gqlgen設定
├── go.mod
├── go.sum
└── Dockerfile
```

---

## 設定ファイルテンプレート

### `package.json`

```json
{
  "name": "APP_NAME",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:mock": "vite --mode mock",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@apollo/client": "^3.12.0",
    "graphql": "^16.10.0",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "remixicon": "^4.9.1",
    "firebase": "^12.12.1"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.58.2",
    "vite": "^8.0.10"
  }
}
```

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true
  },
  "include": ["src"]
}
```

### `src/env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_ENDPOINT: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import 'remixicon/fonts/remixicon.css'
import './index.css'
import App from './App.tsx'
import { apolloClient } from './lib/apolloClient.ts'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { CommunityProvider } from './contexts/CommunityContext.tsx'
import { MessageProvider } from './contexts/MessageContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <CommunityProvider>
          <MessageProvider>
            <App />
          </MessageProvider>
        </CommunityProvider>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
```

### `src/lib/apolloClient.ts`

```typescript
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { errorEmitter } from './errorEmitter'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => errorEmitter.emit(message))
  }
  if (networkError) {
    errorEmitter.emit('ネットワークエラーが発生しました')
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
```

---

### `backend/go.mod`

```
module github.com/APP_NAME/backend

go 1.22

require (
    github.com/99designs/gqlgen v0.17.49
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/joho/godotenv v1.5.1
    github.com/labstack/echo/v4 v4.12.0
    github.com/stretchr/testify v1.9.0
    github.com/vektah/gqlparser/v2 v2.5.16
    gorm.io/driver/mysql v1.5.7
    gorm.io/gorm v1.25.10
)
```

### `backend/gqlgen.yml`

```yaml
schema:
  - graph/schema.graphqls

exec:
  filename: graph/generated/generated.go
  package: generated

model:
  filename: graph/model/models_gen.go
  package: model

resolver:
  layout: follow-schema
  dir: graph/resolvers
  package: resolvers
  filename_template: "{name}.resolvers.go"

autobind:
  - "github.com/APP_NAME/backend/domain/model"
```

### `backend/cmd/server/main.go`

```go
package main

import (
    "log"
    "net/http"
    "os"

    "github.com/99designs/gqlgen/graphql/handler"
    "github.com/99designs/gqlgen/graphql/playground"
    "github.com/joho/godotenv"
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"

    "github.com/APP_NAME/backend/graph"
    "github.com/APP_NAME/backend/graph/generated"
    appMiddleware "github.com/APP_NAME/backend/middleware"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("no .env file")
    }

    dsn := os.Getenv("DATABASE_DSN")
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("failed to connect database: %v", err)
    }

    resolver := graph.NewResolver(db)
    srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))

    e := echo.New()
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{os.Getenv("FRONTEND_ORIGIN")},
        AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
    }))

    e.GET("/playground", echo.WrapHandler(playground.Handler("GraphQL", "/graphql")))
    e.POST("/graphql", echo.WrapHandler(appMiddleware.Auth(srv)))

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    e.Logger.Fatal(e.Start(":" + port))
}
```

### `backend/middleware/auth.go`

```go
package middleware

import (
    "context"
    "net/http"
    "strings"

    "github.com/APP_NAME/backend/pkg/jwtutil"
)

type contextKey string

const UserIDKey contextKey = "userID"

func Auth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        header := r.Header.Get("Authorization")
        if strings.HasPrefix(header, "Bearer ") {
            token := strings.TrimPrefix(header, "Bearer ")
            if userID, err := jwtutil.Decode(token); err == nil {
                ctx := context.WithValue(r.Context(), UserIDKey, userID)
                r = r.WithContext(ctx)
            }
        }
        next.ServeHTTP(w, r)
    })
}
```

### `backend/pkg/jwtutil/jwt.go`

```go
package jwtutil

import (
    "errors"
    "os"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID uint `json:"user_id"`
    jwt.RegisteredClaims
}

func Encode(userID uint) (string, error) {
    claims := Claims{
        UserID: userID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
        },
    }
    return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func Decode(tokenStr string) (uint, error) {
    token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, errors.New("unexpected signing method")
        }
        return []byte(os.Getenv("JWT_SECRET")), nil
    })
    if err != nil || !token.Valid {
        return 0, errors.New("invalid token")
    }
    claims, ok := token.Claims.(*Claims)
    if !ok {
        return 0, errors.New("invalid claims")
    }
    return claims.UserID, nil
}
```

### `backend/Dockerfile`

```dockerfile
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o server ./cmd/server

FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
```

### `backend/docker-compose.yml`

```yaml
services:
  db:
    image: mysql:8.0
    platform: linux/amd64
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      DATABASE_DSN: "${MYSQL_USER}:${MYSQL_PASSWORD}@tcp(db:3306)/${MYSQL_DATABASE}?charset=utf8mb4&parseTime=True&loc=Local"
    depends_on:
      db:
        condition: service_healthy

volumes:
  mysql_data:
```

### `backend/docker/mysql/init/01_test_db_grant.sql`

```sql
CREATE DATABASE IF NOT EXISTS `APP_NAME_test`;
GRANT ALL PRIVILEGES ON `APP_NAME_test`.* TO 'APP_NAME_user'@'%';
FLUSH PRIVILEGES;
```

### `backend/.env.example`

```
# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=APP_NAME_development
MYSQL_USER=APP_NAME_user
MYSQL_PASSWORD=APP_NAME_password

# Go API
DATABASE_DSN=APP_NAME_user:APP_NAME_password@tcp(db:3306)/APP_NAME_development?charset=utf8mb4&parseTime=True&loc=Local
DATABASE_DSN_TEST=APP_NAME_user:APP_NAME_password@tcp(db:3306)/APP_NAME_test?charset=utf8mb4&parseTime=True&loc=Local

# CORS
FRONTEND_ORIGIN=http://localhost:5173

# JWT (openssl rand -hex 32 で生成)
JWT_SECRET=replace_with_random_secret

# Supabase Storage
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

PORT=8080
```

### `.env` (フロントエンド)

```
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxx
```

---

### `backend/Makefile`

```makefile
MYSQL_ROOT_PASSWORD := $(shell grep "^MYSQL_ROOT_PASSWORD=" .env | cut -d= -f2)

.PHONY: init build up up-d down restart logs gen \
        migrate test lint secret

init:
	docker-compose build
	docker-compose up -d db
	docker-compose run --rm api ./server migrate
	docker-compose down

build:
	docker-compose build

up:
	docker-compose up

up-d:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart api

logs:
	docker-compose logs -f api

# gqlgenでGraphQLコードを自動生成
gen:
	go run github.com/99designs/gqlgen generate

# テストDB初期化 (初回 or ボリューム再作成後に実行)
test-db-setup:
	docker-compose exec -T db mysql -uroot -p$(MYSQL_ROOT_PASSWORD) -e "CREATE DATABASE IF NOT EXISTS \`APP_NAME_test\`; GRANT ALL PRIVILEGES ON \`APP_NAME_test\`.* TO 'APP_NAME_user'@'%'; FLUSH PRIVILEGES;"

test:
	go test ./...

lint:
	go vet ./...

# JWT_SECRET生成
secret:
	@openssl rand -hex 32
```

---

## アーキテクチャパターン

### オニオンアーキテクチャ (バックエンド)

```
Interface層      : graph/ (Resolvers, generated)
Application層    : usecase/ (1機能1構造体, Executeメソッド)
Domain層         : domain/ (純粋Go, フレームワーク依存なし)
Infrastructure層 : infrastructure/persistence/ + infrastructure/storage/
```

**レイヤー間の依存ルール**
- 外側 → 内側のみ依存可
- UseCase は必ずリポジトリインターフェース経由でDBアクセス (GORM直接クエリ禁止)
- Domain層はGORMやEchoをimportしない

### JWT認証フロー

```
クライアント                     Echo (middleware/auth.go)
    |                                   |
    |-- signUp / signIn -------------->|
    |<-- { token, user } --------------|  tokenをlocalStorageに保存
    |                                   |
    |-- Authorization: Bearer <token> ->|  以降のリクエスト
    |                                   |-- jwtutil.Decode → ctx に userID を注入
```

**実装ポイント**
- `pkg/jwtutil/jwt.go` でencode/decode
- `middleware/auth.go` でトークン検証し Context に userID を格納
- Resolver内で `ctx.Value(middleware.UserIDKey)` で取得して認証ガード
- 有効期限: 30日

### GraphQLエラー設計

| ケース | 方法 |
|---|---|
| バリデーションエラー | `errors: [String]` フィールドで返す |
| 予期しないサーバーエラー | `fmt.Errorf` を返してtop-level errorsへ |

---

## 新規プロジェクトへの適用手順

1. `APP_NAME` を新しいアプリ名に一括置換
2. フロントエンドをコピーして `npm install`
3. バックエンドをコピーして `.env` を `.env.example` から作成
4. `make secret` でJWT_SECRETを生成して `.env` に設定
5. `make up` で起動
6. `make test-db-setup` でテストDB初期化
7. `make test` で動作確認
