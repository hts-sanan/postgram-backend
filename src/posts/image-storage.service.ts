import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';

@Injectable()
export class ImageStorageService {
  private readonly uploadDirectory = join(
    process.cwd(),
    'uploads',
    'posts',
  );

  private readonly publicDirectory = '/uploads/posts';

  async save(file: Express.Multer.File): Promise<string> {
    await mkdir(this.uploadDirectory, { recursive: true });

    const extension = extname(file.originalname).toLowerCase();
    const filename = `${randomUUID()}${extension}`;
    const filepath = join(this.uploadDirectory, filename);

    await writeFile(filepath, file.buffer);

    return `${this.publicDirectory}/${filename}`;
  }

  async delete(imageUrl?: string | null): Promise<void> {
    if (!imageUrl || !imageUrl.startsWith(`${this.publicDirectory}/`)) {
      return;
    }

    const filename = imageUrl.substring(
      `${this.publicDirectory}/`.length,
    );

    const filepath = join(this.uploadDirectory, filename);

    try {
      await unlink(filepath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}