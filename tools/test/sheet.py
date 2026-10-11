import sys
from playwright.sync_api import sync_playwright
from PIL import Image
lv=sys.argv[1];W,H=390,440;nos=range(int(sys.argv[2]),int(sys.argv[3])+1);idx=int(sys.argv[4]) if len(sys.argv)>4 else 0
ims=[]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':W,'height':H+20})
    pg.goto('file:///home/claude/mathack/test/harness.html')
    pg.evaluate("document.getElementById('f').style.width='%dpx';document.getElementById('f').style.height='%dpx'"%(W,H))
    pg.wait_for_timeout(800)
    for no in nos:
        pg.evaluate("cmd({type:'ask',level:'%s',no:%d,idx:%d})"%(lv,no,idx));pg.wait_for_timeout(250)
        pg.screenshot(path='shots/_t.png',clip={'x':0,'y':0,'width':W,'height':H});ims.append(Image.open('shots/_t.png').copy())
    b.close()
cols=6;rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(W*cols,H*rows),'white')
for i,im in enumerate(ims):s.paste(im,((i%cols)*W,(i//cols)*H))
s=s.resize((s.width//2,s.height//2));s.save('shots/sheet_%s_%s.png'%(lv,sys.argv[2]))
