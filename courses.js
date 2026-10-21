/* ================= LES COURSES DU PORT =================
   Deux gros jeux, dans le pixel art de la maison et l'habit de la pétanque :
   - LE GRAND PRIX DU QUAI : karting à six, trois tours d'un circuit peint
     sur le quai, dérapage turbo, sardines, savons et coups de mistral.
   - LA DESCENTE DES CALANQUES : kayak à cinq, on pagaie en rythme
     (gauche, droite, gauche…) entre les falaises, par les portes de bouées.
   Le serveur tient la caisse : course_debut prend les 5 €, course_fin paie
   la place, garde les records et rend le classement. */
(function(){
'use strict';

/* ---------------- l'habit : celui du boulodrome ---------------- */
const CSS=`
#crs{position:fixed;inset:0;z-index:31;display:none;background:#0b1109;color:#eef3e4;font-family:Georgia,serif;
  -webkit-user-select:none;user-select:none;touch-action:none;overflow:hidden}
#crs.on{display:block}
#crsToile{position:absolute;left:0;top:0;image-rendering:pixelated;image-rendering:crisp-edges}
#crs .vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 58%,rgba(5,9,5,.45) 100%)}
#crsHaut{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top)) 12px 8px;text-align:center;
  background:linear-gradient(180deg,rgba(8,14,8,.94),rgba(8,14,8,.8));border-bottom:1px solid rgba(216,191,106,.3)}
#crsHaut .d{display:flex;align-items:center;justify-content:space-between;gap:8px}
#crsHaut .j{flex:none;width:84px;text-align:left}#crsHaut .j.r{text-align:right}
#crsHaut .j b{display:block;font:700 9px Arial;letter-spacing:1.6px;color:#93a68c}
#crsHaut .j i{font-style:normal;font:300 22px Georgia;color:#eef3e4}
#crsHaut .s{font:300 34px Georgia;color:#d8bf6a;line-height:1.05;white-space:nowrap}
#crsHaut .s u{text-decoration:none;color:rgba(216,191,106,.4);font-size:20px;padding:0 6px;position:relative;top:-4px}
#crsHaut .t{display:block;font:700 9px Arial;letter-spacing:2px;color:#eef3e4;margin-top:5px}
#crsHaut .m{display:block;font:700 9px Arial;letter-spacing:1.3px;color:#93a68c;margin-top:2px}
#crsCri{position:absolute;left:0;right:0;padding:8px 14px;text-align:center;background:rgba(8,14,8,.8);
  border-top:2px solid rgba(216,191,106,.6);border-bottom:1px solid rgba(216,191,106,.25);transition:opacity .25s;pointer-events:none}
#crsCri.cache{opacity:0}
#crsCri b{display:block;font:700 19px Georgia;letter-spacing:.4px;line-height:1.15}
#crsCri em{display:block;font:italic 12px Georgia;color:#aab8a2;margin-top:3px}
#crsCri.gros b{font-size:44px;color:#d8bf6a}
#crsPied{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,rgba(8,14,8,.72),rgba(8,14,8,.95) 30%);
  border-top:1px solid rgba(216,191,106,.3);padding:10px 12px calc(12px + env(safe-area-inset-bottom))}
#crsPied .bas{display:flex;align-items:center;gap:10px;margin-bottom:9px;font:700 11px Arial;letter-spacing:.8px;color:#93a68c}
#crsPied .bas .w{color:#d8bf6a;min-width:62px;text-align:right}
#crsPied .jg{flex:1;height:9px;border-radius:5px;background:rgba(255,255,255,.08);border:1px solid rgba(216,191,106,.25);overflow:hidden;position:relative}
#crsPied .jg i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#9a7f30,#d8bf6a,#f0dc9a)}
#crsPied .jg i.bleu{background:linear-gradient(90deg,#2a6ad8,#7ac8ff)}
#crsPied .jg i.orange{background:linear-gradient(90deg,#d86a1a,#ffb43a,#fff2a8)}
#crsPied .jg .zone{position:absolute;top:0;bottom:0;background:rgba(159,223,184,.35)}
#crsPied .jg .cur{position:absolute;top:-3px;bottom:-3px;width:3px;margin-left:-1px;border-radius:2px;background:#fff;box-shadow:0 0 6px #fff}
#crsPied .cmd{display:flex;gap:9px}
#crsPied .cmd button{flex:1;height:68px;border-radius:20px;border:1px solid rgba(216,191,106,.35);background:rgba(230,245,225,.06);
  color:#eef3e4;font:700 12px Arial;letter-spacing:2.2px;touch-action:none;-webkit-tap-highlight-color:transparent;padding:0}
#crsPied .cmd button.or{background:#d8bf6a;color:#15201a;border:0}
#crsPied .cmd button.or.app{background:#f0dc9a}
#crsPied .cmd button.app{background:rgba(230,245,225,.2)}
#crsPied .cmd button.obj{flex:none;width:68px;font-size:28px;letter-spacing:0}
#crsPied .cmd button.obj.vide{opacity:.35}
#crsPied .cmd button.vert{background:rgba(159,223,184,.22);border-color:rgba(159,223,184,.8);color:#9fdfb8}
#crsPied .cmd button svg{display:block;margin:0 auto}
#crs.course #crsFermer{top:auto;bottom:calc(var(--pied,150px) + 8px)}
#crsFermer{position:absolute;right:10px;top:calc(10px + env(safe-area-inset-top));z-index:6;width:32px;height:32px;border-radius:50%;
  border:1px solid rgba(216,191,106,.35);background:rgba(0,0,0,.55);color:#eef3e4;font-size:13px}
#crsMenu{position:absolute;inset:0;z-index:5;display:none;overflow-y:auto;padding:calc(18px + env(safe-area-inset-top)) 14px calc(20px + env(safe-area-inset-bottom));
  background:radial-gradient(ellipse at 50% 30%,rgba(23,33,26,.93),rgba(9,14,9,.97));text-align:center}
#crsMenu.on{display:block}
#crsMenu .ti{font:700 10px ui-monospace,monospace;letter-spacing:1.5px;color:#d8bf6a;margin:4px 40px 4px}
#crsMenu h2{font:400 30px Georgia;margin:0 0 4px;color:#eef3e4}
#crsMenu .so{font:italic 13px Georgia;color:#93a68c;margin:0 10px 14px;line-height:1.45}
#crsMenu .ved{display:block;width:100%;text-align:left;border:1px solid #d8bf6a;border-radius:16px;background:rgba(216,191,106,.1);
  padding:13px 14px;color:#eef3e4;margin-bottom:10px;font-family:Georgia}
#crsMenu .ved small{display:block;font:700 10px Arial;letter-spacing:2.4px;color:#d8bf6a}
#crsMenu .ved b{display:block;font:400 22px Georgia;margin-top:3px}
#crsMenu .ved em{display:block;font:italic 12px Georgia;color:#93a68c;margin-top:2px}
#crsMenu .ved .go{float:right;font:700 11px Arial;letter-spacing:1.2px;color:#15201a;background:#d8bf6a;border-radius:12px;padding:7px 11px;margin-top:-30px}
#crsMenu .ved.gris{border-color:rgba(147,166,140,.4);background:rgba(230,245,225,.04)}
#crsMenu .ved.gris small{color:#93a68c}#crsMenu .ved.gris .go{background:rgba(230,245,225,.12);color:#eef3e4}
#crsMenu .rub{font:700 10px Arial;letter-spacing:2.4px;color:#93a68c;text-align:left;margin:16px 2px 7px}
#crsMenu .cl{border:1px solid rgba(216,191,106,.2);border-radius:14px;overflow:hidden;text-align:left}
#crsMenu .cl div{display:flex;align-items:center;gap:10px;padding:8px 12px;border-top:1px solid rgba(216,191,106,.1);font:400 15px Georgia}
#crsMenu .cl div:first-child{border-top:0}
#crsMenu .cl div i{font-style:normal;width:22px;font:700 12px Arial;color:#93a68c}
#crsMenu .cl div span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#crsMenu .cl div em{font:700 12px ui-monospace,monospace;color:#d8bf6a;font-style:normal}
#crsMenu .cl div.moi{background:rgba(216,191,106,.12)}
#crsMenu .vide{font:italic 13px Georgia;color:#93a68c;padding:12px}
#crsMenu .msg{font:italic 13px Georgia;color:#ffb0a0;min-height:18px;margin:6px 0}
#crsMenu .regle{text-align:left;font:13px Georgia;color:#c9d3c2;line-height:1.5;border:1px solid rgba(216,191,106,.2);border-radius:14px;padding:10px 12px}
#crsMenu .regle b{color:#eef3e4}
#crsMenu .pod{border:1px solid rgba(216,191,106,.25);border-radius:16px;overflow:hidden;text-align:left;margin-bottom:12px}
#crsMenu .pod div{display:flex;align-items:center;gap:10px;padding:9px 12px;border-top:1px solid rgba(216,191,106,.1);font:400 16px Georgia}
#crsMenu .pod div:first-child{border-top:0}
#crsMenu .pod div.moi{background:rgba(216,191,106,.16)}
#crsMenu .pod div i{font-style:normal;font:300 22px Georgia;color:#d8bf6a;width:26px}
#crsMenu .pod div span{flex:1}
#crsMenu .pod div q{quotes:none;width:14px;height:14px;border-radius:4px;flex:none}
#crsMenu .pod div em{font:700 12px ui-monospace,monospace;color:#93a68c;font-style:normal}
#crsMenu .gain{font:300 40px Georgia;color:#d8bf6a;margin:6px 0 2px}
#crsMenu .lien{display:inline-block;margin-top:10px;background:none;border:0;color:#93a68c;font:700 11px Arial;letter-spacing:1.6px}
#crsMenu .deux{display:flex;gap:10px;margin-top:6px}
#crsMenu .deux button{flex:1;border-radius:18px;padding:14px;border:1px solid rgba(216,191,106,.35);background:rgba(230,245,225,.06);color:#eef3e4;font:700 12px Arial;letter-spacing:2px}
#crsMenu .deux button.or{background:#d8bf6a;color:#15201a;border:0}
`;

/* ---------------- le pinceau à pixels ---------------- */
const B4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const bay=(x,y)=>{x=Math.floor(x);y=Math.floor(y);return (B4[((y%4)+4)%4][((x%4)+4)%4]+.5)/16;};
const RGBC={};const rgb=h=>RGBC[h]||(RGBC[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
const hs=(x,y,k=0)=>{const v=Math.sin(x*127.1+y*311.7+k*74.7)*43758.5453;return v-Math.floor(v);};
function lisse(x,y,e,k){const fx=x/e,fy=y/e,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,ad=t=>t*t*(3-2*t),u=ad(tx),v=ad(ty);
  return (hs(ix,iy,k)*(1-u)+hs(ix+1,iy,k)*u)*(1-v)+(hs(ix,iy+1,k)*(1-u)+hs(ix+1,iy+1,k)*u)*v;}
const marbre=(x,y,k)=>lisse(x,y,5,k)*.3+lisse(x,y,13,k+1)*.38+lisse(x,y,31,k+2)*.32;
function tone(x,y,v,pal){v=Math.max(0,Math.min(.9999,v));const f=v*(pal.length-1),i=Math.floor(f);return pal[Math.min(pal.length-1,i+((f-i)>bay(x,y)?1:0))];}
function Toile(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const im=g.createImageData(w,h),D=im.data;
  const T={c,g,w,h,D,
    P(x,y,col){x|=0;y|=0;if(x<0||y<0||x>=w||y>=h)return;const k=(y*w+x)*4,v=rgb(col);D[k]=v[0];D[k+1]=v[1];D[k+2]=v[2];D[k+3]=255;},
    Pa(x,y,col,a){x|=0;y|=0;if(x<0||y<0||x>=w||y>=h)return;const k=(y*w+x)*4,v=rgb(col);if(!D[k+3]){D[k]=v[0];D[k+1]=v[1];D[k+2]=v[2];D[k+3]=255*a;return;}for(let i=0;i<3;i++)D[k+i]=D[k+i]*(1-a)+v[i]*a;},
    dk(x,y,a){x|=0;y|=0;if(x<0||y<0||x>=w||y>=h)return;const k=(y*w+x)*4;D[k]*=1-a;D[k+1]*=1-a;D[k+2]*=1-a*.8;},
    R(x,y,ww,hh,col){for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)T.P(x+i,y+j,col);},
    C(cx,cy,r,col){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*.6)T.P(cx+x,cy+y,col);},
    L(x0,y0,x1,y1,col){x0|=0;y0|=0;x1|=0;y1|=0;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){T.P(x0,y0,col);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}},
    fin(){g.putImageData(im,0,0);return c;}};
  return T;}
/* un sprite en caractères, pivoté proprement : majorité sur 3×3 sous-pixels */
function pivoter(rows,pal,ang,ombre){const h=rows.length,w=Math.max(...rows.map(r=>r.length)),ca=Math.cos(ang),sa=Math.sin(ang),rr=Math.ceil(Math.hypot(w,h)/2)+1,S=rr*2+1;
  const T=Toile(S,S);for(let y=-rr;y<=rr;y++)for(let x=-rr;x<=rr;x++){const cnt={};let best='.',bn=0;
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const X=x+a/3,Y=y+b/3;const sx=Math.floor(ca*X+sa*Y+w/2),sy=Math.floor(-sa*X+ca*Y+h/2);
      const c=(sy<0||sy>=h||sx<0||sx>=w)?'.':(rows[sy][sx]||'.');cnt[c]=(cnt[c]||0)+1;if(cnt[c]>bn||(cnt[c]===bn&&c!=='.')){bn=cnt[c];best=c;}}
    if(best==='.'||bn<4)continue;if(ombre){T.P(x+rr,y+rr,'#000000');continue;}T.P(x+rr,y+rr,pal[best]);}
  const c=T.fin();c.r=rr;return c;}

/* ---------------- le cadre : la toile, les bandeaux, les boutons ---------------- */
let RACINE=null;
function racine(){
  if(RACINE)return RACINE;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const d=document.createElement('div');d.id='crs';
  d.innerHTML='<canvas id="crsToile"></canvas><div class="vig"></div><div id="crsHaut"></div><div id="crsCri" class="cache"><b></b><em></em></div>'+
    '<div id="crsPied"></div><div id="crsMenu"></div><button id="crsFermer" aria-label="Fermer">✕</button>';
  document.body.appendChild(d);
  RACINE={d,toile:d.querySelector('#crsToile'),haut:d.querySelector('#crsHaut'),cri:d.querySelector('#crsCri'),pied:d.querySelector('#crsPied'),menu:d.querySelector('#crsMenu'),fer:d.querySelector('#crsFermer')};
  return RACINE;}
function echap(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const chrono=ms=>{ms=Math.max(0,ms|0);const m=Math.floor(ms/60000),s=Math.floor(ms/1000)%60,c=Math.floor(ms/10)%100;return m+':'+String(s).padStart(2,'0')+'.'+String(c).padStart(2,'0');};
const fr=c=>(c/100).toFixed(2).replace('.',',')+' €';
const ordinal=n=>n===1?'1er':n+'e';
/* les boutons tenus : plusieurs doigts à la fois, chacun son bouton */
function tenir(btn,onDown,onUp){const act=new Set();
  btn.addEventListener('pointerdown',ev=>{ev.preventDefault();try{btn.setPointerCapture(ev.pointerId);}catch(x){}act.add(ev.pointerId);btn.classList.add('app');onDown&&onDown();});
  const up=ev=>{if(!act.has(ev.pointerId))return;act.delete(ev.pointerId);if(!act.size){btn.classList.remove('app');onUp&&onUp();}};
  btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('lostpointercapture',up);
  btn.addEventListener('contextmenu',ev=>ev.preventDefault());}
function vibrer(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(x){}}

/* ---------------- le son : petit moteur et petits bips ---------------- */
function Son(){let ac=null,mot=null,gm=null,on=true;try{const r=JSON.parse(localStorage.getItem('bdl.reglages')||'{}');if(r&&r.sons===false)on=false;}catch(x){}
  const ctx=()=>{if(!on)return null;if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(x){on=false;return null;}}if(ac.state==='suspended')ac.resume();return ac;};
  return {
    bip(f,d,type,vol){const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.value=f;g.gain.value=vol||.05;g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+d);},
    moteur(v){const a=ctx();if(!a)return;if(!mot){mot=a.createOscillator();mot.type='sawtooth';gm=a.createGain();gm.gain.value=0;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=600;mot.connect(f).connect(gm).connect(a.destination);mot.start();}
      mot.frequency.setTargetAtTime(48+v*95,a.currentTime,.08);gm.gain.setTargetAtTime(v>0?.028:0,a.currentTime,.1);},
    plouf(){const a=ctx();if(!a)return;const n=a.sampleRate*.18,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
      const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=900;g.gain.value=.12;s.connect(f).connect(g).connect(a.destination);s.start();},
    stop(){try{if(gm)gm.gain.value=0;}catch(x){}}};}

/* =====================================================================
   LE GRAND PRIX DU QUAI
   ===================================================================== */
const KART=[
"....ddddddd....",
"...dBBBwBBBd...",
"...dBBwbwBBd...",
"kkkdbbbbbbbdkkk",
"kKkdbBbbbbbdkKk",
"kkkd.bbbbb.dkkk",
"kkk..dsssd..kkk",
".....shhhs.....",
"....shHHhhs....",
"...bshHHhhsb...",
"...bshhhhhsb...",
"...dbshhhsbd...",
"....bsssssb....",
"kkkdbbbbbbbdkkk",
"kKkdbBbbbbbdkKk",
"kkkdgGgGgGgdkkk",
"kkkdgggggggdkkk",
"...ddddddddd...",
"....e.....e....",
];
const PILOTES=[
  {nom:'Toi',b:'#e8761e',B:'#ff9a44',d:'#a8480e',h:'#ffd04a',H:'#fff2a8'},
  {nom:'Marius',b:'#2a6ad8',B:'#4a8af0',d:'#1a4498',h:'#f4f4f4',H:'#ffffff'},
  {nom:'Fanny',b:'#2ac84a',B:'#5ae070',d:'#1a8a30',h:'#e82a2a',H:'#ff6a5a'},
  {nom:'Escartefigue',b:'#c83ad8',B:'#e070f0',d:'#8a2098',h:'#202024',H:'#4a4a52'},
  {nom:'Panisse',b:'#ffd21a',B:'#ffe870',d:'#b08a10',h:'#2a4ad8',H:'#5a7af0'},
  {nom:'César',b:'#f2f2ee',B:'#ffffff',d:'#a8a8a0',h:'#e82a2a',H:'#ff6a5a'},
];
const KPAL=p=>({d:p.d,b:p.b,B:p.B,w:'#f4f4f0',k:'#141418',K:'#4a4a52',s:'#24242a',h:p.h,H:p.H,g:'#6a6e76',G:'#a8acb4',e:'#8a8e96'});
const NDIR=32;
let SPR_KART=null;
function spritesKart(){if(SPR_KART)return SPR_KART;SPR_KART=PILOTES.map(p=>{const pal=KPAL(p);const a=[];for(let i=0;i<NDIR;i++)a.push(pivoter(KART,pal,i/NDIR*Math.PI*2));return a;});
  SPR_KART.ombre=[];for(let i=0;i<NDIR;i++)SPR_KART.ombre.push(pivoter(KART,null,i/NDIR*Math.PI*2,true));return SPR_KART;}
const SARD=['..bbbb..','.bwBBBbt','bBBBBBbt','.bbbbb.t'];
let SPR_SARD=null;
function spritesSardine(){if(SPR_SARD)return SPR_SARD;const pal={b:'#4a6a88',B:'#a8c8e0',w:'#141418',t:'#3a5a78'};SPR_SARD=[];
  /* la sardine du dessin regarde à droite : on la tourne d'un quart pour qu'elle regarde en haut à l'angle zéro */
  const rot=[];for(let x=0;x<8;x++){let s='';for(let y=3;y>=0;y--)s+=SARD[y][7-x]||'.';rot.push(s);}
  for(let i=0;i<16;i++)SPR_SARD.push(pivoter(rot.reverse?rot:rot,pal,i/16*Math.PI*2));return SPR_SARD;}

/* le circuit : une boucle fermée sur le quai, l'eau à l'ouest */
const KW=440,KH=960,HW=22;
const CTRL=[[118,830],[116,640],[118,450],[124,250],[146,150],[200,100],[270,96],[330,132],[350,210],[330,290],[290,340],[292,420],[338,480],[354,570],[330,650],[272,700],[262,770],[276,840],[240,900],[170,918],[128,884]];
const rive=y=>70+6*Math.sin(y/90);
function construireCircuit(){
  /* Catmull-Rom fermée, puis rééchantillonnée tous les 3 px */
  const n=CTRL.length,fin=[];
  for(let i=0;i<n;i++){const p0=CTRL[(i-1+n)%n],p1=CTRL[i],p2=CTRL[(i+1)%n],p3=CTRL[(i+2)%n];
    for(let k=0;k<40;k++){const t=k/40,t2=t*t,t3=t2*t;
      fin.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
                .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
  const P=[];let acc=0;P.push({x:fin[0][0],y:fin[0][1]});
  for(let i=1;i<=fin.length;i++){const a=fin[i-1],b=fin[i%fin.length];let L=Math.hypot(b[0]-a[0],b[1]-a[1]);let pos=0;
    while(acc+L-pos>=3){const need=3-acc;pos+=need;const t=pos/L;P.push({x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t});acc=0;}acc+=L-pos;}
  P.pop();const N=P.length;
  for(let i=0;i<N;i++){const a=P[(i-2+N)%N],b=P[(i+2)%N];const L=Math.hypot(b.x-a.x,b.y-a.y)||1;P[i].tx=(b.x-a.x)/L;P[i].ty=(b.y-a.y)/L;}
  for(let i=0;i<N;i++){const a=P[(i-6+N)%N],b=P[(i+6)%N];P[i].k=(a.tx*b.ty-a.ty*b.tx);}
  /* la courbure lissée, pour les vibreurs et pour les pilotes */
  for(let i=0;i<N;i++){let s=0;for(let j=-8;j<=8;j++)s+=P[(i+j+N)%N].k;P[i].ks=s/17;}
  return P;}
function plusProche(P,x,y,i0,fen){const N=P.length;let bi=i0,bd=1e9;
  if(i0==null){for(let i=0;i<N;i++){const d=(P[i].x-x)**2+(P[i].y-y)**2;if(d<bd){bd=d;bi=i;}}return bi;}
  for(let j=-fen;j<=fen;j++){const i=(i0+j+N)%N;const d=(P[i].x-x)**2+(P[i].y-y)**2;if(d<bd){bd=d;bi=i;}}return bi;}

function graverCircuit(P){
  const T=Toile(KW,KH),N=P.length;
  /* le champ de distance au tracé, et le point du tracé le plus proche */
  const DIST=new Float32Array(KW*KH).fill(999),IDX=new Int32Array(KW*KH).fill(-1);const RR=HW+16;
  for(let i=0;i<N;i++){const p=P[i];for(let y=Math.floor(p.y-RR);y<=p.y+RR;y++){if(y<0||y>=KH)continue;for(let x=Math.floor(p.x-RR);x<=p.x+RR;x++){if(x<0||x>=KW)continue;
    const d=Math.hypot(x-p.x,y-p.y),k=y*KW+x;if(d<DIST[k]){DIST[k]=d;IDX[k]=i;}}}}
  const EAU=['#1d4e54','#22575d','#265c62','#2b6568'],QUAI=['#a8946c','#bca480','#cbb488','#d8c49a'];
  const AS=['#3a3b40','#44454a','#4e4f55','#5a5b60'],GRAV=['#9a8a6e','#ae9e80','#c2b292','#d2c4a6'];
  for(let y=0;y<KH;y++){const be=rive(y);for(let x=0;x<KW;x++){const k=y*KW+x,d=DIST[k];
    if(x<be){let v=.5+(marbre(x,y,11)-.5)*.9;if(hs(Math.floor(x/7),Math.floor(y/3),12)<.08&&x%7<4&&y%3===0){T.P(x,y,'#497670');continue;}
      if(hs(Math.floor(x/9),Math.floor(y/4),13)<.06&&x%9<5&&y%4===0){T.P(x,y,'#1d4e54');continue;}T.P(x,y,tone(x,y,v,EAU));continue;}
    if(d<HW){const p=P[IDX[k]];const lat=(x-p.x)*(-p.ty)+(y-p.y)*p.tx;
      let v=.45+(marbre(x,y,16)-.5)*.6+(hs(x,y,17)-.5)*.35;
      /* la gomme de la trajectoire, plus sombre */const ideal=-p.ks*90;if(Math.abs(lat-Math.max(-12,Math.min(12,ideal)))<5)v-=.18;
      if(d>HW-3&&Math.abs(p.ks)>.06){T.P(x,y,(Math.floor(IDX[k]/3)%2)?'#c8322a':'#f2eee4');continue;}
      if(d>HW-1.5){T.P(x,y,'#e8e4da');continue;}
      T.P(x,y,tone(x,y,v,AS));continue;}
    if(d<HW+6){T.P(x,y,tone(x,y,.4+(hs(x,y,18)-.5)*.7+(marbre(x,y,19)-.5)*.4,GRAV));continue;}
    /* les grandes dalles du quai */
    const r=Math.floor(y/12),off=(r%2)*12,cc=Math.floor((x+off)/24);const j=(y%12===0)||((x+off)%24===0);
    T.P(x,y,j?'#8f7a58':tone(x,y,.45+(hs(cc,r,14)-.5)*.35+(marbre(x,y,15)-.5)*.5,QUAI));}}
  /* le bord du quai */
  for(let y=0;y<KH;y++){const b=Math.round(rive(y));T.P(b,y,'#e8d8b4');T.P(b+1,y,'#f2e6c8');T.P(b-1,y,'#705733');T.P(b-2,y,'#2a2117');}
  /* bateaux amarrés, comme au port */
  const BAT=[["#f4f2e8","#c8322a"],["#f4f2e8","#2a5a9a"],["#2a3e6a","#f4f2e8"],["#f4f2e8","#2a8a5a"],["#f4f2e8","#1a1a1e"]];
  for(let i=0;i<34;i++){const y=8+i*28,be=rive(y),x=Math.round(be-50),L=44,[co,ba]=BAT[i%5];
    for(let ii=0;ii<L;ii++){const pinch=ii<5?5-ii:0;for(let jj=0;jj<7;jj++){if(jj<pinch*.6)continue;let col=co;if(jj===2||jj===3)col=ba;if(jj>=5)col='#1d2c3a';if(jj===0)col='#b88a5a';T.P(x+ii,y+jj,col);}}
    T.R(x+5,y-1,L-6,1,'#9a6e44');T.R(x+19,y-5,9,4,'#f4f2e8');T.R(x+20,y-4,2,2,'#2a3a4a');T.R(x+24,y-4,2,2,'#2a3a4a');
    for(let jj=0;jj<5;jj++)for(let ii=0;ii<L;ii++)if(bay(x+ii,y+7+jj)<.5-jj*.1)T.dk(x+ii+2,y+7+jj,.25);
    T.L(x+28,y-1,x+28,y-12,'#e8e4da');T.P(x+28,y-13,'#c8322a');}
  /* bites d'amarrage */
  for(let y=14;y<KH;y+=28){const b=Math.round(rive(y))+4;T.R(b,y,3,3,'#2a2a2e');T.P(b+1,y,'#5a5a62');T.dk(b+3,y+2,.35);}
  /* les murs de pneus, de part et d'autre, là où ils ne mordent pas une autre portion */
  const pneus=[];
  for(let i=0;i<N;i+=2){const p=P[i];for(const s of [-1,1]){const x=p.x-p.ty*s*(HW+9),y=p.y+p.tx*s*(HW+9);const xi=Math.round(x),yi=Math.round(y);if(xi<2||yi<2||xi>=KW-2||yi>=KH-2)continue;
    if(DIST[yi*KW+xi]<HW+8)continue;if(pneus.some(q=>Math.abs(q[0]-x)<4&&Math.abs(q[1]-y)<4))continue;pneus.push([x,y,pneus.length]);}}
  for(const [x,y,n] of pneus){const xi=Math.round(x),yi=Math.round(y);for(let k=1;k<4;k++)T.dk(xi+1+k,yi+1+k,.25);T.C(xi,yi,2,'#141418');T.P(xi,yi,'#4a4a52');
    const c=(Math.floor(n/2)%2)?'#c8322a':'#f2eee4';T.P(xi-1,yi-2,c);T.P(xi,yi-2,c);T.P(xi+1,yi-2,c);}
  /* la ligne de départ et la grille */
  const p0=P[0];const nx=-p0.ty,ny=p0.tx;
  for(let a=-HW+1;a<HW-1;a++)for(let b=0;b<4;b++){const x=Math.round(p0.x+nx*a+p0.tx*(b-2)),y=Math.round(p0.y+ny*a+p0.ty*(b-2));T.P(x,y,((Math.floor((a+30)/2)+Math.floor(b/2))%2)?'#f4f4f0':'#1a1a1e');}
  for(let g=0;g<6;g++){const q=P[(N-8-g*7)%N],side=(g%2?1:-1)*9;const cx=q.x-q.ty*side,cy=q.y+q.tx*side;
    for(let a=-6;a<=6;a++){T.P(Math.round(cx-q.ty*a+q.tx*-8),Math.round(cy+q.tx*a+q.ty*-8),'#e8e4da');}
    for(let b=-8;b<=0;b++){T.P(Math.round(cx-q.ty*-6+q.tx*b),Math.round(cy+q.tx*-6+q.ty*b),'#e8e4da');T.P(Math.round(cx-q.ty*6+q.tx*b),Math.round(cy+q.tx*6+q.ty*b),'#e8e4da');}}
  /* les tribunes, côté ville */
  for(let y=0;y<KH;y++)for(let x=KW-14;x<KW;x++)T.P(x,y,tone(x,y,.4+(marbre(x,y,20)-.5)+(x%3===0?-.3:0),['#5a1e18','#7a2a22','#9a3a2a','#b04a34']));
  for(let y=2;y<KH;y+=4)for(let x=KW-13;x<KW;x+=3){if(hs(x,y,21)<.25)continue;const peau=['#f4d0a8','#c89070','#8a5a3a','#e8b890'][Math.floor(hs(x,y,22)*4)];
    T.P(x,y,peau);T.P(x,y+1,['#e8445a','#3d8be8','#f4c23a','#f4f4f0','#7ad06a','#ff8a3a'][Math.floor(hs(x,y,23)*6)]);}
  for(let y=0;y<KH;y++)T.P(KW-15,y,'#2a1a14');
  /* la banderole du Grand Prix dans l'herbe du milieu */
  const ban=(x,y,txt)=>{T.R(x,y,80,9,'#15201a');T.R(x,y,80,1,'#d8bf6a');T.R(x,y+8,80,1,'#d8bf6a');for(let k=0;k<3;k++)T.dk(x+2,y+9+k,0);
    for(let k=0;k<80;k++)for(let j=1;j<4;j++)if(bay(x+k,y+9+j)<.6-j*.15)T.dk(x+k+2,y+9+j,.3);return [x+40,y+7,txt];};
  const txts=[];
  /* fleurs, jarres, palmiers dans le milieu */
  const pot=(x,y)=>{T.R(x-3,y+1,7,4,'#a8543a');T.R(x-3,y+1,7,1,'#c06a44');T.C(x,y-1,3,'#2e5a26');T.C(x-1,y-2,2,'#3e7a32');T.P(x+1,y-2,'#d8344a');T.P(x-2,y,'#e85a6a');T.P(x,y-3,'#ffe27a');for(let k=0;k<5;k++)T.dk(x+4+k*.4,y+3+k*.4,.3);};
  const palmier=(x,y)=>{for(let a=0;a<8;a++){const an=a/8*Math.PI*2;for(let r=0;r<11;r++){const xx=x+Math.cos(an)*r,yy=y+Math.sin(an)*r*.9;const w=r<3?2:r<8?1.5:1;for(let q=-w;q<=w;q++)T.P(xx-Math.sin(an)*q,yy+Math.cos(an)*q,(r+q+a)%3?'#3a7a2e':'#2a5a22');}}
    T.C(x,y,2,'#7a5a3a');for(let k=0;k<12;k++)for(let q=-6;q<6;q++)if(bay(x+k,y+q)<.4)T.dk(x+8+k,y+8+q,.25);};
  for(let y=0;y<KH;y+=4)for(let x=0;x<KW;x+=4){}
  [[214,250],[230,600],[200,780],[250,460]].forEach(([x,y],i)=>{const k=y*KW+x;if(DIST[k]>HW+12)(i%2?palmier:pot)(x,y);});
  for(const [x,y] of [[186,200],[240,350],[196,520],[210,690],[300,780],[392,300],[392,640]]){const k=y*KW+x;if(DIST[k]>HW+10)pot(x,y);}
  for(const [x,y] of [[176,420],[176,610]]){const k=y*KW+x;if(DIST[k]>HW+14)palmier(x,y);}
  txts.push(ban(172,300,'GRAND PRIX'));
  /* lampadaires du quai, entre l'eau et la piste */
  const lampes=[];for(let y=60;y<KH;y+=110){const x=Math.round(rive(y))+12;if(DIST[y*KW+x]>HW+6){T.R(x,y-1,3,3,'#2a2c30');lampes.push([x+1,y]);}}
  const c=T.fin();const g=c.getContext('2d');
  g.font='italic 700 7px Georgia';g.textAlign='center';g.fillStyle='#d8bf6a';for(const [x,y,t] of txts)g.fillText(t,x,y);
  return {c,DIST,IDX,lampes};}
/* le dessus : ce qui passe au-dessus des karts (portique, guirlandes, lampadaires) */
function graverDessus(P,lampes){const c=document.createElement('canvas');c.width=KW;c.height=KH;const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h);};
  const p0=P[0];const nx=-p0.ty,ny=p0.tx;const xa=p0.x-nx*(HW+4),ya=p0.y-ny*(HW+4),xb=p0.x+nx*(HW+4),yb=p0.y+ny*(HW+4);
  /* le portique : deux poteaux de laiton et la poutre noire aux feux */
  R(xa-1,ya-26,3,28,'#d8bf6a');R(xb-1,yb-26,3,28,'#d8bf6a');
  const x0=Math.min(xa,xb)-2,w=Math.abs(xb-xa)+5;R(x0,ya-30,w,8,'#15201a');R(x0,ya-30,w,1,'#d8bf6a');R(x0,ya-23,w,1,'#d8bf6a');
  g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x0+8,ya-14,w,6);
  g.font='italic 700 6px Georgia';g.textAlign='center';g.fillStyle='#d8bf6a';g.fillText('GRAND PRIX DU QUAI',x0+w/2,ya-24.6);
  c.feux=[x0+w/2-14,ya-27];
  /* guirlandes de fanions au-dessus de la piste */
  const COUL=['#e8445a','#3d8be8','#f4c23a','#f4f4f0','#7ad06a','#ff8a3a'];
  for(const i of [Math.floor(P.length*.3),Math.floor(P.length*.62)]){const p=P[i],nx=-p.ty,ny=p.tx;const a=[p.x-nx*(HW+9),p.y-ny*(HW+9)],b=[p.x+nx*(HW+9),p.y+ny*(HW+9)];
    for(let k=0;k<=40;k++){const t=k/40,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*3-8;R(x,y,1,1,'#2a2622');
      if(k%4===2){R(x-1,y+1,3,1,COUL[(k/4|0)%6]);R(x,y+2,1,1,COUL[(k/4|0)%6]);}}}
  /* les têtes de lampadaires */
  for(const [x,y] of lampes){R(x,y-16,1,16,'#2a2c30');R(x-2,y-19,5,3,'#2a2c30');R(x-1,y-18,3,1,'#ffe6a0');}
  return c;}

function karting(ctx){
  const Rt=racine(),son=Son();
  const P=construireCircuit(),N=P.length;
  const monde=graverCircuit(P),dessus=graverDessus(P,monde.lampes);
  const SK=spritesKart(),SS=spritesSardine();
  const marques=document.createElement('canvas');marques.width=KW;marques.height=KH;const gm=marques.getContext('2d');
  const toile=Rt.toile,g=toile.getContext('2d');
  let S=2,AW=195,AH=422;
  function cadrer(){const W=innerWidth,H=(window.visualViewport?visualViewport.height:innerHeight);S=W>=640?3:2;AW=Math.ceil(W/S);AH=Math.ceil(H/S);
    toile.width=AW;toile.height=AH;toile.style.width=AW*S+'px';toile.style.height=AH*S+'px';g.imageSmoothingEnabled=false;}
  cadrer();addEventListener('resize',cadrer);
  const TOURS=3,VMAX=138;
  let ETAT='menu',K=[],objets=[],parts=[],proj=[],savons=[],t0=0,tFin=0,course=null,ord=[],cam={x:0,y:0},dernier=0,anim=0,msgT=0,finis=[];
  const IN={g:false,d:false,drift:false};
  /* les caisses : deux rangées de trois */
  function poserCaisses(){objets=[];for(const f of [.27,.69]){const i=Math.floor(N*f),p=P[i];for(const o of [-12,0,12])objets.push({x:p.x-p.ty*o,y:p.y+p.tx*o,t:0});}}
  function placerGrille(){K=PILOTES.map((pl,n)=>{const q=P[(N-14-n*7)%N],side=(n%2?1:-1)*9;
    return {n,pl,x:q.x-q.ty*side,y:q.y+q.tx*side,ang:Math.atan2(q.tx,-q.ty),v:0,slip:0,drift:0,charge:0,boost:0,spin:0,idx:(N-14-n*7)%N,vu:(N-14-n*7)%N,tour:0,prog:0,fini:0,tFini:0,
      obj:null,objT:0,cible:n?(hs(n,9)-.5)*14:0,skill:n?[0,.94,.965,.92,.955,.935][n]:1,dernierTour:0,meilleurTour:0,tTour:0};});}
  function cri(b,em,cl,dur){Rt.cri.className=cl||'';Rt.cri.querySelector('b').textContent=b;Rt.cri.querySelector('em').textContent=em||'';msgT=dur||1.6;}
  /* ---------------- la boucle ---------------- */
  function boucle(t){if(!Rt.d.classList.contains('on')){son.stop();return;}anim=requestAnimationFrame(boucle);
    let dt=Math.min(.05,(t-(dernier||t))/1000);dernier=t;if(ETAT==='course'||ETAT==='grille'||ETAT==='fin2')pas(dt);dessiner(t/1000);}
  function pas(dt){
    if(ETAT==='grille'){const r=(performance.now()-t0)/1000;const n=3-Math.floor(r);
      if(n!==ord.cd&&n>0){ord.cd=n;cri(String(n),'',' gros',1.2);son.bip(440,.18,'square',.06);vibrer(15);}
      if(r>=3){ETAT='course';t0=performance.now();cri('Partez !','tiens DRIFT dans les virages pour charger le turbo',' gros',1.4);son.bip(880,.35,'square',.07);vibrer(30);}
      son.moteur(.15);return;}
    const now=performance.now()-t0;
    for(const k of K)piloter(k,dt,now);
    /* les karts se bousculent */
    for(let i=0;i<K.length;i++)for(let j=i+1;j<K.length;j++){const a=K[i],b=K[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<11&&d>0){const p=(11-d)/2,ux=dx/d,uy=dy/d;a.x-=ux*p;a.y-=uy*p;b.x+=ux*p;b.y+=uy*p;
      const m=(a.v+b.v)/2;a.v=a.v*.92+m*.08;b.v=b.v*.92+m*.08;if(a.n===0||b.n===0)vibrer(8);}}
    /* les caisses */
    for(const o of objets){if(o.t>0){o.t-=dt;continue;}for(const k of K){if(!k.fini&&!k.obj&&Math.hypot(k.x-o.x,k.y-o.y)<9){o.t=3;k.obj=tirerObjet(k);k.objT=.8+Math.random()*2.2;
        if(k.n===0){son.bip(1200,.08,'square',.05);setTimeout(()=>son.bip(1600,.1,'square',.05),70);majObjet();}break;}}}
    /* sardines lancées */
    for(const s of proj){s.vie-=dt;const i=plusProche(P,s.x,s.y,s.idx,10);s.idx=i;const q=P[(i+6)%N];let tx=q.x-s.x,ty=q.y-s.y;
      /* elle file vers le kart de devant s'il est dans l'axe */
      const cib=K.find(k=>k!==s.de&&!k.spin&&Math.hypot(k.x-s.x,k.y-s.y)<46);if(cib){tx=cib.x-s.x;ty=cib.y-s.y;}
      const L=Math.hypot(tx,ty)||1;s.vx+=(tx/L*270-s.vx)*Math.min(1,dt*6);s.vy+=(ty/L*270-s.vy)*Math.min(1,dt*6);s.x+=s.vx*dt;s.y+=s.vy*dt;s.ang=Math.atan2(s.vx,-s.vy);
      for(const k of K)if(k!==s.de&&!k.spin&&Math.hypot(k.x-s.x,k.y-s.y)<8){toucher(k,'sardine');s.vie=0;eclats(s.x,s.y,'#a8c8e0',10);}}
    for(let i=proj.length-1;i>=0;i--)if(proj[i].vie<=0)proj.splice(i,1);
    for(const s of savons){s.vie-=dt;for(const k of K)if(!k.spin&&Math.hypot(k.x-s.x,k.y-s.y)<7&&(k!==s.de||s.arme<=0)){toucher(k,'savon');s.vie=0;eclats(s.x,s.y,'#ffffff',12);}s.arme-=dt;}
    for(let i=savons.length-1;i>=0;i--)if(savons[i].vie<=0)savons.splice(i,1);
    for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.9;p.vy*=.9;p.vie-=dt;}
    for(let i=parts.length-1;i>=0;i--)if(parts[i].vie<=0)parts.splice(i,1);
    /* le classement */
    for(const k of K)k.prog=k.fini?1e9-k.tFini:k.tour*N+((k.idx-0+N)%N);
    ord=K.slice().sort((a,b)=>b.prog-a.prog);ord.forEach((k,i)=>k.place=i+1);
    const moi=K[0];son.moteur(Math.max(.1,moi.v/VMAX));
    if(msgT>0){msgT-=dt;if(msgT<=0)Rt.cri.classList.add('cache');}
    majHaut(now);
    if(ETAT==='course'&&moi.fini){ETAT='fin2';tFin=performance.now();finir(moi);}
    if(ETAT==='fin2'&&performance.now()-tFin>2600)montrerResultat();
  }
  function tirerObjet(k){/* les derniers ont plus de mistral, les premiers plus de savon */const pl=k.place||3,r=Math.random();
    if(pl>=4)return r<.45?'mistral':r<.8?'sardine':'savon';if(pl===1)return r<.5?'savon':r<.8?'sardine':'mistral';return r<.4?'sardine':r<.7?'savon':'mistral';}
  function utiliser(k){const o=k.obj;if(!o)return;k.obj=null;if(k.n===0)majObjet();
    if(o==='mistral'){k.boost=Math.max(k.boost,1.5);k.boostF=1.5;if(k.n===0){cri('Coup de mistral !','le vent te pousse',' or',1.2);son.bip(300,.4,'sawtooth',.05);vibrer(20);}}
    if(o==='sardine'){proj.push({x:k.x+Math.sin(k.ang)*10,y:k.y-Math.cos(k.ang)*10,vx:Math.sin(k.ang)*270,vy:-Math.cos(k.ang)*270,ang:k.ang,idx:k.idx,vie:2.6,de:k});if(k.n===0)son.bip(700,.12,'triangle',.06);}
    if(o==='savon'){savons.push({x:k.x-Math.sin(k.ang)*12,y:k.y+Math.cos(k.ang)*12,vie:25,arme:.6,de:k});if(k.n===0)son.bip(500,.1,'sine',.06);}}
  function toucher(k,quoi){if(k.spin>0)return;k.spin=1.05;k.v*=.35;k.drift=0;k.charge=0;
    if(k.n===0){cri(quoi==='savon'?'Glissade !':'Une sardine !',quoi==='savon'?'un savon de Marseille sur la piste':'en plein dans le kart',' b',1.3);vibrer([30,40,30]);son.bip(160,.3,'sawtooth',.07);}}
  function eclats(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=20+Math.random()*50;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vie:.35+Math.random()*.3,col});}}
  function piloter(k,dt,now){
    const N_=N;k.idx=plusProche(P,k.x,k.y,k.idx,24);
    /* le tour : on passe la ligne (index qui retombe près de zéro) */
    const avant=k.vu;k.vu=k.idx;
    if(avant<N_*.25&&k.idx>N_*.75)k.tour--;          /* on a reculé sur la ligne */
    if(avant>N_*.75&&k.idx<N_*.25){k.tour++;const tt=now-(k.tTour||0);if(k.tour>1){k.dernierTour=tt;if(!k.meilleurTour||tt<k.meilleurTour)k.meilleurTour=tt;}k.tTour=now;
      if(k.tour>TOURS&&!k.fini){k.fini=1;k.tFini=now;finis.push(k);}
      else if(k.n===0&&k.tour===TOURS&&ETAT==='course'){cri('Dernier tour !','',' or',1.6);son.bip(990,.15,'square',.05);setTimeout(()=>son.bip(990,.15,'square',.05),180);}
      else if(k.n===0&&k.tour>1&&k.tour<TOURS)cri('Tour '+k.tour+' / '+TOURS,'tour bouclé en '+chrono(tt),'',1.4);}
    const p=P[k.idx],dl=(k.x-p.x)*(-p.ty)+(k.y-p.y)*p.tx,d=Math.abs(dl);
    let dir=0,veutDrift=false;
    if(k.fini&&k.n===0){/* après l'arrivée : on lève le pied, le pilote automatique ramène le kart */}
    if(k.n===0&&!k.fini&&!window.__AUTO_K){dir=(IN.d?1:0)-(IN.g?1:0);veutDrift=IN.drift;}
    else{/* le pilote : il vise un point devant, sur sa ligne */const la=Math.round(10+k.v/9),q=P[(k.idx+la)%N_];const off=Math.max(-14,Math.min(14,k.cible-q.ks*60));
      const tx=q.x-q.ty*off,ty=q.y+q.tx*off;const want=Math.atan2(tx-k.x,-(ty-k.y));let da=want-k.ang;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;
      dir=Math.max(-1,Math.min(1,da*3.2));veutDrift=Math.abs(P[(k.idx+14)%N_].ks)>.09&&k.v>90;
      if(k.obj){k.objT-=dt;if(k.objT<=0){const dev=K.some(o=>o!==k&&Math.hypot(o.x-k.x,o.y-k.y)<50);if(k.obj!=='sardine'||dev)utiliser(k);else k.objT=.5;}}
      if(Math.random()<dt*.25)k.cible=(Math.random()-.5)*18;}
    /* la vitesse visée : élastique pour les pilotes, pour que la course reste serrée */
    let vmax=VMAX;if(k.n>0){const moi=K[0];const ec=(k.tour*N_+k.idx)-(moi.tour*N_+moi.idx);vmax*=k.skill*(ec>60?.9:ec<-90?1.07:1);if(k.fini)vmax*=.6;}
    if(k.n===0&&k.fini)vmax*=.45;
    if(d>HW-3)vmax*=.58;            /* les roues dans le gravier */
    if(k.boost>0){k.boost-=dt;vmax*=1.42;if(Math.random()<.8)parts.push({x:k.x-Math.sin(k.ang)*10+(Math.random()-.5)*3,y:k.y+Math.cos(k.ang)*10+(Math.random()-.5)*3,vx:-Math.sin(k.ang)*30,vy:Math.cos(k.ang)*30,vie:.18,col:Math.random()<.5?'#ffb43a':'#fff2a8'});}
    if(k.spin>0){k.spin-=dt;k.v+=(0-k.v)*Math.min(1,dt*3);k.rendu=(k.rendu||0)+dt*14;}else k.rendu=0;
    if(k.spin<=0)k.v+=(vmax-k.v)*Math.min(1,dt*(k.v<vmax?1.05:2.2));
    /* le dérapage */
    const vf=Math.min(1,Math.max(.25,k.v/VMAX));
    if(veutDrift&&!k.drift&&dir!==0&&k.v>60&&k.spin<=0){k.drift=dir;k.charge=0;if(k.n===0)son.bip(220,.08,'square',.04);}
    if(k.drift&&(!veutDrift||k.v<45||k.spin>0)){/* on lâche : le turbo selon la charge */
      if(k.charge>1.6){k.boost=1.1;if(k.n===0){cri('Turbo orange !','',' or',.9);vibrer(25);son.bip(520,.25,'sawtooth',.05);}}
      else if(k.charge>.7){k.boost=.6;if(k.n===0){cri('Turbo !','',' or',.7);vibrer(15);son.bip(420,.2,'sawtooth',.05);}}
      k.drift=0;k.charge=0;}
    let rot;
    if(k.drift){rot=(k.drift*1.55+dir*1.05)*vf;k.charge+=dt*(dir===k.drift?1.25:.6);k.slip+=((-k.drift*.42)-k.slip)*Math.min(1,dt*5);k.v*=1-dt*.06;
      /* étincelles et traces */const lvl=k.charge>1.6?'#ffb43a':k.charge>.7?'#7ac8ff':'#e8e4da';
      for(const s of [-1,1]){const rx=k.x-Math.sin(k.ang)*7+Math.cos(k.ang)*s*6,ry=k.y+Math.cos(k.ang)*7+Math.sin(k.ang)*s*6;gm.fillStyle='rgba(20,20,24,.16)';gm.fillRect(Math.round(rx),Math.round(ry),1,1);
        if(Math.random()<.5)parts.push({x:rx,y:ry,vx:(Math.random()-.5)*30-Math.sin(k.ang)*20,vy:(Math.random()-.5)*30+Math.cos(k.ang)*20,vie:.22,col:lvl});}}
    else{rot=dir*2.5*vf;k.slip+=(0-k.slip)*Math.min(1,dt*6);}
    if(k.spin>0)rot=0;
    k.ang+=rot*dt;
    const ha=k.ang+k.slip;k.x+=Math.sin(ha)*k.v*dt;k.y-=Math.cos(ha)*k.v*dt;
    /* le mur de pneus : on recolle le kart à la piste */
    const i2=plusProche(P,k.x,k.y,k.idx,24),p2=P[i2],l2=(k.x-p2.x)*(-p2.ty)+(k.y-p2.y)*p2.tx;
    if(Math.abs(l2)>HW+1){const s=Math.sign(l2);k.x=p2.x-p2.ty*s*(HW+1);k.y=p2.y+p2.tx*s*(HW+1);
      /* l'angle se redresse dans l'axe de la piste */const ta=Math.atan2(p2.tx,-p2.ty);let da=ta-k.ang;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;k.ang+=da*.35;
      if(k.v>50){if(k.n===0){vibrer(18);son.bip(90,.15,'square',.07);}eclats(k.x-p2.ty*s*6,k.y+p2.tx*s*6,'#2a2a2e',5);}k.v*=.62;k.drift=0;k.charge=0;}
    if(d>HW-3&&k.v>40&&Math.random()<.35)parts.push({x:k.x,y:k.y+3,vx:(Math.random()-.5)*16,vy:(Math.random()-.5)*16,vie:.4,col:'#d2c4a6'});
  }
  /* ---------------- le dessin ---------------- */
  function dessiner(ts){
    const moi=K[0];if(!moi)return;
    const vx=moi.x+Math.sin(moi.ang)*30,vy=moi.y-Math.cos(moi.ang)*30-AH*.08;
    cam.x+=(vx-AW/2-cam.x)*.12;cam.y+=(vy-AH*.55-cam.y)*.12;
    cam.x=Math.max(0,Math.min(KW-AW,cam.x));cam.y=Math.max(-40,Math.min(KH-AH+40,cam.y));if(KW<AW)cam.x=(KW-AW)/2;
    const cx=Math.round(cam.x),cy=Math.round(cam.y);
    g.fillStyle='#1d4e54';g.fillRect(0,0,AW,AH);
    g.drawImage(monde.c,-cx,-cy);g.drawImage(marques,-cx,-cy);
    /* les reflets qui bougent sur l'eau */
    g.fillStyle='rgba(120,170,165,.55)';for(let i=0;i<40;i++){const x=(hs(i,1)*KW*.2+((ts*6+i*13)%20))|0,y=(hs(i,2)*KH)|0;if(x<rive(y)-54)g.fillRect(x-cx,y-cy,3,1);}
    /* les caisses ? */
    for(const o of objets){if(o.t>0)continue;const b=Math.round(Math.sin(ts*4+o.x)*1);const x=Math.round(o.x-cx),y=Math.round(o.y-cy)+b;
      g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-3,y+4-b,9,3);g.fillStyle='#5a3418';g.fillRect(x-5,y-5,10,10);g.fillStyle='#b07a3c';g.fillRect(x-4,y-4,8,8);g.fillStyle='#d09a54';g.fillRect(x-4,y-4,8,1);
      g.fillStyle='#ffe27a';g.fillRect(x-2,y-3,4,1);g.fillRect(x+1,y-2,1,2);g.fillRect(x-1,y,2,1);g.fillRect(x-1,y+2,2,1);}
    for(const s of savons){const x=Math.round(s.x-cx),y=Math.round(s.y-cy);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-2,y,6,3);g.fillStyle='#e8dcae';g.fillRect(x-3,y-2,6,4);g.fillStyle='#f8f0d0';g.fillRect(x-3,y-2,6,1);
      g.fillStyle='#ffffff';g.fillRect(x+3,y-4,1,1);g.fillRect(x-4,y-3,1,1);g.fillRect(x+1,y-5+Math.round(Math.sin(ts*5)),1,1);}
    /* les karts : ombre puis carrosserie */
    const tri=K.slice().sort((a,b)=>a.y-b.y);
    for(const k of tri){const a=k.ang+(k.spin>0?k.rendu:0)+k.slip*.6;const i=((Math.round(a/(Math.PI*2)*NDIR)%NDIR)+NDIR)%NDIR;const sp=SK[k.n][i],om=SK.ombre[i];
      g.globalAlpha=.32;g.drawImage(om,Math.round(k.x-cx-om.r+2),Math.round(k.y-cy-om.r+2));g.globalAlpha=1;g.drawImage(sp,Math.round(k.x-cx-sp.r),Math.round(k.y-cy-sp.r));
      if(k.n===0&&ETAT!=='menu'){g.fillStyle='#d8bf6a';const y=Math.round(k.y-cy-sp.r-4);g.fillRect(Math.round(k.x-cx)-1,y,3,1);g.fillRect(Math.round(k.x-cx),y+1,1,1);}}
    for(const s of proj){const i=((Math.round(s.ang/(Math.PI*2)*16)%16)+16)%16,sp=SS[i];g.drawImage(sp,Math.round(s.x-cx-sp.r),Math.round(s.y-cy-sp.r));}
    for(const p of parts){g.fillStyle=p.col;g.fillRect(Math.round(p.x-cx),Math.round(p.y-cy),1,1);}
    g.drawImage(dessus,-cx,-cy);
    /* les feux du départ */
    if(ETAT==='grille'||ETAT==='course'){const r=(performance.now()-t0)/1000;const [fx,fy]=dessus.feux;for(let i=0;i<5;i++){const on=ETAT==='grille'?(i<Math.min(5,Math.floor(r*5/3)+1)):false;
      g.fillStyle=ETAT==='course'?(performance.now()-t0<1500?'#4ae070':'#2a3a2a'):(on?'#ff3a2a':'#3a2020');g.fillRect(Math.round(fx+i*7-cx),Math.round(fy-cy),3,3);}}
    /* la mini-carte */
    if(ETAT!=='menu')miniCarte();
  }
  let MINI=null;
  function miniCarte(){const w=52,h=Math.round(w*KH/KW*.62),sx=w/KW,sy=h/KH,x0=AW-w-6,y0=Math.round(AH*.17);
    if(!MINI){MINI=document.createElement('canvas');MINI.width=w;MINI.height=h;const m=MINI.getContext('2d');m.fillStyle='rgba(8,14,8,.62)';m.fillRect(0,0,w,h);
      m.fillStyle='rgba(216,191,106,.35)';m.fillRect(0,0,w,1);m.fillRect(0,h-1,w,1);m.fillRect(0,0,1,h);m.fillRect(w-1,0,1,h);
      m.fillStyle='rgba(238,243,228,.55)';for(const p of P){m.fillRect(Math.round(p.x*sx),Math.round(p.y*sy),1,1);}}
    g.drawImage(MINI,x0,y0);for(let i=K.length-1;i>=0;i--){const k=K[i];g.fillStyle=k.pl.b;const s=k.n===0?3:2;g.fillRect(Math.round(x0+k.x*sx-s/2),Math.round(y0+k.y*sy-s/2),s,s);}}
  /* ---------------- les bandeaux ---------------- */
  let hautCle='';
  function majHaut(now){const moi=K[0];const cle=[moi.place,Math.min(moi.tour,TOURS),Math.floor(now/100)].join();if(cle===hautCle)return;hautCle=cle;
    const d=Rt.haut;const pl=moi.place||1;
    d.querySelector('.s').innerHTML=pl+'<u>/</u>'+K.length;d.querySelector('.r i').textContent=Math.max(1,Math.min(moi.tour,TOURS))+' / '+TOURS;
    d.querySelector('.m').textContent=chrono(now)+(moi.meilleurTour?' · MEILLEUR TOUR '+chrono(moi.meilleurTour):'');
    const jg=Rt.pied.querySelector('.jg i');if(jg){const c=moi.drift?Math.min(1,moi.charge/1.6):moi.boost>0?1:0;jg.style.width=Math.round(c*100)+'%';jg.className=moi.drift?(moi.charge>1.6?'orange':moi.charge>.7?'bleu':''):moi.boost>0?'orange':'';}
    const w=Rt.pied.querySelector('.w');if(w)w.textContent=Math.round(moi.v*.55)+' km/h';}
  function majObjet(){const b=Rt.pied.querySelector('.obj');if(!b)return;const o=K[0].obj;b.textContent=o==='sardine'?'🐟':o==='savon'?'🧼':o==='mistral'?'🌬️':'·';b.classList.toggle('vide',!o);}
  function habiller(){
    Rt.haut.style.display='';Rt.pied.style.display='';
    Rt.haut.innerHTML='<div class="d"><div class="j"><b>PLACE</b><i style="font-size:13px;font-family:Arial;color:#cfd8c6">'+echap(ctx.pseudo||'Toi')+'</i></div><div class="c"><div class="s">1<u>/</u>6</div></div>'+
      '<div class="j r"><b>TOUR</b><i>1 / 3</i></div></div><span class="t">LE QUAI · GRAND PRIX'+(course&&course.id?' · COURSE À 5 €':' · ENTRAÎNEMENT')+'</span><span class="m">0:00.00</span>';
    const fl=(d)=>'<svg width="28" height="28" viewBox="0 0 24 24"><path d="'+(d<0?'M15 4 7 12l8 8':'m9 4 8 8-8 8')+'" fill="none" stroke="#eef3e4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    Rt.pied.innerHTML='<div class="bas"><span>TURBO</span><div class="jg"><i></i></div><span class="w">0 km/h</span></div>'+
      '<div class="cmd"><button data-k="g" aria-label="Gauche">'+fl(-1)+'</button><button data-k="d" aria-label="Droite">'+fl(1)+'</button><button class="or" data-k="drift">DRIFT</button><button class="obj vide" data-k="obj">·</button></div>';
    tenir(Rt.pied.querySelector('[data-k=g]'),()=>IN.g=true,()=>IN.g=false);tenir(Rt.pied.querySelector('[data-k=d]'),()=>IN.d=true,()=>IN.d=false);
    tenir(Rt.pied.querySelector('[data-k=drift]'),()=>IN.drift=true,()=>IN.drift=false);
    tenir(Rt.pied.querySelector('[data-k=obj]'),()=>{if(ETAT==='course')utiliser(K[0]);},null);
    const placer=()=>{Rt.cri.style.top=(Rt.haut.offsetHeight)+'px';Rt.d.style.setProperty('--pied',Rt.pied.offsetHeight+'px');};Rt.d.classList.add('course');placer();setTimeout(placer,50);}
  /* clavier, pour l'ordinateur */
  const clav=(ev,v)=>{if(!Rt.d.classList.contains('on'))return;const k=ev.key;if(k==='ArrowLeft'||k==='q'||k==='a')IN.g=v;else if(k==='ArrowRight'||k==='d')IN.d=v;else if(k===' '||k==='Shift'||k==='ArrowDown')IN.drift=v;else if(v&&(k==='ArrowUp'||k==='e'||k==='z')&&ETAT==='course')utiliser(K[0]);else return;ev.preventDefault();};
  const kd=ev=>clav(ev,true),ku=ev=>clav(ev,false);addEventListener('keydown',kd);addEventListener('keyup',ku);
  /* ---------------- départ, arrivée ---------------- */
  async function depart(payant){
    const m=Rt.menu.querySelector('.msg');course={id:null};
    if(payant){if(m)m.textContent='On paie l’engagement…';const r=await ctx.rpc('course_debut',{p_jeu:'karting'});
      if(!r||r.erreur){if(m)m.textContent=(r&&r.erreur)||'La caisse ne répond pas. Réessaie.';return;}
      course={id:r.id};if(typeof r.euros==='number')ctx.majEuros(r.euros);}
    Rt.menu.classList.remove('on');IN.g=IN.d=IN.drift=false;
    placerGrille();poserCaisses();proj=[];savons=[];parts=[];finis=[];gm.clearRect(0,0,KW,KH);ord=[];ord.cd=0;
    habiller();majObjet();cam.x=K[0].x-AW/2;cam.y=K[0].y-AH*.6;ETAT='grille';t0=performance.now();}
  let resultat=null;
  async function finir(moi){const place=moi.place,temps=Math.round(moi.tFini);cri(place===1?'Victoire !':ordinal(place)+' place','arrivée en '+chrono(temps),' or',2.4);
    son.bip(660,.15,'square',.06);setTimeout(()=>son.bip(880,.15,'square',.06),160);setTimeout(()=>son.bip(1320,.3,'square',.06),320);vibrer([40,60,40]);
    resultat={place,temps,ordre:null,srv:null};
    if(course&&course.id){resultat.srv=await ctx.rpc('course_fin',{p_id:course.id,p_place:place,p_temps_ms:temps,p_pseudo:ctx.pseudo||''});
      if(resultat.srv&&typeof resultat.srv.euros==='number')ctx.majEuros(resultat.srv.euros);}}
  function montrerResultat(){if(ETAT==='resultat')return;ETAT='resultat';son.moteur(0);
    const moi=K[0];const ordre=K.slice().sort((a,b)=>(b.fini-a.fini)||(a.fini?a.tFini-b.tFini:b.prog-a.prog));const s=resultat&&resultat.srv;
    let h='<div class="ti">LE QUAI · GRAND PRIX</div><h2>'+(moi.place===1?'Victoire !':ordinal(moi.place)+' place')+'</h2><p class="so">'+chrono(moi.tFini)+(moi.meilleurTour?' · meilleur tour '+chrono(moi.meilleurTour):'')+'</p>';
    if(course&&course.id){if(s&&!s.erreur){h+='<div class="gain">'+(s.gain?'+ '+fr(s.gain):'0 €')+'</div><p class="so">'+(s.gain?'versés sur ton compte':'pas de gain cette fois : il faut finir dans les quatre premiers')+(s.record?'<br><b style="color:#d8bf6a">Nouveau record personnel !</b>':'')+'</p>';}
      else h+='<p class="so" style="color:#ffb0a0">'+echap((s&&s.erreur)||'Le résultat n’a pas pu être enregistré.')+'</p>';}
    else h+='<p class="so">Entraînement : pas de gain, pas de record.</p>';
    h+='<div class="pod">'+ordre.map((k,i)=>'<div class="'+(k.n===0?'moi':'')+'"><i>'+(i+1)+'</i><q style="background:'+k.pl.b+'"></q><span>'+(k.n===0?echap(ctx.pseudo||'Toi'):k.pl.nom)+'</span><em>'+(k.fini?chrono(k.tFini):'—')+'</em></div>').join('')+'</div>';
    h+='<div class="deux"><button data-a="menu">LE MENU</button><button class="or" data-a="re">'+(course&&course.id?'REJOUER · 5 €':'REJOUER')+'</button></div>';
    Rt.menu.innerHTML=h+'<div class="msg"></div>';Rt.menu.classList.add('on');Rt.haut.style.display='none';Rt.pied.style.display='none';Rt.cri.classList.add('cache');Rt.d.classList.remove('course');
    Rt.menu.querySelector('[data-a=menu]').onclick=()=>menu();Rt.menu.querySelector('[data-a=re]').onclick=()=>depart(!!(course&&course.id));}
  async function menu(){ETAT='menu';son.moteur(0);Rt.d.classList.remove('course');Rt.haut.style.display='none';Rt.pied.style.display='none';Rt.cri.classList.add('cache');
    placerGrille();poserCaisses();cam.x=K[0].x-AW/2;cam.y=K[0].y-AH*.55;
    Rt.menu.innerHTML='<div class="ti">LE VIEUX-PORT · KARTING</div><h2>Le Grand Prix du Quai</h2><p class="so">Six karts, trois tours sur le quai. Tiens <b>DRIFT</b> dans les virages pour charger le turbo, ramasse les caisses, et garde tes sardines pour celui de devant.</p>'+
      '<button class="ved" data-a="paye"><small>COURSE À 5 €</small><b>Le Grand Prix</b><em>1er : 20 € · 2e : 12 € · 3e : 7 € · 4e : 3 €</em><span class="go">5 €</span></button>'+
      '<button class="ved gris" data-a="entr"><small>GRATUIT</small><b>Entraînement</b><em>la même course, sans gain ni record</em><span class="go">ROULER</span></button><div class="msg"></div>'+
      '<div class="rub">LES MEILLEURS TEMPS</div><div class="cl"><div class="vide">Chargement…</div></div>'+
      '<div class="rub">LES COMMANDES</div><div class="regle"><b>◀ ▶</b> tourner · <b>DRIFT</b> tenu dans un virage : le kart glisse, les étincelles passent du blanc au <b style="color:#7ac8ff">bleu</b> puis à l’<b style="color:#ffb43a">orange</b> — lâche pour le turbo.<br>'+
      '<b>🐟 Sardine</b> : file sur celui de devant · <b>🧼 Savon</b> : posé derrière toi · <b>🌬️ Mistral</b> : un coup de vent dans le dos.</div>';
    Rt.menu.classList.add('on');
    Rt.menu.querySelector('[data-a=paye]').onclick=()=>depart(true);Rt.menu.querySelector('[data-a=entr]').onclick=()=>depart(false);
    const [cl,mr]=await Promise.all([ctx.rpc('course_classement',{p_jeu:'karting'}),ctx.rpc('course_mes_records',{})]);
    const box=Rt.menu.querySelector('.cl');if(!box||ETAT!=='menu')return;
    if(Array.isArray(cl)&&cl.length)box.innerHTML=cl.map((r,i)=>'<div class="'+(r.moi?'moi':'')+'"><i>'+(i+1)+'</i><span>'+echap(r.pseudo)+'</span><em>'+chrono(r.ms)+'</em></div>').join('');
    else box.innerHTML='<div class="vide">Personne n’a encore couru. La première place est libre.</div>';
    if(mr&&!mr.erreur){const v=Rt.menu.querySelector('[data-a=paye] em');if(v&&typeof mr.restant_karting==='number')v.textContent+=' · '+Math.max(0,mr.restant_karting)+' course'+(mr.restant_karting>1?'s':'')+' aujourd’hui';}}
  function fermer(){cancelAnimationFrame(anim);son.stop();son.moteur(0);Rt.d.classList.remove('on');removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('resize',cadrer);Rt.fer.onclick=null;try{ctx.fermer&&ctx.fermer();}catch(x){}}
  Rt.fer.onclick=fermer;Rt.d.classList.add('on');menu();dernier=0;anim=requestAnimationFrame(boucle);
  return {fermer,_dbg:()=>({K,P,ETAT,IN,objets,course,cam,AW,AH})};
}

/* =====================================================================
   LA DESCENTE DES CALANQUES
   ===================================================================== */
const KPILOTES=[
  {nom:'Toi',b:'#e8761e',B:'#ffa050',j:'#ffd21a',h:'#e8344a',H:'#ff7a8a'},
  {nom:'Marius',b:'#2a6ad8',B:'#5a8af0',j:'#ffd21a',h:'#f4f4f4',H:'#ffffff'},
  {nom:'Fanny',b:'#2ac84a',B:'#6ae07a',j:'#e82a2a',h:'#222226',H:'#4a4a52'},
  {nom:'Escartefigue',b:'#c83ad8',B:'#e070f0',j:'#2ac8f0',h:'#f4f4f4',H:'#ffffff'},
  {nom:'Panisse',b:'#f2f2ee',B:'#ffffff',j:'#e8344a',h:'#2a6ad8',H:'#5a8af0'},
];
/* le kayak dessiné à l'angle voulu, la pagaie à part (elle bouge) */
function spriteKayak(pl,ang){const L=36,S=47,T=Toile(S,S),c0=23,ca=Math.cos(ang),sa=Math.sin(ang);
  const coque=(u,v)=>{const t=(v+L/2)/L;if(t<0||t>1)return null;const hw=4.6*Math.pow(Math.sin(Math.PI*t),.62);if(Math.abs(u)>hw)return null;
    if(Math.abs(u)>hw-1)return '#1a1a1e';if(Math.abs(v-1)<5.2&&Math.abs(u)<3.2)return (Math.abs(v-1)>4.4||Math.abs(u)>2.4)?'#141418':'#24242a';return u<.6?pl.B:pl.b;};
  for(let y=-c0;y<=c0;y++)for(let x=-c0;x<=c0;x++){const cnt={};let n=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const X=x+a/3,Y=y+b/3;const q=coque(ca*X+sa*Y,-sa*X+ca*Y);if(q){cnt[q]=(cnt[q]||0)+1;n++;}}
    if(n<5)continue;let best=null,bn=0;for(const q in cnt)if(cnt[q]>bn){bn=cnt[q];best=q;}T.P(x+c0,y+c0,best);}
  const c=T.fin();c.r=c0;return c;}
function ombreKayak(ang){const L=36,S=47,T=Toile(S,S),c0=23,ca=Math.cos(ang),sa=Math.sin(ang);
  for(let y=-c0;y<=c0;y++)for(let x=-c0;x<=c0;x++){const u=ca*x+sa*y,v=-sa*x+ca*y,t=(v+L/2)/L;if(t<0||t>1)continue;if(Math.abs(u)<=4.6*Math.pow(Math.sin(Math.PI*t),.62))T.P(x+c0,y+c0,'#000000');}
  const c=T.fin();c.r=c0;return c;}
let SPR_KAY=null;
function spritesKayak(){if(SPR_KAY)return SPR_KAY;SPR_KAY=KPILOTES.map(pl=>{const a=[];for(let i=0;i<NDIR;i++)a.push(spriteKayak(pl,i/NDIR*Math.PI*2));return a;});
  SPR_KAY.ombre=[];for(let i=0;i<NDIR;i++)SPR_KAY.ombre.push(ombreKayak(i/NDIR*Math.PI*2));return SPR_KAY;}
/* le pagayeur et sa pagaie, dessinés à la main chaque image (la pagaie tourne au rythme) */
function pagayeur(g,cx,cy,ang,coup,pl){const R=(x,y,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1);};
  const ca=Math.cos(ang),sa=Math.sin(ang),pa=ang+coup,pc=Math.cos(pa),ps=Math.sin(pa),Lp=15;
  const bx=cx-sa*-1,by=cy+ca*1;
  for(let t=-Lp;t<=Lp;t+=.5)R(cx+pc*t+sa,cy+ps*t-ca,'#2a2b30');
  for(const sd of [-1,1])for(let t=Lp-1;t<=Lp+4;t+=.5)for(let w=-1.5;w<=1.5;w+=.5)R(cx+pc*t*sd-ps*w+sa,cy+ps*t*sd+pc*w-ca,(t>Lp+3||Math.abs(w)>1.2)?'#c8c8c0':'#f4f4ec');
  for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){const u=ca*x+sa*y,v=-sa*x+ca*y,e=(u*u)/12+(v*v)/7;if(e<=1)R(bx+x,by+y,e>.72?'#1a1a1e':(u<-1&&v<0?'#ffffff':pl.j));}
  for(const sd of [-1,1]){const gx=cx+pc*6*sd+sa,gy=cy+ps*6*sd-ca;const x0=bx+ca*3*sd,y0=by+sa*3*sd;for(let t=0;t<=1;t+=.12)R(x0+(gx-x0)*t,y0+(gy-y0)*t,'#e6b48c');R(gx,gy,'#1a1a1e');}
  for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)if(x*x+y*y<=6.5){const u=ca*x+sa*y,v=-sa*x+ca*y;R(bx+x,by+y,v<-1.4?'#1e2a38':(u<-.5&&v<.5?pl.H:pl.h));}}

function kayak(ctx){
  const Rt=racine(),son=Son();
  const toile=Rt.toile,g=toile.getContext('2d');
  let S=2,AW=195,AH=422;
  function cadrer(){const W=innerWidth,H=(window.visualViewport?visualViewport.height:innerHeight);S=W>=640?3:2;AW=Math.ceil(W/S);AH=Math.ceil(H/S);
    toile.width=AW;toile.height=AH;toile.style.width=AW*S+'px';toile.style.height=AH*S+'px';g.imageSmoothingEnabled=false;}
  cadrer();
  const SKY=spritesKayak();
  const LONG=3400;            /* la longueur de la descente, en pixels de dessin */
  let MW=0,MH=LONG+520,monde=null,graine=1,berges=null,rochers=[],portes=[],ARR=0;
  /* ---------------- la calanque, tirée de la graine ---------------- */
  function rnd(){graine=(graine*16807)%2147483647;return (graine-1)/2147483646;}
  function batir(seed){graine=(seed%2147483646)+1;MW=Math.max(AW,195);const cxm=MW/2;
    const ph=[rnd()*9,rnd()*9,rnd()*9,rnd()*9];
    berges=new Float32Array(MH*2);
    for(let y=0;y<MH;y++){const p=y/MH;const larg=58+22*Math.sin(y/260+ph[0])+10*Math.sin(y/97+ph[1])+(y<300?18:0)+(y>MH-260?-8:0);
      const mil=cxm+22*Math.sin(y/330+ph[2])+9*Math.sin(y/130+ph[3]);berges[y*2]=mil-larg+6*Math.sin(y/17+ph[0]);berges[y*2+1]=mil+larg+5*Math.sin(y/13+ph[1]);}
    /* l'arrivée en haut : la calanque s'ouvre sur la mer */
    ARR=260;for(let y=0;y<ARR;y++){const t=y/ARR;berges[y*2]-=(1-t)*(1-t)*80;berges[y*2+1]+=(1-t)*(1-t)*80;}
    const bG=y=>berges[Math.max(0,Math.min(MH-1,y|0))*2],bD=y=>berges[Math.max(0,Math.min(MH-1,y|0))*2+1];
    /* les portes : une paire de bouées tous les 260 px, décalées gauche/droite */
    portes=[];let k=0;for(let y=MH-420;y>ARR+140;y-=250){const a=bG(y)+12,b=bD(y)-12,w=b-a;const larg=Math.min(44,w*.55);const c=a+larg/2+rnd()*(w-larg);
      portes.push({y,x1:c-larg/2,x2:c+larg/2,n:k++,passe:0,col:k%2?'#ff6a1a':'#ffd21a'});}
    /* les rochers : jamais dans une porte */
    rochers=[];for(let y=MH-520;y>ARR+80;y-=70+rnd()*80){const a=bG(y)+10,b=bD(y)-10;const x=a+rnd()*(b-a),r=3+Math.floor(rnd()*4);
      if(portes.some(p=>Math.abs(p.y-y)<30))continue;rochers.push({x,y,r});}
    /* le dessin */
    const T=Toile(MW,MH);
    const TURQ=['#0e5a72','#167a8e','#1e9aa6','#38b8b8','#6ad0c4','#9ae2d0'],ROC=['#8a8478','#a8a294','#c4beb0','#dcd6c8','#eeeae0'],PIN=['#1e3a1a','#2a4e22','#3a6a2c','#4e8236'];
    for(let y=0;y<MH;y++){const a=bG(y),b=bD(y);for(let x=0;x<MW;x++){
      if(x>a&&x<b){const d=Math.min(x-a,b-x);let v=1-Math.min(1,d/34)+(marbre(x,y,30)-.5)*.35;if(y<ARR)v-= (1-y/ARR)*.5;if(lisse(x,y,9,31)>.66&&d<30)v+=.18;
        if(hs(Math.floor(x/6),Math.floor(y/3),32)<.06&&x%6<4&&y%3===0)v=1;T.P(x,y,tone(x,y,v,TURQ));}
      else{const d=x<=a?a-x:x-b;let v=.55+(marbre(x,y,33)-.5)*.9-(d<3?.35:0);if(Math.abs(lisse(x,y,7,34)-.5)<.03)v=.05;T.P(x,y,tone(x,y,v,ROC));}}}
    for(let y=0;y<MH;y++){for(const [e,s] of [[bG(y),1],[bD(y),-1]]){const x=Math.round(e)+s;if(bay(x,y)<.8)T.P(x,y,'#f2fbf6');if(bay(x+s,y)<.4)T.Pa(x+s,y,'#e0f6f0',.7);if(bay(x+2*s,y)<.15)T.Pa(x+2*s,y,'#e0f6f0',.5);}
      const a=Math.round(bG(y));for(let k=1;k<10;k++)if(bay(a+k,y)<.85-k*.08)T.dk(a+k,y,.22);}
    const pin=(x,y,r)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const dd=i*i+j*j;if(dd>r*r+r)continue;if(hs(x+i,y+j,40)<.12&&dd>r*r*.5)continue;T.P(x+i,y+j,tone(x+i,y+j,.75-(i+j)/(r*2.6)+(hs(x+i,y+j,41)-.5)*.4,PIN));}
      for(let k=0;k<r+2;k++)for(let j=-r+1;j<r;j++)if(bay(x+r+k,y+j+k)<.5)T.dk(x+r+k-1,y+j+k+1,.3);};
    for(let i=0;i<MH/12;i++){const y=Math.round(rnd()*MH),left=rnd()<.5;const e=left?bG(y):bD(y);const x=left?Math.round(e-12-rnd()*30):Math.round(e+12+rnd()*30);if(x>2&&x<MW-2)pin(x,y,3+Math.floor(rnd()*3));}
    for(const r of rochers){T.C(r.x|0,r.y|0,r.r,'#8a8478');T.C((r.x|0)-1,(r.y|0)-1,r.r-1,'#b4aea0');T.P((r.x|0)-1,(r.y|0)-r.r+1,'#eeeae0');
      for(let a=0;a<24;a++)T.Pa(r.x+Math.cos(a/24*6.28)*(r.r+2),r.y+Math.sin(a/24*6.28)*(r.r+1.4),'#f2fbf6',.65);}
    /* la ligne d'arrivée : un damier flottant entre deux grosses bouées */
    const ay=ARR;const xa=Math.round(bG(ay)+6),xb=Math.round(bD(ay)-6);for(let x=xa;x<xb;x++)for(let j=0;j<3;j++)T.P(x,ay+j,((Math.floor(x/2)+j)%2)?'#f4f4f0':'#1a1a1e');
    /* le départ : une petite plage de galets au bas */
    for(let y=MH-150;y<MH;y++){const a=bG(y),b=bD(y);for(let x=Math.floor(a);x<b;x++){if(y>MH-120+6*Math.sin(x/9))T.P(x,y,tone(x,y,.4+(hs(x,y,50)-.5)*.8,['#a8a294','#c4beb0','#dcd6c8','#eeeae0']));}}
    monde=T.fin();
    return {bG,bD};}
  let B=null;
  /* ---------------- les kayaks ---------------- */
  let KY=[],ETAT='menu',t0=0,dernier=0,anim=0,msgT=0,parts=[],course=null,cam=0,tFin=0,resultat=null;
  const ACC=22,TRAINE=.5,RY={ideal:.42,min:.26,max:.62};
  function placer(){KY=KPILOTES.map((pl,n)=>{const y=MH-135-(n%2)*14,a=B.bG(y)+14,b=B.bD(y)-14;const x=a+(b-a)*(n+.5)/KPILOTES.length;
    return {n,pl,x,y,ang:0,v:0,rot:0,cote:0,dernier:-9,coup:0,coupT:0,energie:1,combo:0,pen:0,porte:0,fini:0,tFini:0,choc:0,
      skill:n?[0,.93,.96,.9,.95][n]:1,phase:Math.random(),lane:(Math.random()-.5)*.5};});}
  function cri(b,em,cl,dur){Rt.cri.className=cl||'';Rt.cri.querySelector('b').textContent=b;Rt.cri.querySelector('em').textContent=em||'';msgT=dur||1.4;}
  /* un coup de pagaie : du côté gauche, la pointe part à droite, et inversement */
  function pagayer(k,cote,now){if(k.fini||ETAT!=='course')return;
    const dtc=(now-k.dernier)/1000;let q;
    if(cote===k.cote&&dtc<1.2){q='meme';}else if(dtc<RY.min){q='vite';}else if(dtc<=RY.max){q=Math.abs(dtc-RY.ideal)<.07?'parfait':'bien';}else q='lent';
    let imp=q==='parfait'?1.3:q==='bien'?1:q==='lent'?.85:q==='meme'?.55:.45;
    imp*=.45+.55*k.energie;if(k.n>0)imp*=k.skill;
    k.energie=Math.max(0,k.energie-(q==='vite'?.12:q==='meme'?.03:.035));
    if(q==='parfait')k.combo++;else if(q!=='bien')k.combo=0;
    imp*=1+Math.min(5,k.combo)*.03;
    k.v=Math.min(130,k.v+ACC*imp);
    /* le cap : un coup à gauche pousse la pointe à droite */
    k.rot+=(cote<0?1:-1)*(q==='meme'?.95:.5);
    k.cote=cote;k.dernier=now;k.coup=cote;k.coupT=.28;
    /* éclaboussure du côté de la pale */
    const sx=k.x+Math.cos(k.ang)*cote*14,sy=k.y+Math.sin(k.ang)*cote*14;for(let i=0;i<6;i++)parts.push({x:sx,y:sy,vx:(Math.random()-.5)*30,vy:(Math.random()-.5)*30+20,vie:.3+Math.random()*.2,col:'#ffffff'});
    if(k.n===0){son.plouf();vibrer(q==='vite'?[10,30,10]:8);
      if(q==='parfait'&&k.combo>=2)cri('Parfait ×'+k.combo,'garde ce rythme','a',.9);
      else if(q==='vite')cri('Trop vite !','tu t’épuises : laisse glisser','b',1);
      else if(q==='meme')cri('Double coup','pour tourner : deux fois du même côté','',.8);
      majRythme();}}
  /* ---------------- la boucle ---------------- */
  function boucle(t){if(!Rt.d.classList.contains('on')){son.stop();return;}anim=requestAnimationFrame(boucle);let dt=Math.min(.05,(t-(dernier||t))/1000);dernier=t;
    if(ETAT==='grille'||ETAT==='course'||ETAT==='fin2')pas(dt);dessiner(t/1000);}
  function pas(dt){
    if(ETAT==='grille'){const r=(performance.now()-t0)/1000,n=3-Math.floor(r);if(n!==pas.cd&&n>0){pas.cd=n;cri(String(n),'',' gros',1.2);son.bip(440,.18,'square',.06);vibrer(15);}
      if(r>=3){ETAT='course';t0=performance.now();cri('Partez !','gauche, droite, gauche… en rythme',' gros',1.4);son.bip(880,.35,'square',.07);vibrer(30);}return;}
    const now=performance.now()-t0;
    for(const k of KY)ramer(k,dt,now);
    for(let i=0;i<KY.length;i++)for(let j=i+1;j<KY.length;j++){const a=KY[i],b=KY[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx*1.6,dy*.6);if(d<12&&d>0){const p=(12-d)/2,ux=dx/(Math.hypot(dx,dy)||1),uy=dy/(Math.hypot(dx,dy)||1);a.x-=ux*p;a.y-=uy*p;b.x+=ux*p;b.y+=uy*p;}}
    for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.92;p.vy*=.92;p.vie-=dt;}for(let i=parts.length-1;i>=0;i--)if(parts[i].vie<=0)parts.splice(i,1);
    const ord=KY.slice().sort((a,b)=>(b.fini-a.fini)||(a.fini?(a.tFini+a.pen)-(b.tFini+b.pen):a.y-b.y));ord.forEach((k,i)=>k.place=i+1);
    if(msgT>0){msgT-=dt;if(msgT<=0)Rt.cri.classList.add('cache');}
    majHaut(now);majRythme();
    const moi=KY[0];if(ETAT==='course'&&moi.fini){ETAT='fin2';tFin=performance.now();finir();}
    if(ETAT==='fin2'&&performance.now()-tFin>2400)montrerResultat();}
  function ramer(k,dt,now){
    if((k.n>0||window.__AUTO_K)&&!k.fini){/* le pagayeur : il vise la porte suivante, rame en rythme, double quand il faut tourner */
      const p=portes.find(q=>q.y<k.y-6);const tx=p?(p.x1+p.x2)/2+(p.x2-p.x1)*k.lane*.5:(B.bG(ARR)+B.bD(ARR))/2,ty=p?p.y:ARR;
      const want=Math.atan2(tx-k.x,-(ty-k.y));let da=want-k.ang;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;
      k.ang+=Math.max(-1,Math.min(1,da*1.5))*dt*1.4;const per=RY.ideal/k.skill+(Math.sin(now/900+k.phase*6)*.03);
      if((now-k.dernier)/1000>per){let cote=-k.cote||1;if(da>.5)cote=-1;else if(da<-.5)cote=1;
        /* les pilotes ramènent toujours un peu d'imperfection */if(Math.random()<.04)cote=-cote;pagayer(k,cote,now);}}
    /* le bateau : il glisse, ralentit, et tourne selon les coups */
    k.v*=Math.pow(TRAINE,dt);if(k.v<3)k.v=0;
    k.ang+=k.rot*dt*2.6;k.rot*=Math.pow(.08,dt);
    k.ang=Math.max(-1.25,Math.min(1.25,k.ang));
    if(!k.fini)k.energie=Math.min(1,k.energie+dt*.1);
    k.x+=Math.sin(k.ang)*k.v*dt;k.y-=Math.cos(k.ang)*k.v*dt;
    if(k.coupT>0)k.coupT-=dt;
    /* les falaises, les rochers */
    const a=B.bG(k.y)+5,b=B.bD(k.y)-5;
    if(k.x<a||k.x>b){k.x=Math.max(a,Math.min(b,k.x));if(k.v>25){k.v*=.45;k.rot+=(k.x<=a?.6:-.6);if(k.n===0){vibrer(25);son.bip(110,.18,'square',.06);cri('Aïe, la falaise !','','b',.9);}
      for(let i=0;i<8;i++)parts.push({x:k.x,y:k.y,vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40,vie:.4,col:'#f2fbf6'});}}
    for(const r of rochers){const d=Math.hypot(k.x-r.x,k.y-r.y);if(d<r.r+5){const ux=(k.x-r.x)/(d||1),uy=(k.y-r.y)/(d||1);k.x=r.x+ux*(r.r+5);k.y=r.y+uy*(r.r+5);
      if(k.v>25){k.v*=.4;k.rot+=ux*.7;if(k.n===0){vibrer(25);son.bip(120,.18,'square',.06);cri('Un rocher !','','b',.9);}}}}
    /* les portes : on passe entre les deux bouées, sinon cinq secondes */
    const p=portes[k.porte];if(p&&k.y<p.y){if(k.x>p.x1&&k.x<p.x2){if(k.n===0){p.passe=1;son.bip(1046,.1,'square',.05);}}
      else{k.pen+=5000;if(k.n===0){p.passe=-1;cri('Porte ratée !','+5 secondes','b',1.2);vibrer([20,40,20]);son.bip(200,.3,'sawtooth',.06);}}k.porte++;}
    if(!k.fini&&k.y<ARR){k.fini=1;k.tFini=now;}
    if(k.fini){k.v=Math.max(k.v,30);}
    if(k.v>20&&Math.random()<k.v/140){parts.push({x:k.x-Math.sin(k.ang)*18+Math.cos(k.ang)*(Math.random()<.5?-4:4),y:k.y+Math.cos(k.ang)*18,vx:0,vy:0,vie:.9,col:'#e8fbf6',sil:1});}}
  /* ---------------- le dessin ---------------- */
  function dessiner(ts){const moi=KY[0];if(!moi||!monde)return;
    const vise=moi.y-AH*.62;cam+=(vise-cam)*.14;cam=Math.max(0,Math.min(MH-AH,cam));const cy=Math.round(cam),cx=Math.round((MW-AW)/2);
    g.fillStyle='#167a8e';g.fillRect(0,0,AW,AH);g.drawImage(monde,-cx,-cy);
    /* les vaguelettes qui bougent */
    g.fillStyle='rgba(220,250,240,.55)';for(let i=0;i<60;i++){const y=((hs(i,3)*MH+ts*14)%MH)|0;if(y<cy-4||y>cy+AH+4)continue;const x=(B.bG(y)+(B.bD(y)-B.bG(y))*hs(i,4))|0;g.fillRect(x-cx,y-cy,3,1);}
    /* les bouées */
    for(const p of portes){if(p.y<cy-20||p.y>cy+AH+20)continue;for(const x of [p.x1,p.x2]){const bx=Math.round(x-cx),by=Math.round(p.y-cy)+Math.round(Math.sin(ts*3+x)*.6);
      g.fillStyle='rgba(242,251,246,.6)';g.fillRect(bx-4,by+2,9,2);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(bx-1,by+2,5,2);
      g.fillStyle=p.passe===-1?'#8a8a8a':p.col;g.fillRect(bx-2,by-2,5,5);g.fillRect(bx-3,by-1,7,3);g.fillStyle='#ffffff';g.fillRect(bx-1,by-2,1,1);
      g.fillStyle='#2a2a2e';g.fillRect(bx,by-10,1,8);g.fillStyle=p.passe===1?'#4ae070':p.col;g.fillRect(bx+1,by-10,4,3);}
      if(p.n===KY[0].porte&&ETAT!=='menu'){g.fillStyle='rgba(255,255,255,'+(.25+.2*Math.sin(ts*6))+')';for(let x=p.x1+3;x<p.x2-3;x+=3)g.fillRect(Math.round(x-cx),Math.round(p.y-cy),1,1);}}
    /* le sillage */
    for(const p of parts)if(p.sil){g.fillStyle='rgba(232,251,246,'+(p.vie*.6).toFixed(2)+')';g.fillRect(Math.round(p.x-cx),Math.round(p.y-cy),1,1);}
    const tri=KY.slice().sort((a,b)=>a.y-b.y);
    for(const k of tri){const i=((Math.round(k.ang/(Math.PI*2)*NDIR)%NDIR)+NDIR)%NDIR,sp=SKY[k.n][i],om=SKY.ombre[i];
      g.globalAlpha=.3;g.drawImage(om,Math.round(k.x-cx-om.r+2),Math.round(k.y-cy-om.r+3));g.globalAlpha=1;g.drawImage(sp,Math.round(k.x-cx-sp.r),Math.round(k.y-cy-sp.r));
      const coup=k.coupT>0?k.coup*(.55-.25*(k.coupT/.28)):Math.sin(ts*2+k.n)*.1;pagayeur(g,k.x-cx,k.y-cy,k.ang,coup,k.pl);
      if(k.n===0&&ETAT!=='menu'){g.fillStyle='#d8bf6a';const y=Math.round(k.y-cy-26);g.fillRect(Math.round(k.x-cx)-1,y,3,1);g.fillRect(Math.round(k.x-cx),y+1,1,1);}}
    for(const p of parts)if(!p.sil){g.fillStyle=p.col;g.fillRect(Math.round(p.x-cx),Math.round(p.y-cy),1,1);}
    /* la jauge de progression, à droite */
    if(ETAT!=='menu'){const x=AW-6,y0=Math.round(AH*.2),h=Math.round(AH*.42);g.fillStyle='rgba(8,14,8,.6)';g.fillRect(x-1,y0-1,4,h+2);
      for(const k of KY){const t=1-(k.y-ARR)/(MH-135-ARR);g.fillStyle=k.pl.b;const s=k.n===0?4:2;g.fillRect(x+1-s/2,Math.round(y0+h*(1-Math.max(0,Math.min(1,t))))-s/2,s,s);}
      g.fillStyle='#f4f4f0';g.fillRect(x-1,y0-2,4,1);}}
  /* ---------------- les bandeaux ---------------- */
  let cle='';
  function majHaut(now){const moi=KY[0];const c=[moi.place,moi.porte,Math.floor(now/100),moi.pen].join();if(c===cle)return;cle=c;
    Rt.haut.querySelector('.s').innerHTML=(moi.place||1)+'<u>/</u>'+KY.length;Rt.haut.querySelector('.r i').textContent=Math.min(moi.porte,portes.length)+' / '+portes.length;
    Rt.haut.querySelector('.m').textContent=chrono(now)+(moi.pen?' · PÉNALITÉS +'+(moi.pen/1000)+' s':'');
    const en=Rt.pied.querySelector('.w');if(en)en.textContent='ÉNERGIE '+Math.round(moi.energie*100)+' %';}
  function majRythme(){const moi=KY[0];if(!moi)return;const jg=Rt.pied.querySelector('.jg');if(!jg)return;const now=performance.now()-t0;const dtc=Math.max(0,(now-moi.dernier)/1000);
    const cur=jg.querySelector('.cur');cur.style.left=Math.min(100,dtc/.8*100)+'%';
    const b=Rt.pied.querySelectorAll('.cmd button');const att=-moi.cote||0;b[0].classList.toggle('vert',att<0||att===0);b[1].classList.toggle('vert',att>0||att===0);}
  function habiller(){Rt.haut.style.display='';Rt.pied.style.display='';
    Rt.haut.innerHTML='<div class="d"><div class="j"><b>PLACE</b><i style="font-size:13px;font-family:Arial;color:#cfd8c6">'+echap(ctx.pseudo||'Toi')+'</i></div><div class="c"><div class="s">1<u>/</u>5</div></div>'+
      '<div class="j r"><b>PORTES</b><i>0 / '+portes.length+'</i></div></div><span class="t">LES CALANQUES · LA DESCENTE'+(course&&course.id?' · COURSE À 5 €':' · ENTRAÎNEMENT')+'</span><span class="m">0:00.00</span>';
    const zg=(RY.ideal-.07)/.8*100,zw=.14/.8*100;
    Rt.pied.innerHTML='<div class="bas"><span>RYTHME</span><div class="jg"><span class="zone" style="left:'+zg+'%;width:'+zw+'%"></span><span class="cur"></span></div><span class="w">ÉNERGIE 100 %</span></div>'+
      '<div class="cmd"><button data-k="g">PAGAIE<br>GAUCHE</button><button data-k="d">PAGAIE<br>DROITE</button></div>';
    tenir(Rt.pied.querySelector('[data-k=g]'),()=>pagayer(KY[0],-1,performance.now()-t0),null);tenir(Rt.pied.querySelector('[data-k=d]'),()=>pagayer(KY[0],1,performance.now()-t0),null);
    const pl=()=>{Rt.cri.style.top=Rt.haut.offsetHeight+'px';Rt.d.style.setProperty('--pied',Rt.pied.offsetHeight+'px');};Rt.d.classList.add('course');pl();setTimeout(pl,50);}
  const kd=ev=>{if(!Rt.d.classList.contains('on')||ev.repeat)return;const k=ev.key;if(k==='ArrowLeft'||k==='q'||k==='a')pagayer(KY[0],-1,performance.now()-t0);else if(k==='ArrowRight'||k==='d')pagayer(KY[0],1,performance.now()-t0);else return;ev.preventDefault();};
  addEventListener('keydown',kd);
  /* ---------------- départ, arrivée ---------------- */
  async function depart(payant){const m=Rt.menu.querySelector('.msg');course={id:null};let seed=Math.floor(Math.random()*2147483646);
    if(payant){if(m)m.textContent='On paie l’engagement…';const r=await ctx.rpc('course_debut',{p_jeu:'kayak'});if(!r||r.erreur){if(m)m.textContent=(r&&r.erreur)||'La caisse ne répond pas. Réessaie.';return;}
      course={id:r.id};seed=r.graine;if(typeof r.euros==='number')ctx.majEuros(r.euros);}
    if(m)m.textContent='On met les kayaks à l’eau…';await new Promise(r=>setTimeout(r,30));
    cadrer();B=batir(seed);placer();parts=[];pas.cd=0;Rt.menu.classList.remove('on');habiller();cam=KY[0].y-AH*.62;ETAT='grille';t0=performance.now();}
  async function finir(){const moi=KY[0];const temps=Math.round(moi.tFini+moi.pen);
    /* les autres finissent à leur allure : on projette leur temps */
    const now=performance.now()-t0;for(const k of KY)if(!k.fini){const reste=(k.y-ARR)/Math.max(40,k.v||60);k.tProj=now+reste*1000+k.pen;}else k.tProj=k.tFini+k.pen;
    const place=1+KY.filter(k=>k!==moi&&k.tProj<temps).length;moi.placeF=place;
    cri(place===1?'Victoire !':ordinal(place)+' place','arrivée en '+chrono(temps),' or',2.2);son.bip(660,.15,'square',.06);setTimeout(()=>son.bip(880,.15,'square',.06),160);setTimeout(()=>son.bip(1320,.3,'square',.06),320);vibrer([40,60,40]);
    resultat={place,temps,srv:null};
    if(course&&course.id){resultat.srv=await ctx.rpc('course_fin',{p_id:course.id,p_place:place,p_temps_ms:temps,p_pseudo:ctx.pseudo||''});if(resultat.srv&&typeof resultat.srv.euros==='number')ctx.majEuros(resultat.srv.euros);}}
  function montrerResultat(){if(ETAT==='resultat')return;ETAT='resultat';const moi=KY[0];const s=resultat&&resultat.srv;
    const ordre=KY.slice().sort((a,b)=>a.tProj-b.tProj);
    let h='<div class="ti">LES CALANQUES · LA DESCENTE</div><h2>'+(resultat.place===1?'Victoire !':ordinal(resultat.place)+' place')+'</h2><p class="so">'+chrono(resultat.temps)+(moi.pen?' · dont '+(moi.pen/1000)+' s de pénalités':' · aucune porte ratée')+'</p>';
    if(course&&course.id){if(s&&!s.erreur)h+='<div class="gain">'+(s.gain?'+ '+fr(s.gain):'0 €')+'</div><p class="so">'+(s.gain?'versés sur ton compte':'pas de gain : il faut finir dans les trois premiers')+(s.record?'<br><b style="color:#d8bf6a">Nouveau record personnel !</b>':'')+'</p>';
      else h+='<p class="so" style="color:#ffb0a0">'+echap((s&&s.erreur)||'Le résultat n’a pas pu être enregistré.')+'</p>';}
    else h+='<p class="so">Entraînement : pas de gain, pas de record.</p>';
    h+='<div class="pod">'+ordre.map((k,i)=>'<div class="'+(k.n===0?'moi':'')+'"><i>'+(i+1)+'</i><q style="background:'+k.pl.b+'"></q><span>'+(k.n===0?echap(ctx.pseudo||'Toi'):k.pl.nom)+'</span><em>'+(k.fini||k.n===0?chrono(k.tProj):'~'+chrono(k.tProj))+'</em></div>').join('')+'</div>';
    h+='<div class="deux"><button data-a="menu">LE MENU</button><button class="or" data-a="re">'+(course&&course.id?'REJOUER · 5 €':'REJOUER')+'</button></div>';
    Rt.menu.innerHTML=h+'<div class="msg"></div>';Rt.menu.classList.add('on');Rt.haut.style.display='none';Rt.pied.style.display='none';Rt.cri.classList.add('cache');Rt.d.classList.remove('course');
    Rt.menu.querySelector('[data-a=menu]').onclick=()=>menu();Rt.menu.querySelector('[data-a=re]').onclick=()=>depart(!!(course&&course.id));}
  async function menu(){ETAT='menu';Rt.d.classList.remove('course');Rt.haut.style.display='none';Rt.pied.style.display='none';Rt.cri.classList.add('cache');
    if(!B){B=batir(12345);placer();cam=KY[0].y-AH*.62;}
    Rt.menu.innerHTML='<div class="ti">LES CALANQUES · KAYAK</div><h2>La Descente des Calanques</h2><p class="so">Cinq kayaks, une calanque jusqu’à la mer. Pagaie <b>gauche, droite, gauche…</b> en rythme, passe entre les bouées, et garde de l’énergie pour la fin.</p>'+
      '<button class="ved" data-a="paye"><small>COURSE À 5 €</small><b>La Descente</b><em>1er : 20 € · 2e : 12 € · 3e : 7 €</em><span class="go">5 €</span></button>'+
      '<button class="ved gris" data-a="entr"><small>GRATUIT</small><b>Entraînement</b><em>une autre calanque, sans gain ni record</em><span class="go">RAMER</span></button><div class="msg"></div>'+
      '<div class="rub">LES MEILLEURS TEMPS</div><div class="cl"><div class="vide">Chargement…</div></div>'+
      '<div class="rub">LES COMMANDES</div><div class="regle"><b>Gauche, droite, gauche…</b> : chaque coup pousse le kayak. Tape quand le curseur passe dans la <b style="color:#9fdfb8">zone verte</b> : c’est un coup <b>parfait</b>, et les parfaits s’enchaînent.<br>'+
      '<b>Pour tourner</b> : deux coups du même côté — à gauche, la pointe part à droite. <b>Trop vite</b>, tu t’épuises. <b>Porte ratée</b> : +5 secondes.</div>';
    Rt.menu.classList.add('on');Rt.menu.querySelector('[data-a=paye]').onclick=()=>depart(true);Rt.menu.querySelector('[data-a=entr]').onclick=()=>depart(false);
    const [cl,mr]=await Promise.all([ctx.rpc('course_classement',{p_jeu:'kayak'}),ctx.rpc('course_mes_records',{})]);const box=Rt.menu.querySelector('.cl');if(!box||ETAT!=='menu')return;
    if(Array.isArray(cl)&&cl.length)box.innerHTML=cl.map((r,i)=>'<div class="'+(r.moi?'moi':'')+'"><i>'+(i+1)+'</i><span>'+echap(r.pseudo)+'</span><em>'+chrono(r.ms)+'</em></div>').join('');
    else box.innerHTML='<div class="vide">Personne n’a encore descendu. La première place est libre.</div>';
    if(mr&&!mr.erreur){const v=Rt.menu.querySelector('[data-a=paye] em');if(v&&typeof mr.restant_kayak==='number')v.textContent+=' · '+Math.max(0,mr.restant_kayak)+' course'+(mr.restant_kayak>1?'s':'')+' aujourd’hui';}}
  function fermer(){cancelAnimationFrame(anim);son.stop();Rt.d.classList.remove('on');removeEventListener('keydown',kd);Rt.fer.onclick=null;try{ctx.fermer&&ctx.fermer();}catch(x){}}
  Rt.fer.onclick=fermer;Rt.d.classList.add('on');menu();dernier=0;anim=requestAnimationFrame(boucle);
  return {fermer,_dbg:()=>({KY,portes,ETAT,ARR,MH,course,pagayer:(c)=>pagayer(KY[0],c,performance.now()-t0)})};
}

window.Courses={karting,kayak};
})();
