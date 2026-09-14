# -*- coding: utf-8 -*-
import os

HEAD = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap">
  <style>
:root{--bg:#0B0E14;--sf:#141922;--sf2:#1C222D;--sf3:#232B38;--ln:#242C3A;--ink:#EEF1F6;--ink2:#A8B2C4;--mut:#6E7A8F;
--br:#D9B071;--br2:#8F6F3C;--brs:#2A2117;--tl:#5FC9C0;--tls:#13292A;
--up:#3DD68C;--ups:#0F2A20;--dn:#FF6B6B;--dns:#2C1719;--wn:#F5B942;--wns:#2E2513;--r:14px}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Vazirmatn,system-ui,sans-serif;direction:rtl;font-size:14px;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:var(--br);text-decoration:none}
a:hover{color:#EBC88F}
.n{font-family:Manrope,system-ui,sans-serif;direction:ltr;unicode-bidi:isolate;font-variant-numeric:tabular-nums}
.ph{background:var(--bg);display:flex;flex-direction:column;overflow:hidden}
.hd{display:flex;align-items:center;gap:10px;padding:16px 16px 10px;flex:none}
.lg{display:flex;align-items:center;gap:7px;font-family:Manrope;font-weight:800;font-size:16px;letter-spacing:-.025em;direction:ltr}
.lgm{width:25px;height:25px;border-radius:9px 9px 3px 9px;background:linear-gradient(145deg,#E8C489,var(--br2));display:grid;place-items:center;color:#0B0E14;font-size:10px;font-weight:800;flex:none}
.sp{flex:1}
.ic{width:34px;height:34px;border-radius:11px;background:var(--sf);border:1px solid var(--ln);display:grid;place-items:center;color:var(--ink2);flex:none}
.bd{flex:1;padding:0 16px;display:flex;flex-direction:column;gap:11px;overflow:hidden}
.cd{background:var(--sf);border:1px solid var(--ln);border-radius:var(--r);padding:13px 14px}
.ch{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.ch b{font-size:13.5px;font-weight:700}
.ch span.lv{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:var(--mut)}
.ch span.lv i{width:6px;height:6px;border-radius:50%;background:var(--up);display:block}
.rw{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--ln)}
.rw:last-child{border-bottom:0;padding-bottom:0}
.av{width:31px;height:31px;border-radius:10px;display:grid;place-items:center;font-family:Manrope;font-weight:800;font-size:11px;flex:none;color:#0B0E14}
.t1{font-size:13px;font-weight:600;line-height:1.35}
.t2{font-size:10.5px;color:var(--mut);line-height:1.45}
.up{color:var(--up)}
.dn{color:var(--dn)}
.pl{font-family:Manrope;font-size:11px;font-weight:700;padding:2px 7px;border-radius:7px;direction:ltr;display:inline-block;line-height:1.5}
.pl.u{background:var(--ups);color:var(--up)}
.pl.d{background:var(--dns);color:var(--dn)}
.tg{font-size:10px;padding:1px 6px;border-radius:5px;border:1px solid var(--ln);color:var(--ink2);font-family:Manrope;direction:ltr;display:inline-block;line-height:1.6}
.tg.g{border-color:#2E4A3C;color:var(--up);background:var(--ups)}
.sc{font-family:Manrope;font-weight:800;font-size:15px;color:var(--br);direction:ltr;letter-spacing:-.02em}
.tb{display:flex;border-top:1px solid var(--ln);background:var(--sf);padding:9px 4px 12px;flex:none}
.tbi{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:9.5px;color:var(--mut)}
.tbi.on{color:var(--br)}
.btn{display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(145deg,#E8C489,var(--br2));color:#0B0E14;font-weight:800;font-size:14px;padding:13px;border-radius:12px}
.btn2{display:flex;align-items:center;justify-content:center;gap:6px;background:var(--sf2);border:1px solid var(--ln);color:var(--ink);font-weight:600;font-size:13px;padding:11px;border-radius:11px}
.seg{display:flex;gap:4px;background:var(--sf2);border:1px solid var(--ln);border-radius:11px;padding:3px}
.seg div{flex:1;text-align:center;font-size:11.5px;padding:5px 4px;border-radius:8px;color:var(--mut)}
.seg div.on{background:var(--sf3);color:var(--ink);font-weight:600}
.fl{display:flex;gap:6px;overflow:hidden}
.fl span{font-size:11.5px;padding:5px 11px;border-radius:9px;background:var(--sf);border:1px solid var(--ln);color:var(--ink2);white-space:nowrap;flex:none}
.fl span.on{background:var(--brs);border-color:var(--br2);color:var(--br);font-weight:600}
.kv{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--ln);font-size:12.5px}
.kv:last-child{border-bottom:0}
.kv span{color:var(--mut)}
.kv b{font-weight:600}
  </style>
</helmet>
'''

TAIL = '\n</x-dc>\n</body>\n</html>\n'

# stroke icons on a 24 grid
def ico(p, s=20, c='currentColor', w=1.7, fill='none'):
    return ('<svg width="%d" height="%d" viewBox="0 0 24 24" fill="%s" stroke="%s" stroke-width="%s" '
            'stroke-linecap="round" stroke-linejoin="round">%s</svg>') % (s, s, fill, c, w, p)

I = {
 'home':  '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
 'grid':  '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
 'chart': '<path d="M4 19V9"/><path d="M10 19V4"/><path d="M16 19v-7"/><path d="M21 19H3"/>',
 'sig':   '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
 'user':  '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.9-3.8 3.9-5.6 7.5-5.6s6.6 1.8 7.5 5.6"/>',
 'srch':  '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/>',
 'bell':  '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/>',
 'back':  '<path d="M9 5l7 7-7 7"/>',
 'fwd':   '<path d="M15 5l-7 7 7 7"/>',
 'star':  '<path d="m12 3 2.6 5.6 6 .8-4.4 4.3 1.1 6.1L12 17l-5.3 2.8 1.1-6.1L3.4 9.4l6-.8L12 3Z"/>',
 'shld':  '<path d="M12 3 5 6v6c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6l-7-3Z"/><path d="m9.2 12 2 2 3.6-3.8"/>',
 'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
 'cal':   '<rect x="3.5" y="5" width="17" height="16" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 'chat':  '<path d="M20.5 11.5c0 4.1-3.8 7.4-8.5 7.4-1 0-2-.15-2.9-.43L4 20.5l1.2-3.6A7 7 0 0 1 3.5 11.5C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.5Z"/>',
 'filt':  '<path d="M4 6h16M7 12h10M10 18h4"/>',
 'chk':   '<path d="m5 12.5 4.5 4.5L19 7"/>',
 'alert': '<path d="M12 8v5"/><path d="M12 16.5h.01"/><circle cx="12" cy="12" r="8.5"/>',
 'wall':  '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16.5 14.5h2"/>',
 'trend': '<path d="m3 16 5.5-5.5 4 4L21 6"/><path d="M15.5 6H21v5.5"/>',
 'lock':  '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
 'x':     '<path d="M6 6l12 12M18 6 6 18"/>',
 'plus':  '<path d="M12 5v14M5 12h14"/>',
 'send':  '<path d="M21 4 3 11l7 2.5L12.5 21 21 4Z"/>',
 'doc':   '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/>',
 'glob':  '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z"/>',
 'dl':    '<path d="M12 4v11"/><path d="m8 11.5 4 4 4-4"/><path d="M4.5 19.5h15"/>',
}

def spark(pts, col, w=64, h=26, area=True, sw=1.7):
    lo, hi = min(pts), max(pts)
    rng = (hi - lo) or 1
    n = len(pts) - 1
    P = [(i * (w / n), h - 2.5 - (v - lo) / rng * (h - 5)) for i, v in enumerate(pts)]
    d = ' '.join(('M' if i == 0 else 'L') + '%.1f,%.1f' % p for i, p in enumerate(P))
    gid = 'sg%d' % (abs(hash(tuple(pts) + (col, w, h))) % 99999)
    a = ''
    if area:
        a = ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1">'
             '<stop offset="0" stop-color="%s" stop-opacity=".30"/>'
             '<stop offset="1" stop-color="%s" stop-opacity="0"/></linearGradient></defs>'
             '<path d="%s L%s,%s L0,%s Z" fill="url(#%s)"/>') % (gid, col, col, d, w, h, h, gid)
    return ('<svg width="%d" height="%d" viewBox="0 0 %d %d" fill="none" style="flex:none">%s'
            '<path d="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" stroke-linecap="round" fill="none"/></svg>'
            ) % (w, h, w, h, a, d, col, sw)

def tabbar(active):
    items = [('home', 'خانه'), ('grid', 'بروکرها'), ('chart', 'بازار'), ('sig', 'سیگنال'), ('user', 'من')]
    out = []
    for k, lbl in items:
        on = ' on' if k == active else ''
        out.append('<div class="tbi%s">%s<span>%s</span></div>' % (on, ico(I[k], 20, w=1.8), lbl))
    return '<div class="tb">%s</div>' % ''.join(out)

def nav(title, right=''):
    return ('<div class="hd"><div class="ic">%s</div>'
            '<b style="font-size:15px;font-weight:700">%s</b><div class="sp"></div>%s</div>'
            ) % (ico(I['back'], 19), title, right)

def write(name, body, outdir='.'):
    open(os.path.join(outdir, name), 'w', encoding='utf-8').write(HEAD + body + TAIL)
    print('  ', name, len(body))
