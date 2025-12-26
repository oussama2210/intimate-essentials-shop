import { useParams, Link } from "react-router-dom";
import QuickOrderForm from "@/components/QuickOrderForm";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, ArrowRight, Minus, Plus, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const { getProduct, products } = useProducts();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = getProduct(id || "");

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
          <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
            العودة للمنتجات
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`تمت إضافة ${quantity} من ${product.name} إلى السلة`);
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              الرئيسية
            </Link>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/products" className="text-muted-foreground hover:text-primary">
              المنتجات
            </Link>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Product */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Image */}
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-secondary">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground font-bold px-4 py-2 rounded-full">
                  خصم {discount}%
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-primary font-medium mb-2">{product.category}</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-muted-foreground">{product.nameEn}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating)
                        ? "text-primary fill-primary"
                        : "text-muted-foreground"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  ({product.reviews} تقييم)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gradient-gold">{product.price}</span>
                <span className="text-xl text-muted-foreground">ر.س</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.originalPrice} ر.س
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Features */}
              <div className="space-y-3">
                {["منتج طبيعي 100%", "آمن وفعال", "نتائج مضمونة"].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Stock */}
              <p className={`font-medium ${product.stock > 0 ? "text-green-500" : "text-destructive"}`}>
                {product.stock > 0 ? `متوفر (${product.stock} قطعة)` : "غير متوفر"}
              </p>

              {/* Actions */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex gap-4">
                  <div className="flex items-center gap-3 bg-secondary rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 text-lg font-bold border-2"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-5 h-5 ml-2" />
                    أضف للسلة
                  </Button>
                </div>

                {/* Direct Order Form */}
                <QuickOrderForm product={product} quantity={quantity} />
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-8">منتجات مشابهة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
