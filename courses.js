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
#crsPied .jg i.violet{background:linear-gradient(90deg,#8a2ad8,#e070ff,#ffd0ff)}
/* ---- le karting : bandeau de course ---- */
#crs.kart #crsHaut{padding:calc(8px + env(safe-area-inset-top)) 10px 8px}
#crsHaut .kh{display:flex;align-items:center;gap:10px}
#crsHaut .pos{flex:none;min-width:78px;text-align:left;font:300 44px Georgia;color:#d8bf6a;line-height:1}
#crsHaut .pos sup{font-size:18px;vertical-align:top;position:relative;top:4px;margin-left:1px}
#crsHaut .pos small{font:700 12px Arial;color:#93a68c;margin-left:4px;letter-spacing:1px}
#crsHaut .pos .chr{font-size:24px}#crsHaut .pos .chr+small{display:block;margin:2px 0 0;font-size:8px;letter-spacing:1.4px}
#crsHaut .pos.saute{animation:crsSaut .5s}
@keyframes crsSaut{0%{transform:scale(1)}35%{transform:scale(1.35);color:#fff}100%{transform:scale(1)}}
#crsHaut .mil{flex:1;min-width:0;text-align:center}
#crsHaut .mil .tr{display:block;font:700 11px Arial;letter-spacing:2.2px;color:#eef3e4}
#crsHaut .mil .ch{display:block;font:700 15px ui-monospace,monospace;color:#d8bf6a;margin-top:2px}
#crsHaut .mil .t{display:block;font:700 8px Arial;letter-spacing:1.3px;color:#93a68c;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#crsHaut .slot{flex:none;width:48px;height:48px;border-radius:14px;border:2px solid rgba(216,191,106,.7);background:rgba(216,191,106,.12);display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 0 14px rgba(216,191,106,.3)}
#crsHaut .slot.vide{border-color:rgba(216,191,106,.25);background:rgba(0,0,0,.25);box-shadow:none}
#crsHaut .slot.roule{animation:crsRoule .16s infinite}
#crsHaut .slot.pop{animation:crsSaut .45s}
@keyframes crsRoule{50%{transform:translateY(-2px)}}
#crsHaut .pause{flex:none;width:34px;height:34px;border-radius:50%;border:1px solid rgba(216,191,106,.35);background:rgba(0,0,0,.4);color:#eef3e4;font:700 10px Arial;letter-spacing:-1px;padding:0}
#crs.kart.course #crsFermer{display:none}
#crsGros{position:absolute;left:0;right:0;top:36%;text-align:center;font:400 72px Georgia;color:#d8bf6a;text-shadow:0 4px 0 rgba(0,0,0,.45);pointer-events:none;opacity:0;z-index:3}
#crsGros.pop{animation:crsGros 1s ease-out}
@keyframes crsGros{0%{opacity:0;transform:scale(2.2)}15%{opacity:1;transform:scale(1)}70%{opacity:1}100%{opacity:0;transform:scale(.9)}}
#crsPad{position:absolute;left:0;top:var(--haut,80px);bottom:0;right:var(--padR,45%);z-index:4;display:none;touch-action:none}
#crsPad .base{position:fixed;width:104px;height:104px;margin:-52px 0 0 -52px;border-radius:50%;border:2px solid rgba(216,191,106,.5);background:rgba(8,14,8,.35);display:none;pointer-events:none}
#crsPad .base.on{display:block}
#crsPad .bout{position:absolute;left:50%;top:50%;width:46px;height:46px;border-radius:50%;background:#d8bf6a;box-shadow:0 3px 0 #8a6a2a;transform:translate(-50%,-50%)}
#crsPied .cmd.pouce .zone{flex:1;height:68px;border-radius:20px;border:1px dashed rgba(216,191,106,.35);display:flex;align-items:center;justify-content:center;gap:8px;color:#93a68c;font:700 9px Arial;letter-spacing:1.3px;line-height:1.4;text-align:left}
#crsPied .cmd.pouce .zone b{font-size:20px;color:#d8bf6a;letter-spacing:0}
#crsPied .cmd.pouce button.or{flex:none;width:96px}
#crsPied .cmd button.obj small{display:block;font:700 7px Arial;letter-spacing:1px;margin-top:2px}
#crsPause{position:absolute;inset:0;z-index:7;display:none;align-items:center;justify-content:center;background:rgba(5,9,5,.7);padding:20px}
#crsPause.on{display:flex}
#crsPause .carte{width:100%;max-width:340px;border-radius:18px;background:linear-gradient(180deg,#17211a,#0e1510);border:2px solid #2f4433;padding:16px;text-align:center}
#crsPause .ti,#crsMenu .ti{font:700 10px ui-monospace,monospace;letter-spacing:1.5px;color:#d8bf6a}
#crsPause h2{font:400 28px Georgia;margin:4px 0}
#crsPause .so{font:italic 13px Georgia;color:#93a68c;margin:0 0 12px}
.deux.col{flex-direction:column}
#crsPause .deux{display:flex;gap:9px}
#crsPause .deux button{border-radius:18px;padding:14px;border:1px solid rgba(216,191,106,.35);background:rgba(230,245,225,.06);color:#eef3e4;font:700 12px Arial;letter-spacing:2px}
#crsPause .deux button.or{background:#d8bf6a;color:#15201a;border:0}
/* ---- le karting : les menus, sur la course de démonstration ---- */
#crs.kart #crsMenu{background:linear-gradient(180deg,rgba(9,14,9,.15) 0%,rgba(9,14,9,.55) 26%,rgba(9,14,9,.93) 46%);padding-top:calc(14px + env(safe-area-inset-top))}
#crsMenu .accueil,#crsMenu .fenetre{max-width:420px;margin:0 auto}
#crsMenu .titre{padding:6px 0 14px;text-shadow:0 2px 10px rgba(0,0,0,.8)}
#crsMenu h1{font:400 44px/0.98 Georgia;margin:6px 0 0;color:#eef3e4}
#crsMenu h1 i{color:#d8bf6a}
#crsMenu .circ{display:flex;align-items:stretch;gap:6px;margin:6px 0 12px}
#crsMenu .circ .fl{flex:none;width:34px;border-radius:14px;border:1px solid rgba(216,191,106,.3);background:rgba(8,14,8,.7);color:#d8bf6a;font:400 28px Georgia;padding:0}
#crsMenu .cc{flex:1;display:flex;gap:10px;align-items:center;text-align:left;border:1px solid rgba(216,191,106,.45);border-radius:16px;background:rgba(14,21,16,.9);padding:8px}
#crsMenu .cc img{width:58px;height:99px;border-radius:8px;flex:none;image-rendering:auto}
#crsMenu .cc small{display:block;font:700 9px Arial;letter-spacing:2px;color:#93a68c}
#crsMenu .cc b{display:block;font:400 24px Georgia;color:#eef3e4;margin-top:2px}
#crsMenu .cc em{display:block;font:italic 12px/1.35 Georgia;color:#aab8a2;margin-top:2px}
#crsMenu .cc .rec{display:inline-block;margin-top:6px;font:700 9px ui-monospace,monospace;letter-spacing:1px;color:#d8bf6a;border:1px solid rgba(216,191,106,.35);border-radius:8px;padding:3px 6px}
#crsMenu .duo{display:flex;gap:10px}
#crsMenu .duo .ved{flex:1;padding:12px}
#crsMenu .duo .ved b{font-size:18px}
#crsMenu .trio{display:flex;gap:8px;margin-top:6px}
#crsMenu .trio button{flex:1;border-radius:14px;border:1px solid rgba(216,191,106,.3);background:rgba(14,21,16,.85);color:#eef3e4;font:700 9px Arial;letter-spacing:1.4px;padding:10px 4px}
#crsMenu .trio button span{display:block;font-size:22px;margin-bottom:4px}
#crsMenu .fenetre{padding-top:8px;background:rgba(9,14,9,.0)}
#crsMenu .retour{display:block;background:none;border:0;color:#93a68c;font:700 11px Arial;letter-spacing:1.6px;padding:6px 0 10px}
#crsMenu .podium{display:block;width:240px;height:128px;margin:6px auto 4px;image-rendering:pixelated}
#crsMenu .garage{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
#crsMenu .kc{border:1px solid rgba(216,191,106,.25);border-radius:16px;background:rgba(14,21,16,.85);padding:10px 4px;color:#eef3e4;font:700 10px Arial;letter-spacing:1.4px}
#crsMenu .kc.on{border:2px solid #d8bf6a;background:rgba(216,191,106,.14)}
#crsMenu .kc img{display:block;width:60px;height:60px;margin:0 auto 6px;image-rendering:pixelated}
#crsMenu .onglets{display:flex;gap:8px;margin-bottom:10px}
#crsMenu .onglets button{flex:1;border-radius:14px;border:1px solid rgba(216,191,106,.3);background:rgba(14,21,16,.85);color:#93a68c;font:400 15px Georgia;padding:9px}
#crsMenu .onglets button.on{background:#d8bf6a;color:#15201a;border:0}
#crsMenu .aide{text-align:left}
#crsMenu .aide div{display:flex;gap:12px;align-items:flex-start;border:1px solid rgba(216,191,106,.2);border-radius:14px;background:rgba(14,21,16,.85);padding:10px 12px;margin-bottom:8px}
#crsMenu .aide span{font-size:24px;flex:none;width:30px;text-align:center}
#crsMenu .aide p{margin:0;font:13px/1.5 Georgia;color:#c9d3c2}#crsMenu .aide b{color:#eef3e4}
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
    '<div id="crsPad"><div class="base"><div class="bout"></div></div></div><div id="crsPied"></div><div id="crsGros"></div><div id="crsMenu"></div><div id="crsPause"></div><button id="crsFermer" aria-label="Fermer">✕</button>';
  document.body.appendChild(d);
  RACINE={d,toile:d.querySelector('#crsToile'),haut:d.querySelector('#crsHaut'),cri:d.querySelector('#crsCri'),pied:d.querySelector('#crsPied'),menu:d.querySelector('#crsMenu'),fer:d.querySelector('#crsFermer'),pad:d.querySelector('#crsPad')};
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
    crisse(v){const a=ctx();if(!a)return;if(!this._cr){const n=a.sampleRate,b=a.createBuffer(1,n,n),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
      const s=a.createBufferSource();s.buffer=b;s.loop=true;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=2400;f.Q.value=6;const g=a.createGain();g.gain.value=0;s.connect(f).connect(g).connect(a.destination);s.start();this._cr=g;}
      this._cr.gain.setTargetAtTime(v?.035:0,a.currentTime,.06);},
    souffle(){const a=ctx();if(!a)return;const n=a.sampleRate*.5,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);
      const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=900;g.gain.value=.14;s.connect(f).connect(g).connect(a.destination);s.start();},
    stop(){try{if(gm)gm.gain.value=0;if(this._cr)this._cr.gain.value=0;}catch(x){}}};}

/* =====================================================================
   LE GRAND PRIX DU QUAI
   Deux circuits (le Quai, la Corniche), trois modes (Grand Prix à 5 €,
   course libre en trois cylindrées, contre-la-montre avec fantôme), un
   garage, le classement. On conduit au pouce : on montre la direction,
   le kart y va — la caméra ne tourne pas, la gauche reste la gauche.
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
  {nom:'Toi',coul:'Orange',b:'#e8761e',B:'#ff9a44',d:'#a8480e',h:'#ffd04a',H:'#fff2a8'},
  {nom:'Marius',coul:'Bleu',b:'#2a6ad8',B:'#4a8af0',d:'#1a4498',h:'#f4f4f4',H:'#ffffff'},
  {nom:'Fanny',coul:'Vert',b:'#2ac84a',B:'#5ae070',d:'#1a8a30',h:'#e82a2a',H:'#ff6a5a'},
  {nom:'Escartefigue',coul:'Violet',b:'#c83ad8',B:'#e070f0',d:'#8a2098',h:'#202024',H:'#4a4a52'},
  {nom:'Panisse',coul:'Jaune',b:'#ffd21a',B:'#ffe870',d:'#b08a10',h:'#2a4ad8',H:'#5a7af0'},
  {nom:'César',coul:'Blanc',b:'#f2f2ee',B:'#ffffff',d:'#a8a8a0',h:'#e82a2a',H:'#ff6a5a'},
];
const KPAL=p=>({d:p.d,b:p.b,B:p.B,w:'#f4f4f0',k:'#141418',K:'#4a4a52',s:'#24242a',h:p.h,H:p.H,g:'#6a6e76',G:'#a8acb4',e:'#8a8e96'});
const NDIR=32;
let SPR_KART=null;
function spritesKart(){if(SPR_KART)return SPR_KART;SPR_KART=PILOTES.map(p=>{const pal=KPAL(p);const a=[];for(let i=0;i<NDIR;i++)a.push(pivoter(KART,pal,i/NDIR*Math.PI*2));return a;});
  SPR_KART.ombre=[];for(let i=0;i<NDIR;i++)SPR_KART.ombre.push(pivoter(KART,null,i/NDIR*Math.PI*2,true));
  SPR_KART.fant=[];const pf={d:'#bfe8ff',b:'#9fd8ff',B:'#d8f0ff',w:'#ffffff',k:'#6a9ac0',K:'#9ac0e0',s:'#6a9ac0',h:'#ffffff',H:'#ffffff',g:'#8ab8e0',G:'#d8f0ff',e:'#9ac0e0'};
  for(let i=0;i<NDIR;i++)SPR_KART.fant.push(pivoter(KART,pf,i/NDIR*Math.PI*2));return SPR_KART;}
const SARD=['..bbbb..','.bwBBBbt','bBBBBBbt','.bbbbb.t'];
let SPR_SARD=null;
function spritesSardine(){if(SPR_SARD)return SPR_SARD;const pal={b:'#4a6a88',B:'#a8c8e0',w:'#141418',t:'#3a5a78'};SPR_SARD=[];
  const rot=[];for(let x=0;x<8;x++){let s='';for(let y=3;y>=0;y--)s+=SARD[y][7-x]||'.';rot.push(s);}
  for(let i=0;i<16;i++)SPR_SARD.push(pivoter(rot,pal,i/16*Math.PI*2));return SPR_SARD;}

const KW=440,KH=960,HW=22;
const CIRCUITS={
  quai:{nom:'Le Quai',jeu:'karting',eau:-1,court:'LE QUAI',
    desc:'Le long des bateaux : une longue ligne droite, deux épingles et la chicane des palmiers.',
    ctrl:[[118,830],[116,640],[118,450],[124,250],[146,150],[200,100],[270,96],[330,132],[350,210],[330,290],[290,340],[292,420],[338,480],[354,570],[330,650],[272,700],[262,770],[276,840],[240,900],[170,918],[128,884]]},
  corniche:{nom:'La Corniche',jeu:'karting_corniche',eau:1,court:'LA CORNICHE',
    desc:'Face à la mer, à flanc de colline : des courbes rapides et le grand S des villas.',
    ctrl:[[300,860],[318,700],[306,540],[322,380],[310,230],[270,130],[200,92],[132,120],[100,190],[136,262],[204,300],[214,372],[160,430],[100,480],[92,560],[140,620],[200,650],[206,720],[150,780],[112,850],[150,912],[230,926]]},
};
const ORDRE_C=['quai','corniche'];
const DIFFS={pitchoun:{nom:'Pitchoun',sous:'pour apprendre',f:.84},minot:{nom:'Minot',sous:'la course normale',f:.95},cador:{nom:'Cador',sous:'pour les vrais',f:1.04}};
const OBJETS={sardine:{ic:'🐟',nom:'Sardine'},boule:{ic:'⚫',nom:'Boule'},savon:{ic:'🧼',nom:'Savon'},mistral:{ic:'🌬️',nom:'Mistral'}};
const PREFK=()=>{try{return JSON.parse(localStorage.getItem('bdl.kart')||'{}')||{};}catch(x){return {};}};
const SAUVEK=o=>{try{localStorage.setItem('bdl.kart',JSON.stringify(Object.assign(PREFK(),o)));}catch(x){}};
function construireCircuit(CTRL){
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
  for(let i=0;i<N;i++){let s=0;for(let j=-8;j<=8;j++)s+=P[(i+j+N)%N].k;P[i].ks=s/17;}
  return P;}
function plusProche(P,x,y,i0,fen){const N=P.length;let bi=i0,bd=1e9;
  if(i0==null){for(let i=0;i<N;i++){const d=(P[i].x-x)**2+(P[i].y-y)**2;if(d<bd){bd=d;bi=i;}}return bi;}
  for(let j=-fen;j<=fen;j++){const i=(i0+j+N)%N;const d=(P[i].x-x)**2+(P[i].y-y)**2;if(d<bd){bd=d;bi=i;}}return bi;}
const riveDe=(C,y)=>C.eau<0?70+6*Math.sin(y/90):KW-62+6*Math.sin(y/80)+4*Math.sin(y/23);
const dansLEau=(C,x,y)=>C.eau<0?x<riveDe(C,y):x>riveDe(C,y);

function graverCircuit(P,C){
  const T=Toile(KW,KH),N=P.length;
  const DIST=new Float32Array(KW*KH).fill(999),IDX=new Int32Array(KW*KH).fill(-1);const RR=HW+16;
  for(let i=0;i<N;i++){const p=P[i];for(let y=Math.floor(p.y-RR);y<=p.y+RR;y++){if(y<0||y>=KH)continue;for(let x=Math.floor(p.x-RR);x<=p.x+RR;x++){if(x<0||x>=KW)continue;
    const d=Math.hypot(x-p.x,y-p.y),k=y*KW+x;if(d<DIST[k]){DIST[k]=d;IDX[k]=i;}}}}
  const EAU=C.eau<0?['#1d4e54','#22575d','#265c62','#2b6568']:['#0e4a6a','#145c80','#1a6e92','#2482a4'];
  const QUAI=['#a8946c','#bca480','#cbb488','#d8c49a'],GARR=['#7a7a4a','#8e8a56','#a29a66','#b6aa78'];
  const AS=['#3a3b40','#44454a','#4e4f55','#5a5b60'],GRAV=['#9a8a6e','#ae9e80','#c2b292','#d2c4a6'];
  for(let y=0;y<KH;y++){for(let x=0;x<KW;x++){const k=y*KW+x,d=DIST[k];
    if(dansLEau(C,x,y)){let v=.5+(marbre(x,y,11)-.5)*.9;const dr=Math.abs(x-riveDe(C,y));
      if(C.eau>0&&dr<14)v+=.35*(1-dr/14);
      if(hs(Math.floor(x/7),Math.floor(y/3),12)<.08&&x%7<4&&y%3===0){T.P(x,y,C.eau<0?'#497670':'#5aa0c0');continue;}
      if(hs(Math.floor(x/9),Math.floor(y/4),13)<.06&&x%9<5&&y%4===0){T.P(x,y,EAU[0]);continue;}T.P(x,y,tone(x,y,v,EAU));continue;}
    if(d<HW){const p=P[IDX[k]];const lat=(x-p.x)*(-p.ty)+(y-p.y)*p.tx;
      let v=.45+(marbre(x,y,16)-.5)*.6+(hs(x,y,17)-.5)*.35;
      const ideal=-p.ks*90;if(Math.abs(lat-Math.max(-12,Math.min(12,ideal)))<5)v-=.18;
      if(d>HW-3&&Math.abs(p.ks)>.06){T.P(x,y,(Math.floor(IDX[k]/3)%2)?'#c8322a':'#f2eee4');continue;}
      if(d>HW-1.5){T.P(x,y,'#e8e4da');continue;}
      T.P(x,y,tone(x,y,v,AS));continue;}
    if(d<HW+6){T.P(x,y,tone(x,y,.4+(hs(x,y,18)-.5)*.7+(marbre(x,y,19)-.5)*.4,GRAV));continue;}
    if(C.eau<0){const r=Math.floor(y/12),off=(r%2)*12,cc=Math.floor((x+off)/24);const j=(y%12===0)||((x+off)%24===0);
      T.P(x,y,j?'#8f7a58':tone(x,y,.45+(hs(cc,r,14)-.5)*.35+(marbre(x,y,15)-.5)*.5,QUAI));}
    else{/* la garrigue : terre claire, touffes */let v=.5+(marbre(x,y,25)-.5)*1.1;if(lisse(x,y,4,26)>.68)v-=.45;T.P(x,y,tone(x,y,v,GARR));}}}
  /* le bord de l'eau */
  for(let y=0;y<KH;y++){const b=Math.round(riveDe(C,y)),s=C.eau<0?1:-1;
    if(C.eau<0){T.P(b,y,'#e8d8b4');T.P(b+1,y,'#f2e6c8');T.P(b-1,y,'#705733');T.P(b-2,y,'#2a2117');}
    else{for(let k=0;k<5;k++){const x=b+k;T.P(x,y,tone(x,y,.4+(hs(x,y,27)-.5),['#8a8478','#a8a294','#c4beb0','#dcd6c8']));}
      if(bay(b+5,y)<.8)T.P(b+5,y,'#f2fbf6');if(bay(b+6,y)<.4)T.P(b+6,y,'#e0f6f0');if(bay(b+7,y)<.15)T.P(b+7,y,'#e0f6f0');}}
  if(C.eau<0){/* les bateaux du port */
    const BAT=[["#f4f2e8","#c8322a"],["#f4f2e8","#2a5a9a"],["#2a3e6a","#f4f2e8"],["#f4f2e8","#2a8a5a"],["#f4f2e8","#1a1a1e"]];
    for(let i=0;i<34;i++){const y=8+i*28,be=riveDe(C,y),x=Math.round(be-50),L=44,[co,ba]=BAT[i%5];
      for(let ii=0;ii<L;ii++){const pinch=ii<5?5-ii:0;for(let jj=0;jj<7;jj++){if(jj<pinch*.6)continue;let col=co;if(jj===2||jj===3)col=ba;if(jj>=5)col='#1d2c3a';if(jj===0)col='#b88a5a';T.P(x+ii,y+jj,col);}}
      T.R(x+5,y-1,L-6,1,'#9a6e44');T.R(x+19,y-5,9,4,'#f4f2e8');T.R(x+20,y-4,2,2,'#2a3a4a');T.R(x+24,y-4,2,2,'#2a3a4a');
      for(let jj=0;jj<5;jj++)for(let ii=0;ii<L;ii++)if(bay(x+ii,y+7+jj)<.5-jj*.1)T.dk(x+ii+2,y+7+jj,.25);
      T.L(x+28,y-1,x+28,y-12,'#e8e4da');T.P(x+28,y-13,'#c8322a');}
    for(let y=14;y<KH;y+=28){const b=Math.round(riveDe(C,y))+4;T.R(b,y,3,3,'#2a2a2e');T.P(b+1,y,'#5a5a62');T.dk(b+3,y+2,.35);}}
  else{/* rochers en mer, voiliers au large */
    for(let i=0;i<26;i++){const y=Math.round(hs(i,60)*KH),x=Math.round(riveDe(C,y)+10+hs(i,61)*30),r=2+Math.floor(hs(i,62)*3);
      T.C(x,y,r,'#8a8478');T.C(x-1,y-1,Math.max(1,r-1),'#b4aea0');for(let a=0;a<16;a++)T.Pa(x+Math.cos(a/16*6.28)*(r+1.6),y+Math.sin(a/16*6.28)*(r+1.2),'#f2fbf6',.6);}
    for(let i=0;i<4;i++){const y=120+i*230,x=KW-22;T.R(x-6,y,13,3,'#f4f2e8');T.R(x-5,y+3,11,1,'#1d2c3a');for(let j=0;j<10;j++)T.R(x,y-10+j,Math.max(1,6-j*.6),1,'#fbf6ec');T.L(x,y-11,x,y,'#c8c8c0');}}
  /* les murs de pneus, et côté mer la balustrade de la Corniche */
  const pneus=[];
  for(let i=0;i<N;i+=2){const p=P[i];for(const s of [-1,1]){const x=p.x-p.ty*s*(HW+9),y=p.y+p.tx*s*(HW+9);const xi=Math.round(x),yi=Math.round(y);if(xi<2||yi<2||xi>=KW-2||yi>=KH-2)continue;
    if(DIST[yi*KW+xi]<HW+8)continue;if(pneus.some(q=>Math.abs(q[0]-x)<4&&Math.abs(q[1]-y)<4))continue;pneus.push([x,y,pneus.length]);}}
  for(const [x,y,n] of pneus){const xi=Math.round(x),yi=Math.round(y);
    if(C.eau>0&&Math.abs(xi-riveDe(C,yi))<40){/* balustrade : un pilastre de pierre blanche */T.R(xi-1,yi-2,3,4,'#f2ece0');T.P(xi-1,yi-2,'#ffffff');T.dk(xi+2,yi+1,.3);T.dk(xi+2,yi+2,.3);continue;}
    for(let k=1;k<4;k++)T.dk(xi+1+k,yi+1+k,.25);T.C(xi,yi,2,'#141418');T.P(xi,yi,'#4a4a52');
    const c=(Math.floor(n/2)%2)?'#c8322a':'#f2eee4';T.P(xi-1,yi-2,c);T.P(xi,yi-2,c);T.P(xi+1,yi-2,c);}
  /* la ligne et la grille */
  const p0=P[0];const nx=-p0.ty,ny=p0.tx;
  for(let a=-HW+1;a<HW-1;a++)for(let b=0;b<4;b++){const x=Math.round(p0.x+nx*a+p0.tx*(b-2)),y=Math.round(p0.y+ny*a+p0.ty*(b-2));T.P(x,y,((Math.floor((a+30)/2)+Math.floor(b/2))%2)?'#f4f4f0':'#1a1a1e');}
  for(let g=0;g<6;g++){const q=P[(N-8-g*7)%N],side=(g%2?1:-1)*9;const cx=q.x-q.ty*side,cy=q.y+q.tx*side;
    for(let a=-6;a<=6;a++)T.P(Math.round(cx-q.ty*a+q.tx*-8),Math.round(cy+q.tx*a+q.ty*-8),'#e8e4da');
    for(let b=-8;b<=0;b++){T.P(Math.round(cx-q.ty*-6+q.tx*b),Math.round(cy+q.tx*-6+q.ty*b),'#e8e4da');T.P(Math.round(cx-q.ty*6+q.tx*b),Math.round(cy+q.tx*6+q.ty*b),'#e8e4da');}}
  /* décor */
  const libre=(x,y,m)=>x>4&&y>4&&x<KW-4&&y<KH-4&&DIST[y*KW+x]>HW+m&&!dansLEau(C,x,y)&&Math.abs(x-riveDe(C,y))>14;
  const pot=(x,y)=>{T.R(x-3,y+1,7,4,'#a8543a');T.R(x-3,y+1,7,1,'#c06a44');T.C(x,y-1,3,'#2e5a26');T.C(x-1,y-2,2,'#3e7a32');T.P(x+1,y-2,'#d8344a');T.P(x-2,y,'#e85a6a');T.P(x,y-3,'#ffe27a');for(let k=0;k<5;k++)T.dk(x+4+k*.4,y+3+k*.4,.3);};
  const palmier=(x,y)=>{for(let k=0;k<12;k++)for(let q=-6;q<6;q++)if(bay(x+k,y+q)<.4)T.dk(x+8+k,y+8+q,.25);for(let a=0;a<8;a++){const an=a/8*Math.PI*2;for(let r=0;r<11;r++){const xx=x+Math.cos(an)*r,yy=y+Math.sin(an)*r*.9;const w=r<3?2:r<8?1.5:1;for(let q=-w;q<=w;q++)T.P(xx-Math.sin(an)*q,yy+Math.cos(an)*q,(r+q+a)%3?'#3a7a2e':'#2a5a22');}}T.C(x,y,2,'#7a5a3a');};
  const pin=(x,y,r)=>{for(let k=0;k<r+3;k++)for(let j=-r+1;j<r;j++)if(bay(x+r+k,y+j+k)<.5)T.dk(x+r+k-1,y+j+k+1,.3);
    for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const dd=i*i+j*j;if(dd>r*r+r)continue;if(hs(x+i,y+j,40)<.12&&dd>r*r*.5)continue;T.P(x+i,y+j,tone(x+i,y+j,.75-(i+j)/(r*2.6)+(hs(x+i,y+j,41)-.5)*.4,['#1e3a1a','#2a4e22','#3a6a2c','#4e8236']));}};
  const villa=(x,y,w,h,s)=>{for(let k=0;k<6;k++)for(let j=0;j<h;j++)if(bay(x+w+k,y+j+k)<.6)T.dk(x+w+k,y+j+k+2,.3);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const col=(i+((j/4|0)%2)*2)%4;let v=.55+(col===0?.3:col===3?-.22:0)-(j%4===3?.25:0)+(j<h/2?.1:-.1);
      T.P(x+i,y+j,tone(x+i,y+j,v,['#6e3020','#8e4028','#a85234','#c06a44','#d4845a']));}T.R(x,y+(h>>1),w,1,'#5a2418');
    if(s<.5){T.R(x+w-6,y+2,4,4,'#d8c8a8');T.P(x+w-5,y+3,'#3a3028');}else{T.R(x-6,y+h-8,6,8,'#4aa8c8');T.R(x-6,y+h-8,6,1,'#9ae2f0');}};
  for(let i=0;i<220;i++){const x=Math.round(hs(i,70)*KW),y=Math.round(hs(i,71)*KH);
    if(C.eau<0){if(i<14&&libre(x,y,12))(i%3?pot:palmier)(x,y);}
    else{if(i<22&&libre(x,y,20)&&libre(x+26,y+20,16))villa(x,y,22+Math.floor(hs(i,72)*10),16+Math.floor(hs(i,73)*6),hs(i,74));
      else if(libre(x,y,10))(hs(i,75)<.15?palmier:(xx,yy)=>pin(xx,yy,3+Math.floor(hs(i,76)*3)))(x,y);}}
  /* les tribunes, autour de la ligne de départ */
  {const s=C.eau<0?1:-1;for(let j=-40;j<40;j++){const q=P[(j+N)%N];const bx=q.x-q.ty*s*(HW+16),by=q.y+q.tx*s*(HW+16);
    for(let w=0;w<12;w++){const x=Math.round(bx-q.ty*s*w),y=Math.round(by+q.tx*s*w);if(!libre(x,y,12))continue;T.P(x,y,(w%3===0)?'#5a1e18':'#8a3226');
      if(w%3===1&&hs(x,y,77)>.25){T.P(x,y,['#f4d0a8','#c89070','#8a5a3a','#e8b890'][Math.floor(hs(x,y,78)*4)]);}
      if(w%3===2&&hs(x,y,79)>.3)T.P(x,y,['#e8445a','#3d8be8','#f4c23a','#f4f4f0','#7ad06a','#ff8a3a'][Math.floor(hs(x,y,80)*6)]);}}}
  const lampes=[];
  for(let y=60;y<KH;y+=110){const x=Math.round(riveDe(C,y))+(C.eau<0?12:-12);if(DIST[y*KW+x]>HW+6){T.R(x,y-1,3,3,'#2a2c30');lampes.push([x+1,y]);}}
  const c=T.fin();
  return {c,DIST,IDX,lampes};}
function graverDessus(P,lampes,C){const c=document.createElement('canvas');c.width=KW;c.height=KH;const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h);};
  const p0=P[0];const nx=-p0.ty,ny=p0.tx;const xa=p0.x-nx*(HW+4),ya=p0.y-ny*(HW+4),xb=p0.x+nx*(HW+4),yb=p0.y+ny*(HW+4);
  R(xa-1,ya-26,3,28,'#d8bf6a');R(xb-1,yb-26,3,28,'#d8bf6a');
  const x0=Math.min(xa,xb)-2,w=Math.abs(xb-xa)+5;R(x0,ya-30,w,8,'#15201a');R(x0,ya-30,w,1,'#d8bf6a');R(x0,ya-23,w,1,'#d8bf6a');
  g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x0+8,ya-14,w,6);
  g.font='italic 700 6px Georgia';g.textAlign='center';g.fillStyle='#d8bf6a';g.fillText(C.eau<0?'GRAND PRIX DU QUAI':'GRAND PRIX DE LA CORNICHE',x0+w/2,ya-24.6);
  c.feux=[x0+w/2-14,ya-27];
  const COUL=['#e8445a','#3d8be8','#f4c23a','#f4f4f0','#7ad06a','#ff8a3a'];
  for(const i of [Math.floor(P.length*.3),Math.floor(P.length*.62)]){const p=P[i],nx=-p.ty,ny=p.tx;const a=[p.x-nx*(HW+9),p.y-ny*(HW+9)],b=[p.x+nx*(HW+9),p.y+ny*(HW+9)];
    for(let k=0;k<=40;k++){const t=k/40,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*3-8;R(x,y,1,1,'#2a2622');
      if(k%4===2){R(x-1,y+1,3,1,COUL[(k/4|0)%6]);R(x,y+2,1,1,COUL[(k/4|0)%6]);}}}
  for(const [x,y] of lampes){R(x,y-16,1,16,'#2a2c30');R(x-2,y-19,5,3,'#2a2c30');R(x-1,y-18,3,1,'#ffe6a0');}
  return c;}
const MONDES={};
function monde(id){if(MONDES[id])return MONDES[id];const C=CIRCUITS[id],P=construireCircuit(C.ctrl),m=graverCircuit(P,C);
  const M={id,C,P,N:P.length,c:m.c,dessus:graverDessus(P,m.lampes,C)};
  /* la vignette du menu : le tracé en laiton sur vert profond */
  const v=document.createElement('canvas');v.width=88;v.height=150;const g=v.getContext('2d');g.fillStyle='#0e1510';g.fillRect(0,0,88,150);
  const sx=78/KW,sy=140/KH;g.fillStyle=C.eau<0?'#1d4e54':'#145c80';for(let y=0;y<150;y++){const r=riveDe(C,y/sy)*sx+5;if(C.eau<0)g.fillRect(0,y,r,1);else g.fillRect(r,y,88-r,1);}
  g.strokeStyle='#d8bf6a';g.lineWidth=3;g.lineJoin='round';g.beginPath();P.forEach((p,i)=>{const x=5+p.x*sx,y=5+p.y*sy;i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.stroke();
  g.strokeStyle='#15201a';g.lineWidth=1;g.stroke();g.fillStyle='#f4f4f0';g.fillRect(5+P[0].x*sx-4,5+P[0].y*sy-1,8,2);
  M.vignette=v.toDataURL();MONDES[id]=M;return M;}

function karting(ctx){
  const Rt=racine(),son=Son();
  const SK=spritesKart(),SS=spritesSardine();
  const toile=Rt.toile,g=toile.getContext('2d');
  let S=2,AW=195,AH=422;
  function cadrer(){const W=innerWidth,H=(window.visualViewport?visualViewport.height:innerHeight);S=W>=640?3:2;AW=Math.ceil(W/S);AH=Math.ceil(H/S);
    toile.width=AW;toile.height=AH;toile.style.width=AW*S+'px';toile.style.height=AH*S+'px';g.imageSmoothingEnabled=false;}
  cadrer();addEventListener('resize',cadrer);
  const pref=Object.assign({circuit:'quai',diff:'minot',coul:0,cmd:'pouce'},PREFK());
  let M=monde(pref.circuit),P=M.P,N=M.N;
  const marques=document.createElement('canvas');marques.width=KW;marques.height=KH;const gm=marques.getContext('2d');
  const TOURS=3,VMAX=140;
  let ETAT='demo',MODE='libre',K=[],objets=[],parts=[],proj=[],savons=[],t0=0,tFin=0,course=null,cam={x:0,y:0},dernier=0,anim=0,msgT=0,secousse=0,
    depart={appui:-1},contreSens=0,fantome=null,enreg=[],tourPerso=[],enPause=false,pauseT=0;
  const IN={g:false,d:false,drift:false,joy:null};
  /* ---------------- la course ---------------- */
  function changerCircuit(id){M=monde(id);P=M.P;N=M.N;gm.clearRect(0,0,KW,KH);MINI=null;}
  function poserCaisses(){objets=[];if(MODE==='chrono')return;for(const f of [.27,.69]){const i=Math.floor(N*f),p=P[i];for(const o of [-12,0,12])objets.push({x:p.x-p.ty*o,y:p.y+p.tx*o,t:0});}}
  function couleurs(){const c=pref.coul|0;return PILOTES.map((_,n)=>n===0?c:(n===c?0:n));}
  function placerGrille(seul){const cs=couleurs(),f=DIFFS[MODE==='paye'?'minot':pref.diff].f;
    const liste=seul?[0]:[0,1,2,3,4,5];
    /* en course, on part en dernière ligne ; en démo, le premier tient la pole */
    K=liste.map((n,r)=>{const slot=seul?2:(ETAT==='demo'?n:5-r),q=P[(N-14-slot*7)%N],side=(slot%2?1:-1)*9;
      return {n,pal:cs[n],pl:PILOTES[n],x:q.x-q.ty*side,y:q.y+q.tx*side,ang:Math.atan2(q.tx,-q.ty),v:0,slip:0,drift:0,charge:0,boost:0,spin:0,saut:0,
        idx:(N-14-slot*7)%N,vu:(N-14-slot*7)%N,tour:0,prog:0,fini:0,tFini:0,obj:null,objR:0,objT:0,cible:(hs(n,9)-.5)*14,
        skill:n?[1,.97,1.0,.95,.99,.96][n]*f:1,aspi:0,tTour:0,tours:[],meilleurTour:0,place:r+1};});}
  function cri(b,em,cl,dur){Rt.cri.className=cl||'';Rt.cri.querySelector('b').textContent=b;Rt.cri.querySelector('em').textContent=em||'';msgT=dur||1.6;}
  function gros(t,col){const e=Rt.d.querySelector('#crsGros');if(!e)return;e.textContent=t;e.style.color=col||'#d8bf6a';e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}
  /* ---------------- la boucle ---------------- */
  function boucle(t){if(!Rt.d.classList.contains('on')){son.stop();return;}anim=requestAnimationFrame(boucle);
    let dt=Math.min(.05,(t-(dernier||t))/1000);dernier=t;if(!enPause&&(ETAT==='course'||ETAT==='grille'||ETAT==='fin2'||ETAT==='demo'||ETAT==='resultat'))pas(dt);dessiner(t/1000,dt);}
  function maintenant(){return performance.now()-t0-pauseT;}
  function pas(dt){
    if(ETAT==='grille'){const r=maintenant()/1000;const n=3-Math.floor(r);
      if(n!==depart.cd&&n>0){depart.cd=n;gros(String(n));son.bip(440,.18,'square',.06);vibrer(15);}
      if(IN.drift&&depart.appui<0)depart.appui=r;
      if(r>=3){ETAT='course';t0=performance.now();pauseT=0;gros('Partez !','#9fdfb8');son.bip(880,.35,'square',.07);vibrer(30);
        const a=depart.appui,moi=K[0];if(a>=2.75)depart.canon=1;else if(a>=1.2)depart.cale=1;}
      son.moteur(IN.drift?.45:.15);return;}
    if(ETAT==='course'&&depart.canon!==2){const r=maintenant()/1000,moi=K[0];
      if(depart.canon===1){moi.boost=1.3;depart.canon=2;cri('Départ canon !','tu as lâché au bon moment',' or',1.3);son.bip(520,.3,'sawtooth',.06);vibrer(25);}
      else if(depart.appui<0&&IN.drift&&r<.3){depart.canon=1;}
      else if(depart.cale===1){moi.spin=.55;moi.v=0;depart.cale=2;depart.canon=2;cri('Calé !','trop tôt sur DRIFT : attends le vert','b',1.4);son.bip(120,.3,'sawtooth',.06);}
      else if(r>=.3)depart.canon=2;}
    const now=(ETAT==='demo'||ETAT==='resultat')?performance.now():maintenant();
    for(const k of K)piloter(k,dt,now);
    for(let i=0;i<K.length;i++)for(let j=i+1;j<K.length;j++){const a=K[i],b=K[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<11&&d>0){const p=(11-d)/2,ux=dx/d,uy=dy/d;a.x-=ux*p;a.y-=uy*p;b.x+=ux*p;b.y+=uy*p;
      const m=(a.v+b.v)/2;a.v=a.v*.94+m*.06;b.v=b.v*.94+m*.06;if((a.n===0||b.n===0)&&ETAT!=='demo'){vibrer(8);secousse=Math.max(secousse,1.2);}}}
    for(const o of objets){if(o.t>0){o.t-=dt;continue;}for(const k of K){if(!k.fini&&!k.obj&&!k.objR&&Math.hypot(k.x-o.x,k.y-o.y)<9){o.t=3;k.objR=k.n===0?1:.6;k.objT=1+Math.random()*2.2;k.objPris=tirerObjet(k);
        eclats(o.x,o.y,'#ffe27a',8);if(k.n===0&&ETAT!=='demo'){son.bip(1200,.08,'square',.05);}break;}}}
    for(const k of K)if(k.objR>0){k.objR-=dt;if(k.objR<=0){k.objR=0;k.obj=k.objPris;if(k.n===0&&ETAT!=='demo'){son.bip(1600,.1,'square',.05);majObjet(true);}}}
    for(const s of proj){s.vie-=dt;const i=plusProche(P,s.x,s.y,s.idx,12);s.idx=i;
      if(s.t==='sardine'){const q=P[(i+6)%N];let tx=q.x-s.x,ty=q.y-s.y;const cib=K.find(k=>k!==s.de&&!k.spin&&Math.hypot(k.x-s.x,k.y-s.y)<52);if(cib){tx=cib.x-s.x;ty=cib.y-s.y;}
        const L=Math.hypot(tx,ty)||1;s.vx+=(tx/L*275-s.vx)*Math.min(1,dt*6);s.vy+=(ty/L*275-s.vy)*Math.min(1,dt*6);}
      s.x+=s.vx*dt;s.y+=s.vy*dt;s.ang=Math.atan2(s.vx,-s.vy);
      if(s.t==='boule'){const p=P[s.idx],l=(s.x-p.x)*(-p.ty)+(s.y-p.y)*p.tx;if(Math.abs(l)>HW-3){const nx=-p.ty*Math.sign(l),ny=p.tx*Math.sign(l),dd=s.vx*nx+s.vy*ny;if(dd>0){s.vx-=2*dd*nx;s.vy-=2*dd*ny;son.bip(300,.05,'square',.03);}}
        s.rot=(s.rot||0)+dt*12;}
      for(const k of K)if(k!==s.de&&!k.spin&&Math.hypot(k.x-s.x,k.y-s.y)<(s.t==='boule'?9:8)){toucher(k,s.t);s.vie=0;eclats(s.x,s.y,s.t==='boule'?'#c8ccd4':'#a8c8e0',12);}
      if(s.de&&s.t==='boule'&&s.vie<3.6&&Math.hypot(s.de.x-s.x,s.de.y-s.y)<8&&!s.de.spin){toucher(s.de,'boule');s.vie=0;}}
    for(let i=proj.length-1;i>=0;i--)if(proj[i].vie<=0)proj.splice(i,1);
    for(const s of savons){s.vie-=dt;s.arme-=dt;for(const k of K)if(!k.spin&&Math.hypot(k.x-s.x,k.y-s.y)<7&&(k!==s.de||s.arme<=0)){toucher(k,'savon');s.vie=0;eclats(s.x,s.y,'#ffffff',14);}}
    for(let i=savons.length-1;i>=0;i--)if(savons[i].vie<=0)savons.splice(i,1);
    for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.9;p.vy*=.9;p.vie-=dt;}
    for(let i=parts.length-1;i>=0;i--)if(parts[i].vie<=0)parts.splice(i,1);
    if(parts.length>500)parts.splice(0,parts.length-500);
    for(const k of K)k.prog=k.fini?1e9-k.tFini:k.tour*N+((k.idx-0+N)%N);
    const ord=K.slice().sort((a,b)=>b.prog-a.prog);const moi=K[0];const avant=moi.place;ord.forEach((k,i)=>k.place=i+1);
    if(ETAT==='course'&&avant&&moi.place!==avant&&K.length>1){const e=Rt.haut.querySelector('.pos');if(e){e.classList.remove('saute');void e.offsetWidth;e.classList.add('saute');}}
    if(ETAT==='demo'||ETAT==='resultat')return;
    son.moteur(Math.max(.1,moi.v/VMAX)*(moi.boost>0?1.25:1));son.crisse(moi.drift?1:0);
    if(msgT>0){msgT-=dt;if(msgT<=0)Rt.cri.classList.add('cache');}
    /* le fantôme : on enregistre le tour en cours */
    if(MODE==='chrono'&&ETAT==='course'){const t=now-moi.tTour;if(!enreg.length||t-enreg[enreg.length-1][0]>=60)enreg.push([t,Math.round(moi.x*10)/10,Math.round(moi.y*10)/10,Math.round(moi.ang*100)/100]);}
    /* le mauvais sens */
    {const p=P[moi.idx],dot=Math.sin(moi.ang)*p.tx-Math.cos(moi.ang)*p.ty;contreSens=(dot<-.3&&moi.v>15&&ETAT==='course')?contreSens+dt:0;if(contreSens>.9&&contreSens-dt<=.9)cri('Mauvais sens !','fais demi-tour','b',1.6);}
    majHaut(now);
    if(ETAT==='course'&&moi.fini){ETAT='fin2';tFin=performance.now();finir(moi);}
    if(ETAT==='fin2'&&performance.now()-tFin>2800)montrerResultat();
  }
  function tirerObjet(k){const pl=k.place||3,r=Math.random();
    if(pl>=5)return r<.4?'mistral':r<.7?'sardine':r<.9?'boule':'savon';
    if(pl>=3)return r<.25?'mistral':r<.55?'sardine':r<.8?'boule':'savon';
    return r<.45?'savon':r<.7?'boule':r<.9?'sardine':'mistral';}
  function utiliser(k){const o=k.obj;if(!o||k.objR>0)return;k.obj=null;if(k.n===0&&ETAT!=='demo')majObjet();const moi=k.n===0&&ETAT!=='demo';
    if(o==='mistral'){k.boost=Math.max(k.boost,1.6);if(moi){cri('Coup de mistral !','le vent dans le dos',' or',1.1);son.souffle();vibrer(20);}}
    if(o==='sardine'){proj.push({t:'sardine',x:k.x+Math.sin(k.ang)*10,y:k.y-Math.cos(k.ang)*10,vx:Math.sin(k.ang)*275,vy:-Math.cos(k.ang)*275,ang:k.ang,idx:k.idx,vie:2.8,de:k});if(moi)son.bip(700,.12,'triangle',.06);}
    if(o==='boule'){proj.push({t:'boule',x:k.x+Math.sin(k.ang)*11,y:k.y-Math.cos(k.ang)*11,vx:Math.sin(k.ang)*(k.v+120),vy:-Math.cos(k.ang)*(k.v+120),ang:k.ang,idx:k.idx,vie:4,de:k});if(moi)son.bip(260,.12,'square',.06);}
    if(o==='savon'){savons.push({x:k.x-Math.sin(k.ang)*12,y:k.y+Math.cos(k.ang)*12,vie:25,arme:.6,de:k});if(moi)son.bip(500,.1,'sine',.06);}}
  function toucher(k,quoi){if(k.spin>0)return;k.spin=1.05;k.v*=.35;k.drift=0;k.charge=0;
    if(k.n===0&&ETAT!=='demo'){const m={savon:['Glissade !','un savon de Marseille sur la piste'],sardine:['Une sardine !','en plein dans le kart'],boule:['Carreau !','une boule de pétanque, en plein dedans']}[quoi]||['Aïe !',''];
      cri(m[0],m[1],' b',1.3);vibrer([30,40,30]);son.bip(160,.3,'sawtooth',.07);secousse=4;}}
  function eclats(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=20+Math.random()*50;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vie:.35+Math.random()*.3,col});}}
  const wrap=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;};
  function piloter(k,dt,now){
    k.idx=plusProche(P,k.x,k.y,k.idx,24);
    const avant=k.vu;k.vu=k.idx;
    if(avant<N*.25&&k.idx>N*.75)k.tour--;
    if(avant>N*.75&&k.idx<N*.25){k.tour++;const tt=now-(k.tTour||0);
      if(k.tour>1){k.tours.push(tt);if(!k.meilleurTour||tt<k.meilleurTour){const etaitMeilleur=k.meilleurTour;k.meilleurTour=tt;
          if(k.n===0&&MODE==='chrono'&&ETAT==='course')nouveauTourChrono(tt,etaitMeilleur);}
        else if(k.n===0&&MODE==='chrono'&&ETAT==='course')nouveauTourChrono(tt,k.meilleurTour,true);}
      k.tTour=now;if(k.n===0)enreg=[];
      const max=MODE==='chrono'?5:TOURS;
      if(ETAT!=='demo'&&k.tour>max&&!k.fini){k.fini=1;k.tFini=now;}
      else if(ETAT==='course'&&k.n===0&&MODE!=='chrono'){if(k.tour===TOURS){cri('Dernier tour !','',' or',1.6);son.bip(990,.15,'square',.05);setTimeout(()=>son.bip(990,.15,'square',.05),180);}
        else if(k.tour>1)cri('Tour '+k.tour+' / '+TOURS,'bouclé en '+chrono(tt),'',1.4);}}
    const p=P[k.idx],dl=(k.x-p.x)*(-p.ty)+(k.y-p.y)*p.tx,d=Math.abs(dl);
    let dir=0,veutDrift=false;const auto=k.n>0||ETAT==='demo'||window.__AUTO_K||k.fini;
    if(!auto){if(pref.cmd==='boutons'){dir=(IN.d?1:0)-(IN.g?1:0);}
      else if(IN.joy&&IN.joy.m>.25){dir=Math.max(-1,Math.min(1,wrap(IN.joy.a-k.ang)*2.6));}
      veutDrift=IN.drift;}
    else{const la=Math.round(10+k.v/9),q=P[(k.idx+la)%N];const off=Math.max(-14,Math.min(14,k.cible-q.ks*60));
      const tx=q.x-q.ty*off,ty=q.y+q.tx*off;const da=wrap(Math.atan2(tx-k.x,-(ty-k.y))-k.ang);
      dir=Math.max(-1,Math.min(1,da*3.2));veutDrift=Math.abs(P[(k.idx+14)%N].ks)>.09&&k.v>90;
      if(k.obj&&!k.fini){k.objT-=dt;if(k.objT<=0){const dev=K.some(o=>o!==k&&Math.hypot(o.x-k.x,o.y-k.y)<55);if((k.obj!=='sardine'&&k.obj!=='boule')||dev)utiliser(k);else k.objT=.5;}}
      if(Math.random()<dt*.25)k.cible=(Math.random()-.5)*18;}
    let vmax=VMAX;
    if(k.n>0&&ETAT!=='demo'){const moi=K[0];const ec=(k.tour*N+k.idx)-(moi.tour*N+moi.idx);vmax*=k.skill*(ec>70?.9:ec<-90?1.06:1);}
    else if(ETAT==='demo')vmax*=k.skill*.97;
    if(k.fini)vmax*=.5;
    if(d>HW-3)vmax*=.6;
    /* l'aspiration : dans le sillage d'un autre, on gagne */
    let sillage=false;if(k.v>80)for(const o of K){if(o===k)continue;const dx=o.x-k.x,dy=o.y-k.y,fw=dx*Math.sin(k.ang)-dy*Math.cos(k.ang),lat=Math.abs(dx*Math.cos(k.ang)+dy*Math.sin(k.ang));if(fw>8&&fw<34&&lat<7){sillage=true;break;}}
    if(sillage){k.aspi+=dt;if(k.aspi>1.1){k.aspi=0;k.boost=Math.max(k.boost,.7);if(k.n===0&&ETAT==='course'){cri('Aspiration !','tu sors du sillage',' or',.9);son.souffle();}}
      if(Math.random()<.4)parts.push({x:k.x+Math.sin(k.ang)*14+(Math.random()-.5)*8,y:k.y-Math.cos(k.ang)*14,vx:-Math.sin(k.ang)*60,vy:Math.cos(k.ang)*60,vie:.25,col:'#ffffff'});}
    else k.aspi=Math.max(0,k.aspi-dt*2);
    if(k.boost>0){k.boost-=dt;vmax*=1.42;for(let q=0;q<2;q++)parts.push({x:k.x-Math.sin(k.ang)*10+(Math.random()-.5)*3,y:k.y+Math.cos(k.ang)*10+(Math.random()-.5)*3,vx:-Math.sin(k.ang)*40+(Math.random()-.5)*20,vy:Math.cos(k.ang)*40+(Math.random()-.5)*20,vie:.2,col:Math.random()<.5?'#ffb43a':'#fff2a8'});}
    if(k.spin>0){k.spin-=dt;k.v+=(0-k.v)*Math.min(1,dt*3);k.rendu=(k.rendu||0)+dt*14;}else k.rendu=0;
    if(k.spin<=0)k.v+=(vmax-k.v)*Math.min(1,dt*(k.v<vmax?1.1:2.2));
    if(k.saut>0)k.saut-=dt;
    const vf=Math.min(1,Math.max(.3,k.v/VMAX));
    if(veutDrift&&!k.drift&&k.v>55&&k.spin<=0&&Math.abs(dir)>.15){k.drift=Math.sign(dir);k.charge=0;k.saut=.16;if(k.n===0&&!auto)son.bip(220,.08,'square',.04);}
    if(k.drift&&(!veutDrift||k.v<45||k.spin>0)){
      const ch=k.charge;if(ch>2.4){k.boost=Math.max(k.boost,1.4);if(k.n===0&&!auto){cri('Turbo violet !','',' or',.9);vibrer(30);son.bip(620,.3,'sawtooth',.05);secousse=2;}}
      else if(ch>1.5){k.boost=Math.max(k.boost,1.0);if(k.n===0&&!auto){cri('Turbo orange !','',' or',.8);vibrer(25);son.bip(520,.25,'sawtooth',.05);secousse=1.5;}}
      else if(ch>.75){k.boost=Math.max(k.boost,.55);if(k.n===0&&!auto){cri('Turbo !','',' or',.6);vibrer(15);son.bip(420,.2,'sawtooth',.05);}}
      k.drift=0;k.charge=0;}
    let rot;
    if(k.drift){/* au pouce, le kart suit le doigt ; le dérapage ajoute juste un peu d'angle */rot=(pref.cmd==='boutons'||auto)?(k.drift*1.3+dir*.95)*vf:(dir*2.3+k.drift*.5)*vf;k.charge+=dt*(Math.sign(dir)===k.drift?1.2:.7);k.slip+=((-k.drift*.4)-k.slip)*Math.min(1,dt*5);k.v*=1-dt*.05;
      const lvl=k.charge>2.4?'#e070ff':k.charge>1.5?'#ffb43a':k.charge>.75?'#7ac8ff':'#e8e4da';
      for(const s of [-1,1]){const rx=k.x-Math.sin(k.ang)*7+Math.cos(k.ang)*s*6,ry=k.y+Math.cos(k.ang)*7+Math.sin(k.ang)*s*6;gm.fillStyle='rgba(20,20,24,.16)';gm.fillRect(Math.round(rx),Math.round(ry),1,1);
        if(Math.random()<.65)parts.push({x:rx,y:ry,vx:(Math.random()-.5)*36-Math.sin(k.ang)*22,vy:(Math.random()-.5)*36+Math.cos(k.ang)*22,vie:.24,col:lvl});}}
    else{rot=dir*2.6*vf;k.slip+=(0-k.slip)*Math.min(1,dt*6);}
    if(k.spin>0)rot=0;
    k.ang=wrap(k.ang+rot*dt);
    const ha=k.ang+k.slip;k.x+=Math.sin(ha)*k.v*dt;k.y-=Math.cos(ha)*k.v*dt;
    /* le mur : on glisse le long, on ne s'y écrase pas */
    const i2=plusProche(P,k.x,k.y,k.idx,24),p2=P[i2],l2=(k.x-p2.x)*(-p2.ty)+(k.y-p2.y)*p2.tx;
    if(Math.abs(l2)>HW+1){const s=Math.sign(l2);k.x=p2.x-p2.ty*s*(HW+1);k.y=p2.y+p2.tx*s*(HW+1);
      const ta=Math.atan2(p2.tx,-p2.ty);let da=wrap(ta-k.ang);if(Math.abs(da)>Math.PI/2)da=wrap(da+Math.PI);
      const choc=Math.abs(Math.sin(da));k.ang=wrap(k.ang+da*.5);k.v*=1-.5*choc;
      if(choc>.35&&k.v>40){if(k.n===0&&!auto){vibrer(18);son.bip(90,.15,'square',.07);secousse=Math.max(secousse,2.5*choc);}eclats(k.x-p2.ty*s*6,k.y+p2.tx*s*6,'#2a2a2e',5);k.drift=0;k.charge=0;}}
    if(d>HW-3&&k.v>40&&Math.random()<.4)parts.push({x:k.x,y:k.y+3,vx:(Math.random()-.5)*16,vy:(Math.random()-.5)*16,vie:.4,col:'#d2c4a6'});
  }
  function nouveauTourChrono(tt,ancien,pire){const ref=fantome&&fantome.t;
    if(pire){cri(chrono(tt),'+'+((tt-ancien)/1000).toFixed(2)+' s sur ton meilleur tour','b',1.6);return;}
    const ec=ref?tt-ref:null;
    if(!ref||tt<ref){/* nouveau meilleur tour : on garde le fantôme */const pts=enreg.slice();
      fantome={t:tt,pts};try{localStorage.setItem('bdl.kart.fantome.'+M.id,JSON.stringify(fantome));}catch(x){}
      cri('Meilleur tour !',chrono(tt)+(ec!=null?' · '+(ec/1000).toFixed(2)+' s':''),' a',1.8);son.bip(1320,.25,'square',.05);vibrer([20,30,20]);}
    else cri(chrono(tt),'+'+(ec/1000).toFixed(2)+' s sur le fantôme','',1.6);}
  /* ---------------- le dessin ---------------- */
  let MINI=null;
  function dessiner(ts,dt){
    const suivi=ETAT==='demo'?K.slice().sort((a,b)=>b.prog-a.prog)[0]:K[0];if(!suivi)return;
    const vx=suivi.x+Math.sin(suivi.ang)*34,vy=suivi.y-Math.cos(suivi.ang)*34;
    const hautH=ETAT==='demo'?0:AH*.06;
    cam.x+=(vx-AW/2-cam.x)*.12;cam.y+=(vy-AH*.5-hautH-cam.y)*.12;
    cam.x=Math.max(-20,Math.min(KW-AW+20,cam.x));cam.y=Math.max(-40,Math.min(KH-AH+60,cam.y));if(KW<AW)cam.x=(KW-AW)/2;
    secousse=Math.max(0,secousse-(dt||0)*10);const sx=secousse?(Math.random()-.5)*secousse:0,sy=secousse?(Math.random()-.5)*secousse:0;
    const cx=Math.round(cam.x+sx),cy=Math.round(cam.y+sy);
    g.fillStyle=M.C.eau<0?'#1d4e54':'#2a2a22';g.fillRect(0,0,AW,AH);
    g.drawImage(M.c,-cx,-cy);g.drawImage(marques,-cx,-cy);
    g.fillStyle=M.C.eau<0?'rgba(120,170,165,.55)':'rgba(170,220,240,.55)';
    for(let i=0;i<50;i++){const y=(hs(i,2)*KH)|0,r=riveDe(M.C,y);const x=M.C.eau<0?((hs(i,1)*(r-56)+((ts*6+i*13)%20))|0):((r+12+hs(i,1)*(KW-r)+((ts*6+i*13)%20))|0);
      if(M.C.eau<0?x<r-54:x>r+10)g.fillRect(x-cx,y-cy,3,1);}
    for(const o of objets){if(o.t>0)continue;const b=Math.round(Math.sin(ts*4+o.x));const x=Math.round(o.x-cx),y=Math.round(o.y-cy)+b;
      g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-3,y+4-b,9,3);g.fillStyle='#5a3418';g.fillRect(x-5,y-5,10,10);g.fillStyle='#b07a3c';g.fillRect(x-4,y-4,8,8);g.fillStyle='#d09a54';g.fillRect(x-4,y-4,8,1);
      g.fillStyle=(Math.floor(ts*4)%2)?'#ffe27a':'#fff6c8';g.fillRect(x-2,y-3,4,1);g.fillRect(x+1,y-2,1,2);g.fillRect(x-1,y,2,1);g.fillRect(x-1,y+2,2,1);}
    for(const s of savons){const x=Math.round(s.x-cx),y=Math.round(s.y-cy);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-2,y,6,3);g.fillStyle='#e8dcae';g.fillRect(x-3,y-2,6,4);g.fillStyle='#f8f0d0';g.fillRect(x-3,y-2,6,1);
      g.fillStyle='#ffffff';g.fillRect(x+3,y-4,1,1);g.fillRect(x-4,y-3,1,1);g.fillRect(x+1,y-5+Math.round(Math.sin(ts*5)),1,1);}
    /* le fantôme */
    if(MODE==='chrono'&&fantome&&fantome.pts&&fantome.pts.length>2&&ETAT==='course'){const t=maintenant()-K[0].tTour;const pts=fantome.pts;let i=0;while(i<pts.length-2&&pts[i+1][0]<t)i++;
      if(t<=pts[pts.length-1][0]){const a=pts[i],b=pts[i+1],u=Math.max(0,Math.min(1,(t-a[0])/((b[0]-a[0])||1)));const x=a[1]+(b[1]-a[1])*u,y=a[2]+(b[2]-a[2])*u,an=a[3]+wrap(b[3]-a[3])*u;
        const j=((Math.round(an/(Math.PI*2)*NDIR)%NDIR)+NDIR)%NDIR,sp=SK.fant[j];g.globalAlpha=.45;g.drawImage(sp,Math.round(x-cx-sp.r),Math.round(y-cy-sp.r));g.globalAlpha=1;}}
    const tri=K.slice().sort((a,b)=>a.y-b.y);
    for(const k of tri){const a=k.ang+(k.spin>0?k.rendu:0)+k.slip*.6;const i=((Math.round(a/(Math.PI*2)*NDIR)%NDIR)+NDIR)%NDIR;const sp=SK[k.pal][i],om=SK.ombre[i];const h=k.saut>0?2:0;
      g.globalAlpha=.32;g.drawImage(om,Math.round(k.x-cx-om.r+2),Math.round(k.y-cy-om.r+2));g.globalAlpha=1;g.drawImage(sp,Math.round(k.x-cx-sp.r),Math.round(k.y-cy-sp.r-h));
      if(k.boost>0){const bx=Math.round(k.x-cx-Math.sin(k.ang)*11),by=Math.round(k.y-cy+Math.cos(k.ang)*11);g.fillStyle=(Math.floor(ts*20)%2)?'#ffb43a':'#fff2a8';g.fillRect(bx-1,by-1,3,3);g.fillStyle='#ffffff';g.fillRect(bx,by,1,1);}
      if(k.n===0&&ETAT!=='demo'){g.fillStyle='#d8bf6a';const y=Math.round(k.y-cy-sp.r-4-h);g.fillRect(Math.round(k.x-cx)-1,y,3,1);g.fillRect(Math.round(k.x-cx),y+1,1,1);}}
    for(const s of proj){if(s.t==='boule'){const x=Math.round(s.x-cx),y=Math.round(s.y-cy);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-1,y+1,5,3);g.fillStyle='#8a9098';g.fillRect(x-2,y-2,5,5);g.fillRect(x-3,y-1,7,3);g.fillRect(x-1,y-3,3,7);
        g.fillStyle='#d8dce4';g.fillRect(x-1,y-2,2,1);g.fillStyle='#4a5058';g.fillRect(x+Math.round(Math.cos(s.rot)*2),y+Math.round(Math.sin(s.rot)*2),1,1);continue;}
      const i=((Math.round(s.ang/(Math.PI*2)*16)%16)+16)%16,sp=SS[i];g.drawImage(sp,Math.round(s.x-cx-sp.r),Math.round(s.y-cy-sp.r));}
    for(const p of parts){g.fillStyle=p.col;g.fillRect(Math.round(p.x-cx),Math.round(p.y-cy),1,1);}
    g.drawImage(M.dessus,-cx,-cy);
    if(ETAT==='grille'||ETAT==='course'){const r=maintenant()/1000;const [fx,fy]=M.dessus.feux;for(let i=0;i<5;i++){const on=ETAT==='grille'?(i<Math.min(5,Math.floor(r*5/3)+1)):false;
      g.fillStyle=ETAT==='course'?(r<1.5?'#4ae070':'#2a3a2a'):(on?'#ff3a2a':'#3a2020');g.fillRect(Math.round(fx+i*7-cx),Math.round(fy-cy),3,3);}}
    /* les traits de vitesse au turbo */
    const moi=K[0];if(ETAT!=='demo'&&moi&&moi.boost>0){g.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<16;i++){const x=(hs(i,Math.floor(ts*12))*AW)|0,y=(hs(i+50,Math.floor(ts*12))*AH)|0;if(Math.abs(x-AW/2)<AW*.28)continue;g.fillRect(x,y,1,6+(i%3)*3);}}
    if(ETAT!=='demo'&&ETAT!=='resultat')miniCarte();
  }
  function miniCarte(){const w=50,h=Math.round(w*KH/KW*.62),sx=w/KW,sy=h/KH,x0=AW-w-6,y0=Math.round(AH*.2);
    if(!MINI){MINI=document.createElement('canvas');MINI.width=w;MINI.height=h;const m=MINI.getContext('2d');m.fillStyle='rgba(8,14,8,.62)';m.fillRect(0,0,w,h);
      m.fillStyle='rgba(216,191,106,.35)';m.fillRect(0,0,w,1);m.fillRect(0,h-1,w,1);m.fillRect(0,0,1,h);m.fillRect(w-1,0,1,h);
      m.fillStyle='rgba(238,243,228,.55)';for(const p of P)m.fillRect(Math.round(p.x*sx),Math.round(p.y*sy),1,1);}
    g.drawImage(MINI,x0,y0);for(let i=K.length-1;i>=0;i--){const k=K[i];g.fillStyle=PILOTES[k.pal].b;const s=k.n===0?3:2;g.fillRect(Math.round(x0+k.x*sx-s/2),Math.round(y0+k.y*sy-s/2),s,s);}}
  /* ---------------- les bandeaux de course ---------------- */
  let hautCle='';
  function majHaut(now){const moi=K[0];const max=MODE==='chrono'?5:TOURS;const cle=[moi.place,Math.min(moi.tour,max),Math.floor(now/100),moi.objR>0?Math.floor(now/80):0].join();if(cle===hautCle)return;hautCle=cle;
    const d=Rt.haut;const pl=moi.place||1;
    if(MODE==='chrono'){d.querySelector('.pos').innerHTML='<span class="chr">'+(moi.meilleurTour?chrono(moi.meilleurTour):'—')+'</span><small>MEILLEUR TOUR</small>';}
    else d.querySelector('.pos').innerHTML=pl+'<sup>'+(pl===1?'er':'e')+'</sup><small>/ '+K.length+'</small>';
    d.querySelector('.tr').textContent='TOUR '+Math.max(1,Math.min(moi.tour,max))+' / '+max;
    d.querySelector('.ch').textContent=chrono(MODE==='chrono'?now-moi.tTour:now);
    if(moi.objR>0){const o=Object.keys(OBJETS);d.querySelector('.slot').textContent=OBJETS[o[Math.floor(now/80)%o.length]].ic;d.querySelector('.slot').classList.add('roule');}
    const jg=Rt.pied.querySelector('.jg i');if(jg){const c=moi.drift?Math.min(1,moi.charge/2.4):moi.boost>0?1:0;jg.style.width=Math.round(c*100)+'%';
      jg.className=moi.drift?(moi.charge>2.4?'violet':moi.charge>1.5?'orange':moi.charge>.75?'bleu':''):moi.boost>0?'orange':'';}
    const w=Rt.pied.querySelector('.w');if(w)w.textContent=Math.round(moi.v*.55)+' km/h';}
  function majObjet(neuf){const s=Rt.haut.querySelector('.slot');if(!s)return;const o=K[0].obj;s.classList.remove('roule');s.textContent=o?OBJETS[o].ic:'';s.classList.toggle('vide',!o);
    const b=Rt.pied.querySelector('[data-k=obj]');if(b){b.innerHTML=o?OBJETS[o].ic+'<small>'+OBJETS[o].nom.toUpperCase()+'</small>':'<small>OBJET</small>';b.classList.toggle('vide',!o);}
    if(neuf){s.classList.remove('pop');void s.offsetWidth;s.classList.add('pop');}}
  function habiller(){
    Rt.haut.style.display='';Rt.pied.style.display='';Rt.d.classList.add('course','kart');
    const C=M.C;
    Rt.haut.innerHTML='<div class="kh"><div class="pos">6<sup>e</sup><small>/ 6</small></div><div class="mil"><span class="tr">TOUR 1 / 3</span><span class="ch">0:00.00</span><span class="t">'+C.court+' · '+(MODE==='paye'?'GRAND PRIX · 5 €':MODE==='chrono'?'CONTRE-LA-MONTRE':'COURSE LIBRE · '+DIFFS[pref.diff].nom.toUpperCase())+'</span></div>'+
      (MODE==='chrono'?'':'<div class="slot vide"></div>')+'<button class="pause" aria-label="Pause">❚❚</button></div>';
    Rt.haut.querySelector('.pause').onclick=pause;
    const fl=d=>'<svg width="28" height="28" viewBox="0 0 24 24"><path d="'+(d<0?'M15 4 7 12l8 8':'m9 4 8 8-8 8')+'" fill="none" stroke="#eef3e4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const objBtn=MODE==='chrono'?'':'<button class="obj vide" data-k="obj"><small>OBJET</small></button>';
    if(pref.cmd==='boutons'){Rt.pied.innerHTML='<div class="bas"><span>TURBO</span><div class="jg"><i></i></div><span class="w">0 km/h</span></div>'+
      '<div class="cmd"><button data-k="g">'+fl(-1)+'</button><button data-k="d">'+fl(1)+'</button><button class="or" data-k="drift">DRIFT</button>'+objBtn+'</div>';
      tenir(Rt.pied.querySelector('[data-k=g]'),()=>IN.g=true,()=>IN.g=false);tenir(Rt.pied.querySelector('[data-k=d]'),()=>IN.d=true,()=>IN.d=false);}
    else{Rt.pied.innerHTML='<div class="bas"><span>TURBO</span><div class="jg"><i></i></div><span class="w">0 km/h</span></div>'+
      '<div class="cmd pouce"><div class="zone"><b>☚ ☛</b><span>POSE TON POUCE ICI<br>ET MONTRE LA DIRECTION</span></div><button class="or" data-k="drift">DRIFT</button>'+objBtn+'</div>';}
    tenir(Rt.pied.querySelector('[data-k=drift]'),()=>IN.drift=true,()=>IN.drift=false);
    const ob=Rt.pied.querySelector('[data-k=obj]');if(ob)tenir(ob,()=>{if(ETAT==='course')utiliser(K[0]);},null);
    Rt.pad.style.display=pref.cmd==='boutons'?'none':'block';
    const placer=()=>{Rt.cri.style.top=Rt.haut.offsetHeight+'px';Rt.d.style.setProperty('--pied',Rt.pied.offsetHeight+'px');Rt.d.style.setProperty('--haut',Rt.haut.offsetHeight+'px');
      const z=Rt.pied.querySelector('.zone');if(z){const r=z.getBoundingClientRect();Rt.d.style.setProperty('--padR',(innerWidth-r.right)+'px');}};
    placer();setTimeout(placer,60);}
  /* le pouce : un joystick qui apparaît là où l'on pose le doigt */
  (function(){const pad=Rt.pad,base=pad.querySelector('.base'),bout=pad.querySelector('.bout');let id=null,ox=0,oy=0;
    pad.onpointerdown=ev=>{if(id!==null)return;ev.preventDefault();id=ev.pointerId;try{pad.setPointerCapture(id);}catch(x){}ox=ev.clientX;oy=ev.clientY;
      base.style.left=ox+'px';base.style.top=oy+'px';base.classList.add('on');bout.style.transform='translate(-50%,-50%)';IN.joy={a:0,m:0};};
    pad.onpointermove=ev=>{if(ev.pointerId!==id)return;let dx=ev.clientX-ox,dy=ev.clientY-oy;const L=Math.hypot(dx,dy),R=46;
      if(L>R){ox+=dx*(1-R/L);oy+=dy*(1-R/L);base.style.left=ox+'px';base.style.top=oy+'px';dx=ev.clientX-ox;dy=ev.clientY-oy;}
      IN.joy={a:Math.atan2(dx,-dy),m:Math.min(1,Math.hypot(dx,dy)/R)};bout.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';};
    const fin=ev=>{if(ev.pointerId!==id)return;id=null;IN.joy=null;base.classList.remove('on');};pad.onpointerup=fin;pad.onpointercancel=fin;pad.onlostpointercapture=fin;})();
  const clav=(ev,v)=>{if(!Rt.d.classList.contains('on')||ETAT==='demo')return;const k=ev.key;if(k==='ArrowLeft'||k==='q'||k==='a')IN.g=v;else if(k==='ArrowRight'||k==='d')IN.d=v;else if(k===' '||k==='Shift'||k==='ArrowDown')IN.drift=v;else if(v&&(k==='ArrowUp'||k==='e'||k==='z')&&ETAT==='course')utiliser(K[0]);else if(v&&k==='Escape')pause();else return;
    if(pref.cmd!=='boutons'&&(k==='ArrowLeft'||k==='ArrowRight'||k==='q'||k==='a'||k==='d')){const moi=K[0];if(moi){const dir=(IN.d?1:0)-(IN.g?1:0);IN.joy=dir?{a:moi.ang+dir*1.2,m:1}:null;}}ev.preventDefault();};
  const kd=ev=>clav(ev,true),ku=ev=>clav(ev,false);addEventListener('keydown',kd);addEventListener('keyup',ku);
  /* ---------------- pause ---------------- */
  let pauseDebut=0;
  function pause(){if(ETAT!=='course'&&ETAT!=='grille')return;if(enPause)return;enPause=true;pauseDebut=performance.now();son.moteur(0);son.crisse(0);
    const p=Rt.d.querySelector('#crsPause');p.innerHTML='<div class="carte"><div class="ti">PAUSE</div><h2>'+M.C.nom+'</h2><p class="so">'+(MODE==='paye'?'Si tu abandonnes, l’engagement de 5 € est perdu.':'La course t’attend.')+'</p>'+
      '<div class="deux col"><button class="or" data-a="rep">REPRENDRE</button>'+(MODE!=='paye'?'<button data-a="rec">RECOMMENCER</button>':'')+'<button data-a="ab">'+(MODE==='paye'?'ABANDONNER':'QUITTER LA COURSE')+'</button></div></div>';
    p.classList.add('on');
    p.querySelector('[data-a=rep]').onclick=()=>{p.classList.remove('on');pauseT+=performance.now()-pauseDebut;enPause=false;dernier=0;};
    const r=p.querySelector('[data-a=rec]');if(r)r.onclick=()=>{p.classList.remove('on');enPause=false;lancer(MODE);};
    p.querySelector('[data-a=ab]').onclick=()=>{p.classList.remove('on');enPause=false;accueil();};}
  /* ---------------- départ, arrivée ---------------- */
  async function lancer(mode,msg){
    MODE=mode;course={id:null};
    if(mode==='paye'){if(msg)msg.textContent='On paie l’engagement…';const r=await ctx.rpc('course_debut',{p_jeu:M.C.jeu});
      if(!r||r.erreur){if(msg)msg.textContent=(r&&r.erreur)||'La caisse ne répond pas. Réessaie.';return;}
      course={id:r.id};if(typeof r.euros==='number')ctx.majEuros(r.euros);}
    Rt.menu.classList.remove('on');IN.g=IN.d=IN.drift=false;IN.joy=null;
    ETAT='grille';placerGrille(mode==='chrono');poserCaisses();proj=[];savons=[];parts=[];gm.clearRect(0,0,KW,KH);depart={appui:-1,cd:0};contreSens=0;enreg=[];
    fantome=null;if(mode==='chrono'){try{fantome=JSON.parse(localStorage.getItem('bdl.kart.fantome.'+M.id)||'null');}catch(x){}}
    habiller();majObjet();cam.x=K[0].x-AW/2;cam.y=K[0].y-AH*.6;t0=performance.now();pauseT=0;resultat=null;
    cri(mode==='chrono'?'Contre-la-montre':'Au départ !',mode==='chrono'?(fantome?'bats ton fantôme : '+chrono(fantome.t):'cinq tours, ton meilleur tour devient ton fantôme'):'appuie sur DRIFT pile au vert : départ canon','',2.6);}
  let resultat=null;
  async function finir(moi){const temps=Math.round(moi.tFini);son.crisse(0);
    if(MODE==='chrono'){gros('Terminé !');son.bip(880,.2,'square',.06);resultat={chrono:true};return;}
    const place=moi.place;gros(place===1?'Victoire !':ordinal(place),place===1?'#d8bf6a':'#eef3e4');
    son.bip(660,.15,'square',.06);setTimeout(()=>son.bip(880,.15,'square',.06),160);setTimeout(()=>son.bip(1320,.3,'square',.06),320);vibrer([40,60,40]);
    resultat={place,temps,srv:null};
    if(course&&course.id){resultat.srv=await ctx.rpc('course_fin',{p_id:course.id,p_place:place,p_temps_ms:temps,p_pseudo:ctx.pseudo||''});
      if(resultat.srv&&typeof resultat.srv.euros==='number')ctx.majEuros(resultat.srv.euros);}
    try{const rec=PREFK().meilleurs||{};const k=M.id+'_'+MODE;if(!rec[k]||temps<rec[k]){rec[k]=temps;SAUVEK({meilleurs:rec});}}catch(x){}}
  function podium(ordre){const c=document.createElement('canvas');c.width=120;c.height=64;const q=c.getContext('2d');q.imageSmoothingEnabled=false;
    const marches=[[44,30,32,'1'],[8,40,32,'2'],[80,46,32,'3']];
    marches.forEach(([x,y,w,t],i)=>{q.fillStyle='#2f4433';q.fillRect(x,y,w,64-y);q.fillStyle='#d8bf6a';q.fillRect(x,y,w,1);q.fillStyle='#15201a';q.fillRect(x,y+1,w,1);
      q.font='700 10px Georgia';q.textAlign='center';q.fillStyle='#d8bf6a';q.fillText(t,x+w/2,y+14);
      const k=ordre[i];if(k){const sp=SK[k.pal][0];q.drawImage(sp,Math.round(x+w/2-sp.r),y-sp.r*2+4);}});
    return c.toDataURL();}
  function montrerResultat(){if(ETAT==='resultat')return;ETAT='resultat';son.moteur(0);son.crisse(0);Rt.d.classList.remove('course');
    const moi=K[0];Rt.haut.style.display='none';Rt.pied.style.display='none';Rt.cri.classList.add('cache');Rt.pad.style.display='none';
    let h='';
    if(MODE==='chrono'){const best=moi.meilleurTour;
      h='<div class="ti">'+M.C.court+' · CONTRE-LA-MONTRE</div><h2>'+(best?chrono(best):'—')+'</h2><p class="so">ton meilleur tour'+(fantome&&fantome.t===best?' · <b style="color:#d8bf6a">nouveau fantôme</b>':'')+'</p>'+
        '<div class="pod">'+moi.tours.map((t,i)=>'<div class="'+(t===best?'moi':'')+'"><i>'+(i+1)+'</i><span>Tour '+(i+1)+'</span><em>'+chrono(t)+'</em></div>').join('')+'</div>';}
    else{const ordre=K.slice().sort((a,b)=>(b.fini-a.fini)||(a.fini?a.tFini-b.tFini:b.prog-a.prog));const s=resultat&&resultat.srv;
      h='<div class="ti">'+M.C.court+' · '+(MODE==='paye'?'GRAND PRIX':'COURSE LIBRE · '+DIFFS[pref.diff].nom.toUpperCase())+'</div>'+
        '<img class="podium" src="'+podium(ordre)+'" alt=""><h2>'+(moi.place===1?'Victoire !':ordinal(moi.place)+' place')+'</h2><p class="so">'+chrono(moi.tFini)+(moi.meilleurTour?' · meilleur tour '+chrono(moi.meilleurTour):'')+'</p>';
      if(MODE==='paye'){if(s&&!s.erreur)h+='<div class="gain">'+(s.gain?'+ '+fr(s.gain):'0 €')+'</div><p class="so">'+(s.gain?'versés sur ton compte':'pas de gain : il faut finir dans les quatre premiers')+(s.record?'<br><b style="color:#d8bf6a">Nouveau record personnel !</b>':'')+'</p>';
        else h+='<p class="so" style="color:#ffb0a0">'+echap((s&&s.erreur)||'Le résultat n’a pas pu être enregistré.')+'</p>';}
      h+='<div class="pod">'+ordre.map((k,i)=>'<div class="'+(k.n===0?'moi':'')+'"><i>'+(i+1)+'</i><q style="background:'+PILOTES[k.pal].b+'"></q><span>'+(k.n===0?echap(ctx.pseudo||'Toi'):k.pl.nom)+'</span><em>'+(k.fini?chrono(k.tFini):'—')+'</em></div>').join('')+'</div>';}
    h+='<div class="deux"><button data-a="menu">LE MENU</button><button class="or" data-a="re">'+(MODE==='paye'?'REJOUER · 5 €':'REJOUER')+'</button></div><div class="msg"></div>';
    Rt.menu.innerHTML='<div class="fenetre">'+h+'</div>';Rt.menu.classList.add('on');
    Rt.menu.querySelector('[data-a=menu]').onclick=()=>accueil();const m=Rt.menu.querySelector('.msg');Rt.menu.querySelector('[data-a=re]').onclick=()=>lancer(MODE,m);
    demarrerDemo(false);}
  /* ---------------- le menu ---------------- */
  function demarrerDemo(reset){if(reset!==false)ETAT='demo';if(reset!==false){MODE='libre';placerGrille(false);poserCaisses();proj=[];savons=[];parts=[];gm.clearRect(0,0,KW,KH);}
    Rt.d.classList.remove('course');Rt.pad.style.display='none';Rt.haut.style.display='none';Rt.pied.style.display='none';Rt.cri.classList.add('cache');son.moteur(0);son.crisse(0);}
  let RECS={records:{},restant_karting:null},CLAS={};
  async function chargerRecords(){const r=await ctx.rpc('course_mes_records',{});if(r&&!r.erreur){RECS=Object.assign(r,{charge:1});if(!RECS.records)RECS.records={};}}
  function carteCircuit(){const C=M.C,rec=RECS.records&&RECS.records[C.jeu],loc=(PREFK().meilleurs||{});
    const lb=Object.keys(loc).filter(k=>k.startsWith(M.id+'_')).map(k=>loc[k]);
    return '<div class="circ"><button class="fl" data-a="cprev" aria-label="Circuit précédent">‹</button><div class="cc"><img src="'+M.vignette+'" alt=""><div class="ci"><small>CIRCUIT '+(ORDRE_C.indexOf(M.id)+1)+' / '+ORDRE_C.length+'</small><b>'+C.nom+'</b><em>'+C.desc+'</em>'+
      '<span class="rec">'+(rec?'TON RECORD · '+chrono(rec):'PAS ENCORE DE RECORD')+'</span></div></div><button class="fl" data-a="cnext" aria-label="Circuit suivant">›</button></div>';}
  function accueil(){demarrerDemo(true);
    const rest=RECS.restant_karting;
    Rt.menu.innerHTML='<div class="accueil"><div class="titre"><div class="ti">LE VIEUX-PORT · KARTING</div><h1>Grand Prix<br><i>du Quai</i></h1></div>'+carteCircuit()+
      '<button class="ved" data-a="paye"><small>GRAND PRIX · 5 €</small><b>La course aux euros</b><em>1er : 20 € · 2e : 12 € · 3e : 7 € · 4e : 3 €'+(typeof rest==='number'?' · '+Math.max(0,rest)+' aujourd’hui':'')+'</em><span class="go">5 €</span></button>'+
      '<div class="duo"><button class="ved gris" data-a="libre"><small>GRATUIT</small><b>Course libre</b><em>'+DIFFS[pref.diff].nom+' · '+DIFFS[pref.diff].sous+'</em></button>'+
      '<button class="ved gris" data-a="chrono"><small>SEUL EN PISTE</small><b>Contre-la-montre</b><em>bats ton fantôme</em></button></div><div class="msg"></div>'+
      '<div class="trio"><button data-a="garage"><span>🏎️</span>GARAGE</button><button data-a="clas"><span>🏆</span>CLASSEMENT</button><button data-a="aide"><span>❔</span>COMMENT JOUER</button></div></div>';
    Rt.menu.classList.add('on');brancherAccueil();
    if(!RECS.charge){RECS.charge=1;chargerRecords().then(()=>{if(ETAT==='demo'&&Rt.menu.querySelector('.accueil'))accueil();});}}
  function brancherAccueil(){const q=s=>Rt.menu.querySelector(s),msg=q('.msg');
    q('[data-a=cprev]').onclick=()=>{const i=(ORDRE_C.indexOf(M.id)+ORDRE_C.length-1)%ORDRE_C.length;pref.circuit=ORDRE_C[i];SAUVEK({circuit:pref.circuit});changerCircuit(pref.circuit);accueil();};
    q('[data-a=cnext]').onclick=()=>{const i=(ORDRE_C.indexOf(M.id)+1)%ORDRE_C.length;pref.circuit=ORDRE_C[i];SAUVEK({circuit:pref.circuit});changerCircuit(pref.circuit);accueil();};
    q('[data-a=paye]').onclick=()=>lancer('paye',msg);q('[data-a=chrono]').onclick=()=>lancer('chrono',msg);
    q('[data-a=libre]').onclick=()=>ecranLibre();q('[data-a=garage]').onclick=()=>ecranGarage();q('[data-a=clas]').onclick=()=>ecranClassement();q('[data-a=aide]').onclick=()=>ecranAide();}
  function fenetre(titre,sous,corps){Rt.menu.innerHTML='<div class="fenetre"><button class="retour" data-a="ret">‹ RETOUR</button><div class="ti">'+titre+'</div><h2>'+sous+'</h2>'+corps+'</div>';Rt.menu.classList.add('on');
    Rt.menu.querySelector('[data-a=ret]').onclick=accueil;Rt.menu.scrollTop=0;}
  function ecranLibre(){fenetre('COURSE LIBRE · '+M.C.court,'La cylindrée','<p class="so">Gratuit, sans gain ni record. Les autres pilotes vont plus ou moins vite selon la cylindrée.</p>'+
      Object.keys(DIFFS).map(k=>'<button class="ved '+(k===pref.diff?'':'gris')+'" data-d="'+k+'"><small>'+(k==='pitchoun'?'★':k==='minot'?'★★':'★★★')+'</small><b>'+DIFFS[k].nom+'</b><em>'+DIFFS[k].sous+'</em><span class="go">ROULER</span></button>').join(''));
    Rt.menu.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{pref.diff=b.dataset.d;SAUVEK({diff:pref.diff});lancer('libre');});}
  function ecranGarage(){const cs=PILOTES.map((p,i)=>'<button class="kc '+(i===(pref.coul|0)?'on':'')+'" data-c="'+i+'"><img src="'+(()=>{const c=document.createElement('canvas');c.width=30;c.height=30;const q=c.getContext('2d');const sp=SK[i][0];q.drawImage(sp,15-sp.r,15-sp.r);return c.toDataURL();})()+'" alt=""><span>'+p.coul+'</span></button>').join('');
    fenetre('LE GARAGE','Ton kart','<div class="garage">'+cs+'</div><div class="rub">LA CONDUITE</div>'+
      '<button class="ved '+(pref.cmd!=='boutons'?'':'gris')+'" data-m="pouce"><small>RECOMMANDÉ</small><b>Au pouce</b><em>pose le pouce n’importe où à gauche et montre la direction : le kart y va. La gauche reste la gauche, même en descendant.</em></button>'+
      '<button class="ved '+(pref.cmd==='boutons'?'':'gris')+'" data-m="boutons"><small>CLASSIQUE</small><b>Aux boutons ◀ ▶</b><em>tourner à gauche ou à droite du kart, comme un volant</em></button>');
    Rt.menu.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{pref.coul=+b.dataset.c;SAUVEK({coul:pref.coul});placerGrille(false);ecranGarage();});
    Rt.menu.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{pref.cmd=b.dataset.m;SAUVEK({cmd:pref.cmd});ecranGarage();});}
  async function ecranClassement(){const id=M.id;
    fenetre('LES MEILLEURS TEMPS','Classement','<div class="onglets">'+ORDRE_C.map(c=>'<button data-c="'+c+'" class="'+(c===id?'on':'')+'">'+CIRCUITS[c].nom+'</button>').join('')+'</div><div class="cl"><div class="vide">Chargement…</div></div><p class="so" style="margin-top:10px">Trois tours en Grand Prix à 5 €. Ton record compte dès la ligne franchie.</p>');
    Rt.menu.querySelectorAll('.onglets [data-c]').forEach(b=>b.onclick=()=>{pref.circuit=b.dataset.c;SAUVEK({circuit:pref.circuit});changerCircuit(pref.circuit);demarrerDemo(true);ecranClassement();});
    const cl=await ctx.rpc('course_classement',{p_jeu:CIRCUITS[id].jeu});const box=Rt.menu.querySelector('.cl');if(!box)return;
    if(Array.isArray(cl)&&cl.length)box.innerHTML=cl.map((r,i)=>'<div class="'+(r.moi?'moi':'')+'"><i>'+(i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1)+'</i><span>'+echap(r.pseudo)+'</span><em>'+chrono(r.ms)+'</em></div>').join('');
    else box.innerHTML='<div class="vide">Personne n’a encore couru ici. La première place est libre.</div>';}
  function ecranAide(){fenetre('COMMENT JOUER','Les règles du Grand Prix',
    '<div class="aide"><div><span>👆</span><p><b>Conduire au pouce.</b> Pose le pouce à gauche de l’écran et montre où aller : le kart tourne vers là. Il accélère tout seul.</p></div>'+
    '<div><span>🔥</span><p><b>Le dérapage turbo.</b> Tiens <b>DRIFT</b> en tournant : les étincelles passent au <b style="color:#7ac8ff">bleu</b>, à l’<b style="color:#ffb43a">orange</b>, puis au <b style="color:#e070ff">violet</b>. Lâche : plus c’est long, plus le turbo pousse.</p></div>'+
    '<div><span>🚦</span><p><b>Le départ canon.</b> Appuie sur DRIFT juste quand les feux passent au vert. Trop tôt, tu cales.</p></div>'+
    '<div><span>💨</span><p><b>L’aspiration.</b> Colle-toi derrière un kart une seconde : tu sors du sillage avec un coup de vitesse.</p></div>'+
    '<div><span>📦</span><p><b>Les caisses.</b> 🐟 la sardine file sur celui de devant · ⚫ la boule de pétanque part tout droit et rebondit sur les pneus · 🧼 le savon se pose derrière toi · 🌬️ le mistral te pousse.</p></div>'+
    '<div><span>⏱️</span><p><b>Contre-la-montre.</b> Cinq tours seul en piste. Ton meilleur tour devient un fantôme bleu à battre.</p></div></div>');}
  function fermer(){cancelAnimationFrame(anim);son.stop();son.moteur(0);son.crisse(0);Rt.d.classList.remove('on','course','kart');Rt.pad.style.display='none';
    removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('resize',cadrer);Rt.fer.onclick=null;try{ctx.fermer&&ctx.fermer();}catch(x){}}
  Rt.fer.onclick=fermer;Rt.d.classList.add('on','kart');accueil();dernier=0;anim=requestAnimationFrame(boucle);
  return {fermer,_dbg:()=>({K,P,ETAT,MODE,IN,objets,course,cam,AW,AH,M:M.id,depart,fantome,proj})};
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
    portes=[];let k=0;for(let y=MH-420;y>ARR+140;y-=250){const a=bG(y)+12,b=bD(y)-12,w=b-a;const larg=Math.min(56,w*.62);const c=a+larg/2+rnd()*(w-larg);
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
  /* LA NOUVELLE FAÇON D'AVANCER : le kayak garde le cap, toujours vers la mer.
     Un coup de pagaie pousse en avant et fait GLISSER de côté (à gauche, on
     part à droite) — il ne fait plus pivoter la coque. Alterner = tout droit ;
     deux coups du même côté = un écart franc pour passer une porte. Le
     rythme est large et indulgent : il récompense, il ne punit presque pas. */
  const ACC=24,TRAINE=.5,RY={ideal:.42,min:.17,max:.9,fen:.13};
  function placer(){KY=KPILOTES.map((pl,n)=>{const y=MH-135-(n%2)*14,a=B.bG(y)+14,b=B.bD(y)-14;const x=a+(b-a)*(n+.5)/KPILOTES.length;
    return {n,pl,x,y,ang:0,v:0,vl:0,cote:0,dernier:-9,coup:0,coupT:0,energie:1,combo:0,pen:0,porte:0,fini:0,tFini:0,choc:0,
      skill:n?[0,.86,.9,.83,.88][n]:1,phase:Math.random(),lane:(Math.random()-.5)*.5};});}
  function cri(b,em,cl,dur){Rt.cri.className=cl||'';Rt.cri.querySelector('b').textContent=b;Rt.cri.querySelector('em').textContent=em||'';msgT=dur||1.4;}
  function pagayer(k,cote,now){if(k.fini||ETAT!=='course')return;
    const dtc=(now-k.dernier)/1000;let q;
    if(cote===k.cote&&dtc<.9)q='meme';else if(dtc<RY.min)q='vite';else if(dtc<=RY.max)q=Math.abs(dtc-RY.ideal)<RY.fen?'parfait':'bien';else q='lent';
    let imp=q==='parfait'?1.25:q==='bien'?1:q==='lent'?.9:q==='meme'?.8:.6;
    imp*=.7+.3*k.energie;if(k.n>0)imp*=k.skill;
    k.energie=Math.max(0,k.energie-(q==='vite'?.06:.012));
    if(q==='parfait')k.combo++;else if(q!=='bien'&&q!=='meme')k.combo=0;
    imp*=1+Math.min(6,k.combo)*.025;
    k.v=Math.min(125,k.v+ACC*imp);
    /* l'écart : un coup à gauche fait glisser vers la droite */
    k.vl+=(cote<0?1:-1)*(q==='meme'?30:11);
    k.cote=cote;k.dernier=now;k.coup=cote;k.coupT=.28;
    const sx=k.x+cote*14,sy=k.y;for(let i=0;i<6;i++)parts.push({x:sx,y:sy,vx:(Math.random()-.5)*30,vy:(Math.random()-.5)*30+20,vie:.3+Math.random()*.2,col:'#ffffff'});
    if(k.n===0){son.plouf();vibrer(8);
      if(q==='parfait'&&k.combo>=3)cri('Parfait ×'+k.combo,'garde ce rythme','a',.8);
      else if(q==='vite')cri('Doucement !','laisse glisser entre deux coups','b',.9);
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
    if((k.n>0||window.__AUTO_K)&&!k.fini){/* le pagayeur : il vise la porte suivante et choisit son côté */
      const p=portes.find(q=>q.y<k.y-6);const tx=p?(p.x1+p.x2)/2+(p.x2-p.x1)*k.lane*.4:(B.bG(ARR)+B.bD(ARR))/2;
      const per=RY.ideal/k.skill+(Math.sin(now/900+k.phase*6)*.03);
      if((now-k.dernier)/1000>per){const dx=tx-(k.x+k.vl*.6);let cote=-k.cote||1;if(dx>7)cote=-1;else if(dx<-7)cote=1;
        if(Math.random()<.03)cote=-cote;pagayer(k,cote,now);}}
    /* le bateau glisse, ralentit ; l'écart s'amortit */
    k.v*=Math.pow(TRAINE,dt);if(k.v<3)k.v=0;
    k.vl*=Math.pow(.12,dt);
    /* un léger courant éloigne des falaises : on ne s'y colle plus sans le vouloir */
    const a0=B.bG(k.y),b0=B.bD(k.y);if(k.x-a0<22)k.vl+=(22-(k.x-a0))*2.2*dt;if(b0-k.x<22)k.vl-=(22-(b0-k.x))*2.2*dt;
    if(!k.fini)k.energie=Math.min(1,k.energie+dt*.15);
    k.x+=k.vl*dt;k.y-=k.v*dt;
    /* la coque s'incline dans le sens de l'écart, sans jamais tourner */
    const cible=Math.max(-.45,Math.min(.45,k.vl/70));k.ang+=(cible-k.ang)*Math.min(1,dt*8);
    if(k.coupT>0)k.coupT-=dt;
    const a=a0+5,b=b0-5;
    if(k.x<a||k.x>b){k.x=Math.max(a,Math.min(b,k.x));k.vl=(k.x<=a?1:-1)*Math.abs(k.vl)*.4+(k.x<=a?12:-12);
      if(k.v>40){k.v*=.75;if(k.n===0){vibrer(20);son.bip(110,.15,'square',.05);cri('Attention, la falaise !','','b',.8);}
      for(let i=0;i<8;i++)parts.push({x:k.x,y:k.y,vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40,vie:.4,col:'#f2fbf6'});}}
    for(const r of rochers){const d=Math.hypot(k.x-r.x,k.y-r.y);if(d<r.r+5){const ux=(k.x-r.x)/(d||1),uy=(k.y-r.y)/(d||1);k.x=r.x+ux*(r.r+5);k.y=r.y+uy*(r.r+5);k.vl+=ux*25;
      if(k.v>40){k.v*=.7;if(k.n===0){vibrer(20);son.bip(120,.15,'square',.05);cri('Un rocher !','','b',.8);}}}}
    /* les portes : entre les deux bouées, sinon trois secondes */
    const p=portes[k.porte];if(p&&k.y<p.y){if(k.x>p.x1-2&&k.x<p.x2+2){if(k.n===0){p.passe=1;son.bip(1046,.1,'square',.05);}}
      else{k.pen+=3000;if(k.n===0){p.passe=-1;cri('Porte ratée !','+3 secondes','b',1.1);vibrer([20,40,20]);son.bip(200,.3,'sawtooth',.06);}}k.porte++;}
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
    const zg=(RY.ideal-RY.fen)/.8*100,zw=RY.fen*2/.8*100;
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
      '<b>Pour te décaler</b> : deux coups du même côté — pagaie à gauche, tu glisses à droite. Le kayak garde toujours le cap. <b>Porte ratée</b> : +3 secondes.</div>';
    Rt.menu.classList.add('on');Rt.menu.querySelector('[data-a=paye]').onclick=()=>depart(true);Rt.menu.querySelector('[data-a=entr]').onclick=()=>depart(false);
    const [cl,mr]=await Promise.all([ctx.rpc('course_classement',{p_jeu:'kayak'}),ctx.rpc('course_mes_records',{})]);const box=Rt.menu.querySelector('.cl');if(!box||ETAT!=='menu')return;
    if(Array.isArray(cl)&&cl.length)box.innerHTML=cl.map((r,i)=>'<div class="'+(r.moi?'moi':'')+'"><i>'+(i+1)+'</i><span>'+echap(r.pseudo)+'</span><em>'+chrono(r.ms)+'</em></div>').join('');
    else box.innerHTML='<div class="vide">Personne n’a encore descendu. La première place est libre.</div>';
    if(mr&&!mr.erreur){const v=Rt.menu.querySelector('[data-a=paye] em');if(v&&typeof mr.restant_kayak==='number')v.textContent+=' · '+Math.max(0,mr.restant_kayak)+' course'+(mr.restant_kayak>1?'s':'')+' aujourd’hui';}}
  function fermer(){cancelAnimationFrame(anim);son.stop();Rt.d.classList.remove('on');removeEventListener('keydown',kd);Rt.fer.onclick=null;try{ctx.fermer&&ctx.fermer();}catch(x){}}
  Rt.fer.onclick=fermer;Rt.d.classList.remove('kart');Rt.d.classList.add('on');menu();dernier=0;anim=requestAnimationFrame(boucle);
  return {fermer,_dbg:()=>({KY,portes,ETAT,ARR,MH,course,pagayer:(c)=>pagayer(KY[0],c,performance.now()-t0)})};
}

window.Courses={karting,kayak};
})();
