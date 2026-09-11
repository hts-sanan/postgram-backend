import { Module } from "@nestjs/common";
import { PostsController } from "./controllers/posts.controller.js";

@Module({
  controllers: [PostsController],
})
export class PostsModule {}
