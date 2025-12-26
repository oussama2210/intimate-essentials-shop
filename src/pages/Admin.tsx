import { useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, ArrowRight, Package } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { uploadService } from "@/services/uploadService";

const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    category: "",
    stock: "",
    featured: false,
    rating: "4.5",
    reviews: "0",
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await uploadService.uploadImage(file);
      if (response.success && response.data) {
        // Construct full URL with API base if needed, or use relative if proxy handles it.
        // For local dev, we need full URL often if ports differ.
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        // Check if url already has http (cloud storage) or is relative
        const url = response.data.url.startsWith('http')
          ? response.data.url
          : `${apiUrl}${response.data.url}`;

        setFormData(prev => ({ ...prev, image: url }));
        toast.success("تم رفع الصورة بنجاح");
      } else {
        toast.error("فشل رفع الصورة");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameEn: "",
      description: "",
      price: "",
      originalPrice: "",
      image: "",
      category: "",
      stock: "",
      featured: false,
      rating: "4.5",
      reviews: "0",
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameEn: product.nameEn,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      image: product.image,
      category: product.category,
      stock: product.stock.toString(),
      featured: product.featured,
      rating: product.rating.toString(),
      reviews: product.reviews.toString(),
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        nameEn: formData.nameEn,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        image: formData.image,
        category: formData.category,
        stock: parseInt(formData.stock),
        featured: formData.featured,
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">SB</span>
                </div>
                <span className="font-bold text-gradient-gold">Sarah Boutique</span>
              </Link>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">لوحة التحكم</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/orders">
                <Button variant="outline" size="sm">
                  إدارة الطلبات
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm">
                  العودة للمتجر
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "إجمالي المنتجات", value: products.length, icon: Package },
            { label: "المنتجات المميزة", value: products.filter(p => p.featured).length, icon: Package },
            { label: "إجمالي المخزون", value: products.reduce((sum, p) => sum + p.stock, 0), icon: Package },
            { label: "متوسط السعر", value: `${Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)} دج`, icon: Package },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold">إدارة المنتجات</h2>
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button variant="gold">
                  <Plus className="w-4 h-4" />
                  إضافة منتج
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم بالعربية</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                      <Input
                        id="nameEn"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">السعر</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">السعر الأصلي (اختياري)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">صورة المنتج</Label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="cursor-pointer"
                        />
                        <Input
                          id="image"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="أو أدخل رابط الصورة مباشرة"
                          disabled={isUploading}
                        />
                      </div>
                      {formData.image && (
                        <div className="w-20 h-20 rounded-lg border border-border overflow-hidden relative group">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    {isUploading && <p className="text-sm text-muted-foreground animate-pulse">جارٍ رفع الصورة...</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">الفئة</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">المخزون</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">منتج مميز</Label>
                  </div>
                  <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "جارٍ الحفظ..." : (editingProduct ? "تحديث المنتج" : "إضافة المنتج")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">المخزون</TableHead>
                  <TableHead className="text-right">مميز</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.nameEn}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">{product.price} دج</span>
                    </TableCell>
                    <TableCell>
                      <span className={product.stock > 10 ? "text-green-500" : "text-destructive"}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.featured ? (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                          مميز
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
