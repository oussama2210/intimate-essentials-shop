import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { locationService } from "@/services/locationService";
import { orderService } from "@/services/orderService";
import { Product } from "@/types/product";
import { Wilaya, Baladiya } from "@/types/location";
import { CheckoutFormData, PaymentMethod } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";

interface QuickOrderFormProps {
    product: Product;
    quantity: number;
}

const QuickOrderForm = ({ product, quantity }: QuickOrderFormProps) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [baladiyas, setBaladiyas] = useState<Baladiya[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);

    // Local state for form inputs
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [wilayaId, setWilayaId] = useState<number>(0);
    const [baladiyaId, setBaladiyaId] = useState<number>(0);
    const [address, setAddress] = useState("");
    const [deliveryType, setDeliveryType] = useState<'HOME' | 'STOP_DESK'>('HOME');

    const [deliveryCost, setDeliveryCost] = useState(0);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await locationService.getWilayas();
                if (response.success && response.data) {
                    setWilayas(response.data);
                }
            } catch (error) {
                toast.error("فشل تحميل قائمة الولايات");
            } finally {
                setIsLoadingLocations(false);
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        const calculateCost = async () => {
            if (!wilayaId) return;
            try {
                const response = await locationService.calculateDeliveryCost({
                    wilayaId,
                    totalAmount: product.price * quantity,
                    deliveryType
                });
                if (response.success && response.data) {
                    setDeliveryCost(response.data.deliveryCost);
                }
            } catch (error) {
                console.error("Failed to calculate delivery cost");
            }
        };
        calculateCost();
    }, [wilayaId, deliveryType, quantity, product.price]);

    const handleWilayaChange = async (wilayaIdStr: string) => {
        const id = parseInt(wilayaIdStr);
        setWilayaId(id);
        setBaladiyaId(0);

        // Fetch baladiyas
        try {
            const response = await locationService.getBaladiyaByWilaya(id);
            if (response.success && response.data) {
                setBaladiyas(response.data.baladiya);
            }
        } catch (error) {
            console.error("Failed to fetch baladiyas");
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerName || !customerPhone || !wilayaId || !baladiyaId || !address) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        setIsSubmitting(true);
        try {
            // Create single item order
            const orderData = {
                customerName,
                customerPhone,
                customerEmail: "",
                wilayaId,
                baladiyaId,
                deliveryAddress: address,
                notes: "",
                paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
                items: [
                    {
                        productId: product.id,
                        quantity: quantity,
                    },
                ],
            };

            const response = await orderService.createOrder(orderData);

            if (response.success && response.data) {
                toast.success("تم تأكيد طلبك بنجاح!");
                navigate("/order-success", {
                    state: {
                        order: response.data,
                        isDirectOrder: true
                    }
                });
            } else {
                toast.error("فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.");
            }
        } catch (error) {
            console.error("Order error:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalAmount = (product.price * quantity) + deliveryCost;

    return (
        <div className="bg-card border border-border rounded-xl p-6 mt-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 text-primary">
                <Truck className="w-5 h-5" />
                <h3 className="font-bold text-lg">طلب سريع (بدون تسجيل)</h3>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quick-name">الاسم الكامل *</Label>
                        <Input
                            id="quick-name"
                            placeholder="الاسم واللقب"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quick-phone">رقم الهاتف *</Label>
                        <Input
                            id="quick-phone"
                            placeholder="05XXXXXXXX"
                            type="tel"
                            dir="ltr"
                            className="text-right"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>الولاية *</Label>
                        <Select onValueChange={handleWilayaChange} disabled={isLoadingLocations}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الولاية" />
                            </SelectTrigger>
                            <SelectContent>
                                {wilayas.map((w) => (
                                    <SelectItem key={w.id} value={w.id.toString()}>
                                        {w.id} - {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>البلدية *</Label>
                        <Select
                            disabled={!wilayaId || baladiyas.length === 0}
                            onValueChange={(val) => setBaladiyaId(parseInt(val))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر البلدية" />
                            </SelectTrigger>
                            <SelectContent>
                                {baladiyas.map((b) => (
                                    <SelectItem key={b.id} value={b.id.toString()}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Delivery Type Selection */}
                <div className="space-y-3 pt-2">
                    <Label>نوع التوصيل *</Label>
                    <RadioGroup
                        value={deliveryType}
                        onValueChange={(val: 'HOME' | 'STOP_DESK') => setDeliveryType(val)}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className={`flex items-center justify-between space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer transition-all ${deliveryType === 'HOME' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="HOME" id="r-home" />
                                <Label htmlFor="r-home" className="cursor-pointer">توصيل للمنزل</Label>
                            </div>
                        </div>
                        <div className={`flex items-center justify-between space-x-2 space-x-reverse border rounded-lg p-3 cursor-pointer transition-all ${deliveryType === 'STOP_DESK' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="STOP_DESK" id="r-desk" />
                                <Label htmlFor="r-desk" className="cursor-pointer">توصيل للمكتب</Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quick-address">العنوان التفصيلي *</Label>
                    <Textarea
                        id="quick-address"
                        placeholder="الحي، رقم المنزل، تفاصيل التوصيل..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="h-20"
                    />
                </div>

                {/* Summary Footer */}
                <div className="pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center mb-4 text-sm">
                        <span>التوصيل:</span>
                        <span className="font-bold text-primary">
                            {deliveryCost > 0 ? `${deliveryCost} دج` : "يتم الحساب عند اختيار الولاية"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-lg font-bold">
                        <span>الإجمالي:</span>
                        <span className="text-gradient-gold">{totalAmount} دج</span>
                    </div>

                    <Button
                        type="submit"
                        variant="gold"
                        size="lg"
                        className="w-full font-bold text-lg h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                جارٍ تأكيد الطلب...
                            </>
                        ) : (
                            "شراء الآن - الدفع عند الاستلام"
                        )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-2">
                        توصيل سريع لجميع الولايات (58 ولاية) - الدفع بعد الاستلام
                    </p>
                </div>
            </form>
        </div>
    );
};

export default QuickOrderForm;
