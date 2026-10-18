import React from "react";
import { CompactContactForm } from "@/features/contact-us";

// Example of how to use CompactContactForm in a product page
export const ProductPageExample: React.FC = () => {
  return (
    <div className="app-container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">
            Premium Aviator Sunglasses
          </h1>
          <p className="text-muted-foreground mb-6">
            Classic aviator design with premium materials and UV protection.
          </p>
          {/* Product images, details, etc. */}
        </div>

        {/* Contact Form */}
        <div>
          <CompactContactForm
            title="Ask About This Product"
            description="Have questions about these sunglasses? Our experts are here to help you find the perfect pair!"
            source="product_page"
            className="sticky top-4"
          />
        </div>
      </div>
    </div>
  );
};
