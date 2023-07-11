export type Product = {
  _id?: string;
  product_id?: string;
  store?: Store;
  createdAt?: Date;
  meta?: Meta;
  title?: string;
  updatedAt?: Date;
  variants?: ProductVariant[];
  __v?: number;
  active_media?: any[];
  media?: Media[];
  story?: Story;
  apiLoadTime: number;
  price: string;
};

export type Media = {
  _id: string;
  variant: any[];
  downloadUrl: string;
  status: string;
  enabled: boolean;
  thumbnailUrl: string;
  thumbnailPath: string;
  thumbnailUploadUrl: string;
  populate_disabled: boolean;
  title: string;
  product: string;
  uploadSignedUrl: string;
  path: string;
  name: string;
  type: string;
  use_case: string;
  story: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  __v: number;
  gif: Gif;
};

export interface Gif {
  downloadUrl: string;
  _id: string;
  uploadSignedUrl: string;
  path: string;
  name: string;
}

export type Meta = {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: Date;
  handle: string;
  updated_at: Date;
  published_at: Date;
  template_suffix: string;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: MetaVariant[];
  options: Option[];
  images: Image[];
  image: Image;
};

export type Image = {
  product_id: number;
  id: number;
  position: number;
  created_at: Date;
  updated_at: Date;
  alt: null;
  width: number;
  height: number;
  src: string;
  variant_ids: any[];
  admin_graphql_api_id: string;
};

export type Option = {
  product_id: number;
  id: number;
  name: string;
  position: number;
  values: string[];
};

export type MetaVariant = {
  product_id: number;
  id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string;
  fulfillment_service: string;
  inventory_management: null;
  option1: string;
  option2: null;
  option3: null;
  created_at: Date;
  updated_at: Date;
  taxable: boolean;
  barcode: string;
  grams: number;
  image_id: null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
};

export type Store = {
  _id: string;
  ga_stream_id: string;
  cta: ButtonProps;
  buyNow_cta: ButtonProps;
  addToCart_cta: ButtonProps;
  navigation_props: NavigationProps;
  showOverlay: boolean;
  mixpanel_stream_id: string;
  title_props: TitleProps;
  logo: LogoProps;
};

export type ButtonProps = {
  background?: string;
  fontSize?: number;
  color?: string;
  title?: string;
  action?: string;
  cssClass?: string;
  borderRadius?: number;
  cta?: string;
};

export type NavigationProps = {
  background?: string;
  _id: string;
  iconColor: string;
};

export type TitleProps = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  color: string;
};

export type LogoProps = {
  downloadUrl: string;
  name: string;
  path: number;
  status: string;
  uploadSignedUrl: string;
};

export type Story = {
  _id: string;
  status: string;
  variants: any[];
  media: string[];
  name: string;
  description: string;
  store: string;
  product: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

export type ProductVariant = {
  _id: string;
  variant_id: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
};
