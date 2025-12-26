import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types/product";
import { productService } from "@/services/productService";
import { toast } from "sonner";

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts();
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Refresh products error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const response = await productService.createProduct(product);
      if (response.success) {
        await refreshProducts();
        toast.success('Product added successfully');
      } else {
        toast.error(response.error?.message || 'Failed to add product');
        throw new Error(response.error?.message);
      }
    } catch (err) {
      console.error('Add product error:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const response = await productService.updateProduct(id, updates);
      if (response.success) {
        await refreshProducts();
        toast.success('Product updated successfully');
      } else {
        toast.error(response.error?.message || 'Failed to update product');
        throw new Error(response.error?.message);
      }
    } catch (err) {
      console.error('Update product error:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        await refreshProducts();
        toast.success('Product deleted successfully');
      } else {
        toast.error(response.error?.message || 'Failed to delete product');
        throw new Error(response.error?.message);
      }
    } catch (err) {
      console.error('Delete product error:', err);
      throw err;
    }
  };

  const getProduct = (id: string) => {
    return products.find((product) => product.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        refreshProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
