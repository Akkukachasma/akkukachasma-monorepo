# Admin Orders Feature

This feature provides comprehensive order management functionality for administrators with a tabular interface.

## Features

- **Order Table**: Display all orders in a tabular format with advanced filtering and infinite scroll
- **Order Details**: View detailed order information in a modal
- **Advanced Filters**: Search by customer name/email, filter by status, payment status, payment mode, and date range
- **Real-time Updates**: Orders are fetched with React Query for optimal caching and updates

## Components

### OrderList

Main component that displays the orders table with filters and infinite scroll.

**Props:**

- `onViewDetails: (order: Order) => void` - Callback when user clicks to view order details

### OrderListItem

Individual order table row component with skeleton loading.

**Props:**

- `order: Order` - Order data to display
- `onViewDetails: (order: Order) => void` - Callback when clicked

### OrderDetailsModal

Modal component for displaying detailed order information.

**Props:**

- `order: Order | null` - Order data to display
- `isOpen: boolean` - Modal visibility state
- `onClose: () => void` - Callback to close modal

## Table Structure

The orders are displayed in a table with the following columns:

| Column   | Description                           |
| -------- | ------------------------------------- |
| Customer | Customer avatar, name, and ID         |
| Order ID | Shortened order ID for easy reference |
| Status   | Order status with color-coded badges  |
| Payment  | Payment status and mode badges        |
| Total    | Order total amount                    |
| Items    | Number of items in the order          |
| Date     | Order creation date                   |
| Actions  | View details button                   |

## Hooks

### useGetOrders

React Query hook for fetching orders with infinite scroll and filtering.

**Returns:**

- `data: Order[]` - Array of orders
- `isLoading: boolean` - Loading state
- `hasNextPage: boolean` - Whether more pages are available
- `fetchNextPage: () => void` - Function to load next page
- `total: number` - Total number of orders

## Store

### ordersSlice

Redux slice for managing order filter state.

**State:**

- `total: number` - Total number of orders
- `search_term: string` - Search term for customer name/email
- `sort_by: string` - Sort order
- `status: string` - Order status filter
- `payment_status: string` - Payment status filter
- `payment_mode: string` - Payment mode filter
- `start_date: string` - Start date filter
- `end_date: string` - End date filter

**Actions:**

- `setTotal` - Set total count
- `setSearchTerm` - Set search term
- `setSortBy` - Set sort order
- `setStatus` - Set status filter
- `setPaymentStatus` - Set payment status filter
- `setPaymentMode` - Set payment mode filter
- `setStartDate` - Set start date filter
- `setEndDate` - Set end date filter

## Types

### Order

Complete order data structure including user, items, pricing, and payment information.

### OrderItem

Individual order item with product details, pricing, and taxes.

### OrderPayment

Payment information including status, mode, and transaction details.

### OrderPricing

Pricing breakdown including subtotals, discounts, and final total.

## Usage

```tsx
import { OrderList, OrderDetailsModal } from "@/features/admin/orders";

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div>
      <OrderList onViewDetails={handleViewDetails} />
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
```

## API Integration

The feature integrates with the backend `/orders` endpoint (admin only) and supports:

- **Pagination**: Infinite scroll with configurable page size
- **Filtering**: Search, status, payment status, payment mode, date range
- **Sorting**: By creation date, customer name, recently updated
- **Real-time**: React Query caching and invalidation

## Filter Options

### Order Status

- Initiated
- Confirmed
- Picked
- Delivered
- Cancelled

### Payment Status

- Pending
- Completed
- Failed

### Payment Mode

- Online
- Cash on Delivery (COD)

### Sort Options

- Newest First (created_desc)
- Oldest First (created_asc)
- Customer A-Z (name_asc)
- Customer Z-A (name_desc)
- Recently Updated (recently_updated)

## Table Features

- **Responsive Design**: Works on all screen sizes
- **Hover Effects**: Row highlighting on hover
- **Click to View**: Click any row to open order details
- **Skeleton Loading**: Loading states for better UX
- **Infinite Scroll**: Automatic pagination
- **Status Badges**: Color-coded status indicators
- **Compact Layout**: Efficient use of space
