export type Category = 'Tous' | 'Femme' | 'Homme' | 'Enfant' | 'Accessoires' | 'Premium';

export type ClothesState = 'Comme neuf' | 'Très bon état' | 'Bon état' | 'Satisfaisant';

export interface Product {
  id: string;
  title: string;
  price: number; // in XOF / FCFA
  originalPrice?: number; // for comparison
  description: string;
  category: Exclude<Category, 'Tous'>;
  size: string;
  brand?: string;
  state: ClothesState;
  images: string[];
  sellerName: string;
  sellerPhone: string;
  sellerCity: string;
  createdAt: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'wave' | 'orange' | 'mtn' | 'moov' | 'cod';

export type DeliveryZone = {
  name: string;
  price: number; // standard delivery fare in FCFA
  time: string;
};

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryZone: string;
  deliveryAddress: string;
  items: {
    productId: string;
    title: string;
    price: number;
    image: string;
  }[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
  phoneNumberPayment: string;
  status: 'pending' | 'paid' | 'delivered';
  createdAt: string;
  deliveryInstruction?: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'seller' | 'client' | 'admin';
  city?: string; // for sellers
  commune?: string; // for clients (e.g. Cocody, Marcory, Yopougon, etc.)
  address?: string; // for clients (delivery address)
  createdAt: string;
}

