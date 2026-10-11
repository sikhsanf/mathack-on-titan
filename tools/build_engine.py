#!/usr/bin/env python3
"""Turn the wife's math app (math_app_v1-14.html) into an embeddable question engine.
Output: src/engine.html  (no PNG icons -> emoji fallback; only world-1 halaman; bridge to parent via postMessage)
Usage: build_engine.py <path to original html>
"""
import re, json, sys

SRC = sys.argv[1]
MAX_NO = int(sys.argv[2]) if len(sys.argv) > 2 else 30   # halaman 1..30 = stages 1-3 = world 1

t = open(SRC, encoding='utf-8').read()

# 1. strip the 346 base64 PNG icons (-> emoji fallback built into the app)
t = re.sub(r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]+', 'data:,', t)
t = re.sub(r'const ICON_IMG_BY_LABEL = \{.*?\};', 'const ICON_IMG_BY_LABEL = {};', t, flags=re.S)
t = re.sub(r'const ICON_IMG_BY_GLYPH = \{.*?\};', 'const ICON_IMG_BY_GLYPH = {};', t, flags=re.S)

# 2. keep only world-1 halaman in the embedded JSON
for k in ('prak', 'k'):
    m = re.search(r'(<script id="all-content-%s" type="application/json">)(.*?)(</script>)' % k, t, re.S)
    data = json.loads(m.group(2))
    data = [h for h in data if h['no'] <= MAX_NO]
    t = t[:m.start(2)] + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + t[m.end(2):]

# 3. embed-mode CSS
EMBED_CSS = """
<style id="embed-css">
html.embed, html.embed body{background:transparent !important;min-height:0 !important;overflow-x:hidden;}
html.embed body{background-attachment:scroll !important;}
.embed .topbar,.embed .bg-decor,.embed #landscapeLock,.embed .stage-topbar,.embed .item-counter,
.embed .page-topic,.embed #stageControls,.embed #feedbackZone,.embed .modal-backdrop,.embed #print-root{display:none !important;}
.embed #app{display:block !important;}
.embed main,.embed #main{padding:0 !important;margin:0 !important;max-width:none !important;}
.embed .screen{padding:0 !important;}
.embed .page-card{margin:0 !important;box-shadow:none !important;background:transparent !important;padding:6px 8px 14px !important;}
.embed .page-instr{margin:0 0 4px !important;font-size:clamp(1rem,2.4vw,1.2rem) !important;text-align:center;}
.embed .stage-area{margin-top:6px !important;min-height:0 !important;gap:12px !important;}
.embed .tenframe{width:min(100%,520px) !important;}
@media screen and (orientation:portrait) and (max-width:900px){ .embed #app{display:block !important;} }
</style>
"""
EMBED_CSS = EMBED_CSS.replace('</style>', open('/home/claude/mathack/src/engine_theme.css').read()+'</style>')
t = t.replace('</head>', EMBED_CSS + '</head>', 1)

# 4. bridge code, injected inside the app IIFE in place of the splash boot

LOCFIX = r"""
const EN_PRAK_INSTR = {
1:"Count all the blocks that match the color you are asked for, then type the total.",
2:"Count the pictures, then type the matching number (1 or 2).",
3:"Count the pictures, then type the number.",
4:"Draw a line from each bunny to a carrot, then tap YES (same amount) or NO.",
5:"Draw a line from each bunny to a carrot, then tap YES (same amount) or NO.",
6:"Count the animals in each box (they are scattered, not in a row), then type the number.",
7:"Count the pictures, then type the number.",
8:"Count the pictures, then type the number.",
9:"Count the fruit in each box, then type the number.",
10:"Take a quick look (don't count one by one) and type the number right away!",
11:"Is this block the color you were asked for? Tap YES or NO.",
12:"Count how many blocks of the asked color are in each box.",
13:"Count how many blocks are NOT cubes.",
14:"Tap the LONG or SHORT block, as asked.",
15:"Tap the BIG or SMALL block, as asked.",
16:"Tap the group with MORE or FEWER, as asked, without counting one by one.",
17:"Tap the TALL or SHORT block tower, as asked.",
18:"Count how many CUBES are in each box.",
19:"Count how many LONG BLOCKS are in each box.",
20:"Count how many CYLINDERS are in each box.",
21:"Count all the blocks of the shape you are asked for, then type the total.",
22:"Look at the color pattern, then tap the next block color.",
23:"Look at the shape pattern, then write or draw the next shape.",
24:"Look at the color pattern (3 colors repeating), then write the next color.",
25:"Tap the thing in the asked position (TOP or BOTTOM).",
26:"Tap the thing in the asked position (INSIDE or OUTSIDE).",
27:"Tap the thing in the asked position (FRONT or BEHIND).",
28:"Compare the 2 block arrangements, then tap YES if EXACTLY THE SAME or NO if different.",
29:"Type the order of the blocks from SMALLEST to BIGGEST.",
30:"Finish counting backward."
};
const EN_WORDS = {"air":"water","anak":"child","balok":"block","biru":"blue","bola":"ball","kanan":"right","kelereng":"marble","kepala":"head","kiri":"left","kubus":"cube","kucing":"cat","kuning":"yellow","lampu":"lamp","matahari":"sun","meja":"table","merah":"red","nasi":"rice","perahu":"boat","pintu":"door","tabung":"cylinder","tengah":"middle","topi":"hat","uang":"money","anjing":"dog","apel":"apple","bintang laut":"starfish","boneka":"doll","ekor":"tail","ikan":"fish","jendela":"window","jeruk":"orange","karpet":"rug","kepik":"ladybug","kunci":"key","kupu-kupu":"butterfly","lebah":"bee","lemari":"cabinet","pensil":"pencil","pohon":"tree","sedotan":"straw","sendok":"spoon","sepatu":"shoe","stroberi":"strawberry","sungai":"river","tas":"bag","panjang":"long","pendek":"short","besar":"big","kecil":"small","hijau":"green"};
function enWord(s){
  if(typeof s!=='string') return s;
  var k=s.toLowerCase();
  if(EN_WORDS[k]) return s[0]===s[0].toUpperCase()? EN_WORDS[k].charAt(0).toUpperCase()+EN_WORDS[k].slice(1) : EN_WORDS[k];
  // "Balok Biru", "Merah-Kubus"
  var parts=s.split(/([\s-]+)/), changed=false;
  var out=parts.map(function(p){ var q=p.toLowerCase(); if(EN_WORDS[q]){ changed=true; var w=EN_WORDS[q]; return p[0]===p[0].toUpperCase()? w.charAt(0).toUpperCase()+w.slice(1):w; } return p; });
  return changed? out.join('') : s;
}
function enDeep(o){
  if(Array.isArray(o)) return o.map(enDeep);
  if(o && typeof o==='object'){ var r={}; Object.keys(o).forEach(function(k){ r[k]= (k==='label'||k==='nama') ? enWord(o[k]) : (k==='orderItems'||k==='correctOrder') ? o[k].map(enWord) : (k==='jawaban' && typeof o[k]==='string') ? o[k].split(', ').map(enWord).join(', ') : enDeep(o[k]); }); return r; }
  return o;
}
function fixItem(hal,item){
  if(hal.level==='prak' && hal.no===13){
    var m=/Total=(\d+),\s*Kubus=(\d+)/.exec(item.nilai||'');
    if(m){ var tot=+m[1], cu=+m[2]; return Object.assign({},item,{prompt:'',visual:{type:'groupIcons',groups:[{emoji:'\ud83e\uddca',count:cu,label:'Kubus'},{emoji:'\u26bd',count:tot-cu,label:'Bola'}]}}); }
  }
  return item;
}
function localizeItem(hal,item){
  var lang=(state.activeProfile && state.activeProfile.lang) || 'id';
  item=fixItem(hal,item);
  if(lang==='en' && hal.level==='prak') return enDeep(item);
  return item;
}
function localizeHal0(hal){
  const lang = (state.activeProfile && state.activeProfile.lang) || 'id';
  if(lang !== 'en'){
    if(hal.level === 'prak'){ var strip=function(s){ return typeof s==='string' ? s.replace(/\s*\(fokus mengenal angka \d+\)/i,'') : s; }; return Object.assign({}, hal, {instruksi: strip(hal.instruksi), instruksiLayar: strip(hal.instruksiLayar)}); }
    return hal;
  }
  if(hal.level === 'k'){
    const override = EN_HALAMAN_OVERRIDES[hal.no];
    if(override) return Object.assign({}, hal, override);
  } else if(hal.level === 'prak' && EN_PRAK_INSTR[hal.no]){
    return Object.assign({}, hal, {instruksi: EN_PRAK_INSTR[hal.no], instruksiLayar: EN_PRAK_INSTR[hal.no]});
  }
  return hal;
}
const SIMPLE_I18N = {"id": {"prak": {"1": "Hitung balok sesuai warna, lalu ketik jumlahnya.", "2": "Hitung gambar, lalu pilih angkanya.", "3": "Hitung gambar, lalu ketik angkanya.", "4": "Hubungkan kelinci ke wortel. Sama banyak? Pilih YA atau TIDAK.", "5": "Hubungkan kelinci ke wortel. Sama banyak? Pilih YA atau TIDAK.", "6": "Hitung hewan di tiap kotak, lalu ketik angkanya.", "7": "Hitung gambar, lalu ketik angkanya.", "8": "Hitung gambar, lalu ketik angkanya.", "9": "Hitung buah di tiap kotak, lalu ketik angkanya.", "10": "Lihat sekilas, lalu ketik angkanya!", "11": "Warna balok ini cocok? Pilih YA atau TIDAK.", "12": "Hitung balok berwarna di tiap kotak.", "13": "Hitung balok yang BUKAN kubus.", "14": "Pilih balok PANJANG atau PENDEK.", "15": "Pilih balok BESAR atau KECIL.", "16": "Pilih kelompok yang LEBIH BANYAK atau LEBIH SEDIKIT.", "17": "Pilih menara yang TINGGI atau PENDEK.", "18": "Hitung KUBUS di tiap kotak.", "19": "Hitung BALOK PANJANG di tiap kotak.", "20": "Hitung TABUNG di tiap kotak.", "21": "Hitung balok bentuk yang diminta, lalu ketik jumlahnya.", "22": "Lihat pola warna. Warna apa berikutnya?", "23": "Lihat pola bentuk. Bentuk apa berikutnya?", "24": "Lihat pola warna. Warna apa berikutnya?", "25": "Pilih benda di ATAS atau BAWAH.", "26": "Pilih benda di DALAM atau LUAR.", "27": "Pilih benda di DEPAN atau BELAKANG.", "28": "Dua susunan ini sama persis? Pilih YA atau TIDAK.", "29": "Urutkan dari yang paling KECIL ke paling BESAR.", "30": "Hitung mundur, lalu lengkapi angkanya."}, "k": {"1": "Hitung kotak yang terisi dan yang kosong.", "2": "Lihat sekilas, lalu ketik angkanya.", "3": "Hitung 10 dan satuannya, lalu ketik angkanya.", "4": "Hitung 10 dan satuannya, lalu ketik angkanya.", "5": "Ketik puluhan, satuan, dan angkanya.", "6": "Isi nomor rumah yang hilang.", "7": "Ikuti lompatan kelinci. Mendarat di angka berapa?", "15": "Lengkapi bagian yang hilang. Dua soal terakhir tanpa gambar.", "17": "Lengkapi bagian yang hilang. Dua soal terakhir tanpa gambar.", "18": "Cari bagian yang hilang.", "19": "Kelompokkan balok menurut ukuran, lalu lengkapi.", "20": "Lengkapi bagian yang hilang.", "21": "Lengkapi bagian yang hilang dan kalimatnya.", "22": "Ikuti lompatan tupai. Berapa jumlahnya?", "23": "Hitung titik kiri dan kanan, lalu isi kalimatnya.", "24": "Hitung pensil kiri dan kanan, lalu isi kalimatnya.", "25": "Hitung koin kiri dan kanan, lalu isi kalimatnya.", "26": "Buat angka pertama jadi 10 dulu, lalu hitung.", "27": "Hitung jumlahnya, lalu ketik jawabannya.", "28": "Coret gambar yang pergi. Sisa berapa?", "29": "Hitung mundur sebanyak langkahnya.", "30": "Warnai pensil. Sisa berapa untuk warna kedua?", "8": "Hitung gambar kue. Lengkapi bagian yang hilang.", "9": "Hitung gambar apel. Lengkapi bagian yang hilang.", "10": "Hitung gambar bintang. Lengkapi bagian yang hilang.", "11": "Hitung gambar ikan. Lengkapi bagian yang hilang.", "12": "Hitung gambar kupu-kupu. Lengkapi bagian yang hilang.", "13": "Hitung gambar kepik. Lengkapi bagian yang hilang.", "14": "Hitung gambar kerang. Lengkapi bagian yang hilang.", "16": "Hitung gambar balon. Lengkapi bagian yang hilang."}}, "en": {"prak": {"1": "Count the blocks of that color, then type the number.", "2": "Count the pictures, then pick the number.", "3": "Count the pictures, then type the number.", "4": "Match each bunny to a carrot. Same amount? Pick YES or NO.", "5": "Match each bunny to a carrot. Same amount? Pick YES or NO.", "6": "Count the animals in each box, then type the number.", "7": "Count the pictures, then type the number.", "8": "Count the pictures, then type the number.", "9": "Count the fruit in each box, then type the number.", "10": "Take a quick look, then type the number!", "11": "Is this the right color? Pick YES or NO.", "12": "Count the colored blocks in each box.", "13": "Count the blocks that are NOT cubes.", "14": "Pick the LONG or SHORT block.", "15": "Pick the BIG or SMALL block.", "16": "Pick the group with MORE or FEWER.", "17": "Pick the TALL or SHORT tower.", "18": "Count the CUBES in each box.", "19": "Count the LONG BLOCKS in each box.", "20": "Count the CYLINDERS in each box.", "21": "Count the blocks of that shape, then type the number.", "22": "Look at the color pattern. What color is next?", "23": "Look at the shape pattern. What shape is next?", "24": "Look at the color pattern. What color is next?", "25": "Pick the thing that is UP or DOWN.", "26": "Pick the thing that is IN or OUT.", "27": "Pick the thing that is in FRONT or BEHIND.", "28": "Are these two exactly the same? Pick YES or NO.", "29": "Put them in order, SMALLEST to BIGGEST.", "30": "Count backwards, then fill in the numbers."}, "k": {"1": "Count the filled and empty boxes.", "2": "Take a quick look, then type the number.", "3": "Count the 10 and the extras, then type the number.", "4": "Count the 10 and the extras, then type the number.", "5": "Type the tens, the ones, and the number.", "6": "Fill in the missing house number.", "7": "Follow the bunny's hops. Which number does it land on?", "15": "Fill in the missing part. The last two have no pictures.", "17": "Fill in the missing part. The last two have no pictures.", "18": "Find the missing part.", "19": "Sort the blocks by size, then fill in.", "20": "Fill in the missing part.", "21": "Fill in the missing part and the sentence.", "22": "Follow the squirrel's hops. What is the total?", "23": "Count the dots on the left and right, then fill in the sentence.", "24": "Count the pencils on the left and right, then fill in the sentence.", "25": "Count the coins on the left and right, then fill in the sentence.", "26": "Make the first number 10 first, then count.", "27": "Add them up, then type the answer.", "28": "Cross out the ones that leave. How many are left?", "29": "Count backwards the number of steps.", "30": "Color the pencils. How many are left for the second color?", "8": "Count the cupcakes. Fill in the missing part.", "9": "Count the apples. Fill in the missing part.", "10": "Count the stars. Fill in the missing part.", "11": "Count the fish. Fill in the missing part.", "12": "Count the butterflies. Fill in the missing part.", "13": "Count the ladybugs. Fill in the missing part.", "14": "Count the shells. Fill in the missing part.", "16": "Count the balloons. Fill in the missing part."}}};
function localizeHal(hal){
  const h = localizeHal0(hal);
  const lang = (state.activeProfile && state.activeProfile.lang) || 'id';
  const s = SIMPLE_I18N[lang === 'en' ? 'en' : 'id'][hal.level] && SIMPLE_I18N[lang === 'en' ? 'en' : 'id'][hal.level][hal.no];
  return s ? Object.assign({}, h, {instruksi: s, instruksiLayar: s}) : h;
}
"""

BRIDGE = r"""

  /* 1-to-1 pairing widget for "Kelinci=3, Wortel=2" (the source app only printed this as text) */
  var PAIR_EMO = {'kelinci':'🐰','wortel':'🥕'};
  function mechGenChoice(hal, item, area){
    var m = /^\s*([^=,]+?)\s*=\s*(\d+)\s*,\s*([^=,]+?)\s*=\s*(\d+)\s*$/.exec(item.prompt||'');
    var A = m && PAIR_EMO[m[1].toLowerCase()], B = m && PAIR_EMO[m[3].toLowerCase()];
    if(!m || item.visual || !A || !B) return mechGenChoice0(hal, item, area);
    var na = +m[2], nb = +m[4], need = Math.min(na, nb), made = 0, sel = null;
    var w = document.createElement('div'); w.className = 'pairw';
    var r1 = document.createElement('div'), r2 = document.createElement('div'); r1.className = r2.className = 'prow';
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    function mk(emo, row, side){ var d = document.createElement('div'); d.className = 'pi'; d.textContent = emo; d.dataset.side = side; d.onclick = function(){ tap(d); }; row.appendChild(d); return d; }
    for(var i=0;i<na;i++) mk(A, r1, 'a'); for(var j=0;j<nb;j++) mk(B, r2, 'b');
    w.appendChild(svg); w.appendChild(r1); w.appendChild(r2);
    var hint = document.createElement('div'); hint.className = 'pairhint'; hint.textContent = (state.activeProfile && state.activeProfile.lang === 'en') ? 'Tap a ' + A + ' then a ' + B + ' to pair them' : 'Sentuh ' + A + ' lalu ' + B + ' untuk memasangkan';
    area.appendChild(w); area.appendChild(hint);
    var holder = document.createElement('div'); holder.style.display = 'none'; area.appendChild(holder);
    mechGenChoice0(hal, Object.assign({}, item, {prompt: ''}), holder);
    function center(el){ var a = el.getBoundingClientRect(), b = w.getBoundingClientRect(); return [a.left - b.left + a.width/2, a.top - b.top + a.height/2]; }
    function tap(d){
      if(d.classList.contains('done')) return;
      if(!sel || sel.dataset.side === d.dataset.side){ if(sel) sel.classList.remove('sel'); sel = d; d.classList.add('sel'); return; }
      var x = sel, y = d; sel.classList.remove('sel'); sel = null;
      x.classList.add('done'); y.classList.add('done');
      var p = center(x), q = center(y), ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', p[0]); ln.setAttribute('y1', p[1]); ln.setAttribute('x2', q[0]); ln.setAttribute('y2', q[1]); svg.appendChild(ln);
      made++;
      if(made >= need){ hint.style.display = 'none'; holder.style.display = 'block'; }
    }
  }
/* ===== Mathack bridge: run the app headless as a question engine ===== */
(function(){
  document.documentElement.classList.add('embed');
  state.activeProfile = {name:'', age:5, avatar:'', lang:'id', level:'k', createdAt:0,
    progress:{starsByStage:{}, completedStages:[], badges:[], resume:{}}};
  try{ SoundFX.setMuted(true); }catch(e){}
  try{ applyStaticI18N(); }catch(e){}
  showScreen('screen-stage');
  /* dashed outlines -> soft holes */
  function holify(){ document.querySelectorAll('#stageArea *').forEach(function(el){ if(el.classList.contains('hole')||el.tagName==='svg'||el.closest('svg')) return; var cs=getComputedStyle(el); if(cs.borderTopStyle==='dashed'||cs.borderBottomStyle==='dashed'){ if(parseFloat(cs.borderBottomWidth)>=2 && cs.borderTopStyle==='dashed') el.classList.add('hole'); else el.style.borderBottomColor='var(--ink)'; } }); }
  new MutationObserver(function(){ clearTimeout(holify.h); holify.h=setTimeout(holify,30); }).observe(document.body,{childList:true,subtree:true});
  /* fit content to the panel: highlighter span + auto zoom + gentle centering */
  function fit(){
    var pi=document.getElementById('pageInstr');
    if(pi && !pi.querySelector('.hl') && pi.textContent.trim()){ pi.innerHTML='<span class="hl">'+pi.innerHTML+'</span>'; }
    var app=document.getElementById('app'); if(!app) return;
    document.body.style.zoom=1;
    var need=Math.max(app.scrollHeight, document.documentElement.scrollHeight), avail=window.innerHeight;
    if(need>avail+2){ document.body.style.zoom=Math.max(.5, (avail-4)/need); }
    else if(need<avail-30 && need>0){ document.body.style.zoom=Math.min(1.3, (avail-6)/need); }
  }
  var fitT; function fitSoon(){ clearTimeout(fitT); fitT=setTimeout(fit,40); }
  new MutationObserver(function(){ fitSoon(); }).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize', function(){ setTimeout(fit,60); });
  function post(o){ try{ parent.postMessage(Object.assign({mx:'evt'}, o), '*'); }catch(e){} }
  // the app reports every answer through showFeedback(correct) -> forward it, no banners / next buttons
  showFeedback = function(correct, ctx){ post({type:'result', ok: !!correct}); };
  goNextItem = function(){};
  function ask(level, no, idx){
    var hal = ALL_CONTENT[level].filter(function(h){ return h.no === no; })[0];
    if(!hal){ post({type:'error', msg:'no halaman '+level+' '+no}); return; }
    state.mapLevel = level;
    state.stagePlay = {stage: hal.stage, level: level, halaman: [hal], halIdx: 0, itemIdx: idx|0, wrong: 0, streak: 0};
    showScreen('screen-stage');
    try{ renderStagePage(); }catch(e){ post({type:'error', msg:String(e && e.stack || e)}); return; }
    var ha = document.getElementById('stageArea'); if(ha) ha.scrollTop = 0; window.scrollTo(0,0);
    fit(); setTimeout(fit,120); setTimeout(fit,400); setTimeout(fit,900);
    post({type:'asked', level: level, no: no, idx: idx|0,
          topik: hal.topik, instruksi: hal.instruksiLayar || hal.instruksi,
          cara: hal.cara, aktivitas: hal.aktivitas, konsep: hal.konsep});
  }
  window.addEventListener('message', function(e){
    var m = e.data; if(!m || m.mx !== 'cmd') return;
    if(m.type === 'lang'){ state.activeProfile.lang = m.lang; try{ applyStaticI18N(); }catch(_){} }
    else if(m.type === 'ask'){ ask(m.level, m.no, m.idx); }
    else if(m.type === 'clear'){ var a = document.getElementById('stageArea'); if(a) a.innerHTML = ''; }
    else if(m.type === 'meta'){ // content catalog for the parent: halaman -> item count + mech kinds
      var out = {};
      Object.keys(ALL_CONTENT).forEach(function(lv){ out[lv] = ALL_CONTENT[lv].map(function(h){
        return {no:h.no, stage:h.stage, topik:h.topik, n:h.items.length}; }); });
      post({type:'meta', data: out});
    }
  });
  post({type:'ready'});
})();
"""
assert t.count('\nrunSplash();\n') == 1

i0 = t.index('function localizeHal(hal){'); i1 = t.index('\n}\n', i0)+3
t = t[:i0] + LOCFIX + t[i1:]
t = t.replace("const item = hal.items[state.stagePlay.itemIdx];\n\n  document.getElementById('pageTopic')", "const item = localizeItem(hal, hal.items[state.stagePlay.itemIdx]);\n\n  document.getElementById('pageTopic')",1)
t = t.replace("const px = Math.round(38 + (Math.min(s.value,20)/maxVal)*90);","const px = Math.round(28 + (Math.min(s.value,20)/maxVal)*52);",1)
t = t.replace('family=Baloo+2:','family=Patrick+Hand&family=Baloo+2:',1)
t = t.replace('function mechGenChoice(hal, item, area){','function mechGenChoice0(hal, item, area){',1)
t = t.replace("if(opts.onTap) opts.onTap();\n    }", "if(opts.onTap) opts.onTap(); else if(opts.dropTargets && opts.dropTargets.length === 1 && opts.onDrop) opts.onDrop(opts.dropTargets[0]);\n    }",1)
t = t.replace('token.style.left = (chip.offsetLeft + chip.offsetWidth/2) + "px";','token.style.left = (chip.offsetLeft + chip.offsetWidth/2) + "px"; token.style.top = (chip.offsetTop - 34) + "px";')
t = t.replace('\nrunSplash();\n', BRIDGE + '\n')

open('src/engine.html', 'w', encoding='utf-8').write(t)
print('engine.html', len(t), 'bytes')
