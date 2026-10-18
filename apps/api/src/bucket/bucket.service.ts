import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Readable } from 'stream';

interface IUploadWithoutMulter {
  name: string;
  buffer: Buffer;
  contentDisposition?: string;
  mimetype: string;
  fieldname: string;
  size: number;
  isPublic?: boolean;
}

@Injectable()
export class BucketService {
  private s3Client: S3Client;
  private bucketName: string;
  private bucketRegion: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.getOrThrow<string>('AWS_REGION');
    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_KEY'),
      },
    });
    this.bucketName = this.config.getOrThrow<string>('AWS_BUCKET_NAME');
    this.bucketRegion = region;
  }

  private isDevEnvironment(): boolean {
    return this.config.get<string>('DEV_ENVIRONMENT') === 'true';
  }

  /** Key under public/development prefix for streamed large uploads */
  streamUploadKey(fragment: string): string {
    const slug = fragment.replace(/\s+/g, '_');
    const prefix = this.isDevEnvironment()
      ? 'development'
      : 'public';
    return `${prefix}/stream_${Date.now()}_${slug}`;
  }

  async upload(
    file: Express.Multer.File,
    contentDisposition: string = 'inline',
    isPublic: boolean = true,
  ) {
    const key = this.isDevEnvironment()
      ? `development/${Date.now()}_${file.originalname}`
      : `${isPublic ? 'public' : 'protected'}/${Date.now()}_${file.originalname}`;

    const body = file.buffer;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentDisposition: contentDisposition,
        ContentType: file.mimetype,
      }),
    );

    return {
      url: `https://s3.${this.bucketRegion}.amazonaws.com/${this.bucketName}/${key}`,
      fieldname: file.fieldname,
      key: key,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Multipart/streaming PUT to S3 for large payloads. Prefer over buffering whole files.
   */
  async uploadReadableStream(options: {
    key: string;
    body: Readable;
    contentType: string;
    contentDisposition?: string;
    isPublic?: boolean;
  }): Promise<{
    url: string;
    key: string;
    mimetype: string;
    fieldname: string;
  }> {
    const parallelUpload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        ContentDisposition: options.contentDisposition ?? 'inline',
      },
      queueSize: 4,
      partSize: 8 * 1024 * 1024,
      leavePartsOnError: false,
    });

    await parallelUpload.done();

    return {
      url: `https://s3.${this.bucketRegion}.amazonaws.com/${this.bucketName}/${options.key}`,
      fieldname: options.key.split('/').pop() ?? options.key,
      key: options.key,
      mimetype: options.contentType,
    };
  }

  async uploadWithoutMulter({
    buffer,
    name,
    mimetype,
    fieldname,
    size = 0,
    contentDisposition = 'inline',
    isPublic = true,
  }: IUploadWithoutMulter) {
    const key = this.isDevEnvironment()
      ? `development/${Date.now()}_${name}`
      : `${isPublic ? 'public' : 'protected'}/${Date.now()}_${name}`;
    const body = buffer;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentDisposition: contentDisposition,
        ContentType: mimetype,
      }),
    );

    return {
      url: `https://s3.${this.bucketRegion}.amazonaws.com/${this.bucketName}/${key}`,
      fieldname: fieldname,
      key: key,
      size: size,
      mimetype: mimetype,
    };
  }

  async remove(key: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
    );
    return { success: true, message: `${key} deleted successfully.` };
  }

  async uploadMany(
    files: Express.Multer.File[],
    contentDisposition = 'inline',
  ) {
    const uploadPromises = [];

    files.forEach((file) => {
      uploadPromises.push(
        new Promise((resolve, reject) => {
          try {
            const res = this.upload(file, contentDisposition);
            resolve(res);
          } catch (error) {
            reject(error);
          }
        }),
      );
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  }

  async removeMany(keys: string[] = []) {
    const removePromises = [];

    keys.forEach((key: string) => {
      removePromises.push(
        new Promise((resolve, reject) => {
          try {
            const res = this.remove(key);
            resolve(res);
          } catch (error) {
            reject(error);
          }
        }),
      );
    });

    await Promise.all(removePromises);
  }

  async download(key: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async headObject(key: string): Promise<HeadObjectCommandOutput> {
    return this.s3Client.send(
      new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  /**
   * Range must be S3-format, e.g. `bytes=0-1048575`. Omit for full object stream.
   */
  async getObjectStream(
    key: string,
    range?: string,
  ): Promise<GetObjectCommandOutput> {
    return this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ...(range ? { Range: range } : {}),
      }),
    );
  }
}
