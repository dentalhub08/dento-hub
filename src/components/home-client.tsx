"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useStore } from "./store-provider";
import { categories, courses, years } from "@/data/site";
import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";
import { ManagedAds } from "./managed-ads";
import { courseImageByCode } from "@/data/product-media";
import { useCatalog } from "./catalog-provider";

export function HomeClient() {
  const { locale } = useStore();
  const { products } = useCatalog();
  const ar = locale === "ar";
  const featured = products.filter((p) => [1, 5, 14, 44, 47, 82, 97, 106].includes(p.id)).slice(0, 8);

  return (
    <main className="home-page">
      <section className="hero shell home-hero">
        <div className="hero-main home-hero-main">
          <div className="hero-copy">
            <span className="hero-badge">
              <Sparkles size={15} />
              {ar ? "مستلزماتك الدراسية في مكان واحد" : "Dental supplies, made student-simple"}
            </span>
            <h1>
              {ar ? (
                <>
                  كل اللي محتاجه للترم.<br />
                  <em>من غير دوشة.</em>
                </>
              ) : (
                <>
                  Your semester.<br />
                  <em>Ready to go.</em>
                </>
              )}
            </h1>
            <p>
              {ar
                ? "ابحث عن الأدوات والمواد حسب الكورس، أو ادخل مباشرة على المتجر. تجربة بسيطة وسريعة للطالب من الموبايل أو اللابتوب."
                : "Find instruments and materials by course, or jump straight into the shop. Fast, focused, and built for dental students on mobile first."}
            </p>
            <div className="hero-cta">
              <Link className="btn-primary" href="/shop">
                {ar ? "تسوق الآن" : "Shop supplies"} <ArrowRight size={18} />
              </Link>
              <Link className="btn-secondary" href="/shop?bundles=1">
                <PackageCheck size={18} /> {ar ? "حقائب الطلاب" : "Student kits"}
              </Link>
            </div>
            <div className="hero-proof home-proof">
              <span><CheckCircle2 size={16} /> {ar ? "الدفع عند الاستلام" : "Cash on delivery"}</span>
              <span><CheckCircle2 size={16} /> {ar ? "توصيل داخل مصر" : "Egypt delivery"}</span>
              <span><CheckCircle2 size={16} /> {ar ? "مخصص للطلاب" : "Student focused"}</span>
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-visual-glow" />
            <div className="home-tooth-card">
              <img src="/dento-hub-tooth.png" alt="" />
              <span>DENTO HUB</span>
              <strong>{ar ? "جهز ترمك" : "Semester essentials"}</strong>
            </div>
            <div className="home-mini-card mini-operative">
              <span>01</span><strong>Operative</strong><small>{ar ? "مواد وأدوات" : "Materials & instruments"}</small>
            </div>
            <div className="home-mini-card mini-endo">
              <span>02</span><strong>Endodontics</strong><small>{ar ? "مستلزمات الكورس" : "Course essentials"}</small>
            </div>
            <div className="home-mini-card mini-aiu">
              <MapPin size={17} /><strong>AIU</strong><small>{ar ? "توصيل الجامعة" : "Campus delivery"}</small>
            </div>
          </div>
        </div>

        <div className="home-shortcuts" aria-label="Quick shopping links">
          <Link href="/shop" className="home-shortcut">
            <span><PackageCheck size={20} /></span>
            <div><small>{ar ? "كل المنتجات" : "Browse everything"}</small><strong>{ar ? "المتجر" : "Shop supplies"}</strong></div>
            <ArrowRight size={17} />
          </Link>
          <Link href="/shop?course=operative" className="home-shortcut">
            <span><BookOpen size={20} /></span>
            <div><small>{ar ? "ابدأ بالكورس" : "Start by course"}</small><strong>{ar ? "مستلزمات الكورسات" : "Course supplies"}</strong></div>
            <ArrowRight size={17} />
          </Link>
          <Link href="/shop?bundles=1" className="home-shortcut">
            <span><GraduationCap size={20} /></span>
            <div><small>{ar ? "اختصر وقتك" : "Save setup time"}</small><strong>{ar ? "حقائب الطلاب" : "Student kits"}</strong></div>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="section shell home-section">
        <SectionHeading
          eyebrow="SHOP FASTER"
          title={ar ? "ابدأ بالقسم" : "Find it faster"}
          body={ar ? "اختار نوع المستلزمات وادخل مباشرة للمنتجات." : "Jump straight to the type of supplies you need."}
        />
        <div className="category-grid home-category-grid">
          {categories.map((c) => (
            <Link href={`/shop?category=${encodeURIComponent(c.name)}`} className={`category-card ${c.tone}`} key={c.name}>
              <span className="category-icon">{c.icon}</span>
              <strong>{ar ? c.ar : c.name}</strong>
              <small>{ar ? "عرض المنتجات" : "Explore products"}</small>
              <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </section>

      <ManagedAds placement="home_top" />

      <section className="section section-tint home-course-section">
        <div className="shell">
          <SectionHeading
            eyebrow="SHOP BY COURSE"
            title={ar ? "ادخل على كورسك مباشرة" : "Your course, one tap away"}
            body={ar ? "بدل القوائم الطويلة، افتح الكورس وشوف المنتجات المتاحة له مباشرة." : "No long lists or setup screens. Open a course and see the relevant supplies immediately."}
          />
          <div className="course-grid home-course-grid">
            {courses.map((c) => (
              <Link href={`/shop?course=${c.code.toLowerCase()}`} className="course-card course-card-photo home-course-card" key={c.name}>
                <div className="course-photo"><img src={courseImageByCode[c.code]} alt="" /></div>
                <div className="home-course-copy">
                  <span className="course-pill">{ar ? "مستلزمات الكورس" : "Course supplies"}</span>
                  <h3>{ar ? c.ar : c.name}</h3>
                  <p>{ar ? "اعرض المنتجات والبدائل المتاحة لهذا الكورس." : "Open the products and available alternatives for this course."}</p>
                </div>
                <div className="course-bottom"><span>{ar ? "تسوق الكورس" : "Shop course"}</span><ArrowRight size={18} /></div>
              </Link>
            ))}
          </div>
          <ManagedAds placement="course_section" />
        </div>
      </section>

      <section className="section shell home-section">
        <SectionHeading
          eyebrow="POPULAR NOW"
          title={ar ? "مستلزمات مختارة" : "Student essentials"}
          body={ar ? "منتجات مختارة من كتالوج DENTO HUB." : "A quick selection from the DENTO HUB catalog."}
        />
        <div className="product-grid home-product-grid">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
        <div className="home-section-cta"><Link href="/shop">{ar ? "عرض كل المنتجات" : "View all products"} <ArrowRight size={16} /></Link></div>
      </section>

      <ManagedAds placement="featured" />

      <section className="section shell home-kit-section">
        <div className="home-kit-copy">
          <span className="section-kicker">STUDENT KITS</span>
          <h2>{ar ? "حقائب أبسط. شراء أسرع." : "Kits without the complicated checklist"}</h2>
          <p>{ar ? "اختار حقيبة جاهزة لما تكون متاحة، أو اشتري كل منتج لوحده. من غير قوائم اختيار طويلة على الصفحة الرئيسية." : "Grab a ready kit when available, or buy each product separately. No long choose-and-add checklist on the homepage."}</p>
          <Link className="btn-primary" href="/shop?bundles=1">{ar ? "عرض الحقائب" : "Explore student kits"} <ArrowRight size={18} /></Link>
        </div>
        <div className="home-kit-grid">
          <Link href="/shop?course=operative" className="home-kit-card">
            <span>01</span><BookOpen size={24} /><strong>{ar ? "حسب الكورس" : "Course-ready"}</strong><small>{ar ? "ادخل للكورس وشوف المستلزمات." : "Open a course and shop its supplies."}</small><ArrowRight size={17} />
          </Link>
          <Link href="/shop" className="home-kit-card">
            <span>02</span><PackageCheck size={24} /><strong>{ar ? "اشتري براحتك" : "Pick individually"}</strong><small>{ar ? "كل منتج متاح للشراء لوحده." : "Every available product can be bought alone."}</small><ArrowRight size={17} />
          </Link>
          <Link href="/shop?bundles=1" className="home-kit-card featured-kit-card">
            <span>03</span><GraduationCap size={24} /><strong>{ar ? "Bundle جاهز" : "Ready bundles"}</strong><small>{ar ? "لما تكون الحقيبة متاحة، خدها مرة واحدة." : "When a bundle is available, grab it in one go."}</small><ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <ManagedAds placement="student_kits" />

      <section className="section shell home-year-section">
        <SectionHeading eyebrow="BY YEAR" title={ar ? "ابدأ من سنتك الدراسية" : "Shop by academic year"} />
        <div className="year-row home-year-row">
          {years.map((y, i) => (
            <Link href={`/shop?year=${i + 1}`} key={y}>
              <span>0{i + 1}</span><strong>{ar ? `السنة ${i + 1}` : y}</strong><small>{ar ? "عرض المستلزمات" : "Explore supplies"}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-band home-trust-band">
        <div className="shell trust-grid">
          <div><Truck /><span><strong>{ar ? "توصيل داخل مصر" : "Delivery across Egypt"}</strong><small>{ar ? "أسعار التوصيل قابلة للتحديث من الإدارة" : "Admin-managed delivery rules"}</small></span></div>
          <div><ShieldCheck /><span><strong>{ar ? "حسابك محفوظ" : "Account-backed shopping"}</strong><small>{ar ? "السلة والمفضلة مرتبطة بحسابك" : "Cart and wishlist stay with your account"}</small></span></div>
          <div><PackageCheck /><span><strong>{ar ? "تسوق بطريقتك" : "Shop your way"}</strong><small>{ar ? "منتجات منفردة أو حقائب" : "Individual supplies or student kits"}</small></span></div>
        </div>
      </section>
    </main>
  );
}
