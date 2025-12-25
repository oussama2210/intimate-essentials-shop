import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import { Truck, Shield, Clock, Headphones } from "lucide-react";

const Index = () => {
  const features = [
    { icon: Truck, title: "شحن مجاني", desc: "للطلبات فوق 200 ر.س" },
    { icon: Shield, title: "ضمان الجودة", desc: "منتجات أصلية 100%" },
    { icon: Clock, title: "توصيل سريع", desc: "خلال 24-48 ساعة" },
    { icon: Headphones, title: "دعم متواصل", desc: "خدمة عملاء 24/7" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <HeroSection />
        
        {/* Features */}
        <section className="py-16 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="text-center group">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FeaturedProducts />

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              هل أنت مستعد لتجربة <span className="text-gradient-gold">الفرق</span>؟
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              انضم إلى آلاف العملاء الراضين واكتشف منتجاتنا الفاخرة
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                <span className="font-bold text-gradient-gold">سيال</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 سيال. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
