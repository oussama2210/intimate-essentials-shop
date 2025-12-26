import { useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, MapPin, Phone, ArrowRight } from "lucide-react";
import { Order } from "@/types/order";

const OrderSuccess = () => {
    const location = useLocation();
    const order = location.state?.order as Order;

    if (!order) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-24 text-center">
                    <h1 className="text-2xl font-bold mb-4">الطلب غير موجود</h1>
                    <Link to="/products">
                        <Button variant="gold">العودة للمنتجات</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Success Icon */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="text-gradient-gold">تم إنشاء الطلب بنجاح!</span>
                        </h1>
                        <p className="text-muted-foreground">
                            شكراً لك! تم استلام طلبك وسيتم معالجته قريباً
                        </p>
                    </div>

                    {/* Order Details Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                تفاصيل الطلب
                            </CardTitle>
                            <CardDescription>
                                يمكنك تتبع طلبك باستخدام رقم التتبع أدناه
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Tracking Number */}
                            <div className="bg-secondary/50 rounded-lg p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">رقم التتبع</p>
                                <p className="text-2xl font-bold text-gradient-gold font-mono">
                                    {order.trackingNumber}
                                </p>
                            </div>

                            {/* Order Info */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">المجموع الكلي</p>
                                    <p className="text-xl font-bold">
                                        {parseFloat(order.totalAmount.toString()) + parseFloat(order.deliveryCost.toString())} ر.س
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">حالة الطلب</p>
                                    <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-sm font-medium">
                                        قيد الانتظار
                                    </span>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="space-y-3 pt-4 border-t border-border">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium mb-1">عنوان التوصيل</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.deliveryAddress}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium mb-1">معلومات الاتصال</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.customerName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.customerPhone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-2 pt-4 border-t border-border">
                                <p className="font-medium mb-3">المنتجات المطلوبة</p>
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">
                                            {item.productName} × {item.quantity}
                                        </span>
                                        <span className="font-medium">
                                            {parseFloat(item.totalPrice.toString())} ر.س
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="mb-6 bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <h3 className="font-bold mb-2">ماذا بعد؟</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>سيتم مراجعة طلبك وتأكيده من قبل فريقنا</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>سنتصل بك للتأكيد وترتيب موعد التوصيل</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>يمكنك تتبع حالة طلبك باستخدام رقم التتبع</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>الدفع عند الاستلام - لا حاجة لدفع أي شيء الآن</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to="/products" className="flex-1">
                            <Button variant="gold" size="lg" className="w-full">
                                متابعة التسوق
                            </Button>
                        </Link>
                        <Link to="/" className="flex-1">
                            <Button variant="outline" size="lg" className="w-full">
                                العودة للرئيسية
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderSuccess;
