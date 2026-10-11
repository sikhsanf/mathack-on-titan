/* monsters reused from Ezventure */
const MONB={
pebble(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.3,1.0,1.2,'#9aa0aa',0,.55,0,own);vb(body,.8,.5,.8,'#aab0ba',-.15,1.2,0,own);vb(body,.6,.16,.6,'#6fbf5a',.25,1.1,.1,own);
  [-1,1].forEach(s=>{vb(body,.2,.28,.06,'#1d1630',s*.3,.75,.62,own);vb(body,.07,.09,.05,'#fff',s*.27,.82,.65,own);vb(body,.38,.3,.5,'#7d838d',s*.38,.15,.1,own);});
  vb(body,.28,.07,.05,'#1d1630',0,.5,.62,own);},
beetle(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.3,.7,1.7,'#3a5a8a',0,.7,-.1,own);vb(body,.06,.72,1.7,'#1d2d4a',0,.72,-.1,own);vb(body,.8,.55,.6,'#2a2f40',0,.55,.95,own);
  [-1,1].forEach(s=>{vb(body,.14,.14,.5,'#c9d1dc',s*.22,.75,1.35,own);vb(body,.14,.14,.05,'#ff5a4a',s*.2,.62,1.27,{own:true,emissive:'#ff3020'});[-.5,0,.5].forEach(z=>vb(body,.12,.12,.5,'#1d1630',s*.75,.2,z,own));});},
golem(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.6,1.5,1.2,'#8d95a0',0,1.7,0,own);vb(body,.9,.8,.9,'#a3abb5',0,2.9,.1,own);
  [-1,1].forEach(s=>{vb(body,.2,.15,.05,'#ffb02a',s*.25,2.95,.58,{own:true,emissive:'#ff8a00'});vb(body,.5,1.5,.5,'#7d858f',s*1.05,1.6,0,own);vb(body,.7,.6,.7,'#6e767f',s*1.05,.75,0,own);vb(body,.6,.9,.6,'#6e767f',s*.4,.45,0,own);});
  vb(body,.9,.2,.7,'#6fbf5a',-.5,2.5,0,own);vb(body,.5,.15,.5,'#6fbf5a',.55,2.48,.2,own);vb(body,.3,.4,.1,'#7ae8ff',0,1.9,.62,{own:true,emissive:'#38b8e8'});},
sprout(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.0,.9,1.0,'#9be06a',0,.5,0,own);vb(body,.2,.5,.2,'#4aa84a',0,1.2,0,own);
  [-1,1].forEach(s=>{const l=vb(body,.7,.12,.3,'#5ec25a',s*.35,1.5,0,own);l.rotation.z=s*.5;vb(body,.18,.26,.06,'#1d1630',s*.25,.65,.51,own);vb(body,.06,.08,.05,'#fff',s*.22,.71,.54,own);vb(body,.16,.08,.05,'#ff9aa8',s*.38,.45,.51,own);vb(body,.3,.2,.4,'#7ac85a',s*.25,.1,.1,own);});
  vb(body,.2,.06,.05,'#1d1630',0,.42,.51,own);},
shroom(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,.8,.9,.8,'#fff3e0',0,.45,0,own);vb(body,1.7,.5,1.7,'#a45be0',0,1.1,0,own);vb(body,1.2,.35,1.2,'#a45be0',0,1.45,0,own);
  [[.5,.4],[-.45,.3],[.1,-.5],[-.2,.55]].forEach(d=>vb(body,.3,.1,.3,'#ffe27a',d[0],1.66,d[1],own));
  [-1,1].forEach(s=>{vb(body,.14,.22,.05,'#1d1630',s*.2,.6,.42,own);vb(body,.3,.2,.4,'#ffe3c0',s*.22,.1,.1,own);});vb(body,.2,.05,.05,'#8a3a3a',0,.42,.42,own);},
frog(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.3,.8,1.4,'#4aa860',0,.55,0,own);vb(body,1.0,.3,1.0,'#d6f0a0',0,.3,.2,own);
  [-1,1].forEach(s=>{vb(body,.45,.45,.45,'#fff',s*.4,1.05,.45,own);vb(body,.2,.25,.1,'#1d1630',s*.4,1.05,.7,own);vb(body,.35,.3,.8,'#3a8a50',s*.7,.2,-.3,own);});
  vb(body,.9,.06,.05,'#1d3a24',0,.6,.72,own);},
bat(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,.7,.7,.7,'#4a3f6a',0,0,0,own);
  [-1,1].forEach(s=>{vb(body,.2,.35,.15,'#4a3f6a',s*.2,.5,0,own);vb(body,.12,.12,.05,'#ffd84a',s*.16,.08,.36,{own:true,emissive:'#ffb800'});vb(body,.07,.12,.05,'#fff',s*.1,-.18,.36,own);
    const w=grp(body,s*.35,.1,0);u['wing'+(s>0?'R':'L')]=w;vb(w,1.1,.05,.7,'#2f2850',s*.55,0,0,{own:true,opacity:.9});});},
ghost(g,u,own){const body=grp(g,0,0,0);u.body=body;const go={own:true,opacity:.85};
  vb(body,1.1,1.2,1.0,'#f0f4ff',0,0,0,go);[-.35,0,.35].forEach((x,i)=>vb(body,.3,.3,.3,'#f0f4ff',x,-.7-(i%2)*.1,0,go));
  [-1,1].forEach(s=>{vb(body,.2,.3,.06,'#2b2350',s*.28,.15,.52,own);vb(body,.25,.5,.25,'#f0f4ff',s*.7,-.1,.1,go);});vb(body,.2,.2,.05,'#2b2350',0,-.2,.52,own);
  u.wingL=grp(body,0,0,0);u.wingR=grp(body,0,0,0);},
owl(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.4,1.5,1.2,'#8a6a4a',0,0,0,own);vb(body,.9,1.0,.1,'#e8d4a8',0,-.1,.61,own);
  [-1,1].forEach(s=>{vb(body,.25,.4,.25,'#6a4a30',s*.5,.95,0,own);vb(body,.5,.5,.08,'#fff6c8',s*.3,.35,.62,own);vb(body,.22,.22,.1,'#1d1630',s*.3,.35,.66,own);vb(body,.2,.2,.3,'#ffb02a',s*.25,-.8,.3,own);
    const w=grp(body,s*.75,0,0);u['wing'+(s>0?'R':'L')]=w;vb(w,.15,1.2,.8,'#6a4a30',s*.1,-.1,0,own);});
  vb(body,.2,.25,.25,'#ffb02a',0,.12,.7,own);vb(body,.15,.15,.08,'#7ae8ff',0,.75,.62,{own:true,emissive:'#38b8e8'});},
moth(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,.5,.6,.9,'#cfc6f5',0,0,0,own);vb(body,.45,.45,.45,'#e9e4ff',0,.1,.55,own);
  [-1,1].forEach(s=>{vb(body,.1,.1,.05,'#2b2350',s*.12,.18,.8,own);vb(body,.04,.4,.04,'#9a8fd0',s*.12,.55,.7,own).rotation.x=-.4;
    const w=grp(body,s*.25,.15,0);u['wing'+(s>0?'R':'L')]=w;vb(w,1.2,.05,1.0,'#f1ecff',s*.65,0,0,{own:true,opacity:.85,emissive:'#8a7fe0'});vb(w,.4,.06,.35,'#ffd84a',s*.7,.01,.1,{own:true,emissive:'#ffb800'});});},
pup(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.0,.8,1.5,'#3b3b5e',0,.7,-.1,own);vb(body,.85,.75,.8,'#4a4a72',0,1.05,.85,own);vb(body,.4,.3,.4,'#2a2a44',0,.9,1.35,own);vb(body,.14,.1,.06,'#1d1630',0,.98,1.57,own);
  [-1,1].forEach(s=>{vb(body,.22,.4,.18,'#2a2a44',s*.3,1.55,.8,own);vb(body,.16,.16,.06,'#ffd84a',s*.22,1.15,1.26,{own:true,emissive:'#ffb800'});vb(body,.28,.5,.28,'#2a2a44',s*.3,.25,.45,own);vb(body,.28,.5,.28,'#2a2a44',s*.3,.25,-.55,own);});
  vb(body,.22,.22,.7,'#4a4a72',0,.95,-1.0,own);},
crab(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.5,.6,1.1,'#e8744a',0,.6,0,own);vb(body,.5,.15,.5,'#7ae8ff',.3,.95,.1,{own:true,emissive:'#38b8e8'});vb(body,.3,.1,.3,'#7ae8ff',-.35,.93,-.2,{own:true,emissive:'#38b8e8'});
  [-1,1].forEach(s=>{vb(body,.12,.4,.12,'#c9593a',s*.35,1.05,.45,own);vb(body,.2,.2,.1,'#fff',s*.35,1.3,.5,own);vb(body,.1,.1,.06,'#1d1630',s*.35,1.3,.56,own);
    vb(body,.35,.35,.5,'#e8744a',s*.95,.75,.5,own);vb(body,.5,.3,.3,'#ff9a6a',s*1.05,.8,.85,own);[0,1,2].forEach(i=>vb(body,.4,.1,.1,'#c9593a',s*.85,.2,-.3+i*.3,own));});},
mole(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,1.3,1.1,1.5,'#6a5a68',0,.7,0,own);vb(body,.7,.6,.7,'#6a5a68',0,.75,.95,own);vb(body,.35,.3,.3,'#ff9aa8',0,.72,1.35,own);
  [-1,1].forEach(s=>{vb(body,.28,.28,.1,'#9be8ff',s*.25,1.0,1.0,{own:true,emissive:'#38b8e8'});vb(body,.1,.1,.06,'#1d1630',s*.25,1.0,1.06,own);vb(body,.45,.4,.5,'#ffd8a0',s*.85,.45,.6,own);vb(body,.12,.3,.1,'#fff',s*.85,.3,.95,own);vb(body,.3,.4,.3,'#4a3f4a',s*.4,.2,-.5,own);});},
firefly(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,.45,.45,.7,'#3a3a2a',0,0,.1,own);vb(body,.4,.4,.4,'#4a4a36',0,.05,.55,own);vb(body,.55,.55,.6,'#d8ff5a',0,-.02,-.45,{own:true,emissive:'#a8e000'});
  [-1,1].forEach(s=>{vb(body,.08,.1,.05,'#fff',s*.12,.12,.76,own);vb(body,.04,.3,.04,'#2a2a1a',s*.1,.4,.7,own).rotation.x=-.4;
    const w=grp(body,s*.22,.2,0);u['wing'+(s>0?'R':'L')]=w;vb(w,.8,.04,.5,'#f4ffd0',s*.4,0,0,{own:true,opacity:.7,emissive:'#c8e860'});});},
fox(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,.95,.8,1.5,'#cfd8f5',0,.8,-.1,own);vb(body,.8,.7,.75,'#e4eaff',0,1.15,.85,own);vb(body,.4,.3,.5,'#f7f9ff',0,1.0,1.3,own);vb(body,.14,.1,.06,'#1d1630',0,1.05,1.56,own);
  [-1,1].forEach(s=>{vb(body,.24,.5,.18,'#cfd8f5',s*.28,1.75,.8,own);vb(body,.12,.3,.06,'#ff9aa8',s*.28,1.72,.9,own);vb(body,.14,.16,.06,'#7ae8ff',s*.2,1.25,1.24,{own:true,emissive:'#38b8e8'});vb(body,.26,.55,.26,'#8a96c0',s*.28,.3,.5,own);vb(body,.26,.55,.26,'#8a96c0',s*.28,.3,-.6,own);});
  vb(body,.5,.5,1.0,'#cfd8f5',0,1.0,-1.1,own);vb(body,.45,.45,.4,'#fff',0,1.0,-1.75,own);},
snail(g,u,own){const body=grp(g,0,0,0);u.body=body;
  vb(body,.8,.45,1.6,'#fff0dc',0,.3,.1,own);vb(body,.6,.6,.6,'#fff0dc',0,.7,.9,own);
  [-1,1].forEach(s=>{vb(body,.1,.5,.1,'#fff0dc',s*.22,1.2,1.0,own);vb(body,.2,.2,.2,'#fff',s*.22,1.5,1.0,own);vb(body,.1,.1,.08,'#1d1630',s*.22,1.5,1.12,own);});
  vb(body,.3,.06,.05,'#e07a8a',0,.62,1.22,own);
  vb(body,1.1,1.1,1.0,'#ffb6d8',0,1.0,-.35,own);vb(body,.8,.8,1.04,'#ff8fc2',0,1.05,-.35,own);vb(body,.45,.45,1.08,'#ffd84a',0,1.08,-.35,own);}
};
function buildMonModel0(type){
  const g=new THREE.Group(),own={own:true},u={};g.userData=u;
  if(type==='jelly'||type==='king'){
    const k=type==='king'?2.1:1,inner=grp(g,0,0,0);inner.scale.setScalar(k);u.inner=inner;
    const col=type==='king'?'#3fd0a0':'#6fdc5e';
    const body=grp(inner,0,0,0);u.body=body;
    vb(body,1.5,1.25,1.5,col,0,.65,0,{own:true,opacity:.82,emissive:'#000000'});
    vb(body,.62,.55,.62,type==='king'?'#1f9a76':'#3fae38',0,.62,0,own);
    [-1,1].forEach(s=>{vb(body,.2,.28,.06,'#1d1630',s*.34,.82,.76,own);vb(body,.07,.09,.05,'#fff',s*.31,.88,.79,own);});
    vb(body,.3,.08,.05,'#1d1630',0,.52,.76,own);
    vb(body,.28,.12,.1,'#e8ffe0',-.45,1.06,.65,{own:true,opacity:.7});
    if(type==='king'){const cr=grp(body,0,1.35,0);vb(cr,.9,.24,.9,'#ffc83a',0,0,0,{own:true,emissive:'#7a5a00'});for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;vb(cr,.22,.34,.22,'#ffc83a',Math.sin(a)*.34,.28,Math.cos(a)*.34,{own:true,emissive:'#7a5a00'});}vb(cr,.2,.2,.1,'#ff5d8f',0,0,.47,{own:true,emissive:'#aa2255'});}
  }else if(type==='bunny'){
    const body=grp(g,0,0,0);u.body=body;
    vb(body,.95,.85,1.15,'#fff0f5',0,.55,0,own);vb(body,.78,.74,.74,'#fff0f5',0,1.1,.5,own);
    [-1,1].forEach(s=>{const e=grp(body,s*.22,1.5,.38);u['ear'+(s>0?'R':'L')]=e;vb(e,.2,.8,.14,'#fff0f5',0,.4,0,own);vb(e,.1,.6,.05,'#ffb6c8',0,.38,.06,own);
      vb(body,.12,.17,.05,'#1d1630',s*.22,1.15,.88,own);vb(body,.14,.08,.05,'#ff9aa8',s*.34,1.0,.88,own);});
    vb(body,.14,.1,.06,'#ff8fa8',0,1.02,.89,own);vb(body,.45,.45,.45,'#fff',0,.55,-.7,own);
    [-1,1].forEach(s=>{vb(body,.28,.2,.5,'#ffe3ee',s*.3,.1,.35,own);vb(body,.3,.22,.55,'#ffe3ee',s*.32,.1,-.35,own);});
  }else if(MONB[type]){MONB[type](g,u,own);
  }else{
    const body=grp(g,0,0,0);u.body=body;
    [['#ffd84a',.5],['#2b2350',.3],['#ffd84a',.35],['#2b2350',.28]].forEach((s,i)=>{});
    vb(body,.9,.85,.5,'#ffd84a',0,0,-.05,own);vb(body,.92,.87,.28,'#2b2350',0,0,.0,own);vb(body,.9,.85,.3,'#ffd84a',0,0,-.28,own);vb(body,.94,.88,.22,'#2b2350',0,0,-.5,own);
    vb(body,.7,.7,.5,'#ffd84a',0,.05,.5,own);
    [-1,1].forEach(s=>{vb(body,.16,.2,.05,'#1d1630',s*.2,.14,.77,own);vb(body,.06,.08,.05,'#fff',s*.18,.18,.8,own);vb(body,.04,.4,.04,'#2b2350',s*.15,.6,.7,own).rotation.x=-.3;
      const w=grp(body,s*.4,.5,-.1);u['wing'+(s>0?'R':'L')]=w;vb(w,.9,.04,.6,'#e8f6ff',s*.45,0,0,{own:true,opacity:.75});});
    vb(body,.14,.14,.3,'#2b2350',0,-.1,-.8,own);
  }
  return g;
}
const MONDEF={sprout:{h:2.0,hop:1},jelly:{h:1.9,hop:1,jelly:1},bunny:{h:2.4,hop:1},bee:{h:2.8,fly:1.2},moth:{h:2.8,fly:1.2},shroom:{h:2.0,walk:1},firefly:{h:2.9,fly:1.2},frog:{h:1.9,hop:1},fox:{h:2.2,walk:1}};
function buildMonster(key,s){
  const d=MONDEF[key]||{h:2,hop:1},model=buildMonModel0(key);
  const root=new THREE.Group();root.add(blob(1.5*s));
  const g=grp(root,0,0,0);g.scale.setScalar(s);g.add(model);
  const star=grp(root,0,(d.h+1.1)*s,0);
  [[.14,1.0,.3],[.14,.3,1.0],[.14,.55,.55]].forEach(a=>vb(star,a[0],a[1],a[2],'#ffe45a',0,0,0,{own:true,emissive:'#ffb000'}));
  const sg=vb(star,.1,1.5,1.5,'#fff3a0',0,0,0,{own:true,opacity:.18,emissive:'#ffd84a'});
  return {root,g,model,u:model.userData,star,starGlow:sg,def:d,key,isMon:true,seed:Math.random()*6,flash:0,hit:0,defeat:0,stomp:-1,wave:0,happy:0,baseS:s,starY:(d.h+1.1)*s};
}
function animMonster(T,dt,time){
  const u=T.u,d=T.def,br=Math.sin(time*2+T.seed);let y=0,sx=1,sy=1,lz=0,rx=0;
  if(d.fly)y=d.fly+Math.sin(time*3+T.seed)*.22;
  else if(d.hop){const h=Math.abs(Math.sin(time*2.4+T.seed));y=h*.5;sy=1+(.5-h)*.1;sx=1/Math.sqrt(sy);}
  else{y=Math.abs(Math.sin(time*5+T.seed))*.1;rx=Math.sin(time*2.5+T.seed)*.04;}
  if(d.jelly){sy=1+br*.06;sx=1/Math.sqrt(sy);}
  if(u.wingL){const f=Math.sin(time*40)*.7;u.wingL.rotation.z=-f;u.wingR.rotation.z=f;}
  if(u.earL){u.earL.rotation.x=-.2+Math.sin(time*3)*.08;u.earR.rotation.x=-.2+Math.sin(time*3+1)*.08;}
  if(T.stomp>=0){const p=T.stomp;
    if(p<.4){const u2=ease(p/.4);sy=1-.35*u2;sx=1+.2*u2;lz=-.4*u2;}
    else if(p<.62){const u2=eo((p-.4)/.22);lz=lerp(-.4,2.4,u2);y+=Math.sin(u2*Math.PI)*.9;sy=1+.15*u2;}
    else{const u2=ease((p-.62)/.38);lz=lerp(2.4,0,u2);}
  }
  if(T.hit>0){const u2=T.hit;lz-=.7*u2;rx-=.4*u2;T.hit=Math.max(0,T.hit-dt*2.6);}
  if(T.happy>0){y+=Math.abs(Math.sin(time*8))*.6;}
  const sc=T.baseS*lerp(1,.05,T.defeat);
  T.g.scale.set(sc*sx,sc*sy,sc*sx);T.g.position.set(0,y*T.baseS,lz*T.baseS);T.g.rotation.x=rx;T.g.rotation.y=T.defeat*9;
  T.star.rotation.x+=dt*1.6;T.star.position.y=T.starY+Math.sin(time*2.4)*.12;T.star.scale.setScalar(T.defeat>0?Math.max(.01,1-T.defeat*3):1);
  T.starGlow.material.opacity=.14+.1*Math.sin(time*5);
  if(T.flash>0)T.flash=Math.max(0,T.flash-dt*3.2);const f=T.flash;
  T.model.traverse(o=>{if(o.material&&o.material.emissive&&o.parent!==T.star)o.material.emissive.setRGB(f*.9,f*.7,f*.5);});
}
function animFoe(T,dt,time){return T.isMon?animMonster(T,dt,time):animTitan(T,dt,time);}
