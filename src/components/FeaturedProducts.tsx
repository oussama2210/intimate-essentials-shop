import { useProducts } from "@/context/ProductContext";
import ProductCard from "@/components/ProductCard";

const FeaturedProducts = () => {
  const { products } = useProducts();
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-gold">المنتجات المميزة</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            اختيارات مميزة من أفضل المكملات الغذائية لدينا
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
