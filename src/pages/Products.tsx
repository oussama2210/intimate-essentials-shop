import { useProducts } from "@/context/ProductContext";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Products = () => {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(products.map((p) => p.category))];
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient-gold">جميع المنتجات</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              اكتشف مجموعتنا الكاملة من المكملات الغذائية الفاخرة
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Button
              variant={selectedCategory === null ? "gold" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              الكل
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "gold" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">لا توجد منتجات في هذه الفئة</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Products;
