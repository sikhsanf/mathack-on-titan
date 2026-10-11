import sys
from playwright.sync_api import sync_playwright
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (780,360)
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':W,'height':H})
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(1200)
    S=f'/home/claude/mathack/test/shots/d{W}_'
    pg.click('#b-play');pg.click('.slot.empty >> nth=0');pg.wait_for_timeout(500)
    pg.screenshot(path=S+'0_create.png');pg.click('#sg-g button[data-v="1"]');pg.wait_for_timeout(600);pg.screenshot(path=S+'0_create_girl.png');pg.fill('#in-name','Zaid');pg.click('#st-ok');pg.wait_for_timeout(500)
    pg.screenshot(path=S+'a_home.png')
    pg.click('#b-go');pg.evaluate('startStage(0)')
    # speed: teleport near first titan
    pg.evaluate('__G.hx=20');pg.wait_for_timeout(1500);pg.screenshot(path=S+'w_walk.png');pg.evaluate('__G.go=true')
    def wait_state(st,n=80):
        for i in range(n):
            if pg.evaluate('(__G.D&&__G.D.state)||null')==st:return True
            pg.wait_for_timeout(250)
        return False
    for t in range(3):
        for i in range(60):
            if pg.evaluate('__G.mode')=='duel':break
            pg.wait_for_timeout(250)
        print('titan',t,'mode',pg.evaluate('__G.mode'))
        n=0
        while pg.evaluate('__G.mode')=='duel':
            if not wait_state('ask',40):
                if pg.evaluate('__G.mode')!='duel':break
                print('stuck',pg.evaluate('__G.D&&__G.D.state'));break
            n+=1
            if t==0 and n==1: pg.wait_for_timeout(1200);pg.screenshot(path=S+'b_ask.png')
            ok = not (t==0 and n==2) and not (t==1 and n==3)
            pg.evaluate(f'onAnswer({str(ok).lower()})')
            pg.wait_for_timeout(300 if ok else 650)
            if pg.evaluate('__G.D&&__G.D.state')=='win' and t==0: pg.wait_for_timeout(250);pg.screenshot(path=S+'e_win0.png');pg.wait_for_timeout(500);pg.screenshot(path=S+'e_win1.png')
            if t==0 and n==1: pg.screenshot(path=S+'c_attack.png')
            if t==0 and n==2: pg.screenshot(path=S+'d_stomp.png')
            pg.wait_for_timeout(1200)
            if pg.evaluate('__G.D&&__G.D.state')=='win' and t==0: pg.wait_for_timeout(900);pg.screenshot(path=S+'e_win.png')
        pg.evaluate(f'__G.hx=Math.max(__G.hx,{ [26,58,90][min(t+1,2)] })') if t<2 else None
        pg.evaluate('__G.go=true')
    pg.wait_for_timeout(2500);pg.screenshot(path=S+'f_result.png')
    print('mode',pg.evaluate('__G.mode'),'slot',pg.evaluate('JSON.stringify(__G.slot.prog)'),pg.evaluate('__G.slot.coins'))
    pg.click('#r-map');pg.wait_for_timeout(500);pg.screenshot(path=S+'g_map.png')
    print(errs[:10]);b.close()
