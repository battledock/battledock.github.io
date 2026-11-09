/* =====================================================================
   LA GARDE À VUE — la cellule du commissariat (garde.html).
   On y arrive arrêté au blocus. La cellule est fermée tant que le
   compte à rebours tourne ; on peut parler au planton à travers les
   barreaux. À la fin, la grille s'ouvre et on ressort au blocus.
   Tout est local (localStorage). Chargé par moteur.js (eval direct).
   ===================================================================== */
(()=>{
const W=800, H=800, Y0=330, GRILLE=606, PORTE0=360, PORTE1=440;
const DEPART=[400,520];
const hA=(x,y,k)=>{let n=((x*73856093)^(y*19349663)^(k*83492791))|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296;};
const lin=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function toile(L,HH){const D=2,c=document.createElement('canvas');c.width=Math.ceil(L*D);c.height=Math.ceil(HH*D);const g=c.getContext('2d');g.setTransform(D,0,0,D,0,0);return {c,g};}
function fe(g,cx,cy,rx,ry,pal,n,seed,t){t=t||1;for(let i=0;i<n;i++){const a=hA(i,seed,1)*Math.PI*2,r=Math.sqrt(hA(i,seed,2));const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
  const lum=((cx-x)/rx+(cy-y)/ry)*.5+hA(i,seed,3)*.4;g.fillStyle=lum>.55?pal[3]:lum>.15?pal[2]:lum>-.3?pal[1]:pal[0];
  g.beginPath();g.ellipse(x,y,(1.2+hA(i,seed,4)*1.6)*t,(.9+hA(i,seed,5)*1)*t,hA(i,seed,6)*3,0,7);g.fill();}}
function ombreSol(g,cx,cy,rx,ry,a){g.fillStyle='rgba(40,34,26,'+(a||.18)+')';g.beginPath();g.ellipse(cx+4,cy+3,rx,ry,0,0,7);g.fill();}
const txt=(g,s,x,y,px,c,al,f)=>{g.fillStyle=c;g.font=(f||'bold')+' '+px+'px "Helvetica Neue",Arial,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';g.fillText(s,x,y);};

const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v));}catch(x){return null;}};
function mot(t){let m=document.getElementById('blcMot');if(!m){m=document.createElement('div');m.id='blcMot';m.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:2147482400;background:rgba(20,22,26,.9);color:#fff;padding:9px 16px;border-radius:14px;font:800 15px "Baloo 2",sans-serif;pointer-events:none;transition:opacity .2s;opacity:0;text-align:center';document.body.appendChild(m);}
  m.textContent=t;m.style.opacity='1';clearTimeout(mot.t);mot.t=setTimeout(()=>m.style.opacity='0',1800);}
/* LA BOÎTE DE DIALOGUE : le portrait, la réplique, les choix */
function portrait(cv,ap){const s=3,NW=40,NH=40;cv.width=NW*s;cv.height=NH*s;cv.style.width=NW*1.6+'px';cv.style.height=NH*1.6+'px';const t=document.createElement('canvas');t.width=40;t.height=66;const q=t.getContext('2d');q.imageSmoothingEnabled=false;personne(q,20,62,ap,'bas',0,false);
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(t,0,12,40,40,0,0,NW*s,NH*s);}
function dialogue({nom,ap,texte,choix}){return new Promise(ok=>{const old=document.getElementById('blcDia');if(old)old.remove();
  const d=document.createElement('div');d.id='blcDia';d.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147482600;background:#1b1d22;color:#fff;border-radius:22px 22px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.45);font-family:"Baloo 2",system-ui,sans-serif;transform:translateY(100%);transition:transform .2s';
  d.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start"><canvas style="flex:none;border-radius:14px;background:#2a2e36;image-rendering:pixelated"></canvas><div style="flex:1;min-width:0"><b style="display:block;color:#ffd98a;font-size:14px;letter-spacing:.06em">'+nom.toUpperCase()+'</b><div style="font-weight:700;font-size:16px;line-height:1.3">'+texte+'</div></div></div><div class="ch" style="display:flex;flex-direction:column;gap:7px;margin-top:12px"></div>';
  if(ap)portrait(d.querySelector('canvas'),ap);else d.querySelector('canvas').style.display='none';
  const C=d.querySelector('.ch');choix.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.style.cssText='border:0;border-radius:14px;padding:11px 12px;text-align:left;background:#2e323b;color:#fff;font:800 15px "Baloo 2",sans-serif;box-shadow:0 3px 0 #15171b';
    b.onclick=()=>{try{vibrer&&vibrer(8);}catch(x){}d.style.transform='translateY(100%)';setTimeout(()=>d.remove(),200);ok(i);};C.appendChild(b);});
  document.body.appendChild(d);requestAnimationFrame(()=>d.style.transform='none');});}

/* ---------- LE DESSIN ---------- */
function mur(g){
  g.fillStyle=lin(g,0,0,0,Y0,[[0,'#d8d2c2'],[.55,'#cfc8b6'],[.56,'#8fa49a'],[1,'#7e938a']]);g.fillRect(0,0,W,Y0);
  for(let i=0;i<4000;i++)R(g,hA(i,1,1)*W,hA(i,2,1)*Y0,1,1,'rgba(0,0,0,.06)');
  /* la lucarne grillagée, et le rai de lumière qui descend */
  R(g,340,40,120,54,'#5a6066');g.fillStyle=lin(g,0,44,0,90,[[0,'#cfe6f4'],[1,'#e8f4fa']]);g.fillRect(344,44,112,46);for(let x=350;x<456;x+=12)R(g,x,44,3,46,'#3a3e44');R(g,344,64,112,3,'#3a3e44');
  g.fillStyle='rgba(255,250,220,.12)';g.beginPath();g.moveTo(344,90);g.lineTo(456,90);g.lineTo(560,Y0+180);g.lineTo(300,Y0+180);g.fill();
  /* les gravures des précédents locataires */
  g.strokeStyle='rgba(60,50,40,.45)';g.lineWidth=1;for(let k=0;k<4;k++){for(let j=0;j<5;j++){g.beginPath();g.moveTo(90+k*22+j*3.6,180);g.lineTo(90+k*22+j*3.6,196);g.stroke();}g.beginPath();g.moveTo(88+k*22,192);g.lineTo(108+k*22,184);g.stroke();}
  txt(g,'MOMO ÉTAIT LÀ',560,206,9,'rgba(60,50,40,.4)','center','bold');txt(g,'2019',560,218,8,'rgba(60,50,40,.35)','center','bold');
  /* la caméra dans le coin, son voyant rouge */
  R(g,720,20,30,14,'#3a3e44');R(g,712,26,10,6,'#2a2e34');R(g,742,24,4,4,'#e03030');
  txt(g,'LOCAUX DE GARDE À VUE',140,40,9,'rgba(40,40,40,.5)','center','900');
  R(g,0,Y0-2,W,3,'rgba(0,0,0,.25)');}
function sols(g){
  /* la cellule : béton, rigole, taches */
  g.fillStyle=lin(g,0,Y0,0,GRILLE,[[0,'#9a9890'],[1,'#a8a69e']]);g.fillRect(0,Y0,W,GRILLE-Y0);
  for(let i=0;i<6000;i++)R(g,hA(i,3,1)*W,Y0+hA(i,4,1)*(GRILLE-Y0),1,1,hA(i,5,1)>.5?'rgba(255,255,255,.08)':'rgba(0,0,0,.1)');
  g.fillStyle='#5a5a56';g.beginPath();g.arc(400,500,8,0,7);g.fill();for(let k=0;k<4;k++)R(g,394,496+k*2.4,12,1,'#3a3a36');
  /* les murs de côté */
  R(g,0,Y0,56,GRILLE-Y0,'#7e938a');R(g,W-56,Y0,56,GRILLE-Y0,'#7e938a');R(g,54,Y0,3,GRILLE-Y0,'rgba(0,0,0,.25)');R(g,W-57,Y0,3,GRILLE-Y0,'rgba(0,0,0,.25)');
  /* le couloir : lino, plinthe, bureau du planton */
  g.fillStyle=lin(g,0,GRILLE,0,H,[[0,'#c8c2a8'],[1,'#d4ceb4']]);g.fillRect(0,GRILLE,W,H-GRILLE);
  for(let y=GRILLE+20;y<H;y+=30)for(let x=((y/30)%2)*30;x<W;x+=60)R(g,x,y,30,30,'rgba(0,0,0,.04)');
  /* la porte de sortie du commissariat */
  R(g,350,H-12,100,12,'#5a6a7a');txt(g,'SORTIE',400,H-6,7,'#ffffff','center','900');}
function peindreSol(g){mur(g);sols(g);}
function sol(){const c=document.createElement('canvas');c.width=W;c.height=H;peindreSol(c.getContext('2d'));return c;}
function solFin(){const c=document.createElement('canvas');c.width=W*2;c.height=H*2;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);peindreSol(g);return c;}
const T={};const memo=(k,f)=>T[k]||(T[k]=f());
function graverBanc(){return memo('bc',()=>{const Wd=180,Hd=40,sol=34;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(6,sol-2,170,6);
  R(g,2,sol-22,176,22,'#b8b4a8');R(g,2,sol-22,176,3,'#d8d4c8');R(g,2,sol-4,176,4,'#8a867a');
  /* la couverture grise pliée */R(g,120,sol-30,46,9,'#6a6e78');R(g,120,sol-30,46,2,'#8a8e98');return {toile:c,W:Wd,H:Hd,sol};});}
function graverWC(){return memo('wc',()=>{const Wd=70,Hd=56,sol=50;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(6,sol-2,60,5);
  g.fillStyle='#c8ccd0';g.beginPath();g.ellipse(22,sol-14,14,9,0,0,7);g.fill();g.fillStyle='#8a8e92';g.beginPath();g.ellipse(22,sol-15,9,5,0,0,7);g.fill();R(g,12,sol-14,20,14,'#b0b4b8');
  R(g,44,sol-36,22,12,'#c8ccd0');R(g,52,sol-42,4,8,'#9a9ea2');R(g,48,sol-24,14,24,'#b0b4b8');return {toile:c,W:Wd,H:Hd,sol};});}
function graverBureau(){return memo('bu',()=>{const Wd=160,Hd=90,sol=84;const {c,g}=toile(Wd,Hd);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(8,sol-3,146,6);
  R(g,6,sol-40,148,8,'#6a5a46');R(g,10,sol-32,140,32,'#5a4a38');R(g,6,sol-40,148,1.4,'#8a7a62');
  R(g,20,sol-62,40,24,'#2a2e34');R(g,23,sol-59,34,17,'#4a8ab8');R(g,36,sol-38,8,2,'#2a2e34');R(g,80,sol-46,30,4,'#f2f0e6');R(g,82,sol-50,26,4,'#e8e4d8');
  g.fillStyle='#f4f0e6';g.beginPath();g.arc(130,sol-46,5,0,7);g.fill();R(g,126,sol-46,8,6,'#f4f0e6');R(g,128,sol-52,4,4,'rgba(200,200,200,.4)');
  return {toile:c,W:Wd,H:Hd,sol};});}
/* la grille : barreaux d'acier, et la porte qui coulisse quand c'est fini */
let OUVERT=false,OUV=0;
ANIM_DECOR.gav_grille=(g,o,x,y)=>{const X0=x-o.x;OUV=Math.min(1,OUV+(OUVERT?.03:0));
  for(let wx=0;wx<=W;wx+=14){const dansPorte=wx>=PORTE0&&wx<=PORTE1;const dx=dansPorte?OUV*(PORTE1-PORTE0+10):0;
    R(g,X0+wx+dx-1.6,y-150,3.6,150,'#4a4e54');R(g,X0+wx+dx-1.6,y-150,1.2,150,'#9aa0a8');}
  R(g,X0,y-152,W,6,'#3a3e44');R(g,X0,y-80,W,4,'#3a3e44');R(g,X0,y-6,W,6,'#3a3e44');
  R(g,X0+PORTE0+OUV*(PORTE1-PORTE0+10),y-120,PORTE1-PORTE0,4,'#2a2e34');
  R(g,X0+PORTE1+4+OUV*(PORTE1-PORTE0+10),y-78,8,12,'#c8a040');};
/* le planton, derrière son bureau */
const AP_PLANTON={peau:4,cheveux:0,coiffe:1,barbe:3,haut:0,veste:16,bas:0,pantalon:8,souliers:0,chaussures:0,sac:0,chapeau:0,raye:0,motif:0,_pnj:true};
function acteurs(){return [{y:690,f:(ctx,cx,cy)=>{personne(ctx,620-cx,690-cy,AP_PLANTON,'gauche',0,false);}}];}
function decor(){const D=[];const P=(t,x,y,o)=>D.push(Object.assign({t,x,y,gr:0},o||{}));
  P('x_jol_gav_banc_sol',150,400,{col:[176,10]});P('x_jol_gav_wc_sol',690,420,{col:[60,10]});
  P('x_jol_gav_vide_sol',W/2,GRILLE+8,{anim:'gav_grille'});
  P('x_jol_gav_vide_sol',400,GRILLE-6,{agir:parlerPlanton,libelle:'Appeler',nom:'LE PLANTON',demi:60});
  P('x_jol_gav_bureau_sol',640,720,{col:[150,10]});
  return D;}
const AVOCAT=()=>LS('gav_avocat');
async function parlerPlanton(){const fin=LS('blc_gav_fin')||0;
  if(Date.now()>=fin){await dialogue({nom:'Le planton',ap:AP_PLANTON,texte:'« C’est bon, tu peux y aller. Le procureur classe… pour cette fois. »',choix:['Merci']});return;}
  const i=await dialogue({nom:'Le planton',ap:AP_PLANTON,texte:'« Qu’est-ce qu’il y a ? »',choix:AVOCAT()?['J’ai faim.','Laissez-moi sortir !','Rien.']:['Je veux voir un avocat.','J’ai faim.','Laissez-moi sortir !','Rien.']});
  const c=AVOCAT()?['faim','sortir','rien'][i]:['avocat','faim','sortir','rien'][i];
  if(c==='avocat'){LS('gav_avocat',1);LS('blc_gav_fin',fin-30000);await dialogue({nom:'Maître Ferrandi',texte:'« Bon. Pas de casier, pas de violence : je vais les faire accélérer. Vous dites rien, d’accord ? »',choix:['D’accord']});mot('L’avocat te fait gagner 30 secondes.');}
  else if(c==='faim')await dialogue({nom:'Le planton',ap:AP_PLANTON,texte:'« Sandwich jambon-beurre. C’est ça ou rien. »',choix:['Merci…']});
  else if(c==='sortir'){LS('blc_gav_fin',fin+15000);await dialogue({nom:'Le planton',ap:AP_PLANTON,texte:'« Tu cries encore et je te rajoute du temps. Voilà, c’est fait. »',choix:['…']});}}
/* le compte à rebours */
function bandeau(){let b=document.getElementById('gavBan');if(!b){b=document.createElement('div');b.id='gavBan';b.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 74px);transform:translateX(-50%);z-index:2147482300;border-radius:14px;padding:5px 14px;font:800 15px "Baloo 2",sans-serif;pointer-events:none;white-space:nowrap;background:rgba(20,22,26,.88);color:#ff9a8a;box-shadow:0 4px 12px rgba(0,0,0,.25)';document.body.appendChild(b);}
  const r=Math.max(0,(LS('blc_gav_fin')||0)-Date.now());
  if(r>0){const s=Math.ceil(r/1000);b.textContent='🔒 GARDE À VUE · '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
  else{b.style.color='#9ae0b0';b.textContent='🔓 Tu es libre · sors par le couloir';if(!OUVERT){OUVERT=true;try{vibrer&&vibrer([20,40,20]);}catch(x){}mot('La grille s’ouvre.');LS('gav_avocat',null);}}}
setInterval(bandeau,250);
/* à l'arrivée : le butin est saisi */
setTimeout(()=>{const b=LS('blc_butin')||[];if(b.length){LS('blc_butin',[]);mot('Ton butin a été saisi ('+b.length+' objet'+(b.length>1?'s':'')+').');}else mot('Tu es en cellule.');},900);
let PARTI=false;
setInterval(()=>{try{if(!PARTI&&OUVERT&&joueur.y>H-20){PARTI=true;try{sauver();}catch(x){}location.href='blocus.html?de=garde&t='+Date.now();}}catch(x){}},150);
function bloque(x,y){
  if(x<60||x>W-60)return y<GRILLE+14;
  if(x<10||x>W-10)return true;if(y<Y0+12||y>H-6)return true;
  if(y>GRILLE-10&&y<GRILLE+14){if(!(OUVERT&&OUV>.6&&x>PORTE0+6&&x<PORTE1-6))return true;}
  for(const o of DECOR){if(!o.col)continue;if(Math.abs(x-o.x)<o.col[0]/2&&y>o.y-o.col[1]&&y<o.y+3)return true;}
  return false;}
const GRAVEURS={x_jol_gav_banc_sol:graverBanc,x_jol_gav_wc_sol:graverWC,x_jol_gav_bureau_sol:graverBureau};
function graver(t,v){const r=(GRAVEURS[t]||(()=>({toile:document.createElement('canvas'),W:1,H:1,sol:0})))(v||0);return {toile:r.toile,W:r.W,H:r.H,sol:r.sol};}
return {sol,solFin,decor,bloque,graver,depart:DEPART,figurants:()=>[],acteurs};
})()
