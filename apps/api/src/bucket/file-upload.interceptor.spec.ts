import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { BucketService } from './bucket.service';
import { FileUploadInterceptor } from './file-upload.interceptor';
import { MAX_UPLOAD_BYTES } from '../file/upload-limits';

describe('FileUploadInterceptor', () => {
  it('should be defined', () => {
    expect(new FileUploadInterceptor({} as BucketService)).toBeDefined();
  });

  it('rejects files larger than MAX_UPLOAD_BYTES', async () => {
    const bucket = {
      upload: jest.fn(),
      uploadMany: jest.fn(),
    } as unknown as BucketService;
    const interceptor = new FileUploadInterceptor(bucket);
    const request = {
      files: [{ size: MAX_UPLOAD_BYTES + 1, originalname: 'big.bin' }],
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    await expect(
      interceptor.intercept(context, { handle: () => of(null) }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(bucket.uploadMany).not.toHaveBeenCalled();
  });

  it('uploads files within the limit', async () => {
    const bucket = {
      upload: jest.fn(),
      uploadMany: jest.fn().mockResolvedValue([{ id: '1' }]),
    } as unknown as BucketService;
    const interceptor = new FileUploadInterceptor(bucket);
    const request: any = {
      files: [{ size: MAX_UPLOAD_BYTES, originalname: 'ok.bin' }],
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    await interceptor.intercept(context, { handle: () => of(null) });
    expect(bucket.uploadMany).toHaveBeenCalled();
    expect(request.bucket_uploads).toEqual([{ id: '1' }]);
  });
});
