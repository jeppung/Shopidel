import { ICategory } from "./product_interface";

export interface IBestSelling {
  name: string;
  price: string;
  picture_url: string;
  stars: string;
  total_sold: string;
  category: string;
  product_name_slug: string;
  shop_name_slug: string;
}

export interface IEtalaseSeller {
  showcase_id: number;
  showcase_name: string;
}

export interface IEtalase {
  data: IEtalaseSeller[];
  pagination: {
    total_page: number;
    total_item: number;
    current_page: number;
    limit: number;
  };
}

interface ISellerProduct {
  name: string;
  price: string;
  picture_url: string;
  stars: string;
  total_sold: number;
  created_at: string;
  category_level_1: string;
  category_level_2: string;
  category_level_3: string;
}
export interface IAPIProfileShopResponse {
  seller_id: number;
  seller_name: string;
  seller_picture_url: string;
  seller_district: string;
  seller_operating_hour: {
    start: string;
    end: string;
  };
  seller_description: string;
  seller_stars: string;
  shop_name_slug: string;
  seller_products: ISellerProduct[];
}

export interface IProfileShopProps {
  seller: IAPIProfileShopResponse;
}

export interface ICheckoutPromotions {
  id: number;
  name: string;
  min_purchase_amount: string;
  max_purchase_amount: string;
  discount_amount: string;
}

export interface ICheckoutMarketplace {
  id: number;
  name: string;
  min_purchase_amount: string;
  max_purchase_amount: string;
  discount_amount: string;
}

export interface ISellerPromotion {
  data: ISellerPromotionData[];
  pagination: {
    total_page: number;
    total_item: number;
    current_page: number;
    limit: number;
  };
}

export interface ISellerPromotionData {
  id: number;
  name: string;
  quota: number;
  total_used: number;
  start_date: string;
  end_date: string;
  min_purchase_amount: string;
  max_purchase_amount: string;
  discount_amount: string;
}

export interface ISellerOrderHistory {
  data: ISellerOrderHistoryData[];
  pagination: {
    total_page: number;
    total_item: number;
    current_page: number;
    limit: number;
  };
}

export interface ISellerOrderHistoryData {
  order_id: number;
  buyer_name: string;
  status: string;
  products: ISellerOrderHistoryProducts[];
  promotion: ITransactionHistoryPromotions;
  delivery_fee: string;
  courier_name: string;
  shipping: ISellerOrderBuyerAddress;
  total_payment: string;
  created_at: string;
  is_withdrawn: boolean;
}

export interface ISellerOrderBuyerAddress {
  province: string;
  district: string;
  zip_code: string;
  sub_district: string;
  kelurahan: string;
  detail: string;
}

export interface ISellerOrderHistoryProducts {
  product_id: number;
  product_order_detail_id: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  individual_price: string;
  review: ISellerOrderHistoryReview;
  is_reviewed: boolean;
}

export interface ISellerOrderHistoryReview {
  review_id: number;
  review_feedback: string;
  review_rating: number;
  review_image_url: string;
  created_at: string;
}

export interface ITransactionHistoryPromotions {
  marketplace_voucher: string;
  shop_voucher: string;
}

export interface ISellerEditProduct {
  id: number;
  product_name: string;
  description: string;
  hazardous_material: boolean;
  is_new: boolean;
  internal_sku: string;
  weight: string;
  size: string;
  is_active: boolean;
  video_url: string;
  category: ICategory;
  images: string[];
  variant_options: [];
  variants: [
    {
      variant_id: 1000;
      image_url: "";
      selections: [
        {
          selection_variant_name: "default_reserved_keyword";
          selection_name: "default_reserved_keyword";
        }
      ];
      stock: 3213;
      price: "2131231";
    }
  ];
}
