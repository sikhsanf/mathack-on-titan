from playwright.sync_api import sync_playwright
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(1200)
    pg.click('#b-play');pg.click('.slot.empty >> nth=0');pg.wait_for_timeout(500)
    pg.fill('#in-name','Z');pg.click('#st-ok');pg.wait_for_timeout(500)
    pg.click('#b-go');pg.evaluate('startStage(0)');pg.wait_for_timeout(800)
    def duel(hx):
        pg.evaluate(f'__G.hx={hx};__G.go=true')
        pg.wait_for_function("__G.D&&__G.D.state==='ask'",polling=100,timeout=60000)
    duel(26)
    for n in range(10):
        pg.wait_for_function("__G.D&&__G.D.state==='ask'",polling=50,timeout=20000)
        pg.evaluate('onAnswer(true)')
        pg.wait_for_timeout(500);pg.screenshot(path='shots/ap_%d.png'%n) if n==0 else None
        try:
            pg.wait_for_function("!__G.D||__G.D.state==='win'",polling='raf',timeout=4000)
            if pg.evaluate("__G.D&&__G.D.state==='win'"):break
        except Exception: pass
    pg.wait_for_timeout(600);pg.screenshot(path='shots/ap_win.png')
    pg.wait_for_function("__G.mode==='play'",polling=200,timeout=30000)
    pg.evaluate('__G.hx=58;__G.go=true');pg.wait_for_timeout(2500);pg.screenshot(path='shots/ap_follow.png')
    print(pg.evaluate("[__G.slot.prog.friends,__G.titans.filter(t=>t.follow).length]"))
    pg.evaluate("document.querySelector('#duelPanel').classList.remove('show','walk');goHome()");pg.wait_for_timeout(1500);pg.screenshot(path='shots/ap_home.png')
    pg.evaluate("__G.slot.prog.friends.push('jelly','bee','matahari','madu','shroom','bunny','raja');goHome()");pg.wait_for_timeout(1500);pg.screenshot(path='shots/ap_home2.png')
    print(errs);b.close()
