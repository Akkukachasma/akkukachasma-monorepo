# Inquiry Module

This module handles customer inquiries with comprehensive CRUD operations and advanced filtering capabilities.

## Features

- **Create Inquiries**: Public API to create new customer inquiries
- **List Inquiries**: Admin-only API with advanced filtering and pagination
- **Delete Inquiries**: Admin-only API to remove inquiry records
- **Advanced Filtering**: Search by name, email, phone, source, and date range
- **Sorting**: Multiple sorting options for inquiry lists
- **Validation**: Comprehensive input validation with proper error handling

## API Endpoints

### 1. Create Inquiry
- **POST** `/inquiries`
- **Access**: Public
- **Description**: Create a new customer inquiry
- **Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+919876543210",
    "message": "I have a question about your products",
    "source": "contact_us"
  }
  ```

### 2. Get All Inquiries
- **GET** `/inquiries`
- **Access**: Admin only
- **Description**: Retrieve paginated list of inquiries with advanced filters
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `page_size` (optional): Items per page (default: 10)
  - `search_term` (optional): Search in first_name, last_name, or email
  - `source` (optional): Filter by inquiry source (contact_us, product_page, blog, other)
  - `email` (optional): Filter by specific email
  - `phone` (optional): Filter by specific phone number
  - `start_date` (optional): Filter by start date (ISO format)
  - `end_date` (optional): Filter by end date (ISO format)
  - `sort_by` (optional): Sort order (created_asc, created_desc, name_asc, name_desc, recently_updated)

### 3. Delete Inquiry
- **DELETE** `/inquiries/:id`
- **Access**: Admin only
- **Description**: Delete an inquiry by ID
- **Parameters**:
  - `id`: Inquiry ID (MongoDB ObjectId)

## Data Model

The inquiry model includes the following fields:

- `id`: Unique identifier (MongoDB ObjectId)
- `first_name`: Customer's first name
- `last_name`: Customer's last name
- `email`: Customer's email address
- `phone`: Customer's phone number (Indian format)
- `message`: Optional inquiry message
- `source`: Inquiry source (contact_us, product_page, blog, other)
- `address`: Optional associated address
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Usage Examples

### Creating an Inquiry
```typescript
const inquiryData = {
  first_name: "Jane",
  last_name: "Smith",
  email: "jane.smith@example.com",
  phone: "+919876543210",
  message: "I'm interested in your prescription glasses",
  source: "product_page"
};

const response = await fetch('/inquiries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(inquiryData)
});
```

### Getting Inquiries with Filters
```typescript
// Get inquiries from contact_us source, sorted by creation date
const response = await fetch('/inquiries?source=contact_us&sort_by=created_desc&page=1&page_size=20');

// Search for inquiries containing "john"
const response = await fetch('/inquiries?search_term=john');

// Get inquiries from a specific date range
const response = await fetch('/inquiries?start_date=2024-01-01&end_date=2024-12-31');
```

### Deleting an Inquiry
```typescript
const inquiryId = "507f1f77bcf86cd799439011";
const response = await fetch(`/inquiries/${inquiryId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer your-admin-token'
  }
});
```

## Error Handling

The module includes comprehensive error handling:

- **Validation Errors**: Invalid input data returns 400 Bad Request
- **Not Found**: Attempting to delete non-existent inquiry returns 404 Not Found
- **Authorization**: Admin-only endpoints return 403 Forbidden for non-admin users

## Testing

The module includes comprehensive unit tests:

- `inquiry.service.spec.ts`: Tests for service layer methods
- `inquiry.controller.spec.ts`: Tests for controller endpoints

Run tests with:
```bash
npm run test inquiry
```

## Dependencies

- `@nestjs/common`: Core NestJS functionality
- `@nestjs/swagger`: API documentation
- `class-validator`: Input validation
- `class-transformer`: Data transformation
- `@prisma/client`: Database operations 