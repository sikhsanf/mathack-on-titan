import sys, json
from playwright.sync_api import sync_playwright
W=int(sys.argv[1]) if len(sys.argv)>1 else 560
H=int(sys.argv[2]) if len(sys.argv)>2 else 340
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':W,'height':H})
    pg.on('console',lambda m: errs.append(('console',m.type,m.text)) if m.type in('error',) else None)
    pg.on('pageerror',lambda e: errs.append(('pageerror',str(e))))
    pg.goto('file:///home/claude/mathack/test/harness.html')
    pg.evaluate("document.getElementById('f').style.width='%dpx';document.getElementById('f').style.height='%dpx'"%(W,H))
    pg.wait_for_timeout(800)
    print('events', pg.evaluate('EV.map(e=>e.type)'))
    rows=[]
    for lv in ['prak','k']:
        for no in range(1,31):
            for idx in [0,3]:
                pg.evaluate("EV.length=0; cmd({type:'ask',level:'%s',no:%d,idx:%d})"%(lv,no,idx))
                pg.wait_for_timeout(120)
                ev=pg.evaluate('EV.map(e=>e.type+(e.msg?":"+e.msg.slice(0,120):""))')
                fr=pg.frame_locator('#f')
                # measure overflow inside the iframe
                m=pg.frames[1].evaluate("({sh:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth,ch:innerHeight,cw:innerWidth,txt:document.getElementById('stageArea').innerText.slice(0,40)})")
                rows.append((lv,no,idx,ev,m))
                if idx==0 and no in (1,2,4,8,12,19,22,23,26,28,29,30):
                    pg.screenshot(path='shots/e_%s_%02d.png'%(lv,no))
    bad=[r for r in rows if 'error' in ' '.join(r[3]) or 'asked' not in ' '.join(r[3])]
    print('asked ok:',len(rows)-len(bad),'bad:',len(bad))
    for r in bad[:10]: print(r)
    tall=[r for r in rows if r[4]['sh']>r[4]['ch']+4]
    wide=[r for r in rows if r[4]['sw']>r[4]['cw']+4]
    print('taller than viewport:',len(tall),' wider:',len(wide))
    for r in wide[:8]: print('WIDE',r[0],r[1],r[2],r[4])
    for r in tall[:0]: print('TALL',r[0],r[1],r[2],r[4]['sh'])
    print('errors',errs[:10])
    b.close()
