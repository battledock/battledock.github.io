/* ================= TOKYO, LA VILLE DE TOUS LES POSSIBLES =================
   Carte de jeu.html (CARTE==='tokyo'), sur le modèle du port : un sol peint,
   une bloque() qui retient le joueur, et les interactions dans majAction().
   Pas de DECOR : tout le décor est peint dans le sol, les obstacles sont
   listés dans TK.blocs. Le joystick est celui de tout le jeu.

   Le monde : une rue de neuf cents pixels de large en bas, des façades
   néon en haut (on ne marche pas dedans), une autoroute en bas (réservée
   aux véhicules, pas encore faits dans cette carte). */

const TK={
  bati:206,                       /* le pied des façades du nord : au-dessus, rien ne marche */
  trotN:[206,236], avenue:[236,400], trotS:[400,452],
  rangee:452, bas:492,            /* la rangée des boutiques ; au-delà, la glissière et l'autoroute */
  parking:{y0:606},               /* le parking, tout en bas de la carte */
  pont:{x0:985,x1:1015},          /* le pont piéton au-dessus de l'autoroute */
  /* tout ce qui barre le passage : [x0, y0, x1, y1] */
  blocs:[
    [40,452,210,500],[250,452,420,500],[470,452,590,500],
    [620,452,770,500],[810,452,980,500],[1020,452,1190,500],[1220,452,1340,500],
    [146,228,154,238],[446,228,454,238],[746,228,754,238],[1046,228,1054,238],[1296,228,1304,238],
    [556,300,572,316],[1096,300,1112,316]
  ],
  /* la porte de l'armurerie, dans la façade ; on se place devant pour entrer */
  porte:{x:695,y0:418,y1:462,l:52},
  /* la sortie, à l'ouest : le panneau vers le port */
  sortie:{x:60,y0:296,y1:420},
  arrivee:[84,360]
};

function bloqueTokyo(x,y){
  if(x<6||x>MONDE_L-6)return true;
  if(y<TK.bati+6)return true;
  if(y>TK.bas-8&&y<TK.parking.y0&&!(x>TK.pont.x0&&x<TK.pont.x1))return true;
  if(y>MONDE_H-6)return true;
  for(const [x0,y0,x1,y1] of TK.blocs){
    if(x>x0-6&&x<x1+6&&y>y0-6&&y<y1+6)return true;
  }
  return false;
}

/* LES IMMEUBLES DE TOKYO. Cinq styles, comme dans une vraie rue de Shinjuku
   ou de Shibuya : la tour de béton aux petites fenêtres et aux climatiseurs,
   l'immeuble carrelé aux enseignes perpendiculaires, la tour de verre bleu,
   l'ancien immeuble de briques avec son escalier de secours, et l'hôtel
   pastel aux néons roses. Chacun se peint sur sa propre toile. */
const TKP={
  styles:[
    {p:'#5e5b6c',e:'#4b4859',h:'#8a86a0',o:'#2c2a3a',fen:'#27304a',cadre:'#7d7a8e'},
    {p:'#e9dcc8',e:'#d7c2a6',h:'#fff6e8',o:'#6e5a4a',fen:'#263044',cadre:'#7fc7c0'},
    {p:'#23406a',e:'#1a2f50',h:'#4f78a8',o:'#0f1a2e',fen:'#1d2a44',cadre:'#3e6790'},
    {p:'#6b5548',e:'#4e3c33',h:'#8f7a6a',o:'#2e221c',fen:'#25262f',cadre:'#8f7a6a'},
    {p:'#e7a6c8',e:'#c9789f',h:'#ffd0e6',o:'#7a3c5c',fen:'#3a2a4a',cadre:'#ffd0e6'}],
  vitres:['#ffd98a','#7fe8ff','#ff4fb0','#b08cff','#ffe6b0','#ffb36b'],
  auvents:[['#c8413c','#f2e6d0'],['#2f7d6b','#f2e6d0'],['#e0a030','#2a2236'],['#3a5fb0','#f2e6d0']],
  kanji:['ラーメン','居酒屋','カラオケ','薬','酒','食堂','喫茶','ゲーム','湯','本','寿司','電気']
};
const TOKYO_FONTE='"Noto Sans JP","Hiragino Sans","Yu Gothic",sans-serif';

function graverBatimentTokyo(v,W,Hh,opt){
  opt=opt||{};
  const lointain=!!opt.lointain, boutique=!!opt.boutique;
  const gr=opt.gr||(boutique?34:44);
  const type=(opt.type!==undefined)?opt.type:(v%5);
  const B=TKP.styles[type];
  const c=document.createElement('canvas');c.width=W;c.height=Hh;
  const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const A=(i)=>alea(i*1.13+v*7.7+(opt.graine||0));
  const glow=(fn,col,blur)=>{g.save();g.shadowColor=col;g.shadowBlur=blur||6;fn();g.restore();};
  const texte=(s,x,y,col,px,centre)=>{g.save();g.font='bold '+(px||8)+'px '+TOKYO_FONTE;g.textBaseline='top';
    g.textAlign=centre?'center':'left';g.shadowColor=col;g.shadowBlur=5;g.fillStyle=col;g.fillText(s,x,y);g.restore();};
  /* une fenêtre éclairée : dégradé de la lumière vers le fond de la pièce,
     et parfois une silhouette, une plante, un store à demi baissé */
  const litWin=(x,y,w,h,col,id)=>{
    const gd=g.createLinearGradient(0,y,0,y+h);
    gd.addColorStop(0,col);gd.addColorStop(1,'#1b1f2c');
    g.fillStyle=gd;g.fillRect(x|0,y|0,w|0,h|0);
    if(A(id+11)<0.35)R(x+w*0.5-2,y+h-8,4,7,'rgba(20,16,30,.65)');
    if(A(id+13)<0.3)R(x+2,y+h-4,w-4,3,'rgba(40,70,40,.6)');
    if(A(id+17)>0.55)for(let s=0;s<h*0.45;s+=2)R(x,y+s,w,1,'rgba(30,20,40,.45)');
  };
  const fenetreSobre=(x,y,w,h,id)=>{
    R(x-1,y-1,w+2,h+2,B.cadre);
    if(A(id+3)<0.45)litWin(x,y,w,h,TKP.vitres[(A(id*2)*TKP.vitres.length)|0],id);
    else{R(x,y,w,h,B.fen);g.fillStyle='rgba(200,220,255,.18)';g.beginPath();
      g.moveTo(x+1,y+h-1);g.lineTo(x+w*0.45,y+1);g.lineTo(x+w*0.62,y+1);g.lineTo(x+w*0.2,y+h-1);g.fill();}
  };

  /* LE MUR : la matière du style */
  R(0,0,W,Hh,B.p);
  if(!lointain){
    if(type===0){   /* béton, panneaux et coulures */
      for(let y=10;y<Hh-gr;y+=30)R(0,y,W,1,B.e);
      for(let x=0;x<W;x+=26)for(let y=10;y<Hh-gr;y+=30)R(x,y,1,30,B.e);
      for(let i=0;i<W*Hh/50;i++)R(A(i)*W,A(i+500)*Hh,1,1,A(i*3)>0.5?B.h:B.e);
      for(let i=0;i<8;i++)R(A(i*4)*W,10+A(i*6)*(Hh-gr-30),2,14+A(i)*20,'rgba(30,28,40,.25)');
    }
    if(type===1){   /* carrelage 8 x 8, quelques carreaux teal et rose */
      const cars=['#e9dcc8','#e9dcc8','#e9dcc8','#d7c2a6','#7fc7c0','#e7a6c8'];
      for(let y=10;y<Hh-gr;y+=8)for(let x=0;x<W;x+=8){
        R(x,y,8,8,cars[(A(x*0.7+y*1.9)*cars.length)|0]);R(x,y+7,8,1,'rgba(60,50,40,.35)');R(x+7,y,1,8,'rgba(60,50,40,.35)');}
    }
    if(type===2){   /* verre : bandes d'étage et reflets de ciel */
      for(let y=10;y<Hh-gr;y+=26){R(0,y,W,3,B.h);R(0,y+3,W,2,B.o);}
      for(let x=0;x<W;x+=24)R(x,10,2,Hh-gr-10,B.o);
      for(let y=10;y<Hh-gr;y+=26)for(let x=2;x<W;x+=24){
        if(A(x+y)<0.35){g.fillStyle='rgba(180,220,255,.16)';g.beginPath();g.moveTo(x,y+22);g.lineTo(x+10,y+3);g.lineTo(x+16,y+3);g.lineTo(x+6,y+22);g.fill();}}
    }
    if(type===3){   /* briques, en quinconce */
      for(let y=10;y<Hh-gr;y+=4)for(let x=((y/4)%2)*4;x<W;x+=8)R(x,y,7,3,A(x+y*3)>0.5?B.p:B.e);
      R(0,10,W,1,B.h);
    }
    if(type===4){   /* pastel, frise de petits cercles */
      for(let y=10;y<Hh-gr;y+=12)for(let x=((y/12)%2)*6;x<W;x+=12){R(x+2,y+2,3,3,'#ffd0e6');}
      for(let y=10;y<Hh-gr;y+=40)R(0,y,W,2,'#ffb0d4');
    }
  }
  /* la corniche */
  R(0,0,W,3,B.h);R(0,3,W,2,B.o);
  if(!lointain)R(0,5,W,3,'rgba(20,16,30,.25)');

  /* LES FENÊTRES, selon le style */
  const nf=Math.max(0,Math.floor((Hh-gr-12)/(type===0?20:(type===2?26:30))));
  const fH=(Hh-gr-12)/Math.max(1,nf);
  for(let f=0;f<nf;f++){
    const y0=Math.round(Hh-gr-(f+1)*fH+4);
    if(type===0){   /* petites fenêtres serrées, climatiseurs */
      const wW=10,wH=11,n=Math.floor((W-10)/14);
      for(let k=0;k<n;k++){const x=Math.round(6+k*((W-12)/n)+((W-12)/n-wW)/2),id=f*37+k;
        if(lointain){if(A(id)<0.3)R(x,y0+3,wW,wH-3,TKP.vitres[(A(id*2)*6)|0]);continue;}
        fenetreSobre(x,y0+2,wW,wH,id);
        if(A(id+7)>0.6){R(x-1,y0+wH+4,wW+2,6,'#c9ccd4');R(x-1,y0+wH+4,wW+2,1,'#eef0f5');for(let s=0;s<2;s++)R(x+1,y0+wH+6+s*2,wW-2,1,'#7d8290');}
      }
    }else if(type===1){   /* fenêtres à cadre coloré, petit auvent */
      const wW=16,wH=16,n=Math.max(1,Math.floor((W-12)/22)),pas=(W-12)/n;
      for(let k=0;k<n;k++){const x=Math.round(6+k*pas+(pas-wW)/2),id=f*41+k;
        if(lointain){if(A(id)<0.35)R(x,y0+3,wW,wH-4,TKP.vitres[(A(id*2)*6)|0]);continue;}
        fenetreSobre(x,y0+4,wW,wH,id);
        if(A(id+9)>0.7){R(x-3,y0+1,wW+6,3,['#c8413c','#2f7d6b','#e0a030'][(A(id)*3)|0]);}
      }
    }else if(type===2){   /* verre : fenêtres larges, presque sans cadre */
      const n=Math.max(1,Math.floor((W-12)/24));
      for(let k=0;k<n;k++){const x=6+k*24+3,id=f*43+k;
        if(lointain){if(A(id)<0.4)R(x,y0+4,18,fH-8,TKP.vitres[(A(id*2)*6)|0]);continue;}
        if(A(id+3)<0.3)litWin(x,y0+5,18,fH-10,TKP.vitres[(A(id*2)*6)|0],id);
        else{R(x,y0+5,18,fH-10,B.fen);g.fillStyle='rgba(200,220,255,.14)';g.beginPath();g.moveTo(x+1,y0+fH-6);g.lineTo(x+9,y0+6);g.lineTo(x+12,y0+6);g.lineTo(x+4,y0+fH-6);g.fill();}
      }
    }else if(type===3){   /* briques : fenêtres à volets verts, pots de fleurs */
      const wW=12,wH=16,n=Math.max(1,Math.floor((W-30)/20)),pas=(W-30)/n;
      for(let k=0;k<n;k++){const x=Math.round(20+k*pas+(pas-wW)/2),id=f*47+k;
        if(lointain){if(A(id)<0.3)R(x,y0+3,wW,wH-3,TKP.vitres[(A(id*2)*6)|0]);continue;}
        fenetreSobre(x,y0+3,wW,wH,id);
        R(x-3,y0+3,2,wH,'#3f7a4f');R(x+wW+1,y0+3,2,wH,'#3f7a4f');
        if(A(id+5)>0.7){R(x-1,y0+wH+6,wW+2,4,'#8a4a2a');R(x,y0+wH+3,wW,3,'#4f9a4f');R(x+2,y0+wH+1,2,2,'#7fd07f');}
      }
      /* l'escalier de secours, en zigzag le long du mur de gauche */
      if(!lointain){g.strokeStyle='#2a2a33';g.lineWidth=1;
        R(3,y0+wH+6,14,1,'#2a2a33');
        g.beginPath();g.moveTo(4,y0+wH+6);g.lineTo(16,y0+fH+4);g.stroke();}
    }else if(type===4){   /* arches roses, lumière mauve */
      const wW=14,wH=18,n=Math.max(1,Math.floor((W-12)/22)),pas=(W-12)/n;
      for(let k=0;k<n;k++){const x=Math.round(6+k*pas+(pas-wW)/2),id=f*53+k;
        if(lointain){if(A(id)<0.35)R(x,y0+4,wW,wH-4,'#ffd0e6');continue;}
        R(x-1,y0+1,wW+2,wH+2,'#ffd0e6');
        if(A(id+3)<0.5)litWin(x,y0+2,wW,wH,A(id)<0.5?'#ffb0d4':'#c9b0ff',id);
        else{R(x,y0+2,wW,wH,'#3a2a4a');}
        R(x,y0+1,wW,2,'#ffd0e6');
      }
    }
  }

  /* LES ENSEIGNES : une verticale en kanji sur un immeuble sur deux, un
     néon rose sur l'hôtel, un bandeau sur la tour de verre */
  if(!lointain&&!boutique){
    if(type===0||type===1||type===3){
      const x=W-12, y=14, col=['#ff4fb0','#7fe8ff','#ffd98a'][v%3];
      const mot=TKP.kanji[(v*7+1)%TKP.kanji.length];
      R(x-2,y,12,mot.length*10+6,'#120e1c');
      for(let k=0;k<mot.length;k++)glow(()=>texte(mot[k],x-1,y+3+k*10,col,9),col,6);
    }
    if(type===4){
      R(W*0.3|0,4,W*0.4|0,9,'#2a1630');
      texte('ホテル',W/2,5,'#ff4fb0',8,true);
    }
    if(type===2){
      R(W*0.2|0,6,W*0.6|0,9,'#0a1424');
      texte('TOWER',W/2,7,'#7fe8ff',8,true);
    }
    if(type===0){   /* un réservoir d'eau, et une antenne au voyant rouge */
      R(W*0.7|0,0,14,6,'#6b4a2a');R(W*0.7|0,0,14,1,'#8a6a40');
    }
    if(type===0||type===2){
      const ax=Math.round(W*(0.2+A(77)*0.5));
      R(ax,0,1,-0,'#000');
      g.strokeStyle='#15131f';g.lineWidth=1;g.beginPath();g.moveTo(ax+0.5,0);g.lineTo(ax+0.5,-1);g.stroke();
      glow(()=>R(ax-1,-3,3,3,'#ff3b3b'),'#ff3b3b',6);
    }
  }

  /* LE REZ-DE-CHAUSSÉE : l'auvent, la vitrine, la porte, et une bande de néon */
  const au=TKP.auvents[(v+1+type)%4];
  const y0=Hh-gr+2;
  if(boutique){
    R(4,0,W-8,10,'#120e1c');
    texte(opt.sig||'',W/2,1,opt.neon||'#ff4fb0',8,true);
  }
  for(let x=4,k=0;x<W-4;x+=7,k++){const col=k%2?au[0]:au[1];R(x,y0,7,8,col);R(x+1,y0+8,5,2,col);}
  R(4,y0-1,W-8,1,'rgba(0,0,0,.3)');
  R(6,y0+12,W-12,gr-16,'#2c2030');
  g.save();g.globalAlpha=0.75;R(8,y0+14,W-16,gr-20,type===2?'#9fe0ff':'#ffd58a');g.restore();
  for(let x=20;x<W-14;x+=40)R(x,y0+12,2,gr-16,B.o);
  R(W/2-8,y0+12,16,gr-14,'#1a1a24');R(W/2-6,y0+14,12,gr-20,'#6fb8d8');R(W/2-6,y0+14,12,2,'rgba(255,255,255,.25)');
  R(0,Hh-3,W,3,B.o);
  /* contour : une ligne d'ombre à droite, une lumière à gauche */
  R(W-1,0,1,Hh,B.o);R(0,0,1,Hh,B.h);
  if(lointain){g.fillStyle='rgba(60,40,96,.45)';g.fillRect(0,0,W,Hh);}
  return c;
}

function construireSolTokyo(){
  const W=MONDE_L,H=MONDE_H;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));};
  const A=(i)=>alea(i*1.37+0.21);
  const neon=(x,y,w,h,col)=>{g.save();g.shadowColor=col;g.shadowBlur=10;g.fillStyle=col;g.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));g.restore();};
  const txt=(s,x,y,col,px)=>{g.save();g.font='bold '+px+'px monospace';g.textBaseline='top';
    g.shadowColor=col;g.shadowBlur=8;g.fillStyle=col;g.fillText(s,x,y);g.restore();};

  /* 1. LE CIEL DE NUIT */
  for(let y=0;y<TK.bati;y++){const k=y/TK.bati;
    R(0,y,W,1,'rgb('+(12+k*30|0)+','+(8+k*8|0)+','+(32+k*36|0)+')');}
  for(let i=0;i<70;i++)R(A(i)*W,A(i+90)*60,1,1,'rgba(230,230,255,.6)');

  /* 2. LES IMMEUBLES DU FOND, voilés, puis ceux du premier plan */
  let x=-30,i=0;
  while(x<W+10){
    const w=110+Math.floor(A(i*3.1+40)*50), h=86+Math.floor(A(i*2.2+50)*44);
    const cv=graverBatimentTokyo(i+2,w,h,{lointain:true,graine:900});
    g.drawImage(cv,x,176-h);
    x+=w+2;i++;
  }
  x=-30;i=0;
  while(x<W+10){
    const w=150+Math.floor(A(i*2.7)*56), h=118+Math.floor(A(i*5.3)*48);
    const cv=graverBatimentTokyo(i,w,h,{graine:i*5});
    g.drawImage(cv,x,TK.bati-h);
    x+=w+2;i++;
  }
  /* les câbles électriques, qui zigzaguent d'un immeuble à l'autre */
  g.strokeStyle='rgba(12,10,20,.85)';g.lineWidth=1;
  [[30,44],[52,62],[38,72]].forEach(([y1,y2],k)=>{g.beginPath();g.moveTo(0,y1);
    for(let x=0;x<=W;x+=60){g.quadraticCurveTo(x+30,(k%2?y2:y1)+14,x+60,y1+(k*3)%8);}g.stroke();});
  txt('TOKYO',560,40,'#ff4fb0',30);
  txt('LA VILLE DE TOUS LES POSSIBLES',470,80,'#7fe8ff',10);

  /* 3. LES TROTTOIRS et la rue */
  const paver=(y0,y1,c1,c2)=>{for(let y=y0;y<y1;y+=6){const d=((y/6)%2)?12:0;
    for(let x=-d;x<W;x+=24){R(x+1,y+1,22,5,A(x*0.31+y*0.7)>0.5?c1:c2);R(x,y,24,1,'rgba(0,0,0,.16)');}}};
  paver(TK.trotN[0],TK.trotN[1],'#5d5a70','#55526a');
  R(0,TK.avenue[0],W,TK.avenue[1]-TK.avenue[0],'#2a2936');
  for(let i=0;i<900;i++)R(A(i)*W,TK.avenue[0]+A(i+40)*(TK.avenue[1]-TK.avenue[0]),2,1,'rgba(255,255,255,.04)');
  const refl=['#ff4fb0','#7fe8ff','#ffd98a','#b08cff'];
  g.globalAlpha=0.12;
  for(let i=0;i<46;i++)R(A(i*1.9)*W,240+A(i*3.3)*150,40+A(i*5.1)*120,1,refl[i%4]);
  g.globalAlpha=1;
  [[300,330],[900,930]].forEach(([x0,x1])=>{for(let y=TK.avenue[0]+10;y<TK.avenue[1]-10;y+=10)R(x0,y,x1-x0,5,'rgba(230,230,240,.5)');});
  paver(TK.trotS[0],TK.trotS[1],'#4a4560','#46405a');

  /* 4. LA RANGÉE DES BOUTIQUES, peinte comme les façades */
  const BOUT=[
    {x0:40,x1:210,sig:'RAMEN',neon:'#ff4fb0',v:1},
    {x0:250,x1:420,sig:'KARAOKE',neon:'#7fe8ff',v:2},
    {x0:470,x1:590,sig:'DRINK',neon:'#ffd98a',v:0},
    {x0:620,x1:770,sig:'武器屋',neon:'#7ff0ff',v:3,porte:true},
    {x0:810,x1:980,sig:'BAR',neon:'#ff4fb0',v:1},
    {x0:1020,x1:1190,sig:'PACHINKO',neon:'#b08cff',v:2},
    {x0:1220,x1:1340,sig:'KONBINI',neon:'#ffd98a',v:0}];
  for(const s of BOUT){
    const cv=graverBatimentTokyo(s.v+7,s.x1-s.x0,48,{boutique:true,sig:s.sig,neon:s.neon,graine:s.x0});
    g.drawImage(cv,s.x0,TK.rangee);
    if(s.porte){
      /* le rideau métallique de l'armurerie, bordé de cyan */
      R(682,TK.rangee+18,26,30,'#0d1116');
      R(682,TK.rangee+18,26,2,'#7ff0ff');R(682,TK.rangee+18,1,30,'#7ff0ff');R(707,TK.rangee+18,1,30,'#7ff0ff');
      for(let y=TK.rangee+22;y<TK.rangee+48;y+=4)R(684,y,22,1,'#1d2630');
      neon(676,TK.rangee+16,38,1,'#7ff0ff');
    }
  }
  /* L'ENTRÉE DE L'ARMURERIE : une lueur qui tombe sur le trottoir, un tapis
     cyan devant la porte, et un panneau au-dessus, lisible de loin */
  const lum=g.createRadialGradient(695,TK.rangee,4,695,TK.rangee,46);
  lum.addColorStop(0,'rgba(127,240,255,.30)');lum.addColorStop(1,'rgba(127,240,255,0)');
  g.fillStyle=lum;g.fillRect(649,TK.rangee-40,92,60);
  R(668,TK.rangee-10,54,9,'rgba(127,240,255,.16)');
  R(668,TK.rangee-10,54,1,'#7ff0ff');R(668,TK.rangee-2,54,1,'#7ff0ff');
  for(let x=672;x<718;x+=6)R(x,TK.rangee-6,3,1,'rgba(127,240,255,.6)');
  R(654,TK.rangee-30,82,13,'#0a1216');R(654,TK.rangee-30,82,1,'#7ff0ff');
  txt('ARMURERIE ▼',665,TK.rangee-28,'#7ff0ff',9);
  /* les lanternes rouges des izakayas, sous les auvents */
  [[120,'#ff3b3b'],[330,'#ffb347'],[605,'#ff3b3b'],[1100,'#ffb347'],[1290,'#ff3b3b']].forEach(([x,col])=>{
    g.save();g.shadowColor=col;g.shadowBlur=12;g.fillStyle=col;g.beginPath();g.ellipse(x,TK.rangee+12,6,8,0,0,7);g.fill();g.restore();
    R(x-1,TK.rangee+3,2,2,'#2a1a14');});

  /* les distributeurs et les lampadaires du trottoir */
  [[556,300],[1096,300]].forEach(([x,y])=>{R(x,y,16,16,'#2a6fb0');R(x,y,16,1,'#8fd0ff');
    for(let k=0;k<4;k++)R(x+10,y+3+k*3,3,2,['#ff4fb0','#ffd98a','#7fe8ff','#b08cff'][k]);
    neon(x+2,y+12,12,2,'#7fe8ff');});
  [146,446,746,1046,1296].forEach(x=>{
    R(x-1,TK.bati+8,2,22,'#2e2c3a');R(x-4,TK.bati+7,8,2,'#2e2c3a');
    const gr=g.createRadialGradient(x,TK.bati+10,2,x,TK.bati+10,70);
    gr.addColorStop(0,'rgba(255,220,150,.22)');gr.addColorStop(1,'rgba(255,220,150,0)');
    g.fillStyle=gr;g.fillRect(x-70,TK.bati-60,140,140);});

  /* 5. LA SORTIE, à l'ouest : un panneau vert vers le port */
  R(10,286,50,20,'#1f6b4a');R(10,286,50,1,'#7fe0b0');R(10,305,50,1,'#0f3a28');
  g.save();g.font='bold 9px monospace';g.fillStyle='#e8fff2';g.fillText('< PORT',16,291);g.restore();
  R(34,306,2,6,'#2e2c3a');

  /* 6. L'AUTOROUTE, en bas : une glissière, la chaussée, puis le pont piéton */
  R(0,TK.bas,W,6,'#5d6878');R(0,TK.bas,W,1,'#9fb0c4');
  for(let x=0;x<W;x+=30)R(x,TK.bas+5,3,10,'#4a5566');
  R(0,TK.bas+15,W,TK.parking.y0-TK.bas-15,'#23242e');
  for(const y of [TK.bas+38,TK.bas+70])for(let x=0;x<W;x+=60)R(x,y,34,3,'#e8dcc0');
  for(let i=0;i<70;i++)R(A(i*2)*W,TK.bas+18+A(i*3)*(TK.parking.y0-TK.bas-30),7,2,(i%2)?'rgba(255,70,70,.7)':'rgba(255,240,200,.6)');
  const pt=TK.pont;
  R(pt.x0,TK.bas,pt.x1-pt.x0,TK.parking.y0-TK.bas,'#4a5566');
  for(let y=TK.bas;y<TK.parking.y0;y+=6)R(pt.x0+2,y,pt.x1-pt.x0-4,1,'#2e3644');
  R(pt.x0,TK.bas,2,TK.parking.y0-TK.bas,'#9fb0c4');R(pt.x1-2,TK.bas,2,TK.parking.y0-TK.bas,'#9fb0c4');

  /* 6 bis. LE PARKING, plat et vide : le bitume, les lignes des places, les lampadaires */
  const Y0=TK.parking.y0;
  R(0,Y0,W,H-Y0,'#2b2c36');
  for(let i=0;i<500;i++)R(A(i*5.5)*W,Y0+A(i*7.1)*(H-Y0),2+A(i)*3,1,'rgba(0,0,0,.12)');
  R(0,Y0-2,W,6,'#8a8a95');R(0,Y0+4,W,1,'#55555f');
  for(let y=Y0+40;y+100<H-20;y+=120){
    for(let x=20;x<W-20;x+=70)R(x,y,2,100,'rgba(235,235,245,.55)');
    R(20,y+100,W-40,2,'rgba(235,235,245,.55)');}
  for(const x of [150,500,850,1200])for(const y of [Y0+18,H-22])lampadaireTK(g,x,y);
  g.fillStyle='rgba(20,12,40,.10)';g.fillRect(0,Y0,W,H-Y0);

  /* 7. LE VERNIS DE PLUIE sur le bas de la carte */
  g.fillStyle='rgba(20,12,40,.10)';g.fillRect(0,TK.bati,W,H-TK.bati);
  return c;
}

/* un lampadaire vu d'en haut : socle, mât, tête lumineuse, et la flaque de lumière au sol */
function lampadaireTK(g,x,y){
  const pool=g.createRadialGradient(x,y,4,x,y,78);
  pool.addColorStop(0,'rgba(255,214,140,.22)');pool.addColorStop(1,'rgba(255,214,140,0)');
  g.fillStyle=pool;g.fillRect(x-78,y-78,156,156);
  g.fillStyle='#14141a';g.beginPath();g.ellipse(x,y,4,2.4,0,0,7);g.fill();
  g.fillStyle='#3a3a48';g.fillRect(x-1,y-20,2,20);
  g.save();g.shadowColor='#ffd98a';g.shadowBlur=10;
  g.fillStyle='#fff1c4';g.beginPath();g.ellipse(x,y-21,3.4,2.2,0,0,7);g.fill();g.restore();
}

function semerDecorTokyo(){
  /* rien à poser en objets : le décor est dans le sol */
  DECOR=[];
}

/* Arrivée : à l'entrée ouest, près du panneau du port. */
function poserTokyo(){
  const [dx,dy]=degager(TK.arrivee[0],TK.arrivee[1]);
  joueur.x=dx;joueur.y=dy;e.ext={x:dx,y:dy};e.extc='tokyo';e.carte='tokyo';
  try{sauver();}catch(x){}
}

/* ---------- L'ARMURERIE : la même boutique que l'arcade, les mêmes armes ---------- */

const ARMES_TK={
  fusil:  {nom:'FUSIL D’ARGENT', c:'#e8f4ff', mot:'neuf plombs en éventail'},
  minigun:{nom:'MINIGUN',        c:'#ffd98a', mot:'une rafale qui ne s’arrête jamais'},
  plasma: {nom:'PLASMA',         c:'#b08cff', mot:'rebondit deux fois sur les murs'},
  railgun:{nom:'RAILGUN',        c:'#7ff0ff', mot:'un trait qui traverse tout, à très longue portée'}
};

async function rpcTokyo(nom,args){
  if(!sb)return {erreur:'La caisse est hors ligne. Réessaie dans un instant.'};
  try{
    const s=await sb.auth.getSession();
    if(!s||!s.data||!s.data.session){try{await window.BD_SESSION.reveiller(sb);}catch(x){}}
    const {data,error}=await sb.rpc(nom,args||{});
    if(error)return {erreur:'L’armurerie n’a pas répondu.'};
    return data;
  }catch(x){return {erreur:'L’armurerie n’a pas répondu.'};}
}

function fermerArmurerieTokyo(){
  ouvrirArmurerieTokyo.ouvert=false;
  fermeA=Date.now();
  $('page2').classList.remove('on');
}

async function ouvrirArmurerieTokyo(){
  if(ouvrirArmurerieTokyo.ouvert)return;
  ouvrirArmurerieTokyo.ouvert=true;
  $('page2Fond').className='';
  $('page2Fond').innerHTML=
    '<div style="padding:calc(env(safe-area-inset-top,0px) + 18px) 18px 18px;min-height:100%;box-sizing:border-box;background:#0f0c1f;font-family:\'Baloo 2\',system-ui,sans-serif;color:#f4f0ff">'+
    '<small style="display:block;font:700 9px ui-monospace,monospace;letter-spacing:3px;color:#7fe8ff">TOKYO · ARMURERIE</small>'+
    '<b style="display:block;font:700 26px \'Baloo 2\',sans-serif;margin-top:4px">Les armes de la ville</b>'+
    '<p id="tkSolde" style="font:700 13px ui-monospace,monospace;margin:10px 0 0;color:#ffd98a">…</p>'+
    '<div id="tkListe" style="margin-top:12px"><p style="font:italic 14px Georgia,serif;color:#b9b0d8">Le vendeur ouvre les tiroirs…</p></div>'+
    '<button id="tkFermer" style="display:block;width:100%;margin-top:16px;min-height:46px;border-radius:14px;border:1px solid #7fe8ff;background:transparent;color:#f4f0ff;font:700 15px \'Baloo 2\',sans-serif">Sortir de l’armurerie</button>'+
    '<div id="tkBulle" style="margin-top:10px;min-height:18px;font:700 12px ui-monospace,monospace;color:#ff8aa8"></div></div>';
  $('page2').classList.add('on');
  $('tkFermer').onclick=fermerArmurerieTokyo;
  await chargerArmurerieTokyo();
}

async function chargerArmurerieTokyo(){
  const r=await rpcTokyo('arcade_mon_arsenal');
  const liste=$('tkListe');
  if(!liste)return;
  if(!r||r.erreur){liste.innerHTML='<p style="color:#ff8aa8">'+((r&&r.erreur)||'L’armurerie ne répond pas.')+'</p>';return;}
  $('tkSolde').textContent='Ton solde · '+enEuros(e.euros||0);
  liste.innerHTML=(r.boutique||[]).map(b=>{
    const a=ARMES_TK[b.arme]||{nom:b.arme,c:'#ffffff',mot:''};
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:8px;border:1px solid rgba(127,232,255,.25);border-radius:12px;background:rgba(255,255,255,.03)">'+
      '<span style="width:12px;height:12px;border-radius:50%;background:'+a.c+';box-shadow:0 0 10px '+a.c+';flex:0 0 auto"></span>'+
      '<span style="flex:1;min-width:0"><b style="display:block;font:700 16px \'Baloo 2\',sans-serif">'+a.nom+'</b><em style="font:italic 12px Georgia,serif;color:#b9b0d8">'+a.mot+'</em></span>'+
      (b.possede
        ?'<span style="font:700 12px ui-monospace,monospace;color:#7fe8ff">✓ À TOI</span>'
        :'<button data-arme="'+b.arme+'" style="min-height:40px;padding:0 12px;border-radius:10px;border:0;background:#7fe8ff;color:#0f0c1f;font:700 14px \'Baloo 2\',sans-serif">'+enEuros(b.prix)+'</button>')+
      '</div>';
  }).join('');
  liste.querySelectorAll('button[data-arme]').forEach(bt=>{bt.onclick=()=>acheterTokyo(bt.dataset.arme,bt);});
}

async function acheterTokyo(arme,bt){
  bt.disabled=true;
  const r=await rpcTokyo('arcade_acheter_arme',{p_arme:arme});
  if(!r||r.erreur){
    bt.disabled=false;
    $('tkBulle').textContent=(r&&r.erreur)||'L’armurerie n’a pas répondu.';
    return;
  }
  if(typeof r.euros==='number'){e.euros=r.euros;try{sauver();majHaut();}catch(x){}}
  $('tkBulle').textContent=((ARMES_TK[arme]||{nom:arme}).nom)+' est à toi.';
  await chargerArmurerieTokyo();
}

;({TK,graverBatimentTokyo,bloqueTokyo,construireSolTokyo,semerDecorTokyo,poserTokyo,ouvrirArmurerieTokyo,rpcTokyo,fermerArmurerieTokyo})
