import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AddProductToCartDto } from './add-product.dto';
import { UpdateQuantityDto } from './update.dto';

describe('Cart DTO validation (invalid payloads)', () => {
  it('UpdateQuantityDto: quantity below minimum', () => {
    const dto = plainToInstance(UpdateQuantityDto, { quantity: 0 });
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
    expect(errors[0].constraints?.min).toMatch(/at least 1/i);
  });

  it('UpdateQuantityDto: quantity above maximum', () => {
    const dto = plainToInstance(UpdateQuantityDto, { quantity: 11 });
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors[0].constraints?.max).toMatch(/at most 10/i);
  });

  it('AddProductToCartDto: invalid product_color_id (not MongoId)', () => {
    const dto = plainToInstance(AddProductToCartDto, {
      product_color_id: 'not-a-mongo-id',
      frame_only: true,
      save_prescription: false,
    });
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    const idError = errors.find((e) => e.property === 'product_color_id');
    expect(idError).toBeDefined();
  });

  it('AddProductToCartDto: frame_only false without lens fields fails nested rules', () => {
    const dto = plainToInstance(AddProductToCartDto, {
      product_color_id: '507f1f77bcf86cd799439011',
      frame_only: false,
      save_prescription: false,
    });
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});
