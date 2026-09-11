# Postgram Backend

NestJS backend for the Postgram application.

## Requirements

- Node.js
- npm
- PostgreSQL
- `jq` for token extraction in the test commands
- A test image for image-upload tests

## Setup

Clone the repository and install dependencies:

```bash git clone [https://github.com/hts-sanan/postgram-backend.git](https://github.com/hts-sanan/postgram-backend.git) cd postgram-backend npm install ```

Create `.env`:

```env DATABASE_URL="postgresql://postgres:postgres@localhost:**5432**/postgram_db?schema=postgram* JWT_SECRET=*your-secret-key" **PORT**=**3000** ```

Run the database migrations:

```bash npx prisma migrate dev ```

Generate Prisma Client:

```bash npx prisma generate ```

## Run the Backend

Development:

```bash npm run start:dev ```

Build:

```bash npm run build ```

The **API** runs at:

```text [http://localhost:**3000**](http://localhost:**3000**) ```

**API** base **URL**:

```text [http://localhost:**3000**/api/v1](http://localhost:**3000**/api/v1) ```

---

# API Testing

The following commands test the implemented APIs using `curl`.

## Test Variables

Run these once at the beginning of a test session:

```bash BASE_URL=*[http://localhost:**3000**/api/v1*](http://localhost:**3000**/api/v1*)

**USERNAME**=*postgram_test_$(date +%s)* **PASSWORD**=*Test@**12345***

ACCESS_TOKEN=** REFRESH_TOKEN=**

POST_ID=** IMAGE_POST_ID=** COMMENT_ID=** REPLY_ID=*" ```

The test account gets a unique username on every run.

---

# 1. Health

```bash curl -i *$BASE_URL/health* ```

Expected:

```text **HTTP**/1.1 **200** OK ```

---

# 2. Authentication

## Signup

```bash
curl -i -X **POST** *$BASE_URL/auth/signup* \
    -H *Content-Type: application/json* \
    -d *{
    \*username\*: \*$**USERNAME**\*,
    \*password\*: \*$**PASSWORD**\*
    }*
```

Expected:

```text **HTTP**/1.1 **201** Created ```

## Login

```bash
LOGIN_RESPONSE=$(curl -s -X **POST** *$BASE_URL/auth/login* \
    -H *Content-Type: application/json* \
    -d *{
    \*username\*: \*$**USERNAME**\*,
    \*password\*: \*$**PASSWORD**\*
    }*)
```

Extract the tokens:

```bash ACCESS_TOKEN=$(echo *$LOGIN_RESPONSE* | jq -r '.accessToken') REFRESH_TOKEN=$(echo *$LOGIN_RESPONSE* | jq -r '.refreshToken') ```

Verify:

```bash test -n *$ACCESS_TOKEN* && echo *Access token received* test -n *$REFRESH_TOKEN* && echo *Refresh token received* ```

## Invalid Login

```bash
curl -i -X **POST** *$BASE_URL/auth/login* \
    -H *Content-Type: application/json* \
    -d *{
    \*username\*: \*$**USERNAME**\*,
    \*password\*: \*WrongPassword123\*
    }*
```

Expected:

```text **HTTP**/1.1 **401** Unauthorized ```

## Missing Token

```bash curl -i *$BASE_URL/profiles/me* ```

Expected:

```text **HTTP**/1.1 **401** Unauthorized ```

## Invalid Token

```bash curl -i *$BASE_URL/profiles/me* \ -H *Authorization: Bearer invalid-token* ```

Expected:

```text **HTTP**/1.1 **401** Unauthorized ```

---

# 3. Profiles

## Get My Profile

```bash curl -i *$BASE_URL/profiles/me* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

## Update Profile

```bash
curl -i -X **PATCH** *$BASE_URL/profiles/me* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -H *Content-Type: application/json* \
    -d '{
    *firstName*: *Test*,
    *lastName*: *User*,
    *bio*: *Postgram **API** test*
    }'
```

## Update Profile Visibility

```bash
curl -i -X **PATCH** *$BASE_URL/profiles/me/visibility* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -H *Content-Type: application/json* \
    -d '{
    *visibility*: *PRIVATE*
    }'
```

Restore:

```bash
curl -i -X **PATCH** *$BASE_URL/profiles/me/visibility* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -H *Content-Type: application/json* \
    -d '{
    *visibility*: *PUBLIC*
    }'
```

## Get Another Profile

Replace `<USER_ID>`:

```bash curl -i *$BASE_URL/profiles/<USER_ID>* ```

---

# 4. Posts

## Create Text Post

```bash
TEXT_POST_RESPONSE=$(curl -s -X **POST** *$BASE_URL/posts* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -F *content=My first Postgram test post*)
```

Display:

```bash echo *$TEXT_POST_RESPONSE* ```

Save the ID:

```bash POST_ID=$(echo *$TEXT_POST_RESPONSE* | jq -r '.id') ```

Expected:

```json
{
    *postType*: *TEXT*,
    *imageUrl*: null
}
```

## Create Image Post

Place a test image at:

```text $**HOME**/Desktop/test.png ```

Then:

```bash
IMAGE_POST_RESPONSE=$(curl -s -X **POST** *$BASE_URL/posts* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -F *image=@$**HOME**/Desktop/test.png*)
```

Display:

```bash echo *$IMAGE_POST_RESPONSE* ```

Save the ID:

```bash IMAGE_POST_ID=$(echo *$IMAGE_POST_RESPONSE* | jq -r '.id') ```

Expected:

```json
{
    *postType*: *IMAGE*,
    *content*: null,
    *imageUrl*: */uploads/posts/...*
}
```

## Create Text + Image Post

```bash
curl -i -X **POST** *$BASE_URL/posts* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -F *content=Postgram image test* \
    -F *image=@$**HOME**/Desktop/test.png*
```

Expected:

```text postType: TEXT_IMAGE ```

## Empty Post

```bash curl -i -X **POST** *$BASE_URL/posts* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

Expected:

```text **HTTP**/1.1 **400** Bad Request ```

## Invalid Image

```bash echo *not an image* > /tmp/not-image.txt ```

```bash
curl -i -X **POST** *$BASE_URL/posts* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -F *image=@/tmp/not-image.txt*
```

Expected:

```text **HTTP**/1.1 **400** Bad Request ```

## Get Posts

```bash curl -i *$BASE_URL/posts* ```

## Pagination

```bash curl -i *$BASE_URL/posts?page=1&limit=10* ```

## Get Single Post

```bash curl -i *$BASE_URL/posts/$POST_ID* ```

## Update Post

```bash
curl -i -X **PATCH** *$BASE_URL/posts/$POST_ID* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -F *content=Updated Postgram test post*
```

## Add Image to Post

```bash
curl -i -X **PATCH** *$BASE_URL/posts/$POST_ID* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -F *content=Updated post with image* \
    -F *image=@$**HOME**/Desktop/test.png*
```

## Remove Image

```bash
curl -i -X **PATCH** *$BASE_URL/posts/$POST_ID* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -F *removeImage=true*
```

## Replace Image

```bash
curl -i -X **PATCH** *$BASE_URL/posts/$IMAGE_POST_ID* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -F *image=@$**HOME**/Desktop/test.png*
```

## Delete Post

```bash curl -i -X **DELETE** *$BASE_URL/posts/$POST_ID* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

Verify:

```bash curl -i *$BASE_URL/posts/$POST_ID* ```

Expected:

```text **HTTP**/1.1 **404** Not Found ```

---

# 5. Likes

## Like Post

```bash curl -i -X **POST** *$BASE_URL/posts/$POST_ID/likes* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

Expected:

```text **HTTP**/1.1 **201** Created ```

## Repeat Like

```bash curl -i -X **POST** *$BASE_URL/posts/$POST_ID/likes* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

The operation should remain idempotent.

## Get Likes

```bash curl -i *$BASE_URL/posts/$POST_ID/likes* ```

## Unlike

```bash curl -i -X **DELETE** *$BASE_URL/posts/$POST_ID/likes* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

## Repeat Unlike

```bash curl -i -X **DELETE** *$BASE_URL/posts/$POST_ID/likes* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

---

# 6. Comments

## Create Comment

```bash
COMMENT_RESPONSE=$(curl -s -X **POST** *$BASE_URL/posts/$POST_ID/comments* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -H *Content-Type: application/json* \
    -d '{
    *content*: *This is a test comment*
    }')
```

Save the ID:

```bash COMMENT_ID=$(echo *$COMMENT_RESPONSE* | jq -r '.id') ```

## Create Reply

```bash
REPLY_RESPONSE=$(curl -s -X **POST** *$BASE_URL/posts/$POST_ID/comments* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -H *Content-Type: application/json* \
    -d *{
    \*content\*: \*This is a reply\*,
    \*parentCommentId\*: \*$COMMENT_ID\*
    }*)
```

Save:

```bash REPLY_ID=$(echo *$REPLY_RESPONSE* | jq -r '.id') ```

## Get Comments

```bash curl -i *$BASE_URL/posts/$POST_ID/comments* ```

## Update Comment

```bash
curl -i -X **PATCH** *$BASE_URL/comments/$COMMENT_ID* \
    -H *Authorization: Bearer $ACCESS_TOKEN* \
    -H *Content-Type: application/json* \
    -d '{
    *content*: *Updated test comment*
    }'
```

## Delete Comment

```bash curl -i -X **DELETE** *$BASE_URL/comments/$COMMENT_ID* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

---

# 7. Token Refresh

Save the current refresh token:

```bash OLD_REFRESH_TOKEN=*$REFRESH_TOKEN* ```

Refresh:

```bash
REFRESH_RESPONSE=$(curl -s -X **POST** *$BASE_URL/auth/refresh* \
    -H *Content-Type: application/json* \
    -d *{
    \*refreshToken\*: \*$REFRESH_TOKEN\*
    }*)
```

Extract the new tokens:

```bash ACCESS_TOKEN=$(echo *$REFRESH_RESPONSE* | jq -r '.accessToken') REFRESH_TOKEN=$(echo *$REFRESH_RESPONSE* | jq -r '.refreshToken') ```

Verify the new access token:

```bash curl -i *$BASE_URL/profiles/me* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

## Test Old Refresh Token

```bash
curl -i -X **POST** *$BASE_URL/auth/refresh* \
    -H *Content-Type: application/json* \
    -d *{
    \*refreshToken\*: \*$OLD_REFRESH_TOKEN\*
    }*
```

Expected:

```text **HTTP**/1.1 **401** Unauthorized ```

---

# 8. Logout

```bash curl -i -X **POST** *$BASE_URL/auth/logout* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

Then verify the token is rejected:

```bash curl -i *$BASE_URL/profiles/me* \ -H *Authorization: Bearer $ACCESS_TOKEN* ```

Expected:

```text **HTTP**/1.1 **401** Unauthorized ```

---

# 9. User Deletion

Use a separate test account for this test.

```bash DELETE_USERNAME=*delete_test_$(date +%s)* DELETE_PASSWORD=*Test@**12345*** ```

Signup:

```bash
curl -i -X **POST** *$BASE_URL/auth/signup* \
    -H *Content-Type: application/json* \
    -d *{
    \*username\*: \*$DELETE_USERNAME\*,
    \*password\*: \*$DELETE_PASSWORD\*
    }*
```

Login:

```bash
DELETE_LOGIN=$(curl -s -X **POST** *$BASE_URL/auth/login* \
    -H *Content-Type: application/json* \
    -d *{
    \*username\*: \*$DELETE_USERNAME\*,
    \*password\*: \*$DELETE_PASSWORD\*
    }*)
```

Extract the token:

```bash DELETE_ACCESS_TOKEN=$(echo *$DELETE_LOGIN* | jq -r '.accessToken') ```

Delete the account:

```bash curl -i -X **DELETE** *$BASE_URL/users/me* \ -H *Authorization: Bearer $DELETE_ACCESS_TOKEN* ```

Verify access is revoked:

```bash curl -i *$BASE_URL/profiles/me* \ -H *Authorization: Bearer $DELETE_ACCESS_TOKEN* ```

Expected:

```text **HTTP**/1.1 **401** Unauthorized ```

---

# 10. Validation

Unexpected fields should be rejected.

```bash
curl -i -X **POST** *$BASE_URL/auth/signup* \
    -H *Content-Type: application/json* \
    -d '{
    *username*: *validation_test*,
    *password*: *Test@**12345***,
    *unexpectedField*: *invalid*
    }'
```

Expected:

```text **HTTP**/1.1 **400** Bad Request ```

Invalid input:

```bash
curl -i -X **POST** *$BASE_URL/auth/signup* \
    -H *Content-Type: application/json* \
    -d '{
    *username*: "*,
    *password*: *"
    }'
```

Expected:

```text **HTTP**/1.1 **400** Bad Request ```

---

# API Reference

## Authentication

```text **POST** /api/v1/auth/signup **POST** /api/v1/auth/login **POST** /api/v1/auth/refresh **POST** /api/v1/auth/logout ```

## Profiles

```text **GET**   /api/v1/profiles/me **GET**   /api/v1/profiles/:userId **PATCH** /api/v1/profiles/me **PATCH** /api/v1/profiles/me/visibility ```

## Posts

```text **POST**   /api/v1/posts **GET**    /api/v1/posts **GET**    /api/v1/posts/:postId **PATCH**  /api/v1/posts/:postId **DELETE** /api/v1/posts/:postId ```

## Likes

```text **POST**   /api/v1/posts/:postId/likes **DELETE** /api/v1/posts/:postId/likes **GET**    /api/v1/posts/:postId/likes ```

## Comments

```text **GET**    /api/v1/posts/:postId/comments **POST**   /api/v1/posts/:postId/comments **PATCH**  /api/v1/comments/:commentId **DELETE** /api/v1/comments/:commentId ```

## Users

```text **DELETE** /api/v1/users/me ```

## Health

```text **GET** /api/v1/health ```