/* ===== Mathack on Titan — game flow ===== */
const G={mode:'title',slot:null,si:-1,hero:null,petM:null,petId:-1,homeObj:null,world:null,stageIdx:0,tIdx:0,titans:[],mascot:null,
  hx:0,hy:0,hvy:0,onGround:true,walking:false,paused:false,jumpReq:false,
  atkT:-1,atkSpawned:false,hurt:0,faint:false,cheer:0,proj:null,D:null,runCoins:0,runWrong:0,runRight:0,defaultLook:{g:0,skin:1,hair:0,hs:0,outfit:0,hat:0,pet:0},
  edit:null,tipT:0};
const ENG={ready:false,meta:false,frame:null,loaded:false};
let CAT=null,TT=0,lastT=performance.now();
const SPEED=3.6;

/* ---------- helpers ---------- */
function toast(msg,ms){const e=$('#toast');e.textContent=msg;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),ms||2200);}
const SCREENS=['s-title','s-slots','s-home','s-map','s-play','s-duel'];
function showScreen(id){SCREENS.forEach(s=>$('#'+s).classList.toggle('show',s===id));}
function applyLang(){
  document.documentElement.lang=LANG;
  $('#t-tag').textContent=t('tagline');$('#b-play').textContent='▶ '+t('play');$('#t-slots').textContent=t('slots');
  $('#b-slots-back').textContent='← '+t('back');$('#b-style').textContent='👕 '+t('homeStyle');$('#b-go').textContent='▶ '+t('homePlay');
  $('#b-lang').textContent=LANG.toUpperCase();$('#b-lang2').textContent=LANG.toUpperCase();
  $('#st-back').textContent=t('cancel');$('#st-ok').textContent='✓ '+t('done');
  $('#p-jump').textContent='⤒ '+t('jump');$('#pa-title').textContent=t('paused');$('#pa-quit').textContent=t('quit');$('#pa-resume').textContent='▶ '+t('resume');
  $('#r-again').textContent=t('again');$('#r-map').textContent=t('toMap');
  $('#pr-title').textContent='👨‍👩‍👧 '+t('pTitle');$('#pr-close').textContent=t('close');$('#pr-add').textContent='+ '+t('pAdd');
  $('#g-title').textContent='🔒 '+t('gTitle');$('#g-cancel').textContent=t('cancel');$('#g-ok').textContent=t('gCheck');
  $('#c-no').textContent=t('cancel');$('#c-yes').textContent=t('delete');$('#rot-t').textContent=t('rotate');
  if(G.slot)refreshHomeHud();
  if(ENG.ready)engCmd({type:'lang',lang:LANG});
  if($('#s-slots').classList.contains('show'))renderSlots();
  if($('#s-map').classList.contains('show'))renderMap();
  if($('#d-style').classList.contains('show')&&G.edit)renderStyle(true);
}
function setLang(l){LANG=l;DB.lang=l;saveDB();applyLang();}
function nameOf(kind,i){const T=TX[LANG];if(kind==='hat')return T.hatNames[i]||'';if(kind==='out')return T.outNames[i];if(kind==='pet')return T.petNames[i];if(kind==='titan')return T.titanNames[i];return '';}

/* ---------- engine (the wife's question app, in an iframe) ---------- */
function engCmd(o){try{ENG.frame.contentWindow.postMessage(Object.assign({mx:'cmd'},o),'*');}catch(e){}}
function engInit(){
  const f=document.createElement('iframe');f.id='eng';f.setAttribute('title','questions');f.srcdoc=ENGINE_HTML;
  $('#duelPanel').insertBefore(f,$('#duelPanel .cover'));ENG.frame=f;
}
addEventListener('message',e=>{
  const m=e.data;if(!m||m.mx!=='evt')return;
  if(m.type==='ready'){ENG.ready=true;engCmd({type:'lang',lang:LANG});engCmd({type:'meta'});}
  else if(m.type==='meta'){CAT=m.data;ENG.meta=true;}
  else if(m.type==='result'){if(G.mode==='duel'&&G.D&&G.D.state==='ask')onAnswer(!!m.ok);}
  else if(m.type==='error'){console.warn('engine',m.msg);if(G.mode==='duel'&&G.D&&G.D.state==='ask')setTimeout(nextQ,30);}
  else if(m.type==='asked'){if(G.D)G.D.info=m;}
});
function pickQ(){
  const lvl=G.slot.lvl,st=STAGES[G.stageIdx].id,D=G.D;
  let hals=(CAT&&CAT[lvl]||[]).filter(h=>h.stage===st);
  if(!hals.length)hals=Array.from({length:10},(_,i)=>({no:(st-1)*10+i+1,n:5}));
  const c=[];let tot=0;
  hals.forEach(h=>{for(let i=0;i<(h.n||5);i++){const k=lvl+':'+h.no+':'+i;if(D.recent.includes(k))continue;const w=1+2*Math.min(4,G.slot.miss[lvl+':'+h.no]||0);tot+=w;c.push({no:h.no,idx:i,k,w});}});
  let r=Math.random()*tot,q=c[0];for(const x of c){r-=x.w;if(r<=0){q=x;break;}}
  D.recent.push(q.k);if(D.recent.length>10)D.recent.shift();
  return {level:lvl,no:q.no,idx:q.idx};
}

/* ---------- sky ---------- */
const SKYC={};
function skyTex(top,bot){const k=top+bot;if(SKYC[k])return SKYC[k];const c=document.createElement('canvas');c.width=4;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,top);g.addColorStop(.7,bot);g.addColorStop(1,bot);x.fillStyle=g;x.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return SKYC[k]=t;}
let SUN=null;
function ensureSun(){if(SUN)return;SUN=new THREE.Group();[[14,'#fff7c2',.35],[9,'#ffe98a',.55],[5.5,'#ffd84a',1]].forEach(a=>{const m=new THREE.Mesh(new THREE.BoxGeometry(a[0],a[0],1),new THREE.MeshBasicMaterial({color:a[1],transparent:a[2]<1,opacity:a[2],fog:false,depthWrite:false}));SUN.add(m);});scene.add(SUN);}
function fxFlash(cls){const e=$('#fx');e.className='';void e.offsetWidth;e.className=cls;}
/* ---------- scene objects ---------- */
function rebuildHero(look){
  if(G.hero){scene.remove(G.hero.root);disposeGroup(G.hero.root);}
  G.hero=buildKid(look);scene.add(G.hero.root);
  if(G.petId!==look.pet){if(G.petM){scene.remove(G.petM.root);disposeGroup(G.petM.root);G.petM=null;}G.petId=look.pet;if(look.pet>0){G.petM=petModel(look.pet);scene.add(G.petM.root);}}
}
function curLook(){return G.edit?G.edit.look:(G.slot?G.slot.look:G.defaultLook);}
function initScenes(){
  G.homeObj=buildHome();scene.add(G.homeObj.g);
  G.mascot=buildTitan(Object.assign({},TITANS.tunas,{s:.85}));G.mascot.root.position.set(-3.1,0,.2);G.mascot.root.rotation.y=.55;G.mascot.wave=1;scene.add(G.mascot.root);
  rebuildHero(G.defaultLook);
}
function setVisible(mode){
  const home=mode==='title'||mode==='slots'||mode==='home'||mode==='edit';
  const play=mode==='play'||mode==='duel'||mode==='result';
  G.homeObj.g.visible=home;G.mascot.root.visible=home&&mode!=='edit';
  if(G.world)G.world.g.visible=play;G.titans.forEach(T=>{if(!T.gone)T.root.visible=play;});
  if(G.mapObj)G.mapObj.g.visible=mode==='map';
  const showHero=home||play||mode==='map';G.hero.root.visible=showHero;if(G.petM)G.petM.root.visible=showHero;
  ensureSun();SUN.visible=play&&!!G.world;
  scene.background=play&&G.world?skyTex('#7fcbff',STAGES[G.stageIdx].fog):skyTex('#8fd0ff','#e6f7ff');
  scene.fog=play&&G.world?new THREE.Fog(STAGES[G.stageIdx].fog,45,130):new THREE.Fog('#d6f1ff',40,100);
}
function setMode(m){
  G.mode=m;setVisible(m);
  if(m==='title'||m==='slots'||m==='home'||m==='edit'){AU.kind='home';}else if(m==='play')AU.kind='walk';else if(m==='duel')AU.kind='duel';
}

/* ---------- title / slots ---------- */
function goTitle(){
  setMode('title');showScreen('s-title');EZUI.hide('d-style');
  const lk=(DB.last>=0&&DB.slots[DB.last])?DB.slots[DB.last].look:G.defaultLook;rebuildHero(lk);
  heroHome();homeCam(true);
}
function homeCam(snap){const x=innerHeight>innerWidth?-.9:0;camTo(x,3.6,10.8,x,1.8,0,3,snap);}
function heroHome(){
  const r=G.hero.root;r.position.set(1.3,0,1.0);r.rotation.y=.4;
  if(G.petM){G.petM.root.position.set(2.7,0,1.7);G.petM.root.rotation.y=-.3;}
}
function renderSlots(){
  const row=$('#slotrow');row.innerHTML='';
  DB.slots.forEach((s,i)=>{
    const d=document.createElement('div');d.className='slot'+(s?'':' empty');
    if(s){const stars=Object.values(s.prog.stars).reduce((a,b)=>a+b,0);
      d.innerHTML='<div class="av">'+(s.look.g?'👧':'👦')+'</div><div class="nm"></div><div class="mt">'+(s.lvl==='prak'?'Pra-K':'K')+' · ⭐ '+stars+' · 🪙 '+s.coins+'</div><button class="del" aria-label="del">✕</button>';
      d.querySelector('.nm').textContent=s.name;
      d.querySelector('.del').onclick=ev=>{ev.stopPropagation();confirmDel(i);};
      d.onclick=()=>pickSlot(i);
    }else{d.innerHTML='<div class="av">➕</div><div class="nm">'+t('newChar')+'</div>';d.onclick=()=>newChar(i);}
    row.appendChild(d);
  });
}
function openSlots(){setMode('slots');showScreen('s-slots');renderSlots();SFX.tap();}
function confirmDel(i){
  $('#c-title').textContent=t('delTitle');$('#c-body').textContent=t('delBody');
  $('#c-yes').onclick=()=>{DB.slots[i]=null;if(DB.last===i)DB.last=-1;saveDB();EZUI.hide('d-confirm');renderSlots();};
  $('#c-no').onclick=()=>EZUI.hide('d-confirm');EZUI.show('d-confirm');
}
function pickSlot(i){
  G.si=i;G.slot=DB.slots[i];DB.last=i;saveDB();
  rebuildHero(G.slot.look);goHome();
}
function newChar(i){
  G.si=i;const base=sanSlot({name:'',lvl:'k',look:Object.assign({},G.defaultLook),coins:40});
  G.edit={isNew:true,slotIndex:i,look:Object.assign({},base.look),tmp:base,tab:'hair',orig:null};
  rebuildHero(G.edit.look);openStyleUI();
}

/* ---------- home ---------- */
function refreshHomeHud(){$('#h-name').textContent=(G.slot.look.g?'👧 ':'👦 ')+G.slot.name;$('#h-coins').textContent='🪙 '+G.slot.coins;$('#m-coins').textContent='🪙 '+G.slot.coins;$('#p-coins').textContent='🪙 '+G.slot.coins;}
function goHome(){
  G.hero.root.scale.setScalar(1);
  setMode('home');showScreen('s-home');EZUI.hide('d-style');G.edit=null;
  refreshHomeHud();heroHome();homeCam();
}

/* ---------- thumbnails (offscreen render of hair / hats / outfits / pets) ---------- */
let TR=null,TS=null,TCAM=null;const THC={};
function thumbInit(){
  try{TR=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});}catch(e){TR=false;return;}
  TR.setPixelRatio(1);TR.setSize(112,112);TR.outputEncoding=THREE.sRGBEncoding;TS=new THREE.Scene();
  TS.add(new THREE.HemisphereLight(0xffffff,0xb0c8a0,1.0));const d=new THREE.DirectionalLight(0xffffff,.7);d.position.set(-3,6,8);TS.add(d);
  TCAM=new THREE.PerspectiveCamera(30,1,.1,60);
}
function thumb(kind,id,look){
  const L=Object.assign({},look);
  let key=kind+id;
  if(kind==='hs'){L.hs=id;L.hat=0;key+='|'+L.hair+'|'+L.skin;}
  else if(kind==='hat'){L.hat=id;key+='|'+L.hair+'|'+L.skin+'|'+L.hs;}
  else if(kind==='outfit'){L.outfit=id;L.hat=0;key+='|'+L.skin+'|'+L.g;}
  if(THC[key])return THC[key];
  if(TR===null)thumbInit();if(!TR)return '';
  let obj,cy,dist;
  if(kind==='pet'){const P=petModel(id);obj=P.root;cy=.55;dist=4.6;}
  else{const K=buildKid(L);obj=K.root;if(kind==='outfit'){cy=.95;dist=6.2;}else{cy=1.5;dist=4.5;}K.root.traverse(o=>{});}
  TS.add(obj);TCAM.position.set(0,cy+.15,dist);TCAM.lookAt(0,cy,0);
  TR.render(TS,TCAM);const url=TR.domElement.toDataURL('image/png');TS.remove(obj);
  return THC[key]=url;
}
/* ---------- style editor / creator ---------- */
function slotRef(){return G.edit.isNew?G.edit.tmp:G.slot;}
function openStyleUI(){
  setMode('edit');SCREENS.forEach(x=>$('#'+x).classList.remove('show'));EZUI.show('d-style');
  const ed=G.edit;$('#st-title').textContent=ed.isNew?('✨ '+t('newChar')):('👕 '+t('homeStyle'));
  $('#st-back').onclick=()=>{
    if(ed.isNew){EZUI.hide('d-style');G.edit=null;openSlots();goTitleHeroReset();}
    else{G.slot.look=Object.assign({},ed.orig);rebuildHero(G.slot.look);goHome();}
  };
  $('#st-ok').onclick=()=>{
    if(ed.isNew){
      const nm=($('#in-name')&&$('#in-name').value||'').trim();
      if(!nm){toast(t('gNeedName'));return;}
      const s=ed.tmp;s.name=nm.slice(0,16);s.look=Object.assign({},ed.look);DB.slots[ed.slotIndex]=s;G.slot=s;G.si=ed.slotIndex;DB.last=G.si;saveDB();goHome();
    }else{G.slot.look=Object.assign({},ed.look);saveDB();goHome();}
  };
  renderStyle(false);
  camStyle();
}
function goTitleHeroReset(){rebuildHero((DB.last>=0&&DB.slots[DB.last])?DB.slots[DB.last].look:G.defaultLook);heroHome();}
function camStyle(){
  const r=G.hero.root;r.position.set(0,0,1.6);r.rotation.y=.25;if(G.petM){G.petM.root.position.set(1.7,0,2.1);G.petM.root.rotation.y=-.2;}
  const W=innerWidth,H=innerHeight,fovT=Math.tan(19*Math.PI/180),dist=8.2,visW=2*dist*fovT*(W/H);
  if(H>W){r.position.set(-.5,0,1.6);if(G.petM)G.petM.root.position.set(1.2,0,2.1);camTo(.3,2.6,8.2,.3,1.3,1.6,4);}
  else camTo(-visW*.23,3.1,dist+1.6,-visW*.23,1.5,1.6,4);
}
function renderStyle(keepScroll){
  const ed=G.edit,S=slotRef(),body=$('#st-body');
  const scroll=keepScroll&&$('#st-grid')?$('#st-grid').scrollTop:0;
  let h='';
  if(ed.isNew){
    const nm=$('#in-name')?$('#in-name').value:'';
    h+='<div class="row"><label>'+t('name')+'</label><input class="txt" id="in-name" maxlength="16" placeholder="'+t('namePh')+'"></div>';
    h+='<div class="row"><div class="seg" id="sg-g"><button data-v="0" class="'+(ed.look.g===0?'on':'')+'">👦 '+t('boy')+'</button><button data-v="1" class="'+(ed.look.g===1?'on':'')+'">👧 '+t('girl')+'</button></div>';
    h+='<div class="seg" id="sg-l"><button data-v="prak" class="'+(S.lvl==='prak'?'on':'')+'">'+t('lvPrak')+'</button><button data-v="k" class="'+(S.lvl==='k'?'on':'')+'">'+t('lvK')+'</button></div></div>';
  }else h+='<div class="row mono" style="font-size:16px">🪙 '+S.coins+'</div>';
  const tabs=[['hair','hair'],['hairc','hairc'],['skin','skin'],['shirt','shirt'],['hat','hat'],['pet','pet']];
  h+='<div class="tabs" id="st-tabs">'+tabs.map(x=>'<button class="tab'+(ed.tab===x[0]?' on':'')+'" data-tab="'+x[0]+'">'+t(x[1])+'</button>').join('')+'</div>';
  h+='<div class="grid" id="st-grid">'+gridHTML()+'</div>';
  const keep=ed.isNew&&$('#in-name')?$('#in-name').value:'';
  body.innerHTML=h;if(ed.isNew&&$('#in-name'))$('#in-name').value=keep||ed.name||'';
  if(ed.isNew&&$('#in-name'))$('#in-name').oninput=e=>{ed.name=e.target.value;};
  $('#st-grid').scrollTop=scroll;
}
function gridHTML(){
  const ed=G.edit,S=slotRef(),L=ed.look;let h='';
  const card=(kind,id,inner,own,price,on)=>'<div class="ccard'+(on?' on':'')+(own?'':' lock')+'" data-k="'+kind+'" data-id="'+id+'">'+inner+(own?'':'<span class="pr">🪙'+price+'</span>')+'</div>';
  const im=(k,i)=>'<img class="th" alt="" src="'+thumb(k,i,L)+'">';
  if(ed.tab==='hair')for(let i=0;i<HAIR_STYLES;i++)h+=card('hs',i,im('hs',i),true,0,L.hs===i);
  else if(ed.tab==='hairc')for(let i=0;i<HAIR_COLORS;i++)h+=card('hair',i,'<div class="sw" style="background:'+HAIR[i]+'"></div>',true,0,L.hair===i);
  else if(ed.tab==='skin')for(let i=0;i<SKINS;i++)h+=card('skin',i,'<div class="sw" style="background:'+SKIN[i]+'"></div>',true,0,L.skin===i);
  else if(ed.tab==='shirt')OUTFITS.forEach((o,i)=>{h+=card('outfit',i,im('outfit',i)+'<span>'+nameOf('out',i)+'</span>',S.own.outfit.includes(i),o.price,L.outfit===i);});
  else if(ed.tab==='hat')HATLIST.forEach(i=>{h+=card('hat',i,(i?im('hat',i):'<span class="e">🚫</span>')+'<span>'+(i?nameOf('hat',i):t('none'))+'</span>',S.own.hat.includes(i),HAT_PRICE[i],L.hat===i);});
  else if(ed.tab==='pet')for(let i=0;i<10;i++)h+=card('pet',i,(i?im('pet',i):'<span class="e">🚫</span>')+'<span>'+(i?nameOf('pet',i):t('none'))+'</span>',S.own.pet.includes(i),PET_PRICE[i]+(i===5?0:0),L.pet===i);
  return h;
}
function equip(kind,id){
  const ed=G.edit,S=slotRef();
  const priceOf={outfit:i=>OUTFITS[i].price,hat:i=>HAT_PRICE[i],pet:i=>PET_PRICE[i]};
  const ownKey={outfit:'outfit',hat:'hat',pet:'pet'};
  if(ownKey[kind]){
    const own=S.own[ownKey[kind]];
    if(!own.includes(id)){
      const p=priceOf[kind](id);
      if(kind==='pet'&&id===5&&p===0){toast(TX[LANG].petGift+' ('+STAGES[0].key+')');return;}
      if(S.coins<p){toast(t('notEnough'));SFX.bad();return;}
      S.coins-=p;own.push(id);SFX.coin();toast(t('bought'),1200);
    }
  }
  ed.look[kind]=id;
  if(kind==='pet'){G.petId=-2;}
  rebuildHero(ed.look);camStyle();
  if(!ed.isNew)saveDB();
  renderStyle(true);
}
$('#st-body').addEventListener('click',e=>{
  if(!G.edit)return;SFX.tap();
  const tab=e.target.closest('[data-tab]');if(tab){G.edit.tab=tab.dataset.tab;renderStyle(false);return;}
  const c=e.target.closest('.ccard');if(c){const k=c.dataset.k,id=+c.dataset.id;equip(k,id);return;}
  const sg=e.target.closest('#sg-g button');if(sg){G.edit.look.g=+sg.dataset.v;rebuildHero(G.edit.look);camStyle();renderStyle(true);return;}
  const sl=e.target.closest('#sg-l button');if(sl){G.edit.tmp.lvl=sl.dataset.v;renderStyle(true);return;}
});

/* ---------- map ---------- */
function stageOpen(i){return i===0||DB.slots[G.si]&&G.slot.prog.done.includes(STAGES[i-1].id);}
function mapPos(){return innerHeight>innerWidth?[[-3.4,0,7.5],[3.6,0,0],[-3,0,-7.5]]:[[-8,0,2.5],[0,0,-2.5],[8,0,2.5]];}
function buildMapObj(){
  if(G.mapObj){scene.remove(G.mapObj.g);disposeGroup(G.mapObj.g);G.mapObj=null;}
  const pos=mapPos(),open=STAGES.map((_,i)=>stageOpen(i)),done=STAGES.map(st=>G.slot.prog.done.includes(st.id));
  const M=buildMapWorld(pos,open,done);M.titans=[];
  STAGES.forEach((st,i)=>{const boss=st.titans[st.titans.length-1];const T=buildTitan(Object.assign({},TITANS[boss.d],{s:.62}));T.root.position.set(pos[i][0]+(i===0?1.1:0),.6,pos[i][2]-.3);if(!open[i])addPadlock(T.root,0,3.2,1.2);T.root.children.forEach(()=>{});M.g.add(T.root);M.titans.push(T);if(done[i])T.happy=1;});
  M.pos=pos;M.cur=Math.max(0,STAGES.findIndex((st,i)=>open[i]&&!done[i]));if(M.cur<0)M.cur=0;
  scene.add(M.g);G.mapObj=M;
}
function openMap(){
  if(G.mapObj)G.mapObj.g.visible=false;
  buildMapObj();setMode('map');showScreen('s-map');
  const M=G.mapObj;rebuildHero(G.slot.look);G.hero.root.rotation.y=.2;G.hero.root.scale.setScalar(1.15);
  const p=M.pos[M.cur];G.hero.root.position.set(p[0]+2.4,.6,p[2]+1.2);if(G.petM){G.petM.root.position.set(p[0]+3.9,.6,p[2]+1.8);G.petM.root.rotation.y=.4;}
  AU.kind='home';renderMap();
  camTo(M.cx,innerHeight>innerWidth?14:12,M.cz+(innerHeight>innerWidth?12:11),M.cx,0,M.cz,3,true);
}
function renderMap(){
  $('#m-title').textContent='🌼 '+t('mapTitle');refreshHomeHud();
  const p=$('#m-path');p.innerHTML='';
  STAGES.forEach((st,i)=>{
    const open=stageOpen(i),done=G.slot.prog.done.includes(st.id),n=G.slot.prog.stars[st.id]||0;
    const d=document.createElement('div');d.className='node'+(open?'':' lock')+(done?' done':'');
    d.innerHTML='<div class="disc">'+(open?(done?'✓':(i+1)):'🔒')+'</div><div class="lbl"></div><div class="st">'+[1,2,3].map(k=>k<=n?'⭐':'☆').join('')+'</div>';
    d.querySelector('.lbl').textContent=t(st.key);
    d.onclick=()=>{if(!open){toast(t('locked'));SFX.bad();return;}SFX.tap();startStage(i);};
    p.appendChild(d);
  });
}
function placeMapNodes(){
  if(!G.mapObj)return;const W=innerWidth,H=innerHeight,v=new THREE.Vector3();
  $$('#m-path .node').forEach((el,i)=>{const p=G.mapObj.pos[i];v.set(p[0],4.6,p[2]).project(cam);el.style.left=((v.x*.5+.5)*W)+'px';el.style.top=((-v.y*.5+.5)*H)+'px';});
}

/* ---------- stage / walking ---------- */
function clearWorld(){
  if(G.world){scene.remove(G.world.g);disposeGroup(G.world.g);G.world=null;}
  G.titans.forEach(T=>{scene.remove(T.root);disposeGroup(T.root);});G.titans=[];
  if(G.proj){scene.remove(G.proj.m);G.proj=null;}
}
function startStage(i){
  clearWorld();G.stageIdx=i;const st=STAGES[i];
  G.world=buildWorld(st);scene.add(G.world.g);
  st.titans.forEach((tt,k)=>{
    const T=buildTitan(Object.assign({},TITANS[tt.d]));T.root.position.set(tt.x,0,0);T.root.rotation.y=-Math.PI/2;T.x=tt.x;T.q=tt.q;T.gone=false;T.boss=!!TITANS[tt.d].boss;T.dkey=tt.d;T.dying=false;scene.add(T.root);G.titans.push(T);
  });
  G.tIdx=0;G.hx=0;G.hy=0;G.hvy=0;G.onGround=true;G.jumpReq=false;G.walking=true;G.paused=false;G.D=null;
  G.atkT=-1;G.hurt=0;G.faint=false;G.cheer=0;G.runCoins=0;G.runWrong=0;G.runRight=0;VPW=1;
  rebuildHero(G.slot.look);G.hero.root.rotation.y=Math.PI/2;G.hero.root.scale.setScalar(1);
  setMode('play');showScreen('s-play');refreshHomeHud();
  camTo(4.5,3.4,11,3.6,1.7,0,8,true);
  $('#p-fill').style.width='0%';
  if(i===0&&!G.slot.plays){showTip(t('tipJump'),4500);}
  setTimeout(()=>{if(G.mode==='play'&&G.tIdx===0&&G.slot.plays===0)showTip(t('tipTitan'),3500);},6000);
  EZUI.hide('d-result');
}
function showTip(s,ms){const e=$('#p-tip');e.textContent=s;e.classList.add('on');clearTimeout(showTip.h);showTip.h=setTimeout(()=>e.classList.remove('on'),ms);}
$('#p-jump').addEventListener('pointerdown',e=>{e.preventDefault();G.jumpReq=true;});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp')G.jumpReq=true;});

function updatePlay(dt){
  const h=G.hero,st=STAGES[G.stageIdx];
  const T=G.titans[G.tIdx];
  if(G.walking){
    G.hx+=SPEED*dt;
    if(T&&G.hx>=T.x-5.4){G.hx=T.x-5.4;G.walking=false;startDuel();}
    else if(!T&&G.hx>=st.len+8){G.walking=false;}
  }
  if(G.jumpReq){G.jumpReq=false;if(G.onGround&&G.walking){G.hvy=9.2;G.onGround=false;SFX.jump();}}
  if(!G.onGround){G.hvy-=26*dt;G.hy+=G.hvy*dt;if(G.hy<=0){G.hy=0;G.hvy=0;G.onGround=true;}}
  // coins
  G.world.coins.forEach(c=>{
    if(c.got)return;c.m.rotation.y+=dt*3;
    if(Math.abs(G.hx-c.x)<.75&&Math.abs(G.hy+.9-c.y)<1.1){c.got=true;c.m.visible=false;G.slot.coins++;G.runCoins++;SFX.coin();burst(c.x,c.y,0,['#ffd84a','#fff3a0'],8,3,.5,6,.12);$('#p-coins').textContent='🪙 '+G.slot.coins;}
  });
  $('#p-fill').style.width=clamp(G.hx/st.len*100,0,100)+'%';
  G.dustT=(G.dustT||0)-dt;if(G.walking&&G.onGround&&G.dustT<=0){G.dustT=.22;burst(G.hx-.3,.1,.1,['#f0dc9a','#fff3c8'],3,1.4,.5,-1,.14);}
  placeHero(dt,{moving:G.walking&&G.onGround,air:!G.onGround});
  {const pt=innerHeight>innerWidth;camTo(G.hx+(pt?3:4.5),3.4,11,G.hx+(pt?2.3:3.6),1.7,0,5);}
}
function placeHero(dt,a){
  const h=G.hero;h.root.position.set(G.hx,G.hy,0);
  const A=Object.assign({spd:4.2,atk:-1,hurt:0,cheer:0,faint:G.faint,wave:false},a||{});
  if(G.atkT>=0)A.atk=G.atkT;if(G.hurt>0)A.hurt=G.hurt;if(G.cheer>0)A.cheer=G.cheer;
  animKid(h,A,dt,TT);
  if(G.petM){const P=G.petM.root;const tx=G.hx-1.9,tz=.6;P.position.x+=(tx-P.position.x)*(1-Math.exp(-dt*5));P.position.z+=(tz-P.position.z)*(1-Math.exp(-dt*5));P.position.y=G.hy*.4;P.rotation.y=Math.PI/2;petAnim(G.petM,!!(a&&a.moving),TT);}
}

/* ---------- duel ---------- */
function startDuel(){
  fxFlash('zoom');
  const T=G.titans[G.tIdx];
  G.D={T,hp:T.q,max:T.q,hearts:3,state:'intro',recent:[],q:null,right:0,wrong:0,t:0};
  setMode('duel');showScreen('s-duel');VPW=1;
  $('#d-tname').textContent=nameOf('titan',T.dkey);renderDuelHud();
  T.wave=0;T.root.rotation.y=-.95;
  const s=T.baseS,hN=6.6*s+1.2,asp=1;
  G.D.cam=[G.hx+2.9,hN*.44,Math.max(18,hN*2.0),G.hx+2.9,hN*.4,0];
  syncPanel(true);
  const P=$('#duelPanel');P.classList.remove('show');P.classList.add('lockq');
  floatMsg(t('tipTitan').split('!')[0]+'!');
  setTimeout(()=>{if(!G.D||G.mode!=='duel')return;P.classList.add('show');setTimeout(nextQ,350);},900);
}
function syncPanel(on){
  const P=$('#duelPanel');
  if(!on){VPW=1;return;}
  requestAnimationFrame(()=>{const r=P.getBoundingClientRect();VPW=clamp(r.left/innerWidth,.3,1);});
  VPW=.46;
}
function renderDuelHud(){
  const D=G.D;$('#d-hearts').textContent='❤️'.repeat(D.hearts)+'🤍'.repeat(3-D.hearts);
  $('#d-hp').innerHTML=Array.from({length:D.max},(_,i)=>'<i class="'+(i<D.hp?'on':'')+'"></i>').join('');
}
function floatMsg(s,col){
  const e=$('#d-float');e.textContent=s;e.style.left=(innerHeight>innerWidth?50:VPW*50)+'%';e.style.top=innerHeight>innerWidth?'30%':'26%';e.style.transform='translateX(-50%)';
  e.classList.remove('go');void e.offsetWidth;e.classList.add('go');
}
function nextQ(){
  const D=G.D;if(!D||G.mode!=='duel'||G.paused)return;
  if(D.hp<=0)return;
  if(!ENG.ready||!CAT){D.waitT=setTimeout(nextQ,300);return;}
  D.q=pickQ();D.state='ask';
  $('#duelPanel').classList.remove('lockq');
  {const f=ENG.frame;f.classList.remove('turn');void f.offsetWidth;f.classList.add('turn');}
  engCmd({type:'ask',level:D.q.level,no:D.q.no,idx:D.q.idx});
}
function onAnswer(ok){
  const D=G.D;D.state='resolve';$('#duelPanel').classList.add('lockq');
  const key=D.q.level+':'+D.q.no,m=G.slot.miss;
  if(ok){D.right++;G.runRight++;if(m[key])m[key]=Math.max(0,m[key]-1);heroAttack();}
  else{D.wrong++;G.runWrong++;m[key]=Math.min(8,(m[key]||0)+1);titanStomp();}
  saveDB();
}
function heroAttack(){
  const D=G.D;G.atkT=0;G.atkSpawned=false;SFX.throw();
  D.state='attack';
}
function titanStomp(){
  const D=G.D;D.T.stomp=0;D.state='stomp';D.stompHit=false;floatMsg(t('miss'));SFX.bad();
}
function updateDuel(dt){
  const D=G.D,T=D.T;
  G.hero.root.rotation.y=Math.PI/2;G.hero.root.scale.setScalar(1.7);
  // hero attack
  if(G.atkT>=0){
    G.atkT+=dt/.75;
    if(G.atkT>=.55&&!G.atkSpawned){
      G.atkSpawned=true;
      const m=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshBasicMaterial({color:0xffe45a}));
      const from=new THREE.Vector3(G.hx+1.2,2.6,0),to=new THREE.Vector3();titanStarWorld(T,to);
      m.position.copy(from);scene.add(m);G.proj={m,from,to,t:0};
    }
    if(G.atkT>=1)G.atkT=-1;
  }
  if(G.proj){
    const P=G.proj;P.t+=dt/.42;const u=Math.min(1,P.t);
    P.m.position.lerpVectors(P.from,P.to,u);P.m.position.y+=Math.sin(u*Math.PI)*1.2;P.m.rotation.x+=dt*14;P.m.rotation.y+=dt*10;
    if(Math.random()<.7)burst(P.m.position.x,P.m.position.y,P.m.position.z,['#ffe45a','#fff'],1,1,.35,0,.12);
    if(u>=1){scene.remove(P.m);G.proj=null;titanHit();}
  }
  // titan stomp
  if(T.stomp>=0){
    T.stomp+=dt/1.0;
    if(T.stomp>=.5&&!D.stompHit){
      D.stompHit=true;SFX.stomp();CAM.shake=.5;G.hurt=1;fxFlash('hurt');
      burst(G.hx+1,.2,0,['#c9a06a','#9a6b3f','#fff'],14,4,.6,12,.2);
      D.hearts--;renderDuelHud();
      if(D.hearts<=0){D.state='faint';G.faint=true;D.t=0;toast(t('faint'),2400);}
    }
    if(T.stomp>=1){T.stomp=-1;if(D.state==='stomp'){setTimeout(nextQ,350);D.state='wait';}}
  }
  if(G.hurt>0)G.hurt=Math.max(0,G.hurt-dt*1.6);
  if(D.state==='faint'){D.t+=dt;if(D.t>2){G.faint=false;D.hearts=3;D.state='wait';renderDuelHud();SFX.ok();setTimeout(nextQ,400);}}
  if(D.state==='win'){D.t+=dt;if(T.dying)T.defeat=Math.min(1,T.defeat+dt*.7);if(D.t>2.6){endDuel();return;}}
  if(G.cheer>0)G.cheer=Math.max(0,G.cheer-dt*.8);
  placeHero(dt,{moving:false});
  camTo.apply(null,D.cam.concat([6]));
}
function titanHit(){
  const D=G.D,T=D.T;T.hit=1;T.flash=1;SFX.hit();CAM.shake=.35;fxFlash('hit');
  const p=new THREE.Vector3();titanStarWorld(T,p);burst(p.x,p.y,p.z,['#ffe45a','#ff9a2a','#fff'],22,6,.7,10,.2);
  D.hp--;renderDuelHud();floatMsg(t('hit'));
  if(D.hp<=0){
    D.state='win';D.t=0;T.dying=true;T.happy=1;G.cheer=1;
    setTimeout(()=>{SFX.win();confetti(T.x,3,0);floatMsg(t('titanDown'));},350);
    const bonus=T.boss?25:10;G.slot.coins+=bonus;G.runCoins+=bonus;saveDB();
  }else{D.state='wait';setTimeout(nextQ,800);}
}
function endDuel(){
  const T=G.D.T;T.happy=1;G.D=null;G.hero.root.scale.setScalar(1);$('#duelPanel').classList.remove('show','lockq');VPW=1;
  G.tIdx++;
  if(G.tIdx>=G.titans.length){stageClear();return;}
  setMode('play');showScreen('s-play');G.walking=true;G.cheer=0;G.faint=false;
  refreshHomeHud();camTo(G.hx+4.5,3.4,11,G.hx+3.6,1.7,0,3);
}

/* ---------- stage clear ---------- */
function stageClear(){
  const st=STAGES[G.stageIdx],S=G.slot;
  const w=G.runWrong,stars=w<=1?3:w<=5?2:1;
  S.prog.stars[st.id]=Math.max(S.prog.stars[st.id]||0,stars);
  const first=!S.prog.done.includes(st.id);if(first)S.prog.done.push(st.id);
  const bonus=stars*10;S.coins+=bonus;S.plays++;
  let gift='';
  if(first&&st.reward&&st.reward.pet&&!S.own.pet.includes(st.reward.pet)){S.own.pet.push(st.reward.pet);gift='🐾 '+t('petGift')+' '+nameOf('pet',st.reward.pet);}
  saveDB();refreshHomeHud();
  setMode('result');SFX.win();confetti(G.hx+2,3,0);
  $('#r-title').textContent=t('stageClear');
  $('#r-stars').innerHTML=[1,2,3].map(k=>'<span class="'+(k<=stars?'':'off')+'">⭐</span>').join('');
  $('#r-rw').innerHTML='<span class="badge coin">🪙 +'+(G.runCoins+bonus)+'</span>';
  $('#r-extra').textContent=gift;
  const i=G.stageIdx;
  $('#r-again').onclick=()=>{EZUI.hide('d-result');startStage(i);};
  $('#r-map').onclick=()=>{EZUI.hide('d-result');clearWorld();openMap();};
  setTimeout(()=>EZUI.show('d-result'),1200);
}

/* ---------- pause ---------- */
function doPause(){if(G.paused||(G.mode!=='play'&&G.mode!=='duel'))return;G.paused=true;EZUI.show('d-pause');SFX.tap();}
$('#p-pause').onclick=doPause;$('#d-pause').addEventListener('click',()=>{});
$('#pa-resume').onclick=()=>{G.paused=false;EZUI.hide('d-pause');if(G.mode==='duel'&&G.D&&G.D.state==='wait')nextQ();};
$('#pa-quit').onclick=()=>{G.paused=false;EZUI.hide('d-pause');saveDB();if(G.D){G.D=null;$('#duelPanel').classList.remove('show','lockq');}VPW=1;clearWorld();openMap();};

/* ---------- parent menu + gate ---------- */
const GATE={wrong:0,lockUntil:0,ans:0};
function genGate(){
  const r=Math.random(),R=(a,b)=>a+((Math.random()*(b-a+1))|0);let q,a;
  if(r<.34){const x=R(23,89),y=R(6,9),z=R(11,49);q=x+' × '+y+' + '+z+' = ?';a=x*y+z;}
  else if(r<.67){const x=R(120,480),y=R(35,99),k=R(3,7);q='('+x+' − '+y+') × '+k+' = ?';a=(x-y)*k;}
  else{const k=R(12,19),n=R(13,29);q=k+' × '+n+' = ?';a=k*n;}
  GATE.ans=a;return q;
}
function renderParents(){
  const b=$('#pr-body');
  b.innerHTML=(DB.parents.length?DB.parents.map(p=>'<div class="row"><span class="badge">'+(p.ic||'👩')+' <b></b></span></div>').join(''):'<div class="mono">'+t('pEmpty')+'</div>')+'<div class="mono" style="margin-top:10px;font-size:14px;opacity:.8">'+t('pSoon')+'</div>';
  b.querySelectorAll('b').forEach((e,i)=>{e.textContent=DB.parents[i].name;});
  $('#pr-add').style.display=DB.parents.length>=2?'none':'';
}
function openParent(){SFX.tap();renderParents();EZUI.show('d-parent');}
$('#pr-x').onclick=$('#pr-close').onclick=()=>EZUI.hide('d-parent');
$('#pr-add').onclick=()=>{
  if(DB.parents.length>=2){toast(t('gMax'));return;}
  const left=Math.ceil((GATE.lockUntil-Date.now())/1000);
  openGate(left>0?left:0);
};
function openGate(lock){
  const b=$('#g-body');
  if(lock>0){b.innerHTML='<div class="mono">'+t('gWait').replace('{n}',lock)+'</div>';$('#g-ok').style.display='none';}
  else{
    $('#g-ok').style.display='';
    b.innerHTML='<div class="mono" style="margin-bottom:8px">'+t('gBody')+'</div><div class="row"><label>'+t('name')+'</label><input class="txt" id="g-name" maxlength="12" placeholder="'+t('gName')+'"></div><div class="gq" id="g-q" style="font:800 clamp(24px,6vmin,38px) var(--f-display);text-align:center;margin:10px 0">'+genGate()+'</div><div class="row"><label>'+t('gAns')+'</label><input class="txt" id="g-a" inputmode="numeric" pattern="[0-9]*" autocomplete="off"></div>';
  }
  EZUI.show('d-gate');
}
$('#g-x').onclick=$('#g-cancel').onclick=()=>EZUI.hide('d-gate');
$('#g-ok').onclick=()=>{
  const nm=($('#g-name').value||'').trim();if(!nm){toast(t('gNeedName'));return;}
  const v=parseInt($('#g-a').value,10);
  if(v===GATE.ans){
    DB.parents.push({id:Date.now().toString(36),name:nm,ic:DB.parents.length?'👨':'👩'});saveDB();GATE.wrong=0;
    EZUI.hide('d-gate');renderParents();toast(t('gOk'));SFX.ok();
  }else{
    GATE.wrong++;SFX.bad();
    if(GATE.wrong>=3){GATE.wrong=0;GATE.lockUntil=Date.now()+30000;openGate(30);}
    else{toast(t('gWrong'));$('#g-q').textContent=genGate();$('#g-a').value='';}
  }
};
(function(){ // long-press gear
  const g=$('#b-gear');let h=null;
  const st=()=>{clearTimeout(h);h=setTimeout(()=>{h=null;openParent();},1500);g.classList.add('hold');};
  const en=()=>{clearTimeout(h);g.classList.remove('hold');if(h){}};
  g.addEventListener('pointerdown',st);['pointerup','pointerleave','pointercancel'].forEach(ev=>g.addEventListener(ev,en));
  g.addEventListener('click',()=>toast(t('pHold')));
})();

/* ---------- buttons ---------- */
$('#b-play').onclick=()=>{aResume();openSlots();};
$('#b-slots-back').onclick=()=>{SFX.tap();goTitle();};
$('#b-lang').onclick=$('#b-lang2').onclick=()=>{SFX.tap();setLang(LANG==='id'?'en':'id');};
$('#b-mute').onclick=$('#b-mute2').onclick=()=>{setMuted(!AU.muted);$('#b-mute2').textContent=AU.muted?'🔇':'🔊';};
$('#b-style').onclick=()=>{SFX.tap();const lk=Object.assign({},G.slot.look);G.edit={isNew:false,look:Object.assign({},lk),orig:lk,tab:'hair'};openStyleUI();};
$('#b-go').onclick=()=>{SFX.tap();openMap();};
$('#m-back').onclick=()=>{SFX.tap();clearWorld();rebuildHero(G.slot.look);goHome();};
$('#d-pause').onclick=doPause;

/* ---------- main loop ---------- */
function updateIdle(dt){
  const m=G.mode;
  G.hero.root.visible=true;
  animKid(G.hero,{moving:false,wave:m==='title',atk:-1,hurt:0,cheer:0,faint:false},dt,TT);
  if(G.petM)petAnim(G.petM,false,TT);
  animTitan(G.mascot,dt,TT);
  G.homeObj.clouds.forEach(c=>{c.g.position.x=((c.x0+TT*c.sp+20)%44)-20;});
  if(m==='title')homeCam();
}
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;TT+=dt;
  const m=G.mode;
  if(!G.paused){
    if(m==='play')updatePlay(dt);
    else if(m==='duel'&&G.D)updateDuel(dt);
    else if(m==='result'){placeHero(dt,{moving:false});}
    else if(m==='map'&&G.mapObj){animKid(G.hero,{moving:false,wave:true,atk:-1,hurt:0,cheer:0,faint:false},dt,TT);if(G.petM)petAnim(G.petM,false,TT);G.mapObj.titans.forEach(T=>animTitan(T,dt,TT));G.mapObj.clouds.forEach(c=>{c.g.position.x=c.x0+Math.sin(TT*c.sp)*3;});}
    else if(m==='title'||m==='slots'||m==='home'||m==='edit')updateIdle(dt);
    G.titans.forEach(T=>{if(T.dying&&T.defeat<1&&m!=='duel')T.defeat=Math.min(1,T.defeat+dt*.7);animTitan(T,dt,TT);});
    if(G.world){G.world.clouds.forEach(c=>{c.g.position.x=c.x0+Math.sin(TT*c.sp)*3;});G.world.pol.forEach(o=>{o.m.position.y=o.y+Math.sin(TT*1.3+o.ph)*.35;o.m.position.x=o.x+Math.sin(TT*.7+o.ph)*.5;});}
    partTick(dt);
  }
  if(SUN&&SUN.visible){SUN.position.set(CAM.p.x+30,34,-90);}
  // camera
  const k=1-Math.exp(-CAM.k*dt);CAM.p.lerp(CAM.tp,k);CAM.l.lerp(CAM.tl,k);
  CAM.shake=Math.max(0,CAM.shake-dt*1.5);
  cam.position.copy(CAM.p);if(CAM.shake>0){cam.position.x+=(Math.random()-.5)*CAM.shake;cam.position.y+=(Math.random()-.5)*CAM.shake;}
  cam.lookAt(CAM.l);
  const W=innerWidth,H=innerHeight,port=H>W;let vx=0,vy=0,vw=W,vh=H,ref=m==='map'?1.3:1.6;
  if(m==='duel'&&G.D){const P=$('#duelPanel');ref=1;
    if(P.classList.contains('show')){const r=P.getBoundingClientRect();if(port){vh=Math.round(clamp(r.top+30,H*.3,H));vy=H-vh;}else vw=Math.round(clamp(r.left+30,W*.3,W));}
    else if(port){vh=Math.round(H*.48);vy=H-vh;}else vw=Math.round(W*.48);}
  else if(m==='edit'&&port){const r=$('#d-style .panel').getBoundingClientRect();ref=1;vh=Math.round(clamp(r.top+30,H*.3,H));vy=H-vh;}
  VPW=vw/W;
  cam.aspect=vw/vh;cam.updateProjectionMatrix();
  if(cam.aspect<ref){const f=Math.min(m==='play'?1.6:(m==='map'?2.4:2.6),ref/cam.aspect);cam.position.sub(CAM.l).multiplyScalar(f).add(CAM.l);}
  cam.lookAt(CAM.l);
  if(vw<W||vh<H){renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);renderer.setClearColor(0xe6f7ff,1);renderer.clear();}
  renderer.setScissorTest(true);renderer.setViewport(0,vy,vw,vh);renderer.setScissor(0,vy,vw,vh);
  renderer.render(scene,cam);
  if(m==='map')placeMapNodes();
}

/* ---------- boot ---------- */
(function boot(){
  loadDB();
  LANG=DB.lang||((navigator.language||'id').toLowerCase().startsWith('id')?'id':'en');
  AU.muted=!!DB.muted;
  initScenes();engInit();applyLang();$('#b-mute').textContent=AU.muted?'🔇':'🔊';$('#b-mute2').textContent=AU.muted?'🔇':'🔊';
  $('#ver').textContent='prototype v0.2';
  addEventListener('resize',()=>{if($('#s-map').classList.contains('show'))openMap();});
  if('serviceWorker' in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
  goTitle();
  requestAnimationFrame(frame);
  setTimeout(()=>{const l=$('#loading');l.style.opacity=0;setTimeout(()=>l.style.display='none',450);},500);
  const first=()=>{aResume();bgmStart('home');removeEventListener('pointerdown',first);};addEventListener('pointerdown',first);
  window.__G=G;
})();
