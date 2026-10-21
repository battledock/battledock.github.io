/* =====================================================================
   POKÉDOCK — ÉDITION HALLOWEEN 2026

   Cinquante cartes neuves : pas un seul personnage de la première
   édition, pas un seul cadre repris. Le design « Lanterne » : l'image
   prend toute la carte, un liseré qui luit, le nom en néon. Plus la
   rareté monte, plus la carte change de nature : argent, holo, brume
   violette, cadre d'or ciselé, EX qui sort du cadre, full art holo,
   et la secrète tout en or.

   Rien ici ne touche au DOM : on grave des images, pokedock.js les
   montre. Seul window.PokedockHW en sort.
   ===================================================================== */
(function(){
'use strict';
const CW=300, CH=420;
const SANS="'Baloo 2','Trebuchet MS',system-ui,sans-serif";
const SERIF="Georgia,'DejaVu Serif',serif";

function rr(g,x,y,w,h,r,suite){if(!suite)g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);
  g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function al(n){const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);}
function wrap(g,t,x,y,mw,lh,max){const m=t.split(' ');let L='',k=0;
  for(const w of m){const T=L?L+' '+w:w;
    if(g.measureText(T).width>mw&&L){g.fillText(L,x,y);y+=lh;L=w;if(++k>=(max||9))return y;}else L=T;}
  g.fillText(L,x,y);return y+lh;}

/* ===================== LES MONSTRES, EN PIXELS =====================
   Chaque modèle fait 24 colonnes ; le corps se tient entre les colonnes
   2 et 16, la main droite vers la colonne 16 — c'est là qu'on accroche
   l'objet du métier. */
const M={
citrouille:{c:8,r:[
"........gg..............",
".......gg...............",
"....oooOOooo............",
"...oOooOOooOo...........",
"..ooOooOOooOoo..........",
"..oyyOoOOoyyOo..........",
"..oyyOoOOoyyOo..........",
"..ooOooyyooOoo..........",
"..oyOyyOOyyOyo..........",
"...oyyyyyyyyo...........",
"....ooOOOooo............",
"......ss................",
"....JJJJJJJJ............",
"...JJvJJJJvJJ...........",
"..JJJvJJJJvJJJ..........",
"..JJJvJJJJvJJJ..........",
"..hJJvJJJJvJJh..........",
"..hJJJJJJJJJJh..........",
"..h.JJJJJJJJ.h..........",
"....JJJJJJJJ............",
"....bbbbbbbb............",
"....bbb..bbb............",
"....bbb..bbb............",
"....bbb..bbb............",
"....bbb..bbb............",
"...kkkk..kkkk..........."],
 p:{g:'#3a7a2a',o:'#e8761e',O:'#c85a10',y:'#ffd84a',s:'#5a3a1a',J:'#2a4a7a',v:'#ffcc33',h:'#e0b088',b:'#3a3a44',k:'#1a1a1a'},main:[13,18]},
fantome:{c:9,r:[
".......wwwwww...........",
".....wwwwwwwwww.........",
"....wwwwwwwwwwww........",
"...wwwwwwwwwwwwww.......",
"...wwwkkwwwwkkwww.......",
"...wwwkkwwwwkkwww.......",
"...wwwwwwwwwwwwww.......",
"...wwwwwwkkwwwwww.......",
"...wwwwwkkkkwwwww.......",
"...wwwwwwkkwwwwww.......",
"..wwwwwwwwwwwwwwww......",
"..wwwwwwwwwwwwwwwww.....",
".wwwwwwwwwwwwwwwwwww....",
".wwwwwwwwwwwwwwwwww.....",
".wwwwwwwwwwwwwwwww......",
".wwwwwwwwwwwwwwwww......",
".wwwwwwwwwwwwwwwww......",
".wwwwwwwwwwwwwwwww......",
".wwwwwwwwwwwwwwwww......",
".wwwwwwwwwwwwwwwww......",
".www.wwww.wwww.www......",
"..w...ww...ww...w......."],
 p:{w:'#eef0ff',k:'#1a1430'},main:[18,12]},
vampire:{c:10,r:[
".......kkkkkk...........",
"......kkkkkkkk..........",
"......kpppppkk..........",
"......pprpprpp..........",
"......pppppppp..........",
".......pkkkkp...........",
".......pwppwp...........",
"..CC....pppp.....CC.....",
"..CCC.WWWWWWWW..CCC.....",
"..CCCWWWkRRkWWWCCCC.....",
"..CCCkkkkRRkkkkkCCC.....",
"..CCCkkkkkkkkkkkCCC.....",
"..CCCkkkkkkkkkkkCCC.....",
"..CCCkkkkkkkkkkkCCC.....",
"..CCCpkkkkkkkkkpCCC.....",
"..CCC.kkkkkkkkk.CCC.....",
"..CCC.kkkkkkkkk.CCC.....",
"..CCC.kkkk.kkkk.CCC.....",
"..CCC.kkkk.kkkk.CCC.....",
"..CC..kkkk.kkkk..CC.....",
"..C...kkkk.kkkk...C.....",
"......KKKK.KKKK........."],
 p:{k:'#1a1420',p:'#d8d4e8',r:'#ff2a3a',w:'#ffffff',W:'#f0f0f0',R:'#c81a2a',C:'#8a0e1e',K:'#0a0a0a'},main:[16,14]},
sorciere:{c:9,r:[
"..........kk............",
".........kkk............",
"........kkkk............",
".......kkkkkk...........",
"......kkkkkkkk..........",
".....kPPPPPPPPk.........",
"...kkkkkkkkkkkkkk.......",
"....HHgggggggHH.........",
"....HgkwgggkwgH.........",
"....HggggnggggH.........",
"....HgggggggggH.........",
"....HHggrrrrgHH.........",
"....HH.ggggg.HH.........",
"...VVVVVVVVVVVV.........",
"..VVVVVVVVVVVVVV........",
"..gVVVVVVVVVVVVVg.......",
"...VVVVVVVVVVVV.........",
"...VVVVVVVVVVVV.........",
"..VVVVVVVVVVVVVV........",
"..VVVVVVVVVVVVVV........",
".VVVVVVVVVVVVVVVV.......",
".VVVVVVVVVVVVVVVV.......",
"....kk......kk.........."],
 p:{k:'#1a1420',P:'#8a3ac8',H:'#e8761e',g:'#7ac85a',w:'#ffff8a',n:'#5a9a3a',r:'#3a1a2a',V:'#3a1a5a'},main:[16,15]},
squelette:{c:8,r:[
"....YYYYYYYY............",
"...YYYYYYYYYY...........",
"...YYYYYYYYYY...........",
"..YYYYYYYYYYYY..........",
"....wwwwwwww............",
"....wkkwwkkw............",
"....wkkwwkkw............",
"....wwwwkwww............",
".....wwwwww.............",
".....wkwkwk.............",
"......wwww..............",
".......ww...............",
"...w.wwwwww.w...........",
"..w..w.ww.w..w..........",
"..w..wwwwww..w..........",
"..w..w.ww.w..w..........",
"..w..wwwwww..w..........",
"..ww...ww...ww..........",
".......ww...............",
".....wwwwww.............",
".....w....w.............",
".....w....w.............",
".....w....w.............",
".....w....w.............",
"....ww....ww............"],
 p:{Y:'#f0c020',w:'#ece6d0',k:'#1a1a1a'},main:[13,17]},
momie:{c:9,r:[
".....bbbbbbb............",
"....bbcbbbcbb...........",
"....bcbbbbbcb...........",
"....bbbbcbbbb...........",
"....bkybbbkyb...........",
"....bbbbbbbbb...........",
"....bcbbbbcbb...........",
".....bbbbbbb............",
"...bbbbbbbbbbb..........",
"..bbcbbbbbbcbbb.........",
"..bbbbbcbbbbbbbbbb......",
"..bbbbbbbbcbbbbbbb......",
"..bbbcbbbbbbbbb.........",
"...bbbbbcbbbbb..........",
"...bbcbbbbbcbb..........",
"...bbbbbbbbbbb..........",
"...bbbbcbbbbbb..........",
"....bbbbb.bbbb..........",
"....bcbbb.bbcb..........",
"....bbbbb.bbbb..........",
"....bbcbb.bbbb..........",
"....bbbbb.bcbb..........",
"...bbbbbb.bbbbb........."],
 p:{b:'#e8dcc0',c:'#b0a080',k:'#1a1a1a',y:'#9aff6a'},main:[17,10]},
loup:{c:8,r:[
"...b.........b..........",
"...bb.......bb..........",
"...bBb.....bBb..........",
"...bbbbbbbbbbb..........",
"..bbbbbbbbbbbbb.........",
"..bbyybbbbbyybb.........",
"..bbbbbbbbbbbbb.........",
"..bbbbbllllbbbb.........",
"...bbbllkkllbb..........",
"...bbbllllllbb..........",
"....bwlwlwlwb...........",
"....bbbbbbbbb...........",
"..bbbSSSSSSSbbb.........",
".bbbSSsSSSsSSbbb........",
".bb.SSSSSSSSS.bb........",
".bb.SsSSSSSsS.bb........",
".bww.SSSSSSS.wwb........",
"....SSSSSSSSS...........",
"....JJJJJJJJJ...........",
"....JJJJ.JJJJ...........",
"....JJJJ.JJJJ...........",
"....JJJ...JJJ...........",
"....bbb...bbb...........",
"...bwbw...bwbw.........."],
 p:{b:'#5a4a3a',B:'#c88a8a',y:'#ffd020',l:'#8a7a6a',k:'#1a1a1a',w:'#f4f0e0',S:'#b82a2a',s:'#2a1a1a',J:'#2a3a5a'},main:[16,15]},
zombie:{c:8,r:[
".....hhhhhh.............",
"....hhhhhhhh............",
"....gggggggg............",
"....gkwggkwg............",
"....gggggggg............",
"....ggrggggg............",
"....ggkkkkgg............",
".....gggggg.............",
"...OOOOOOOOOO...........",
"..OOOOOOOOOOOgggggg.....",
"..OOssOOssOOOgggggg.....",
"..OOOOOOOOOO............",
"..OOssOOssOO............",
"..OOOOOOOOOO............",
"...OOOOOOOO.............",
"...JJJJJJJJ.............",
"...JJJ..JJJ.............",
"...JJJ..JJJ.............",
"...JJJ..JJJ.............",
"...JJJ..JJ..............",
"..kkkk..kkk.............",
"..kkkk..kkkk............"],
 p:{h:'#2a2a1a',g:'#8ab86a',k:'#1a1a1a',w:'#e0ffe0',r:'#8a2a2a',O:'#ff7a1a',s:'#e8e8e8',J:'#3a4a5a'},main:[18,9]},
chat:{c:9,r:[
"........................",
"...k.........k..........",
"...kk.......kk..........",
"...kpk.....kpk..........",
"...kkkkkkkkkkk..........",
"..kkkkkkkkkkkkk.........",
"..kkyykkkkkyykk.........",
"..kkyKkkkkkyKkk.........",
"..kkkkkkpkkkkkk.........",
".wkkkkkkkkkkkkkw........",
"...kkkkkkkkkkk..........",
"....kkkkkkkkk...........",
"...kkkkkkkkkkk..........",
"..kkkkkkkkkkkkk.........",
"..kkkkkkkkkkkkk.........",
"..kkkkkkkkkkkkk.......kk",
"..kkkkkkkkkkkkkk.....kk.",
"..kkkkkkkkkkkkkkk...kk..",
"..kkkkkkkkkkkkkkkkkkk...",
"..kkk.kkk.kkk.kkkkk....."],
 p:{k:'#1c1a24',p:'#e88aa8',y:'#c8ff4a',K:'#0a0a0a',w:'#aaaaaa'},main:[15,12]},
araignee:{c:12,r:[
"........................",
"..........kkkkk.........",
".........kkkkkkk........",
".........kkkrkkk........",
".........kkrrrkk........",
".........kkkrkkk........",
"..........kkkkk.........",
"..kk.......kkk.......kk.",
".k..k...kkkkkkk...k..k..",
"k....k.kkyykyykk.k....k.",
"k...kk.kkkkkkkkk.kk...k.",
"...k..k..kwkwk..k..k....",
"..k..k...........k..k...",
".k..k.............k..k..",
"k..k...............k..k.",
"..k.................k..."],
 p:{k:'#1a1420',r:'#e82a2a',y:'#ff3a3a',w:'#eeeeee'},main:[21,9]},
chauvesouris:{c:12,r:[
"k......................k",
"kk....................kk",
"kkk.......k..k.......kkk",
"kkkk......kkkk......kkkk",
"kkkkk....kkkkkk....kkkkk",
"kkkkkk..kkrkkrkk..kkkkkk",
"kkkkkkkkkkkkkkkkkkkkkkkk",
"kkkkkkkkkkwkkwkkkkkkkkkk",
".kkkkkkkkkkkkkkkkkkkkkk.",
"..kk.kkkkkkkkkkkkkk.kk..",
"...k..kk.kkkkkk.kk..k...",
".......k..kkkk..k.......",
"...........kk..........."],
 p:{k:'#2a1a34',r:'#ff4a4a',w:'#ffffff'},main:[12,12]},
frank:{c:9,r:[
"....kkkkkkkkk...........",
"....kkkkkkkkk...........",
"....GGGGGGGGG...........",
"....GkkGGGkkG...........",
"...sGGGGGGGGGs..........",
"....GGGGkGGGG...........",
"....GkkkkkkkG...........",
"....GGGGGGGGG...........",
"..JJJJJJJJJJJJJ.........",
".JJJJJJJJJJJJJJJ........",
".JJJ.JJJJJJJJ.JJJ.......",
".JJJ.JJJJJJJJ.JJJ.......",
".JJJ.JJJJJJJJ.JJJ.......",
".GGG.JJJJJJJJ.GGG.......",
".....PPPPPPPP...........",
".....PPPP.PPP...........",
".....PPPP.PPP...........",
".....PPPP.PPP...........",
"....kkkkk.kkkkk.........",
"....kkkkk.kkkkk........."],
 p:{k:'#1a1a1a',G:'#7aa86a',s:'#a8a8b8',J:'#2a2a34',P:'#3a3a4a'},main:[16,13]},
faucheuse:{c:8,r:[
"......CCCCCC............",
".....CCCCCCCC...........",
"....CCCkkkkkCC..........",
"....CCkkkkkkCC..........",
"....CCkykkykCC..........",
"....CCkkkkkkCC..........",
"....CCCkkkkCCC..........",
"...CCCCCCCCCCCC.........",
"..CCCCcCCCCCCCCC........",
"..CCCCcCCCCCCCwww.......",
"..CCCCcCCCCCCCCC........",
"..CCCCcCCCCCCCC.........",
"..CCCCcCCCCCCCC.........",
"..CCCCcCCCCCCCC.........",
"..CCCCcCCCCCCCC.........",
"..CCCCcCCCCCCCC.........",
".CCCCCcCCCCCCCCC........",
".CCCCCcCCCCCCCCC........",
".CCCCCcCCCCCCCCC........",
".CC.CCC.CCC.CC.C........"],
 p:{C:'#1c1a26',c:'#2e2a3e',k:'#000000',y:'#6affe0',w:'#ece6d0'},main:[16,9]},
epouvantail:{c:8,r:[
".....HHHHHH.............",
"...HHHHHHHHHH...........",
"....ssssssss............",
"....skkssskk............",
"....ssssssss............",
"....sskkkkss............",
".....ssssss.............",
"..yy.PPPPPP.yy..........",
"yyPPPPPPPPPPPPyy........",
"..PPPpPPPPpPPP..........",
"....PPPPPPPP............",
"....PpPPPPpP............",
"....JJJJJJJJ............",
"....JJJJJJJJ............",
"....yyy..yyy............",
".......bb...............",
".......bb...............",
".......bb..............."],
 p:{H:'#c8a040',s:'#c8a878',k:'#2a1a0a',y:'#e8d060',P:'#a83a2a',p:'#2a1a1a',J:'#3a4a7a',b:'#6a4a2a'},main:[15,8]},
diablotin:{c:8,r:[
"...r........r...........",
"...rr......rr...........",
"....RRRRRRRR............",
"...RRRRRRRRRR...........",
"...RRyyRRyyRR...........",
"...RRRRRRRRRR...........",
"...RRwRRRRwRR...........",
"....RRwwwwRR............",
".....RRRRRR.............",
"....RRRRRRRR....t.......",
"...RRRRRRRRRR..tt.......",
"..RR.RRRRRR.RR.t........",
"..R..RRRRRR..R.t........",
".....RRRRRR...t.........",
".....RR..RR..t..........",
".....RR..RRtt...........",
"....RRR..RRR............"],
 p:{r:'#2a1010',R:'#d83a2a',y:'#ffe04a',w:'#ffffff',t:'#a82a1a'},main:[14,12]}
};

/* les objets du métier, accrochés à la main */
const OBJ={
caisse:{r:["bbbbbb","bBbbBb","bbBBbb","bbBBbb","bBbbBb","bbbbbb"],p:{b:'#a87a3a',B:'#6a4a1a'},dx:0,dy:-2},
poisson:{r:["..ff..f","ffffff.","fkffff.","ffffff.","..ff..f"],p:{f:'#7ab0c8',k:'#1a1a1a'},dx:0,dy:-2},
lanterne:{r:[".kk.","kyyk","kyyk","kyyk",".kk."],p:{k:'#2a2a2a',y:'#ffd04a'},dx:0,dy:-1,lueur:'rgba(255,200,80,'},
balai:{r:["......b","......b","......b","......b","......b","......b",".....yy","....yyy","...yyyy"],p:{b:'#6a4a2a',y:'#d8b040'},dx:-4,dy:-4},
faux:{r:["ssssss.","s.....s","b......","b......","b......","b......","b......","b......","b......","b......"],p:{s:'#d8dce8',b:'#5a3a1a'},dx:0,dy:-8},
ancre:{r:["..a..","aaaaa","..a..","..a..","a.a.a",".aaa."],p:{a:'#5a6a7a'},dx:0,dy:-2},
crochet:{r:["c..",".c.","..c","..c","cc."],p:{c:'#b8b8c8'},dx:0,dy:-2},
chaudron:{r:["vvvvvvv","kkkkkkk","kkkkkkk",".kkkkk."],p:{v:'#7aff6a',k:'#1a1a1a'},dx:-2,dy:2},
cle:{r:["c.c","ccc",".c.",".c.",".c."],p:{c:'#a8a8b8'},dx:0,dy:-2},
os:{r:["w...w","wwwww","w...w"],p:{w:'#ece6d0'},dx:0,dy:0},
couronne:{r:["y.y.y","yyyyy","yryry"],p:{y:'#ffd04a',r:'#e82a3a'},dx:0,dy:0},
tasse:{r:["wwwk","wwwk","www."],p:{w:'#f4f0e0',k:'#d8d0c0'},dx:0,dy:0}
};

function grille(g,ox,oy,s,rows,pal){
  for(let y=0;y<rows.length;y++){const L=rows[y];
    for(let x=0;x<L.length;x++){const c=L[x];if(c!=='.'&&pal[c]){g.fillStyle=pal[c];g.fillRect(ox+x*s,oy+y*s,s+0.4,s+0.4);}}}}
/* LE MONSTRE : cx = milieu du corps, by = le sol */
function monstre(g,C,cx,by,s,teinte){
  const T=M[C.m];if(!T)return;
  const pal=Object.assign({},T.p,C.pal||{});
  if(teinte){for(const k in pal)pal[k]=teinte(pal[k]);}
  const h=T.r.length*s, x0=cx-T.c*s, y0=by-h;
  g.fillStyle='rgba(0,0,0,.38)';g.beginPath();g.ellipse(cx,by,9*s*0.6,s*1.3,0,0,7);g.fill();
  grille(g,x0,y0,s,T.r,pal);
  if(C.o&&OBJ[C.o]){const O=OBJ[C.o];const op=Object.assign({},O.p);
    if(teinte){for(const k in op)op[k]=teinte(op[k]);}
    const ox=x0+(T.main[0]+O.dx)*s, oy=y0+(T.main[1]+O.dy)*s;
    if(O.lueur&&!teinte){const l=g.createRadialGradient(ox+2*s,oy+2.5*s,0,ox+2*s,oy+2.5*s,s*9);
      l.addColorStop(0,O.lueur+'.55)');l.addColorStop(1,O.lueur+'0)');g.fillStyle=l;g.fillRect(ox-8*s,oy-8*s,20*s,20*s);}
    grille(g,ox,oy,s,O.r,op);}
  if(C.chap&&OBJ[C.chap]){grille(g,x0+(T.c-2)*s,y0-3*s,s,OBJ[C.chap].r,OBJ[C.chap].p);}
}

/* ===================== LES DÉCORS ===================== */
function chauve(g,x,y,s,c){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=c;g.beginPath();g.moveTo(0,0);
  g.quadraticCurveTo(-8,-8,-20,-4);g.quadraticCurveTo(-15,-1,-14,4);g.quadraticCurveTo(-9,1,-6,5);g.quadraticCurveTo(-3,2,0,4);
  g.quadraticCurveTo(3,2,6,5);g.quadraticCurveTo(9,1,14,4);g.quadraticCurveTo(15,-1,20,-4);g.quadraticCurveTo(8,-8,0,0);g.fill();g.restore();}
const CIEL={
  quai:['#2a1240','#c8541e','#2a1810','#fff2c8'],
  brume:['#0e1a2a','#2a4a5a','#0a141a','#fff2c8'],
  ferry:['#1a0610','#5a0e22','#0a0408','#ffb0a8'],
  cale:['#120c0a','#3a2a1a','#0a0806','#ffd890'],
  grue:['#1a1030','#8a3a5a','#1a0a10','#fff2c8'],
  phare:['#0a1020','#1a3a6a','#05080e','#e8f4ff'],
  criee:['#1a1a24','#3a5a6a','#0e1418','#f0fff8'],
  cimetiere:['#0a0a1a','#3a2a5a','#08060e','#f4f0ff'],
  garde:['#1a0a2a','#e0602a','#1a0a10','#fff0c0'],
  champ:['#1a1020','#a8602a','#1a1008','#fff2c8'],
  rouge:['#1a0000','#8a0a0a','#0a0000','#ff6a5a']
};
function decor(g,x,y,w,h,k,graine){
  const P=CIEL[k]||CIEL.quai;
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  const c=g.createLinearGradient(0,y,0,y+h);c.addColorStop(0,P[0]);c.addColorStop(.6,P[1]);c.addColorStop(1,P[2]);
  g.fillStyle=c;g.fillRect(x,y,w,h);
  /* étoiles */
  for(let i=0;i<40;i++){g.fillStyle='rgba(255,255,255,'+(0.2+al(graine+i)*0.6)+')';
    g.fillRect(x+al(graine*3+i)*w,y+al(graine*7+i*2)*h*0.5,1.2,1.2);}
  /* la lune */
  const lx=x+w*(0.62+al(graine)*0.22), ly=y+h*(0.14+al(graine+1)*0.08), R=Math.min(w,h)*0.11;
  const l=g.createRadialGradient(lx,ly,0,lx,ly,R*3.2);l.addColorStop(0,P[3]);l.addColorStop(.3,P[3]+'55');l.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=l;g.fillRect(x,y,w,h);g.fillStyle=P[3];g.beginPath();g.arc(lx,ly,R,0,7);g.fill();
  g.fillStyle='rgba(0,0,0,.08)';g.beginPath();g.arc(lx-R*.3,ly+R*.2,R*.25,0,7);g.arc(lx+R*.35,ly-R*.25,R*.15,0,7);g.fill();
  /* les silhouettes */
  const S='rgba(4,2,8,.72)';g.fillStyle=S;const sol=y+h*0.7;
  if(k==='quai'||k==='champ'){for(let i=0;i<6;i++)g.fillRect(x+i*w/6+4,sol-((i*37+graine)%5)*6,w/6-8,h);
    g.fillRect(x+w*.08,y+h*.28,5,h);g.fillRect(x+w*.08,y+h*.28,w*.3,5);g.fillRect(x+w*.33,y+h*.28,2,h*.12);}
  if(k==='grue'){g.fillRect(x,sol,w,h);g.fillRect(x+w*.18,y+h*.2,8,h);g.fillRect(x+w*.05,y+h*.2,w*.75,7);
    for(let i=0;i<10;i++){g.fillRect(x+w*.05+i*w*.075,y+h*.2,2,14);}g.fillRect(x+w*.7,y+h*.22,1.5,h*.2);}
  if(k==='brume'||k==='criee'){g.fillRect(x,sol+10,w,h);for(let i=0;i<6;i++)g.fillRect(x+i*w/6+12,sol-6,5,18);
    if(k==='criee'){g.beginPath();g.moveTo(x,sol-30);g.lineTo(x+w*.5,sol-60);g.lineTo(x+w,sol-30);g.lineTo(x+w,sol);g.lineTo(x,sol);g.fill();}}
  if(k==='ferry'){g.beginPath();g.moveTo(x,y+h*.74);g.lineTo(x+w*.12,y+h*.62);g.lineTo(x+w*.88,y+h*.62);g.lineTo(x+w,y+h*.74);
    g.lineTo(x+w,y+h);g.lineTo(x,y+h);g.fill();g.fillRect(x+w*.28,y+h*.47,w*.36,h*.15);g.fillRect(x+w*.4,y+h*.34,14,h*.14);}
  if(k==='cale'){g.fillRect(x,sol+6,w,h);for(let i=0;i<4;i++){g.fillRect(x+i*w/4+6,sol-30-(i%2)*24,w/4-12,60);}
    g.fillStyle='rgba(255,210,120,.12)';g.beginPath();g.moveTo(x+w*.4,y);g.lineTo(x+w*.6,y);g.lineTo(x+w*.85,y+h);g.lineTo(x+w*.15,y+h);g.fill();}
  if(k==='phare'){g.fillRect(x,sol+16,w,h);g.beginPath();g.moveTo(x+w*.12,sol+16);g.lineTo(x+w*.16,y+h*.3);g.lineTo(x+w*.24,y+h*.3);g.lineTo(x+w*.28,sol+16);g.fill();
    g.fillStyle='rgba(255,250,200,.18)';g.beginPath();g.moveTo(x+w*.2,y+h*.3);g.lineTo(x+w,y+h*.12);g.lineTo(x+w,y+h*.42);g.fill();}
  if(k==='cimetiere'||k==='rouge'){g.fillRect(x,sol+12,w,h);for(let i=0;i<5;i++){const tx=x+i*w/5+10;
    g.beginPath();g.moveTo(tx,sol+14);g.lineTo(tx,sol-6);g.arc(tx+9,sol-6,9,Math.PI,0);g.lineTo(tx+18,sol+14);g.fill();
    if(i%2){g.fillRect(tx+7,sol-34,4,20);g.fillRect(tx+2,sol-28,14,4);}}
    g.fillRect(x+w*.82,y+h*.35,4,h);for(let i=0;i<5;i++){g.save();g.translate(x+w*.82+2,y+h*.38+i*8);g.rotate(-0.6+i*0.3);g.fillRect(0,0,22-i*3,2);g.restore();}}
  if(k==='garde'){g.fillRect(x,sol+8,w,h);g.beginPath();g.moveTo(x,sol+10);g.quadraticCurveTo(x+w*.5,sol-40,x+w,sol+10);g.fill();
    const bx=x+w*.5;g.fillRect(bx-24,sol-60,48,30);g.fillRect(bx-7,sol-104,14,46);g.fillStyle='rgba(255,215,90,.9)';g.fillRect(bx-3,sol-122,6,18);g.beginPath();g.arc(bx,sol-124,4,0,7);g.fill();}
  /* brume basse */
  const m=g.createLinearGradient(0,y+h*.55,0,y+h);m.addColorStop(0,'rgba(200,220,255,0)');m.addColorStop(1,(k==='brume'||k==='cimetiere')?'rgba(160,255,210,.35)':'rgba(200,180,255,.14)');
  g.fillStyle=m;g.fillRect(x,y+h*.55,w,h*.45);
  /* chauves-souris */
  for(let i=0;i<3;i++)chauve(g,x+w*(0.14+al(graine+i*5)*0.5),y+h*(0.08+al(graine+i*9)*0.18),0.45+al(graine+i)*0.4,'rgba(10,4,12,.9)');
  g.restore();
}

/* ===================== LES JETONS D'ÉNERGIE ===================== */
function jeton(g,x,y,r,t){
  const C={c:['#ff8a1a','#c85a10'],n:['#9a6aff','#4a2a9a'],e:['#e8f4ff','#7a9ab8']}[t]||['#888','#444'];
  const l=g.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);l.addColorStop(0,C[0]);l.addColorStop(1,C[1]);
  g.fillStyle=l;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=1;g.stroke();
  g.fillStyle='rgba(20,10,20,.85)';
  if(t==='c'){g.beginPath();g.moveTo(x-r*.5,y-r*.1);g.lineTo(x-r*.15,y-r*.1);g.lineTo(x-r*.32,y-r*.45);g.fill();
    g.beginPath();g.moveTo(x+r*.5,y-r*.1);g.lineTo(x+r*.15,y-r*.1);g.lineTo(x+r*.32,y-r*.45);g.fill();
    g.fillRect(x-r*.45,y+r*.2,r*.9,r*.18);}
  if(t==='n')chauve(g,x,y+r*.05,r*.042,'rgba(20,10,30,.9)');
  if(t==='e'){g.beginPath();g.arc(x-r*.25,y-r*.1,r*.14,0,7);g.arc(x+r*.25,y-r*.1,r*.14,0,7);g.fill();
    g.beginPath();g.ellipse(x,y+r*.35,r*.16,r*.2,0,0,7);g.fill();}
}

/* ===================== LES RARETÉS ===================== */
const RAR={
 commune:{nom:'COMMUNE',ton:'#ff9a2a',sym:'●'},
 rare:{nom:'RARE',ton:'#e8f0ff',sym:'◆'},
 ultra:{nom:'ULTRA RARE',ton:'#5ae8ff',sym:'★'},
 epic:{nom:'EPIC',ton:'#c08aff',sym:'✦'},
 legend:{nom:'LÉGENDAIRE',ton:'#ffcf5a',sym:'✹'},
 ex:{nom:'EX',ton:'#ff3a3a',sym:'EX'},
 fullart:{nom:'FULL ART',ton:'#ff8ae8',sym:'★★'},
 secrete:{nom:'SECRÈTE',ton:'#ffe08a',sym:'✶'}
};

/* ===================== LES CINQUANTE =====================
   [nom, pv, rareté, lieu, monstre, objet, décor, palette, attaques]
   attaque = [coût, nom, dégâts, texte] ; coût : c citrouille, n nuit, e esprit */
const L=[
/* ---- communes (18) ---- */
['Le Docker Citrouille',50,'commune','Quai','citrouille','caisse','quai',null,[['c','Tête de Lanterne',20,'Éclaire le quai toute la nuit. Les mouettes n’osent plus approcher.']]],
['Le Petit Fantôme du Hangar',30,'commune','Hangar','fantome',null,'cale',null,[['e','Bouh !',10,'Fait sursauter le chef d’équipe. Une seule fois.']]],
['Le Squelette Grutier',40,'commune','Grue','squelette',null,'grue',null,[['n','Bras Long',20,'Attrape un conteneur à trente mètres. Sans les muscles.']]],
['La Momie du Conteneur',50,'commune','Cale','momie',null,'cale',null,[['e','Déroulé',20,'Se déroule sur trois quais. Il faut deux heures pour la rembobiner.']]],
['Le Zombie de l’Équipe de Nuit',50,'commune','Quai','zombie',null,'quai',null,[['n','Pointage Tardif',20,'Arrive à 4 h. Repart à 4 h. Personne ne l’a jamais vu travailler.']]],
['Le Chat Noir du Môle',30,'commune','Môle','chat',null,'phare',null,[['n','Traverse Devant',10,'Porte malheur aux grutiers. Ils le nourrissent quand même.']]],
['L’Araignée de la Cale',40,'commune','Cale','araignee',null,'cale',null,[['n','Toile de Chantier',20,'Tisse entre deux palettes. Le cariste ne passe plus.']]],
['La Chauve-Souris du Phare',30,'commune','Phare','chauvesouris',null,'phare',null,[['n','Vol de Nuit',10,'Fait le tour de la lanterne quatre cents fois. Elle a le tournis.']]],
['L’Épouvantail du Jardin Ouvrier',40,'commune','Jardin','epouvantail',null,'champ',null,[['c','Chasse-Mouettes',20,'Les mouettes s’en moquent. Les pigeons aussi.']]],
['Le Diablotin des Machines',40,'commune','Salle des machines','diablotin','cle','cale',null,[['c','Petite Étincelle',20,'Répare un moteur en le cassant un peu plus.']]],
['La Sorcière de la Criée',50,'commune','Criée','sorciere','poisson','criee',null,[['e','Poisson Ensorcelé',20,'Le merlan parle. Il dit qu’il était plus frais hier.']]],
['La Citrouille Pêcheuse',50,'commune','Digue','citrouille','poisson','brume',{J:'#e8c020',v:'#2a2a2a'},[['c','Prise Moisie',20,'Ne ramène que des bottes. Et parfois une botte avec un pied.']]],
['Le Fantôme du Vestiaire',40,'commune','Vestiaire','fantome','cle','cale',{w:'#d8f0e8'},[['e','Casier Hanté',20,'Le casier 13 s’ouvre seul. Il range les affaires des autres.']]],
['Le Squelette Amarreur',40,'commune','Quai','squelette','ancre','quai',{Y:'#c83a3a'},[['n','Nœud Mortel',20,'Fait un nœud que personne ne peut défaire. Même pas lui.']]],
['Le Zombie du Café du Port',50,'commune','Café','zombie','tasse','quai',{O:'#4a7ab8',s:'#2a4a7a'},[['c','Premier Café',10,'Revient à la vie après le troisième. Avant, il grogne.']]],
['La Chauve-Souris Mouette',30,'commune','Port','chauvesouris',null,'quai',{k:'#6a6a7a'},[['n','Pique le Sandwich',20,'Vole le casse-croûte en plein vol. Et la serviette.']]],
['Le Chat de la Sorcière',30,'commune','Criée','chat',null,'criee',{k:'#2a2034',y:'#ff8a1a'},[['e','Ronron Maudit',20,'Ronronne si fort que les vitres tremblent.']]],
['Frankendocker l’Apprenti',50,'commune','Atelier','frank','caisse','cale',{G:'#9ac88a'},[['c','Boulon Desserré',20,'Perd un boulon à chaque pas. Il en a encore beaucoup.']]],
/* ---- rares (12) ---- */
['Le Loup-Garou du Quai 4',80,'rare','Quai','loup',null,'quai',null,[['n','Hurlement de Relève',30,'Annonce la relève à la pleine lune.'],['nn','Griffe de Palette',50,'Lacère le film plastique d’une palette entière.']]],
['La Faucheuse des Heures Sup',80,'rare','Bureau','faucheuse','faux','cimetiere',null,[['e','Pointeuse Fatale',40,'Personne ne part avant elle.'],['ee','Fin de Service',60,'Tout le monde rentre. Pour toujours.']]],
['Frankendocker',90,'rare','Atelier','frank','caisse','grue',null,[['c','Courant de Quai',40,'Se branche sur la grue pour se recharger.'],['cc','Soulève Tout',60,'Porte deux conteneurs. Un par bras.']]],
['La Momie du Manifeste',70,'rare','Capitainerie','momie',null,'ferry',{c:'#d0a040'},[['ee','Malédiction du Manifeste',50,'Toutes les lignes du manifeste deviennent illisibles.']]],
['Le Vampire de la Capitainerie',80,'rare','Capitainerie','vampire',null,'ferry',{C:'#2a2a6a'},[['n','Prise de Sang',40,'Signe les autorisations à l’encre rouge.'],['nn','Tampon Rouge',50,'Personne n’accoste sans son tampon.']]],
['La Sorcière au Balai',70,'rare','Grue','sorciere','balai','grue',{V:'#1a3a2a',P:'#e8761e'},[['e','Vol Plané',40,'Passe sous la flèche de la grue. Sans permis.']]],
['La Citrouille Contremaître',80,'rare','Quai','citrouille','lanterne','quai',{J:'#ff7a1a',v:'#e8e8e8'},[['c','Ordre Lumineux',40,'Ses consignes se voient à trois kilomètres.'],['cc','Faux Départ',50,'Siffle la fin du poste à 15 h. Tout le monde y croit.']]],
['Le Fantôme du Ferry de Minuit',70,'rare','Ferry','fantome',null,'ferry',{w:'#bcd8ff'},[['ee','Traversée Froide',50,'Les passagers grelottent. Le café aussi.']]],
['Le Squelette Pilote',80,'rare','Phare','squelette','ancre','phare',{Y:'#2a4a8a'},[['n','Cap Fantôme',40,'Guide les navires dans la brume. Ou dans les rochers.'],['nn','Gouvernail Mort',60,'Le bateau tourne en rond trois jours.']]],
['L’Araignée Grutière',80,'rare','Grue','araignee',null,'grue',{k:'#3a0a14',r:'#ffd04a'},[['nn','Fil d’Acier',50,'Remplace les câbles de la grue. Ça tient mieux.']]],
['Le Diablotin du Brasero',70,'rare','Quai','diablotin','lanterne','quai',null,[['c','Feu de Palette',40,'Réchauffe toute l’équipe. Et la palette.'],['cc','Fumée Noire',60,'On ne voit plus le port pendant une heure.']]],
['L’Épouvantail du Silo',70,'rare','Silo','epouvantail',null,'champ',{P:'#2a5a8a',H:'#5a3a1a'},[['c','Paille Volante',40,'Chaque rafale le refait un peu.'],['cc','Regard Vide',50,'Les dockers changent de quai.']]],
/* ---- ultra (7) ---- */
['Le Grand Loup du Môle',110,'ultra','Môle','loup',null,'rouge',{b:'#3a3a44',l:'#6a6a7a',S:'#2a2a2a'},[['n','Pleine Lune Rouge',60,'Quand la lune rougit, le môle se vide.'],['nnn','Dévoreur de Quart',100,'Termine le quart de nuit en une bouchée.']]],
['La Reine des Momies',100,'ultra','Cale','momie','couronne','cale',{b:'#f0e0b0',c:'#d0a040',y:'#ff4aff'},[['e','Bandelettes d’Or',50,'Emballe une cargaison entière.'],['eee','Sommeil Éternel',90,'Les navires restent à quai mille ans.']]],
['Le Zombie Capitaine',110,'ultra','Ferry','zombie','ancre','ferry',{O:'#1a2a5a',s:'#ffd04a'},[['n','Abordage',60,'Monte à bord sans passerelle.'],['nnc','Dernier Coup de Sirène',100,'Le ferry part. Avec lui, sans personne.']]],
['La Sorcière des Brumes',100,'ultra','Digue','sorciere','chaudron','brume',{V:'#1a4a3a',g:'#a8e8c8'},[['e','Potion de Brume',60,'Le port disparaît. Les douaniers aussi.'],['eee','Grand Chaudron',90,'Toute la soupe de poisson du port, en une fois.']]],
['Le Chat aux Neuf Vies',90,'ultra','Toits','chat',null,'cimetiere',{y:'#ffffff',K:'#5ae8ff'},[['n','Huitième Vie',50,'Tombe de la grue. Retombe sur ses pattes.'],['nnn','Neuvième Vie',100,'Celle-là, il la garde.']]],
['La Grande Chauve-Souris du Silo',100,'ultra','Silo','chauvesouris',null,'garde',{k:'#3a1a4a',r:'#ffd04a'},[['nn','Ombre Immense',70,'Cache la lune au-dessus du port.']]],
['Le Squelette Chef de Quai',110,'ultra','Quai','squelette','cle','grue',{Y:'#ffd700'},[['c','Coup de Sifflet',50,'Tout le quai s’arrête. Même le vent.'],['ccn','Planning Maudit',100,'Tout le monde travaille de nuit. Pour toujours.']]],
/* ---- epic (5) ---- */
['Le Fantôme de la Criée',130,'epic','Criée','fantome','poisson','criee',null,[['e','Marée Glacée',40,'Le poisson ne pourrit plus. Les clients ne reviennent plus non plus.'],['ee','Hurlement du Matin',70,'Réveille tout le port à 4 h.']]],
['La Faucheuse du Dernier Quart',140,'epic','Quai','faucheuse','faux','rouge',{c:'#5a1a2a',y:'#ff3a3a'},[['ee','Récolte',80,'Fauche les heures sup comme du blé.'],['eeen','Fin de Quart Éternelle',140,'Plus personne ne pointe. Jamais.']]],
['Le Diable du Port',130,'epic','Salle des machines','diablotin','faux','rouge',{R:'#a80e1e',r:'#000000'},[['cc','Pacte de Quai',70,'Signe ton contrat. En bas, à droite, en rouge.'],['ccc','Enfer des Machines',130,'La salle des machines chauffe à mille degrés.']]],
['L’Araignée Reine des Conteneurs',140,'epic','Terminal','araignee','couronne','grue',{k:'#2a0a3a',r:'#c08aff',y:'#c08aff'},[['nn','Toile du Terminal',80,'Relie les mille conteneurs entre eux.'],['nnn','Venin Noir',120,'Le grutier ne se réveille qu’à la fin du poste.']]],
['Frankendocker Ultime',140,'epic','Atelier','frank','ancre','phare',{G:'#5ae8a8',J:'#1a1a2a'},[['cc','Foudre du Phare',80,'Se recharge sur l’éclair qui frappe le phare.'],['cce','Réveil du Géant',140,'Soulève le ferry. Avec les passagers.']]],
/* ---- légendaires (3) ---- */
['Le Comte du Dernier Ferry',180,'legend','Ferry','vampire',null,'ferry',null,[['nn','Morsure de Minuit',90,'Ne monte à bord qu’après le coucher du soleil.'],['nnn','Traversée Sans Retour',160,'Le billet est gratuit. Le retour, non.']]],
['La Grande Sorcière de la Bonne Mère',170,'legend','Notre-Dame','sorciere','balai','garde',{V:'#2a0a4a',P:'#ffd04a',H:'#e8e8f0'},[['ee','Vol sur la Colline',90,'Fait le tour de la Bonne Mère à minuit pile.'],['eee','Sort de la Ville Entière',150,'Tout Marseille s’endort. Sauf l’OM.']]],
['Le Roi Citrouille',190,'legend','Quai','citrouille','lanterne','quai',{J:'#4a0a5a',v:'#ffd04a'},[['cc','Couronne de Flammes',100,'Sa lumière se voit de l’Estaque.'],['ccc','Récolte du Roi',170,'Toutes les citrouilles du port s’allument d’un coup.']],'couronne'],
/* ---- EX (2) ---- */
['Loup-Garou EX',220,'ex','Port','loup',null,'rouge',{b:'#1a1a1a',l:'#3a3a3a',S:'#5a0a0a',y:'#ff2a2a'},[['nn','Griffe Rouge',110,'Déchire un conteneur comme du papier.'],['nnnn','Nuit Sans Fin',200,'Le soleil ne se lève plus sur le port.']]],
['Faucheuse EX',210,'ex','Cimetière marin','faucheuse','faux','cimetiere',{C:'#0a0a12',c:'#3a1a5a',y:'#ff3aff'},[['ee','Appel des Noyés',110,'Les vieux marins sortent de l’eau.'],['eeee','Grande Faux',200,'Coupe le port en deux. Proprement.']]],
/* ---- full art (2) ---- */
['Le Fantôme du Château d’If',160,'fullart','Château d’If','fantome','ancre','brume',{w:'#d8f8ff'},[['ee','Évasion',90,'Traverse les murs. Il a eu le temps de s’entraîner.'],['eee','Comte de Brume',150,'Revient se venger sur tout le port.']]],
['La Sorcière de l’Estaque',160,'fullart','L’Estaque','sorciere','chaudron','garde',{V:'#5a0a2a',P:'#ff8ae8'},[['cc','Soupe du Soir',90,'Une louche, et tu vois l’avenir.'],['cce','Grand Sabbat',150,'Toutes les sorcières de la côte dansent sur le quai.']]],
/* ---- secrète (1) ---- */
['La Citrouille d’Or',250,'secrete','Le Port entier','citrouille','couronne','quai',null,[['ccc','Trésor d’Halloween',150,'Ses graines sont des pièces d’or.'],['cccc','Nuit Dorée',250,'Le port entier brille. Une seule nuit par an.']]]
];
const JEU=L.map((x,i)=>({n:i+1,nom:x[0],pv:x[1],rarete:x[2],lieu:x[3],m:x[4],o:x[5],d:x[6],pal:x[7],
  att:x[8].map(a=>({cout:a[0].split(''),nom:a[1],deg:a[2],txt:a[3]})),chap:x[9]||null,
  num:(x[2]==='secrete'?'051':('00'+(i+1)).slice(-3))+'/050'}));

/* ===================== LA CARTE ===================== */
function titreNeon(g,t,x,y,taille,ton,max){
  g.font='800 '+taille+'px '+SANS;
  while(g.measureText(t).width>max&&taille>12){taille--;g.font='800 '+taille+'px '+SANS;}
  g.shadowColor=ton;g.shadowBlur=10;g.fillStyle='#fff6e8';g.fillText(t,x,y);g.shadowBlur=0;
}
function bordLueur(g,ton,lw,flou){g.save();g.shadowColor=ton;g.shadowBlur=flou;g.strokeStyle=ton;g.lineWidth=lw;rr(g,7,7,CW-14,CH-14,11);g.stroke();g.restore();}
function holo(g,x,y,w,h,force,pas,angle){
  g.save();g.globalCompositeOperation='screen';g.translate(x+w/2,y+h/2);g.rotate(angle||-0.5);
  const D=Math.hypot(w,h);
  for(let i=-D;i<D;i+=pas){const hue=((i+D)/(2*D))*360;g.fillStyle='hsla('+hue+',100%,65%,'+force+')';g.fillRect(i,-D,pas*0.45,2*D);}
  g.restore();
}
function etincelles(g,x,y,w,h,n,graine,col){
  for(let i=0;i<n;i++){const sx=x+al(graine+i*3)*w, sy=y+al(graine+i*7)*h, s=1+al(graine+i)*3;
    g.fillStyle=col||'rgba(255,255,255,.9)';g.beginPath();g.moveTo(sx,sy-s*2);g.lineTo(sx+s*.5,sy);g.lineTo(sx,sy+s*2);g.lineTo(sx-s*.5,sy);g.fill();
    g.beginPath();g.moveTo(sx-s*2,sy);g.lineTo(sx,sy+s*.5);g.lineTo(sx+s*2,sy);g.lineTo(sx,sy-s*.5);g.fill();}
}
function doree(c){/* teinte or, pour la secrète */
  const v=parseInt(c.slice(1),16),r=v>>16&255,gg=v>>8&255,b=v&255;const l=(r*.3+gg*.59+b*.11)/255;
  const R=Math.round(90+165*l),G=Math.round(55+150*l),B=Math.round(10+80*l*l);
  return 'rgb('+R+','+G+','+B+')';}

function panneau(g,C,R,y0,opts){
  const o=opts||{};
  const p=g.createLinearGradient(0,y0-40,0,CH);p.addColorStop(0,'rgba(8,4,10,0)');p.addColorStop(.22,'rgba(8,4,10,'+(o.voile||.9)+')');p.addColorStop(1,'rgba(8,4,10,.97)');
  g.fillStyle=p;g.fillRect(0,y0-40,CW,CH-y0+40);
  g.textAlign='left';
  titreNeon(g,C.nom,20,y0,o.taille||19,R.ton,o.maxNom||220);
  g.textAlign='right';g.font='800 15px '+SANS;g.fillStyle=R.ton;g.shadowColor=R.ton;g.shadowBlur=6;g.fillText(C.pv+' PV',CW-20,y0);g.shadowBlur=0;
  g.textAlign='left';g.font='700 9.5px '+SANS;g.fillStyle='rgba(255,236,210,.7)';g.fillText(C.lieu.toUpperCase(),20,y0+13);
  let y=y0+24;
  for(const a of C.att){
    const hb=a.txt.length>52?40:31;
    g.fillStyle=o.bande||'rgba(255,154,42,.13)';rr(g,14,y,CW-28,hb,6);g.fill();
    g.strokeStyle=o.bandeTrait||'rgba(255,154,42,.25)';g.lineWidth=.6;rr(g,14,y,CW-28,hb,6);g.stroke();
    let jx=23;for(const t of a.cout){jeton(g,jx,y+10,5.4,t);jx+=12.5;}
    g.fillStyle='#fff4e0';g.font='800 11.5px '+SANS;g.fillText(a.nom,jx+2,y+14);
    g.textAlign='right';g.fillStyle=R.ton;g.font='800 15px '+SANS;g.fillText(String(a.deg),CW-22,y+15);g.textAlign='left';
    g.fillStyle='rgba(225,210,195,.85)';g.font='italic 8.4px '+SERIF;wrap(g,a.txt,22,y+25.5,CW-62,9.5,2);
    y+=hb+5;
  }
  const bx=o.bord||20;g.font='700 7.5px '+SANS;g.fillStyle='rgba(255,236,210,.55)';g.textAlign='left';g.fillText('POKÉDOCK · HALLOWEEN 2026',bx,CH-14);
  g.textAlign='right';g.fillStyle=R.ton;g.fillText(R.sym+'  '+C.num,CW-bx,CH-14);g.textAlign='left';
}
function entete(g,C,R){const lg=C.rarete==='legend',X=lg?34:20,Y=lg?36:27;g.font='800 8.5px '+SANS;g.textAlign='left';g.fillStyle=R.ton;g.shadowColor=R.ton;g.shadowBlur=6;
  if(!lg)g.fillText(R.nom,X,Y);g.textAlign='right';g.fillText('🎃 '+C.num,CW-X,Y);g.shadowBlur=0;g.textAlign='left';}

const SOLS={1:262,2:250};
function dessiner(g,C){
  const R=RAR[C.rarete], gr=C.n*17+5, nAtt=C.att.length;
  const sol=nAtt>1?250:278, y0=nAtt>1?CH-140:CH-98;
  g.save();rr(g,0,0,CW,CH,14);g.clip();
  g.fillStyle='#0a060c';g.fillRect(0,0,CW,CH);
  const r=C.rarete;
  if(r==='secrete'){
    /* LA SECRÈTE : tout l'or du port. Décor et monstre passés à la feuille
       d'or, poussière d'étoiles, reflets arc-en-ciel. */
    const tmp=document.createElement('canvas');tmp.width=CW*2;tmp.height=CH*2;const t=tmp.getContext('2d');t.setTransform(2,0,0,2,0,0);
    decor(t,0,0,CW,CH,C.d,gr);
    const d=t.getImageData(0,0,CW*2,CH*2),p=d.data;
    for(let i=0;i<p.length;i+=4){const l=(p[i]*.3+p[i+1]*.59+p[i+2]*.11)/255;p[i]=40+215*l;p[i+1]=22+170*l;p[i+2]=4+60*l*l;}
    t.putImageData(d,0,0);g.drawImage(tmp,0,0,CW,CH);
    holo(g,0,0,CW,CH,.10,9,-0.7);
    g.save();g.translate(CW/2,sol-90);for(let i=0;i<24;i++){g.rotate(Math.PI/12);g.fillStyle='rgba(255,230,140,.10)';g.beginPath();g.moveTo(0,0);g.lineTo(CW,-12);g.lineTo(CW,12);g.fill();}g.restore();
    monstre(g,C,CW/2,sol+6,7.4,doree);
    etincelles(g,10,10,CW-20,CH*.62,26,gr,'rgba(255,248,210,.95)');
  }else{
    decor(g,0,0,CW,CH,C.d,gr);
    if(r==='legend'){g.save();g.translate(CW/2,sol-70);for(let i=0;i<20;i++){g.rotate(Math.PI/10);g.fillStyle='rgba(255,215,120,.13)';g.beginPath();g.moveTo(0,0);g.lineTo(CW,-16);g.lineTo(CW,16);g.fill();}g.restore();}
    if(r==='epic'){const v=g.createRadialGradient(CW/2,sol-60,10,CW/2,sol-60,160);v.addColorStop(0,'rgba(190,140,255,.35)');v.addColorStop(1,'rgba(190,140,255,0)');g.fillStyle=v;g.fillRect(0,0,CW,CH);}
    if(r==='ex'){/* flammes au pied */const f=g.createLinearGradient(0,sol-70,0,sol+20);f.addColorStop(0,'rgba(255,60,20,0)');f.addColorStop(1,'rgba(255,60,20,.55)');g.fillStyle=f;
      for(let i=0;i<14;i++){const fx=i*CW/13,fh=30+al(gr+i)*55;g.beginPath();g.moveTo(fx-14,sol+20);g.quadraticCurveTo(fx-4,sol-fh*.5,fx,sol-fh);g.quadraticCurveTo(fx+4,sol-fh*.5,fx+14,sol+20);g.fill();}}
    const ech=r==='fullart'?8.6:r==='ex'?8.2:(r==='legend'?7.4:(nAtt>1?6.4:6.8));
    if(r==='ex'){const v2=g.createRadialGradient(CW/2,sol-90,10,CW/2,sol-90,170);v2.addColorStop(0,'rgba(255,40,20,.35)');v2.addColorStop(1,'rgba(255,40,20,0)');g.fillStyle=v2;g.fillRect(0,0,CW,CH);}
    if(r!=='ex')monstre(g,C,CW/2,sol+(r==='fullart'?30:0),ech*(M[C.m].c>=12?0.82:1));
    if(r==='ultra')holo(g,0,0,CW,CH*.66,.16,14,-0.6);
    if(r==='fullart'){holo(g,0,0,CW,CH,.13,5,-0.8);holo(g,0,0,CW,CH,.07,11,0.7);etincelles(g,10,10,CW-20,CH*.6,16,gr);}
    if(r==='epic')etincelles(g,10,30,CW-20,CH*.5,14,gr,'rgba(220,190,255,.9)');
    if(r==='legend')etincelles(g,10,30,CW-20,CH*.5,12,gr,'rgba(255,230,150,.95)');
  }
  /* vignette */
  const v=g.createRadialGradient(CW/2,CH*.4,CH*.22,CW/2,CH*.4,CH*.78);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.7)');g.fillStyle=v;g.fillRect(0,0,CW,CH);
  /* le panneau du bas */
  const opt={};
  if(r==='fullart'){opt.voile=.55;opt.bande='rgba(255,138,232,.14)';opt.bandeTrait='rgba(255,180,240,.35)';}
  if(r==='secrete'){opt.voile=.8;opt.bande='rgba(255,215,100,.14)';opt.bandeTrait='rgba(255,215,100,.45)';}
  if(r==='legend'){opt.bande='rgba(255,207,90,.12)';opt.bandeTrait='rgba(255,207,90,.4)';opt.maxNom=180;opt.bord=34;}
  if(r==='epic'){opt.bande='rgba(192,138,255,.13)';opt.bandeTrait='rgba(192,138,255,.35)';}
  if(r==='ultra'){opt.bande='rgba(90,232,255,.1)';opt.bandeTrait='rgba(90,232,255,.35)';}
  if(r==='rare'){opt.bande='rgba(232,240,255,.08)';opt.bandeTrait='rgba(232,240,255,.3)';}
  if(r==='ex'){opt.bande='rgba(255,40,40,.13)';opt.bandeTrait='rgba(255,60,60,.4)';opt.maxNom=200;}
  panneau(g,C,R,y0,opt);
  entete(g,C,R);
  g.restore();

  /* ===== LES CADRES ===== */
  if(r==='commune')bordLueur(g,'#ff9a2a',2.6,11);
  if(r==='rare'){bordLueur(g,'#e8f0ff',2.4,10);g.strokeStyle='rgba(232,240,255,.5)';g.lineWidth=.8;rr(g,12,12,CW-24,CH-24,8);g.stroke();
    for(const[x,y,sx,sy]of[[12,12,1,1],[CW-12,12,-1,1],[12,CH-12,1,-1],[CW-12,CH-12,-1,-1]]){g.strokeStyle='#e8f0ff';g.lineWidth=1.4;g.beginPath();g.moveTo(x,y+sy*16);g.quadraticCurveTo(x,y,x+sx*16,y);g.stroke();}}
  if(r==='ultra'){const b=g.createLinearGradient(0,0,CW,CH);b.addColorStop(0,'#5ae8ff');b.addColorStop(.5,'#c8f8ff');b.addColorStop(1,'#2aa8ff');
    g.save();g.shadowColor='#5ae8ff';g.shadowBlur=14;g.strokeStyle=b;g.lineWidth=3.2;rr(g,7,7,CW-14,CH-14,11);g.stroke();g.restore();}
  if(r==='epic'){bordLueur(g,'#b07aff',3,14);g.save();g.strokeStyle='rgba(220,190,255,.7)';g.lineWidth=1;rr(g,13,13,CW-26,CH-26,8);g.stroke();g.restore();}
  if(r==='legend'){
    /* LE CADRE D'OR CISELÉ : large, en relief, quatre chauves-souris d'or aux coins
       et un écusson qui porte la rareté. */
    const b=g.createLinearGradient(0,0,CW,CH);b.addColorStop(0,'#7a5a1a');b.addColorStop(.25,'#ffe8a0');b.addColorStop(.5,'#c8962a');b.addColorStop(.75,'#fff0b8');b.addColorStop(1,'#7a5a1a');
    g.save();g.beginPath();rr(g,0,0,CW,CH,14);rr(g,11,11,CW-22,CH-22,9,true);g.fillStyle=b;g.fill('evenodd');
    g.strokeStyle='rgba(60,40,0,.6)';g.lineWidth=1;rr(g,11,11,CW-22,CH-22,9);g.stroke();rr(g,3.5,3.5,CW-7,CH-7,12);g.stroke();
    g.fillStyle='rgba(90,60,10,.5)';for(let i=0;i<34;i++){g.beginPath();g.arc(20+i*8,7.2,1.1,0,7);g.arc(20+i*8,CH-7.2,1.1,0,7);g.fill();}
    for(let i=0;i<50;i++){g.beginPath();g.arc(7.2,22+i*7.8,1.1,0,7);g.arc(CW-7.2,22+i*7.8,1.1,0,7);g.fill();}
    for(const[x,y]of[[18,18],[CW-18,18],[18,CH-18],[CW-18,CH-18]]){g.fillStyle='#ffe8a0';g.beginPath();g.arc(x,y,9,0,7);g.fill();g.strokeStyle='#6a4a10';g.stroke();chauve(g,x,y,.36,'#5a3a08');}
    g.shadowColor='#ffcf5a';g.shadowBlur=12;g.fillStyle=b;rr(g,CW/2-52,-2,104,22,8);g.fill();g.shadowBlur=0;g.strokeStyle='#6a4a10';rr(g,CW/2-52,-2,104,22,8);g.stroke();
    g.fillStyle='#3a2408';g.font='800 10px '+SANS;g.textAlign='center';g.fillText('✹ LÉGENDAIRE ✹',CW/2,14);g.textAlign='left';
    g.restore();}
  if(r==='ex'){
    /* L'EX SORT DU CADRE : cadre rouge et noir, puis le monstre redessiné
       PAR-DESSUS, la tête qui dépasse en haut. */
    const b=g.createLinearGradient(0,0,0,CH);b.addColorStop(0,'#ff2a2a');b.addColorStop(.5,'#3a0606');b.addColorStop(1,'#ff2a2a');
    g.save();g.shadowColor='#ff2a2a';g.shadowBlur=16;g.beginPath();rr(g,0,0,CW,CH,14);rr(g,9,9,CW-18,CH-18,9,true);g.fillStyle=b;g.fill('evenodd');g.restore();
    g.save();g.beginPath();g.rect(0,0,CW,y0-30);g.clip();const hM=M[C.m].r.length,sE=Math.min(11,(sol+2)/hM);monstre(g,C,CW/2,sol+2+sE*0.6,sE*(M[C.m].c>=12?0.82:1));g.restore();
    /* le logo EX */
    g.save();g.translate(CW-50,y0-34);g.rotate(-0.12);g.font='900 italic 40px '+SANS;g.textAlign='center';
    const xg=g.createLinearGradient(0,-28,0,4);xg.addColorStop(0,'#ffffff');xg.addColorStop(.5,'#ff5a4a');xg.addColorStop(1,'#8a0a0a');
    g.lineWidth=5;g.strokeStyle='#1a0000';g.strokeText('EX',0,0);g.fillStyle=xg;g.shadowColor='#ff2a2a';g.shadowBlur=14;g.fillText('EX',0,0);g.restore();}
  if(r==='fullart'){g.save();g.beginPath();rr(g,0,0,CW,CH,14);rr(g,6,6,CW-12,CH-12,10,true);g.clip('evenodd');holo(g,0,0,CW,CH,.9,4,-0.5);g.restore();}
  if(r==='secrete'){g.save();g.beginPath();rr(g,0,0,CW,CH,14);rr(g,8,8,CW-16,CH-16,10,true);g.clip('evenodd');
    const b=g.createLinearGradient(0,0,CW,CH);b.addColorStop(0,'#8a5a10');b.addColorStop(.3,'#fff0a0');b.addColorStop(.55,'#c88a1a');b.addColorStop(.8,'#fff8d0');b.addColorStop(1,'#8a5a10');
    g.fillStyle=b;g.fillRect(0,0,CW,CH);holo(g,0,0,CW,CH,.35,6,-0.5);g.restore();
    g.save();g.shadowColor='#ffe08a';g.shadowBlur=18;g.strokeStyle='#fff4c0';g.lineWidth=1.2;rr(g,8,8,CW-16,CH-16,10);g.stroke();g.restore();}
}

/* ===================== DOS ET SACHET ===================== */
function graverDos(){
  const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');
  g.save();rr(g,0,0,CW,CH,16);g.clip();
  const f=g.createLinearGradient(0,0,CW,CH);f.addColorStop(0,'#1a0a2a');f.addColorStop(.5,'#3a1440');f.addColorStop(1,'#120618');g.fillStyle=f;g.fillRect(0,0,CW,CH);
  g.strokeStyle='rgba(255,138,26,.12)';g.lineWidth=1;for(let i=-CH;i<CW+CH;i+=14){g.beginPath();g.moveTo(i,0);g.lineTo(i-CH,CH);g.stroke();}
  const l=g.createRadialGradient(CW/2,CH/2,0,CW/2,CH/2,150);l.addColorStop(0,'rgba(255,140,30,.55)');l.addColorStop(1,'rgba(255,140,30,0)');g.fillStyle=l;g.fillRect(0,0,CW,CH);
  /* la grosse citrouille */
  g.save();g.translate(CW/2,CH/2);const r=56;
  for(const[i,cc]of[[-1,'#c85a10'],[1,'#c85a10'],[0,'#f08a2a']]){g.fillStyle=cc;g.beginPath();g.ellipse(i*r*.42,0,r*.64,r*.8,0,0,7);g.fill();}
  g.fillStyle='#3a6a2a';g.fillRect(-5,-r*.98,10,18);g.fillStyle='#ffe04a';g.shadowColor='#ffcc33';g.shadowBlur=14;
  g.beginPath();g.moveTo(-r*.46,-r*.12);g.lineTo(-r*.16,-r*.12);g.lineTo(-r*.31,-r*.4);g.fill();
  g.beginPath();g.moveTo(r*.46,-r*.12);g.lineTo(r*.16,-r*.12);g.lineTo(r*.31,-r*.4);g.fill();
  g.beginPath();g.moveTo(-r*.5,r*.16);g.lineTo(r*.5,r*.16);g.lineTo(r*.3,r*.46);g.lineTo(r*.1,r*.34);g.lineTo(-r*.1,r*.46);g.lineTo(-r*.3,r*.34);g.closePath();g.fill();
  g.restore();
  g.textAlign='center';g.font='800 24px '+SANS;g.fillStyle='#fff0d8';g.shadowColor='#ff8a1a';g.shadowBlur=12;g.fillText('POKÉDOCK',CW/2,74);
  g.font='800 12px '+SANS;g.fillStyle='#ffb04a';g.fillText('HALLOWEEN 2026',CW/2,CH-64);g.shadowBlur=0;
  for(let i=0;i<4;i++)chauve(g,40+i*72,112+(i%2)*14,.6,'rgba(0,0,0,.7)');
  g.restore();
  g.save();g.shadowColor='#ff8a1a';g.shadowBlur=10;g.strokeStyle='#ff9a2a';g.lineWidth=3;rr(g,6,6,CW-12,CH-12,11);g.stroke();g.restore();
  return c.toDataURL('image/png');
}
function graverSachet(){
  const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');
  const f=g.createLinearGradient(0,0,CW,CH);f.addColorStop(0,'#2a0a3a');f.addColorStop(.4,'#5a1a6a');f.addColorStop(.6,'#7a2a4a');f.addColorStop(1,'#1a0620');
  g.fillStyle=f;g.fillRect(0,0,CW,CH);
  /* reflets du mylar */
  const s=g.createLinearGradient(0,0,CW,0);s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.35,'rgba(255,255,255,.22)');s.addColorStop(.45,'rgba(255,255,255,0)');
  s.addColorStop(.7,'rgba(255,255,255,.1)');s.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=s;g.fillRect(0,0,CW,CH);
  /* la languette dentelée */
  g.fillStyle='#1a0620';g.fillRect(0,0,CW,28);g.fillStyle='rgba(255,154,42,.9)';g.font='800 9px '+SANS;g.textAlign='center';g.fillText('OUVRIR ICI ▸▸',CW/2,18);
  /* la scène */
  decor(g,24,70,CW-48,220,'cimetiere',7);
  g.save();g.beginPath();g.rect(24,70,CW-48,220);g.clip();monstre(g,JEU[0],CW/2,272,5.2);g.restore();
  g.strokeStyle='#ff9a2a';g.lineWidth=2;g.shadowColor='#ff8a1a';g.shadowBlur=10;g.strokeRect(24,70,CW-48,220);g.shadowBlur=0;
  g.font='800 30px '+SANS;g.fillStyle='#fff0d8';g.shadowColor='#ff8a1a';g.shadowBlur=14;g.fillText('POKÉDOCK',CW/2,58);g.shadowBlur=0;
  g.font='800 16px '+SANS;g.fillStyle='#ffb04a';g.fillText('🎃 HALLOWEEN 2026 🎃',CW/2,320);
  g.font='700 11px '+SANS;g.fillStyle='#e8d0f0';g.fillText('10 CARTES · 50 MONSTRES À COLLECTIONNER',CW/2,342);
  g.fillStyle='#1a0620';g.fillRect(0,CH-40,CW,40);g.fillStyle='#ffb04a';g.font='800 12px '+SANS;g.textAlign='left';g.fillText('ÉDITION LIMITÉE',16,CH-16);
  g.textAlign='right';g.fillText('8 €',CW-16,CH-16);
  return c.toDataURL('image/png');
}

/* ===================== CE QUI SORT ===================== */
const faces={};let DOS=null,SAC=null;
function face(n){
  if(faces[n])return faces[n];
  const C=JEU[n-1];if(!C)return dos();
  const c=document.createElement('canvas');c.width=CW*2;c.height=CH*2;
  const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
  try{dessiner(g,C);}catch(x){}
  return faces[n]=c.toDataURL('image/png');
}
const dos=()=>DOS||(DOS=graverDos());
const sachet=()=>SAC||(SAC=graverSachet());
window.PokedockHW={
  face:face, dos:dos, sachet:sachet, total:50,
  nom:(n)=>(JEU[n-1]||{}).nom||'?',
  rarete:(n)=>(JEU[n-1]||{}).rarete||'commune',
  num:(n)=>(JEU[n-1]||{}).num||'?',
  SECTIONS:[['LES COMMUNES',1,18],['LES RARES',19,30],['LES ULTRA RARES',31,37],['LES EPIC',38,42],
    ['LES LÉGENDAIRES',43,45],['LES EX',46,47],['LES FULL ART',48,49],['LA SECRÈTE',50,50]],
  _jeu:JEU
};
})();
