# MatlGroup — plán webu

**Verze:** 1.0
**Datum:** 18. 7. 2026
**Klient:** MatlGroup (Václav Mátl) — zastřešuje Sezen Karu a Ochranné vosky
**Stav dokumentu:** pracovní podklad pro odsouhlasení rozsahu

---

## 0. Jak číst tento dokument

Dokument slouží ke třem věcem najednou:

1. **Interní plán** — co se staví, v jakém pořadí, s jakými riziky.
2. **Podklad pro klienta** — z čeho vznikne nabídka a smluvní rozsah.
3. **Checklist před spuštěním** — sekce 12.

Vše v sekci **Fáze 2 a 3** je záměrně mimo první dodávku. Pokud to klient chce dřív, mění se cena i termín — to musí být napsané, ne domluvené ústně.

---

## 1. Cíle a metriky

### Primární cíl
Web má **generovat poptávky a telefonáty** na 6 služeb v regionu. Není to vizitka, není to katalog.

### Sekundární cíle
- Sjednotit tři firmy (Sezen Karu, Ochranné vosky, MatlGroup) pod jednu důvěryhodnou značku
- Ukázat kvalitu odvedené práce (galerie před/po)
- Snížit počet opakujících se telefonátů „kolik to stojí" (ceníky + FAQ)

### Jak měříme úspěch
| Metrika | Nástroj | Cíl (6 měsíců) |
|---|---|---|
| Odeslané poptávky / měsíc | vlastní DB + Umami event | k dohodě s klientem |
| Kliky na telefon | Umami event `tel-click` | — |
| Konverzní poměr návštěva → poptávka | Umami | > 2 % |
| Pozice na klíčová slova (lokální) | Search Console | top 3 pro „antikorozní ochrana + město" |
| Core Web Vitals | PageSpeed / Search Console | vše zelené |

> **Bez čísel v tomhle sloupci nelze po roce klientovi dokázat, že investice dávala smysl.** Domluvit s klientem hned na začátku.

---

## 2. Cílové skupiny

| Skupina | Co hledá | Kam ji vedeme |
|---|---|---|
| Majitel ojetiny (35–60) | „ochrání mi to podvozek?" | Antikoroze → před/po galerie → telefon |
| Sezónní zákazník | přezutí, uskladnění pneu | Pneuservis → objednací formulář |
| Kupující auto | důvěryhodný dovoz | Nákup a prodej → reference → poptávka |
| Firma / flotila | čištění, fólie na vozový park | Detailing / Fólie → poptávka |
| Zahraniční klient (DE/EN) | přeprava vozidla | Přeprava → kalkulačka |

**Mobil bude 70–80 % návštěvnosti.** Návrh se dělá mobile-first, ne „desktop a pak to zmenšíme".

---

## 3. Informační architektura

```
/                           Homepage
/o-nas                      O nás + road mapa 3 firem
/sluzby/antikoroze
/sluzby/nakup-a-prodej
/sluzby/cisteni-a-detailing
/sluzby/folie-a-polepy
/sluzby/preprava-vozidel
/sluzby/pneuservis
/galerie                    filtrovatelná
/galerie/:slug              detail realizace
/kontakt
/casté-otazky               agregované FAQ
/cenik.pdf                  generovaný z DB
/ochrana-osobnich-udaju
/zasady-cookies
/admin/login                veřejná, noindex
/admin/*                    chráněné
404, 500                    custom
```

**Změna oproti původnímu plánu:** „Kde nás najdete" a „Časté otázky" byly na homepage jako sekce. Zůstávají tam jako sekce, ale zároveň existují jako samostatné URL — kvůli SEO a odkazovatelnosti.

---

## 4. Šablona stránky služby

Jednotná kostra pro všech 6 služeb:

1. **Hero** — název služby, jednovětný benefit, primární CTA (telefon), sekundární (poptávka)
2. **Co to je / proč to potřebujete** — 2–3 odstavce, bez marketingové vaty
3. **Jak to u nás probíhá** — 3–5 kroků, vizuálně
4. **Unikátní prvek služby** *(viz níže)*
5. **Ceník** — mini tabulka + odkaz na plný PDF ceník
6. **FAQ** — 5–8 otázek, se `FAQPage` schématem
7. **CTA blok** — telefon + formulář

### Unikátní prvek každé služby
Aby šest stránek nevypadalo jako šestkrát to samé:

| Služba | Unikátní prvek |
|---|---|
| Antikoroze | Before/after slider (posuvník přes fotku) |
| Nákup a prodej | Případová studie konkrétního nákupu s čísly |
| Čištění a detailing | Balíčky vedle sebe (základ / komplet / prémium) |
| Fólie a polepy | **Vizualizér polepu** — viz sekce 8 |
| Přeprava vozidel | Orientační kalkulačka ceny (Mapy.com API) |
| Pneuservis | **Objednání termínu** — výběr preferovaného týdne |

---

## 5. Galerie

### Datový model (návrh)

```
Realizace
├── id, slug
├── titulek
├── datum_realizace
├── sluzba_id          (FK — jedna z 6)
├── znacka             (číselník)
├── model              (text)
├── rok_vyroby         (nullable)
├── popis              (rich text, nepovinné)
├── featured           (bool — místo "indexu povedenosti")
├── poradi             (int — ruční řazení featured položek)
├── publikovano        (bool)
└── media[]
     ├── typ           (foto | video)
     ├── role          (before | after | process | hlavni)
     ├── alt_text      (POVINNÉ)
     ├── poradi
     └── varianty[]    (webp/avif × šířky)
```

### Filtry
Služba · Značka · Rok · pouze před/po
**Filtrování a stránkování běží na serveru.** Frontend nikdy nedostane data, která nemá zobrazit.

### Změna oproti původnímu plánu
❌ „Tajný index povedenosti 0–100" — **vypustit.** Nikdo nebude u každé fotky rozhodovat mezi 73 a 81. Nebude se to vyplňovat a pole zůstane prázdné.
✅ Nahrazeno `featured` (bool) + ruční `poradi`. Jednoduché, klient to reálně použije.

### Fulltextové vyhledávání
Ano, ale jednoduše — hledá v titulku, značce, modelu, popisu. Ne elasticsearch, stačí SQL `ILIKE` / `tsvector`.

---

## 6. Admin panel a uživatelé

### Přístup — REVIDOVÁNO
Původní plán: „schovaný" admin dostupný jen přes search bar.
**Nový plán: veřejná přihlašovací stránka `/admin/login`.**

To je správné rozhodnutí. Skrývání URL není bezpečnost (security through obscurity) a jen komplikuje život klientovi. Bezpečnost musí stát na autentizaci, ne na tom, že někdo neuhodne adresu.

Podmínky:
- `<meta name="robots" content="noindex, nofollow">` + `Disallow: /admin` v robots.txt
- Stránka nesmí nikde na webu být prolinkovaná

### Uživatelé a role

| Role | Kdo | Oprávnění |
|---|---|---|
| **Superadmin** | vývojář (já) | vše + správa uživatelů + technická nastavení |
| **Admin** | Václav Mátl | obsah, ceníky, poptávky, galerie, uživatelé |
| **Editor** *(rezerva)* | budoucí zaměstnanec | jen obsah a galerie, ne ceníky a nastavení |

**Každý uživatel má vlastní účet.** Žádný sdílený login na firemní mail — jinak nejde zjistit, kdo co udělal.

> **Do smlouvy patří:** co se stane s účtem vývojáře po předání projektu. Buď se maže, nebo se explicitně sjedná jako součást podpory. Neřešit to je nepříjemné pro obě strany.

### Bezpečnostní minimum (nepodkročitelné)
- [ ] Hesla hashovaná **argon2id** (nebo bcrypt cost ≥ 12). Nikdy plain, nikdy MD5/SHA1
- [ ] Rate limiting na login — např. 5 pokusů / 15 min / IP + per účet
- [ ] Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, rozumná expirace
- [ ] CSRF ochrana na všech mutacích
- [ ] Reset hesla přes časově omezený jednorázový token na e-mail
- [ ] Vynucená změna hesla při prvním přihlášení
- [ ] Audit log: kdo, kdy, co změnil
- [ ] Celý web pod HTTPS + HSTS
- [ ] **2FA (TOTP)** — minimálně nabídnout, ideálně vynutit pro superadmina

### Funkce adminu
- Realizace: přidat / upravit / smazat / publikovat, drag & drop řazení médií
- Upload obrázků s automatickým zpracováním (viz sekce 9)
- Ceníky: editace položek → z nich se generuje HTML i PDF
- Poptávky: seznam, detail, stav (nová / v řešení / vyřízená / spam), export CSV
- Statistiky návštěvnosti (viz sekce 7)
- Správa uživatelů (superadmin/admin)
- Texty na stránkách — **rozsah k dohodě**, viz poznámka níže

> ⚠️ **Pozor na rozsah:** „editovatelné všechno" znamená postavit CMS. Doporučuji: editovatelné jsou **ceníky, FAQ, galerie, kontaktní údaje, otevírací doba**. Layout a hlavní texty stránek se mění přes vývojáře. Jinak rozsah vybouchne a klient si stejně rozbije design.

---

## 7. Analytika a sledování chování — NOVÁ SEKCE

Cíl: klient vidí přímo v adminu, kolik lidí chodí, odkud, kam klikají a kde odcházejí. Zdarma.

### Doporučená sestava

**Vrstva 1 — návštěvnost a konverze: Umami**

Umami je open-source analytika bez cookies a bez sbírání osobních údajů, díky čemuž je ve výchozím stavu v souladu s GDPR. Skript má pod 2 kB, takže web nezpomalí.

Dvě varianty nasazení:
- **Umami Cloud, Hobby plán** — trvale zdarma, 100 000 událostí měsíčně, 3 weby, bez karty. Pro tenhle web bohatě stačí.
- **Self-hosted** — MIT licence, Docker + PostgreSQL, běží i na malém VPS. Plná kontrola nad daty, náklad ~5–15 $/měsíc za server.

**Napojení na admin panel** — Umami má plné REST API a nabízí tři cesty:
1. **Share URL v iframe** — nejrychlejší, veřejný read-only odkaz na dashboard vložený do adminu. *(Pozor: u self-hostu je iframe blokovaný hlavičkou `X-Frame-Options: SAMEORIGIN`, je potřeba ji upravit.)*
2. **Vlastní dashboard přes API** — backend se autentizuje (self-host: `POST /api/auth/login`; Cloud: hlavička `x-umami-api-key`), stáhne statistiky a časové řady a ty se vykreslí libovolnou grafovou knihovnou.
3. **Hotový API klient** — existují knihovny, které pokrývají běžnou podmnožinu API.

**Doporučení:** varianta 2 — vlastní widgety v adminu ve stylu webu, jen 4–5 čísel, která klienta reálně zajímají:
- Návštěvy za 7 / 30 dní + trend
- Nejnavštěvovanější stránky
- Odkud lidé chodí (Google / Facebook / přímo)
- Mobil vs. desktop
- **Odeslané poptávky a kliky na telefon** ← tohle je to jediné, co majitele opravdu zajímá

⚠️ **Volání API běží vždy ze serveru**, nikdy z prohlížeče. Token nesmí do frontendu.

**Vlastní události k měření:**
`poptavka-odeslana` · `tel-click` · `cenik-pdf-download` · `galerie-filtr` · `kalkulacka-pouzita` · `vizualizer-export`

---

**Vrstva 2 — kam lidé klikají a jak scrollují: Microsoft Clarity**

Clarity je zdarma a bez limitu poskytuje heatmapy kliků a scrollu, nahrávky sessions a AI shrnutí. To je přesně „kam lidi klikají a kam chodí nejčastěji".

**Ale — a tohle je důležité:**

- Clarity používá cookies a nahrává chování uživatele, což je zpracování osobních údajů. **Vyžaduje výslovný opt-in souhlas** před jakýmkoli spuštěním, ne jen lištu s „OK".
- Microsoft od podzimu 2025 vyžaduje pro návštěvníky z EHP, UK a Švýcarska **Consent Mode**. Bez něj Clarity data nesbírá.
- Napojení musí jít přes **Clarity Consent API**, propojené s cookie lištou.
- Nahrávky se drží 90 dní. **Export dat je omezený** — sdílení odkazů na nahrávky a screenshoty heatmap ano, hromadný export syrových dat ne. Do adminu se proto Clarity **nedá smysluplně vložit**, klient si ji otevře zvlášť.
- Ve formulářích je nutné maskovat pole s osobními údaji.

### Výsledné rozhodnutí

| | Umami | Clarity |
|---|---|---|
| Cena | zdarma | zdarma |
| Cookies | ne | ano |
| Souhlas nutný | **ne** | **ano (opt-in)** |
| V adminu | ✅ přes API | ❌ jen externě |
| Co dá | čísla, konverze | heatmapy, nahrávky |

**Plán:**
1. **Umami běží vždy**, bez souhlasu, integrovaný do adminu. Toto je páteř měření.
2. **Clarity se spouští jen po souhlasu** přes Consent API. Zapnout na 2–3 měsíce po spuštění, vyhodnotit UX, pak klidně vypnout.

> **Vedlejší efekt, který stojí za zmínku:** pokud by běželo *jen* Umami, web by nepotřeboval cookie lištu vůbec. To je lepší UX, vyšší konverze i menší právní riziko. Cookie lišta je nutná **jen kvůli Clarity**. Zvážit s klientem, jestli to za to stojí — můj názor: první 3 měsíce ano (potřebujeme vidět, kde web drhne), pak vypnout a lištu odstranit.

**Google Search Console** — nasadit vždy, zdarma, žádný souhlas (neběží na webu). Nezastupitelná pro SEO.

---

## 8. Vizualizér polepů (fólie) — NOVÁ SEKCE

**Odpověď na otázku „šlo by to?" — ano, jde. Realisticky a bez WebGL šamanismu.**

### Princip

Nejde o 3D. Jde o **2D vrstvení nad fotkou z boku** — a to úplně stačí, protože bokorys je přesně to, co si zákazník chce představit.

```
Vrstva 4:  UI ovládání (posun, zoom, rotace)
Vrstva 3:  stínová mapa auta   (mix-blend-mode: multiply)  ← vrací lesk a stíny
Vrstva 2:  DESIGN uživatele    (clip-path = maska karoserie) ← posouvatelný
Vrstva 1:  fotka auta          (podklad)
```

Klíč je **maska karoserie**: SVG cesta, která vymezuje plochu k polepení a vyřezává okna, kola, světla, kliky, mezery mezi dveřmi. Design se přes `clip-path` ořízne přesně na tuhle plochu. Stínová vrstva (výřez z původní fotky, převedený na jas) se položí navrch v režimu `multiply` — díky tomu design nevypadá jako nalepený papír, ale kopíruje odlesky a stíny plechu.

### Co to znamená prakticky

**Jednorázová práce na každé auto:** vyfotit z boku (stativ, kolmo, rovnoměrné světlo) a v editoru vytvořit masku. Odhad **2–4 hodiny na jeden vůz.**

> 💡 **Foťte světlá auta — bílá nebo stříbrná.** Režim `multiply` funguje tak, že tmavne. Na černém autě se design ztratí.

**Technologie:** Canvas přes **Konva.js** nebo **Fabric.js** (transformace, drag, zoom, export z krabice), nebo čisté CSS `clip-path` + `mix-blend-mode` pro náhled a canvas jen pro export. Stažení = `canvas.toBlob()`.

### Rozsah MVP

- 3–5 modelů aut na výběr (dodávka, osobní, SUV…)
- Upload vlastního obrázku (PNG/JPG/SVG, limit 10 MB)
- Posun, zoom, rotace, překlopení, průhlednost
- Volba, jestli design pokrývá celé auto nebo jen dveře
- **Stáhnout náhled** (s vodoznakem a logem)
- **„Poslat nám tenhle návrh"** ← *nejdůležitější tlačítko*

### Proč je poslední bod ten hlavní

Vizualizér není hračka, je to **generátor poptávek**. Tlačítko musí předvyplnit poptávkový formulář a přiložit vygenerovaný obrázek. Zákazník, který si strávil pět minut posouváním svého loga po dodávce, je nejteplejší lead, jaký na tom webu bude.

Zvážit i uložení návrhu pod odkazem, který se dá poslat kolegovi.

### Rizika a co ohlídat
- **Vodoznak povinný** — jinak si někdo stáhne vizualizaci a jde s ní ke konkurenci
- **Disclaimer:** „Orientační vizualizace. Skutečný výsledek se liší podle tvaru karoserie, materiálu fólie a barvy laku. Nejde o závaznou nabídku."
- Nahrané soubory **mazat po 24 h** (a napsat to do zásad ochrany osobních údajů)
- Ověřit typ souboru na serveru, ne podle přípony — SVG od uživatele může obsahovat skript, je nutné ho sanitizovat
- Omezit rozlišení kvůli paměti na mobilech
- Fotky aut musí být ze **stejného originu** jako web, jinak canvas „ztmavne" (tainted canvas) a export přestane fungovat

### Náročnost
| Část | Hodiny |
|---|---|
| Příprava fotek + masek (5 aut) | 10–20 |
| Editor (canvas, transformace, UI) | 25–40 |
| Export, vodoznak, napojení na poptávku | 10–15 |
| **Celkem** | **45–75 h** |

**Toto NENÍ součástí základní ceny.** Je to samostatná položka. Buď fáze 2, nebo příplatek.

---

## 9. Technické požadavky

### Obrázková pipeline
Galerie před/po znamená stovky fotek. Bez tohohle bude web pomalý:
- Automatický resize + komprese při uploadu (limit velikosti nahrávaného souboru)
- Generování variant: **AVIF + WebP + JPEG fallback**, šířky 400/800/1200/1600
- `srcset` + `sizes` na frontendu
- Povinné `width`/`height` (kvůli CLS)
- `loading="lazy"` mimo první viewport
- **Povinné pole pro alt text v adminu**
- Odstranění EXIF (GPS!) z nahrávaných fotek

### Výkon — cílové hodnoty
LCP < 2,5 s · CLS < 0,1 · INP < 200 ms — a to na mobilu, na 4G, ne na tvém notebooku.

### Stavy rozhraní
Do plánu i do designu patří i to, co se stane, když věci nefungují:
- Načítání (skeleton, ne spinner)
- Prázdný výsledek filtru („Nic nenalezeno, zkuste…")
- Chyba načtení galerie
- Chyba odeslání formuláře — **a text nesmí zmizet**
- Offline stav

### Přístupnost
- Kontrast textu min. 4,5:1
- Viditelný focus stav na všech interaktivních prvcích
- Ovladatelnost klávesnicí (hlavně menu a filtry galerie)
- Alt texty všude
- **`prefers-reduced-motion`** — při plánovaném množství animací povinné
- Formuláře: `<label>`, popis chyby textem, ne jen červeným rámečkem

---

## 10. Formulář poptávky

### Chování
- **Poptávka se ukládá primárně do databáze.** E-mail je jen notifikace.
  *(Původní plán to měl obráceně. Když spadne SMTP nebo mail skončí ve spamu, klient přijde o zakázku.)*
- Automatické potvrzení odesílateli
- Notifikace na firemní mail + záznam v adminu

### Ochrana
- Honeypot pole + **Cloudflare Turnstile** (zdarma, bez otravných puzzle)
- Rate limit na IP
- Ošetření e-mail header injection
- Validace na serveru, ne jen v prohlížeči

### Pole
Jméno · Telefon · E-mail · Služba (předvyplněná podle stránky) · Zpráva · *(volitelně)* Značka a model auta · *(volitelně)* Fotky

### Souhlasy — dvě samostatná zaškrtávátka
1. ☐ Souhlas se zpracováním osobních údajů *(povinné, s odkazem na zásady)*
2. ☐ Chci dostávat novinky a nabídky *(NEPOVINNÉ, PŘEDEM NEZAŠKRTNUTÉ)*

> ⚠️ Původní formulace „registrace k newsletteru pod záminkou občasných slev" — takhle to nejde. Newsletter nesmí být podmínkou odeslání poptávky a musí být samostatná volba. A pokud se slevy slíbí, musí reálně chodit.

---

## 11. GDPR a právní minimum

- [ ] Stránka **Zásady ochrany osobních údajů** (kdo je správce, co se sbírá, právní titul, doba uchování, práva subjektu, kontakt)
- [ ] Stránka **Zásady cookies** se seznamem cookies
- [ ] **Cookie lišta s opt-in** — odmítnutí musí být stejně snadné jako souhlas. Nic se nespouští před souhlasem.
- [ ] Newsletter: **double opt-in** + odhlašovací odkaz v každém e-mailu
- [ ] Zpracovatelské smlouvy (hosting, mailing, Microsoft za Clarity)
- [ ] Doba uchování poptávek + automatické mazání starých
- [ ] Povinné identifikační údaje v patičce (IČO, DIČ, sídlo)

**Doporučení:** nesbírat datum narození kvůli narozeninovým poukazům. Přidává citlivější údaj a přínos to nevyváží. Vánoční poukazy stačí posílat všem najednou.

---

## 12. SEO — chybělo v původním plánu úplně

- [ ] Unikátní `title` a `meta description` pro každou stránku, editovatelné
- [ ] Open Graph + Twitter Card (kvůli sdílení na Facebooku)
- [ ] **Schema.org:** `LocalBusiness`/`AutoRepair` (adresa, otevírací doba, telefon), `Service` na každé službě, `FAQPage`, `BreadcrumbList`, `ImageObject` v galerii
- [ ] `sitemap.xml` generovaná automaticky
- [ ] `robots.txt`
- [ ] Canonical URL
- [ ] Sémantické `<h1>`–`<h3>`, jedna `<h1>` na stránku
- [ ] Čitelné URL (`/sluzby/antikoroze`, ne `/page?id=4`)
- [ ] **301 přesměrování ze starých webů** ← *nejdražší chyba, když se zapomene. Detailně viz sekce 20.*
- [ ] Google Search Console + ověření vlastnictví
- [ ] **Google Business Profile** — u lokální služby pravděpodobně větší zdroj poptávek než web samotný. Aktualizovat, doplnit fotky z galerie, hlídat recenze.

### Recenze
Průměrné hodnocení nesmí být natvrdo v HTML — zastará. Buď Google Places API (max 5 recenzí, povinná atribuce), nebo ručně vybrané citace se souhlasem. **Scrapovat Google recenze nelze**, je to proti podmínkám.

### Statistiky na homepage
❌ „ochota" — není měřitelná
✅ počet ošetřených vozů · roky na trhu · průměrné hodnocení + počet recenzí · počet služeb na jednom místě

---

## 13. Vícejazyčnost

**Rozhodnutí: spustit v češtině. DE a EN až ve fázi 2.**

Důvody:
- Ztrojnásobuje obsah, překlady, ceníky, popisky v galerii a veškerou budoucí údržbu
- Antikoroze, pneuservis, detailing a fólie jsou **čistě lokální služby** — návratnost cizojazyčné verze je blízká nule
- Smysl dává jen u **přepravy vozidel** a **nákupu a prodeje**

### Až se to bude dělat
- `hreflang` pro cs/en/de + `x-default`
- Canonical na každou jazykovou verzi
- **Ruční přepínač v navigaci**

> ⚠️ **Automatické přesměrování podle jazyka prohlížeče: NE.** Google to nedoporučuje, rozbíjí to indexaci a naštve to uživatele — Čech s anglickým systémem dostane anglickou verzi. Detekce se smí použít maximálně k nabídnutí ("Switch to English?"), nikdy k přesměrování.

---

## 14. Ostatní prvky

### Ceníky
- **Jeden zdroj pravdy: databáze.** Z ní se generuje HTML tabulka i PDF.
- PDF generované automaticky (ne ručně udržované) — jinak se za tři měsíce rozejdou
- U každé ceny: „od" / „orientační" podle typu služby

### Patička
Sociální sítě firmy (IG, FB, YT) · sociální sítě majitele (IG, WhatsApp) · e-mail · adresa a mapa · otevírací doba · IČO, DIČ · logo · zkrácená navigace · odkazy na zásady · podpis vývojáře

### Animace
- Custom loading obrázků (skeleton)
- Reakce na každou uživatelskou akci — hover, focus, active, disabled, loading
- Scroll animace u road mapy
- **`prefers-reduced-motion` povinně**
- Na mobilu výrazně méně — animace tam působí jako sekání

### Kalkulačka přepravy
- Mapy.com API + reverzní geokódování + routing
- ⚠️ **API klíč patří na server, ne do frontendu.** Jinak ho někdo vytáhne z devtools.
- Ověřit podmínky komerčního použití a limity. Alternativa: OSRM / OpenRouteService.
- Cache výsledků pro opakované dotazy
- Disclaimer: orientační, nezávazné

### 404 a 500
Custom stránky s odkazem na hlavní služby a vyhledáváním.

---

## 15. Co v plánu chybělo úplně

Body, které nejsou „funkce", ale bez nich projekt není profesionální dodávka:

- [ ] **Obsahový plán** — kdo napíše který text, do kdy. 6 služeb ≈ 15–20 textů. *Tohle projekty zabíjí nejčastěji.*
- [ ] **Fotografický plán** — konkrétní seznam, co nafotit. Bez fotek nezachrání web ani nejlepší design. **Žádné stock fotky.**
- [ ] **Vizuální koncept** — typografie, barvy, grid, komponentová knihovna. V původním plánu ani slovo. *Nadprůměrnost se rozhodne tady, ne ve struktuře.*
- [ ] **Hosting, doména, SSL, zálohy** — kdo platí, kdo spravuje
- [ ] **Zálohovací strategie** — DB i média, s ověřenou obnovou
- [ ] **Monitoring dostupnosti** (UptimeRobot zdarma)
- [ ] **Předání a školení klienta** + krátká dokumentace adminu
- [ ] **Servisní smlouva po spuštění**

---

## 16. Fázování

### Fáze 1 — spuštění
Homepage · 6 stránek služeb · O nás · Kontakt · Galerie s filtry · Admin s uživateli · Poptávka · Ceníky (HTML + PDF) · GDPR stránky · SEO základ · Umami v adminu · 404/500 · **jen čeština**

### Fáze 2 — do 3 měsíců po spuštění
DE a EN verze · Kalkulačka přepravy · **Vizualizér polepů** · Newsletter · Objednání termínu pneuservis · Clarity (dočasně)

### Fáze 3 — dle výsledků
Blog · Vánoční a narozeninové poukazy · **Výpis vozů na prodej** (viz níže)

> 🔴 **Zásadní otázka k vyjasnění s klientem:** u služby „Nákup a prodej" chybí **výpis aktuálně nabízených vozů** (značka, model, rok, km, cena, fotky, stav). Pokud firma reálně prodává auta, zákazníci to budou čekat. Je to samostatná entita v adminu a významně zvětšuje rozsah.
> **Buď to do rozsahu patří a nacení se, nebo se musí ve smlouvě výslovně vyloučit.** Nechat to nedořešené znamená, že to klient bude čekat zadarmo.

---

## 17. Odhad pracnosti

| Fáze | Hodiny |
|---|---|
| Analýza, IA, wireframy | 20–30 |
| UI design (mobil + desktop, ~10 šablon + komponenty) | 50–80 |
| Frontend implementace | 80–120 |
| Backend, admin, autentizace, role | 60–90 |
| Galerie, filtry, obrázková pipeline | 20–30 |
| Analytika + widgety v adminu | 8–12 |
| Vícejazyčnost *(fáze 2)* | 15–25 |
| Kalkulačka *(fáze 2)* | 10–15 |
| Vizualizér polepů *(fáze 2)* | 45–75 |
| SEO, schema, přístupnost | 15–25 |
| QA, nasazení, dokumentace, školení | 20–30 |
| **Fáze 1 celkem** | **~275–420 h** |

### Mimo hlavní cenu
| Položka | Cena |
|---|---|
| Copywriting | 15–40 tis. Kč |
| Fotograf (půlden – den) | 8–20 tis. Kč |
| Překlady EN + DE | 20–40 tis. Kč |
| Hosting, zálohy, údržba | **2–5 tis. Kč / měsíc** |

---

## 18. Smluvní ošetření

Bez tohohle se projekt zasekne — u šesti služeb skoro jistě.

- [ ] **Pevně vymezený rozsah** + explicitní seznam toho, co v ceně **není**
- [ ] **Změny nad rámec = příplatek**, písemně odsouhlasený
- [ ] **Platby po milnících:** 30 % záloha / 40 % po schválení designu / 30 % při spuštění
- [ ] **Termín dodání obsahu klientem** a co se stane, když ho nedodá (posun termínu, pozastavení, fakturace)
- [ ] Počet kol revizí designu (např. 2 + další za příplatek)
- [ ] Autorská práva — kdy přechází na klienta (typicky po doplacení)
- [ ] Právo uvést projekt v portfoliu
- [ ] Záruční doba na chyby vs. placená údržba
- [ ] Osud účtu vývojáře v adminu po předání

---

## 19. Checklist před spuštěním

**Technické**
- [ ] HTTPS + HSTS
- [ ] 301 přesměrování ze starého webu
- [ ] robots.txt + sitemap.xml
- [ ] Search Console ověřená
- [ ] Umami měří, události fungují
- [ ] Zálohy běží a **obnova je otestovaná**
- [ ] Monitoring dostupnosti
- [ ] Custom 404 a 500
- [ ] Formulář otestovaný z reálného zařízení, mail dorazil
- [ ] Test na skutečném mobilu, ne jen v devtools

**Obsah**
- [ ] Žádný lorem ipsum, žádné „yaping about the theme"
- [ ] Všechny obrázky mají alt text
- [ ] Ceníky aktuální a shodné s PDF
- [ ] Kontakty, IČO, otevírací doba ověřené

**Právní**
- [ ] Zásady ochrany osobních údajů online
- [ ] Zásady cookies online
- [ ] Cookie lišta funguje a odmítnutí je stejně snadné jako souhlas
- [ ] Newsletter je samostatné nezaškrtnuté pole

**Kvalita**
- [ ] Lighthouse ≥ 90 ve všech kategoriích
- [ ] Core Web Vitals zelené
- [ ] Průchod klávesnicí
- [ ] Chrome, Safari, Firefox + iOS Safari

---

*Připomínky a změny rozsahu prosím písemně, ať se to nerozjede.*

---

# ČÁST II — MIGRACE ZE STÁVAJÍCÍCH WEBŮ

*(Doplněno 18. 7. 2026 na základě auditu stávajících webů.)*

---

## 20. Co je 301 přesměrování a proč je to kritické

### Vysvětlení

Když prohlížeč nebo Google požádá server o adresu, server odpoví číselným kódem. `200` = "tady to je". `404` = "neexistuje". A **`301` = "tahle stránka se natrvalo přestěhovala sem"**.

To slovo **natrvalo** je celý vtip. Existuje ještě `302`, což znamená "dočasně" — a to je pro stěhování webu špatně, protože Google si u 302 řekne „počkám, ono se to vrátí" a nic nepřenese.

### Proč na tom záleží

Stránka `ochranapodvozkuvoskem.cz/index.php/cenik` má za roky existence nasbíranou hodnotu:

- Google ji zná a řadí ji ve výsledcích vyhledávání
- Někdo na ni odkazuje z fóra o karavanech
- Lidé ji mají v záložkách
- Je vytištěná na letáku nebo v e-mailu klientovi

Když web přepneš a tahle adresa začne vracet 404, **všechna ta hodnota zmizí naráz.** Google tě z výsledků vyhodí, návštěvník uvidí chybu a odejde ke konkurenci. Nejhorší je, že se to nestane hned — pozice padají postupně během několika týdnů a klient tomu pak říká „ten nový web nám zabil byznys".

S 301 přesměrováním se stane pravý opak: prohlížeč návštěvníka automaticky odveze na novou adresu (ani si toho nevšimne) a Google přesune hodnocení ze staré adresy na novou.

### Jak to vypadá v praxi

Prostý seznam „odkud → kam", který se nahraje na server:

```
ochranapodvozkuvoskem.cz/index.php/cenik
   → 301 → matlgroup.cz/sluzby/antikoroze#cenik

sezenkaru.cz/index.php/pneuservis/cenik-pneuservisu
   → 301 → matlgroup.cz/sluzby/pneuservis#cenik

sezenkaru.cz/index.php/kontakt
   → 301 → matlgroup.cz/kontakt
```

### Pravidla, která se nesmí porušit

1. **Každá stará URL → tematicky nejbližší nová stránka.** Ne všechno na homepage — to Google vyhodnotí jako "soft 404" a hodnotu nepřenese.
2. **Přesměrování musí být `301`, ne `302`.**
3. **Žádné řetězení.** `A → B → C` je špatně, musí být `A → C` přímo.
4. **Nechat běžet minimálně rok**, ideálně natrvalo. Přesměrování se nemažou.
5. **Domény se nesmí zrušit.** Musí zůstat zaplacené, jinak přesměrování nemá odkud fungovat. *(Tohle je nejčastější způsob, jak se to celé po roce rozbije — někomu vyprší doména.)*

---

## 21. Audit stávajícího stavu

### 21.1 Nalezené domény

Firma dnes běží na **čtyřech** doménách, ne jedné. Tohle je hlavní příčina „přeskakování mezi doménami" při proklikávání.

| Doména | Obsah | Technologie | Stav |
|---|---|---|---|
| `www.sezenkaru.cz` | rozcestník, pneuservis, čištění, kontakt | Joomla + Nicepage 8.1.4 | funkční |
| `ochranapodvozkuvoskem.cz` | antikoroze (hlavní obsah, ceník) | Joomla + Nicepage 7.7.3 | funkční |
| `ochrannevosky.cz` | kopie antikoroze pro rakouský trh (+ `/de/`) | statické HTML, Nicepage 8.1.4 | funkční, ale nedodělaná |
| `stanynaauto.sezenkaru.cz` | střešní stany | ? | **🔴 vrací 404** |

> Odkaz na střešní stany je v hlavní navigaci `sezenkaru.cz` a **vede na neexistující stránku**. Návštěvník, který o stany má zájem, skončí na chybové stránce. Nahlásit klientovi hned, nemusí čekat na nový web.

### 21.2 Proč to „přeskakuje mezi doménami"

Není to rozbité přesměrování — je to **záměrná, ale špatně provedená architektura**. Tři samostatné weby na třech doménách si navzájem odkazují v hlavním menu:

- `sezenkaru.cz` → položka menu „Antikorozní ochrana" vede na `ochranapodvozkuvoskem.cz`
- `ochranapodvozkuvoskem.cz` → položka „Další služby" vede zpět na `sezenkaru.cz`
- `ochranapodvozkuvoskem.cz` → tlačítko „Für österreichische Kunden / Eintreten" vede na `ochrannevosky.cz`
- `ochrannevosky.cz` má vlastní přepínač vlajek CZ / AT

Uživatel to vnímá jako jeden web, ale skáče mezi třemi různými designy, třemi navigacemi a třemi značkami. **To je přesně ten problém, který nový web řeší.**

Pro SEO je to navíc dvojnásobná škoda: `ochranapodvozkuvoskem.cz` a `ochrannevosky.cz` mají **prakticky identický obsah** (stejné texty o nových / ojetých / terénních vozidlech a karavanech). To je duplicitní obsah — Google jednu z nich potlačí a obě si navzájem berou sílu.

### 21.3 Další technické nálezy

- **Nekonzistentní URL:** `sezenkaru.cz` má v adresách `/index.php/` (typický Joomla otisk), `ochrannevosky.cz` má v adresách **diakritiku** (`/Nová-vozidla.html`, `/Ceník.html`) — to je zdroj problémů s kódováním a sdílením odkazů
- **Odkaz „Recenze"** v menu vede na dlouhou Google URL s vloženým časovým razítkem z prosince 2023 — ošklivé a křehké
- **Duplicitní parametry** v odkazech na ochranu osobních údajů (`&Itemid=115&Itemid=115`)
- **Relativní cesty rozbité** — odkaz na GDPR ze stránky pneuservisu vede na `/index.php/pneuservis/index.php?...`
- **Zbytky šablony v ostrém provozu:** na `ochranapodvozkuvoskem.cz` a hlavně `ochrannevosky.cz` je v galerii **„Sample Title / Sample Text" a „Název vzorku / Ukázka textu"** — nevyplněné placeholdery z Nicepage. Na `ochrannevosky.cz` je i „Ukázka nadpisu"
- **E-mail schovaný přes JavaScript** ("Tato e-mailová adresa je chráněna před spamboty") — funguje proti spamu, ale zhoršuje použitelnost. Lepší je normální `mailto:` odkaz plus serverový formulář
- **Chybí Open Graph obrázky** — sdílení na Facebooku vypadá špatně
- **Meta keywords** se používají na všech doménách — Google je ignoruje od roku 2009, zbytečné
- **Meta description je na všech stránkách stejná** („Provádíme antikorozní ochranu vozidel") nebo úplně chybí
- **Prázdné `<img>` tagy** na `ochranapodvozkuvoskem.cz` (obrázky u sekce ochrana dutin/podvozků se nenačítají)
- Na `ochrannevosky.cz` odkazy „Kontaktujte nás" a obrázky vedou **na homepage místo na cíl**

### 21.4 Co se dělá dobře a MUSÍ se to zachovat

Ne všechno je špatně. Tohle jsou reálná aktiva:

- ✅ **Certifikace Autorizované servisní centrum antikorozní ochrany vozidel** — silný důvěryhodnostní prvek, patří na homepage nového webu
- ✅ **Loga partnerů** — Antikorozní centrum, Dekalin, Dinitrol
- ✅ **Detailní a věcně napsaný ceník antikoroze** s příklady konkrétních modelů — to je nadprůměrně dobrý obsah, jinde v oboru se to nevidí
- ✅ **Popis „Jak postupovat"** ve třech krocích s fotkami před/po
- ✅ **Segmentace podle typu vozidla** (nová / ojetá / terénní / karavany) — chytré, uživatel se v tom najde. Zachovat jako filtr nebo podsekci
- ✅ **„Prvotní prohlídku a kalkulaci provedeme zdarma"** — silné CTA, dát výrazně
- ✅ **Motto „Kvalitně odvedená práce = spokojený zákazník"**
- ✅ Fotky procesu (zakrývání, demontáž kol, before/after) — kvalitní podklad pro galerii
- ✅ Detail „Každý zákazník obdrží při čekání kávu" — takové drobnosti prodávají

---

## 22. Migrační plán

### 22.1 Cílová architektura

```
matlgroup.cz  ← jediný web, jediná značka

sezenkaru.cz              → 301 → matlgroup.cz (zachovat doménu!)
ochranapodvozkuvoskem.cz  → 301 → matlgroup.cz (zachovat doménu!)
ochrannevosky.cz          → 301 → matlgroup.cz/de/... (viz níže)
stanynaauto.sezenkaru.cz  → 301 → matlgroup.cz/sluzby/... (opravit 404!)
```

> ⚠️ **Domény ponechat zaregistrované a zaplacené natrvalo.** Jsou na letácích, ve fakturách, v Google, na Facebooku a v hlavách zákazníků. Zrušení domény = ztráta všeho.
>
> Zvážit i registraci `sezenkaru.cz` a `matlgroup.cz` variant (`.com`, s pomlčkou) proti squatterům.

### 22.2 Mapa přesměrování

Kompletní seznam se dodělá exportem všech URL ze starých webů (Screaming Frog v bezplatné verzi do 500 URL bohatě stačí). Základ:

| Stará URL | Nová URL |
|---|---|
| `sezenkaru.cz/` a `/index.php` | `matlgroup.cz/` |
| `sezenkaru.cz/index.php/kontakt` | `/kontakt` |
| `sezenkaru.cz/index.php/pneuservis/sluzby-pneuservisu` | `/sluzby/pneuservis` |
| `sezenkaru.cz/index.php/pneuservis/cenik-pneuservisu` | `/sluzby/pneuservis#cenik` |
| `sezenkaru.cz/index.php/cisteni-vozidel/kompletni-cisteni` | `/sluzby/cisteni-a-detailing` |
| `sezenkaru.cz/index.php/cisteni-vozidel/cenik-cisteni-interieru` | `/sluzby/cisteni-a-detailing#cenik-interier` |
| `sezenkaru.cz/index.php/cisteni-vozidel/cenik-cisteni-exterieru` | `/sluzby/cisteni-a-detailing#cenik-exterier` |
| `stanynaauto.sezenkaru.cz/*` | `/sluzby/stresni-stany` *(pokud služba zůstává)* |
| `ochranapodvozkuvoskem.cz/` | `/sluzby/antikoroze` |
| `.../index.php/cenik` | `/sluzby/antikoroze#cenik` |
| `.../index.php/o-nas` | `/o-nas` |
| `.../index.php/o-nas/priprava-pred-aplikaci` | `/sluzby/antikoroze#priprava` |
| `.../index.php/o-nas/ukazky` | `/galerie?sluzba=antikoroze` |
| `.../index.php/vozidla/nova-a-sportovni` | `/sluzby/antikoroze#nova-vozidla` |
| `.../index.php/vozidla/ojeta-a-historicka` | `/sluzby/antikoroze#ojeta-vozidla` |
| `.../index.php/vozidla/terenni-a-dodavky` | `/sluzby/antikoroze#terenni-vozidla` |
| `.../index.php/vozidla/obytna-a-karavany` | `/sluzby/antikoroze#karavany` |
| `.../index.php/kontakt` | `/kontakt` |
| `.../images/Cenik_2026.pdf` | `/cenik-antikoroze.pdf` |
| GDPR stránky (obě domény) | `/ochrana-osobnich-udaju` |
| `ochrannevosky.cz/*` | odpovídající `/de/...` *(nebo dočasně `/sluzby/antikoroze`)* |
| **cokoli neošetřeného** | homepage — **až jako poslední záchrana** |

> Pozor: `#kotva` v cíli přesměrování Google při vyhodnocování ignoruje. Pokud jsou sekce ceníku SEO důležité, měly by mít vlastní URL, ne jen kotvu. **Doporučení: `/sluzby/antikoroze/cenik` jako samostatná stránka.** Ceník antikoroze je na starém webu evidentně vstupní branou pro hodně návštěvníků.

### 22.3 Postup migrace

**Před spuštěním**
1. Export všech URL ze všech 4 domén (Screaming Frog / `sitemap.xml`)
2. Screenshot / archiv celého starého obsahu — **než se cokoli smaže**
3. Stažení všech fotek v původním rozlišení
4. Export ceníků, PDF, textů
5. Vytvořit mapu přesměrování jako CSV
6. Přístupy do Search Console pro **všechny čtyři** domény (nejspíš zatím neexistují — je potřeba ověřit vlastnictví přes DNS)
7. Zaznamenat současné pozice ve vyhledávání jako výchozí stav — jinak se po spuštění nedá poznat, jestli něco spadlo

**Spuštění**
8. Nasadit nový web na `matlgroup.cz`
9. Nahodit všechna přesměrování **současně** se spuštěním, ne později
10. Odeslat nové `sitemap.xml` do Search Console
11. V Search Console podat **změnu adresy** (Change of Address) pro každou starou doménu
12. Aktualizovat Google Business Profile — odkaz na web + nový název, pokud se mění
13. Aktualizovat odkaz na Facebooku (`facebook.com/sezenkarucz`) a Instagramu

**Po spuštění — první měsíc**
14. Denně kontrolovat Search Console → Pokrytí → chyby 404
15. Sledovat propad návštěvnosti (krátkodobý pokles ~10–20 % je normální, delší než 6 týdnů znamená problém)
16. Doplňovat přesměrování pro URL, které se v logách objevují a nejsou pokryté
17. Oslovit weby, které odkazují na staré domény, ať odkaz změní (zjistit přes Search Console → Odkazy)

### 22.4 Rebranding — riziko, které je nutné pojmenovat

Přechod ze **Sežeňkáru.cz** a **Ochrana podvozku voskem** na **MatlGroup** není jen výměna webu, je to změna značky. Rizika:

- Lidé hledají „sežeň káru" a „ochrana podvozku voskem" — pod „matlgroup" je nikdo hledat nebude
- Název `sezenkaru.cz` obsahuje klíčové slovo, `matlgroup` nic neříká
- Google Business Profile má recenze navázané na starý název

**Zmírnění:**
- Na webu a v Google Business Profile uvádět přechodně **„MatlGroup (dříve Sežeňkáru.cz)"**
- Na homepage sekce s logy tří firem + vysvětlení, že jde o jednu skupinu — *to už v plánu je, road mapa v „O nás". Dát to i na homepage.*
- Doménu `sezenkaru.cz` držet natrvalo
- V titulcích stránek nechat klíčová slova: `Antikorozní ochrana podvozku Brno | MatlGroup`, ne `MatlGroup | Domů`
- **Ověřit, že s.r.o. `Sežeňkáru.cz s.r.o.` zůstává, nebo jestli se mění i právní subjekt** — pokud ano, mění se IČO na fakturách a v patičce

---

## 23. PŘÍLOHA A — Firemní údaje

```
Sežeňkáru.cz s.r.o.
Opatovická 8, 664 61 Rajhradice
(areál stolařství Mátl)

IČ:   090 71 067
DIČ:  CZ09071067

Zapsáno u Krajského soudu v Brně, oddíl C, vložka 117058

Kontaktní osoba: Václav Mátl
Telefon: +420 732 760 085
E-mail:  info@sezenkaru.cz
Rakousko: info@ochrannevosky.cz

Facebook: facebook.com/sezenkarucz
Google:   zápis existuje (Sežeňkáru.cz s.r.o., Opatovická, Rajhradice-Rajhrad)
```

**⚠️ K doplnění od klienta — na starých webech to nikde není:**
- [ ] **Otevírací doba** *(chybí úplně — u lokální služby zásadní!)*
- [ ] Instagram, YouTube, WhatsApp majitele
- [ ] Rok založení firmy / počet let na trhu
- [ ] Počet zaměstnanců
- [ ] Datová schránka
- [ ] Bankovní spojení
- [ ] Zůstává právní subjekt `Sežeňkáru.cz s.r.o.`, nebo vzniká nové IČO pod MatlGroup?

---

## 24. PŘÍLOHA B — Přenositelný obsah ze starých webů

*Toto je hotový text, který se nemusí psát znovu. Doporučuji přepsat a zkrátit, ne kopírovat — ale fakta a struktura jsou použitelné.*

### 24.1 Antikoroze — segmentace vozidel

Čtyři kategorie, které stojí za zachování:

**Nová a sportovní vozidla** — argument je, že výrobci často deklarují záruku proti *prorezavění* (díra v karoserii), ale ne proti *korozi* jako takové. To je silný a konkrétní prodejní argument.

**Ojetá a historická** — vozidlo starší než 1 rok (jednu zimu provozované) se považuje za ojeté, protože podvozek a karoserie byly vystaveny vlhkosti, soli, abrazi od kamínků, kondenzaci a mycím prostředkům.

**Terénní vozidla a dodávky** — poškození ochranných nátěrů nárazy kamenů a kontaktem s terénem.

**Obytné vozy a karavany** — podvozky kombinují kov, plast, dřevotřísku a překližku s různou odolností, proto vyžadují individuální řešení.

**Dále:** nákladní vozidla do 30 t, zemědělská, stavební a komunální technika, ATV a UTV. Ochrana motorů a převodovek vysokoteplotními vosky s odolností do 150 °C.

### 24.2 Antikoroze — tři typy ochrany

| Typ | Popis |
|---|---|
| **Ochrana dutin** | Přípravky vytvářející vodu odpuzující film pro uzavřené dutiny |
| **Ochrana podvozků** | Vysoká životnost, aplikací se neztrácí záruka výrobce vozidla |
| **Ochrana proti oštěrkování** | Pružný přelakovatelný film na podvozky, podběhy, prahy a spoilery |

**Transparentní vosky** — omyvatelné ředidlem S6006 a parním čističem. Oblíbené u nových a sportovních vozů, protože je vidět reálný stav ošetřeného povrchu.

**Použité materiály:** DINITROL 4941 (vosk černá), 4942 (vosk hnědá), 1000 (dutiny), 4010 (transparentní vosk žáruvzdorný). Dále Dekalin.

**Technologie:** airless stříkání.

### 24.3 Antikoroze — proces (obsah pro „Jak to probíhá")

**1. Prvotní prohlídka** — před přijetím vozidla je nutná fyzická prohlídka. Bez ní se realizace neprovádí.
**2. Návrh provedení a cenová kalkulace** — včetně postupu a délky realizace. **Zdarma.**
**3. Příprava** — ochranné prvky do interiéru, důkladné umytí karoserie a podvozku, vysušení, zakrytí speciální fólií, demontáž kol a plastových dílů podvozku, ochrana výfukového potrubí a spodní části motoru.
**4. Realizace** — kompletní očištění, odmaštění, ošetření podběhů, podlahy, rámu, náprav, převodovky a spodní části motoru + dutiny prahů, podlahy, rámu a náprav.
**5. Předání** — zákazník vždy obdrží kompletní fotodokumentaci.

> 💡 Bod „zákazník obdrží kompletní fotodokumentaci" je skvělý — a přirozeně se propojuje s galerií na novém webu.

### 24.4 Ceník antikoroze (platný od 1. 5. 2026, bez DPH 21 %)

**Nová vozidla — stáří max. 6 měsíců, neprovozovaná v zimě**

| Typ vozidla | Příklady | Cena bez DPH |
|---|---|---|
| Čtyřkolka, malotraktor | CFMOTO 500-A, Linhai ATV 500, Kubota B1161EC | 8 000 Kč |
| Malé vozidlo | Kia Rio, Toyota Yaris, Nissan Micra, Suzuki Swift, VW Polo, Škoda Fabia, Subaru BRZ | 16 500 Kč |
| Velký traktor, bagr | Zetor Crystal, Yanmar B95W | 17 000 Kč |
| Střední vozidlo | Korando, Qashqai, Tivoli, Juke, Kia Ceed, Toyota Corolla, Mitsubishi ASX, Ford Focus, Škoda Octavia, Subaru XV / Impreza | 19 000 Kč |
| Vyšší střední | Torres, Torres EVX, SsangYong Actyon, X-Trail, Arya, Townstar, Subaru Outback, Subaru Forester, Toyota RAV4, Mitsubishi Eclipse Cross | 20 000 Kč |
| Offroad a Van | Rexton, Musso Grand, Toyota Hilux, Nissan Navara, Toyota Proace, Kia Sorento, Kia EV9, VW Transporter | 26 000 Kč |
| Dodávková vozidla | Fiat Ducato, Ford Transit, Iveco Daily, Sprinter, RAM 1500, Ford F-150 | 30 000 Kč |
| Velké dodávky (maxi, long) | Fiat Ducato, Ford Transit, Iveco Daily, Sprinter | 34 000 Kč |
| Nákladní vozidla | TATRA, MAN, DAF | od 40 000 Kč |

**Doba realizace:** 5 pracovních dnů

**Cena zahrnuje:** kompletní mytí vozu + vysušení, zakrytí jednorázovou fólií a páskami nezanechávajícími lepidlo, odstrojení krycích plastů a krytů (případně rezervního kola), kompletní očištění a odmaštění, ošetření podběhů, podlahy, rámu, náprav, převodovky a spodní části motoru, ošetření dutin prahů, podlahy, rámu a náprav, kompletní fotodokumentace.

**Cena nezahrnuje:** dutiny kapoty a dveří — individuální nabídka na každé vozidlo.

**⚠️ Důležité upozornění (patří i na nový web):** při ošetření dutin musí zákazník podepsat čestné prohlášení, že byl poučen o tom, že antikorozní nástřik dutin může při vyšších teplotách vytékat (potečená maska, světla, prahy, zadní nárazník) — a to i po dobu několika let.

**Vozidla starší 6 měsíců:** základ tvoří ceník nových vozidel + individuální kalkulace po prohlídce (odstranění rzi, demontáž off-road rámů a prahů, odstranění bláta, mechanické a chemické čištění rámu, odstranění starého nástřiku).

### 24.5 Ceník pneuservisu (bez DPH)

| Kategorie | Dem./mont. na osu | Dem./mont. na disk | Vyvážení | Kompletní servis 1 kola |
|---|---|---|---|---|
| Ocelové disky | 70,- | 90,- | 90,- | 250,- |
| Alu 15–16" | 80,- | 100,- | 100,- | 280,- |
| Alu 17–18" | 90,- | 110,- | 110,- | 310,- |
| Alu 19–21" | 110,- | 130,- | 120,- | 360,- |
| Alu 22–24" | 130,- | 150,- | 130,- | 410,- |
| SUV do 18" | 110,- | 130,- | 120,- | 360,- |
| SUV od 19" | 130,- | 185,- | 150,- | 465,- |
| Dodávky do 3,5 t | 90,- | 130,- | 110,- | 330,- |

Součástí přezutí jednoho kola je 1× ventil a 2× závaží 30 g.
Při dodání nové pneumatiky pneuservisem je likvidace staré zdarma. U vlastních pneumatik zákazníka je manipulační poplatek 100 Kč/ks.

| Opravy a materiál | Cena |
|---|---|
| Oprava defektu bezdušové pneu | 140–240,- |
| Opravný hříbek 6/8/10 mm | 135–230,- |
| Univerzální záplata | 250–450,- |
| Nalepovací závaží pozink | 2,- Kč/g |
| Nalepovací závaží barevné | 3,- Kč/g |
| Naklepávací závaží | 1,50 Kč/g |
| TPMS snímač tlaku | 600,- |

| Příplatkové služby | Ocelový disk + pneu | Alu disk + pneu |
|---|---|---|
| Mytí | 1 000,- | 2 000,- |
| Impregnace | 500,- | 500,- |
| Uskladnění sada / sezóna | 2 000,- | od 2 000,- |

Pytel na kolo: do 16" 20,-/ks · do 20" 30,-/ks · do 24" 40,-/ks

**Vybavení:** hydraulický zvedák, pneumatický utahovák, komfortní zouvačka s pomocným ramenem, komfortní vyvažovačka, tlakové dělo.

**Uskladnění pneumatik:** pečlivé omytí pneu a disku, dohuštění, kompletní kontrola (hloubka dezénu, opotřebení, stav ventilu), skladování ve stálé teplotě mimo dosah slunečního záření.

> 💡 Detail k zachování: *„Každý zákazník obdrží při čekání kávu. Zázemí s toaletou je samozřejmostí."* — přesně ten typ drobnosti, který odlišuje.

### 24.6 Ceník čištění interiéru (bez DPH)

| Program | Cena | Obsah |
|---|---|---|
| **INTERIÉR 1** | 2 000,- | Základní vysávání vč. koberečků, vysávání kufru, otření plastů, vyleštění čelního skla |
| **INTERIÉR 2** | 3 000,- | Detailní vysávání vč. koberečků a kufru, parní čištění plastů, ochrana plastů, vyleštění vnitřní strany skel, otření zádveří |
| **INTERIÉR 3 TEXTIL** | 4 500,- | Detailní vysávání, mokré čištění koberců, sedaček a všech textilních částí, parní čištění a ochrana plastů, vyleštění skel z obou stran, vyčištění mezidveřního prostoru |
| **INTERIÉR 3 KŮŽE** | od 6 000,- | Jako TEXTIL + základní čištění kožených prvků s ošetřením a balzamováním |
| **INTERIÉR DETAIL** | dle požadavků | Individuální program |
| **INTERIÉR SPECIAL** | dle stavu | Nadprůměrné znečištění — psí chlupy, skvrny od krve, barev, pryskyřice, žvýkačky, fekálie |

⚠️ Při mokrém čištění (tepování) textilních potahů je doba sušení cca 24 hodin.

### 24.7 Ceník čištění exteriéru (bez DPH)

| Program | Cena | Obsah |
|---|---|---|
| **EXTERIÉR 1** | od 2 000,- | Tlakové předmytí, ruční mytí aktivní pěnou, oplach, vysušení |
| **EXTERIÉR 2** | od 3 000,- | + přípravek na odstranění nečistot, mytí vč. kol, podběhů a víčka nádrže, vyleštění oken, mezidveřní prostor, závěrečné dosušení |
| **EXTERIÉR 3** | od 5 000,- | + aplikace vosku a přípravku na pneumatiky |

Korekce laku, rozleštění a keramická ochrana laku — individuální kalkulace, termín předem.

### 24.8 Certifikace a partneři

- **AUTORIZOVANÉ SERVISNÍ CENTRUM ANTIKOROZNÍ OCHRANY VOZIDEL**
- Antikorozní centrum (logo)
- Dekalin (logo)
- Dinitrol (materiály)

### 24.9 Použitelné claimy ze starých webů

- „Umíme vašemu miláčkovi prodloužit život"
- „Kvalitně odvedená práce = spokojený zákazník" *(motto)*
- „Prvotní prohlídku včetně návrhu realizace a cenové kalkulace vám provedeme zdarma"
- „Jejich aplikací neztratíte záruku výrobce vozidla"
- Individuální a profesionální přístup ke každé zakázce
- Kvalitní a ověřené materiály
- Nejmodernější technologie
- Striktní dodržování technologických postupů

---

## 25. Aktualizovaný rozsah služeb — nesrovnalost k vyjasnění

Původní plán počítá se **6 službami**. Na starých webech jsem našel jiný seznam:

| Služba v plánu | Na starém webu | Poznámka |
|---|---|---|
| Antikoroze | ✅ ano, hlavní obsah | největší objem obsahu |
| Nákup a prodej | ❌ **nikde** | *název `sezenkaru.cz` to naznačuje, ale obsah chybí* |
| Čištění a detailing | ✅ ano, interiér + exteriér | |
| Fólie a polepy | ❌ **nikde** | nová služba? |
| Přeprava vozidel | ❌ **nikde** | nová služba? |
| Pneuservis | ✅ ano | |
| — | ⚠️ **Střešní stany** (404) | *v plánu chybí, na webu je v menu!* |

**Otázky na klienta:**
1. **Střešní stany** — služba pokračuje? Pokud ano, patří do plánu jako sedmá. Pokud ne, odkaz v menu je potřeba odstranit hned.
2. **Fólie a polepy, přeprava vozidel** — nové služby bez jakéhokoli existujícího obsahu, fotek a ceníku. Znamená to psát je od nuly. **Vyčlenit čas a rozpočet.**
3. **Nákup a prodej** — prodává se auto na objednávku (zprostředkování), nebo je sklad vozů? Rozhoduje o tom, jestli je potřeba výpis vozidel (viz sekce 16).
4. **Rakouský trh** — `ochrannevosky.cz` je zvlášť pro Rakousko. Zůstává to samostatné, nebo se to slévá do `matlgroup.cz/de/`? *Tohle mění celou úvahu o vícejazyčnosti — pokud AT reálně přináší zakázky, německá verze není fáze 2, ale fáze 1.*

---

## 26. Aktualizovaný fotografický plán

Ze starých webů se dá převzít: fotky procesu antikoroze (zakrývání, demontáž, airless), fotky dílny, before/after podvozků, karusel 12 fotek ochrany voskem.

**Nutno dofotit:**
- [ ] Václav Mátl — portrét v dílně, 2–3 varianty
- [ ] Exteriér provozovny (Opatovická 8) — návštěvník musí poznat, kam jede
- [ ] Interiér dílny, zázemí s kávou
- [ ] **Pneuservis** — zouvačka, vyvažovačka, sklad pneu (na webu není ani jedna fotka)
- [ ] **Čištění** — proces + before/after, i extrémní případy (psí chlupy, skvrny) — to prodává
- [ ] **Fólie a polepy** — vše, chybí kompletně + **fotky aut z boku pro vizualizér** (viz sekce 8)
- [ ] **Přeprava vozidel** — odtahovka / přepravník, nakládka
- [ ] **Střešní stany** — pokud služba zůstává
- [ ] Vybavení a technika
- [ ] Certifikáty a loga partnerů v tiskové kvalitě

> ⚠️ Odstranit ze všech nových materiálů placeholdery typu „Sample Title", „Název vzorku", „Ukázka textu", „Ukázka nadpisu". Na starých webech jsou v ostrém provozu a působí velmi neprofesionálně.

---

## 27. Rychlé opravy, které se dají udělat HNED

Nezávisle na novém webu, jako gesto dobré vůle vůči klientovi:

1. 🔴 **Opravit nebo odstranit odkaz „Střešní stany"** — vede na 404
2. 🔴 Vyplnit nebo skrýt placeholdery „Sample Title" / „Název vzorku" v galeriích
3. 🟠 Doplnit otevírací dobu do Google Business Profile
4. 🟠 Zkontrolovat, že Google Business Profile má správný telefon, adresu a fotky
5. 🟡 Opravit rozbité odkazy na GDPR stránky
6. 🟡 Nahradit dlouhý Google odkaz „Recenze" krátkým

---


---

# ČÁST III — ZNAČKA, DOMÉNA A TŘI PRÁVNÍ SUBJEKTY

*(Doplněno na základě upřesnění od klienta: Sežeňkáru.cz s.r.o., Ochranné vosky s.r.o. a MatlGroup s.r.o. jsou tři samostatné právnické osoby. MatlGroup vznikla jako poslední, jako zastřešující značka.)*

---

## 28. Výchozí situace

| Firma | Právní forma | Web | Instagram |
|---|---|---|---|
| Sežeňkáru.cz s.r.o. | samostatné s.r.o. | `sezenkaru.cz` | vlastní účet |
| Ochranné vosky s.r.o. | samostatné s.r.o. | `ochranapodvozkuvoskem.cz` + `ochrannevosky.cz` | vlastní účet |
| MatlGroup s.r.o. | samostatné s.r.o. | ❌ žádný | vlastní účet |

**Diagnóza klienta je přesná:** „je to všechno a nic". Tři instagramy, dva a půl webu, čtyři domény, tři názvy — a bez rozhovoru s majitelem se v tom nikdo nevyzná. To není problém designu, to je problém architektury značky. Nový web ho může vyřešit jen tehdy, když se vyřeší i mimo web.

---

## 29. Návrh domény `sezenkaru-matlgroup.cz` — nedoporučuji

**Instinkt je správný, nástroj špatný.** Snaha zmírnit rebrand je legitimní. Ale kombinovaná doména s pomlčkou je pravděpodobně nejhorší dostupný způsob, jak to udělat.

### Proč

**1. Komunikuje zmatek, místo aby ho řešil.**
Celý smysl projektu je „tři firmy = jedna značka". Doména složená ze dvou názvů říká pravý opak: *„ani my nevíme, jak se jmenujeme."*

**2. Nedá se nadiktovat do telefonu.**
Zkus to: „es-e-zet-e-en-ká-á-er-u pomlčka em-á-té-el-gé-er-o-u-pé tečka cé-zet." U firmy, kde je telefon primární kanál a půlka zákazníků jsou lidé nad padesát, je to reálný problém.

**3. Pomlčky mají pověst.**
Doména s pomlčkou působí levně a v hlavě uživatele je asociovaná s webem, který si nemohl dovolit tu bez pomlčky.

**4. Zdvojnásobuje SEO riziko.**
Tohle je zdaleka nejzávažnější bod. Znamenalo by to migrovat **dvakrát**:

```
sezenkaru.cz  ─┐
ochranapodvozkuvoskem.cz ─┼→ sezenkaru-matlgroup.cz ─→ matlgroup.cz
ochrannevosky.cz ─┘         (za rok? za dva?)
```

Každá migrace stojí část hodnocení. Dvě migrace za sebou = dvakrát propad, dvakrát řetězená přesměrování, dvakrát Change of Address v Search Console. Neexistuje důvod to podstupovat dvakrát.

**5. „Dočasné" se stane trvalým.**
Kdo bude za dva roky iniciovat další migraci a další náklad? Nikdo. Doména s pomlčkou zůstane napořád.

**6. Klíčové slovo v doméně dnes prakticky nic nepřidává.**
Exact-match domény ztratily váhu už dávno. Hodnotu z názvu „sežeň káru" nezachráníš tím, že ho vecpeš do adresy — zachráníš ji přesměrováním, titulky stránek a Google zápisem.

### Doporučení

**`matlgroup.cz` rovnou a napevno.** Jedna migrace, jednou.

---

## 30. Co rebrand skutečně zmírní

Tohle je seznam věcí, které dělají práci, kterou má podle klienta udělat doména. Dělají ji lépe a zadarmo.

### 30.1 Titulky stránek — tady žije SEO, ne v doméně
```
❌ MatlGroup | Domů
✅ Antikorozní ochrana podvozku Brno | MatlGroup
✅ Pneuservis Rajhradice — přezutí a uskladnění | MatlGroup
```
Klíčová slova, na která lidi hledají, patří sem. Adresa je vedlejší.

### 30.2 „Dříve" všude, kde to jde
- V hlavičce webu první rok: **MatlGroup** s podtitulem *dříve Sežeňkáru.cz a Ochranné vosky*
- V Google Business Profile do názvu i popisu
- V patičce
- V odpovědi na telefon: „MatlGroup, dřív Sežeňkáru, dobrý den"

### 30.3 Google Business Profile — nejcitlivější místo celého rebrandu
🔴 **Nezakládat nový zápis. Přejmenovat stávající.**

Zápis Sežeňkáru.cz s.r.o. nese nasbírané recenze a historii. Nový zápis začíná na nule a nulou začíná i pozice v mapách. U lokální služby je Google Business Profile pravděpodobně větší zdroj poptávek než web samotný — tohle je jediná chyba v celém projektu, kterou nejde vzít zpět.

Pokud mají zápis i Ochranné vosky nebo MatlGroup, řešit slučování duplicit **před** spuštěním webu.

### 30.4 Sociální sítě — přejmenovat, ne zakládat znovu
Stejná logika: přejmenováním účtu zůstanou sledující, novým účtem se začíná od nuly.

**Ke třem instagramům:** tři účty malá firma dlouhodobě neuživí. Jeden člověk nedokáže krmit tři feedy a v praxi to skončí tak, že dva usychají — což vypadá hůř než jeden živý.

Doporučení:
1. Vybrat účet s největším a nejaktivnějším publikem → **přejmenovat na MatlGroup**
2. Na zbylých dvou vydat 2–3 posty „přesouváme se sem" s odkazem, pak je nechat zamrznout (nemazat — odkazy na ně existují)
3. Segmenty řešit **Highlights** (Antikoroze · Pneuservis · Detailing · Fólie · Přeprava) a hashtagy, ne samostatnými účty
4. Za půl roku zbylé účty archivovat

> Výjimka k zvážení: pokud Ochranné vosky reálně cílí na **rakouský trh v němčině**, samostatný účet smysl dává — jiný jazyk, jiné publikum. Ostatní ne.

### 30.5 Obsah, který rebrand vysvětlí
Road mapa v „O nás" je správný nápad. Ale **podstránku „O nás" si otevře menšina návštěvníků.** Sdělení „tři firmy = jedna skupina" musí být i tam, kde ho uvidí všichni:

- **Homepage** — pás s logy tří firem a jednou větou („Sežeňkáru.cz, Ochranné vosky a MatlGroup jsou od roku 20XX jedna skupina.")
- **Patička** — na každé stránce
- **Stránka služby** — u antikoroze zmínka, že ji dodávají Ochranné vosky s.r.o.

Road mapa v „O nás" pak dodá příběh a detail. Ta má být ta hezká, dlouhá verze — ne jediná.

---

## 31. Tři s.r.o. na jednom webu — právní a provozní důsledky

**Tohle je nejpodceněnější část celého projektu.** Tři samostatné právnické osoby na jednom webu není kosmetika, je to sada konkrétních závazků. Nic z toho není nepřekonatelné, ale všechno se musí rozhodnout **před spuštěním**.

### 31.1 Kdo je provozovatel webu
V patičce a v zásadách musí být jasné, která firma web provozuje. Pravděpodobně **MatlGroup s.r.o.** — dává to smysl, je to zastřešující subjekt.

### 31.2 Kdo fakturuje kterou službu
Zákazník musí mít možnost zjistit, s kým vlastně uzavírá smlouvu. Návrh:

| Služba | Dodavatel |
|---|---|
| Antikoroze | *k doplnění* |
| Pneuservis | *k doplnění* |
| Čištění a detailing | *k doplnění* |
| Fólie a polepy | *k doplnění* |
| Přeprava vozidel | *k doplnění* |
| Nákup a prodej | *k doplnění* |

> **Otázka na klienta:** která s.r.o. dnes fakturuje kterou službu? Bez toho nejde napsat patičku, zásady ochrany osobních údajů ani ceníky.

Ceník musí u každé služby uvádět dodavatele — nebo aspoň větu v obchodních podmínkách, která to vyjasní.

### 31.3 GDPR — nejcitlivější bod
Když někdo odešle poptávku, **musí být jasné, která z těch tří firem je správcem jeho osobních údajů.**

Dvě čisté varianty:
- **A)** MatlGroup s.r.o. je jediný správce, ostatní dvě jsou zpracovatelé → potřeba **zpracovatelské smlouvy mezi firmami**
- **B)** Firmy jsou **společní správci** (joint controllers) → potřeba dohoda o společném správcovství a její shrnutí zveřejněné na webu

Varianta A je jednodušší. Tak či tak: **v zásadách ochrany osobních údajů musí být uvedeny všechny tři subjekty s IČO** a popsáno, jak si data mezi sebou předávají.

⚠️ Není to formalita. Poptávka na antikorozi, kterou přijme MatlGroup a zpracuje Ochranné vosky, je předání osobních údajů mezi dvěma samostatnými právnickými osobami.

### 31.4 Patička
Musí obsahovat všechny tři subjekty s IČO, nebo provozovatele + odkaz na stránku s úplným výpisem. Návrh:

```
Web provozuje MatlGroup s.r.o., IČO ...
Služby dodávají:
  Sežeňkáru.cz s.r.o., IČO 090 71 067
  Ochranné vosky s.r.o., IČO ...
  MatlGroup s.r.o., IČO ...
Opatovická 8, 664 61 Rajhradice
```

### 31.5 Směrování poptávek
Formulář musí poptávku poslat správné firmě podle zvolené služby — a v adminu musí být u každé poptávky vidět, které firmy se týká. **To je požadavek na datový model, ne na design.** Doplnit do specifikace adminu (sekce 6).

### 31.6 Kdo je klient
- Která s.r.o. **podepisuje smlouvu** s vývojářem a platí faktury?
- Na kterou firmu jsou registrované **domény**? *(pravděpodobně nejsou všechny na stejné — ověřit ve WHOIS)*
- Kdo bude platit **hosting** a jak dlouho?
- Kdo vlastní **autorská práva** k webu po dodání?

> Doporučení: **jedna smlouva s MatlGroup s.r.o.**, ta si to interně vypořádá. Tři smluvní partneři na jednom projektu jsou administrativní peklo a zdroj sporů o to, kdo co platí.

### 31.7 Ostatní
- **Ochranné známky** — je „MatlGroup" registrovaná? Pokud ne, zvážit před investicí do brandu
- **Účty** — Google Business Profile, Search Console, Analytics, Facebook, Instagram: převést na firemní e-maily, ne na osobní účet majitele nebo vývojáře
- **Schema.org `Organization`** — na webu bude jedna organizace (MatlGroup), ale u služeb lze uvést `provider` s konkrétním subjektem

---

## 32. Pás s logy na homepage — specifikace

### Účel
Odpovědět do dvou vteřin na otázku *„proč tu vidím tři jména a s kým vlastně mluvím?"*. Není to dekorace, je to řešení hlavního problému značky.

### Zásadní pravidlo
**Generická řada log se nečte.** Uživatelé mají za roky vytrénovanou slepotu na pásy typu „as seen in" a oko je přeskočí. Práci musí odvést **nadpis**, loga jsou až podřízená.

### Vybraná varianta: „Kdo co dělá"

```
┌──────────────────────────────────────────────────────────────┐
│  Proč tu vidíte tři jména                                    │
│  Vašek Mátl postupně založil tři firmy. MatlGroup je         │
│  zastřešuje.                                                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │ Sežeňkáru  │  │ Ochranné   │  │ MatlGroup  │ ← zvýrazněno │
│  │ .cz        │  │ vosky      │  │            │              │
│  │            │  │            │  │            │              │
│  │ Pneuservis,│  │ Antikorozní│  │ Fólie a    │              │
│  │ čištění a  │  │ ochrana    │  │ polepy,    │              │
│  │ detailing, │  │ podvozků   │  │ přeprava   │              │
│  │ nákup a    │  │ a dutin    │  │ vozidel    │              │
│  │ prodej     │  │            │  │            │              │
│  └────────────┘  └────────────┘  └────────────┘              │
│                                                              │
│  ⊙ Autorizované servisní centrum      Celý příběh v O nás →  │
└──────────────────────────────────────────────────────────────┘
```

⚠️ Rozdělení služeb v kartách je **návrh** — musí se opravit podle skutečného stavu (viz otázka 34.2.1).

### Alternativní varianta: „Sbíhající se značky"
Tři názvy vlevo, spojnice sbíhající se do jednoho bodu, MatlGroup vpravo. Silnější emocionálně — sdělení „z tohohle vzniklo tohle" funguje beze slov. Vhodné jako doplněk v „O nás", nad road mapou.

### Tichá varianta pro patičku
Jednořádkový pruh: *„Jedna skupina, tři firmy pod jednou střechou"* + tři názvy v tlumené barvě. Na každé stránce.

### Pravidla realizace
- **Umístění: hned pod hero.** Zmatek ze tří jmen musí být vyřešen dřív, než člověk začne pochybovat, jestli je na správném webu.
- **Loga sjednotit opticky, ne matematicky.** Stejná výška v pixelech nestačí — kulaté logo musí být větší než hranaté, aby působilo stejně velké.
- **Monochrom.** Tři barevná loga vedle sebe vypadají jako výprodej. Jedna barva, nebo odstín šedé.
- **Certifikace patří sem** — „Autorizované servisní centrum antikorozní ochrany vozidel" je nejsilnější důvěryhodnostní prvek, který firma má.
- **Mobil:** varianta se sbíhajícími čarami se rozsype. Přepnout na stack — tři názvy pod sebou, šipka dolů, MatlGroup.
- **Odkaz na road mapu** v „O nás" — pás dá rychlou odpověď, road mapa příběh.

### Texty (návrh, k ověření)
- „Proč tu vidíte tři jména"
- „Tři firmy. Jedna dílna. Jeden telefon." — silné, protože konkrétní. **Ověřit, že je to fakticky pravda.**
- „Jedna skupina, tři firmy pod jednou střechou"

---

## 33. Ochranná známka

> ⚠️ Následující není právní poradenství. Slouží jako orientace pro rozhovor s patentovým zástupcem.

### Zjištěný stav
Rešerší **nebyla nalezena žádná registrovaná ochranná známka** pro „MatlGroup", „Sežeňkáru" ani „Ochranné vosky".

### Proč to není dobrá zpráva

**Zápis v obchodním rejstříku ≠ ochranná známka.** MatlGroup s.r.o. má chráněnou obchodní firmu, ale to je slabá a úzká ochrana. Ochranná známka dává **výlučné právo užívat označení pro konkrétní třídy výrobků a služeb** — což je něco jiného.

**Riziko A — někdo to zaregistruje dřív.** Do brandu se teď nalijí peníze: web, polepy na auta, letáky, cedule na dílně, sociální sítě. Pokud si mezitím označení zaregistruje někdo jiný, může firma skončit v situaci, kdy značku musí měnit — a to celý rebrand podstupuje podruhé.

**Riziko B — opačný směr.** To, že označení není v rejstříku ÚPV, ještě neznamená, že je volné. Na území ČR mají účinky i **evropské známky (EUTM)** registrované u EUIPO. Před podáním je nutná rešerše v **ÚPV i v TMview**.

### Náklady (orientačně)

| Položka | Cena |
|---|---|
| Národní přihláška ÚPV, 1–3 třídy | 5 000 Kč |
| Každá další třída nad 3 | + 500 Kč |
| Sleva při elektronickém podání | −10 % (→ 4 500 Kč) |
| Odměna patentového zástupce (orientačně) | ~7 500 Kč bez DPH |
| **Celkem s zástupcem, orientačně od** | **~11 500 Kč** |
| EU známka (EUIPO), 1 třída | od 850 EUR |

- Ochrana platí **10 let** od podání přihlášky, lze obnovovat.
- Obnova po 10 letech: 24 000 Kč papírově / 21 600 Kč elektronicky.
- Poplatek je splatný do 1 měsíce od podání. **ÚPV výzvu k úhradě neposílá** — když se zapomene, přihláška se považuje za nepodanou.

> 💡 **Ověřit aktuálnost:** pro rok 2026 se uvádí **grant EUIPO, ze kterého lze získat zpět 75 % úředních poplatků**. Podmínky fondu se mění každý rok — ověřit na webu EUIPO před podáním. Pokud platí, vyjde registrace na pár tisíc korun.

### Pravděpodobně relevantní třídy (Nicejské třídění)
- **37** — opravy a údržba vozidel *(antikoroze, pneuservis, čištění, fólie)*
- **39** — přeprava *(přeprava vozidel)*
- **35** — reklama, obchodní služby *(nákup a prodej)*

Výběr tříd je přesně ta část, na kterou má smysl mít zástupce: příliš úzký výběr ochranu nezajistí, příliš široký zbytečně prodraží.

### Doporučení k načasování
🔴 **Toto není úkol na po spuštění webu, ale PŘED ním.** Rešerši udělat teď, přihlášku podat dřív, než se do značky nalije reklama, polepy a tisk.

### Co registrovat
Zvážit s zástupcem, jestli:
- jen **slovní** označení „MatlGroup" *(nejširší ochrana, nejlevnější)*
- **kombinované** (slovo + logo) *(chrání konkrétní vizuál)*
- ideálně obojí

---

## 34. OTÁZKY NA KLIENTA

*Konsolidovaný seznam všeho, co je potřeba rozhodnout. Bez odpovědí nejde dokončit nabídku ani začít stavět. Doporučuji projít na jednom sezení — ušetří to měsíce dohadování po telefonu.*

---

### 34.1 Značka, doména, ochranná známka

**34.1.1** Potvrzujeme hlavní doménu **`matlgroup.cz`** bez mezikroku? *(Kombinovaná doména `sezenkaru-matlgroup.cz` se nedoporučuje — znamenala by dvě migrace za sebou a dvojí ztrátu pozic. Zdůvodnění v sekci 29.)*

**34.1.2** Zůstanou **všechny čtyři staré domény** zaplacené a registrované natrvalo? Kdo je platí a na kterou firmu jsou registrované? *(Ověřit ve WHOIS — pravděpodobně nejsou všechny na stejném subjektu.)*

**34.1.3** Kdy byla založena **MatlGroup s.r.o.**? *(Potřebuji rok pro pás s logy a road mapu.)*

**34.1.4** **Byla už někdy podána přihláška ochranné známky** pro kterékoli z těch tří označení? *(Rešerší jsem nic nenašel, ale chci to potvrdit — nemusí být zveřejněné vše.)*

**34.1.5** **Chce klient ochrannou známku registrovat?** Rozpočet zhruba 11 500 Kč s patentovým zástupcem, případně méně při využití grantu EUIPO. *(Doporučuji ANO, a to před spuštěním webu — ne po něm.)*

**34.1.6** Pokud ano — **které označení?** Jen „MatlGroup", nebo i „Sežeňkáru.cz" a „Ochranné vosky"? Slovní známka, kombinovaná (s logem), nebo obojí?

**34.1.7** Má klient **patentového zástupce**, nebo mám doporučit? *(Pro výběr tříd to dává smysl.)*

**34.1.8** Existuje **finální logo MatlGroup** ve vektoru (SVG/AI/EPS)? A loga zbylých dvou firem? *(Potřebuji pro pás s logy, patičku a favicon.)*

---

### 34.2 Rozsah služeb

**34.2.1** 🔴 **Střešní stany — pokračuje ta služba?**
Na `sezenkaru.cz` je v hlavním menu položka „Střešní stany" odkazující na `stanynaauto.sezenkaru.cz`. **Ta adresa vrací 404.** V plánu webu o té službě zároveň není ani zmínka.

Možnosti:
- **Služba pokračuje** → patří do plánu jako **sedmá služba**. Znamená to vlastní stránku, texty, ceník, fotky. Zvyšuje to rozsah i cenu.
- **Služba skončila** → odkaz v menu je potřeba odstranit hned (dnes posílá zájemce na chybovou stránku) a nastavit přesměrování ze subdomény.
- **Služba je pozastavená** → rozhodnout, jestli ji zmínit v „O nás" jako historii.

*Doplňující: pokud pokračuje — prodej stanů, montáž, půjčovna, nebo kombinace? Existuje ceník a fotky?*

**34.2.2** **Fólie a polepy** — na žádném ze čtyř existujících webů o té službě není ani řádek. Kdo dodá texty, ceník a fotky? *(A pro vizualizér polepů: kolik modelů aut, jaké typy — osobní, dodávky, SUV?)*

**34.2.3** **Přeprava vozidel** — totéž, nikde neexistuje. Jaký rozsah? Vnitrostátní, EU? Odtahová služba, nebo plánovaná přeprava? *(Rozhoduje o podobě kalkulačky.)*

**34.2.4** **Nákup a prodej** — jde o **zprostředkování na objednávku**, nebo je **sklad vozů**? 🔴 Pokud sklad, chybí v plánu **výpis vozidel** (značka, model, rok, km, cena, fotky, stav) — samostatná entita v adminu, která významně zvyšuje rozsah. Musí se buď nacenit, nebo výslovně vyloučit ze smlouvy.

**34.2.5** **Rakouský trh** — kolik zakázek reálně přináší `ochrannevosky.cz`? 🔴 Pokud nezanedbatelně, **němčina není fáze 2, ale fáze 1** a mění to rozpočet i termín.

---

### 34.3 Tři právní subjekty

**34.3.1** 🔴 **Která s.r.o. fakturuje kterou službu?** Doplnit tabulku:

| Služba | Dodavatel |
|---|---|
| Antikoroze | ? |
| Pneuservis | ? |
| Čištění a detailing | ? |
| Fólie a polepy | ? |
| Přeprava vozidel | ? |
| Nákup a prodej | ? |
| Střešní stany *(pokud zůstávají)* | ? |

*Bez toho nejde napsat patičku, zásady ochrany osobních údajů ani obchodní podmínky.*

**34.3.2** 🔴 **Který subjekt je správcem osobních údajů** z poptávkového formuláře? Varianta A (MatlGroup jediný správce, ostatní zpracovatelé — potřeba zpracovatelské smlouvy) nebo B (společní správci — potřeba dohoda o společném správcovství)? *Varianta A je jednodušší.*

**34.3.3** **Která firma podepisuje smlouvu na web a platí faktury?** *(Doporučuji jednu smlouvu s MatlGroup s.r.o. Tři smluvní partneři na jednom projektu jsou zdroj sporů o to, kdo co platí.)*

**34.3.4** **IČO a přesné názvy** zbylých dvou firem. *(Znám jen Sežeňkáru.cz s.r.o., IČ 090 71 067.)*

**34.3.5** **Existuje Google Business Profile pro víc než jednu firmu?** 🔴 Pokud ano, řešit slučování duplicit **před** spuštěním. A hlavně: **zápis se přejmenovává, nezakládá se nový** — nový začíná bez recenzí a bez pozice v mapách. Tohle je jediná chyba v projektu, kterou nejde vzít zpět.

**34.3.6** Kdo má dnes **přístupy** ke Google Business Profile, Facebooku a Instagramům? Jsou účty na firemních e-mailech, nebo na osobním účtu majitele? *(Potřeba převést na firemní.)*

---

### 34.4 Provoz a obsah

**34.4.1** 🔴 **Otevírací doba.** Není uvedená na žádném ze čtyř webů. U lokální služby je to jedna z nejhledanějších informací vůbec. *(Včetně sezónních výjimek u pneuservisu a svátků.)*

**34.4.2** **Kontakty do patičky:** Instagram (tři účty?), YouTube, WhatsApp majitele, datová schránka.

**34.4.3** **Souhlas s konsolidací Instagramu** na jeden účet? *(Tři feedy malá firma dlouhodobě neuživí — dva usychají, což vypadá hůř než jeden živý. Doporučení: největší účet přejmenovat na MatlGroup, zbylé dva nechat zamrznout s odkazem. Výjimka: pokud Ochranné vosky cílí na Rakousko v němčině, samostatný účet dává smysl.)*

**34.4.4** **Kdo napíše texty?** 6–7 služeb ≈ 15–20 textů. *(Tohle projekty zabíjí nejčastěji. Buď klient s termínem ve smlouvě, nebo copywriting jako placená položka. Část obsahu se dá převzít ze starých webů — viz příloha B.)*

**34.4.5** **Kdo nafotí, co chybí?** *(Seznam v sekci 26. Fólie, přeprava a pneuservis nemají fotky vůbec. Profesionál za půlden 5–10 tis. Kč.)*

**34.4.6** **Kdo bude web po spuštění plnit?** Přidávat realizace do galerie, aktualizovat ceníky?

**34.4.7** **Recenze** — smíme použít konkrétní Google recenze na webu? *(Buď Places API s povinnou atribucí, nebo ručně vybrané citace se souhlasem. Scrapovat nelze.)*

**34.4.8** Jsou k dispozici **statistiky** pro homepage? Počet ošetřených vozů, roky na trhu, počet realizací. *(Místo neměřitelné „ochoty".)*

**34.4.9** **Hosting a domény** — kdo platí a spravuje po spuštění? Zájem o servisní smlouvu (2–5 tis. Kč/měsíc)?

---

### 34.5 Rychlé opravy, které nemusí čekat na nový web

Nezávisle na projektu, jako gesto dobré vůle:

- 🔴 **Opravit nebo odstranit odkaz „Střešní stany"** na `sezenkaru.cz` — vede na 404
- 🔴 **Vyplnit nebo skrýt placeholdery** „Sample Title", „Název vzorku", „Ukázka textu", „Ukázka nadpisu" v galeriích na `ochranapodvozkuvoskem.cz` a `ochrannevosky.cz`
- 🟠 **Doplnit otevírací dobu** do Google Business Profile
- 🟠 Zkontrolovat správnost telefonu, adresy a fotek v Google zápisu
- 🟡 Opravit rozbité odkazy na stránky ochrany osobních údajů
- 🟡 Nahradit dlouhý Google odkaz „Recenze" v menu krátkým

---

*Konec dokumentu.*
