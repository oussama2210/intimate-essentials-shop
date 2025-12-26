import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus } from "@/types/order";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Package, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const statusColors = {
    PENDING: "bg-yellow-500/20 text-yellow-600",
    CONFIRMED: "bg-blue-500/20 text-blue-600",
    SHIPPED: "bg-purple-500/20 text-purple-600",
    DELIVERED: "bg-green-500/20 text-green-600",
    CANCELLED: "bg-red-500/20 text-red-600",
};

const statusLabels = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكد",
    SHIPPED: "قيد الشحن",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغى",
};

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await orderService.getOrders();
            if (response.success && Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                toast.error("فشل في تحميل الطلبات");
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
            toast.error("حدث خطأ أثناء تحميل الطلبات");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingOrderId(orderId);
        try {
            const response = await orderService.updateOrderStatus(orderId, newStatus);
            if (response.success) {
                toast.success("تم تحديث حالة الطلب");
                fetchOrders(); // Refresh orders
            } else {
                toast.error("فشل في تحديث حالة الطلب");
            }
        } catch (error) {
            console.error("Update status error:", error);
            toast.error("حدث خطأ أثناء تحديث الحالة");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/admin" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold">S</span>
                                </div>
                                <span className="font-bold text-gradient-gold">سيال</span>
                            </Link>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">إدارة الطلبات</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchOrders}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                تحديث
                            </Button>
                            <Link to="/admin">
                                <Button variant="outline" size="sm">
                                    العودة لإدارة المنتجات
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: "إجمالي الطلبات", value: orders.length, status: null },
                        { label: "قيد الانتظار", value: orders.filter(o => o.status === "PENDING").length, status: "PENDING" },
                        { label: "مؤكدة", value: orders.filter(o => o.status === "CONFIRMED").length, status: "CONFIRMED" },
                        { label: "قيد الشحن", value: orders.filter(o => o.status === "SHIPPED").length, status: "SHIPPED" },
                        { label: "تم التوصيل", value: orders.filter(o => o.status === "DELIVERED").length, status: "DELIVERED" },
                    ].map((stat, i) => (
                        <Card key={i} className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </Card>
                    ))}
                </div>

                {/* Orders Table */}
                <Card>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-xl font-bold">جميع الطلبات</h2>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">رقم التتبع</TableHead>
                                        <TableHead className="text-right">العميل</TableHead>
                                        <TableHead className="text-right">الهاتف</TableHead>
                                        <TableHead className="text-right">الولاية</TableHead>
                                        <TableHead className="text-right">البلدية</TableHead>
                                        <TableHead className="text-right">المبلغ</TableHead>
                                        <TableHead className="text-right">الحالة</TableHead>
                                        <TableHead className="text-right">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <span className="font-mono text-sm">{order.trackingNumber}</span>
                                            </TableCell>
                                            <TableCell>
                                                {order.user ? `${order.user.firstName} ${order.user.lastName}` : (order.customerName || order.userId)}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm" dir="ltr">
                                                {order.user?.phone || order.customerPhone}
                                            </TableCell>
                                            <TableCell>
                                                {order.wilaya?.name || order.wilayaName || order.wilayaId}
                                            </TableCell>
                                            <TableCell>
                                                {order.baladiya?.name || order.baladiyaName || order.baladiyaId}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-primary">
                                                    {(parseFloat(order.totalAmount.toString()) + parseFloat(order.deliveryCost.toString())).toFixed(2)} دج
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[order.status as OrderStatus]}>
                                                    {statusLabels[order.status as OrderStatus]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) => handleStatusUpdate(order.id, value as OrderStatus)}
                                                    disabled={updatingOrderId === order.id}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                                                        <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                                                        <SelectItem value="SHIPPED">قيد الشحن</SelectItem>
                                                        <SelectItem value="DELIVERED">تم التوصيل</SelectItem>
                                                        <SelectItem value="CANCELLED">ملغى</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
};

export default AdminOrders;
