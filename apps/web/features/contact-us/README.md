# Contact Us Feature

This feature provides comprehensive contact form functionality for the Akku Ka Chasma application, allowing customers to submit inquiries through various channels.

## Features

- **Contact Form Components**: Reusable form components for different contexts
- **Form Validation**: Comprehensive validation using Zod schemas
- **API Integration**: Seamless integration with the backend inquiry API
- **Error Handling**: Proper error handling with toast notifications
- **Loading States**: Loading indicators during form submission
- **Responsive Design**: Mobile-friendly form layouts

## Components

### ContactForm

A full-featured contact form component with all fields including source selection.

**Props:**

- `title` (optional): Custom title for the form
- `description` (optional): Custom description text
- `source` (optional): Source value for the inquiry ("contact_us", "product_page", "blog", "other") - defaults to "contact_us"
- `className` (optional): Additional CSS classes

**Usage:**

```tsx
import { ContactForm } from "@/features/contact-us";

<ContactForm
  title="Get in Touch"
  description="We're here to help with your questions"
  source="contact_us"
/>;
```

### CompactContactForm

A compact version of the contact form for use in product pages or other space-constrained contexts.

**Props:**

- `title` (optional): Custom title for the form
- `description` (optional): Custom description text
- `source` (optional): Source value for the inquiry - defaults to "product_page"
- `className` (optional): Additional CSS classes

**Usage:**

```tsx
import { CompactContactForm } from "@/features/contact-us";

<CompactContactForm
  title="Ask About This Product"
  description="Have questions about this product? We're here to help!"
  source="product_page"
/>;
```

## Hooks

### useCreateInquiry

Mutation hook for creating new inquiries.

**Returns:**

- `mutate`: Function to submit the form data
- `isPending`: Boolean indicating if the request is in progress
- `error`: Error object if the request failed
- `data`: Response data on success

**Usage:**

```tsx
import { useCreateInquiry } from "@/features/contact-us";

const createInquiryMutation = useCreateInquiry();

const handleSubmit = (data) => {
  createInquiryMutation.mutate(data, {
    onSuccess: () => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    },
  });
};
```

## Validation Schema

The feature uses a comprehensive Zod validation schema that matches the backend inquiry model:

```tsx
const contactFormSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(1000, "Message must be less than 1000 characters"),
  source: z
    .enum(["contact_us", "product_page", "blog", "other"])
    .default("contact_us"),
});
```

## Form Fields

### Required Fields

- **First Name**: Customer's first name (1-50 characters)
- **Last Name**: Customer's last name (1-50 characters)
- **Email**: Valid email address
- **Phone**: Phone number (10-15 digits)
- **Message**: Inquiry message (10-1000 characters)

### Source Field

- **Source**: Automatically set based on where the form is used (contact_us, product_page, blog, other)

## API Integration

The feature integrates with the backend inquiry API endpoints:

- **POST** `/inquiries` - Create a new inquiry
- **GET** `/inquiries` - Fetch all inquiries (admin only)
- **DELETE** `/inquiries/:id` - Delete an inquiry (admin only)

## Error Handling

The feature includes comprehensive error handling:

- **Validation Errors**: Displayed inline with form fields
- **API Errors**: Shown as toast notifications
- **Network Errors**: Graceful fallback with user-friendly messages

## Success Handling

On successful form submission:

- Form is reset to initial state
- Success toast notification is shown
- User receives confirmation message

## Usage Examples

### Support Page

```tsx
import { ContactForm } from "@/features/contact-us";

export default function SupportPage() {
  return (
    <div>
      <h1>Contact Us</h1>
      <ContactForm
        title="Get in Touch"
        description="We're here to help with your questions"
        source="contact_us"
      />
    </div>
  );
}
```

### Product Page

```tsx
import { CompactContactForm } from "@/features/contact-us";

export default function ProductPage() {
  return (
    <div>
      <h1>Product Details</h1>
      <CompactContactForm
        title="Ask About This Product"
        description="Have questions about this product? We're here to help!"
        source="product_page"
      />
    </div>
  );
}
```

### Blog Page

```tsx
import { CompactContactForm } from "@/features/contact-us";

export default function BlogPage() {
  return (
    <div>
      <h1>Blog Post</h1>
      <CompactContactForm
        title="Questions About This Article?"
        description="Get in touch if you have questions about this content"
        source="blog"
      />
    </div>
  );
}
```

## Styling

The components use Tailwind CSS classes and are fully responsive. They follow the application's design system and can be customized using the `className` prop.

## Dependencies

- `@hookform/resolvers`: Form validation integration
- `react-hook-form`: Form state management
- `zod`: Schema validation
- `@tanstack/react-query`: API state management
- `lucide-react`: Icons
- `@/components/ui/*`: Shadcn UI components
