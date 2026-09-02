"use client";
import Link from "next/link";
import { ArrowRight, PackageCheck, ShieldCheck, Sparkles, Truck, GraduationCap, BookOpen, MapPin, CheckCircle2 } from "lucide-react";
import { useStore } from "./store-provider";
import { categories, courses, years } from "@/data/site";
import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";
import { ManagedAds } from "./managed-ads";
import { courseImageByCode } from "@/data/product-media";
import { useCatalog } from "./catalog-provider";

export function HomeClient(){
 const { locale }=useStore(); const {products}=useCatalog(); const ar=locale==="ar";
 const featured=products.filter(p=>[1,5,14,44,47,82,97,106].includes(p.id)).slice(0,8);
 return <main>
   <section className="hero shell">
     <div className="hero-main">
       <div className="hero-copy">
         <span className="hero-badge"><Sparkles size={15}/>{ar?"مصمم لطلاب طب الأسنان":"Built around dental students"}</span>
         <h1>{ar?<>جهّز ترمك.<br/><em>بشكل أذكى.</em></>:<>Your semester.<br/><em>Sorted.</em></>}</h1>
         <p>{ar?"ابحث حسب الكورس، السنة الدراسية أو قائمة الجامعة. اجمع كل مستلزماتك في مكان واحد بدون دوشة.":"Shop by course, year, or university supply list. One focused place for the instruments and materials your semester actually needs."}</p>
         <div className="hero-cta"><Link className="btn-primary" href="/shop">{ar?"ابدأ التسوق":"Shop supplies"}<ArrowRight size={18}/></Link><Link className="btn-secondary" href="/shop?bundles=1"><PackageCheck size={18}/>{ar?"استكشف الحقائب":"Explore student kits"}</Link></div>
         <div className="hero-proof"><span><CheckCircle2 size={16}/> COD in Egypt</span><span><CheckCircle2 size={16}/> Bilingual</span><span><CheckCircle2 size={16}/> Student focused</span></div>
       </div>
       <div className="hero-orbit" aria-label="Dental semester supplies illustration">
         <div className="orb orb-main"><span className="hero-tooth-shell"><img className="hero-tooth-img" src="/dento-hub-tooth.png" alt="" aria-hidden="true"/></span><b>DENTO</b><small>semester kit</small></div>
         <div className="float-card card-one"><span>01</span><b>Operative</b><small>Isolation + composite</small></div>
         <div className="float-card card-two"><span>02</span><b>Endodontics</b><small>Files + irrigation</small></div>
         <div className="float-card card-three"><MapPin size={17}/><b>AIU delivery</b><small>Live campus rate</small></div>
         <div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/>
       </div>
     </div>
     <div className="hero-quickbar">
       <div><GraduationCap size={22}/><span><small>Your university</small><strong>Alamein International University</strong></span></div>
       <div><BookOpen size={22}/><span><small>Find your list</small><strong>Choose course / year</strong></span></div>
       <Link href="/shop?university=aiu">Open AIU supplies <ArrowRight size={17}/></Link>
     </div>
   </section>

   <section className="section shell">
    <SectionHeading eyebrow="FAST START" title={ar?"ابدأ من اللي تعرفه":"Start with what you know"} body={ar?"اختار القسم، وإحنا نضيّق الاختيارات بسرعة.":"Pick a category and get to the right supplies without catalog overload."}/>
    <div className="category-grid">{categories.map((c,i)=><Link href={`/shop?category=${encodeURIComponent(c.name)}`} className={`category-card ${c.tone}`} key={c.name}><span className="category-icon">{c.icon}</span><strong>{ar?c.ar:c.name}</strong><small>{[19,22,31,18,16,4][i]} curated items</small><ArrowRight size={17}/></Link>)}</div>
   </section>

   <ManagedAds placement="home_top"/>

   <section className="section section-tint">
    <div className="shell">
      <SectionHeading eyebrow="COURSE MODE" title={ar?"تسوّق حسب الكورس":"Shop like a dental student"} body={ar?"بدل ما تدور على كل أداة لوحدها، افتح قائمة الكورس وشوف المطلوب والمتاح.":"Open a course list, see what is required, optional, already in your kit, and still missing."}/>
      <div className="course-grid">{courses.map((c,i)=><Link href={`/shop?course=${c.code.toLowerCase()}`} className="course-card course-card-photo" key={c.name}><div className="course-photo"><img src={courseImageByCode[c.code]} alt=""/></div><div className="course-no">0{i+1}</div><div><span className="course-pill">AIU source list</span><h3>{ar?c.ar:c.name}</h3><p>{c.blurb}</p></div><div className="course-bottom"><span>{i===0?"36":"24+"} mapped supplies</span><ArrowRight size={18}/></div></Link>)}</div>
      <ManagedAds placement="course_section"/>
    </div>
   </section>

   <section className="section shell">
    <SectionHeading eyebrow="REAL CATALOG" title={ar?"من قائمة DENTO HUB":"From your DENTO HUB catalog"} body={ar?"منتجات حقيقية من قائمة DENTO HUB مع صور من مراجع المستلزمات المرفوعة.":"Real DENTO HUB products, now paired with supply imagery from the uploaded AIU references."}/>
    <div className="product-grid">{featured.map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div>
   </section>

   <ManagedAds placement="featured"/>

   <section className="section shell kit-builder">
    <div className="kit-copy"><span className="section-kicker">SEMESTER BUILDER</span><h2>{ar?"حوّل قائمة الكورس إلى checklist":"Turn a course list into a checkout plan"}</h2><p>{ar?"اعرف المطلوب، الاختياري، والبدائل. اختار كل منتج لوحده أو اشترِ Bundle لما تكون جاهزة.":"See required items, optional items, and alternatives. Buy products individually or grab a discounted bundle when one is available."}</p><Link className="btn-primary" href="/shop?course=operative">Try Operative list <ArrowRight size={18}/></Link></div>
    <div className="checklist-card"><div className="checklist-head"><div><span>Operative Dentistry</span><strong>Semester supply list</strong></div><b>12 / 36</b></div>{["Rubber dam kit","Phosphoric acid etching gel","Bonding agent","Composite shades A1 / A2 / A3","Composite finishing burs"].map((x,i)=><div className="check-row" key={x}><span className={`check ${i<2?"done":""}`}>{i<2?"✓":""}</span><div><strong>{x}</strong><small>{i===3?"Choose shade / variation":"Mapped to catalog"}</small></div><span className="row-status">{i<2?"In kit":i===3?"Choose":"Add"}</span></div>)}<div className="check-footer"><span>List progress</span><div className="progress"><i style={{width:"34%"}}/></div></div></div>
   </section>

   <ManagedAds placement="student_kits"/>

   <section className="section shell">
    <SectionHeading eyebrow="BY YEAR" title={ar?"كل سنة لها احتياجاتها":"Made for every dental year"}/>
    <div className="year-row">{years.map((y,i)=><Link href={`/shop?year=${i+1}`} key={y}><span>0{i+1}</span><strong>{ar?`السنة ${i+1}`:y}</strong><small>Explore supplies</small></Link>)}</div>
   </section>

   <section className="trust-band"><div className="shell trust-grid"><div><Truck/><span><strong>Delivery built for Egypt</strong><small>Admin-adjustable by governorate & university</small></span></div><div><ShieldCheck/><span><strong>Secure checkout rules</strong><small>Server-side pricing and protected admin access</small></span></div><div><PackageCheck/><span><strong>Student bundles</strong><small>Buy kits or choose every item separately</small></span></div></div></section>
 </main>
}
