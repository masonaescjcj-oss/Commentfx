# -*- coding: utf-8 -*-
import os  # English / LTR build

HEAD = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700;800&display=swap">
  <style>
:root{
--bg:#F1F2F4;--card:#FFFFFF;--card2:#F8F9FB;--card3:#EFF2F6;--line:#EAEDF2;--line2:#F2F4F7;
--ink:#0D1421;--ink2:#58667E;--ink3:#9AA3B5;
--br:#A87528;--br2:#835A18;--brbg:#FBF4E4;
--up:#14B87C;--upbg:#E4F7EF;--dn:#E0393F;--dnbg:#FDEBEB;--wn:#BE7A09;--wnbg:#FDF3DC;
--r:16px;--sh:0 1px 2px rgba(13,20,33,.04),0 6px 18px -10px rgba(13,20,33,.10);
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Manrope,system-ui,sans-serif;direction:ltr;
font-size:14px;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:var(--br);text-decoration:none}
a:hover{color:var(--br2)}
.n{font-variant-numeric:tabular-nums;letter-spacing:-.005em}
.dp{font-family:'Bricolage Grotesque',Manrope,system-ui,sans-serif;letter-spacing:-.025em}
.pg{width:390px;background:var(--bg);display:flex;flex-direction:column;overflow:hidden}

/* header */
.hdr{position:relative;background:var(--card);border-bottom:1px solid var(--line);flex:none}
.hbar{display:flex;align-items:center;gap:10px;padding:13px 16px}
.lg{display:flex;align-items:center;gap:7px;font-family:Manrope;font-weight:800;font-size:16px;letter-spacing:-.03em}
.lgm{width:26px;height:26px;border-radius:9px 9px 9px 3px;background:var(--ink);display:grid;place-items:center;color:#fff;font-size:9.5px;font-weight:800;flex:none;font-family:Manrope}
.sp{flex:1}
.ib{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;color:var(--ink2);flex:none}
.navs{display:flex;gap:7px;padding:0 16px 11px;overflow:hidden}
.navs span{font-size:12.5px;padding:5px 12px;border-radius:9px;background:var(--card2);color:var(--ink2);white-space:nowrap;flex:none;border:1px solid var(--line)}
.navs span.on{background:var(--ink);color:#fff;border-color:var(--ink);font-weight:600}

/* body + cards */
.bd{padding:14px 16px 22px;display:flex;flex-direction:column;gap:13px}
.cd{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:15px 16px}
.cd.p0{padding:0}
.ch{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}
.ch b{font-size:15px;font-weight:700;letter-spacing:-.01em}
.ch a{font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:3px}
.lv{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:var(--ink3)}
.lv i{width:6px;height:6px;border-radius:50%;background:var(--up);display:block}
.sec{font-size:11px;font-weight:700;color:var(--ink3);letter-spacing:.05em;margin:4px 2px -2px}

/* rows */
.rw{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--line2)}
.rw:first-child{padding-top:0}
.rw:last-child{border-bottom:0;padding-bottom:0}
.av{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:12px;flex:none;color:#fff}
.sq{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;font-weight:800;font-size:12.5px;flex:none}
.t1{font-size:14px;font-weight:600;line-height:1.35;letter-spacing:-.01em}
.t2{font-size:11.5px;color:var(--ink3);line-height:1.45}
.t3{font-size:12.5px;color:var(--ink2);line-height:1.7}
.up{color:var(--up)}.dn{color:var(--dn)}
.pl{font-size:12px;font-weight:700;padding:3px 9px;border-radius:8px;display:inline-flex;align-items:center;gap:3px;line-height:1.45}
.pl.u{background:var(--up);color:#fff}.pl.d{background:var(--dn);color:#fff}
.pls{font-size:11.5px;font-weight:700}
.tg{font-size:10.5px;padding:2px 7px;border-radius:6px;background:var(--card2);border:1px solid var(--line);color:var(--ink2);font-family:Manrope;display:inline-block;line-height:1.55}
.tg.g{background:var(--upbg);border-color:transparent;color:var(--up)}
.tg.r{background:var(--dnbg);border-color:transparent;color:var(--dn)}
.tg.w{background:var(--wnbg);border-color:transparent;color:var(--wn)}
.tg.b{background:var(--brbg);border-color:transparent;color:var(--br)}

/* rank */
.rk{width:22px;text-align:center;font-size:13px;font-weight:800;color:var(--ink3);flex:none}
.rk.top{color:var(--br)}
.sc{font-family:Manrope;font-weight:800;font-size:16px;color:var(--ink);letter-spacing:-.02em}

/* buttons */
.btn{display:flex;align-items:center;justify-content:center;gap:7px;background:var(--ink);color:#fff;font-weight:700;font-size:14.5px;padding:14px;border-radius:13px}
.btn.g{background:var(--br)}
.btn2{display:flex;align-items:center;justify-content:center;gap:6px;background:var(--card);border:1px solid var(--line);color:var(--ink);font-weight:600;font-size:13.5px;padding:13px;border-radius:13px}
.seg{display:flex;gap:3px;background:var(--card3);border-radius:11px;padding:3px}
.seg div{flex:1;text-align:center;font-size:12px;padding:6px 4px;border-radius:8px;color:var(--ink2)}
.seg div.on{background:var(--card);color:var(--ink);font-weight:700;box-shadow:0 1px 3px rgba(13,20,33,.09)}
.kv{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line2);font-size:13px}
.kv:last-child{border-bottom:0}
.kv>span{color:var(--ink3);font-size:12.5px}
.kv>b{font-weight:600}
.mtr{display:flex;flex-direction:column;gap:7px;background:var(--card2);border-radius:12px;padding:11px 12px}
.mtr .bar{height:4px;border-radius:99px;background:var(--card3);overflow:hidden}
.mtr .bar i{display:block;height:100%;border-radius:99px}
  </style>
</helmet>
'''
TAIL = '\n</x-dc>\n</body>\n</html>\n'

def ico(p, s=20, c='currentColor', w=1.8, fill='none'):
    return ('<svg width="%d" height="%d" viewBox="0 0 24 24" fill="%s" stroke="%s" stroke-width="%s" '
            'stroke-linecap="round" stroke-linejoin="round" style="flex:none">%s</svg>')%(s,s,fill,c,w,p)

I = {
 'srch':'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/>',
 'menu':'<path d="M4 7h16M4 12h16M4 17h10"/>',
 'back':'<path d="M9 5l7 7-7 7"/>',
 'fwd':'<path d="M15 5l-7 7 7 7"/>',
 'down':'<path d="m6 9 6 6 6-6"/>',
 'star':'<path d="m12 3 2.6 5.6 6 .8-4.4 4.3 1.1 6.1L12 17l-5.3 2.8 1.1-6.1L3.4 9.4l6-.8L12 3Z"/>',
 'shld':'<path d="M12 3 5 6v6c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6l-7-3Z"/><path d="m9.2 12 2 2 3.6-3.8"/>',
 'chk':'<path d="m5 12.5 4.5 4.5L19 7"/>',
 'clock':'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
 'filt':'<path d="M4 6h16M7 12h10M10 18h4"/>',
 'share':'<path d="M4 12v7a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-7"/><path d="M12 15V3.5"/><path d="m8 7 4-3.5L16 7"/>',
 'heart':'<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20Z"/>',
 'glob':'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z"/>',
 'phone':'<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/>',
 'mail':'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
 'alert':'<path d="M12 8.5v4.5M12 16.5h.01"/><circle cx="12" cy="12" r="8.5"/>',
 'trend':'<path d="m3 16 5.5-5.5 4 4L21 6"/><path d="M15.5 6H21v5.5"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'x':'<path d="M6 6l12 12M18 6 6 18"/>',
 'flame':'<path d="M12 3s5 4 5 8a5 5 0 0 1-10 0c0-1.6.8-3 1.6-4 .3 1 1 1.8 1.9 1.8C12.7 8.8 12 5.4 12 3Z"/>',
 'lock':'<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
 'users':'<circle cx="9" cy="8" r="3.4"/><path d="M3 20c.7-3.4 3.2-5 6-5s5.3 1.6 6 5"/><path d="M16 5.2a3.4 3.4 0 0 1 0 5.6M17.5 15c2 .6 3.4 2.2 3.9 5"/>',
 'doc':'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/>',
 'pen':'<path d="m5 19 .8-3.4L16 5.4a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L9.4 19.2 6 20Z"/>',
 'scale':'<path d="M12 4v16M7 8H3.5M7 8l-2.5 6h5L7 8ZM17 8h3.5M17 8l2.5 6h-5L17 8ZM7 8h10"/>',
 'bolt':'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
 'wallet':'<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16.5 14.5h2"/>',
}

# --- little country flags (20x14, simplified stripe forms) -------------------
def flag(code, w=20, h=14):
    r = 3
    S = {
      'AU': '<rect width="20" height="14" fill="#0B2C6B"/><rect width="9" height="6.5" fill="#0B2C6B"/><path d="M0 0l9 6.5M9 0 0 6.5" stroke="#fff" stroke-width="1.2"/><circle cx="14.5" cy="9.5" r="1.5" fill="#fff"/><circle cx="16.8" cy="4" r="1" fill="#fff"/>',
      'GB': '<rect width="20" height="14" fill="#0B2C6B"/><path d="M0 0l20 14M20 0 0 14" stroke="#fff" stroke-width="2.6"/><path d="M0 0l20 14M20 0 0 14" stroke="#CE1124" stroke-width="1.3"/><path d="M10 0v14M0 7h20" stroke="#fff" stroke-width="3.6"/><path d="M10 0v14M0 7h20" stroke="#CE1124" stroke-width="2"/>',
      'CY': '<rect width="20" height="14" fill="#fff"/><path d="M7 5.5c1.6-1 4-1.2 6 .2 1 .7.6 2-.8 2.3-2 .4-4-.4-5.2-1.4Z" fill="#D57800"/><path d="M7.5 9.6q1.2.9 2.4 0M10.5 9.6q1.2.9 2.4 0" stroke="#4E5B31" stroke-width=".8" fill="none"/>',
      'SC': '<rect width="20" height="14" fill="#fff"/><path d="M0 14 0 0h5Z" fill="#003F87"/><path d="M0 14 5 0h5.5Z" fill="#FCD856"/><path d="M0 14 10.5 0H20Z" fill="#D62828"/><path d="M0 14 20 0v6.5Z" fill="#fff"/><path d="M0 14 20 6.5V14Z" fill="#007A3D"/>',
      'ZA': '<rect width="20" height="14" fill="#002395"/><rect width="20" height="7" fill="#DE3831"/><path d="M0 0l8 7-8 7z" fill="#007A4D"/><path d="M0 1.6 6.4 7 0 12.4z" fill="#fff"/><path d="M0 3.4 4.6 7 0 10.6z" fill="#000"/>',
      'MU': '<rect width="20" height="3.5" fill="#EA2839"/><rect y="3.5" width="20" height="3.5" fill="#1A206D"/><rect y="7" width="20" height="3.5" fill="#FFD500"/><rect y="10.5" width="20" height="3.5" fill="#00A551"/>',
      'BZ': '<rect width="20" height="14" fill="#003F87"/><rect width="20" height="2.2" fill="#CE1126"/><rect y="11.8" width="20" height="2.2" fill="#CE1126"/><circle cx="10" cy="7" r="3.4" fill="#fff"/>',
      'VC': '<rect width="20" height="14" fill="#FCD116"/><rect width="6" height="14" fill="#0072C6"/><rect x="14" width="6" height="14" fill="#009E49"/>',
      'AE': '<rect width="20" height="14" fill="#fff"/><rect width="20" height="4.66" fill="#00843D"/><rect y="9.33" width="20" height="4.67" fill="#000"/><rect width="5.5" height="14" fill="#CE1126"/>',
      'SG': '<rect width="20" height="14" fill="#fff"/><rect width="20" height="7" fill="#ED2939"/><circle cx="5" cy="3.5" r="2.2" fill="#fff"/><circle cx="6" cy="3.5" r="2.2" fill="#ED2939"/>',
      'US': '<rect width="20" height="14" fill="#fff"/><path d="M0 2h20M0 6h20M0 10h20" stroke="#B22234" stroke-width="2"/><rect width="9" height="7" fill="#3C3B6E"/>',
      'MT': '<rect width="20" height="14" fill="#fff"/><rect x="10" width="10" height="14" fill="#CF142B"/>',
    }.get(code, '<rect width="20" height="14" fill="#D8DCE4"/>')
    return ('<svg width="%d" height="%d" viewBox="0 0 20 14" style="flex:none;border-radius:%dpx;overflow:hidden;'
            'box-shadow:0 0 0 1px rgba(13,20,33,.08) inset"><g>%s</g></svg>')%(w,h,r,S)

def spark(pts, col, w=64, h=26, area=True, sw=1.8):
    lo, hi = min(pts), max(pts); rng = (hi-lo) or 1; n = len(pts)-1
    P = [(i*(w/n), h-2.5-(v-lo)/rng*(h-5)) for i,v in enumerate(pts)]
    d = ' '.join(('M' if i==0 else 'L')+'%.1f,%.1f'%p for i,p in enumerate(P))
    gid = 'g%d'%(abs(hash(tuple(pts)+(col,w,h)))%99999)
    a = ''
    if area:
        a = ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1">'
             '<stop offset="0" stop-color="%s" stop-opacity=".22"/>'
             '<stop offset="1" stop-color="%s" stop-opacity="0"/></linearGradient></defs>'
             '<path d="%s L%s,%s L0,%s Z" fill="url(#%s)"/>')%(gid,col,col,d,w,h,h,gid)
    return ('<svg width="%d" height="%d" viewBox="0 0 %d %d" fill="none" style="flex:none">%s'
            '<path d="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" stroke-linecap="round"/></svg>'
            )%(w,h,w,h,a,d,col,sw)

def stars(v, s=13):
    full = int(v); out=''
    for i in range(5):
        c = '#A87528' if i < full else '#DFE3EA'
        out += ('<svg width="%d" height="%d" viewBox="0 0 24 24" fill="%s" style="flex:none">'
                '<path d="m12 3 2.6 5.6 6 .8-4.4 4.3 1.1 6.1L12 17l-5.3 2.8 1.1-6.1L3.4 9.4l6-.8L12 3Z"/></svg>')%(s,s,c)
    return '<span style="display:inline-flex;gap:1.5px">%s</span>'%out

def header(active, title=None, back=False):
    nav = ['Brokers','Prop Firms','Exchanges','Memecoins','Coins','Calendar','News']
    chips = ''.join('<span class="%s">%s</span>'%('on' if t==active else '', t) for t in nav)
    left = ('<div class="ib">%s</div><div class="ib">%s</div>'%(ico(I['srch'],19), ico(I['menu'],19)))
    if back:
        first = '<div class="ib" style="margin-right:-6px">%s</div><b style="font-size:15.5px;font-weight:700">%s</b>'%(ico(I['back'],19), title)
    else:
        first = '<div class="lg"><span class="lgm">FX</span>CommentFX</div>'
    return ('<div class="hdr"><div class="hbar">%s<div class="sp"></div>%s</div>'
            '<div class="navs">%s</div></div>')%(first, left, chips)

def write(name, body, outdir='.'):
    open(os.path.join(outdir,name),'w',encoding='utf-8').write(HEAD+body+TAIL)
    print('  ', name, len(body))

REG={'GB':'FCA','CY':'CySEC','SC':'FSA','AU':'ASIC','MU':'FSC','BZ':'IFSC','ZA':'FSCA','VC':'FSA','MT':'MFSA','AE':'DFSA','SG':'MAS'}

def intro(title, count, lead, unit='results'):
    return ('<div style="padding:2px 2px 0">'
      '<h1 class="dp" style="font-size:26px;font-weight:700;margin:0 0 8px;line-height:1.22;text-wrap:balance">%s</h1>'
      '<p class="t3" style="margin:0 0 12px;max-width:48ch">%s</p>'
      '<div style="display:flex;align-items:center;gap:8px">'
      '<span class="t2"><b class="n" style="color:var(--ink);font-size:13px">%s</b> %s</span>'
      '<span style="color:var(--line)">·</span><span class="t2">updated 3 min ago</span>'
      '<div class="sp"></div><span class="t2" style="display:inline-flex;align-items:center;gap:5px">%s Sort: <b style="color:var(--ink2)">Score</b></span>'
      '</div></div>')%(title, lead, count, unit, ico(I['filt'],13,'var(--ink3)'))

def chips(items):
    return '<div class="navs" style="padding:0">%s</div>'%''.join(
        '<span class="%s">%s</span>'%('on' if on else '', t) for t, on in items)

def cbox(on):
    return ('<div style="width:20px;height:20px;border-radius:6px;flex:none;%s;display:grid;place-items:center">%s</div>'
      %('background:var(--ink);border:1.5px solid var(--ink)' if on else 'border:1.5px solid #D8DDE6',
        ico(I['chk'],12,'#fff',2.8) if on else ''))
