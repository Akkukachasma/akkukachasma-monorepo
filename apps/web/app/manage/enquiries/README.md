# Admin Inquiries Page

This page provides comprehensive management of customer inquiries submitted through the contact forms across the website.

## Features

### **📋 Inquiry Management**

- **View All Inquiries**: Complete list of all customer inquiries with pagination
- **Advanced Filtering**: Filter by source, email, search terms, and date ranges
- **Sorting Options**: Sort by creation date, name, and other criteria
- **Real-time Search**: Search across names and email addresses

### **🔍 Filtering Capabilities**

- **Source Filter**: Filter by inquiry source (contact_us, product_page, blog, other)
- **Email Filter**: Filter by specific email addresses
- **Search**: Global search across first name, last name, and email
- **Sorting**: Multiple sorting options for better organization

### **📱 User Interface**

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Card Layout**: Clean card-based layout for each inquiry
- **Loading States**: Proper loading indicators during data fetching
- **Error Handling**: Graceful error handling with retry options

### **⚡ Actions**

- **View Details**: Click the eye icon to view full inquiry details in a modal
- **Delete Inquiry**: Permanently remove inquiries with confirmation dialog
- **Bulk Operations**: Future enhancement for bulk actions

## Page Structure

### **Header Section**

- Page title: "Inquiries"
- Tagline: "Manage customer inquiries and support requests"
- Clean, minimal header following admin design patterns

### **Filters Section**

- **Search Bar**: Search across names and emails
- **Source Dropdown**: Filter by inquiry source
- **Email Filter**: Filter by specific email
- **Sort Dropdown**: Choose sorting order

### **Inquiries List**

- **Card Layout**: Each inquiry displayed in a clean card
- **Contact Info**: Name, email, phone, and creation date
- **Source Badge**: Color-coded badges for different sources
- **Message Preview**: Truncated message preview
- **Action Buttons**: View details and delete options

### **Pagination**

- **Page Navigation**: Previous/Next buttons
- **Page Info**: Current page and total pages display
- **Responsive**: Adapts to different screen sizes

## Data Display

### **Inquiry Information**

- **Name**: First and last name of the customer
- **Email**: Customer's email address
- **Phone**: Customer's phone number
- **Message**: Inquiry message (truncated in list, full in modal)
- **Source**: How the customer found the website
- **Date**: When the inquiry was submitted

### **Source Types**

- **Contact Us**: Inquiries from the main contact page
- **Product Page**: Inquiries from product pages
- **Blog**: Inquiries from blog articles
- **Other**: Inquiries from other sources

### **Source Badge Colors**

- **Contact Us**: Default (blue)
- **Product Page**: Secondary (gray)
- **Blog**: Outline (bordered)
- **Other**: Destructive (red)

## Actions

### **View Details**

- **Modal Dialog**: Opens a detailed view of the inquiry
- **Full Information**: Shows complete inquiry details
- **Formatted Date**: Human-readable date and time
- **Message Display**: Full message with proper formatting

### **Delete Inquiry**

- **Confirmation Dialog**: Prevents accidental deletions
- **Permanent Action**: Cannot be undone
- **Success Feedback**: Toast notification on successful deletion
- **Error Handling**: Proper error messages if deletion fails

## API Integration

### **Data Fetching**

- **React Query**: Efficient data fetching and caching
- **Pagination**: Server-side pagination for performance
- **Filtering**: Server-side filtering for large datasets
- **Real-time Updates**: Automatic refetch after actions

### **Error Handling**

- **Network Errors**: Graceful handling of network issues
- **API Errors**: User-friendly error messages
- **Retry Options**: Easy retry functionality
- **Loading States**: Clear loading indicators

## Responsive Design

### **Desktop**

- **Full Layout**: All filters visible in a grid
- **Card Grid**: Optimal card layout
- **Sidebar Integration**: Works with admin sidebar

### **Tablet**

- **Adaptive Grid**: Filters stack appropriately
- **Touch Friendly**: Larger touch targets
- **Optimized Spacing**: Better spacing for touch interaction

### **Mobile**

- **Stacked Layout**: Filters stack vertically
- **Touch Optimized**: Large buttons and touch targets
- **Simplified Actions**: Streamlined action buttons

## Future Enhancements

### **Planned Features**

- **Bulk Operations**: Select multiple inquiries for bulk actions
- **Export Functionality**: Export inquiries to CSV/Excel
- **Advanced Analytics**: Inquiry analytics and reporting
- **Email Integration**: Direct email responses from the admin panel
- **Status Management**: Mark inquiries as read/unread, resolved/pending

### **Potential Improvements**

- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Filtering**: Date range picker, more filter options
- **Search Highlighting**: Highlight search terms in results
- **Keyboard Shortcuts**: Power user keyboard navigation
- **Custom Views**: Save and share custom filter combinations

## Technical Implementation

### **Components Used**

- **React Hook Form**: Form state management
- **React Query**: Data fetching and caching
- **Shadcn UI**: Consistent design system
- **Lucide Icons**: Beautiful, consistent icons
- **Tailwind CSS**: Utility-first styling

### **State Management**

- **Local State**: Filter state managed with React useState
- **Server State**: Inquiry data managed with React Query
- **Optimistic Updates**: Immediate UI updates for better UX

### **Performance Optimizations**

- **Pagination**: Server-side pagination for large datasets
- **Debounced Search**: Efficient search with debouncing
- **Memoization**: Optimized re-renders with React.memo
- **Lazy Loading**: Components loaded as needed
