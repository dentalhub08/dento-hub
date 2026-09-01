import { productImageById } from "./product-media";

export type StagedProduct = {
  id: number;
  sourceName: string;
  slug: string;
  sourceTogary: string | null;
  sellingPrice: number | null;
  status: "draft" | "active";
  image?: string;
  courseSlugs?: string[];
};

const sourceProducts: StagedProduct[] = [
  {
    "id": 1,
    "sourceName": "MIRROR",
    "slug": "mirror",
    "sourceTogary": "32",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 2,
    "sourceName": "probe",
    "slug": "probe",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 3,
    "sourceName": "tweezer",
    "slug": "tweezer",
    "sourceTogary": "40",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 4,
    "sourceName": "disposable tray",
    "slug": "disposable-tray",
    "sourceTogary": "13",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 5,
    "sourceName": "cheeck rertractor",
    "slug": "cheeck-rertractor",
    "sourceTogary": "13",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 6,
    "sourceName": "dental photography mirror",
    "slug": "dental-photography-mirror",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 7,
    "sourceName": "four holes high handpiece",
    "slug": "four-holes-high-handpiece",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 8,
    "sourceName": "low speed handpiece",
    "slug": "low-speed-handpiece",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 9,
    "sourceName": "handpiece oil",
    "slug": "handpiece-oil",
    "sourceTogary": "130",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 10,
    "sourceName": "245 bur",
    "slug": "245-bur",
    "sourceTogary": "42",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 11,
    "sourceName": "straight fissure bur",
    "slug": "straight-fissure-bur",
    "sourceTogary": "42",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 12,
    "sourceName": "round bur",
    "slug": "round-bur",
    "sourceTogary": "42",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 13,
    "sourceName": "169 bur",
    "slug": "169-bur",
    "sourceTogary": "42",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 14,
    "sourceName": "bur holder",
    "slug": "bur-holder",
    "sourceTogary": "26.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 15,
    "sourceName": "low speed round bur",
    "slug": "low-speed-round-bur",
    "sourceTogary": "47",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 16,
    "sourceName": "chisel",
    "slug": "chisel",
    "sourceTogary": "124(3pcs)",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 17,
    "sourceName": "enamel hatchet",
    "slug": "enamel-hatchet",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 18,
    "sourceName": "cervical edge trimmer",
    "slug": "cervical-edge-trimmer",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 19,
    "sourceName": "spoon excavator",
    "slug": "spoon-excavator",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 20,
    "sourceName": "discoid excavator",
    "slug": "discoid-excavator",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 21,
    "sourceName": "zinc polycarboxylate cement",
    "slug": "zinc-polycarboxylate-cement",
    "sourceTogary": "79",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 22,
    "sourceName": "glass ionomer cement",
    "slug": "glass-ionomer-cement",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 23,
    "sourceName": "calcium hydroxide",
    "slug": "calcium-hydroxide",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 24,
    "sourceName": "MTA",
    "slug": "mta",
    "sourceTogary": "37",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 25,
    "sourceName": "varnish",
    "slug": "varnish",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 26,
    "sourceName": "glass ionomer capsule",
    "slug": "glass-ionomer-capsule",
    "sourceTogary": "78.75",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 27,
    "sourceName": "glass slab",
    "slug": "glass-slab",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 28,
    "sourceName": "cement spatula",
    "slug": "cement-spatula",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 29,
    "sourceName": "smooth condenser",
    "slug": "smooth-condenser",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 30,
    "sourceName": "GIC capsule applicator",
    "slug": "gic-capsule-applicator",
    "sourceTogary": "892",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 31,
    "sourceName": "calcium hydroxide applicator",
    "slug": "calcium-hydroxide-applicator",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 32,
    "sourceName": "MTA applicator",
    "slug": "mta-applicator",
    "sourceTogary": "750",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 33,
    "sourceName": "microbrush",
    "slug": "microbrush",
    "sourceTogary": "42",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 34,
    "sourceName": "amalgam capsules",
    "slug": "amalgam-capsules",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 35,
    "sourceName": "amalgam carrier",
    "slug": "amalgam-carrier",
    "sourceTogary": "80",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 36,
    "sourceName": "serrated condenser",
    "slug": "serrated-condenser",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 37,
    "sourceName": "egg shaped burnisher",
    "slug": "egg-shaped-burnisher",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 38,
    "sourceName": "hollenbeck carver",
    "slug": "hollenbeck-carver",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 39,
    "sourceName": "cotton rolls",
    "slug": "cotton-rolls",
    "sourceTogary": "15.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 40,
    "sourceName": "tofflemire retainer",
    "slug": "tofflemire-retainer",
    "sourceTogary": "75",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 41,
    "sourceName": "wedges",
    "slug": "wedges",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 42,
    "sourceName": "scissors",
    "slug": "scissors",
    "sourceTogary": "40",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 43,
    "sourceName": "flame shaped bur",
    "slug": "flame-shaped-bur",
    "sourceTogary": "8.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 44,
    "sourceName": "rubber dam kit",
    "slug": "rubber-dam-kit",
    "sourceTogary": "950",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 45,
    "sourceName": "phosporic acid etching gel",
    "slug": "phosporic-acid-etching-gel",
    "sourceTogary": "31.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 46,
    "sourceName": "bonding agent",
    "slug": "bonding-agent",
    "sourceTogary": "446",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 47,
    "sourceName": "packable composite resin restoration shade A1,A2&A3",
    "slug": "packable-composite-resin-restoration-shade-a1-a2-a3",
    "sourceTogary": "210",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 48,
    "sourceName": "LIGHT CURE",
    "slug": "light-cure",
    "sourceTogary": "1420",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 49,
    "sourceName": "PUTTY index",
    "slug": "putty-index",
    "sourceTogary": "997",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 50,
    "sourceName": "scalpel",
    "slug": "scalpel",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 51,
    "sourceName": "blade",
    "slug": "blade",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 52,
    "sourceName": "compsoite brown stain",
    "slug": "compsoite-brown-stain",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 53,
    "sourceName": "glycerin gel",
    "slug": "glycerin-gel",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 54,
    "sourceName": "celluloid matrices",
    "slug": "celluloid-matrices",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 55,
    "sourceName": "2 bioclear matrices",
    "slug": "2-bioclear-matrices",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 56,
    "sourceName": "paddle shape plastic filling",
    "slug": "paddle-shape-plastic-filling",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 57,
    "sourceName": "PK thomas carver",
    "slug": "pk-thomas-carver",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 58,
    "sourceName": "anatomical burnisher",
    "slug": "anatomical-burnisher",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 59,
    "sourceName": "composite brush",
    "slug": "composite-brush",
    "sourceTogary": "42",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 60,
    "sourceName": "stainless steel tray",
    "slug": "stainless-steel-tray",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 61,
    "sourceName": "adhesive tip(holding tip)",
    "slug": "adhesive-tip-holding-tip",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 62,
    "sourceName": "heavy putty",
    "slug": "heavy-putty",
    "sourceTogary": "997",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 63,
    "sourceName": "self cure composite resin",
    "slug": "self-cure-composite-resin",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 64,
    "sourceName": "depth cutting bur",
    "slug": "depth-cutting-bur",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 65,
    "sourceName": "disposable three way air water syringe",
    "slug": "disposable-three-way-air-water-syringe",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 66,
    "sourceName": "saliva ejector",
    "slug": "saliva-ejector",
    "sourceTogary": "105",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 67,
    "sourceName": "cups",
    "slug": "cups",
    "sourceTogary": "12",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 68,
    "sourceName": "towel holder",
    "slug": "towel-holder",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 69,
    "sourceName": "cotton holder",
    "slug": "cotton-holder",
    "sourceTogary": "68",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 70,
    "sourceName": "cotton roll dispenser",
    "slug": "cotton-roll-dispenser",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 71,
    "sourceName": "autoclavable cotton holder",
    "slug": "autoclavable-cotton-holder",
    "sourceTogary": "65(2pcs)",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 72,
    "sourceName": "topical anesthesia",
    "slug": "topical-anesthesia",
    "sourceTogary": "36",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 73,
    "sourceName": "anesthesia sygringe",
    "slug": "anesthesia-sygringe",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 74,
    "sourceName": "over gloves",
    "slug": "over-gloves",
    "sourceTogary": "7",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 75,
    "sourceName": "temporary filling material",
    "slug": "temporary-filling-material",
    "sourceTogary": "84",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 76,
    "sourceName": "light senstive mixing well",
    "slug": "light-senstive-mixing-well",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 77,
    "sourceName": "retraction cord",
    "slug": "retraction-cord",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 78,
    "sourceName": "hemostatic liquid",
    "slug": "hemostatic-liquid",
    "sourceTogary": "68",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 79,
    "sourceName": "retraction cord applicator",
    "slug": "retraction-cord-applicator",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 80,
    "sourceName": "over shoes",
    "slug": "over-shoes",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 81,
    "sourceName": "vinyl polysiloxane",
    "slug": "vinyl-polysiloxane",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 82,
    "sourceName": "alginate",
    "slug": "alginate",
    "sourceTogary": "150",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 83,
    "sourceName": "rubber bowl",
    "slug": "rubber-bowl",
    "sourceTogary": "15.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 84,
    "sourceName": "alginate mixing spatula",
    "slug": "alginate-mixing-spatula",
    "sourceTogary": "15.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 85,
    "sourceName": "hydro fluoric acid",
    "slug": "hydro-fluoric-acid",
    "sourceTogary": "178",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 86,
    "sourceName": "silane",
    "slug": "silane",
    "sourceTogary": "210",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 87,
    "sourceName": "zirconia primer",
    "slug": "zirconia-primer",
    "sourceTogary": "240",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 88,
    "sourceName": "dual cure resin cement",
    "slug": "dual-cure-resin-cement",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 89,
    "sourceName": "oxygen inhibiting gel",
    "slug": "oxygen-inhibiting-gel",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 90,
    "sourceName": "bleaching kit",
    "slug": "bleaching-kit",
    "sourceTogary": "997.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 91,
    "sourceName": "ivory teeth",
    "slug": "ivory-teeth",
    "sourceTogary": "10",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 92,
    "sourceName": "sticky wax",
    "slug": "sticky-wax",
    "sourceTogary": "10",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 93,
    "sourceName": "dispensing gun",
    "slug": "dispensing-gun",
    "sourceTogary": "470",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 94,
    "sourceName": "die silicon material",
    "slug": "die-silicon-material",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 95,
    "sourceName": "rag wheel",
    "slug": "rag-wheel",
    "sourceTogary": "37",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 96,
    "sourceName": "white acrylic resin",
    "slug": "white-acrylic-resin",
    "sourceTogary": "380",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 97,
    "sourceName": "gutta percha",
    "slug": "gutta-percha",
    "sourceTogary": "99",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 98,
    "sourceName": "spreaders",
    "slug": "spreaders",
    "sourceTogary": "99",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 99,
    "sourceName": "paper point",
    "slug": "paper-point",
    "sourceTogary": "99",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 100,
    "sourceName": "EDTA",
    "slug": "edta",
    "sourceTogary": "42",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 101,
    "sourceName": "chlorohexidine",
    "slug": "chlorohexidine",
    "sourceTogary": "31.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 102,
    "sourceName": "sodium hypochlorite",
    "slug": "sodium-hypochlorite",
    "sourceTogary": "31.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 103,
    "sourceName": "side vented needle",
    "slug": "side-vented-needle",
    "sourceTogary": "360",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 104,
    "sourceName": "endo file holder",
    "slug": "endo-file-holder",
    "sourceTogary": "26",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 105,
    "sourceName": "endo ruler",
    "slug": "endo-ruler",
    "sourceTogary": "52.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 106,
    "sourceName": "endo files",
    "slug": "endo-files",
    "sourceTogary": "89",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 107,
    "sourceName": "acrylic bur",
    "slug": "acrylic-bur",
    "sourceTogary": "52.5",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 108,
    "sourceName": "acrylic finishing bur",
    "slug": "acrylic-finishing-bur",
    "sourceTogary": "52",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 109,
    "sourceName": "diamond finishing disc",
    "slug": "diamond-finishing-disc",
    "sourceTogary": "36",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 110,
    "sourceName": "wax knife",
    "slug": "wax-knife",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 111,
    "sourceName": "carver",
    "slug": "carver",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 112,
    "sourceName": "base plate wax",
    "slug": "base-plate-wax",
    "sourceTogary": "17",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 113,
    "sourceName": "stock tray",
    "slug": "stock-tray",
    "sourceTogary": "13",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 114,
    "sourceName": "spatula",
    "slug": "spatula",
    "sourceTogary": "24",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 115,
    "sourceName": "wide blade spatula",
    "slug": "wide-blade-spatula",
    "sourceTogary": "26",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 116,
    "sourceName": "118 peeso collar plier",
    "slug": "118-peeso-collar-plier",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 117,
    "sourceName": "cutting plier",
    "slug": "cutting-plier",
    "sourceTogary": "450",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 118,
    "sourceName": "ss wire",
    "slug": "ss-wire",
    "sourceTogary": "68",
    "sellingPrice": null,
    "status": "draft"
  },
  {
    "id": 119,
    "sourceName": "vaseline",
    "slug": "vaseline",
    "sourceTogary": null,
    "sellingPrice": null,
    "status": "draft"
  }
];


/** Owner-approved pricing rule: use the TOGARY values from the supplied Excel sheet as current storefront prices.
 * Pack annotations such as `124(3pcs)` keep 124 EGP as the displayed pack price.
 * Rows without a TOGARY value remain pending until Admin sets a price.
 */
function priceFromExcel(raw: string | null): number | null {
  if (!raw) return null;
  const match = raw.trim().match(/^(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

export const stagedProducts: StagedProduct[] = sourceProducts.map((product) => {
  const sellingPrice = priceFromExcel(product.sourceTogary);
  return {
    ...product,
    sellingPrice,
    status: sellingPrice === null ? "draft" : "active",
    image: productImageById[product.id],
  };
});

export const publicProducts = stagedProducts.filter((p) => p.sellingPrice !== null && p.status === "active");
export const pricedProductCount = publicProducts.length;
export const pendingPriceCount = stagedProducts.length - pricedProductCount;
