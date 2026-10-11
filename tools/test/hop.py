from playwright.sync_api import sync_playwright
three=open('/home/claude/mathack/node_modules/three/build/three.min.js').read()
import sys
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
    pg.evaluate('__G.hx=26;__G.go=true')
    pg.wait_for_function("__G.D&&__G.D.state==='ask'",polling=100,timeout=60000)
    for a in sys.argv[1:]:
        lvl,no,idx=a.split(':')
        pg.evaluate(f"engCmd({{type:'ask',level:'{lvl}',no:{no},idx:{idx}}})");pg.wait_for_timeout(1800)
        pg.screenshot(path=f'shots/q_{lvl}{no}_{idx}.png')
    print(errs);b.close()
