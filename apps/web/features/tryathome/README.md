# TryAtHome Feature

This feature provides a comprehensive try-at-home service for eyewear, allowing customers to request home visits for trying premium eyewear.

## Structure

```
features/tryathome/
├── components/
│   ├── TryAtHomeForm.tsx      # Main form component
│   └── TryAtHomeHero.tsx      # Hero section component
├── mutations/
│   └── useCreateTryAtHome.ts  # React Query mutation hook
├── tryathome.validations.ts   # Zod validation schema
├── index.ts                   # Barrel exports
└── README.md                  # This documentation
```

## Components

### TryAtHomeForm

A comprehensive form component for submitting try-at-home requests.

**Features:**

- React Hook Form with Zod validation
- Shadcn UI components
- Loading states and error handling
- Responsive design
- Form validation with proper error messages

**Props:**

- `className?: string` - Optional CSS classes

**Usage:**

```tsx
import { TryAtHomeForm } from "@/features/tryathome";

<TryAtHomeForm className="w-full max-w-md" />;
```

### TryAtHomeHero

A hero section component showcasing the try-at-home service features.

**Features:**

- Compelling copy and visual elements
- Feature highlights grid
- "How It Works" section
- Responsive design

**Usage:**

```tsx
import { TryAtHomeHero } from "@/features/tryathome";

<TryAtHomeHero />;
```

## Hooks

### useCreateTryAtHome

React Query mutation hook for creating try-at-home requests.

**Returns:**

- `mutate` - Function to submit the form
- `isPending` - Loading state
- `error` - Error state
- `data` - Response data

**Usage:**

```tsx
import { useCreateTryAtHome } from "@/features/tryathome";

const createTryAtHome = useCreateTryAtHome();
createTryAtHome.mutate(formData);
```

## Validation

### tryAtHomeFormSchema

Zod schema for form validation with the following fields:

- `name: string` - Full name (2-50 characters)
- `email: string` - Valid email address
- `phone_number: string` - Phone number (10-15 digits)
- `message?: string` - Optional additional message
- `zip_code: string` - Zip code (5-10 characters)

**Usage:**

```tsx
import { tryAtHomeFormSchema, TryAtHomeFormValues } from "@/features/tryathome";

const form = useForm<TryAtHomeFormValues>({
  resolver: zodResolver(tryAtHomeFormSchema),
  defaultValues: {
    /* ... */
  },
});
```

## API Integration

The feature integrates with the backend tryathome module:

- **Endpoint:** `POST /tryathome/requests`
- **Authentication:** Public endpoint (no auth required)
- **Response:** Success/error messages via toast notifications

## Form Fields

1. **Full Name** - Required, 2-50 characters
2. **Email Address** - Required, valid email format
3. **Phone Number** - Required, 10-15 digits
4. **Pin Code** - Required, 5-10 characters (for address lookup)
5. **Additional Message** - Optional, for special requests/preferences

## Error Handling

- Form validation errors displayed inline
- API error messages shown via toast notifications
- Loading states prevent multiple submissions
- Success messages confirm submission

## Styling

- Uses Shadcn UI components for consistency
- Responsive design with mobile-first approach
- Consistent with the overall design system
- Proper spacing and typography

## Best Practices

- Feature-centric architecture
- Separation of concerns (validation, mutations, components)
- Type safety with TypeScript
- Proper error handling and user feedback
- Accessibility considerations
- Performance optimized with React Query
