import { Product } from "@/types/product";

export const initialProducts: Product[] = [
  {
    id: "1",
    name: "فيتاماكس بلس",
    nameEn: "VitaMax Plus",
    description: "مكمل غذائي طبيعي 100% لتعزيز الطاقة والحيوية. يحتوي على مزيج فريد من الأعشاب الطبيعية والفيتامينات.",
    price: 299,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
    category: "طاقة",
    stock: 50,
    featured: true,
    rating: 4.8,
    reviews: 124
  },
  {
    id: "2",
    name: "باور ماكس",
    nameEn: "Power Max",
    description: "تركيبة متقدمة لتحسين الأداء البدني والذهني. مستخلصات طبيعية آمنة وفعالة.",
    price: 349,
    originalPrice: 449,
    image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop",
    category: "قوة",
    stock: 35,
    featured: true,
    rating: 4.9,
    reviews: 89
  },
  {
    id: "3",
    name: "انيرجي بوست",
    nameEn: "Energy Boost",
    description: "مكمل سريع المفعول لزيادة النشاط والتركيز. مثالي للرياضيين والنشيطين.",
    price: 199,
    image: "https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=400&h=400&fit=crop",
    category: "طاقة",
    stock: 100,
    featured: false,
    rating: 4.5,
    reviews: 56
  },
  {
    id: "4",
    name: "ستامينا برو",
    nameEn: "Stamina Pro",
    description: "للتحمل والقدرة على الأداء لفترات أطول. تركيبة مدروسة علمياً.",
    price: 399,
    originalPrice: 499,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
    category: "تحمل",
    stock: 25,
    featured: true,
    rating: 4.7,
    reviews: 203
  },
  {
    id: "5",
    name: "نايت كينج",
    nameEn: "Night King",
    description: "مكمل ليلي فاخر للراحة والاسترخاء. يساعد على النوم العميق والتجدد.",
    price: 449,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
    category: "استرخاء",
    stock: 40,
    featured: false,
    rating: 4.6,
    reviews: 78
  },
  {
    id: "6",
    name: "فيريليتي فورمولا",
    nameEn: "Virility Formula",
    description: "تركيبة شاملة لصحة الرجل. فيتامينات ومعادن أساسية مع أعشاب طبيعية.",
    price: 549,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop",
    category: "صحة",
    stock: 60,
    featured: true,
    rating: 4.9,
    reviews: 312
  }
];
