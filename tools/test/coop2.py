import sys,time
from playwright.sync_api import sync_playwright
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
URL='http://localhost:8765/index.html?peerhost=localhost&peerport=9000'
errs=[]
def mk(b,w,h):
    ctx=b.new_context(viewport={'width':w,'height':h});pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    return pg
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    A=mk(b,390,844);B=mk(b,390,844)
    S='/home/claude/mathack/test/shots/co_'
    A.goto(URL);B.goto(URL);A.wait_for_timeout(1500);B.wait_for_timeout(1500)
    A.click('#b-play');A.click('.slot.empty >> nth=0');A.wait_for_timeout(400);A.fill('#in-name','Zaid');A.click('#st-ok');A.wait_for_timeout(1200)
    A.click('#b-coop');A.wait_for_timeout(2500)
    code=A.inner_text('#co-code');print('code',code);A.screenshot(path=S+'1_host_code.png')
    B.click('#b-parent');B.wait_for_timeout(400);B.click('#jn-make');B.wait_for_timeout(300)
    B.fill('#g-name','Mama');B.fill('#g-a',str(B.evaluate('GATE.ans')));B.click('#g-ok');B.wait_for_timeout(500)
    B.fill('#jn-a',str(B.evaluate('GATE.ans')));B.fill('#jn-code',code);B.screenshot(path=S+'2_join.png');B.click('#jn-ok')
    for i in range(40):
        if B.evaluate('__G.mode')=='parent':break
        B.wait_for_timeout(300)
    print('B mode',B.evaluate('__G.mode'),'A parent',A.evaluate('!!__G.parent'))
    A.wait_for_timeout(1500);A.screenshot(path=S+'3_host_joined.png');B.screenshot(path=S+'4_parent_home.png')
    A.click('#co-close');A.click('#b-go');A.wait_for_timeout(300);A.evaluate('startStage(0)');A.wait_for_timeout(1200)
    A.evaluate('__G.hx=12;__G.go=true');A.wait_for_timeout(3500);B.screenshot(path=S+'4b_parent_walk.png');print('B pv',B.evaluate('[__G.pvOn,__G.hx.toFixed(1),__G.mode]'),'A hx',A.evaluate('__G.hx.toFixed(1)'))
    A.evaluate('__G.tIdx=1;__G.hx=14;coopPush()');A.wait_for_timeout(3500);B.screenshot(path=S+'4c_parent_follow.png');print('B follow',B.evaluate('__G.titans.map(t=>!!t.follow)'))
    A.evaluate('__G.hx=26;__G.go=true')
    for i in range(60):
        if A.evaluate('(__G.D&&__G.D.state)||null')=='ask':break
        A.wait_for_timeout(250)
    A.wait_for_timeout(1500)
    B.screenshot(path=S+'5_parent_duel.png')
    # lose a heart then heal
    A.evaluate('onAnswer(false)');A.wait_for_timeout(2500)
    print('A hearts before heal',A.evaluate('__G.D.hearts'))
    B.click('.perk.heal');A.wait_for_timeout(1200);print('after heal',A.evaluate('__G.D.hearts'),'perks',A.evaluate('JSON.stringify(COOP.perks)'))
    B.click('.perk.power');B.wait_for_timeout(800);print('buff',A.evaluate('JSON.stringify(COOP.buff)'))
    B.click('.pc-cheer button >> nth=0');A.wait_for_timeout(600);A.screenshot(path=S+'6_host_duel.png');B.screenshot(path=S+'7_parent_after.png')
    B.click('.perk.gift');A.wait_for_timeout(800);print('gift coins',A.evaluate('__G.slot.coins'))
    # answer right with power
    for i in range(40):
        if A.evaluate('(__G.D&&__G.D.state)||null')=='ask':break
        A.wait_for_timeout(250)
    A.evaluate('onAnswer(true)')
    for i in range(60):
        if A.evaluate('__G.D&&__G.D.hp')<4:break
        A.wait_for_timeout(300)
    print('hp after power hit',A.evaluate('__G.D&&__G.D.hp'),'/',A.evaluate('__G.D&&__G.D.max'),'buff',A.evaluate('JSON.stringify(COOP.buff)'));A.screenshot(path=S+'8_power_hit.png')
    A.evaluate('COOP.conn.close()');B.wait_for_timeout(9000)
    print('after drop: B mode',B.evaluate('__G.mode'),'lost',B.evaluate('COOP.remote&&COOP.remote.lost'),'A parent',A.evaluate('!!__G.parent'));B.screenshot(path=S+'9_reconnected.png')
    B.click('#pc-leave');B.wait_for_timeout(1000);print('B mode',B.evaluate('__G.mode'),'A parent',A.evaluate('!!__G.parent'))
    print(errs[:6]);b.close()
