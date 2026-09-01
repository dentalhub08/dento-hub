export function titleCaseSource(value: string) {
  const corrections: Record<string, string> = {
    "MIRROR": "Dental Mirror",
    "probe": "Dental Probe",
    "tweezer": "Dental Tweezer",
    "cheeck rertractor": "Cheek Retractor",
    "four holes high handpiece": "Four-Hole High-Speed Handpiece",
    "phosporic acid etching gel": "Phosphoric Acid Etching Gel",
    "packable composite resin restoration shade A1,A2&A3": "Packable Composite Resin — Shades A1, A2 & A3",
    "LIGHT CURE": "Light Curing Device",
    "anesthesia sygringe": "Anesthesia Syringe",
    "chlorohexidine": "Chlorhexidine",
    "ss wire": "Stainless-Steel Wire",
    "118 peeso collar plier": "118 Peeso Collar Pliers",
    "cutting plier": "Cutting Pliers",
    "gutta percha": "Gutta-Percha Points",
    "paper point": "Absorbent Paper Points",
  };
  if (corrections[value]) return corrections[value];
  return value
    .toLowerCase()
    .replace(/\w/g, (c) => c.toUpperCase())
    .replace(/Gic/g, "GIC")
    .replace(/Mta/g, "MTA")
    .replace(/Edta/g, "EDTA");
}

export function egp(value: number) {
  return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(value);
}
