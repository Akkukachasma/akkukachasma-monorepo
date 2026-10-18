import React from "react";
import { ContactForm, CompactContactForm } from "@/features/contact-us";

// Example usage in different contexts
export const UsageExamples: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Support/Contact Page */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Support Page</h2>
        <ContactForm
          title="Get in Touch"
          description="We're here to help with your questions"
          source="contact_us"
        />
      </div>

      {/* Product Page */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Product Page</h2>
        <CompactContactForm
          title="Ask About This Product"
          description="Have questions about this product? We're here to help!"
          source="product_page"
        />
      </div>

      {/* Blog Page */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Blog Page</h2>
        <CompactContactForm
          title="Questions About This Article?"
          description="Get in touch if you have questions about this content"
          source="blog"
        />
      </div>

      {/* Other Context */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Other Context</h2>
        <ContactForm
          title="General Inquiry"
          description="We'd love to hear from you"
          source="other"
        />
      </div>
    </div>
  );
};
