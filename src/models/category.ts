export interface Category {
  href: string;
  icons: Array<{
    height: number | null;
    url: string;
    width: number | null;
  }>;
  id: string;
  name: string;
}

export interface GetCategoriesResponse {
  categories: {
    href: string;
    items: Category[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}