const ENDPOINTS = {
  AUTH: {
    LOGIN: "auth/login",
    LOGOUT: "auth/logout",
    SIGNUP: "auth/signup",
    details: "auth/details",
    verify_email: (token: string) => `/auth/verfiy-email?token=${token}`,
    resend_verification_mail: "auth/resend-verification-link",
    forgot: "auth/forgot",
    reset_password: (token: string) => `auth/reset-password?token=${token}`,
  },
    admin: {
    orders: {
      fetch_all: (queryString?: string) =>
        `orders${queryString ? "?" + queryString : ""}`,
      fetch_single: (id: string) => `orders/${id}`,
      update_status: (id: string) => `orders/${id}/status`,
      update_shipment: (id: string) => `orders/${id}/shipment`,
      fetch_shipment_live: (id: string) => `orders/${id}/shipment/live`,
      manifest: "orders/manifest",
    },
    invoices: {
      create_from_order: (orderId: string) => `invoices/order/${orderId}`,
      export_accounting: () => `invoices/export/accounting`,
      bulk_pdf: () => `invoices/bulk-pdf`,
      fetch_by_id: (id: string) => `invoices/${id}`,
      fetch_by_order: (orderId: string) => `invoices/order/${orderId}`,
      fetch_by_order_with_company_info: (orderId: string) =>
        `invoices/order/${orderId}/with-company-info`,
      fetch_all: (queryString?: string) =>
        `invoices${queryString ? "?" + queryString : ""}`,
      update_status: (id: string) => `invoices/${id}/status`,
      cancel_line: (invoiceId: string, itemId: string) =>
        `invoices/line/${invoiceId}/${itemId}/cancel`,
      pdf: (id: string) => `invoices/${id}/pdf`,
    },
    dashboard: {
      cards: {
        order_counts: "dashboard/cards/order-counts",
        revenue_summary: "dashboard/cards/revenue-summary",
        product_count: "dashboard/cards/product-count",
        category_count: "dashboard/cards/category-count",
      },
      order_trends: (period?: string) =>
        `dashboard/order-trends${period ? `?period=${period}` : ""}`,
      category_trends: (period?: string) =>
        `dashboard/category-trends${period ? `?period=${period}` : ""}`,
      revenue_trends: (period?: string) =>
        `dashboard/revenue-trends${period ? `?period=${period}` : ""}`,
      todays_orders: "dashboard/todays-orders",
    },
    manage_notifications: {
      list: (qs?: string) =>
        `manage/notifications${qs ? `?${qs}` : ""}`,
      unread_count: "manage/notifications/unread-count",
      read: (id: string) => `manage/notifications/${id}/read`,
      read_all: "manage/notifications/read-all",
    },
    franchise_requests: {
      fetch_all: (queryString?: string) =>
        `franchise-requests${queryString ? "?" + queryString : ""}`,
      approve: (id: string) => `franchise-requests/${id}/approve`,
      delete: (id: string) => `franchise-requests/${id}`,
    },
    company_info: {
      fetch_details: "company-info",
      cod_enabled: "company-info/cod-enabled",
      create: "company-info",
      update: (id: string) => `company-info/${id}`,
    },
    settings: {
      taxes: {
        fetch_all: "taxes",
        create: "taxes",
        update: (id: string) => `taxes/${id}`,
        remove: (id: string) => `taxes/${id}`,
      },
      invoice_taxes: {
        fetch_all: "invoice-taxes",
        create: "invoice-taxes",
        update: (id: string) => `invoice-taxes/${id}`,
        remove: (id: string) => `invoice-taxes/${id}`,
      },
    },
    products: {
      fetch_all: (queryString?: string) =>
        `products${queryString ? "?" + queryString : ""}`,
      fetch_single: (product_id: string) => `products/${product_id}`,
      create: "products",
      update: (id: string) => `products/${id}`,
      delete: (id: string) => `products/${id}`,
      price_adjustments: {
        list: (queryString?: string) =>
          `products/price-adjustments${queryString ? "?" + queryString : ""}`,
        create: "products/price-adjustments",
      },
      color: {
        update: (product_color_id: string) =>
          `products/colors/${product_color_id}`,
        remove: (product_color_id: string) =>
          `products/colors/${product_color_id}`,
        save_images: (product_color_id: string) =>
          `products/colors/${product_color_id}/images`,
        create: (product_id: string) => `products/${product_id}/colors`,
      },
    },
    articles: {
      fetch_all: (queryString?: string) =>
        `articles${queryString ? "?" + queryString : ""}`,
      create: `articles`,
      fetch_single: (id: string) => `articles/${id}`,
      update: (id?: string) => `articles/${id}`,
      delete: (id?: string) => `articles/${id}`,
    },
    power_types: {
      fetch_all: (queryString?: string) =>
        `power-types${queryString ? "?" + queryString : ""}`,
      create: "power-types",
      update: (id: string) => `power-types/${id}`,
      delete: (id: string) => `power-types/${id}`,
    },
    shapes: {
      fetch_all: (queryString?: string) =>
        `shapes${queryString ? "?" + queryString : ""}`,
      create: "shapes",
      update: (id: string) => `shapes/${id}`,
      delete: (id: string) => `shapes/${id}`,
    },
    lens_features: {
      fetch_all: (queryString?: string) =>
        `lens-features${queryString ? "?" + queryString : ""}`,
      create: "lens-features",
      update: (id: string) => `lens-features/${id}`,
      delete: (id: string) => `lens-features/${id}`,
    },
    lens_details: {
      fetch_all: (queryString?: string) =>
        `lens-details${queryString ? "?" + queryString : ""}`,
      create: "lens-details",
      update: (id: string) => `lens-details/${id}`,
      delete: (id: string) => `lens-details/${id}`,
    },
    frame_materials: {
      fetch_all: (queryString?: string) =>
        `frame-materials${queryString ? "?" + queryString : ""}`,
      create: "frame-materials",
      update: (id: string) => `frame-materials/${id}`,
      delete: (id: string) => `frame-materials/${id}`,
    },
    brands: {
      fetch_all: (queryString?: string) =>
        `brands${queryString ? "?" + queryString : ""}`,
      create: "brands",
      update: (id: string) => `brands/${id}`,
      delete: (id: string) => `brands/${id}`,
    },
    categories: {
      fetch_all: (queryString?: string) =>
        `categories${queryString ? "?" + queryString : ""}`,
      create: "categories",
      update: (id: string) => `categories/${id}`,
      delete: (id: string) => `categories/${id}`,
      reorder: "categories/reorder",
    },
    banners: {
      fetch_home_page: () => `banners/home`,
      fetch_related: (params?: { category_id?: string; shape_id?: string }) => {
        const search = new URLSearchParams();
        if (params?.category_id) search.set("category_id", params.category_id);
        if (params?.shape_id) search.set("shape_id", params.shape_id);
        const qs = search.toString();
        return `banners/related${qs ? `?${qs}` : ""}`;
      },
      fetch_all: (queryString?: string) =>
        `banners${queryString ? "?" + queryString : ""}`,
      fetch_one: (id: string) => `banners/${id}`,
      create: "banners",
      update: (id: string) => `banners/${id}`,
      update_order: "banners/reorder",
      delete: (id: string) => `banners/${id}`,
      banner_images: {
        fetch_all: (banner_id: string) => `banners/${banner_id}/banner-images`,
        create: (banner_id: string) => `banners/${banner_id}/banner-image`,
        delete: (banner_image_id: string) =>
          `banners/banner-images/${banner_image_id}`,
        update: (banner_image_id: string) =>
          `banners/banner-images/${banner_image_id}`,
        update_order: "banners/banner-images/reorder",
      },
    },
    coupon_manager: {
      fetch_all: (queryString?: string) =>
        `coupons${queryString ? "?" + queryString : ""}`,
      create: "coupons",
      update: (id: string) => `coupons/${id}`,
      delete: (id: string) => `coupons/${id}`,
    },
    newsletters: {
      fetch_all: (queryString?: string) =>
        `newsletters${queryString ? "?" + queryString : ""}`,
      delete: (id: string) => `newsletters/${id}`,
    },
    colors: {
      fetch_all: (queryString?: string) =>
        `colors${queryString ? "?" + queryString : ""}`,
      create: "colors",
      update: (id: string) => `colors/${id}`,
      delete: (id: string) => `colors/${id}`,
    },
    users: {
      fetch_all: (queryString?: string) =>
        `users${queryString ? "?" + queryString : ""}`,
      create: "users",
      update: (id: string) => `users/${id}`,
      delete: (id: string) => `users/${id}`,
      block: (id: string) => `users/${id}/block`,
      unblock: (id: string) => `users/${id}/unblock`,
    },
    roles: {
      fetch_all: "roles",
      fetch_one: (id: string) => `roles/${id}`,
      permissions: "roles/permissions",
      create: "roles",
      update: (id: string) => `roles/${id}`,
      delete: (id: string) => `roles/${id}`,
    },
    tryathome: {
      requests: {
        fetch_all: (queryString?: string) =>
          `tryathome/requests${queryString ? "?" + queryString : ""}`,
        delete: (id: string) => `tryathome/requests/${id}`,
      },
      purposes: {
        fetch_all: "tryathome/purposes",
        create: "tryathome/purposes",
        update: (id: string) => `tryathome/purposes/${id}`,
        delete: (id: string) => `tryathome/purposes/${id}`,
      },
    },
  },
  upload: "files",
  remove_file: (file_id: string) => `files/${file_id}`,
  upload_stream: {
    init: "files/stream/init",
    chunk: "files/stream/chunk",
    complete: "files/stream/complete",
    status: (uploadId: string) => `files/stream/${uploadId}/status`,
    cancel: (uploadId: string) => `files/stream/${uploadId}`,
  },
  hero_media: {
    active: "hero-media/active",
    stream: "hero-media/stream",
    file_stream: (fileId: string) => `hero-media/files/${fileId}/stream`,
    activate: "hero-media/activate",
    admin_list: "hero-media/admin/list",
    admin_delete: (id: string) => `hero-media/admin/${id}`,
  },
  product_color_embeddings: {
    list_by_product_color: (productColorId: string) =>
      `product-color-embeddings/by-product-color/${productColorId}`,
    stream: (id: string) => `product-color-embeddings/${id}/stream`,
    create: "product-color-embeddings",
    update: (id: string) => `product-color-embeddings/${id}`,
    delete: (id: string) => `product-color-embeddings/${id}`,
    reorder: "product-color-embeddings/reorder",
  },
  popularity: {
    record_share: "popularity/share",
  },
  products: {
    shape_starters: "products/shape-starters",
    latest: "products/latest",
    popular: "products/popular",
    featured: "products/featured",
    search: "products/search",
    search_suggestions: "products/search-suggestions",
    fetch_single_product: (slug: string, modelNumber?: string) =>
      modelNumber != null && String(modelNumber).length > 0
        ? `products/${slug}/details?model_number=${encodeURIComponent(String(modelNumber))}`
        : `products/${slug}/details`,
    record_views: (slug: string) => `products/${slug}/views`,
    category_by_slug: (category_slug: string) => `categories/${category_slug}`,
    category_products: (category_slug: string) =>
      `categories/${category_slug}/products`,
    shape_by_slug: (shape_slug: string) => `shapes/${shape_slug}`,
    shape_products: (shape_slug: string) => `shapes/${shape_slug}/products`,
  },
  notifications: {
    list: (qs?: string) => `notifications${qs ? `?${qs}` : ""}`,
    unread_count: "notifications/unread-count",
    read: (id: string) => `notifications/${id}/read`,
    read_all: "notifications/read-all",
  },
  account: {
    update_details: "account",
    update_password: "account/update-password",
    notification_preferences: "account/notification-preferences",
    fetch_addresses: "addresses",
    create_address: "addresses",
    update_address: (address_id: string) => `addresses/${address_id}`,
    remove_address: (address_id: string) => `addresses/${address_id}`,
    validate_pincode: (pincode: string) =>
      `addresses/validate-pincode/${pincode}`,
    fetch_prescriptions: "prescriptions",
    fetch_prescription: (id: string) => `prescriptions/${id}`,
    create_prescription: "prescriptions",
    update_prescription: (id: string) => `prescriptions/${id}`,
    remove_prescription: (id: string) => `prescriptions/${id}`,
  },
  cart: {
    add_product: `cart`,
    update_item_quantity: (cart_item_id: string) =>
      `cart/item/${cart_item_id}/quantity`,
    remove_product: (cart_item_id: string) => `cart/${cart_item_id}`,
    fetch_items: "cart",
    coupon: "cart/coupon",
    checkout_preview: "cart/checkout-preview",
    attach: "cart/attach",
  },
  wishlist: {
    list: "wishlist",
    add: "wishlist",
    clear: "wishlist/clear",
    remove: (wishlistId: string) => `wishlist/${wishlistId}`,
    remove_by_product_color: (productColorId: string) =>
      `wishlist/product-color/${productColorId}`,
  },

  offers: {
    fetch_all: (queryString?: string) =>
      `coupons/public${queryString ? "?" + queryString : ""}`,
  },
  newsletter: {
    subscribe: "newsletters/subscribe",
  },
  orders: {
    track: (orderId: string) => `orders/track/${orderId}`,
    my_orders: (queryString?: string) =>
      `orders/my-orders${queryString ? "?" + queryString : ""}`,
  },
  checkout: {
    remove_order_item: (order_id: string, order_item_id: string) =>
      `orders/${order_id}/item/${order_item_id}`,
    direct_checkout: "orders/checkout",
    from_cart: "orders/cart-checkout",
    fetch_checkout_details: "orders/checkout",
    update_payment_mode: (order_id: string) => `orders/${order_id}/mode`,
    update_order_coupon: (order_id: string) => `orders/${order_id}/coupon`,
    update_order_address: (order_id: string) => `orders/${order_id}/address`,
  },
  payment: {
    fetch_payment_details: (order_id: string) => `payment/${order_id}/details`,
    make_payment: "payment",
    verify_payment: "payment/verify",
  },
  blog: {
    fetch_popular: "articles/popular",
    fetch_published: "articles/published",
    fetch_single_article: (slug: string) => `articles/published/${slug}`,
    increment_views: (slug: string) => `articles/published/${slug}/views`,
  },
  inquiries: {
    create: "inquiries",
    fetch_all: (queryString?: string) =>
      `inquiries${queryString ? "?" + queryString : ""}`,
    delete: (id: string) => `inquiries/${id}`,
  },
  franchise_request: {
    create: "franchise-requests",
  },
  activities: {
    fetch_all: (queryString?: string) =>
      `activities${queryString ? "?" + queryString : ""}`,
  },

  // TryAtHome endpoints
  tryathome: {
    create: "/tryathome/requests",
    purposes: "/tryathome/purposes",
  },
};

export default ENDPOINTS;
