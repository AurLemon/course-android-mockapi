import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as COS from 'cos-nodejs-sdk-v5';

@Injectable()
export class CosService {
  private cos: any;
  private bucket: string;
  private region: string;
  private domain: string;

  constructor(private configService: ConfigService) {
    this.cos = new COS({
      SecretId: this.configService.get<string>('TENCENT_COS_SECRET_ID'),
      SecretKey: this.configService.get<string>('TENCENT_COS_SECRET_KEY'),
    });

    this.bucket = this.configService.get<string>('TENCENT_COS_BUCKET') || '';
    this.region = this.configService.get<string>('TENCENT_COS_REGION') || '';
    this.domain =
      this.configService.get<string>('TENCENT_COS_DOMAIN') ||
      `https://${this.bucket}.cos.${this.region}.myqcloud.com`;
  }

  // 获取对象URL
  getObjectUrl(objectKey: string): string {
    const normalizedKey = objectKey.startsWith('/')
      ? objectKey.substring(1)
      : objectKey;
    return `${this.domain}/${normalizedKey}`;
  }

  // 检查文件是否存在
  async fileExists(key: string): Promise<boolean> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.cos.headObject(
          {
            Bucket: this.bucket,
            Region: this.region,
            Key: key,
          },
          (err: any, data: any) => {
            if (err) return reject(err);
            resolve();
          },
        );
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // 获取文件列表
  async listFiles(prefix: string = ''): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.cos.getBucket(
        {
          Bucket: this.bucket,
          Region: this.region,
          Prefix: prefix,
          MaxKeys: 1000,
        },
        (err: any, data: any) => {
          if (err) return reject(err);

          const files = data.Contents.map((item: any) => ({
            key: item.Key,
            size: item.Size,
            lastModified: item.LastModified,
            url: this.getObjectUrl(item.Key),
            etag: item.ETag,
          }));

          resolve(files);
        },
      );
    });
  }

  // 上传文件
  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
    size: number,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: file,
          ContentLength: size,
          ContentType: contentType,
        },
        (err: any, data: any) => {
          if (err) return reject(err);
          resolve({
            key,
            url: this.getObjectUrl(key),
            etag: data.ETag,
          });
        },
      );
    });
  }

  // 删除文件
  async deleteFile(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
        },
        (err: any, data: any) => {
          if (err) return reject(err);
          resolve();
        },
      );
    });
  }

  // 复制/重命名文件
  async copyFile(sourceKey: string, destKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cos.copyObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: destKey,
          CopySource: `${this.bucket}.cos.${this.region}.myqcloud.com/${sourceKey}`,
        },
        (err: any, data: any) => {
          if (err) return reject(err);
          resolve({
            key: destKey,
            url: this.getObjectUrl(destKey),
            etag: data.ETag,
          });
        },
      );
    });
  }
}
