export const categories = [
  { name: "Dental Instruments", ar: "أدوات الأسنان", icon: "◌", tone: "mint" },
  { name: "Restorative Materials", ar: "مواد الترميم", icon: "✦", tone: "blue" },
  { name: "Endodontics", ar: "علاج الجذور", icon: "⌁", tone: "violet" },
  { name: "Prosthodontics", ar: "التركيبات", icon: "◇", tone: "sand" },
  { name: "Dental Burs", ar: "مبارد الأسنان", icon: "✧", tone: "rose" },
  { name: "Student Kits", ar: "حقائب الطلاب", icon: "▣", tone: "mint" },
];

export const courses = [
  { name: "Operative Dentistry", ar: "العلاج التحفظي", code: "OPERATIVE", blurb: "Isolation, composite & finishing essentials" },
  { name: "Endodontics", ar: "علاج الجذور", code: "ENDO", blurb: "Files, irrigation & obturation essentials" },
  { name: "Fixed Prosthodontics", ar: "التركيبات الثابتة", code: "FIXED", blurb: "Preparation, impression & temporization" },
  { name: "Removable Prosthodontics", ar: "التركيبات المتحركة", code: "REMOVABLE", blurb: "Wax, acrylic & model work essentials" },
];

export const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

export type DeliveryLocation = {
  id: string;
  name: string;
  ar: string;
  kind: "governorate" | "university";
  fee?: number;
  short?: string;
};

export const deliveryLocations: DeliveryLocation[] = [
  { id: "aiu", name: "Alamein International University", ar: "جامعة العلمين الدولية", kind: "university", fee: 75, short: "AIU" },
  { id: "alexandria", name: "Alexandria", ar: "الإسكندرية", kind: "governorate" },
  { id: "aswan", name: "Aswan", ar: "أسوان", kind: "governorate" },
  { id: "asyut", name: "Asyut", ar: "أسيوط", kind: "governorate" },
  { id: "beheira", name: "Beheira", ar: "البحيرة", kind: "governorate" },
  { id: "beni-suef", name: "Beni Suef", ar: "بني سويف", kind: "governorate" },
  { id: "cairo", name: "Cairo", ar: "القاهرة", kind: "governorate" },
  { id: "dakahlia", name: "Dakahlia", ar: "الدقهلية", kind: "governorate" },
  { id: "damietta", name: "Damietta", ar: "دمياط", kind: "governorate" },
  { id: "faiyum", name: "Faiyum", ar: "الفيوم", kind: "governorate" },
  { id: "gharbia", name: "Gharbia", ar: "الغربية", kind: "governorate" },
  { id: "giza", name: "Giza", ar: "الجيزة", kind: "governorate" },
  { id: "ismailia", name: "Ismailia", ar: "الإسماعيلية", kind: "governorate" },
  { id: "kafr-el-sheikh", name: "Kafr El Sheikh", ar: "كفر الشيخ", kind: "governorate" },
  { id: "luxor", name: "Luxor", ar: "الأقصر", kind: "governorate" },
  { id: "matrouh", name: "Matrouh", ar: "مطروح", kind: "governorate" },
  { id: "minya", name: "Minya", ar: "المنيا", kind: "governorate" },
  { id: "monufia", name: "Monufia", ar: "المنوفية", kind: "governorate" },
  { id: "new-valley", name: "New Valley", ar: "الوادي الجديد", kind: "governorate" },
  { id: "north-sinai", name: "North Sinai", ar: "شمال سيناء", kind: "governorate" },
  { id: "port-said", name: "Port Said", ar: "بورسعيد", kind: "governorate" },
  { id: "qalyubia", name: "Qalyubia", ar: "القليوبية", kind: "governorate" },
  { id: "qena", name: "Qena", ar: "قنا", kind: "governorate" },
  { id: "red-sea", name: "Red Sea", ar: "البحر الأحمر", kind: "governorate" },
  { id: "sharqia", name: "Sharqia", ar: "الشرقية", kind: "governorate" },
  { id: "sohag", name: "Sohag", ar: "سوهاج", kind: "governorate" },
  { id: "south-sinai", name: "South Sinai", ar: "جنوب سيناء", kind: "governorate" },
  { id: "suez", name: "Suez", ar: "السويس", kind: "governorate" },
];
