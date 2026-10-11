/* ===== extracted from Ezventure (voxel kit, hats, hair, pets) ===== */
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t), eo=t=>1-(1-t)*(1-t);
const HAIR=['#3b2a20','#e8b94a','#e0508a','#4a8fe0','#f3f0ea'];
const SKIN=['#ffdcc0','#f3b98d','#c98a5c','#8d5a3b','#fbe8d5'];
/* ---------- Voxel kit ---------- */
const GEO={},MAT={};
function bgeo(w,h,d){const k=w+'|'+h+'|'+d;let g=GEO[k];if(!g){g=new THREE.BoxGeometry(w,h,d);g.userData.shared=true;GEO[k]=g;}return g;}
function bmat(color,o){
  o=o||{};const p={color:new THREE.Color(color)};
  ['emissive','opacity','side','depthWrite'].forEach(k=>{if(o[k]!==undefined)p[k]=o[k];});
  if(o.opacity!==undefined)p.transparent=true;
  if(o.own)return new THREE.MeshLambertMaterial(p);
  const k=color+'|'+(o.emissive||'')+'|'+(o.opacity===undefined?1:o.opacity)+'|'+(o.side||0)+'|'+(o.depthWrite===false?'n':'');
  let m=MAT[k];if(!m){m=new THREE.MeshLambertMaterial(p);m.userData.shared=true;MAT[k]=m;}return m;
}
function vb(parent,w,h,d,color,x,y,z,o){const m=new THREE.Mesh(bgeo(w,h,d),bmat(color,o));m.position.set(x||0,y||0,z||0);if(parent)parent.add(m);return m;}
function grp(parent,x,y,z){const g=new THREE.Group();g.position.set(x||0,y||0,z||0);if(parent)parent.add(g);return g;}
function disposeGroup(g){g.traverse(o=>{if(o.geometry&&!(o.geometry.userData&&o.geometry.userData.shared))o.geometry.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!(m.userData&&m.userData.shared))m.dispose();});});}
function blob(r){const m=new THREE.Mesh(new THREE.CircleGeometry(1,14),new THREE.MeshBasicMaterial({color:0x1a1030,transparent:true,opacity:.28,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.03;m.scale.setScalar(r);return m;}
const HG_ICON=['','🎀','🧢','👨‍🍳','🌸','🐱','🐻','🏴‍☠️','🐠','🧙','🌾','😈','😇','🎅','🦆','🥳','👑','🪖','🍄','🐲','🌈'];
const HGB=[null,
(h)=>{vb(h,.3,.3,.2,'#ff3d6e',-.28,.95,.2);vb(h,.3,.3,.2,'#ff3d6e',.28,.95,.2);vb(h,.18,.18,.24,'#c8184a',0,.95,.2);},
(h)=>{vb(h,.86,.22,.86,'#2f6fe0',0,.88,0);vb(h,.7,.06,.4,'#1f4fb0',0,.8,.6);vb(h,.14,.12,.14,'#fff',0,1.0,0);},
(h)=>{vb(h,.84,.2,.84,'#fff',0,.88,0);vb(h,.98,.38,.98,'#fff',0,1.17,0);vb(h,1.04,.2,1.04,'#f2f2f2',0,1.42,0);},
(h)=>{const cs=['#ff8fc2','#fff','#ffd84a','#c49bff','#ff8fc2','#fff','#ffd84a','#7ad8ff'];cs.forEach((c,i)=>{const a=i/8*Math.PI*2;vb(h,.22,.2,.22,c,Math.sin(a)*.46,.88,Math.cos(a)*.46);vb(h,.1,.1,.1,'#ffb800',Math.sin(a)*.46,.99,Math.cos(a)*.46);});},
(h)=>{vb(h,.86,.08,.86,'#3a3a46',0,.84,0);[-1,1].forEach(s=>{vb(h,.26,.34,.16,'#3a3a46',s*.27,1.04,0);vb(h,.14,.2,.06,'#ffb6c8',s*.27,1.02,.07);});},
(h)=>{[-1,1].forEach(s=>{vb(h,.34,.34,.22,'#8a5a32',s*.34,.98,0);vb(h,.18,.18,.06,'#d9b88a',s*.34,.98,.1);});},
(h)=>{vb(h,1.3,.1,.84,'#22222c',0,.84,0);vb(h,.9,.34,.84,'#22222c',0,1.02,0);vb(h,.22,.2,.06,'#fff',0,1.04,.44);vb(h,.36,.06,.06,'#fff',0,.96,.44);},
(h)=>{vb(h,1.1,1.0,1.1,'#bfe8ff',0,.4,0,{own:true,opacity:.28,emissive:'#7ac8ff'});vb(h,1.16,.1,1.16,'#c9d1dc',0,-.02,0);vb(h,.18,.12,.1,'#ff8a2a',.18,.7,.1);vb(h,.08,.1,.08,'#ff8a2a',.02,.72,.1);},
(h)=>{vb(h,.9,.24,.9,'#2b2a8a',0,.92,0);vb(h,1.3,.08,1.3,'#3a3ab0',0,1.08,0);vb(h,.12,.12,.12,'#ffd84a',.55,1.0,.55,{emissive:'#ffb800'});vb(h,.06,.3,.06,'#ffd84a',.6,.85,.6);vb(h,.24,.24,.1,'#ffd84a',0,.92,.46,{emissive:'#ffb800'});},
(h)=>{vb(h,1.4,.08,1.4,'#e6c370',0,.84,0);vb(h,.84,.34,.84,'#f0d080',0,1.02,0);vb(h,.86,.1,.86,'#e0453c',0,.94,0);},
(h)=>{[-1,1].forEach(s=>{const m=vb(h,.2,.5,.2,'#c0182a',s*.26,1.0,0);m.rotation.z=-s*.3;vb(h,.12,.2,.12,'#ff4a5a',s*.36,1.3,0);});vb(h,.84,.08,.84,'#5a0a14',0,.84,0);},
(h)=>{[[0,.38],[0,-.38]].forEach(p=>vb(h,.9,.08,.14,'#ffe27a',0,1.4,p[1],{emissive:'#ffcc40'}));[.38,-.38].forEach(x=>vb(h,.14,.08,.9,'#ffe27a',x,1.4,0,{emissive:'#ffcc40'}));vb(h,.06,.5,.06,'#ffe27a',0,1.1,.0,{emissive:'#ffcc40'});},
(h)=>{vb(h,.9,.22,.9,'#fff',0,.86,0);vb(h,.78,.32,.78,'#d82a2a',0,1.1,0);vb(h,.58,.3,.58,'#d82a2a',-.05,1.36,-.1);vb(h,.4,.24,.4,'#d82a2a',-.15,1.6,-.2);vb(h,.22,.22,.22,'#fff',-.25,1.72,-.3);},
(h)=>{vb(h,.84,.3,.84,'#ffd84a',0,.92,0);vb(h,.5,.12,.4,'#ff9a2a',0,.86,.58);[-1,1].forEach(s=>vb(h,.1,.12,.05,'#1d1630',s*.2,1.02,.43));},
(h)=>{[[.52,.92,'#ff5d8f'],[.42,1.12,'#ffd84a'],[.32,1.32,'#46a6ff'],[.18,1.5,'#7ae88f']].forEach(l=>vb(h,l[0],.2,l[0],l[2],0,l[1],0));vb(h,.2,.2,.2,'#fff',0,1.66,0);},
(h)=>{vb(h,.84,.22,.84,'#ffd84a',0,.9,0,{emissive:'#7a5a00'});[[-.32,-.32],[.32,-.32],[-.32,.32],[.32,.32],[0,.34],[0,-.34]].forEach(p=>vb(h,.18,.3,.18,'#ffd84a',p[0],1.14,p[1],{emissive:'#7a5a00'}));vb(h,.12,.12,.05,'#e0453c',0,.92,.43);vb(h,.1,.1,.05,'#46a6ff',.28,.92,.43);vb(h,.1,.1,.05,'#46a6ff',-.28,.92,.43);},
(h)=>{vb(h,.86,.3,.86,'#a8b0bc',0,.92,0);vb(h,.9,.08,.9,'#7a5a3a',0,.84,0);[-1,1].forEach(s=>{vb(h,.18,.4,.18,'#f4ecd0',s*.5,.98,0);vb(h,.18,.36,.18,'#f4ecd0',s*.62,1.3,0);});vb(h,.1,.3,.06,'#8a929e',0,.6,.42);},
(h)=>{vb(h,1.1,.22,1.1,'#e0453c',0,.9,0);vb(h,.8,.2,.8,'#e0453c',0,1.1,0);vb(h,.5,.14,.5,'#e0453c',0,1.26,0);[[.3,.3],[-.3,.2],[.1,-.34]].forEach(p=>vb(h,.2,.06,.2,'#fff',p[0],1.02,p[1]));vb(h,.14,.06,.14,'#fff',0,1.34,0);},
(h)=>{vb(h,.86,.3,.86,'#3fae5a',0,.92,0);vb(h,.8,.5,.14,'#3fae5a',0,.6,-.42);[-1,1].forEach(s=>{vb(h,.14,.34,.14,'#f4ecd0',s*.24,1.2,.05);vb(h,.14,.1,.05,'#ffd84a',s*.2,.98,.44,{emissive:'#ffb800'});});[0,-.2,-.4].forEach(z=>vb(h,.1,.18,.14,'#2a8a46',0,1.12,z));},
(h)=>{['#ff4a4a','#ff9a2a','#ffd84a','#4ac85a','#46a6ff','#a07bff'].forEach((c,i)=>vb(h,.92-i*.08,.1,.92-i*.08,c,0,.84+i*.1,0,{emissive:c}));vb(h,.2,.2,.2,'#fff',0,1.5,0,{emissive:'#ffffff'});}
];
function hairStyle(h,c,s){
  const top=()=>vb(h,.8,.18,.8,c,0,.72,0),fr=()=>{vb(h,.74,.14,.14,c,0,.62,.37);vb(h,.22,.16,.14,c,.2,.56,.37);},sd=(y,hh,d,z)=>[-1,1].forEach(x=>vb(h,.12,hh,d,c,x*.38,y,z));
  if(s===1){top();vb(h,.8,.62,.22,c,0,.4,-.32);sd(.38,.52,.64,-.02);fr();}
  else if(s===2){top();vb(h,.8,1.0,.2,c,0,.2,-.32);sd(.32,.8,.4,-.14);fr();}
  else if(s===3){top();vb(h,.8,.5,.2,c,0,.5,-.32);sd(.48,.36,.5,-.08);fr();vb(h,.2,.2,.2,'#ff8fc2',0,.66,-.46);vb(h,.24,.7,.24,c,0,.3,-.56);}
  else if(s===4){top();vb(h,.8,.46,.2,c,0,.5,-.32);fr();[-1,1].forEach(x=>{vb(h,.2,.2,.2,'#ff8fc2',x*.48,.66,-.1);vb(h,.22,.6,.22,c,x*.54,.3,-.1);});}
  else if(s===5){vb(h,.8,.14,.8,c,0,.7,0);vb(h,.8,.5,.2,c,0,.45,-.32);sd(.48,.36,.5,-.05);[[-.26,.16],[0,.3],[.26,.18],[-.12,.24],[.14,.26]].forEach((p,i)=>vb(h,.2,p[1]+.1,.2,c,p[0],.88+p[1]/2,i%2?.1:-.1));}
  else if(s===6){vb(h,.78,.12,.78,c,0,.71,0);vb(h,.76,.3,.12,c,0,.52,-.34);sd(.58,.2,.5,-.05);}
  else if(s===7){top();vb(h,.8,.5,.2,c,0,.5,-.32);sd(.48,.36,.5,-.08);fr();vb(h,.34,.3,.34,c,0,.98,-.08);vb(h,.38,.06,.38,'#ff8fc2',0,.84,-.08);}
  else if(s===8){vb(h,.2,.34,.86,c,0,.86,0);vb(h,.2,.2,.3,c,0,1.0,.1);vb(h,.2,.16,.2,c,0,.74,-.38);}
  else if(s===9){top();vb(h,.8,.5,.2,c,0,.5,-.32);sd(.5,.3,.5,-.08);vb(h,.5,.14,.14,c,-.12,.62,.37);vb(h,.34,.22,.14,c,.2,.6,.37);vb(h,.12,.2,.16,c,.4,.55,.3);}
  else if(s===10){top();vb(h,.8,.9,.2,c,0,.25,-.32);sd(.3,.7,.5,-.1);fr();[[-.46,.2],[.46,.15]].forEach(p=>vb(h,.12,.32,.16,c,p[0],p[1],-.1));vb(h,.14,.2,.14,c,.1,.84,.2);}
  else if(s===11){top();vb(h,.8,.4,.2,c,0,.55,-.32);sd(.55,.3,.5,-.08);vb(h,.5,.14,.14,c,-.1,.62,.37);vb(h,.3,.2,.14,c,.22,.56,.37);vb(h,.1,.1,.1,'#ff8fc2',.32,.7,.4);}
  else{top();vb(h,.8,.6,.2,c,0,.45,-.32);sd(.45,.4,.6,-.05);fr();}
}
function petModel(id){
  const g=new THREE.Group(),m=grp(g,0,0,0),P={root:g,m,tail:null,body:null,id};
  const bx=(w,h,d,c,x,y,z,o)=>vb(m,w,h,d,c,x,y,z,o);
  const eyes=(y,z,x,c)=>{bx(.07,.07,.05,c||'#1b1b2b',-x,y,z);bx(.07,.07,.05,c||'#1b1b2b',x,y,z);};
  const legs=(w,h,x,zf,c)=>[[-x,zf],[x,zf],[-x,-zf],[x,-zf]].forEach(p=>bx(w,h,w,c,p[0],h/2,p[1]));
  switch(id){
  case 1:legs(.12,.36,.17,.3,'#8a5a32');bx(.5,.38,.85,'#b87a4a',0,.55,0);bx(.26,.4,.26,'#b87a4a',0,.85,.38);bx(.3,.28,.34,'#c88a5a',0,1.0,.52);bx(.14,.1,.1,'#e8c8a0',0,.96,.72);bx(.08,.14,.08,'#8a5a32',-.1,1.2,.45);bx(.08,.14,.08,'#8a5a32',.1,1.2,.45);bx(.1,.36,.12,'#4a2f1a',0,.98,.3);eyes(1.05,.69,.1);P.tail=grp(m,0,.7,-.42);vb(P.tail,.1,.4,.1,'#4a2f1a',0,-.15,-.05);break;
  case 2:legs(.1,.3,.2,.25,'#4a4a55');bx(.7,.55,.75,'#fffaf0',0,.58,0);bx(.5,.2,.5,'#fff',0,.9,0);bx(.3,.3,.3,'#4a4a55',0,.65,.5);bx(.16,.08,.1,'#4a4a55',-.2,.74,.5);bx(.16,.08,.1,'#4a4a55',.2,.74,.5);eyes(.7,.66,.08,'#fff');bx(.12,.2,.12,'#fffaf0',0,.7,-.42);break;
  case 3:legs(.16,.28,.2,.25,'#6b4423');bx(.62,.55,.6,'#8a5a32',0,.5,0);bx(.46,.42,.42,'#9a6a3a',0,.95,.18);bx(.14,.14,.1,'#8a5a32',-.18,1.2,.15);bx(.14,.14,.1,'#8a5a32',.18,1.2,.15);bx(.2,.16,.12,'#e8c8a0',0,.88,.42);bx(.08,.06,.06,'#222',0,.93,.49);eyes(1.02,.4,.1);bx(.14,.14,.1,'#8a5a32',0,.5,-.34);break;
  case 4:P.body=bx(.7,.55,.7,'#8affc8',0,.3,0,{own:true,opacity:.88,emissive:'#3fd0a0'});bx(.4,.2,.4,'#d8fff0',0,.62,0,{own:true,opacity:.8,emissive:'#7affd0'});bx(.1,.12,.05,'#1b1b2b',-.15,.38,.36);bx(.1,.12,.05,'#1b1b2b',.15,.38,.36);bx(.14,.04,.05,'#1b1b2b',0,.26,.36);bx(.22,.22,.22,'#ffffff',0,.28,0,{own:true,opacity:.5,emissive:'#ffffff'});break;
  case 5:legs(.1,.26,.14,.24,'#f6f6fa');bx(.42,.38,.7,'#f6f6fa',0,.45,0);bx(.38,.34,.34,'#ffffff',0,.78,.4);bx(.1,.16,.08,'#fff',-.13,1.02,.4);bx(.1,.16,.08,'#fff',.13,1.02,.4);bx(.06,.1,.05,'#ffb3c8',-.13,1.0,.44);bx(.06,.1,.05,'#ffb3c8',.13,1.0,.44);bx(.42,.07,.38,'#2a3a5a',0,.93,.4);bx(.12,.12,.08,'#7ae8ff',-.1,.95,.6,{emissive:'#38b8e8'});bx(.12,.12,.08,'#7ae8ff',.1,.95,.6,{emissive:'#38b8e8'});eyes(.8,.58,.09);bx(.07,.05,.05,'#ff8fb0',0,.72,.58);bx(.1,.14,.1,'#7ae8ff',0,.72,-.1,{emissive:'#38b8e8'});P.tail=grp(m,0,.6,-.38);vb(P.tail,.08,.45,.08,'#f6f6fa',0,.22,0);break;
  case 6:bx(.2,.18,.6,'#4a5468',-.28,.1,0);bx(.2,.18,.6,'#4a5468',.28,.1,0);bx(.56,.42,.6,'#aab6c8',0,.42,0);bx(.2,.12,.05,'#ffd84a',0,.42,.31,{emissive:'#ffb000'});bx(.5,.4,.46,'#cfd8e6',0,.88,.05);bx(.12,.12,.05,'#7ae8ff',-.12,.9,.29,{emissive:'#38b8e8'});bx(.12,.12,.05,'#7ae8ff',.12,.9,.29,{emissive:'#38b8e8'});bx(.04,.2,.04,'#6a7488',0,1.18,.05);bx(.1,.1,.1,'#ff5a8a',0,1.32,.05,{emissive:'#ff3070'});bx(.1,.3,.1,'#8a96aa',-.34,.45,0);bx(.1,.3,.1,'#8a96aa',.34,.45,0);P.hover=true;break;
  case 7:bx(.28,.08,.34,'#8a5028',0,.04,.05);bx(.34,.5,.34,'#a8693a',0,.4,0);bx(.2,.3,.05,'#f0d8b0',0,.38,.18);bx(.32,.3,.3,'#b87a4a',0,.8,.08);bx(.08,.12,.08,'#a8693a',-.1,1.02,.05);bx(.08,.12,.08,'#a8693a',.1,1.02,.05);eyes(.84,.24,.09);bx(.06,.05,.05,'#222',0,.78,.25);bx(.1,.1,.1,'#8a5a2a',0,.5,.22);P.tail=grp(m,0,.4,-.2);vb(P.tail,.22,.6,.22,'#c8895a',0,.3,-.1);vb(P.tail,.2,.2,.2,'#e8b88a',0,.72,-.05);break;
  case 8:legs(.08,.42,.14,.3,'#c89a60');bx(.4,.4,.8,'#d6a368',0,.65,0);[[-.1,.2],[.12,-.1],[-.08,-.25]].forEach(p=>bx(.07,.02,.07,'#fff',p[0],.86,p[1]));bx(.18,.4,.2,'#d6a368',0,.95,.36);bx(.24,.24,.3,'#e0b078',0,1.2,.5);bx(.12,.1,.1,'#6a4a30',0,1.15,.68);[-1,1].forEach(k=>{bx(.04,.26,.04,'#a8794a',k*.08,1.45,.44);bx(.14,.04,.04,'#a8794a',k*.12,1.5,.44);bx(.1,.12,.04,'#d6a368',k*.15,1.3,.42);});eyes(1.24,.65,.08);bx(.1,.1,.08,'#fff',0,.8,-.42);break;
  default:legs(.1,.3,.14,.26,'#3a2a2a');bx(.4,.36,.7,'#f08a2a',0,.45,0);bx(.3,.2,.06,'#fff',0,.4,.36);bx(.36,.3,.34,'#f49a3a',0,.78,.42);bx(.18,.14,.16,'#fff',0,.72,.64);bx(.07,.06,.06,'#222',0,.76,.73);[-1,1].forEach(k=>{bx(.1,.2,.08,'#f08a2a',k*.12,1.02,.38);bx(.1,.06,.08,'#222',k*.12,1.14,.38);});eyes(.84,.6,.1);P.tail=grp(m,0,.5,-.35);vb(P.tail,.2,.2,.5,'#f08a2a',0,0,-.25);vb(P.tail,.2,.2,.18,'#fff',0,0,-.58);}
  g.scale.setScalar(.85);return P;
}
function petAnim(P,mv,T){
  const m=P.m;
  m.position.y=P.hover?.12+Math.sin(T*3)*.05:(mv?Math.abs(Math.sin(T*10))*.16:Math.sin(T*2.4)*.015);
  if(P.tail)P.tail.rotation.y=Math.sin(T*(mv?14:5))*.45;
  if(P.id===4){const k=Math.sin(T*(mv?12:3))*.08;m.scale.set(1-k*.6,1+k,1-k*.6);if(P.body)P.body.material.color.setHSL((T*.12)%1,.7,.72);}
}
