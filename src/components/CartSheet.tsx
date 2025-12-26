import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Link } from "react-router-dom";

const CartSheet = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">سلة التسوق فارغة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-4 border-b border-border">
        <SheetTitle className="text-right">سلة التسوق</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-auto py-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 rounded-lg bg-secondary/50 animate-fade-in"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.name}</h4>
              <p className="text-primary font-bold">{item.price} دج</p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => removeFromCart(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">المجموع</span>
          <span className="text-2xl font-bold text-gradient-gold">{totalPrice} دج</span>
        </div>
        <SheetClose asChild>
          <Link to="/checkout" className="block">
            <Button variant="gold" size="lg" className="w-full">
              إتمام الشراء
            </Button>
          </Link>
        </SheetClose>
        <Button variant="outline" size="sm" className="w-full" onClick={clearCart}>
          إفراغ السلة
        </Button>
      </div>
    </div>
  );
};

export default CartSheet;
