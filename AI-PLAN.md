# MatlGroup — plán pro AI (implementační instrukce)

**Účel dokumentu:** Instrukce pro AI agenta (Claude Code), který bude web stavět.
Rozsah a business kontext definuje `matlgroup-web-plan.md` — **ten je zdroj pravdy pro CO se staví**. Tento dokument říká **JAK a v jakém pořadí**.

---

## 0. Vstupy, které AI dostane

| Vstup | Co to je | Pravidlo |
|---|---|---|
| `matlgroup-web-plan.md` | kompletní plán projektu | Zdroj pravdy pro rozsah, obsah i omezení. Před začátkem práce přečíst celý. |
| Design HTML (Claude Design) | hotový design hlavní stránky + šablony podstránky jako HTML/CSS | **Zdroj pravdy pro vzhled.** Nepředělávat, nepřidávat vlastní design. Rozložit na komponenty a design tokeny. |
| `assets/` (dodá se) | obrázky, loga tří firem, certifikace, fotky | Vše projde obrázkovou pipeline (sekce 5). Loga v SVG používat přímo. |
| `OTAZKY.md` | nezodpovězené otázky (hosting, majitel) | Co je tam otevřené, to AI nerozhoduje — použije abstrakci nebo TODO. |

**Pokud něco z toho ještě není v repu, AI na tom nestaví — postaví okolní strukturu a nechá jasně označené napojovací místo.**

---

## 1. Stack (rozhodnuto)

- **Next.js** (App Router, TypeScript, `output: "standalone"`)
- **PostgreSQL** + **Drizzle ORM** (migrace přes drizzle-kit)
- **Tailwind CSS** — design tokeny (barvy, typografie, spacing) se extrahují z dodaného design HTML do Tailwind configu; nepoužívat výchozí Tailwind paletu
- **sharp** — obrázková pipeline (resize, AVIF/WebP/JPEG, strip EXIF)
- **Playwright (headless Chromium)** — generování PDF ceníků z HTML šablony
- **Zod** — validace všech vstupů na serveru
- **argon2id** — hashování hesel; vlastní session auth (HttpOnly cookie), NE NextAuth s OAuth — admin má e-mail+heslo
- **Cloudflare Turnstile** — ochrana formulářů
- **Umami** — analytika (API volání jen ze serveru)
- **Nodemailer / SMTP** — notifikační e-maily (e-mail je JEN notifikace, zdroj pravdy je DB)

### Hosting není rozhodnutý → důsledky pro architekturu
- Vše musí běžet v **Dockeru**: `Dockerfile` + `docker-compose.yml` (web + postgres + volitelně umami)
- **Úložiště souborů za abstrakcí** (`lib/storage.ts` s rozhraním `put/get/delete/url`): implementace `local disk` teď, adaptér pro S3/R2 možný později bez zásahu do zbytku kódu
- Žádná závislost na Vercel-only funkcích (ISR on-demand OK, ale nic co nejde self-hostnout)

---

## 2. Struktura repozitáře (cílová)

```
/
├── AI-PLAN.md, OTAZKY.md, matlgroup-web-plan.md
├── design/                  ← sem přijde HTML z Claude Design (jen reference, neservíruje se)
├── assets/                  ← zdrojová loga a fotky (neservíruje se)
├── src/
│   ├── app/
│   │   ├── (web)/           ← veřejné stránky dle IA (plán sekce 3)
│   │   ├── admin/           ← /admin/login + chráněné /admin/*
│   │   └── api/
│   ├── components/          ← komponenty vzniklé rozkladem design HTML
│   ├── lib/                 ← db, auth, storage, images, pdf, umami, mail
│   └── db/                  ← schema.ts, migrace, seed
├── public/
├── docker-compose.yml, Dockerfile
└── CLAUDE.md                ← vznikne při scaffoldu (viz sekce 8)
```

URL struktura přesně podle plánu, sekce 3 (`/sluzby/antikoroze`, …). Navíc `/sluzby/antikoroze/cenik` jako samostatná stránka (doporučení z plánu, sekce 22.2 — ceník antikoroze je vstupní brána z Googlu).

---

## 3. Datový model (Drizzle schema — postavit v M1)

Z plánu sekce 5, 6, 10, 31.5:

- **users** — id, email, jméno, hash (argon2id), role (`superadmin|admin|editor`), `must_change_password`, 2FA secret (nullable), created_at
- **sessions** — token hash, user_id, expirace, IP/UA
- **audit_log** — user_id, akce, entita, diff (jsonb), timestamp
- **sluzby** — číselník 6 služeb; slug, název, **dodavatel_ico + dodavatel_nazev (nullable — doplní se dle OTAZKY.md)**
- **realizace** — přesně dle plánu sekce 5: slug, titulek, datum_realizace, sluzba_id, znacka (FK číselník), model, rok_vyroby, popis, `featured` (bool), `poradi`, `publikovano`
- **media** — realizace_id, typ (foto|video), role (before|after|process|hlavni), **alt_text NOT NULL**, poradi, varianty (jsonb: formát × šířka × cesta)
- **znacky** — číselník značek aut
- **cenik_sekce / cenik_polozky** — služba, název, cena, jednotka, poznámka („od“/„orientační“), pořadí → z nich se generuje HTML tabulka i PDF
- **poptavky** — jméno, telefon, email, sluzba_id, zpráva, značka+model (nullable), přílohy, stav (`nova|v_reseni|vyrizena|spam`), souhlas_gdpr (timestamp), souhlas_newsletter (bool), zdroj (např. `sluzby/antikoroze`), created_at + **retence: automatické mazání po X měsících (konstanta, default 24)**
- **faq** — otázka, odpověď, sluzba_id (nullable = obecné), pořadí
- **nastaveni** — key/value: kontakty, otevírací doba, sociální sítě (editovatelné v adminu)

Fulltext galerie: `tsvector` sloupec přes titulek+značka+model+popis (žádný Elasticsearch).

**Seed data existují!** Plán obsahuje kompletní reálné ceníky (sekce 24.4–24.7: antikoroze, pneuservis, interiér, exteriér), firemní údaje (příloha A) a texty (příloha B). Seed skript je naplní — **žádný lorem ipsum**.

---

## 4. Milníky — pořadí práce

Každý milník končí funkčním, spustitelným stavem (`docker compose up` → funguje). Neskákat dopředu.

### M0 — Scaffold
- Next.js + TS + Tailwind + Drizzle + Docker compose (web + postgres)
- Lint, prettier, základní CI-ready skripty (`dev`, `build`, `db:migrate`, `db:seed`)
- `CLAUDE.md` s pravidly z tohoto dokumentu (sekce 8)

### M1 — DB schema + seed
- Celé schema ze sekce 3, migrace, seed: 6 služeb, ceníky z plánu, FAQ kostry, firemní údaje, testovací admin účet

### M2 — Design systém z dodaného HTML
**Blokováno dodáním design HTML.** Až přijde:
- Extrahovat tokeny (barvy, fonty, spacing, radiusy, stíny) → `tailwind.config`
- Rozložit na komponenty: Header/Nav (mobilní menu!), Footer, Hero, CTA blok, karta služby, ceníková tabulka, FAQ accordion, before/after slider, galerie grid, formulářové prvky, skeleton loadery
- Každá komponenta má všechny stavy: hover, focus, active, disabled, loading
- `prefers-reduced-motion` respektováno globálně od začátku, ne dodatečně

### M3 — Veřejné stránky (statický obsah)
- Homepage dle canvas: hero, „co umíme“ (6 služeb), **pás s logy tří firem hned pod hero** (specifikace plán sekce 32 — nadpis dělá práci, loga monochrom), statistiky, recenze, galerie preview, FAQ, kde nás najdete, CTA
- 6 stránek služeb podle jednotné šablony (plán sekce 4) — unikátní prvky fáze 1: before/after slider (antikoroze), případová studie (nákup/prodej), balíčky (detailing). Kalkulačka, vizualizér a booking = **fáze 2, jen statický CTA placeholder**
- O nás (road mapa 3 firem, scroll animace), Kontakt, /caste-otazky, GDPR stránky (kostra s TODO pro právní texty), custom 404 + 500
- Texty: použít obsah z přílohy B plánu; kde chybí, vložit `<!-- TODO-OBSAH: ... -->` + viditelný český placeholder popisující co tam přijde (ne lorem ipsum)
- Mobile-first — plán počítá se 70–80 % mobilní návštěvnosti

### M4 — Galerie + obrázková pipeline
- Upload → sharp: strip EXIF (GPS!), limit velikosti, varianty AVIF+WebP+JPEG v šířkách 400/800/1200/1600, uložení přes storage abstrakci
- Frontend: `srcset`+`sizes`, povinné width/height (CLS), `loading="lazy"` mimo první viewport
- /galerie: filtry (služba, značka, rok, jen před/po) + fulltext — **vše server-side**, stránkování server-side
- /galerie/[slug]: detail realizace, before/after, `ImageObject` schema
- Stavy: skeleton, prázdný výsledek filtru, chyba načtení

### M5 — Poptávkový formulář
- **Uložení do DB primárně**, e-mail jen notifikace (selhání SMTP nesmí ztratit poptávku)
- Pole a chování přesně dle plánu sekce 10; služba předvyplněná dle stránky
- Honeypot + Turnstile + rate limit na IP + server-side Zod validace + ochrana proti e-mail header injection
- Dvě samostatná zaškrtávátka: GDPR (povinné), newsletter (nepovinné, NEzaškrtnuté)
- Chybový stav: **text formuláře nesmí zmizet**
- Auto-potvrzení odesílateli + notifikace na firemní mail

### M6 — Admin panel
- `/admin/login` veřejná, noindex, nikde neprolinkovaná; `Disallow: /admin` v robots.txt
- Bezpečnostní minimum z plánu sekce 6 je **nepodkročitelné**: argon2id, rate limit loginu (5/15min/IP i per účet), session cookie HttpOnly+Secure+SameSite=Lax, CSRF na všech mutacích, reset hesla tokenem, vynucená změna hesla při 1. přihlášení, audit log, TOTP 2FA (volitelné pro adminy, povinné pro superadmina)
- Role: superadmin / admin / editor dle tabulky v plánu
- Funkce: CRUD realizace + drag&drop řazení médií + povinný alt text; poptávky (seznam, detail, stavy, export CSV); editace ceníků; FAQ; kontakty/otevírací doba; správa uživatelů
- **Rozsah editovatelnosti: JEN ceníky, FAQ, galerie, kontakty, otevírací doba.** Žádné CMS na layout a hlavní texty — explicitní rozhodnutí z plánu.

### M7 — PDF ceníky + analytika
- PDF generované automaticky z DB přes HTML šablonu (Playwright) — jeden zdroj pravdy; `/cenik.pdf` + per-služba
- Umami: skript na webu (bez cookie lišty — Umami je cookie-less), vlastní události: `poptavka-odeslana`, `tel-click`, `cenik-pdf-download`, `galerie-filtr`
- Admin dashboard: 4–5 widgetů přes Umami API **ze serveru** (návštěvy 7/30 dní, top stránky, zdroje, mobil/desktop, poptávky+tel kliky)

### M8 — SEO, přístupnost, launch
- Unikátní title + meta description (editovatelné pole u obsahu), OG + Twitter Card, canonical
- Schema.org: `AutoRepair`/`LocalBusiness`, `Service` (+`provider` dle dodavatelské s.r.o.), `FAQPage`, `BreadcrumbList`, `ImageObject`
- Titulky s klíčovými slovy: `Antikorozní ochrana podvozku Brno | MatlGroup`, NE `MatlGroup | Domů` (plán sekce 30.1)
- Hlavička první rok: „MatlGroup — dříve Sežeňkáru.cz a Ochranné vosky“
- sitemap.xml automaticky, robots.txt
- **301 redirect mapa** z plánu sekce 22.2 → implementovat jako data-driven middleware/config (CSV → redirects); staré domény se přesměrují na úrovni DNS/proxy až při nasazení
- Přístupnost: kontrast 4,5:1, focus stavy, klávesnice (menu, filtry), labely + textové chyby formulářů
- Výkon: LCP < 2,5 s, CLS < 0,1, INP < 200 ms na mobilu; Lighthouse ≥ 90 všude
- Projít launch checklist z plánu sekce 19 a vypsat, co je hotové / co blokuje klient

---

## 5. Tvrdá pravidla (platí v každém milníku)

1. **Design HTML se nepředělává.** Když komponenta v designu chybí, odvodit ji z existujících tokenů a označit `TODO-DESIGN` k odsouhlasení.
2. **Žádná tajemství do frontendu** — Umami token, SMTP, API klíče jen server-side (`server-only` importy).
3. **Validace vždy na serveru.** Klientská validace je jen UX.
4. **Server-side filtrování a stránkování** — frontend nikdy nedostane nepublikovaná data.
5. **Alt text povinný** — DB constraint, ne jen UI hint.
6. **Jen čeština.** Ale URL a komponenty psát tak, aby šlo ve fázi 2 přidat `/de` a `/en` bez přepisování (žádné hardcoded texty v komponentách — texty centrálně, klidně jednoduchý slovník, ne hned i18n framework).
7. **Žádná cookie lišta** — dokud není Clarity (fáze 2), web žádnou nepotřebuje. Nepřidávat „pro jistotu“.
8. **Stavy rozhraní vždy**: loading (skeleton), empty, error, offline — součást definice hotovosti každé stránky.
9. **Commity po logických celcích**, konvenční prefixy (`feat:`, `fix:`, …). Po každém milníku musí projít `build` a web nastartuje v Dockeru.
10. **Nerozšiřovat rozsah.** Cokoli z fáze 2/3 (vizualizér, kalkulačka, DE/EN, newsletter, booking, blog, výpis vozů, Clarity) se NESTAVÍ — maximálně se nechá čisté místo v architektuře.

---

## 6. Co AI nerozhoduje (čeká na vstup)

| Věc | Kde se řeší | Co dělat mezitím |
|---|---|---|
| Hosting | `OTAZKY.md` | Docker + storage abstrakce, žádný vendor lock-in |
| Dodavatelské s.r.o. u služeb | `OTAZKY.md` / majitel | nullable sloupce, TODO v patičce a GDPR textech |
| Střešní stany (7. služba?) | `OTAZKY.md` / majitel | nestavět; redirect subdomény nechat v mapě jako TODO |
| Výpis vozů (nákup a prodej) | majitel | nestavět, nezakládat entity |
| Finální texty služeb | copywriter/klient | placeholdery `TODO-OBSAH` |
| Právní texty (GDPR, cookies) | právník/klient | kostra stránky + TODO |
| Otevírací doba, sociální sítě | majitel | klíče v `nastaveni`, prázdné hodnoty se v patičce nerenderují |

---

## 7. Definice hotovosti fáze 1

Fáze 1 = plán sekce 16: Homepage · 6 služeb · O nás · Kontakt · Galerie s filtry · Admin s rolemi · Poptávky · Ceníky HTML+PDF · GDPR stránky · SEO základ · Umami v adminu · 404/500 · jen čeština.

Hotovo znamená: launch checklist (plán sekce 19) splněný ve všech bodech, které nezávisí na klientovi, a zbytek vypsaný jako blokery s tím, kdo je má dodat.

---

## 8. CLAUDE.md (vytvořit v M0)

Do repa při scaffoldu vložit `CLAUDE.md` s: odkazem na tento soubor a plán, příkazy (`dev`, `build`, `db:migrate`, `db:seed`, `docker compose up`), tvrdými pravidly ze sekce 5 a poznámkou „rozsah fáze 1 viz AI-PLAN.md sekce 7 — nerozšiřovat“.
