-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "postgram";

-- CreateTable
CREATE TABLE "postgram"."users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'USER',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postgram"."profiles" (
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "bio" TEXT,
    "show_date_of_birth" BOOLEAN NOT NULL DEFAULT true,
    "profile_picture_url" VARCHAR(1000),
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "postgram"."auth_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postgram"."refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postgram"."posts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "post_type" VARCHAR(30) NOT NULL,
    "content" TEXT,
    "image_url" VARCHAR(1000),
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    "post_status" VARCHAR(20) NOT NULL DEFAULT 'POSTED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postgram"."likes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postgram"."comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "parent_comment_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "postgram"."users"("username");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "postgram"."users"("status");

-- CreateIndex
CREATE INDEX "profiles_visibility_idx" ON "postgram"."profiles"("visibility");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_hash_key" ON "postgram"."auth_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "auth_tokens_user_id_idx" ON "postgram"."auth_tokens"("user_id");

-- CreateIndex
CREATE INDEX "auth_tokens_expires_at_idx" ON "postgram"."auth_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "auth_tokens_revoked_at_idx" ON "postgram"."auth_tokens"("revoked_at");

-- CreateIndex
CREATE INDEX "auth_tokens_user_id_expires_at_idx" ON "postgram"."auth_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "postgram"."refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "postgram"."refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "postgram"."refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_revoked_at_idx" ON "postgram"."refresh_tokens"("revoked_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_expires_at_idx" ON "postgram"."refresh_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "posts_user_id_idx" ON "postgram"."posts"("user_id");

-- CreateIndex
CREATE INDEX "posts_post_status_idx" ON "postgram"."posts"("post_status");

-- CreateIndex
CREATE INDEX "posts_created_at_idx" ON "postgram"."posts"("created_at");

-- CreateIndex
CREATE INDEX "posts_deleted_at_idx" ON "postgram"."posts"("deleted_at");

-- CreateIndex
CREATE INDEX "posts_user_id_created_at_idx" ON "postgram"."posts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "posts_user_id_post_status_created_at_idx" ON "postgram"."posts"("user_id", "post_status", "created_at");

-- CreateIndex
CREATE INDEX "posts_post_status_created_at_idx" ON "postgram"."posts"("post_status", "created_at");

-- CreateIndex
CREATE INDEX "likes_post_id_idx" ON "postgram"."likes"("post_id");

-- CreateIndex
CREATE INDEX "likes_user_id_idx" ON "postgram"."likes"("user_id");

-- CreateIndex
CREATE INDEX "likes_post_id_created_at_idx" ON "postgram"."likes"("post_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "likes_post_id_user_id_key" ON "postgram"."likes"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "comments_post_id_idx" ON "postgram"."comments"("post_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "postgram"."comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_parent_comment_id_idx" ON "postgram"."comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "postgram"."comments"("created_at");

-- CreateIndex
CREATE INDEX "comments_deleted_at_idx" ON "postgram"."comments"("deleted_at");

-- CreateIndex
CREATE INDEX "comments_post_id_created_at_idx" ON "postgram"."comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "comments_post_id_parent_comment_id_idx" ON "postgram"."comments"("post_id", "parent_comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "comments_id_post_id_key" ON "postgram"."comments"("id", "post_id");

-- AddForeignKey
ALTER TABLE "postgram"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "postgram"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postgram"."auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "postgram"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postgram"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "postgram"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postgram"."posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "postgram"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postgram"."likes" ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "postgram"."posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postgram"."likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "postgram"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postgram"."comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "postgram"."posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postgram"."comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "postgram"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postgram"."comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "postgram"."comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
