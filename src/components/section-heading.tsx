import Link from "next/link";
import { ArrowRight } from "lucide-react";
export function SectionHeading({ eyebrow, title, body, href="/shop" }: { eyebrow?:string; title:string; body?:string; href?:string }){
 return <div className="section-heading"><div>{eyebrow&&<span className="section-kicker">{eyebrow}</span>}<h2>{title}</h2>{body&&<p>{body}</p>}</div><Link href={href}>View all <ArrowRight size={17}/></Link></div>
}
