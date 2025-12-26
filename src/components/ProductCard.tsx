import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block animate-fade-in"
    >
      <div className="relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        {/* Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}
        {product.featured && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-gold text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
            مميز
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-1 text-primary">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-muted-foreground text-xs">({product.reviews})</span>
          </div>

          <div>
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">{product.price}</span>
              <span className="text-sm text-muted-foreground">ر.س</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="gold"
            size="sm"
            className="w-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          >
            <ShoppingCart className="w-4 h-4 ml-2" />
            اطلب الآن
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
