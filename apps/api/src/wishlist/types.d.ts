import { Color, File, Product, ProductColor } from '@prisma/client';

export interface IProductColor extends Partial<ProductColor> {
  product: Product;
  colors: Color[];
  images: File[];
}
