export type AdPlacement = "home_top" | "featured" | "course_section" | "student_kits" | "shop_top";
export type AdCourse = "all" | "operative" | "endo" | "fixed" | "removable";

export type StoreAd = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  placement: AdPlacement;
  course: AdCourse;
  image: string;
  active: boolean;
};

export const adPlacementLabels: Record<AdPlacement, string> = {
  home_top: "Home - Top promotion",
  featured: "Home - Featured products",
  course_section: "Home - Course section",
  student_kits: "Home - Student kits",
  shop_top: "Shop - Top promotion",
};

export const adCourseLabels: Record<AdCourse, string> = {
  all: "All courses",
  operative: "Operative Dentistry",
  endo: "Endodontics",
  fixed: "Fixed Prosthodontics",
  removable: "Removable Prosthodontics",
};

export const defaultStoreAds: StoreAd[] = [
  {
    id: "aiu-operative",
    title: "Operative essentials, in one place.",
    subtitle: "Build your rubber dam and composite setup from the AIU supply reference.",
    cta: "Shop Operative",
    href: "/shop?course=operative",
    placement: "course_section",
    course: "operative",
    image: "/supply-images/rubber-dam-sheets.jpg",
    active: true,
  },
  {
    id: "endo-files",
    title: "Endodontics setup made simpler.",
    subtitle: "Files, irrigation and obturation supplies from the uploaded AIU list.",
    cta: "Shop Endodontics",
    href: "/shop?course=endo",
    placement: "shop_top",
    course: "endo",
    image: "/supply-images/k-files-15-40.jpg",
    active: true,
  },
];

export const adStorageKey = "dento-admin-banners-v1";
