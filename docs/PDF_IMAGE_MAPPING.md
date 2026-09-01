# AIU PDF supply image integration

The product visuals in `public/supply-images/` were created from the owner-provided AIU course supply PDFs:

- `Endo 2 supplies.pdf`
- `Fixed 3 instrument.pdf`
- `Instruments List For Operative Dentistry (From I to VI).pdf`
- `Removable 3 INSTRUMENTS .pdf`

## Safety rule

A PDF image is assigned to a DENTO HUB product only when the source label/product match is clear. No image is guessed from visual similarity alone.

Mapped examples include:

- Diagnostic mirror/probe/tweezer set
- High-speed and low-speed handpieces
- Acrylic burs and finishing tools
- Alginate, rubber bowl and impression instruments
- Rubber dam supplies
- Phosphoric acid etching gel
- Bonding agent and microbrush
- Packable composite and light cure
- Endodontic K-files, file holder and ruler
- Irrigation needle, sodium hypochlorite, EDTA and chlorhexidine
- Gutta-percha and paper points
- Wax knife, carver, base plate wax, stock trays and prosthodontic pliers
- Ivory teeth, stainless-steel wire and Vaseline

The original PDFs remain the source of truth. Admin can replace any catalog image later after Supabase Storage is configured.
