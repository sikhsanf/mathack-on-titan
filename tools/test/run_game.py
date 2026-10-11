import sys,time
from playwright.sync_api import sync_playwright
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (780,360)
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':W,'height':H})
    pg.on('console',lambda m:errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(1500)
    S='/home/claude/mathack/test/shots/g_'
    pg.screenshot(path=S+'1title.png')
    pg.click('#b-play');pg.wait_for_timeout(500);pg.screenshot(path=S+'2slots.png')
    pg.click('.slot.empty >> nth=0');pg.wait_for_timeout(900)
    pg.fill('#in-name','Zaid');pg.click('#st-tabs [data-tab=hat]');pg.wait_for_timeout(300);pg.screenshot(path=S+'3create.png')
    pg.click('#st-ok');pg.wait_for_timeout(900);pg.screenshot(path=S+'4home.png')
    pg.click('#b-go');pg.wait_for_timeout(500);pg.screenshot(path=S+'5map.png')
    pg.click('.node >> nth=0');pg.wait_for_timeout(2500);pg.screenshot(path=S+'6play.png')
    # wait for duel
    for i in range(60):
        if pg.evaluate('__G.mode')=='duel':break
        pg.wait_for_timeout(500)
    print('mode',pg.evaluate('__G.mode'))
    pg.wait_for_timeout(2500);pg.screenshot(path=S+'7duel.png')
    print(errs[:15])
    b.close()
