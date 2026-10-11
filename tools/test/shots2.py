import sys
from playwright.sync_api import sync_playwright
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (390,844)
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':W,'height':H})
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(2500)
    S=f'/home/claude/mathack/test/shots/h{W}_'
    pg.screenshot(path=S+'1_title.png')
    pg.click('#b-play');pg.click('.slot.empty >> nth=0');pg.wait_for_timeout(500)
    pg.fill('#in-name','Zaid');pg.click('#st-ok');pg.wait_for_timeout(1500)
    pg.screenshot(path=S+'2_home.png')
    pg.click('#b-coop');pg.wait_for_timeout(500);pg.screenshot(path=S+'3_coop.png')
    pg.click('#co-sim');pg.wait_for_timeout(1800);pg.screenshot(path=S+'4_home_parent.png')
    pg.click('#b-go');pg.wait_for_timeout(300);pg.evaluate('startStage(0)');pg.wait_for_timeout(1500);pg.screenshot(path=S+'5_walk.png')
    pg.evaluate('__G.hx=26;__G.go=true')
    for i in range(60):
        if pg.evaluate('(__G.D&&__G.D.state)||null')=='ask':break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1500);pg.screenshot(path=S+'6_duel.png')
    pg.evaluate('onAnswer(true)');pg.wait_for_timeout(1700);pg.screenshot(path=S+'7_hit.png')
    print(errs[:6]);b.close()
