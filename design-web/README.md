# CommentFX — mobile web design

The public website, mobile-first, in English. 11 pages on one canvas.

Sibling folder `../design/` holds the **app** screens (dark theme, Persian).
This folder is the **website** (light theme, English). They are separate
products with separate identities — don't cross the tokens.

## Palette

White cards on a cool grey ground, with market colour reserved for market data.

| Role | Token | Value |
|---|---|---|
| Page ground | `--bg` | `#F1F2F4` |
| Card | `--card` | `#FFFFFF` |
| Inset / subtle fill | `--card2` / `--card3` | `#F8F9FB` / `#EFF2F6` |
| Divider | `--line` / `--line2` | `#EAEDF2` / `#F2F4F7` |
| Text primary | `--ink` | `#0D1421` |
| Text secondary | `--ink2` | `#58667E` |
| Text tertiary | `--ink3` | `#9AA3B5` |
| Accent (score, rank 1–3, links) | `--br` | `#A87528` |
| Accent deep / accent tint | `--br2` / `--brbg` | `#835A18` / `#FBF4E4` |
| Up | `--up` / `--upbg` | `#14B87C` / `#E4F7EF` |
| Down | `--dn` / `--dnbg` | `#E0393F` / `#FDEBEB` |
| Warning | `--wn` / `--wnbg` | `#BE7A09` / `#FDF3DC` |

Two rules that hold the system together:

1. **The primary button is near-black `#0D1421`, never blue.** Every competitor
   in this category (CoinMarketCap, Coinbase, TradingView) is blue. Black plus
   brass on white is more distinctive and reads more expensive.
2. **Green and red are for market data only.** No green buttons, no red links —
   otherwise "up" and "down" stop meaning anything.

Radius 16px on cards, 10–13px on controls. Shadow is deliberately almost
invisible: `0 1px 2px rgba(13,20,33,.04), 0 6px 18px -10px rgba(13,20,33,.10)`.

## Type

- **Bricolage Grotesque** (`.dp`) — page titles and display figures only, used
  sparingly. It carries the personality.
- **Manrope** — all UI, labels and data. Numbers get `.n`
  (`font-variant-numeric: tabular-nums`) so price columns never shift as values
  tick.

## Pages

| File | Page |
|---|---|
| `Main.dc.html` | Home — the card/widget grid |
| `Brokers.dc.html` | Forex broker rankings |
| `BrokerDetail.dc.html` | Broker page — includes the entity map |
| `Exchanges.dc.html` | Crypto exchange rankings |
| `Props.dc.html` | Prop firm rankings + rule-change log |
| `Memecoins.dc.html` | Memecoin radar with contract audit |
| `Coin.dc.html` | Coin page |
| `Compare.dc.html` | Broker vs broker |
| `WhereToBuy.dc.html` | Where to buy — the highest-earning page per coin |
| `Article.dc.html` | Article / news |
| `Alert.dc.html` | Price alert |
| `canvas.json` | Canvas layout, pages and annotations |

## Structure that carries the product

Two patterns are load-bearing and should survive into the real build:

- **Every ranked row leads with its rank and one "why" line.** "Fastest verified
  withdrawals — 18 min median" is what separates a ranking from a directory.
- **Every list ends with "How the score is built"** — published weights and an
  explicit statement that rank is not for sale. This is the trust mechanism
  competitors have no answer to.

## Regenerating

`_e.py` holds the tokens, icon set, country flags and shared helpers.
`e1.py`–`e5.py` generate the artboards. Edit the relevant generator and re-run:

```sh
for g in e1 e2 e3 e4 e5; do python3 $g.py; done
```

All figures in the designs are sample data.
