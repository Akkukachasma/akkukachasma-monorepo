import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_DASHBOARD_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_DASHBOARD_MUTATION)
@Controller('dashboard')
@ApiTags('Dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Cacheable({ ttl: 60, scope: 'user' })
  @Get('order-trends')
  @Roles('admin')
  @ApiOperation({ description: 'Get order trends' })
  async getOrderTrends(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    const trends = await this.dashboardService.getOrderTrends(period);
    return {
      success: true,
      data: trends,
    };
  }

  @Cacheable({ ttl: 60, scope: 'user' })
  @Get('category-trends')
  @Roles('admin')
  @ApiOperation({ description: 'Get category trends' })
  async getCategoryTrends(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    const trends = await this.dashboardService.getCategoryTrends(period);
    return {
      success: true,
      data: trends,
    };
  }

  @Cacheable({ ttl: 60, scope: 'user' })
  @Get('revenue-trends')
  @Roles('admin')
  @ApiOperation({ description: 'Get revenue trends' })
  async getRevenueTrends(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    const trends = await this.dashboardService.getRevenueTrends(period);
    return {
      success: true,
      data: trends,
    };
  }

  @Cacheable({ ttl: 60, scope: 'user' })
  @Get('todays-orders')
  @Roles('admin')
  @ApiOperation({ description: 'Get today\'s orders' })
  async getTodaysOrders() {
    const orders = await this.dashboardService.getTodaysOrders();
    return {
      success: true,
      data: orders,
    };
  }

  @Cacheable({ ttl: 60, scope: 'user' })
  @Get('cards/order-counts')
  @Roles('admin')
  @ApiOperation({ description: 'Order counts for dashboard stat card' })
  async getOrderCountsCard() {
    const data = await this.dashboardService.getDashboardOrderCounts();
    return { success: true, data };
  }

  @Cacheable({ ttl: 60, scope: 'user' })
  @Get('cards/revenue-summary')
  @Roles('admin')
  @ApiOperation({ description: 'Revenue totals for dashboard stat card' })
  async getRevenueSummaryCard() {
    const data = await this.dashboardService.getDashboardRevenueSummary();
    return { success: true, data };
  }

  @Cacheable({ ttl: 60, scope: 'user' })
  @Get('cards/product-count')
  @Roles('admin')
  @ApiOperation({ description: 'Product count for dashboard stat card' })
  async getProductCountCard() {
    const data = await this.dashboardService.getDashboardProductCount();
    return { success: true, data };
  }

  @Cacheable({ ttl: 60, scope: 'user' })
  @Get('cards/category-count')
  @Roles('admin')
  @ApiOperation({ description: 'Category count for dashboard stat card' })
  async getCategoryCountCard() {
    const data = await this.dashboardService.getDashboardCategoryCount();
    return { success: true, data };
  }
} 