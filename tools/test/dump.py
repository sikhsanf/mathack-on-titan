import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page()
    pg.goto('file:///home/claude/mathack/test/harness.html');pg.wait_for_timeout(1000)
    fr=[f for f in pg.frames if f!=pg.main_frame][0]
    d=fr.evaluate("""()=>{const o={};for(const lv of Object.keys(ALL_CONTENT)){o[lv]=ALL_CONTENT[lv].map(h=>({no:h.no,stage:h.stage,ins:h.instruksiLayar||h.instruksi,tema:h.tema,items:h.items.map(i=>({mech:i.mech,nilai:i.nilai,keys:Object.keys(i).join(',')})).slice(0,6)}));}return o;}""")
    json.dump(d,open('dump.json','w'),ensure_ascii=False,indent=0)
    for lv in d:
        print(lv,len(d[lv]))
        for h in d[lv][:12]: print(' ',h['no'],h['stage'],h['ins'][:70],'|',[ (i['mech'],i['nilai'][:30] if i['nilai'] else None) for i in h['items'][:3]])
    b.close()
