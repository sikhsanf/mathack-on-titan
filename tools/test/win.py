from playwright.sync_api import sync_playwright
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.route('**/three.min.js',lambda r:r.fulfill(body=three,content_type='application/javascript'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(1200)
    pg.click('#b-play');pg.click('.slot.empty >> nth=0');pg.wait_for_timeout(500)
    pg.fill('#in-name','Z');pg.click('#st-ok');pg.wait_for_timeout(500)
    pg.click('#b-go');pg.evaluate('startStage(0)');pg.wait_for_timeout(800)
    pg.evaluate('__G.hx=26;__G.go=true')
    def st(): return pg.evaluate('(__G.D&&__G.D.state)||null')
    for i in range(80):
        if st()=='ask':break
        pg.wait_for_timeout(250)
    print('pre',pg.evaluate('[__G.mode,__G.hx,__G.go,__G.walking,!!__G.D]'))
    for n in range(10):
        try: pg.wait_for_function("__G.D&&__G.D.state==='ask'",polling=50,timeout=15000)
        except Exception as e: print('noask');break
        pg.evaluate('onAnswer(true)')
        try:
            pg.wait_for_function("!__G.D||__G.D.state==='win'",polling='raf',timeout=4000);
            if pg.evaluate("__G.D&&__G.D.state==='win'"):break
        except Exception: pass
    for k,ms in enumerate([120,350,450,500,600]):
        pg.wait_for_timeout(ms);pg.screenshot(path=f'shots/win_{k}.png')
    b.close()
