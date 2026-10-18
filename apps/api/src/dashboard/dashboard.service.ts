import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import dayjs, { type Dayjs } from '../../lib/custom-dayjs';
import { isActiveOrderLine } from '../order/order-item-active';

const emptyOrderStatusCounts = (): Record<OrderStatus, number> => ({
  [OrderStatus.initiated]: 0,
  [OrderStatus.cancelled]: 0,
  [OrderStatus.confirmed]: 0,
  [OrderStatus.picked]: 0,
  [OrderStatus.delivered]: 0,
});

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    private getDateRange(period: 'week' | 'month' | 'year') {
        const now = dayjs();
        let startDate: Dayjs;

        switch (period) {
            case 'week':
                startDate = now.subtract(7, 'day');
                break;
            case 'month':
                startDate = now.subtract(1, 'month');
                break;
            case 'year':
                startDate = now.subtract(1, 'year');
                break;
            default:
                startDate = now.subtract(1, 'month');
        }

        return {
            startDate: startDate.toDate(),
            endDate: now.toDate(),
        };
    }

    async getOrderTrends(period: 'week' | 'month' | 'year') {
        const { startDate, endDate } = this.getDateRange(period);

        const orders = await this.prisma.order.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
                deleted_at: null,
            },
            include: {
                pricing: true,
                payment: true,
            },
        });

        // Group by date
        const ordersByDate = orders.reduce((acc, order) => {
            const date = dayjs(order.created_at).format('YYYY-MM-DD');
            if (!acc[date]) {
                acc[date] = {
                    date,
                    count: 0,
                    revenue: 0,
                    statuses: emptyOrderStatusCounts(),
                };
            }
            acc[date].count++;
            if (order.pricing?.total) {
                acc[date].revenue += order.pricing.total;
            }
            const st = order.status as OrderStatus;
            if (acc[date].statuses[st] !== undefined) {
                acc[date].statuses[st] += 1;
            }
            return acc;
        }, {} as Record<string, { date: string; count: number; revenue: number; statuses: Record<OrderStatus, number> }>);

        return Object.values(ordersByDate).sort((a: any, b: any) =>
            dayjs(a.date).diff(dayjs(b.date))
        );
    }

    async getCategoryTrends(period: 'week' | 'month' | 'year') {
        const { startDate, endDate } = this.getDateRange(period);

        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    created_at: {
                        gte: startDate,
                        lte: endDate,
                    },
                    deleted_at: null,
                },
            },
            include: {
                order: {

                    include: {
                        pricing: true,
                        order_items: true,
                    },
                },
            },
        });

        // Extract category information from product_color JSON
        const categoryStats = orderItems.reduce((acc, item) => {
            if (!isActiveOrderLine(item)) {
                return acc;
            }
            const productColor = item.product_color as any;
            const categoryName = productColor?.product?.category?.title || 'Uncategorized';

            if (!acc[categoryName]) {
                acc[categoryName] = {
                    name: categoryName,
                    orders: 0,
                    revenue: 0,
                    items: 0,
                };
            }

            const activeCount =
                item.order?.order_items?.filter(isActiveOrderLine).length || 1;

            acc[categoryName].orders++;
            acc[categoryName].items += item.quantity;
            if (item.order?.pricing?.total) {
                acc[categoryName].revenue +=
                    item.order.pricing.total / activeCount;
            }

            return acc;
        }, {});

        return Object.values(categoryStats).sort((a: any, b: any) => b.revenue - a.revenue);
    }

    async getRevenueTrends(period: 'week' | 'month' | 'year') {
        const { startDate, endDate } = this.getDateRange(period);

        const orders = await this.prisma.order.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
                deleted_at: null,
                payment: {
                    status: 'completed',
                },
            },
            include: {
                pricing: true,
                payment: true,
            },
        });

        // Group by date
        const revenueByDate = orders.reduce((acc, order) => {
            const date = dayjs(order.created_at).format('YYYY-MM-DD');
            if (!acc[date]) {
                acc[date] = {
                    date,
                    revenue: 0,
                    orders: 0,
                    averageOrderValue: 0,
                };
            }
            acc[date].revenue += order.pricing?.total || 0;
            acc[date].orders++;
            return acc;
        }, {});

        // Calculate average order value
        Object.values(revenueByDate).forEach((day: any) => {
            day.averageOrderValue = day.orders > 0 ? day.revenue / day.orders : 0;
        });

        return Object.values(revenueByDate).sort((a: any, b: any) =>
            dayjs(a.date).diff(dayjs(b.date))
        );
    }

    async getTodaysOrders() {
        const today = dayjs().startOf('day');
        const tomorrow = dayjs().endOf('day');

        const orders = await this.prisma.order.findMany({
            where: {
                created_at: {
                    gte: today.toDate(),
                    lte: tomorrow.toDate(),
                },
                deleted_at: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                pricing: true,
                payment: true,
                order_items: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return orders;
    }

    async getDashboardOrderCounts() {
        const today = dayjs().startOf('day');
        const thisMonth = dayjs().startOf('month');
        const thisYear = dayjs().startOf('year');
        const [todayOrders, monthOrders, yearOrders] = await Promise.all([
            this.prisma.order.count({
                where: { created_at: { gte: today.toDate() }, deleted_at: null },
            }),
            this.prisma.order.count({
                where: { created_at: { gte: thisMonth.toDate() }, deleted_at: null },
            }),
            this.prisma.order.count({
                where: { created_at: { gte: thisYear.toDate() }, deleted_at: null },
            }),
        ]);
        return { today: todayOrders, month: monthOrders, year: yearOrders };
    }

    async getDashboardRevenueSummary() {
        const today = dayjs().startOf('day');
        const thisMonth = dayjs().startOf('month');
        const thisYear = dayjs().startOf('year');
        const [todayRevenueOrders, monthRevenueOrders, yearRevenueOrders] =
            await Promise.all([
                this.prisma.order.findMany({
                    where: {
                        created_at: { gte: today.toDate() },
                        deleted_at: null,
                        payment: { status: 'completed' },
                    },
                    include: { pricing: true },
                }),
                this.prisma.order.findMany({
                    where: {
                        created_at: { gte: thisMonth.toDate() },
                        deleted_at: null,
                        payment: { status: 'completed' },
                    },
                    include: { pricing: true },
                }),
                this.prisma.order.findMany({
                    where: {
                        created_at: { gte: thisYear.toDate() },
                        deleted_at: null,
                        payment: { status: 'completed' },
                    },
                    include: { pricing: true },
                }),
            ]);
        const sum = (orders: { pricing: { total: number } | null }[]) =>
            orders.reduce((s, o) => s + (o.pricing?.total || 0), 0);
        return {
            today: sum(todayRevenueOrders),
            month: sum(monthRevenueOrders),
            year: sum(yearRevenueOrders),
        };
    }

    async getDashboardProductCount() {
        const total = await this.prisma.product.count();
        return { total };
    }

    async getDashboardCategoryCount() {
        const total = await this.prisma.category.count();
        return { total };
    }

} 