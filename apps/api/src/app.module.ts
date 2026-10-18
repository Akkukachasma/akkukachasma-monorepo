import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { BucketModule } from './bucket/bucket.module';
import { FileModule } from './file/file.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RbacModule } from './rbac/rbac.module';
import { PermissionGuard } from './rbac/guards/permission.guard';
import { OwnershipGuard } from './rbac/guards/ownership.guard';
import { PowerTypeModule } from './power-type/power-type.module';
import { LensFeatureModule } from './lens-feature/lens-feature.module';
import { LensDetailModule } from './lens-detail/lens-detail.module';
import { FrameMaterialModule } from './frame-material/frame-material.module';
import { BrandModule } from './brand/brand.module';
import { ColorModule } from './color/color.module';
import { ShapeModule } from './shape/shape.module';
import { CategoryModule } from './category/category.module';
import { CouponModule } from './coupon/coupon.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ArticleModule } from './article/article.module';
import { ProductModule } from './product/product.module';
import { PrismaInterceptor } from './prisma.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { BannerModule } from './banner/banner.module';
import { AccountModule } from './account/account.module';
import { CartModule } from './cart/cart.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { OrderModule } from './order/order.module';
import { AddressModule } from './address/address.module';
import { RolesGuard } from './auth/roles.guard';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './config/redis.config';
import { CacheModule } from './cache/cache.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SettingModule } from './setting/setting.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { FranchiseRequestModule } from './franchise-request/franchise-request.module';
import { TryAtHomeModule } from './tryathome/tryathome.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PdfModule } from './pdf/pdf.module';
import { RoleModule } from './role/role.module';
import { InventoryModule } from './inventory/inventory.module';
import { DelhiveryModule } from './delhivery/delhivery.module';
import { ActivityModule } from './activity/activity.module';
import { HttpExceptionFilter } from './app.exception-filter';
import { NotificationModule } from './notifications/notifications.module';
import { HeroMediaModule } from './hero-media/hero-media.module';
import { ProductColorEmbeddingModule } from './product-color-embedding/product-color-embedding.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [redisConfig],
    }),
    CacheModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    TokenModule,
    MailModule,
    BucketModule,
    FileModule,
    PowerTypeModule,
    LensFeatureModule,
    LensDetailModule,
    FrameMaterialModule,
    BrandModule,
    ColorModule,
    ShapeModule,
    CategoryModule,
    CouponModule,
    NewsletterModule,
    ArticleModule,
    ProductModule,
    UserModule,
    BannerModule,
    AccountModule,
    CartModule,
    PrescriptionModule,
    OrderModule,
    AddressModule,
    PaymentModule,
    SettingModule,
    WishlistModule,
    InquiryModule,
    FranchiseRequestModule,
    TryAtHomeModule,
    DashboardModule,
    InvoiceModule,
    PdfModule,
    InventoryModule,
    DelhiveryModule,
    ActivityModule,
    NotificationModule,
    HeroMediaModule,
    ProductColorEmbeddingModule,
    RbacModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_GUARD, useClass: OwnershipGuard },
    {
      provide: APP_INTERCEPTOR,
      useClass: PrismaInterceptor,
    },
  ],
})
export class AppModule {}
