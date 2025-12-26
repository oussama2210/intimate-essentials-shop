import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { orderService } from "@/services/orderService";
import { locationService } from "@/services/locationService";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ShoppingBag, MapPin, User, Phone, Mail, Package } from "lucide-react";
import { PaymentMethod } from "@/types/order";

interface Wilaya {
    id: number;
    name: string;
    deliveryBaseCost: number;
}

interface Baladiya {
    id: number;
    name: string;
    wilayaId: number;
}

const Checkout = () => {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [baladiya, setBaladiya] = useState<Baladiya[]>([]);
    const [isLoadingWilayas, setIsLoadingWilayas] = useState(true);
    const [isLoadingBaladiya, setIsLoadingBaladiya] = useState(false);
    const [deliveryCost, setDeliveryCost] = useState(0);

    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        wilayaId: "",
        baladiyaId: "",
        deliveryAddress: "",
        notes: "",
    });

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            toast.error("سلة التسوق فارغة");
            navigate("/products");
        }
    }, [items, navigate]);

    // Fetch wilayas on mount
    useEffect(() => {
        const fetchWilayas = async () => {
            setIsLoadingWilayas(true);
            try {
                const response = await locationService.getWilayas();
                if (response.success && response.data) {
                    setWilayas(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch wilayas:", error);
                toast.error("فشل في تحميل الولايات");
            } finally {
                setIsLoadingWilayas(false);
            }
        };
        fetchWilayas();
    }, []);

    // Fetch baladiya when wilaya changes
    useEffect(() => {
        if (formData.wilayaId) {
            const fetchBaladiya = async () => {
                setIsLoadingBaladiya(true);
                try {
                    const response = await locationService.getBaladiyaByWilaya(parseInt(formData.wilayaId));
                    if (response.success && response.data?.baladiya) {
                        setBaladiya(response.data.baladiya);
                    }

                    // Set delivery cost
                    const selectedWilaya = wilayas.find(w => w.id === parseInt(formData.wilayaId));
                    if (selectedWilaya) {
                        setDeliveryCost(parseFloat(selectedWilaya.deliveryBaseCost.toString()));
                    }
                } catch (error) {
                    console.error("Failed to fetch baladiya:", error);
                    toast.error("فشل في تحميل البلديات");
                } finally {
                    setIsLoadingBaladiya(false);
                }
            };
            fetchBaladiya();
            // Reset baladiya selection when wilaya changes
            setFormData(prev => ({ ...prev, baladiyaId: "" }));
        }
    }, [formData.wilayaId, wilayas]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const orderData = {
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                customerEmail: formData.customerEmail || undefined,
                wilayaId: parseInt(formData.wilayaId),
                baladiyaId: parseInt(formData.baladiyaId),
                deliveryAddress: formData.deliveryAddress,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
                paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
            };

            const response = await orderService.createOrder(orderData);

            if (response.success && response.data) {
                toast.success("تم إنشاء الطلب بنجاح!");
                clearCart();

                // Navigate to success page with order details
                const order = Array.isArray(response.data) ? response.data[0] : response.data;
                navigate(`/order-success`, { state: { order } });
            } else {
                toast.error(response.error?.message || "فشل في إنشاء الطلب");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("حدث خطأ أثناء معالجة الطلب");
        } finally {
            setIsSubmitting(false);
        }
    };

    const finalTotal = totalPrice + deliveryCost;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                        <span className="text-gradient-gold">إتمام الطلب</span>
                    </h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Customer Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" />
                                            معلومات العميل
                                        </CardTitle>
                                        <CardDescription>أدخل بياناتك لإتمام الطلب</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="customerName">الاسم الكامل *</Label>
                                            <Input
                                                id="customerName"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                placeholder="أحمد علي"
                                                required
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customerPhone">رقم الهاتف *</Label>
                                                <div className="relative">
                                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="customerPhone"
                                                        value={formData.customerPhone}
                                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                        placeholder="0555123456"
                                                        className="pr-10"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="customerEmail">البريد الإلكتروني (اختياري)</Label>
                                                <div className="relative">
                                                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="customerEmail"
                                                        type="email"
                                                        value={formData.customerEmail}
                                                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                                        placeholder="ahmed@example.com"
                                                        className="pr-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Shipping Address */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            عنوان التوصيل
                                        </CardTitle>
                                        <CardDescription>حدد موقع التوصيل</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="wilaya">الولاية *</Label>
                                                <Select
                                                    value={formData.wilayaId}
                                                    onValueChange={(value) => setFormData({ ...formData, wilayaId: value })}
                                                    disabled={isLoadingWilayas}
                                                >
                                                    <SelectTrigger id="wilaya">
                                                        <SelectValue placeholder={isLoadingWilayas ? "جارٍ التحميل..." : "اختر الولاية"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {wilayas.map((wilaya) => (
                                                            <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                                                                {wilaya.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="baladiya">البلدية *</Label>
                                                <Select
                                                    value={formData.baladiyaId}
                                                    onValueChange={(value) => setFormData({ ...formData, baladiyaId: value })}
                                                    disabled={!formData.wilayaId || isLoadingBaladiya}
                                                >
                                                    <SelectTrigger id="baladiya">
                                                        <SelectValue placeholder={isLoadingBaladiya ? "جارٍ التحميل..." : "اختر البلدية"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {baladiya.map((b) => (
                                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                                {b.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="deliveryAddress">العنوان التفصيلي *</Label>
                                            <Textarea
                                                id="deliveryAddress"
                                                value={formData.deliveryAddress}
                                                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                                placeholder="الشارع، رقم المنزل، معالم قريبة..."
                                                rows={3}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="أي ملاحظات خاصة بالطلب..."
                                                rows={2}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Button
                                    type="submit"
                                    variant="gold"
                                    size="lg"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            جارٍ إتمام الطلب...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="w-5 h-5" />
                                            تأكيد الطلب
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary" />
                                        ملخص الطلب
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Cart Items */}
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex gap-3">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        الكمية: {item.quantity} × {item.price} دج
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator />

                                    {/* Price Breakdown */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">المجموع الفرعي</span>
                                            <span className="font-medium">{totalPrice} دج</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">تكلفة التوصيل</span>
                                            <span className="font-medium">
                                                {deliveryCost > 0 ? `${deliveryCost} دج` : "---"}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">المجموع الكلي</span>
                                            <span className="text-2xl font-bold text-gradient-gold">
                                                {finalTotal} دج
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="bg-secondary/50 rounded-lg p-4">
                                        <p className="text-sm font-medium mb-1">طريقة الدفع</p>
                                        <p className="text-sm text-muted-foreground">الدفع عند الاستلام</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
