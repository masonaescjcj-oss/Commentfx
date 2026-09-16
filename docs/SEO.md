# SEO: what we do, in what order, and why

Written 16 September 2026, against the site as it builds today: 179 URLs in the
sitemap, no domain live yet, no backlinks, no Search Console history.

This is the plan for a site with **zero** authority in a category — retail
forex and crypto — where the incumbents have a decade of links and full-time
editorial teams. Everything below assumes we cannot outspend them and have to
out-*specific* them.

---

## 0. The correction you should read first

You said: if we publish a lot of pages at once, Google may take us for a bot
and we will rank badly, so we should drip them out with a gap between each.

Half of that is right, and the half that is wrong matters, because the fix for
each is different.

**Google does not penalise publishing many pages at once.** Their own developer
advocate has been asked this directly and says to publish everything: *"If it's
great content that the internet has missed and which users have been waiting
for, why would you artificially delay it?"* and that *"artificially introducing
a kind of a trickle into the index is something that often causes more problems
than it solves."*

**What Google does penalise is scaled content abuse**, which their spam policy
defines as *"when many pages are generated for the primary purpose of
manipulating search rankings and not helping users… typically focused on
creating large amounts of unoriginal content that provides little to no value
to users, no matter how it's created."* The trigger is the *value per page*,
not the *number of pages per day*.

And separately, a new domain has almost no crawl demand. Google will index our
pages slowly whatever we do — not as a punishment, but because it has no reason
yet to spend crawl on us. So a calendar-based drip does not buy safety; it just
delays the pages that would have earned the trust.

**So the real version of your instinct is right, and it is this: do not put a
page in the index unless that page deserves to be there.** A small index that
is entirely good beats a large one that is 60% filler, and it is the filler —
not the size — that Google's policy is aimed at. That is what §3 builds, in
code, with a test.

Where the drip is still wanted, it is supported: every page type has an
optional release date, so a batch can be held back deliberately. It is off by
default, because the quality gate is the thing that actually protects us.

---

## 1. Decisions to take before anything else

### 1.1 Which market, and which language

The site is written in English. Every reference site you have sent me —
iranbroker, FastBull's Persian BrokersView — serves a Persian- or
Chinese-speaking audience. These are not the same product and they do not
compete in the same results.

| | English | Persian |
|---|---|---|
| Competition | Very high. BrokerChooser, ForexBrokers.com, Investopedia. | Much thinner. A handful of directories. |
| Ceiling | Enormous, and years away | Smaller, and reachable in months |
| What we already have | All of it | None of it — every page would need translating |
| Monetisation | Higher CPC, global affiliate programmes | Local, and many brokers restrict Iranian clients |

**Recommendation: pick one and commit this week.** If the audience is Iranian
traders, the whole site should be Persian with `lang="fa"`, `dir="rtl"`, Persian
slugs, and Persian content — and then almost none of the ranking advice below
changes, but the competitive maths gets far friendlier. If the audience is
global, we stay as we are and accept a longer climb.

Everything else in this document is language-agnostic. This is the one decision
that cannot be deferred, because it decides what the first fifty pages *are*.

### 1.2 The domain

Choose it before we publish anything, and never move it later — a migration
costs months of the authority this plan is trying to build. Do not buy an
expired domain with history: Google has a named spam policy for exactly that
("expired domain abuse"), and the check is whether the new content matches what
the domain used to be for.

### 1.3 What we are actually competing on

We cannot beat Investopedia on "what is forex". We can beat everybody on:

- **Which legal entity a reader is onboarded to, and what that entity's licence
  is worth.** Nobody else publishes an entity map. This is the whole product.
- **Licence numbers checked against the regulator's own register**, with the
  date of the reading and an honest "we could not read this one".
- **All-in cost in pips**, computed the same way for every broker, so the
  numbers are comparable.

Every page we publish should be traceable to one of those three, or it is
somebody else's page.

---

## 2. Where we stand today

179 URLs. By type:

| Pages | Type | Verdict |
|---:|---|---|
| 100 | `/coins/[coin]` | **Do not index.** Price, a sparkline, and links. CoinGecko and CoinMarketCap own these queries with live data we do not have. They are useful *inside* the site and hopeless outside it, and 100 of them against 79 real pages is exactly the ratio that makes a new domain look thin. |
| 30 | `/compare/[pair]` | **Index.** "X vs Y" is a real query with weak incumbents, and ours carries a genuine side-by-side of licence, cost and terms. Combinatorial pages are a doorway risk only when they are empty; these are not. |
| 26 | `/brokers`, `/props`, `/exchanges` records | **Index. These are the site.** Each carries ~780 words of review generated from its own record, plus the entity map, the licences and the costs. |
| 7 | `/calendar/[release]` | **Index.** Dates taken from the issuing institution, which most calendar sites do not do. |
| 5 | `/best/[criterion]` | **Index.** Highest commercial intent on the site. |
| 11 | Hubs and utilities | **Index**, except `/search` (a tool, not a document) and `/reviews/withdraw`. |

Indexed after the gate: **~78**. That is a healthy first index for a new
domain, and it is 78 pages that can each defend themselves.

### What is already right

Worth saying, because it is most of the technical work and it is done:

- One `<h1>` per page, unique `<title>` and meta description on all 179 —
  checked by `check-seo.mjs` on every CI run, which fails the build otherwise.
- Breadcrumb, FAQ, ItemList and FinancialService JSON-LD, validated for shape.
- CLS 0.0000 and LCP under a second on Slow 4G, measured at two widths.
- Server-rendered HTML with no client runtime on any page that matters, so
  there is nothing for a crawler to execute.
- A sitemap generated from the data rather than maintained by hand.
- axe-clean at three widths. Accessibility is not a ranking factor, but the
  things that fail an audit — unlabelled links, invisible text, no headings —
  are the same things that read as low quality.

### What is wrong, in priority order

1. **`aggregateRating` is built from the editor-verified subset.** Google's
   review-snippet rules say ratings must come from users and that *"human
   editors cannot curate local business ratings"*. Publishing an average over
   the reviews an editor chose to verify is curation, however well meant. Fix:
   emit `aggregateRating` only from all published reviews, and only above a
   floor — or not at all until there is real volume. §4.1.
2. **100 coin pages in the index.** §3.
3. **No author, no about page, no byline.** This is a YMYL category: Google's
   guidance puts money topics under the strictest E-E-A-T bar and says trust is
   the most important of the four. A finance site with no named human on it
   starts from behind. §4.2.
4. **The generated review has no "how this was made" note in the markup** where
   a rater would look. It has one on the page; it should also be in the
   author/publisher structured data. §4.2.
5. **No internal links from articles into the money pages** — there are no
   articles. §5.

---

## 3. The index policy, in code

One module decides, for every URL, whether it is indexable and why. The sitemap
reads it; the page's `robots` meta reads it; a test reads it. There is no second
list to fall out of step.

The rules, in order:

1. **A page with a release date in the future is not indexed and is not in the
   sitemap.** This is the drip, for when we want it. Default: no date, publish
   now.
2. **A page below its type's quality floor is not indexed.** The floors are
   per-type and deliberately concrete — a coin page needs more than a price, a
   comparison needs two records that both have cost and licence data.
3. **Utility pages are never indexed**: search, the withdrawal form, admin.
4. Everything else is indexed.

A page that is not indexed is still *served*, still linked, still crawlable,
still useful to a reader who is on the site. It carries `noindex, follow`, so
its links still pass on to the pages that are indexed. It simply does not
compete.

---

## 4. The technical work, in the order it should happen

### 4.1 Before the first page is public

- [x] Index policy live, sitemap gated, test green. *(§3)*
- [x] `aggregateRating` corrected: all published reviews, floor of 5, omitted
      below that rather than emitted as a small number.
- [ ] `robots.txt` allows everything except `/admin` and `/search`; sitemap
      referenced from it.
- [ ] Canonical `<link>` on every page, absolute, self-referencing.
- [x] `Organization` and `WebSite`/`SearchAction` JSON-LD — in the layout, so
      every page carries them and an `Article`'s publisher reference resolves in
      the same document. The legal name is still the brand name; that waits on
      §4.2.
- [ ] 404s return 404 (already true, checked by `check-seo`).
- [ ] Every outbound broker link `rel="nofollow sponsored"` — already true, and
      it matters: an affiliate link that passes ranking is a link scheme.

### 4.2 Trust, which is the ranking factor in this category

- [ ] An `/about` page with the real people, what they did before, and how the
      scores are produced. Google's framework is "Who, How and Why" — we answer
      *how* well and *who* not at all.
- [~] A byline and a date on every article, and the author is the
      *Organization*. A `Person` entry needs a person, and inventing one to fill
      a schema slot would be fabricating a credential on a page about where to
      put money — the thing this site exists to catch other people doing. It
      becomes a `Person` when `/about` can name one.
- [ ] `/methodology` linked from every score on the site — already done, and it
      is the strongest E-E-A-T asset we have. Add the date each weight was last
      changed.
- [ ] An editorial policy page: what we take money for, what we do not, how a
      correction is made, how long a verification is good for.
- [ ] Say in the markup, not only in the prose, that the long review is
      generated from the record. Google's generative-AI guidance asks for
      disclosure of process where it helps a reader; ours is a genuine
      differentiator rather than something to hide.

### 4.3 First month

- [ ] Search Console and Bing Webmaster verified, sitemap submitted to both.
- [ ] Analytics that does not need a cookie banner — a banner over the fold on
      arrival is a measurable bounce cost.
- [~] `lastmod` in the sitemap reflects the real date for the articles, which
      are the only thing on the site with an edit date to point at. The records
      still say "now", which is the thing to fix: Google reads it, and a sitemap
      where every page changed today is a sitemap it stops believing.
- [ ] An RSS feed for the articles.
- [ ] Internal links audited: every money page reachable in ≤3 clicks from the
      front page.

### 4.4 Do not do these

- **Do not buy links.** In this category the link brokers will find you. A link
  scheme is the one thing that takes a site out of the index entirely.
- **Do not publish a page per broker per country** ("Exness in Germany",
  "Exness in Italy" × 10 brokers = 100 pages). That is the doorway-page policy
  almost word for word.
- **Do not add a coin page per coin per exchange**, or any other multiplication
  of two lists we already have.
- **Do not chase "best forex broker 2026"** for the first year. It is owned by
  sites with a thousand referring domains. Win the long tail first.

---

## 5. Keywords: the map, and how it was built

No paid tool was used, so there are **no volume figures in this document** —
inventing them would be exactly the kind of unbacked number this project
refuses everywhere else. What follows is an intent map, extracted from the data
we hold, which is how a directory earns its traffic: the entity × modifier
matrix.

### 5.1 The matrix

Every record we hold (26) crossed with the questions a reader actually types:

| Modifier | Query shape | Which page owns it | Why we can win |
|---|---|---|---|
| review | `{broker} review` | `/brokers/{slug}` | 780 words, generated, plus the entity map |
| regulation | `is {broker} regulated`, `{broker} licence number` | `/brokers/{slug}#licences` | We publish the number and the register reading |
| entity | `which {broker} entity`, `{broker} {country} clients` | `/brokers/{slug}#entity` | **Nobody else publishes this** |
| cost | `{broker} spread`, `{broker} commission`, `{broker} fees` | `/brokers/{slug}#costs` | All-in pips, comparable across the list |
| minimum | `{broker} minimum deposit` | `/brokers/{slug}` + `/best/low-minimum-deposit` | |
| withdrawal | `{broker} withdrawal time`, `{broker} withdrawal problems` | `/brokers/{slug}#reviews` + `/status` | The outage page is unusual and sticky |
| safety | `is {broker} safe`, `is {broker} a scam` | `/brokers/{slug}` | High volume, high intent, and answerable with a licence |
| comparison | `{a} vs {b}` | `/compare/{a}-vs-{b}` | 30 of these already exist |
| prop rules | `{firm} drawdown`, `{firm} consistency rule` | `/props/{slug}#rules` | |
| exchange safety | `is {exchange} safe`, `{exchange} proof of reserves` | `/exchanges/{slug}#security` | |

That is 26 × 8 ≈ 200 distinct query clusters already served by pages that
exist. The work is not making more pages — it is making the 78 we have answer
those questions in the first screen.

### 5.2 The article layer

Entity pages catch people who already know the name. Articles catch people who
do not, and they are what earns links. Three to start, each answerable only by
a site that does what we do — **all three are published, at `/learn`**:

1. **How to check a broker's licence yourself** — the register for each
   regulator, what the statuses mean, and what a licence does *not* cover.
   Targets: `check broker licence`, `FCA register broker`, `is my broker
   regulated`. We read these registers daily; almost nobody writing about them
   does.
2. **What a forex spread actually costs you** — spread plus commission into
   one number, with the arithmetic shown and a worked example in money.
   Targets: `forex spread cost`, `pips to dollars`, `spread vs commission`.
3. **Which company you are actually signing with** — the entity map argument,
   which is the single idea this site exists for. Targets: `broker offshore
   entity`, `FCA entity vs offshore`, `which entity will I be onboarded to`.

Then, one every week or two, in this order: static vs trailing drawdown; what
proof of reserves does and does not prove; how compensation schemes actually
pay out; reading an economic calendar release.

### 5.3 Rules for every article

- One question per article, answered in the first two sentences.
- A worked example with real numbers from our own data.
- Links to at least three money pages, in the prose, with descriptive anchors.
- A named author, a published date, and a "last checked" date.
- No affiliate link above the fold, and none at all where it would change the
  advice.

---

## 6. The cadence

Not because Google requires it, but because it is the rate at which we can keep
quality up and see what works.

| Week | Publish | Also |
|---|---|---|
| 0 | The 78 gated pages, all at once | Search Console, sitemap, `/about`, editorial policy |
| 1–2 | Articles 1–3 — **done** | Watch Page Indexing weekly. Do not touch anything for two weeks. |
| 3–6 | One article a week | Fill the thinnest record pages; add brokers only with full licence data |
| 7–12 | One article a week; 5–10 new records | First link outreach — regulators' directories, trader forums, the brokers' own press pages |
| 13+ | Re-verify the oldest records | Expand only where Search Console shows impressions we are not converting to clicks |

**Records are added with full data or not at all.** A broker page with no
licence number is a page that drags the average down, and the average is what
decides how much of the site gets crawled.

---

## 7. How we will know it is working

In order, because they arrive in this order:

1. **Indexed / submitted ratio** in Search Console. Anything under 70% after a
   month means the gate in §3 was not strict enough.
2. **Impressions**, not clicks. Impressions appear months before positions are
   good enough to click.
3. **Average position for the entity queries in §5.1.** These should reach the
   first two pages before anything generic does.
4. **Clicks on `/best/*` and `/compare/*`** — the pages with commercial intent.
5. Only then: sessions, and whatever they turn into.

Check weekly, change nothing for the first month. Core updates roll out over
weeks, and a new site that keeps rewriting itself in response to noise never
accumulates the history that is the actual asset.

---

## Sources

- [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google Search's guidance on AI-generated content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)
- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Review snippet (Review, AggregateRating) structured data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Large site owner's guide to managing crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google says there is no SEO reason to delay the release of thousands of pages](https://www.seroundtable.com/google-delay-release-of-thousands-of-pages-35200.html)
