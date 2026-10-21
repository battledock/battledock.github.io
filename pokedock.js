/* =====================================================================
   POKEDOCK — LE FICHIER DU JEU

   Assemble a partir du dessin des cartes, de la serie des cent, du son
   et de l'ecran d'ouverture. Tout est enferme dans une fonction : le jeu
   tourne dans un module, et rien de ce qui est ici ne doit fuir dans sa
   portee. Seul window.Pokedock en sort.

   LE TIRAGE N'EST PAS DANS CE FICHIER. Il se fait en base, dans
   pokedock_ouvrir() : un paquet coute six euros, il ne s'ouvre pas
   depuis la console du navigateur.

   NE PAS MODIFIER A LA MAIN : regenere depuis le dossier d'apercus.
   ===================================================================== */
(function(){
'use strict';

/* ============ apercus/cartes.js ============ */
/* =====================================================================
   POKÉDOCK — LA PLANCHE DES RARETÉS
   Huit cartes, une par rareté. Le cadre, les fonds et les symboles sont
   dessinés ici : rien n'est repris d'un jeu existant, tout vient du port.
   Le portrait, lui, est le vrai dessin du jeu — les dockers des cartes
   sont des habitants de Battle Dock.
   ===================================================================== */
const CW=300, CH=420;                      /* une carte, en points */
const SERIF="'Caladea','DejaVu Serif',Georgia,serif";
const SANS ="'Inter','DejaVu Sans',system-ui,sans-serif";

/* ---------- petits outils ---------- */
function rrect(g,x,y,w,h,r){
  g.beginPath();
  g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);
  g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);
  g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();
}
function alea2(n){const v=Math.sin(n*127.1)*43758.5453;return v-Math.floor(v);}
function txt(g,s,x,y,font,col,align){
  g.font=font;g.fillStyle=col;g.textAlign=align||'left';g.textBaseline='alphabetic';
  g.fillText(s,x,y);g.textAlign='left';
}
/* `muet` : on compte les lignes sans rien ecrire, pour savoir d'avance
   si le bloc d'attaques tient dans la carte. */
function txtLignes(g,s,x,y,lh,larg,font,col,muet){
  g.font=font;if(!muet)g.fillStyle=col;
  const mots=s.split(' ');let l='',n=0;
  for(const m of mots){
    const t=l?l+' '+m:m;
    if(g.measureText(t).width>larg&&l){if(!muet)g.fillText(l,x,y+n*lh);l=m;n++;}
    else l=t;
  }
  if(l&&!muet)g.fillText(l,x,y+n*lh);
  return n+1;
}

/* ---------- les reflets ---------- */
function holoBandes(g,x,y,w,h,force,T){
  g.save();rrect(g,x,y,w,h,6);g.clip();
  const n=11;
  for(let i=0;i<n;i++){
    const t=i/n, a=(t*Math.PI*2)+ (T||0)/2200;
    const gr=g.createLinearGradient(x,y+t*h,x+w,y+t*h+40);
    const c=`hsla(${Math.round((t*360+160)%360)},90%,62%,${(0.20*force).toFixed(3)})`;
    gr.addColorStop(0,'rgba(255,255,255,0)');
    gr.addColorStop(0.5,c);
    gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gr;
    g.save();g.translate(x+w/2,y+h/2);g.rotate(-0.5+Math.sin(a)*0.06);
    g.fillRect(-w,-h/2+t*h-10,w*2,16);g.restore();
  }
  /* la poudre d'etoiles */
  for(let i=0;i<70*force;i++){
    const px=x+alea2(i*1.7)*w, py=y+alea2(i*2.9)*h;
    const s=0.6+alea2(i*3.3)*1.6;
    g.fillStyle='rgba(255,255,255,'+(0.18+0.5*alea2(i*5.1)).toFixed(2)+')';
    g.fillRect(px,py,s,s);
  }
  g.restore();
}
function arcEnCiel(g,x,y,w,h,r){
  const gr=g.createLinearGradient(x,y,x+w,y+h);
  ['#ff5d8f','#ffb04a','#ffe95d','#6de88a','#5ad0ff','#9a7dff','#ff5d8f']
    .forEach((c,i,a)=>gr.addColorStop(i/(a.length-1),c));
  g.fillStyle=gr;rrect(g,x,y,w,h,r);g.fill();
}

/* ---------- les fonds peints ---------- */
const FONDS={
  quai:(g,x,y,w,h)=>{
    const c=g.createLinearGradient(0,y,0,y+h);
    c.addColorStop(0,'#2a4e6e');c.addColorStop(.52,'#6fa0bd');c.addColorStop(1,'#c8b98f');
    g.fillStyle=c;g.fillRect(x,y,w,h);
    /* la ville au loin */
    for(let i=0;i<22;i++){const bw=6+alea2(i)*14, bh=12+alea2(i*2.1)*26;
      g.fillStyle='rgba(28,44,60,'+(0.4+alea2(i*3)*0.3).toFixed(2)+')';
      g.fillRect(x+i*(w/20)-4,y+h*0.44-bh,bw,bh);}
    g.fillStyle='#2f5f78';g.fillRect(x,y+h*0.44,w,h*0.18);
    for(let i=0;i<30;i++)g.fillRect(x+alea2(i*4.3)*w,y+h*0.45+alea2(i*5.7)*h*0.16,
      4+alea2(i)*8,1,'#9fd0e0');
    g.fillStyle='rgba(180,220,235,.5)';
    for(let i=0;i<24;i++)g.fillRect(x+alea2(i*4.3)*w,y+h*0.45+alea2(i*5.7)*h*0.16,4+alea2(i)*8,1);
    /* le quai */
    g.fillStyle='#8a7a5c';g.fillRect(x,y+h*0.62,w,h*0.38);
    g.fillStyle='#9c8c6a';for(let yy=y+h*0.62;yy<y+h;yy+=9)g.fillRect(x,yy,w,1);
    /* une bitte d'amarrage */
    g.fillStyle='#2a241f';g.fillRect(x+w-44,y+h*0.70,14,20);
    g.fillRect(x+w-48,y+h*0.68,22,5);
  },
  grue:(g,x,y,w,h)=>{
    const c=g.createLinearGradient(0,y,0,y+h);
    c.addColorStop(0,'#f0a24a');c.addColorStop(.5,'#e0683a');c.addColorStop(1,'#4a2a30');
    g.fillStyle=c;g.fillRect(x,y,w,h);
    g.fillStyle='rgba(255,230,160,.55)';
    g.beginPath();g.arc(x+w*0.72,y+h*0.3,26,0,7);g.fill();
    /* LA GRUE, EN CONTRE-JOUR. Premiere version : un mat, une barre et
       un fil — ça faisait une potence, et le docker pendu au bout. Il lui
       faut sa fleche en treillis, son contrepoids a l'arriere, son
       chariot et une palette au crochet pour qu'on lise une grue. */
    const N='#241a1e', mx=x+w*0.14, haut=y+h*0.14, bas=y+h*0.86;
    g.fillStyle=N;
    g.fillRect(mx-4,haut,9,bas-haut);                      /* le mat */
    for(let yy=haut+8;yy<bas-8;yy+=12){                    /* son treillis */
      g.beginPath();g.moveTo(mx-4,yy);g.lineTo(mx+5,yy+12);
      g.lineWidth=1.6;g.strokeStyle=N;g.stroke();}
    g.fillRect(mx-28,haut-4,w*0.66,7);                     /* la fleche */
    g.fillRect(mx-30,haut-4,16,14);                        /* le contrepoids */
    for(let i=0;i<11;i++){                                  /* le treillis de la fleche */
      const ax=mx-24+i*((w*0.6)/11);
      g.beginPath();g.moveTo(ax,haut+3);g.lineTo(ax+((w*0.6)/11),haut+12);
      g.lineWidth=1.4;g.strokeStyle=N;g.stroke();}
    g.fillRect(mx-26,haut+11,w*0.62,3);
/* LE CHARIOT RESTE A GAUCHE, loin du personnage : le cable tombait
       pile sur sa tete et la grue tournait a la potence. */
    const tx=x+w*0.30, fin=haut+h*0.34;
    g.fillRect(tx-7,haut+3,15,9);                           /* le chariot */
    g.fillRect(tx-1,haut+12,2,fin-haut-12);                 /* le cable */
    g.fillRect(tx-7,fin,15,5);                              /* le crochet */
    g.fillRect(tx-18,fin+5,37,14);                          /* la palette */
    g.fillStyle='rgba(255,220,160,.20)';
    g.fillRect(tx-18,fin+5,37,3);
    g.fillStyle=N;
    g.fillRect(x,y+h*0.86,w,h*0.14);
  },
  cale:(g,x,y,w,h)=>{
    g.fillStyle='#1d2630';g.fillRect(x,y,w,h);
    for(let i=0;i<7;i++){
      const bx=x+8+ (i%3)*((w-20)/3), by=y+h*0.34+Math.floor(i/3)*((h*0.6)/3);
      g.fillStyle=['#8a5a2e','#6b4525','#a8743e'][i%3];
      g.fillRect(bx,by,(w-26)/3,(h*0.56)/3-6);
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(bx,by+((h*0.56)/3-6)-5,(w-26)/3,5);
      g.fillStyle='rgba(255,255,255,.12)';g.fillRect(bx,by,(w-26)/3,3);
    }
    const l=g.createLinearGradient(0,y,0,y+h*0.4);
    l.addColorStop(0,'rgba(255,220,150,.35)');l.addColorStop(1,'rgba(255,220,150,0)');
    g.fillStyle=l;g.fillRect(x,y,w,h*0.4);
  },
  nuit:(g,x,y,w,h)=>{
    const c=g.createLinearGradient(0,y,0,y+h);
    c.addColorStop(0,'#0e1430');c.addColorStop(.6,'#23295c');c.addColorStop(1,'#101828');
    g.fillStyle=c;g.fillRect(x,y,w,h);
    for(let i=0;i<60;i++)g.fillRect(x+alea2(i*1.3)*w,y+alea2(i*2.7)*h*0.6,1,1,'#fff');
    g.fillStyle='rgba(255,255,255,.75)';
    for(let i=0;i<60;i++)g.fillRect(x+alea2(i*1.3)*w,y+alea2(i*2.7)*h*0.6,1,1);
    g.fillStyle='rgba(255,236,190,.9)';g.beginPath();g.arc(x+w*0.76,y+h*0.18,13,0,7);g.fill();
    g.fillStyle='rgba(20,28,44,.9)';g.beginPath();g.arc(x+w*0.70,y+h*0.15,13,0,7);g.fill();
    g.fillStyle='#16203a';g.fillRect(x,y+h*0.70,w,h*0.3);
    g.fillStyle='rgba(120,160,220,.22)';
    for(let i=0;i<16;i++)g.fillRect(x+alea2(i*7.1)*w,y+h*0.72+alea2(i*3.3)*h*0.26,10+alea2(i)*20,1);
  },
  criee:(g,x,y,w,h)=>{
    /* LA HALLE : carrelage au mur, dalle au sol, et des bacs de glace
       posés dessus. Premiere version : des poissons qui flottaient sur un
       mur blanc, comme un papier peint de salle de bain. */
    g.fillStyle='#c9d4da';g.fillRect(x,y,w,h);
    g.fillStyle='#b4c2ca';
    for(let yy=y;yy<y+h*0.56;yy+=11)g.fillRect(x,yy,w,1);
    for(let xx=x;xx<x+w;xx+=14)g.fillRect(xx,y,1,h*0.56);
    const l=g.createLinearGradient(0,y,0,y+h*0.5);
    l.addColorStop(0,'rgba(255,255,255,.5)');l.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=l;g.fillRect(x,y,w,h*0.5);
    g.fillStyle='#8e9aa2';g.fillRect(x,y+h*0.56,w,h*0.44);
    g.fillStyle='#7d8990';for(let yy=y+h*0.58;yy<y+h;yy+=10)g.fillRect(x,yy,w,1);
    /* les bacs de glace, deux rangs */
    for(let r=0;r<2;r++)for(let c=0;c<3;c++){
      const bw=(w-26)/3, bh=h*0.14;
      const bx=x+9+c*(bw+4), by=y+h*0.60+r*(bh+8);
      g.fillStyle='#3f4a52';g.fillRect(bx,by,bw,bh);
      g.fillStyle='#dfe9ee';g.fillRect(bx+2,by+2,bw-4,bh-5);
      g.fillStyle='#cdd9e0';
      for(let k=0;k<7;k++)g.fillRect(bx+3+alea2(k+r*3+c)*(bw-8),by+3+alea2(k*2.1)*(bh-9),3,2);
      for(let k=0;k<3;k++){
        const px=bx+7+k*(bw-16)/2.2, py=by+bh*0.5;
        g.fillStyle=['#9aa8b8','#d8503a','#c9a24a'][(k+c)%3];
        g.beginPath();g.ellipse(px,py,7,3,alea2(k+c)*0.5-0.25,0,7);g.fill();
        g.fillStyle='#101822';g.fillRect(px-4,py-1,1,1);
      }
    }
  }
};

/* =====================================================================
   D'AUTRES DECORS, ET LE TEMPS QU'IL FAIT

   Cinq fonds pour cent cartes, ça se voyait : une planche de vingt-cinq
   montrait cinq fois le meme quai. On en ajoute sept, chacun lie au lieu
   ecrit sur la carte — le bar pour Fanny, la halle pour la criee, le
   trottoir pour le chauffeur du 83. Et par-dessus, une couche de temps
   (brume, pluie, fin de journee, projecteur, mouettes) tiree du numero :
   deux dockers sur le meme quai ne sont plus jamais sur la meme image.
   ===================================================================== */
Object.assign(FONDS,{
  /* ---- le comptoir, vu de derriere les bouteilles ---- */
  bar:(g,x,y,w,h)=>{
    g.fillStyle='#2b1d18';g.fillRect(x,y,w,h);
    g.fillStyle='#3a271f';g.fillRect(x,y,w,h*0.56);
    for(let yy=y;yy<y+h*0.56;yy+=13){g.fillStyle='rgba(255,210,150,.05)';g.fillRect(x,yy,w,1);}
    /* l'etagere et ses bouteilles */
    for(let r=0;r<2;r++){
      const by=y+h*0.16+r*h*0.20;
      g.fillStyle='#1c120e';g.fillRect(x+6,by+22,w-12,4);
      for(let i=0;i<9;i++){
        const bx=x+12+i*((w-24)/9), bh=12+alea2(i+r*9)*10;
        g.fillStyle=['#c8a33e','#7a9b4a','#b2503a','#d8c48a','#4a6e8a'][(i+r)%5];
        g.fillRect(bx,by+22-bh,6,bh);
        g.fillStyle='rgba(255,255,255,.22)';g.fillRect(bx,by+22-bh,2,bh);
      }
    }
    /* le zinc */
    g.fillStyle='#5a3c2a';g.fillRect(x,y+h*0.70,w,h*0.30);
    g.fillStyle='#6d4b34';g.fillRect(x,y+h*0.70,w,5);
    g.fillStyle='rgba(255,220,170,.10)';g.fillRect(x,y+h*0.70,w,2);
    /* deux verres poses dessus */
    for(const vx of [x+w*0.12,x+w*0.86]){
      g.fillStyle='rgba(230,240,245,.75)';g.fillRect(vx-4,y+h*0.70-11,8,11);
      g.fillStyle='rgba(240,210,120,.85)';g.fillRect(vx-4,y+h*0.70-6,8,6);
    }
  },

  /* ---- l'etal, sous la bache ---- */
  marche:(g,x,y,w,h)=>{
    g.fillStyle='#d6c9a8';g.fillRect(x,y,w,h);
    /* la bache rayee */
    for(let i=0;i<14;i++){
      g.fillStyle=(i%2)?'#c8463a':'#efe3d0';
      g.fillRect(x+i*(w/14),y,w/14,h*0.16);
    }
    g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,y+h*0.16,w,6);
    /* les cageots */
    for(let r=0;r<2;r++)for(let c=0;c<4;c++){
      const cw=(w-20)/4, ch=h*0.17;
      const cx=x+8+c*(cw+1), cy=y+h*0.42+r*(ch+5);
      g.fillStyle='#9a7a4e';g.fillRect(cx,cy,cw,ch);
      g.fillStyle='#b0905e';g.fillRect(cx,cy,cw,3);
      for(let k=0;k<6;k++){
        g.fillStyle=['#d8503a','#c9a24a','#6f9a44','#b85a8a','#e08a3a'][(k+c+r)%5];
        g.beginPath();
        g.arc(cx+6+k*((cw-10)/5),cy+6+alea2(k+c*3+r*7)*4,3.2,0,7);g.fill();
      }
    }
    g.fillStyle='#8d7f66';g.fillRect(x,y+h*0.84,w,h*0.16);
  },

  /* ---- le trottoir, un soir de semaine ---- */
  ville:(g,x,y,w,h)=>{
    const c=g.createLinearGradient(0,y,0,y+h);
    c.addColorStop(0,'#3a3550');c.addColorStop(.55,'#6a5f70');c.addColorStop(1,'#2e2a33');
    g.fillStyle=c;g.fillRect(x,y,w,h);
    /* les immeubles et leurs fenetres allumees */
    for(let i=0;i<9;i++){
      const bw=w/9, bh=h*(0.26+alea2(i*2.3)*0.30), bx=x+i*bw, by=y+h*0.70-bh;
      g.fillStyle=['#2b2838','#332f42','#25222f'][i%3];
      g.fillRect(bx,by,bw-2,bh);
      for(let k=0;k<14;k++){
        if(alea2(i*17+k)<0.42)continue;
        g.fillStyle='rgba(255,214,140,'+(0.45+alea2(k+i)*0.5).toFixed(2)+')';
        g.fillRect(bx+4+(k%3)*((bw-10)/3),by+6+Math.floor(k/3)*((bh-12)/5),5,4);
      }
    }
    /* la chaussee et le passage pieton */
    g.fillStyle='#413c48';g.fillRect(x,y+h*0.70,w,h*0.30);
    g.fillStyle='rgba(235,235,225,.60)';
    for(let i=0;i<6;i++)g.fillRect(x+6+i*(w/6),y+h*0.88,w/11,5);
    /* un lampadaire */
    g.fillStyle='#1d1a22';g.fillRect(x+w-28,y+h*0.30,4,h*0.42);
    g.fillRect(x+w-36,y+h*0.29,20,4);
    g.fillStyle='rgba(255,214,140,.30)';
    g.beginPath();g.moveTo(x+w-30,y+h*0.32);g.lineTo(x+w-54,y+h*0.72);
    g.lineTo(x+w-2,y+h*0.72);g.closePath();g.fill();
  },

  /* ---- l'atelier, et son etabli ---- */
  atelier:(g,x,y,w,h)=>{
/* L'ATELIER ETAIT UNE CAVE : mur anthracite, panneau noir, outils gris
       sur gris — on ne voyait plus le bonhomme. On remonte tout d'un cran
       et on allume une baladeuse au plafond. */
    g.fillStyle='#8a8578';g.fillRect(x,y,w,h);
    g.fillStyle='#978f80';
    for(let yy=y;yy<y+h*0.62;yy+=16)g.fillRect(x,yy,w,2);
    const am=g.createRadialGradient(x+w*0.5,y+2,4,x+w*0.5,y+2,w*0.8);
    am.addColorStop(0,'rgba(255,238,190,.45)');am.addColorStop(1,'rgba(255,238,190,0)');
    g.fillStyle=am;g.fillRect(x,y,w,h*0.7);
    /* le panneau d'outils */
    g.fillStyle='#5d6470';g.fillRect(x+w*0.08,y+h*0.10,w*0.84,h*0.34);
    for(let i=0;i<9;i++){
      const ox=x+w*0.13+i*((w*0.74)/9);
      g.fillStyle='#8f949c';
      if(i%3===0){g.fillRect(ox,y+h*0.14,4,h*0.16);g.fillRect(ox-4,y+h*0.14,12,5);}
      else if(i%3===1){g.fillRect(ox,y+h*0.15,3,h*0.18);g.fillRect(ox-3,y+h*0.31,9,4);}
      else {g.fillRect(ox,y+h*0.16,5,h*0.12);g.fillStyle='#c8a33e';g.fillRect(ox,y+h*0.28,5,6);}
    }
    /* l'etabli */
    g.fillStyle='#8a6640';g.fillRect(x,y+h*0.62,w,h*0.10);
    g.fillStyle='#9e7749';g.fillRect(x,y+h*0.62,w,3);
    g.fillStyle='#4e4e49';g.fillRect(x,y+h*0.72,w,h*0.28);
    g.fillStyle='#575752';for(let yy=y+h*0.74;yy<y+h;yy+=9)g.fillRect(x,yy,w,1);
    /* une flaque d'huile */
    g.fillStyle='rgba(16,16,20,.55)';
    g.beginPath();g.ellipse(x+w*0.22,y+h*0.90,26,7,0,0,7);g.fill();
  },

  /* ---- le pont du remorqueur, au large ---- */
  pont:(g,x,y,w,h)=>{
    const c=g.createLinearGradient(0,y,0,y+h);
    c.addColorStop(0,'#9ec4d8');c.addColorStop(.46,'#d8e4e6');c.addColorStop(.47,'#2f6d86');
    c.addColorStop(1,'#13405a');
    g.fillStyle=c;g.fillRect(x,y,w,h);
    /* la houle */
    for(let i=0;i<26;i++){
      const wy=y+h*0.50+alea2(i*3.1)*h*0.22;
      g.fillStyle='rgba(255,255,255,'+(0.10+alea2(i)*0.25).toFixed(2)+')';
      g.fillRect(x+alea2(i*5.3)*w,wy,10+alea2(i*2)*22,2);
    }
/* LE PONT EST UN PONT, PAS UN MUR ROUGE. Premiere version : une bande
       vermillon sur toute la hauteur basse, le bonhomme avait l'air pose
       sur une tole peinte. Il lui faut un plancher en tole striee, un
       pavois gris et le minium seulement en liston. */
    g.fillStyle='#55605f';g.fillRect(x,y+h*0.72,w,h*0.28);
    g.fillStyle='#616c6a';
    for(let yy=y+h*0.74;yy<y+h;yy+=7)g.fillRect(x,yy,w,2);
    g.fillStyle='rgba(0,0,0,.18)';
    for(let xx=x;xx<x+w;xx+=18)g.fillRect(xx,y+h*0.72,1,h*0.28);
    /* le pavois et son liston de minium */
    g.fillStyle='#7d8versa';
    g.fillStyle='#7d8688';g.fillRect(x,y+h*0.62,w,h*0.10);
    g.fillStyle='#b8352c';g.fillRect(x,y+h*0.62,w,4);
    g.fillStyle='rgba(255,255,255,.10)';g.fillRect(x,y+h*0.66,w,2);
    /* la main courante */
    g.fillStyle='#8c8f94';g.fillRect(x,y+h*0.56,w,4);
    for(let i=0;i<7;i++)g.fillRect(x+6+i*((w-12)/6),y+h*0.56,4,h*0.08);
  },

  /* ---- le bureau, et sa lumiere de neon ---- */
  bureau:(g,x,y,w,h)=>{
    g.fillStyle='#cfc7b4';g.fillRect(x,y,w,h);
    g.fillStyle='#c0b7a2';g.fillRect(x,y+h*0.52,w,3);
    /* le classeur et ses dossiers */
    g.fillStyle='#8e8674';g.fillRect(x+w*0.04,y+h*0.12,w*0.34,h*0.40);
    for(let r=0;r<3;r++){
      g.fillStyle='#6f6757';g.fillRect(x+w*0.05,y+h*0.16+r*h*0.12,w*0.32,h*0.10);
      for(let i=0;i<6;i++){
        g.fillStyle=['#b84a3a','#c8a33e','#4a6e8a','#e0ddd2'][(i+r)%4];
        g.fillRect(x+w*0.06+i*(w*0.30/6),y+h*0.17+r*h*0.12,w*0.04,h*0.08);
      }
    }
    /* l'affiche syndicale, de travers */
    g.save();g.translate(x+w*0.74,y+h*0.26);g.rotate(-0.06);
    g.fillStyle='#e8e2d4';g.fillRect(-26,-30,52,60);
    g.fillStyle='#b8362c';g.fillRect(-26,-30,52,10);
    g.fillStyle='#8e8674';
    for(let i=0;i<6;i++)g.fillRect(-20,-14+i*7,40-alea2(i)*18,3);
    g.restore();
    /* le neon */
    g.fillStyle='rgba(255,255,230,.55)';g.fillRect(x+w*0.18,y+4,w*0.64,5);
    const n=g.createLinearGradient(0,y,0,y+h*0.4);
    n.addColorStop(0,'rgba(255,255,220,.35)');n.addColorStop(1,'rgba(255,255,220,0)');
    g.fillStyle=n;g.fillRect(x,y,w,h*0.4);
    g.fillStyle='#9a9280';g.fillRect(x,y+h*0.80,w,h*0.20);
  },

  /* ---- le sable, a quinze heures ---- */
  plage:(g,x,y,w,h)=>{
    const c=g.createLinearGradient(0,y,0,y+h);
    c.addColorStop(0,'#6fc0e4');c.addColorStop(.40,'#a9ddee');
    c.addColorStop(.41,'#2f8fb0');c.addColorStop(.62,'#56b4c8');
    c.addColorStop(.63,'#e4d2a4');c.addColorStop(1,'#cbb584');
    g.fillStyle=c;g.fillRect(x,y,w,h);
    g.fillStyle='rgba(255,250,210,.85)';
    g.beginPath();g.arc(x+w*0.18,y+h*0.14,16,0,7);g.fill();
    /* l'ecume */
    for(let i=0;i<22;i++){
      g.fillStyle='rgba(255,255,255,'+(0.3+alea2(i)*0.5).toFixed(2)+')';
      g.fillRect(x+alea2(i*4.1)*w,y+h*0.58+alea2(i*2.3)*h*0.06,8+alea2(i*3)*16,2);
    }
    /* un parasol plante de travers */
    g.save();g.translate(x+w*0.84,y+h*0.72);g.rotate(0.12);
    g.fillStyle='#8a7050';g.fillRect(-2,-46,3,46);
    for(let i=0;i<6;i++){
      g.fillStyle=(i%2)?'#e0533c':'#f2ead6';
      g.beginPath();g.moveTo(0,-46);
      g.lineTo(-34+i*11,-32);g.lineTo(-34+(i+1)*11,-32);g.closePath();g.fill();
    }
    g.restore();
    /* les empreintes */
    g.fillStyle='rgba(170,150,110,.5)';
    for(let i=0;i<9;i++)g.fillRect(x+10+i*((w-20)/9),y+h*0.88+(i%2)*5,5,3);
  }
});

/* ---------- le temps qu'il fait, par-dessus tout le reste ---------- */
const ATMO={
  brume:(g,x,y,w,h,i)=>{
    for(let k=0;k<5;k++){
      const by=y+h*(0.34+k*0.14);
      const b=g.createLinearGradient(0,by-14,0,by+14);
      b.addColorStop(0,'rgba(225,232,238,0)');
      b.addColorStop(.5,'rgba(225,232,238,'+(0.16+alea2(i+k)*0.14).toFixed(2)+')');
      b.addColorStop(1,'rgba(225,232,238,0)');
      g.fillStyle=b;g.fillRect(x,by-14,w,28);
    }
  },
  pluie:(g,x,y,w,h,i)=>{
    g.strokeStyle='rgba(205,220,235,.5)';g.lineWidth=1;
    for(let k=0;k<70;k++){
      const px=x+alea2(i*3+k*1.7)*w, py=y+alea2(i*5+k*2.3)*h;
      g.beginPath();g.moveTo(px,py);g.lineTo(px-3,py+9);g.stroke();
    }
    g.fillStyle='rgba(40,60,80,.18)';g.fillRect(x,y,w,h);
  },
  soir:(g,x,y,w,h)=>{
    const s=g.createLinearGradient(0,y,0,y+h);
    s.addColorStop(0,'rgba(255,150,60,.26)');
    s.addColorStop(.6,'rgba(255,110,70,.14)');
    s.addColorStop(1,'rgba(60,30,70,.30)');
    g.fillStyle=s;g.fillRect(x,y,w,h);
  },
  projecteur:(g,x,y,w,h)=>{
    g.fillStyle='rgba(10,12,20,.42)';g.fillRect(x,y,w,h);
    const p=g.createRadialGradient(x+w*0.5,y+h*0.62,6,x+w*0.5,y+h*0.62,w*0.52);
    p.addColorStop(0,'rgba(255,240,190,.42)');
    p.addColorStop(1,'rgba(255,240,190,0)');
    g.fillStyle=p;g.fillRect(x,y,w,h);
  },
  mouettes:(g,x,y,w,h,i)=>{
    g.strokeStyle='rgba(30,36,46,.65)';g.lineWidth=1.6;
    for(let k=0;k<6;k++){
      const px=x+alea2(i*7+k*2.1)*w*0.9+w*0.05;
      const py=y+h*0.10+alea2(i*3+k*5.3)*h*0.22;
      const s=3+alea2(k+i)*3;
      g.beginPath();
      g.moveTo(px-s*2,py);g.quadraticCurveTo(px-s,py-s,px,py);
      g.quadraticCurveTo(px+s,py-s,px+s*2,py);g.stroke();
    }
  },
  neige:(g,x,y,w,h,i)=>{
    g.fillStyle='rgba(255,255,255,.70)';
    for(let k=0;k<48;k++)
      g.fillRect(x+alea2(i*2+k*1.3)*w,y+alea2(i*4+k*3.7)*h,2,2);
    g.fillStyle='rgba(200,215,235,.10)';g.fillRect(x,y,w,h);
  }
};

/* ---------- les symboles de cout ---------- */
function jeton(g,x,y,r,sorte){
  g.save();g.translate(x,y);
  const C={caisse:['#a8743e','#6b4525'],mer:['#4aa0c8','#1d5f82'],
           grue:['#e8b84a','#8a6a2a'],muscle:['#d8503a','#8a2a20']}[sorte]||['#8a8f96','#4a4e54'];
  g.fillStyle=C[1];g.beginPath();g.arc(0,0,r,0,7);g.fill();
  g.fillStyle=C[0];g.beginPath();g.arc(0,-0.5,r-1.6,0,7);g.fill();
  g.fillStyle=C[1];
  if(sorte==='caisse'){g.fillRect(-r*0.45,-r*0.4,r*0.9,r*0.8);
    g.fillStyle=C[0];g.fillRect(-r*0.45,-r*0.08,r*0.9,r*0.16);}
  else if(sorte==='mer'){for(let k=0;k<2;k++){g.beginPath();
    g.moveTo(-r*0.6,-r*0.2+k*r*0.45);
    g.quadraticCurveTo(-r*0.2,-r*0.5+k*r*0.45,0.1,-r*0.2+k*r*0.45);
    g.quadraticCurveTo(r*0.35,r*0.1+k*r*0.45,r*0.62,-r*0.2+k*r*0.45);
    g.lineWidth=r*0.22;g.strokeStyle=C[1];g.stroke();}}
  else if(sorte==='grue'){g.fillRect(-r*0.1,-r*0.55,r*0.2,r*1.1);
    g.fillRect(-r*0.55,-r*0.55,r*0.9,r*0.18);g.fillRect(r*0.1,-r*0.1,r*0.16,r*0.5);}
  else{g.beginPath();g.arc(-r*0.15,0,r*0.42,0,7);g.fill();
    g.fillRect(-r*0.15,-r*0.18,r*0.7,r*0.36);}
  g.restore();
}

/* =====================================================================
   LA CARTE
   ===================================================================== */
const RAR={
  commune:{nom:'COMMUNE',  bord:['#7a6a52','#a8966f'], dos:'#efe7d2', sym:'●',
           holo:0,   fonce:false},
  rare:   {nom:'RARE',     bord:['#6e767e','#c6ced6'], dos:'#eef1f4', sym:'◆',
           holo:0.18,fonce:false, metal:true},
  ultra:  {nom:'ULTRA RARE',bord:['#1d5f82','#7fd0ec'],dos:'#e6f4fb', sym:'★',
           holo:0.55,fonce:false, metal:true},
  epic:   {nom:'EPIC',     bord:['#4a2270','#b88aff'], dos:'#1a1030', sym:'✦',
           holo:0.75,fonce:true,  metal:true, eclats:true},
  legend: {nom:'LÉGENDAIRE',bord:['#8a6a2a','#f6dC8a'],dos:'#2a1d08', sym:'✹',
           holo:0.65,fonce:true,  metal:true, rayons:true},
  ex:     {nom:'EX',       bord:['#8f2a20','#f0a04a'], dos:'#2a1210', sym:'EX',
           holo:0.5, fonce:true,  metal:true},
  fullart:{nom:'FULL ART', bord:['#17313f','#6ba8c4'], dos:'#0d1a22', sym:'★★',
           holo:0.45,fonce:true,  plein:true},
  secrete:{nom:'SECRÈTE',  bord:null,                  dos:'#15101c', sym:'✶',
           holo:1,   fonce:true,  arc:true, plein:true}
};

function dessinerCarte(g,C,T){
  const R=RAR[C.rarete], F=R.fonce;
  g.clearRect(0,0,CW,CH);
  /* ---- le bord ---- */
  if(R.arc)arcEnCiel(g,0,0,CW,CH,16);
  else{
    const b=g.createLinearGradient(0,0,CW,CH);
    b.addColorStop(0,R.bord[0]);b.addColorStop(.5,R.bord[1]);b.addColorStop(1,R.bord[0]);
    g.fillStyle=b;rrect(g,0,0,CW,CH,16);g.fill();
  }
  if(R.metal||R.arc){
    const s=g.createLinearGradient(0,0,CW,0);
    s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.42,'rgba(255,255,255,.45)');
    s.addColorStop(.52,'rgba(255,255,255,.08)');s.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=s;rrect(g,0,0,CW,CH,16);g.fill();
  }
  /* ---- le fond de la carte ---- */
  const M=R.plein?7:11;
  g.fillStyle=R.dos;rrect(g,M,M,CW-M*2,CH-M*2,11);g.fill();

  /* ---- l'illustration ---- */
/* L'ILLUSTRATION CEDE LA PLACE AU TEXTE QUAND IL Y EN A. A deux cent
     quatorze pour tout le monde, les cartes a deux attaques n'avaient que
     quarante-sept points pour en ecrire soixante : le texte se tassait
     jusqu'a se chevaucher. Une attaque, grande image ; deux attaques,
     image un peu plus basse. */
  const AX=R.plein?M:22, AY=R.plein?M:50,
        AW=R.plein?CW-M*2:CW-44,
        AH=R.plein?CH-M*2:(C.att.length>1?176:214);
  g.save();rrect(g,AX,AY,AW,AH,R.plein?11:6);g.clip();
  (FONDS[C.fond]||FONDS.quai)(g,AX,AY,AW,AH);
/* LE TEMPS SE POSE SUR LE DECOR, PAS SUR LA CARTE : il doit rester
     dans la fenetre d'illustration, donc on le dessine ici, avant le
     personnage pour la brume de fond et apres lui pour la pluie. */
  if(C.atmo&&ATMO[C.atmo]&&C.atmo!=='pluie'&&C.atmo!=='neige')
    ATMO[C.atmo](g,AX,AY,AW,AH,C.graine||0);
  if(R.rayons){
    g.save();g.translate(AX+AW/2,AY+AH*0.52);
    for(let i=0;i<16;i++){g.rotate(Math.PI*2/16);
      g.fillStyle='rgba(255,230,150,.16)';
      g.beginPath();g.moveTo(0,0);g.lineTo(AW,-26);g.lineTo(AW,26);g.closePath();g.fill();}
    g.restore();
  }
  /* le personnage */
  try{
    const S=(R.plein?2.9:2.45)*(C.ech||1);
    g.save();
/* SUR UN FULL ART, LE BONHOMME DOIT TENIR AU-DESSUS DU TEXTE : a 0,66
       les pieds du Dernier Cargo tombaient pile sur « Sillage ». */
    g.translate(AX+AW*(C.px||0.5),AY+AH*(C.py||(R.plein?0.56:0.90)));
    g.scale(S,S);g.imageSmoothingEnabled=false;
    g.fillStyle='rgba(0,0,0,.30)';
    g.beginPath();g.ellipse(0,1,10,3,0,0,7);g.fill();
    window.Perso.sprite(g,0,0,C.ap,C.dir||'bas',C.pas||0,!!C.bouge);
    g.restore();
  }catch(x){}
  if(C.atmo&&(C.atmo==='pluie'||C.atmo==='neige'))
    ATMO[C.atmo](g,AX,AY,AW,AH,C.graine||0);
  if(R.eclats){
    g.strokeStyle='rgba(200,150,255,.75)';g.lineWidth=2;
    for(let i=0;i<7;i++){
      g.beginPath();
      let px=AX+alea2(i*3.1)*AW, py=AY;
      g.moveTo(px,py);
      for(let k=0;k<4;k++){px+=(alea2(i*7+k)-0.5)*40;py+=AH/4;g.lineTo(px,py);}
      g.stroke();
    }
  }
  if(R.holo)holoBandes(g,AX,AY,AW,AH,R.holo,T);
  if(R.plein){
/* LE VOILE DU FULL ART MONTE PLUS HAUT. A quarante pour cent, le texte
   se posait en travers du personnage et son visage servait de fond au
   titre. Il part maintenant juste sous sa tete. */
    const v=g.createLinearGradient(0,AY+AH*0.52,0,AY+AH);
    v.addColorStop(0,'rgba(8,10,16,0)');v.addColorStop(.38,'rgba(8,10,16,.80)');
    v.addColorStop(1,'rgba(8,10,16,.97)');
    g.fillStyle=v;g.fillRect(AX,AY+AH*0.52,AW,AH*0.48);
  }
  g.restore();
  if(!R.plein){
    g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;rrect(g,AX,AY,AW,AH,6);g.stroke();
    g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;rrect(g,AX+1,AY+1,AW-2,AH-2,6);g.stroke();
  }

  const enc=F?'#f6eedc':'#1d1a14';
  const dou=F?'rgba(246,238,220,.62)':'rgba(29,26,20,.62)';

  /* ---- le nom et les PV ---- */
/* LE NOM NE MARCHE PLUS SUR LES PV. On mesure les deux, et le nom
   retrecit jusqu'a tenir dans ce qui reste — un nom coupe par un chiffre,
   c'est une carte ratee. */
  const NY=R.plein?(C.att.length>1?CH-182:CH-158):38;
  const sPV=C.pv+' PV';
  g.font='800 17px '+SANS;
  const lPV=g.measureText(sPV).width;
  const place=CW-M*2-34-lPV;
  const nom=R.plein?C.nom.toUpperCase():C.nom;
  let ta=R.plein?22:20;
  const fnt=()=>(R.plein?'800 ':'700 ')+ta+'px '+(R.plein?SANS:SERIF);
  g.font=fnt();
  while(g.measureText(nom).width>place&&ta>11){ta-=0.5;g.font=fnt();}
  txt(g,nom,M+(R.plein?14:11),NY,fnt(),R.plein?'#f6eedc':enc);
  txt(g,sPV,CW-M-11,NY,'800 17px '+SANS,F?'#ffd9a0':'#8f2a20','right');

  /* ---- la ligne d'identite ---- */
  const IY=R.plein?NY+20:AY+AH+22;
  txt(g,C.type+'  ·  '+C.taille+'  ·  '+C.poids,M+12,IY,'italic 12px '+SERIF,dou);

/* ---- LES ATTAQUES. Elles debordaient sur la bande du bas des que deux
     textes d'ambiance passaient a la ligne : « Si ton adversaire vient
     aussi du Vieux-Port » finissait sous FAIBLESSE. On mesure donc le
     bloc avant de l'ecrire, et on resserre jusqu'a ce qu'il tienne. ---- */
  const y0=IY+(R.plein?22:26), yMax=CH-M-34-16;
  const LARG=CW-M*2-34;
  const PALIERS=[[11.5,12,6],[11,11.5,5],[10.5,11,4],[10,10.5,3]];
  let P=PALIERS[0];
  for(const essai of PALIERS){
    let h=0;
    C.att.forEach(A=>{
      h+=15;
      if(A.txt)h+=txtLignes(g,A.txt,0,0,essai[1],LARG,'italic '+essai[0]+'px '+SERIF,null,true)*essai[1];
      h+=essai[2];
    });
    P=essai;
    if(y0+h<=yMax)break;
  }
  let y=y0;
  C.att.forEach(A=>{
    let x=M+16;
    (A.cout||[]).forEach(s=>{jeton(g,x,y-5,8,s);x+=19;});
/* LE NOM DE L'ATTAQUE S'ARRETE AVANT LES DEGATS. « Il est frais, mon
       poisson » passait sous le 40 de Madeleine : deux textes, deux
       alignements opposes, aucun des deux ne savait que l'autre existait.
       On mesure la place qui reste et on resserre le nom jusqu'a elle. */
    const nx=Math.max(x+4,M+58);
    g.font='800 19px '+SANS;
    const place=(CW-M-12)-g.measureText(String(A.deg)).width-10-nx;
    let tn=15;
    while(tn>9){g.font='700 '+tn+'px '+SANS;
      if(g.measureText(A.nom).width<=place)break;tn-=0.5;}
    txt(g,A.nom,nx,y,'700 '+tn+'px '+SANS,enc);
    txt(g,String(A.deg),CW-M-12,y,'800 19px '+SANS,enc,'right');
    y+=15;
    if(A.txt)y+=txtLignes(g,A.txt,M+16,y,P[1],LARG,'italic '+P[0]+'px '+SERIF,dou)*P[1];
    y+=P[2];
  });

/* ---- LA BANDE DU BAS. Les cartes a une seule attaque laissaient un
     grand trou blanc au-dessus du pied. Faiblesse, resistance et cout de
     retraite le remplissent, et disent quelque chose. ---- */
  const BY=CH-M-34;
  g.fillStyle=F?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)';
  rrect(g,M+10,BY-11,CW-M*2-20,16,5);g.fill();
  const fbl=['mer','caisse','grue','muscle'][(C.nom.length+C.pv/10)%4|0];
  const rst=['caisse','grue','mer','muscle'][(C.type.length)%4];
/* ON AVANCE A LA MESURE DU TEXTE, pas au jugé : les décalages fixes
     marchaient en français court et se chevauchaient dès « FAIBLESSE ». */
  let fx=M+15;
  const mot=(s,f,c)=>{g.font=f;txt(g,s,fx,BY,f,c);fx+=g.measureText(s).width+4;};
  const pet='800 7.5px '+SANS, chi='800 8.5px '+SANS;
  mot('FAIBLESSE',pet,dou);jeton(g,fx+5,BY-3,5,fbl);fx+=13;mot('×2',chi,enc);fx+=6;
  mot('RÉSIST.',pet,dou);jeton(g,fx+5,BY-3,5,rst);fx+=13;mot('−20',chi,enc);fx+=6;
  mot('RETRAITE',pet,dou);
  const nr=1+((C.pv/10)%3|0);
  for(let k=0;k<nr;k++)jeton(g,fx+5+k*11,BY-3,5,'caisse');
  /* ---- le pied ---- */
  const PY=CH-M-16;
  g.fillStyle=F?'rgba(255,255,255,.10)':'rgba(0,0,0,.10)';
  g.fillRect(M+10,PY-16,CW-M*2-20,1);
  txt(g,'POKÉDOCK · illustr. Fonfon',M+12,PY,'700 9.5px '+SANS,dou);
  txt(g,C.num+'   '+R.sym,CW-M-12,PY,'800 11px '+SANS,
      F?'#ffe3a8':'#6b5a3a','right');
/* LA PASTILLE DE RARETE DESCEND SUR LA LIGNE D'IDENTITE. En haut a
     droite, « EX » se posait sur « 230 PV » : deux mots au meme endroit,
     et l'on ne lisait plus ni l'un ni l'autre. Sur un full art, le nom
     est en bas : elle peut rester en haut. */
  const bx=CW-M-30, by=R.plein?(M+10):(IY-4);
  g.fillStyle=F?'rgba(0,0,0,.45)':'rgba(255,255,255,.75)';
  rrect(g,bx-R.nom.length*3.3-6,by-9,R.nom.length*6.6+12,16,8);g.fill();
  txt(g,R.nom,bx,by+3,'800 9px '+SANS,F?'#ffe3a8':'#6b5a3a','center');
}

/* =====================================================================
   LES HUIT CARTES
   ===================================================================== */
const CARTES=[
{rarete:'commune',nom:'Grutier débutant',pv:40,fond:'quai',num:'004/120',
 type:'Quai',taille:'1,78 m',poids:'72 kg',
 ap:{peau:2,cheveux:2,coiffe:1,barbe:0,chapeau:1,veste:5,pantalon:0,sac:0,corps:1,yeux:1},
 att:[{cout:['caisse'],nom:'Lève la caisse',deg:10,
       txt:'Met trois heures à viser. La caisse, elle, ne bouge pas.'},
      {cout:['caisse','caisse'],nom:'Pause clope',deg:20,
       txt:'Soigne 20 PV. On ne discute pas la pause.'}]},

{rarete:'rare',nom:'Marius du Quai 7',pv:80,fond:'grue',num:'031/120',
 type:'Quai',taille:'1,71 m',poids:'88 kg',dir:'droite',px:0.66,
 ap:{peau:1,cheveux:1,coiffe:5,barbe:4,chapeau:3,veste:3,pantalon:6,sac:0,corps:3,yeux:0},
 att:[{cout:['mer'],nom:'Coup du pastis',deg:30,
       txt:'L’adversaire est confus. Il raconte sa vie pendant deux tours.'},
      {cout:['caisse','muscle'],nom:'Tope là',deg:50,
       txt:'Si ton adversaire vient aussi du Vieux-Port, +20.'}]},

{rarete:'ultra',nom:'Fonfon le Contremaître',pv:120,fond:'cale',num:'066/120',
 type:'Autorité',taille:'1,84 m',poids:'101 kg',
 ap:{peau:0,cheveux:6,coiffe:9,barbe:2,chapeau:0,veste:9,pantalon:2,sac:0,corps:4,yeux:2},
 att:[{cout:['grue'],nom:'Ordre de mission',deg:40,
       txt:'Tu choisis l’attaque de ton adversaire à sa place.'},
      {cout:['grue','caisse','muscle'],nom:'Fin de service',deg:90,
       txt:'Personne ne joue plus. Il est 17 h.'}]},

{rarete:'epic',nom:'Jacky dit « La Mouette »',pv:90,fond:'nuit',num:'089/120',
 type:'Nuisible',taille:'1,66 m',poids:'61 kg',px:0.52,
 ap:{peau:7,cheveux:9,coiffe:16,barbe:0,chapeau:0,veste:14,pantalon:5,sac:0,corps:0,yeux:7},
 att:[{cout:['mer'],nom:'Pique le sandwich',deg:30,
       txt:'Vole une carte Objet. Tu ne la reverras jamais.'},
      {cout:['mer','mer'],nom:'Bombardement',deg:70,
       txt:'Sur la casquette. Toujours sur la casquette.'}]},

{rarete:'legend',nom:'Le Grand Léon',pv:180,fond:'quai',num:'110/120',
 type:'Ancien',taille:'1,88 m',poids:'110 kg',ech:1.05,
 ap:{peau:1,cheveux:7,coiffe:20,barbe:7,chapeau:6,veste:7,pantalon:1,sac:0,corps:4,yeux:5},
 att:[{cout:['muscle','muscle'],nom:'Quarante ans de quai',deg:80,
       txt:'+10 pour chaque carte Docker de ton banc.'},
      {cout:['muscle','muscle','grue'],nom:'Le regard',deg:140,
       txt:'L’adversaire ne peut pas attaquer. Il a trop honte.'}]},

{rarete:'ex',nom:'Nacho EX',pv:230,fond:'grue',num:'114/120',
 type:'Pétanque',taille:'1,69 m',poids:'79 kg',dir:'gauche',ech:1.05,px:0.66,
 ap:{peau:3,cheveux:0,coiffe:2,barbe:1,chapeau:0,veste:8,pantalon:3,sac:0,corps:2,yeux:3},
 att:[{cout:['muscle'],nom:'Carreau sur place',deg:60,
       txt:'Défausse la boule adverse. Elle n’a rien vu venir.'},
      {cout:['muscle','muscle','caisse'],nom:'Fanny',deg:160,
       txt:'Si l’adversaire n’a marqué aucun point, il est mis K.O.'}]},

{rarete:'fullart',nom:'Madeleine de la Criée',pv:140,fond:'criee',num:'118/120',
 type:'Poissonnerie',taille:'1,58 m',poids:'—',ech:1.1,
 ap:{peau:4,cheveux:3,coiffe:10,barbe:0,chapeau:2,veste:1,pantalon:7,sac:0,corps:4,yeux:4},
 att:[{cout:['mer'],nom:'« Il est frais, mon poisson »',deg:40,
       txt:'Tout le monde se tait. Même le contremaître.'},
      {cout:['mer','mer','caisse'],nom:'Prix du matin',deg:100,
       txt:'Soigne tous tes Dockers de 30 PV. Et c’est donné.'}]},

{rarete:'secrete',nom:'Le Docker d’Or',pv:250,fond:'nuit',num:'121/120',
 type:'Légende',taille:'1,92 m',poids:'—',ech:1.1,
 ap:{peau:5,cheveux:11,coiffe:19,barbe:0,chapeau:1,veste:6,pantalon:4,sac:0,corps:2,yeux:6},
 att:[{cout:['grue','grue'],nom:'Bip. Bip. Bip.',deg:80,
       txt:'Il recule son chariot. L’adversaire recule d’une case.'},
      {cout:['grue','grue','muscle'],nom:'Palette d’or',deg:180,
       txt:'Pioche 50 000 €. Oui, en vrai.'}]}
];


/* ============ apercus/serie.js ============ */
/* =====================================================================
   POKÉDOCK — LA SÉRIE DE BASE, CENT CARTES
   Format compact : [nom, PV, rareté, fond, type, taille, poids, attaques]
   Une attaque pour les communes, deux au-dessus.
   Les apparences sont tirées du numéro : cent dockers tous différents
   sans écrire cent fois dix champs.
   ===================================================================== */
const C_={caisse:'caisse',mer:'mer',grue:'grue',muscle:'muscle'};
const K=C_;
const FONDS_ORDRE=['quai','grue','cale','criee','nuit'];

/* ---------- les apparences, tirées du numéro ---------- */
function apDe(i,rar){
  const a=(n)=>{const v=Math.sin((i+1)*n)*43758.5453;return v-Math.floor(v);};
  const gros=(rar==='legend'||rar==='ex'||rar==='secrete')?1:0;
  return {
    peau:Math.floor(a(12.9898)*8),
    cheveux:Math.floor(a(78.233)*16),
    coiffe:Math.floor(a(37.719)*22),
    barbe:Math.floor(a(11.135)*12),
    chapeau:a(93.989)<0.45?Math.floor(a(45.164)*8):0,
    veste:Math.floor(a(26.651)*16),
    pantalon:Math.floor(a(62.432)*8),
    chaussures:Math.floor(a(19.873)*6),
    sac:0,
    corps:Math.min(4,gros+Math.floor(a(51.117)*4)),
    haut:Math.floor(a(33.771)*8),
    bas:Math.floor(a(71.229)*6),
    souliers:Math.floor(a(88.441)*4),
    yeux:Math.floor(a(14.337)*8),
    formeYeux:Math.floor(a(55.991)*6),
    sourcils:Math.floor(a(27.613)*4),
    nez:Math.floor(a(64.119)*4),
    bouche:Math.floor(a(39.447)*6),
    marque:a(83.221)<0.2?Math.floor(a(21.009)*6):0,
    boucle:a(70.553)<0.18?Math.floor(a(16.447)*4):0
  };
}

/* ---------- les cent cartes ---------- */
const SERIE=[
/* ========== LES COMMUNES (40) : le quotidien du quai ========== */
['Grutier débutant',40,'commune','Quai','1,78 m','72 kg',
 [[[K.caisse],'Lève la caisse',10,'Met trois heures à viser. La caisse, elle, ne bouge pas.']]],
['Le Nouveau',30,'commune','Quai','1,81 m','66 kg',
 [[[K.caisse],'Question bête',10,'« Et ça sert à quoi, ça ? » Tout le monde soupire.']]],
['Apprenti élingueur',40,'commune','Quai','1,74 m','68 kg',
 [[[K.caisse],'Nœud approximatif',20,'Tient. On ne sait pas pourquoi, mais ça tient.']]],
['Le Gars qui Tient la Pelle',40,'commune','Chantier','1,76 m','79 kg',
 [[[K.muscle],'Appui réglementaire',20,'Il ne creuse pas. Il surveille le trou.']]],
['Pointeur du Quai 3',50,'commune','Bureau','1,69 m','74 kg',
 [[[K.caisse],'Coche la case',10,'Rien n’existe tant qu’il n’a pas coché.']]],
['Stagiaire non rémunéré',20,'commune','Bureau','1,72 m','58 kg',
 [[[K.caisse],'Fait tout le boulot',30,'Ne reçoit ni point ni remerciement.']]],
['Le Collègue de 8 h 04',40,'commune','Quai','1,80 m','84 kg',
 [[[K.caisse],'Pointage limite',10,'Quatre minutes. Toute sa vie, quatre minutes.']]],
['Le Type du Café',40,'commune','Bureau','1,67 m','77 kg',
 [[[K.caisse],'Tournée générale',10,'Soigne 10 PV à chaque Docker. Lui en premier.']]],
['Manutentionnaire moyen',50,'commune','Cale','1,77 m','81 kg',
 [[[K.muscle],'Port correct',20,'Genoux pliés, dos droit. Personne ne le fait.']]],
['Le Mec qui Dort dans le Camion',30,'commune','Quai','1,73 m','86 kg',
 [[[K.mer],'Micro-sieste',10,'Se soigne de 30 PV. Il dormait déjà.']]],
['Vigile de Nuit',50,'commune','Nuit','1,86 m','95 kg',
 [[[K.muscle],'Ronde de 3 h',20,'Trois heures, le mot est fort.']]],
['Jacky qui Nourrit les Mouettes',30,'commune','Nuisible','1,66 m','61 kg',
 [[[K.mer],'Appel du large',10,'Fait venir 40 mouettes. Il en est fier.']]],
['Peseur de Sardines',40,'commune','Criée','1,64 m','63 kg',
 [[[K.mer],'Pouce sur la balance',20,'Tout le monde le sait. Personne ne dit rien.']]],
['Le Gars qui Répare Jamais Rien',40,'commune','Atelier','1,79 m','83 kg',
 [[[K.grue],'Ça va tenir',10,'Ça ne va pas tenir.']]],
['Agent d’Entretien Héroïque',60,'commune','Quai','1,61 m','59 kg',
 [[[K.caisse],'Serpillière tactique',20,'Le sol brille. Personne ne le remarque.']]],
['Le Cariste Prudent',50,'commune','Cale','1,75 m','78 kg',
 [[[K.grue],'Trois points d’appui',20,'Il met vingt minutes. Il n’a jamais rien cassé.']]],
['Conducteur de Transpalette',50,'commune','Cale','1,70 m','80 kg',
 [[[K.grue],'Virage serré',20,'Rate le virage une fois sur deux.']]],
['Le Type qui Connaît un Mec',40,'commune','Quai','1,72 m','75 kg',
 [[[K.caisse],'J’ai ce qu’il te faut',10,'Pioche 1 carte. Ne demande pas d’où elle vient.']]],
['Le Gars du Syndicat du Café',50,'commune','Bureau','1,74 m','82 kg',
 [[[K.caisse],'Motion d’humeur',20,'La pause passe de 10 à 25 minutes.']]],
['Celui qui Range Mal',40,'commune','Cale','1,78 m','74 kg',
 [[[K.caisse],'Pile instable',20,'Si elle tombe, elle tombe sur toi.']]],
['Le Gars à la Radio',40,'commune','Quai','1,71 m','70 kg',
 [[[K.grue],'Grésillement',10,'« Répète ? » × 4.']]],
['Le Soudeur Myope',50,'commune','Atelier','1,68 m','76 kg',
 [[[K.grue],'Point de soudure',20,'À peu près au bon endroit.']]],
['Le Gars qui Siffle',30,'commune','Quai','1,76 m','69 kg',
 [[[K.mer],'Même air depuis 1997',10,'L’adversaire a la chanson dans la tête. Pour toujours.']]],
['Le Pêcheur du Dimanche',40,'commune','Mer','1,70 m','73 kg',
 [[[K.mer],'Ça mord pas',10,'Jamais. Depuis vingt ans, jamais.']]],
['Le Gars qui a Oublié ses Gants',40,'commune','Quai','1,77 m','72 kg',
 [[[K.muscle],'À mains nues',30,'Se blesse de 10 PV. Évidemment.']]],
['Le Chauffeur Pressé',50,'commune','Quai','1,73 m','88 kg',
 [[[K.grue],'Marche arrière à l’oreille',20,'Un rétroviseur, c’est optionnel.']]],
['Le Gars Toujours en Arrêt',30,'commune','Bureau','1,75 m','79 kg',
 [[[K.caisse],'Certificat',10,'Ne peut pas attaquer. Ni être attaqué.']]],
['Le Stockeur Créatif',50,'commune','Cale','1,79 m','85 kg',
 [[[K.caisse],'Ça rentre',20,'Ça ne rentre pas. Il insiste.']]],
['Le Gars qui Répond au Chef',40,'commune','Quai','1,82 m','90 kg',
 [[[K.muscle],'Franc-parler',30,'Perd 10 PV. Mais ça fait du bien.']]],
['Le Mec de la Pesée',50,'commune','Criée','1,66 m','71 kg',
 [[[K.mer],'Arrondi favorable',20,'Toujours dans son sens.']]],
['Le Gars qui Compte les Boulons',50,'commune','Atelier','1,69 m','67 kg',
 [[[K.grue],'Inventaire',10,'Il en manque trois. Il recommence.']]],
['L’Intérimaire du Lundi',40,'commune','Quai','1,80 m','77 kg',
 [[[K.caisse],'Premier jour',20,'Et dernier.']]],
['Le Gars qui Mange à 11 h',40,'commune','Bureau','1,72 m','92 kg',
 [[[K.caisse],'Gamelle anticipée',20,'Soigne 20 PV. Il a faim depuis 9 h.']]],
['Le Gars qui a Faim',40,'commune','Quai','1,76 m','83 kg',
 [[[K.caisse],'Pan-bagnat',20,'Soigne 20 PV. Deux si c’est un sandwich de station.']]],
['Le Gardien du Portail',50,'commune','Nuit','1,84 m','97 kg',
 [[[K.muscle],'Badge ou rien',20,'Même pour le directeur. Surtout pour le directeur.']]],
['Le Gars qui Range les Cônes',40,'commune','Chantier','1,73 m','70 kg',
 [[[K.caisse],'Périmètre',10,'Bloque une case. Personne ne sait pourquoi.']]],
['Le Gars qui Parle Fort',40,'commune','Quai','1,78 m','86 kg',
 [[[K.muscle],'Volume 11',20,'On l’entend du ponton d’en face. Il croit qu’il chuchote.']]],
['Le Type qui Gare Mal',40,'commune','Ville','1,74 m','81 kg',
 [[[K.grue],'Deux places',10,'Il a fait exprès. Il est revenu vérifier que ça dérangeait.']]],
['Le Coursier à Scooter',40,'commune','Ville','1,71 m','64 kg',
 [[[K.grue],'Trottoir autorisé',20,'Dans sa tête, oui. Dans le code de la route, non.']]],
['Le Mec qui Lit la Notice',50,'commune','Atelier','1,70 m','74 kg',
 [[[K.grue],'Page 14',20,'Il est le seul. Il a raison.']]],

/* ========== LES RARES (22) : les gens qu'on connaît ========== */
['Marius du Quai 7',80,'rare','Quai','1,71 m','88 kg',
 [[[K.mer],'Jaune de 9 h 10',30,'Pastis pur dans un verre à moutarde. À jeun. Il appelle ça se rincer la bouche.'],
  [[K.caisse,K.muscle],'Tope là',50,'Il jure que vous êtes cousins. Il pleure. Il te tient la main. Vous n’êtes pas cousins.']]],
['Le Délégué',90,'rare','Bureau','1,77 m','86 kg',
 [[[K.caisse],'Point divers',30,'Il a pris la parole en 2019. Il l’a toujours. Deux collègues sont partis en retraite.'],
  [[K.caisse,K.caisse],'Grève illimitée',60,'Revendication unique : que Jean-Mi arrête de réchauffer du poisson au micro-ondes.']]],
['Dédé Trente Ans de Maison',90,'rare','Quai','1,69 m','94 kg',
 [[[K.muscle],'De mon temps',30,'Pas de casque, pas de grue. On portait les conteneurs à deux. En chaussons.'],
  [[K.muscle,K.caisse],'Le vrai métier',60,'Il te montre son dos. Il n’y a plus de dos. Il en est très fier.']]],
['Fanny du Bar des Docks',80,'rare','Bar','1,63 m','—',
 [[[K.mer],'Tournée',20,'Soigne 30 PV. Verre Tom & Jerry, mégot au fond. Tu remercies quand même.'],
  [[K.mer,K.caisse],'L’ardoise',50,'340 €, un dessin de toi à genoux, et une photo. Elle ne dira pas de quoi.']]],
['Le Chef d’Équipe Fatigué',90,'rare','Quai','1,80 m','91 kg',
 [[[K.grue],'Le planning',40,'Au dos d’un paquet de clopes. Il y a une tache de gras. La tache, c’est toi.'],
  [[K.grue,K.muscle],'Rappel à l’ordre',60,'Il gueule neuf minutes. Mauvais gars, mauvaise équipe, mauvaise entreprise.']]],
['Le Mécano qui Grogne',80,'rare','Atelier','1,74 m','89 kg',
 [[[K.grue],'Qui a touché à ça',30,'Il fouille les sacs. Il fouille les poches. C’est lui. C’est toujours lui.'],
  [[K.grue,K.grue],'Clé de 14',50,'Il retourne l’atelier en hurlant. Elle est dans sa main. Il hurle sur sa main.']]],
['Le Contrôleur des Douanes',90,'rare','Bureau','1,76 m','78 kg',
 [[[K.caisse],'Ouvrez ça',30,'Tu ouvres. C’est sa gamelle. Il y a du lapin. Il te verbalise quand même.'],
  [[K.caisse,K.grue],'Saisie',60,'Deux cents lunettes, une statue, un perroquet. Le perroquet connaît son prénom.']]],
['La Capitainerie',100,'rare','Mer','—','—',
 [[[K.mer],'Avis de tempête',30,'Force 11, huit mètres de creux. Trois pédalos sortent. Deux reviennent.'],
  [[K.mer,K.mer],'Port fermé',60,'Fermé à clé. La clé est au fond du bassin depuis 2007. On n’en parle plus.']]],
['Le Gars du Chariot Élévateur',90,'rare','Cale','1,78 m','93 kg',
 [[[K.grue],'Fourches en avant',40,'Il embarque une palette, une Twingo et le casse-croûte de Jean-Mi.'],
  [[K.grue,K.muscle],'La palette dans le mur',70,'Il recule. Il y a un bruit. Il met la radio plus fort et il rentre chez lui.']]],
['Le Boulanger du Port',80,'rare','Fournil','1,67 m','97 kg',
 [[[K.caisse],'Fournée de 4 h',30,'Soigne 40 PV. Debout depuis 1998. Il parle à son pétrin. Le pétrin répond.'],
  [[K.caisse,K.muscle],'Baguette de la veille',60,'Un homme a perdu une dent à Martigues. De l’avis général, il l’avait cherché.']]],
['Le Gars qui Ramène le Pastis',80,'rare','Bar','1,72 m','85 kg',
 [[[K.mer],'Cinq pour un',30,'Il annonce cinq pour un. C’est du pastis dans du pastis. L’eau, c’est pour les touristes.'],
  [[K.mer,K.mer],'Le coup de trop',60,'Il appelle son ex, son chef, sa mère, puis les pompiers. Il est 2 h 40.']]],
['L’Arbitre de Pétanque',90,'rare','Pétanque','1,70 m','76 kg',
 [[[K.muscle],'Le mètre',30,'Deux millimètres. Il mesure. Il remesure. Il va chercher le maire. Le maire vient.'],
  [[K.muscle,K.caisse],'Décision finale',60,'Il annule le point, la partie, le concours et l’été. Trois hommes pleurent.']]],
['Le Vendeur de Chichis',80,'rare','Plage','1,68 m','80 kg',
 [[[K.caisse],'Chichi tiède',30,'Soigne 20 PV. Il était déjà tiède en 2019. C’est littéralement le même chichi.'],
  [[K.caisse,K.caisse],'Prix de la plage',60,'Neuf euros. Il accepte les espèces, les montres, et ton alliance.']]],
['Le Type qui Vend des Lunettes',70,'rare','Plage','1,73 m','72 kg',
 [[[K.mer],'Rey-Ban',30,'Verre de gauche : solaire. Verre de droite : non. Tu les portes tout l’été.'],
  [[K.mer,K.caisse],'Déballe la valise',50,'Une montre arrêtée, un parfum « Shanel », et un deuxième « Shanel » moins cher.']]],
['Le Pilote du Remorqueur',90,'rare','Mer','1,75 m','90 kg',
 [[[K.mer],'Prise de remorque',40,'Il gare 300 mètres de porte-conteneurs en marche arrière. Permis raté quatre fois.'],
  [[K.mer,K.grue],'Corne de 6 h',70,'Quatre arrondissements réveillés. Un bébé pleure. Il recommence pour vérifier.']]],
['Le Gars du Marché de Noailles',80,'rare','Marché','1,66 m','79 kg',
 [[[K.caisse],'Prix d’ami',30,'Le prix d’ami. L’ami, c’est lui. Tu paies le double et tu le remercies.'],
  [[K.caisse,K.mer],'Goûte ça',50,'Il te le met dans la bouche de force. Ce n’était pas de la nourriture.']]],
['Le Chauffeur du 83',90,'rare','Ville','1,74 m','84 kg',
 [[[K.grue],'Arrêt facultatif',30,'Il ouvre. Tu arrives. Il ferme. Il rouvre. Il ferme. Il te regarde. Il part.'],
  [[K.grue,K.grue],'Voie réservée',60,'Trottoir, terrasse, place du marché, un mariage. Il arrive à l’heure.']]],
['Le Gars de la Fourrière',90,'rare','Ville','1,79 m','88 kg',
 [[[K.grue],'Le sabot',30,'Trente-huit secondes. Sur un vélo. Sur une poussette. Sur un banc.'],
  [[K.grue,K.caisse],'Enlèvement',60,'Ta voiture est partie. Elle était dans ton garage. Le garage aussi est parti.']]],
['La Dame du Guichet',90,'rare','Bureau','1,62 m','—',
 [[[K.caisse],'Il manque un papier',40,'Le formulaire 4B. Supprimé en 2011. Elle en a une pile devant elle.'],
  [[K.caisse,K.caisse],'Fermeture à 16 h',60,'15 h 48. Elle éteint l’écran en te fixant. Elle reste jusqu’à 18 h. Elle ne fait rien.']]],
['Le Gars qui Filme Tout',70,'rare','Ville','1,71 m','68 kg',
 [[[K.caisse],'La story',30,'Ta chute. Au ralenti. Un petit cœur sur ta tête. Une musique de film triste.'],
  [[K.caisse,K.mer],'En direct',50,'Trois spectateurs. Sa mère écrit : « c’est qui ce gros monsieur ». C’est toi.']]],
['Le Mec du Parking',80,'rare','Ville','1,77 m','87 kg',
 [[[K.caisse],'Deux euros',30,'Aucun lien avec ce parking. Le parking est gratuit. Il en vit depuis onze ans.'],
  [[K.caisse,K.muscle],'Place réservée',50,'Il garde une place avec une chaise. La chaise vient de ton balcon.']]],
['Le Gars qui Porte le Frigo',100,'rare','Quai','1,83 m','99 kg',
 [[[K.muscle],'Seul et sans sangle',40,'Un frigo américain. Sur le dos. Dans un colimaçon. Il refuse l’aide en souriant.'],
  [[K.muscle,K.muscle],'Troisième étage',70,'Il arrive : c’était le deuxième. Il remonte : c’était le bon. Il redescend.']]],

/* ========== LES ULTRA RARES (14) ========== */
['Fonfon le Contremaître',120,'ultra','Autorité','1,84 m','101 kg',
 [[[K.grue],'Ordre de mission',40,'Tu choisis l’attaque de ton adversaire à sa place.'],
  [[K.grue,K.caisse,K.muscle],'Fin de service',90,'Personne ne joue plus. Il est 17 h.']]],
['Le Capitaine du Cargo',130,'ultra','Mer','1,81 m','96 kg',
 [[[K.mer],'Corne de brume',40,'Tout le monde sursaute. Tout le monde.'],
  [[K.mer,K.mer,K.grue],'Appareillage',100,'Emporte une carte adverse en mer. Définitif.']]],
['Le Grutier de Compétition',120,'ultra','Grue','1,76 m','83 kg',
 [[[K.grue],'Au millimètre',50,'Pose la caisse sur une pièce de deux euros.'],
  [[K.grue,K.grue],'Double prise',90,'Frappe deux cartes adverses à la fois.']]],
['L’Inspecteur du Travail',120,'ultra','Bureau','1,73 m','77 kg',
 [[[K.caisse],'Contrôle inopiné',40,'L’adversaire défausse toutes ses cartes douteuses.'],
  [[K.caisse,K.caisse,K.grue],'Mise en demeure',90,'Le chantier s’arrête. Deux tours.']]],
['Le Plongeur du Port',110,'ultra','Mer','1,79 m','86 kg',
 [[[K.mer],'Sous la coque',40,'Il a vu des choses. Il ne dira rien.'],
  [[K.mer,K.muscle],'Remonte l’épave',80,'Récupère une carte de ta défausse.']]],
['Madame la Directrice',130,'ultra','Autorité','1,70 m','—',
 [[[K.caisse],'Note de service',50,'Change une règle. N’importe laquelle.'],
  [[K.caisse,K.grue,K.muscle],'Restructuration',90,'Deux cartes adverses changent de camp.']]],
['Le Soudeur de l’Extrême',120,'ultra','Atelier','1,75 m','90 kg',
 [[[K.grue],'Arc électrique',50,'Ne regardez pas. Ils ont regardé.'],
  [[K.grue,K.muscle],'Cordon parfait',80,'Rien ne se descelle plus jamais.']]],
['Le Roi de la Pétanque',120,'ultra','Pétanque','1,68 m','81 kg',
 [[[K.muscle],'Carreau',50,'La boule adverse disparaît du terrain.'],
  [[K.muscle,K.muscle],'Tir à la rafle',80,'Trois boules d’un coup. Trois.']]],
['Le Poissonnier qui Crie',110,'ultra','Criée','1,72 m','94 kg',
 [[[K.mer],'Annonce du jour',40,'On l’entend jusqu’à la gare.'],
  [[K.mer,K.caisse],'Prix barré',80,'Divise par deux le coût de tes attaques.']]],
['Le Gars de la Sécurité Incendie',120,'ultra','Caserne','1,82 m','98 kg',
 [[[K.caisse],'Exercice d’évacuation',40,'Tout le monde sort. Même en pleine partie.'],
  [[K.caisse,K.muscle],'Lance à incendie',80,'Repousse tout le monde de deux cases.']]],
['Le Vieux Loup de Mer',130,'ultra','Mer','1,74 m','89 kg',
 [[[K.mer],'Il va pleuvoir',40,'Il a raison. Il a toujours raison.'],
  [[K.mer,K.mer,K.muscle],'Quarante ans de large',90,'+10 par carte Mer de ton banc.']]],
['L’Électricien de Nuit',110,'ultra','Nuit','1,70 m','75 kg',
 [[[K.grue],'Coupure générale',40,'Plus personne ne voit rien.'],
  [[K.grue,K.grue],'Remise sous tension',80,'Réveille toutes tes Machines.']]],
['Le Gars qui a la Clé',120,'ultra','Autorité','1,77 m','85 kg',
 [[[K.caisse],'La seule copie',40,'Personne d’autre ne l’a. Jamais.'],
  [[K.caisse,K.grue],'Ouvre le hangar 12',80,'Pioche 4 cartes. On ne sait pas ce qu’il y a dedans.']]],
['Le Mistral',130,'ultra','Temps','—','—',
 [[[K.mer],'Rafale',40,'Toutes les cartes posées se retournent.'],
  [[K.mer,K.mer],'Trois jours',90,'Ou six. Ou neuf. On ne sait jamais.']]],

/* ========== LES EPIC (9) ========== */
['Jacky dit « La Mouette »',90,'epic','Nuisible','1,66 m','61 kg',
 [[[K.mer],'Pique le sandwich',30,'Vole une carte Objet. Tu ne la reverras jamais.'],
  [[K.mer,K.mer],'Bombardement',70,'Sur la casquette. Toujours sur la casquette.']]],
['Le Chef de Chantier en Colère',140,'epic','Chantier','1,85 m','104 kg',
 [[[K.muscle],'Coup de gueule',60,'Les murs tremblent. Le chantier aussi.'],
  [[K.muscle,K.muscle,K.caisse],'Tout le monde dehors',110,'Il se calmera. Demain.']]],
['L’Huissier',130,'epic','Bureau','1,74 m','79 kg',
 [[[K.caisse],'Constat',50,'Tout ce que tu fais est noté. Tout.'],
  [[K.caisse,K.caisse,K.grue],'Saisie conservatoire',100,'Prends une carte adverse. Légalement.']]],
['La Panne de 6 h du Matin',130,'epic','Atelier','—','—',
 [[[K.grue],'Voyant rouge',50,'Personne ne sait ce qu’il veut dire.'],
  [[K.grue,K.grue,K.muscle],'Arrêt total',100,'Le port s’arrête. Toute la journée.']]],
['Le Contrôle Fiscal',140,'epic','Bureau','—','—',
 [[[K.caisse],'Questionnaire',50,'Réponds. Mal.'],
  [[K.caisse,K.caisse,K.caisse],'Redressement',110,'Tu perds la moitié de tes euros. Pour de vrai.']]],
['Le Gars qui Double au Péage',120,'epic','Ville','1,76 m','82 kg',
 [[[K.grue],'Bande d’arrêt d’urgence',50,'Il arrive premier. Tout le monde le déteste.'],
  [[K.grue,K.muscle],'Queue de poisson',100,'Repousse deux cartes adverses.']]],
['La Grève Surprise',140,'epic','Quai','—','—',
 [[[K.caisse],'Assemblée',50,'Trois heures de débat. Rien n’est voté.'],
  [[K.caisse,K.muscle,K.muscle],'Port bloqué',110,'Personne ne joue. Personne.']]],
['Le Rond-Point du Prado',130,'epic','Ville','—','—',
 [[[K.grue],'Priorité à droite',50,'Personne ne sait. Personne ne saura.'],
  [[K.grue,K.grue],'Quatrième tour',100,'Tu repasses au même endroit.']]],
['Le Sanglier du Parking',140,'epic','Nuisible','1,10 m','130 kg',
 [[[K.muscle],'Charge',60,'Il n’a peur de rien. Surtout pas de toi.'],
  [[K.muscle,K.muscle],'Famille au complet',110,'Six de plus arrivent.']]],

/* ========== LES LÉGENDAIRES (6) ========== */
['Le Grand Léon',180,'legend','Ancien','1,88 m','110 kg',
 [[[K.muscle,K.muscle],'Quarante ans de quai',80,'+10 pour chaque carte Docker de ton banc.'],
  [[K.muscle,K.muscle,K.grue],'Le regard',140,'L’adversaire ne peut pas attaquer. Il a trop honte.']]],
['La Bonne Mère',200,'legend','Protection','—','—',
 [[[K.mer],'Veille sur le port',60,'Soigne tout le monde de 50 PV. Même l’adversaire.'],
  [[K.mer,K.mer,K.caisse],'Ex-voto',150,'Annule tout ce qui vient d’arriver.']]],
['Le Ferry de 7 h',190,'legend','Mer','—','9 400 t',
 [[[K.mer,K.mer],'Manœuvre',80,'Pousse tout ce qui flotte.'],
  [[K.mer,K.mer,K.grue],'Départ à l’heure',140,'C’est déjà arrivé. Une fois.']]],
['Le Bouchon du Vieux-Port',180,'legend','Ville','—','—',
 [[[K.grue],'Deux feux',70,'Tu n’avances pas. Tu n’avanceras pas.'],
  [[K.grue,K.grue,K.caisse],'Heure de pointe',140,'Plus personne ne bouge pendant trois tours.']]],
['Le Grand Chelem de la Criée',190,'legend','Criée','—','—',
 [[[K.mer,K.caisse],'Tout le banc',80,'Pioche jusqu’à avoir 7 cartes.'],
  [[K.mer,K.mer,K.muscle],'Thon de 300 kg',150,'Il faut six hommes. Il y en a deux.']]],
['Le Portique Géant',200,'legend','Machine','52 m','1 200 t',
 [[[K.grue,K.grue],'Portée maximale',90,'Attrape n’importe quelle carte du terrain.'],
  [[K.grue,K.grue,K.grue],'Déchargement total',160,'Vide la main de l’adversaire.']]],

/* ========== LES EX (4) ========== */
['Nacho EX',230,'ex','Pétanque','1,69 m','79 kg',
 [[[K.muscle],'Carreau sur place',60,'Défausse la boule adverse. Elle n’a rien vu venir.'],
  [[K.muscle,K.muscle,K.caisse],'Fanny',160,'Si l’adversaire n’a marqué aucun point, il est mis K.O.']]],
['Fonfon EX',240,'ex','Autorité','1,84 m','101 kg',
 [[[K.grue,K.caisse],'Réorganisation',80,'Range le terrain comme il veut.'],
  [[K.grue,K.grue,K.muscle],'C’est moi qui décide',170,'Et c’est vrai.']]],
['Le Mistral EX',220,'ex','Temps','—','—',
 [[[K.mer],'Cent dix à l’heure',70,'Emporte tout ce qui n’est pas vissé.'],
  [[K.mer,K.mer,K.mer],'Neuf jours',180,'Tout le monde devient nerveux. Vraiment nerveux.']]],
['Le Grand Léon EX',250,'ex','Ancien','1,88 m','110 kg',
 [[[K.muscle,K.muscle],'Il a tout vu',80,'Copie l’attaque de n’importe quelle carte.'],
  [[K.muscle,K.muscle,K.grue],'La dernière journée',190,'Après ça, il part à la retraite.']]],

/* ========== LES FULL ART (3) ========== */
['Madeleine de la Criée',140,'fullart','Poissonnerie','1,58 m','—',
 [[[K.mer],'« Il est frais, mon poisson »',40,'Tout le monde se tait. Même le contremaître.'],
  [[K.mer,K.mer,K.caisse],'Prix du matin',100,'Soigne tous tes Dockers de 30 PV. Et c’est donné.']]],
['Le Quai au Lever du Jour',160,'fullart','Lieu','—','—',
 [[[K.caisse],'Première grue',50,'Le port se réveille. Toi aussi, difficilement.'],
  [[K.caisse,K.mer],'Café du matin',120,'Soigne 60 PV. Rien d’autre ne marche.']]],
['Le Dernier Cargo',170,'fullart','Mer','—','74 000 t',
 [[[K.mer,K.mer],'Sillage',70,'Emporte tout ce qui traîne.'],
  [[K.mer,K.grue,K.muscle],'Horizon',130,'Il part. Il ne reviendra pas.']]],

/* ========== LES SECRÈTES (2) ========== */
['Le Docker d’Or',250,'secrete','Légende','1,92 m','—',
 [[[K.grue,K.grue],'Bip. Bip. Bip.',80,'Il recule son chariot. L’adversaire recule d’une case.'],
  [[K.grue,K.grue,K.muscle],'Palette d’or',180,'Pioche 50 000 €. Oui, en vrai.']]],
['Fonfon Doré',260,'secrete','Légende','1,84 m','101 kg',
 [[[K.caisse,K.caisse],'Prime exceptionnelle',90,'Il se l’est votée lui-même.'],
  [[K.grue,K.grue,K.muscle],'Patron du port',200,'Toutes les cartes du terrain lui obéissent.']]]
];

/* LES FIGURES QUI REVIENNENT GARDENT LEUR TETE. Fonfon apparait trois
   fois dans la serie : s'il est roux sur l'une et chauve sur l'autre, ce
   n'est plus le meme bonhomme. Leur apparence est donc ecrite a la main,
   et le tirage ne sert qu'aux inconnus. */
const VISAGES={
 'Fonfon':{peau:0,cheveux:6,coiffe:9,barbe:2,chapeau:0,veste:9,pantalon:2,sac:0,corps:4,yeux:2,haut:0,bas:0,souliers:0},
 'Léon'  :{peau:1,cheveux:7,coiffe:20,barbe:7,chapeau:6,veste:7,pantalon:1,sac:0,corps:4,yeux:5,haut:0,bas:0,souliers:0},
 'Nacho' :{peau:3,cheveux:0,coiffe:2,barbe:1,chapeau:0,veste:8,pantalon:3,sac:0,corps:2,yeux:3,haut:0,bas:0,souliers:0},
 'Marius':{peau:1,cheveux:1,coiffe:5,barbe:4,chapeau:3,veste:3,pantalon:6,sac:0,corps:3,yeux:0,haut:0,bas:0,souliers:0},
 'Madeleine':{peau:4,cheveux:3,coiffe:10,barbe:0,chapeau:2,veste:1,pantalon:7,sac:0,corps:4,yeux:4,haut:0,bas:0,souliers:0},
 'Fanny' :{peau:2,cheveux:10,coiffe:12,barbe:0,chapeau:0,veste:15,pantalon:5,sac:0,corps:2,yeux:6,haut:0,bas:0,souliers:0},
 'Jacky' :{peau:7,cheveux:9,coiffe:16,barbe:0,chapeau:0,veste:14,pantalon:5,sac:0,corps:0,yeux:7,haut:0,bas:0,souliers:0}
};
function visageDe(nom,i,rar){
  for(const k in VISAGES)if(nom.indexOf(k)>=0)return VISAGES[k];
  return apDe(i,rar);
}

/* ---------- le decor, tire du lieu ecrit sur la carte ---------- */
/* CENT CARTES SUR CINQ DECORS, ça se lisait comme cinq cartes repetees
   vingt fois. Le lieu est deja ecrit sous l'illustration — autant qu'il
   soit dessine : Fanny derriere son zinc, le mecano a son etabli, le
   chauffeur du 83 sur son trottoir. Quand un lieu revient souvent (le
   quai, trente fois), on alterne entre ses decors plausibles. */
const DECOR_DU_LIEU={
  'Quai':['quai','grue','pont'], 'Chantier':['quai','grue'],
  'Cale':['cale','pont'],        'Grue':['grue'],
  'Mer':['pont','quai'],         'Nuit':['nuit'],
  'Nuisible':['quai','plage'],   'Criée':['criee'],
  'Atelier':['atelier'],         'Bureau':['bureau'],
  'Autorité':['bureau','quai'],  'Bar':['bar'],
  'Fournil':['bar','atelier'],   'Marché':['marche'],
  'Plage':['plage'],             'Ville':['ville'],
  'Pétanque':['ville','plage']
};
/* ET LE TEMPS QU'IL FAIT ACHEVE DE LES SEPARER : deux dockers du meme
   quai n'ont plus la meme image des qu'il y a de la brume sur l'un et
   une fin de journee sur l'autre. Un tiers des cartes reste au temps
   clair, sinon la serie entiere a l'air embrumee. */
const TEMPS=[null,null,null,'brume','soir','mouettes','pluie','soir',
             'projecteur','brume',null,'mouettes'];

/* ---------- on déplie en cartes complètes ---------- */
function construireSerie(){
  const n=SERIE.length;
  return SERIE.map((L,i)=>{
    const [nom,pv,rar,type,taille,poids,att]=L;
    const lot=DECOR_DU_LIEU[type]||FONDS_ORDRE;
    return {
      nom:nom, pv:pv, rarete:rar, type:type, taille:taille, poids:poids,
      fond:lot[(i*3+Math.floor(i/5)*2)%lot.length],
      atmo:(rar==='fullart'||rar==='secrete')?null:TEMPS[(i*5+Math.floor(i/4))%TEMPS.length],
      graine:i*13+7,
/* LES SECRETES SONT « HORS SERIE » : 101 et 102 sur 100. C'est le seul
         endroit ou le numero ment, et c'est fait expres. */
      num:(rar==='secrete'?String(101+(i-98)):('00'+(i+1)).slice(-3))+'/100',
      ap:visageDe(nom,i,rar),
      dir:(i%7===0)?'gauche':((i%5===0)?'droite':'bas'),
/* ON LE DECALE AUSSI DU CENTRE : cent bonshommes plantes exactement au
         milieu de leur cadre, c'est cent fois la meme photo d'identite. */
      pas:i%4, bouge:(i%3===0),
/* LA TAILLE ECRITE SUR LA CARTE EST CELLE DU BONHOMME. le plus petit fait
         1,58 m : il n'y a pas de raison qu'il soit dessine aussi grand que
         le porteur de frigo a 1,83 m. On la lit, on la borne, et on la
         multiplie par le bonus de rarete. */
      px:(rar==='fullart')?0.62:(0.42+((i*7)%5)*0.04),
      ech:((rar==='legend'||rar==='ex'||rar==='secrete')?1.05:1)
          *(()=>{const m=/(\d)[,.](\d\d)/.exec(taille||'');
                 if(!m)return 1;
                 const h=parseFloat(m[1]+'.'+m[2]);
                 return Math.max(0.84,Math.min(1.14,h/1.74));})(),
      att:att.map(A=>({cout:A[0],nom:A[1],deg:A[2],txt:A[3]}))
    };
  });
}


/* ============ son.js ============ */
/* =====================================================================
   POKÉDOCK — LE SON

   Ouvrir un paquet, c'est d'abord un bruit : le mylar qui craque sous les
   doigts, la languette qui se dechire, la carte qui glisse sur la pile.
   Sans ça il manque la moitie de la sensation, et aucune animation ne la
   rattrape.

   TOUT EST SYNTHETISE ICI, A LA VOLEE : pas un seul fichier a charger,
   donc rien a attendre et rien a heberger. Du bruit blanc filtre pour le
   papier, des sinusoides pour les cloches, et une reverbe fabriquee a
   partir d'un bruit qui decroit — c'est une salle en six lignes.

   Le navigateur interdit le son avant un geste : on ne cree donc le
   contexte qu'au premier contact, et le bouton le coupe a tout moment.
   ===================================================================== */
const Son=(function(){
  let ctx=null, bus=null, salle=null, sec=null, actif=true;

  function demarrer(){
    if(ctx)return ctx;
    try{
      const A=window.AudioContext||window.webkitAudioContext;
      if(!A)return null;
      ctx=new A();
      bus=ctx.createGain();bus.gain.value=0.85;bus.connect(ctx.destination);
      /* la voie seche et la voie reverberee */
      sec=ctx.createGain();sec.gain.value=1;sec.connect(bus);
      const cv=ctx.createConvolver();
      cv.buffer=(function(){
        const n=Math.floor(ctx.sampleRate*1.9);
        const b=ctx.createBuffer(2,n,ctx.sampleRate);
        for(let c=0;c<2;c++){
          const d=b.getChannelData(c);
          for(let i=0;i<n;i++){
            const t=i/n;
            d[i]=(Math.random()*2-1)*Math.pow(1-t,3.2);
          }
        }
        return b;
      })();
      salle=ctx.createGain();salle.gain.value=0.26;
      salle.connect(cv);cv.connect(bus);
    }catch(e){ctx=null;}
    return ctx;
  }
  function reveiller(){
    demarrer();
    if(ctx&&ctx.state==='suspended'){try{ctx.resume();}catch(e){}}
  }
  function pret(){return actif&&ctx&&ctx.state==='running';}
  function t(){return ctx.currentTime;}

  /* ---------- un tampon de bruit blanc, mis en cache ---------- */
  let tampon=null;
  function bruitBlanc(){
    if(tampon)return tampon;
    const n=Math.floor(ctx.sampleRate*2);
    tampon=ctx.createBuffer(1,n,ctx.sampleRate);
    const d=tampon.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
    return tampon;
  }
  function source(){
    const s=ctx.createBufferSource();
    s.buffer=bruitBlanc();s.loop=true;
    s.playbackRate.value=0.8+Math.random()*0.5;
    return s;
  }

  /* ---------- le papier ---------- */
/* LE FROISSEMENT N'EST PAS UN SIFFLEMENT CONTINU : c'est une poignee de
     craquements tres courts, chacun un grain de bruit passe-haut. Un seul
     souffle long ferait un radiateur, pas un sachet. */
  function froisser(force){
    if(!pret())return;
    const n=2+Math.floor(force*5);
    for(let i=0;i<n;i++){
      const d0=t()+Math.random()*0.09*force+0.005;
      const s=source(), g=ctx.createGain(), f=ctx.createBiquadFilter();
      f.type='highpass';f.frequency.value=1600+Math.random()*2600;
      const v=(0.012+Math.random()*0.03)*force;
      g.gain.setValueAtTime(0,d0);
      g.gain.linearRampToValueAtTime(v,d0+0.004);
      g.gain.exponentialRampToValueAtTime(0.0001,d0+0.03+Math.random()*0.04);
      s.connect(f);f.connect(g);g.connect(sec);g.connect(salle);
      s.start(d0);s.stop(d0+0.14);
    }
  }

/* LA TENSION MONTE AVEC LE DOIGT : un bruit filtre dont la bande s'ouvre
     a mesure qu'on tire. On garde une seule voix vivante, qu'on pilote. */
  let tension=null;
  function tendre(x){           /* x de 0 a 1 */
    if(!pret())return;
    if(!tension){
      const s=source(), g=ctx.createGain(), f=ctx.createBiquadFilter();
      f.type='bandpass';f.Q.value=1.6;f.frequency.value=420;
      g.gain.value=0.0001;
      s.connect(f);f.connect(g);g.connect(sec);g.connect(salle);
      s.start();
      tension={s:s,g:g,f:f};
    }
    const T=t();
    tension.f.frequency.setTargetAtTime(420+x*2300,T,0.05);
    tension.g.gain.setTargetAtTime(0.004+x*0.05,T,0.05);
  }
  function detendre(){
    if(!tension)return;
    const T=t(), x=tension;tension=null;
    try{
      x.g.gain.setTargetAtTime(0.0001,T,0.06);
      x.s.stop(T+0.4);
    }catch(e){}
  }

/* LA DECHIRURE : une rafale de craquements serres, un balayage de bande
     vers l'aigu, et un coup sourd dessous pour le poids du sachet. */
  function dechirer(){
    if(!pret())return;
    detendre();
    const T=t();
    const s=source(), g=ctx.createGain(), f=ctx.createBiquadFilter();
    f.type='bandpass';f.Q.value=0.9;
    f.frequency.setValueAtTime(700,T);
    f.frequency.exponentialRampToValueAtTime(3600,T+0.42);
    g.gain.setValueAtTime(0.0001,T);
    g.gain.linearRampToValueAtTime(0.16,T+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001,T+0.62);
    s.connect(f);f.connect(g);g.connect(sec);g.connect(salle);
    s.start(T);s.stop(T+0.7);
    for(let i=0;i<9;i++)setTimeout(()=>froisser(0.9),i*42);
    /* le poids */
    const o=ctx.createOscillator(), og=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(140,T);
    o.frequency.exponentialRampToValueAtTime(48,T+0.5);
    og.gain.setValueAtTime(0.0001,T);
    og.gain.linearRampToValueAtTime(0.16,T+0.03);
    og.gain.exponentialRampToValueAtTime(0.0001,T+0.65);
    o.connect(og);og.connect(sec);
    o.start(T);o.stop(T+0.7);
  }

/* LA CARTE QUI GLISSE sur les autres : un souffle court qui s'ouvre puis
     se referme, et rien d'autre. */
  function glisser(v){
    if(!pret())return;
    const T=t(), d=0.26;
    const s=source(), g=ctx.createGain(), f=ctx.createBiquadFilter();
    f.type='lowpass';f.Q.value=0.8;
    f.frequency.setValueAtTime(500,T);
    f.frequency.exponentialRampToValueAtTime(3200,T+d*0.4);
    f.frequency.exponentialRampToValueAtTime(600,T+d);
    g.gain.setValueAtTime(0.0001,T);
    g.gain.linearRampToValueAtTime(0.055*(v||1),T+d*0.3);
    g.gain.exponentialRampToValueAtTime(0.0001,T+d);
    s.connect(f);f.connect(g);g.connect(sec);g.connect(salle);
    s.start(T);s.stop(T+d+0.05);
  }

  /* le claquement sec du carton qui se retourne */
  function claquer(){
    if(!pret())return;
    const T=t();
    const s=source(), g=ctx.createGain(), f=ctx.createBiquadFilter();
    f.type='highpass';f.frequency.value=900;
    g.gain.setValueAtTime(0.09,T);
    g.gain.exponentialRampToValueAtTime(0.0001,T+0.075);
    s.connect(f);f.connect(g);g.connect(sec);g.connect(salle);
    s.start(T);s.stop(T+0.1);
  }

  /* la carte qui se pose sur la table */
  function poser(){
    if(!pret())return;
    const T=t();
    const o=ctx.createOscillator(), og=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(120,T);
    o.frequency.exponentialRampToValueAtTime(62,T+0.16);
    og.gain.setValueAtTime(0.085,T);
    og.gain.exponentialRampToValueAtTime(0.0001,T+0.24);
    o.connect(og);og.connect(sec);o.start(T);o.stop(T+0.3);
    claquer();
  }

/* ---------- LES CLOCHES DE RARETE ----------
   Une gamme pentatonique : il n'y a pas d'accord laid dedans, donc
   n'importe quelles notes empilees sonnent juste. Plus la carte est rare,
   plus on monte dans la serie et plus la note tient longtemps. */
  const GAMME=[0,2,4,7,9,12,14,16,19,21,24];
  const hz=(d)=>261.63*Math.pow(2,d/12);
  function note(demi,retard,duree,vol,forme){
    const T=t()+retard;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=forme||'sine';o.frequency.value=hz(demi);
    g.gain.setValueAtTime(0.0001,T);
    g.gain.linearRampToValueAtTime(vol,T+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,T+duree);
    o.connect(g);g.connect(sec);g.connect(salle);
    o.start(T);o.stop(T+duree+0.1);
  }
  const CEREMONIE={
    commune:{notes:[0],   duree:0.5, vol:0.05},
    rare:   {notes:[0,4], duree:0.9, vol:0.06},
    ultra:  {notes:[4,7,11],      duree:1.5, vol:0.07},
    epic:   {notes:[7,11,14,16],  duree:1.9, vol:0.075},
    legend: {notes:[0,7,12,16,19],duree:2.5, vol:0.08},
    ex:     {notes:[4,11,16,19,23],duree:2.6,vol:0.08},
    fullart:{notes:[7,12,16,19,24],duree:2.9,vol:0.085},
    secrete:{notes:[0,7,12,16,19,24,28],duree:3.6,vol:0.09}
  };
  function carillon(rarete){
    if(!pret())return;
    const c=CEREMONIE[rarete]||CEREMONIE.commune;
    c.notes.forEach((n,i)=>{
      note(GAMME[0]+n,i*0.085,c.duree,c.vol,'sine');
      if(c.notes.length>2)note(GAMME[0]+n+12,i*0.085+0.02,c.duree*0.6,c.vol*0.3,'triangle');
    });
  }

/* LE SOUFFLE QUI PRECEDE : pour une brillante, l'instant juste avant le
     retournement doit faire monter quelque chose. Une nappe qui enfle. */
  function montee(duree){
    if(!pret())return;
    const T=t(), d=duree||1.1;
    const s=source(), g=ctx.createGain(), f=ctx.createBiquadFilter();
    f.type='bandpass';f.Q.value=3;
    f.frequency.setValueAtTime(300,T);
    f.frequency.exponentialRampToValueAtTime(4200,T+d);
    g.gain.setValueAtTime(0.0001,T);
    g.gain.linearRampToValueAtTime(0.07,T+d*0.85);
    g.gain.exponentialRampToValueAtTime(0.0001,T+d+0.12);
    s.connect(f);f.connect(g);g.connect(sec);g.connect(salle);
    s.start(T);s.stop(T+d+0.2);
    const o=ctx.createOscillator(), og=ctx.createGain();
    o.type='sawtooth';
    o.frequency.setValueAtTime(hz(-24),T);
    o.frequency.exponentialRampToValueAtTime(hz(-5),T+d);
    og.gain.setValueAtTime(0.0001,T);
    og.gain.linearRampToValueAtTime(0.03,T+d*0.8);
    og.gain.exponentialRampToValueAtTime(0.0001,T+d+0.1);
    o.connect(og);og.connect(sec);og.connect(salle);
    o.start(T);o.stop(T+d+0.2);
  }

  /* le petit accord de fin, quand les dix sont etalees */
  function final(){
    if(!pret())return;
    [0,4,7,12].forEach((n,i)=>note(GAMME[0]+n,i*0.1,2.2,0.055,'sine'));
  }

  return {
    reveiller:reveiller,
    froisser:froisser, tendre:tendre, detendre:detendre,
    dechirer:dechirer, glisser:glisser, claquer:claquer, poser:poser,
    carillon:carillon, montee:montee, final:final,
    muet:function(v){actif=!v;if(!actif)detendre();},
    estMuet:function(){return !actif;}
  };
})();


/* ============ paquet_ui.js (gravures seules) ============ */
/* ---------- le dos de carte, dessine une fois pour toutes ---------- */
function graverDos(){
  const c=document.createElement('canvas');
  c.width=CW;c.height=CH;
  const g=c.getContext('2d');
  const M=10;
  /* la tranche */
  const f=g.createLinearGradient(0,0,CW,CH);
  f.addColorStop(0,'#1b2b3c');f.addColorStop(.5,'#2d4a63');f.addColorStop(1,'#15202c');
  g.fillStyle=f;rrect(g,0,0,CW,CH,16);g.fill();
  /* le champ, en diagonales */
  const h=g.createLinearGradient(0,0,CW,CH);
  h.addColorStop(0,'#0f3148');h.addColorStop(.46,'#1d5674');
  h.addColorStop(.54,'#17455e');h.addColorStop(1,'#0c2334');
  g.fillStyle=h;rrect(g,M,M,CW-M*2,CH-M*2,11);g.fill();
  g.save();rrect(g,M,M,CW-M*2,CH-M*2,11);g.clip();
  g.strokeStyle='rgba(255,255,255,.045)';g.lineWidth=7;
  for(let i=-CH;i<CW+CH;i+=22){
    g.beginPath();g.moveTo(i,0);g.lineTo(i+CH,CH);g.stroke();}
  /* le reflet qui traverse */
  const r=g.createLinearGradient(CW*0.1,0,CW*0.75,CH);
  r.addColorStop(0,'rgba(255,255,255,0)');
  r.addColorStop(.48,'rgba(170,225,255,.16)');
  r.addColorStop(.52,'rgba(255,220,170,.12)');
  r.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=r;g.fillRect(0,0,CW,CH);
  g.restore();
  /* le medaillon */
  g.save();g.translate(CW/2,CH/2);
  g.rotate(Math.PI/4);
  g.fillStyle='rgba(8,20,30,.55)';g.fillRect(-62,-62,124,124);
  g.strokeStyle='#e8c877';g.lineWidth=3;g.strokeRect(-62,-62,124,124);
  g.strokeStyle='rgba(232,200,119,.35)';g.lineWidth=1;g.strokeRect(-70,-70,140,140);
  g.restore();
  /* une grue en ombre chinoise, dans le medaillon */
  g.save();g.translate(CW/2,CH/2);
  g.fillStyle='#0b1a26';
  g.fillRect(-28,-34,6,66);                     /* le mat */
  g.fillRect(-40,-38,78,5);                     /* la fleche */
  g.fillRect(-44,-38,12,11);                    /* le contrepoids */
  for(let i=0;i<8;i++){                          /* le treillis */
    g.beginPath();g.moveTo(-36+i*9,-33);g.lineTo(-27+i*9,-26);
    g.lineWidth=1.4;g.strokeStyle='#0b1a26';g.stroke();}
  g.fillRect(-38,-27,72,3);
  g.fillRect(10,-33,2,30);                      /* le cable */
  g.fillRect(4,-3,14,5);                        /* le crochet */
  g.fillRect(-2,2,26,11);                       /* la palette */
  g.fillStyle='#0b1a26';g.fillRect(-46,28,92,5);/* le quai */
  g.restore();
  /* le nom, en haut et en bas */
  txt(g,'POKÉDOCK',CW/2,66,'800 26px '+SANS,'#f0dfae','center');
  txt(g,'SÉRIE DE BASE',CW/2,86,'700 11px '+SANS,'rgba(220,235,245,.55)','center');
  txt(g,'LE PORT, EN CENT CARTES',CW/2,CH-58,'700 10px '+SANS,
      'rgba(220,235,245,.45)','center');
  txt(g,'◆',CW/2,CH-36,'700 13px '+SANS,'rgba(232,200,119,.8)','center');
  return c.toDataURL('image/png');
}

/* ---------- le sachet ---------- */
function graverSachet(){
  const c=document.createElement('canvas');
  c.width=CW;c.height=CH;
  const g=c.getContext('2d');
  const f=g.createLinearGradient(0,0,CW,CH);
  f.addColorStop(0,'#c94a2e');f.addColorStop(.34,'#e8743a');
  f.addColorStop(.52,'#f6b05a');f.addColorStop(.70,'#d9552f');
  f.addColorStop(1,'#8e2a22');
  g.fillStyle=f;g.fillRect(0,0,CW,CH);
  /* le mylar accroche la lumiere par bandes */
  for(let i=-CH;i<CW+CH;i+=16){
    g.fillStyle='rgba(255,255,255,'+(0.03+Math.random()*0.05).toFixed(3)+')';
    g.save();g.beginPath();g.moveTo(i,0);g.lineTo(i+9,0);
    g.lineTo(i+9+CH,CH);g.lineTo(i+CH,CH);g.closePath();g.fill();g.restore();
  }
  /* le bord dentele, en haut */
  g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,0,CW,44);
  g.fillStyle='rgba(255,255,255,.12)';
  for(let x=0;x<CW;x+=10){g.beginPath();g.moveTo(x,44);g.lineTo(x+5,50);
    g.lineTo(x+10,44);g.closePath();g.fill();}
  txt(g,'OUVRIR ICI  ▸▸',CW/2,29,'800 12px '+SANS,'rgba(255,240,210,.85)','center');
  /* la silhouette du port */
  g.save();g.globalAlpha=.20;g.fillStyle='#3a1208';
  g.fillRect(0,CH-96,CW,96);
  g.fillRect(34,CH-182,8,90);g.fillRect(16,CH-186,96,7);
  g.fillRect(10,CH-186,16,14);g.fillRect(92,CH-178,3,40);
  g.fillRect(84,CH-140,20,8);
  for(let i=0;i<5;i++)g.fillRect(150+i*26,CH-130-i*7,20,40+i*7);
  g.restore();
  /* le soleil */
  g.fillStyle='rgba(255,236,190,.35)';
  g.beginPath();g.arc(CW*0.70,CH*0.34,46,0,7);g.fill();
  /* le logo */
  g.save();g.translate(CW/2,CH*0.40);
  g.rotate(-0.045);
  txt(g,'POKÉDOCK',0,0,'800 40px '+SANS,'#fff4dc','center');
  g.strokeStyle='rgba(90,20,10,.75)';g.lineWidth=1.5;
  g.font='800 40px '+SANS;g.textAlign='center';g.strokeText('POKÉDOCK',0,0);
  g.restore();
  txt(g,'10 CARTES',CW/2,CH*0.40+26,'800 15px '+SANS,'#2e0d06','center');
  txt(g,'6 communes + 4 tirages',CW/2,CH*0.40+44,'italic 12px '+SERIF,
      'rgba(60,18,8,.8)','center');
  /* le bas, le prix */
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,CH-40,CW,40);
  txt(g,'SÉRIE DE BASE',14,CH-16,'700 11px '+SANS,'rgba(255,240,215,.75)');
  txt(g,'6 €',CW-14,CH-14,'800 20px '+SANS,'#ffe9b8','right');
  return c.toDataURL('image/png');
}


/* ============ pokedock_jeu.js + pokedock_marche.js ============ */
/* =====================================================================
   POKÉDOCK DANS LE JEU

   Le même paquet que l'aperçu, mais posé par-dessus le port : il
   fabrique son propre calque, s'y installe, et le retire en partant.
   Rien ici ne touche au DOM du jeu — sauf l'élément d'accueil du rayon,
   qu'on nous passe.

   LE TIRAGE N'EST PAS FAIT ICI. On reçoit dix numéros du serveur et on
   se contente de les montrer : c'est la seule façon qu'un paquet à six
   euros ne s'ouvre pas depuis la console.
   ===================================================================== */
const JEU=construireSerie();
let DOS_CACHE=null, SAC_CACHE=null;
/* L'EDITION HALLOWEEN : ses cartes portent ici les numeros 101 a 150,
   ses dessins vivent dans pokedock_hw.js. HW dit quelle edition on
   ouvre, pour le dos et le sachet. */
let HW=false;
const PHW=()=>window.PokedockHW||null;
const dosURL=()=>(HW&&PHW())?PHW().dos():(DOS_CACHE||(DOS_CACHE=graverDos()));
const sacURL=()=>(HW&&PHW())?PHW().sachet():(SAC_CACHE||(SAC_CACHE=graverSachet()));
const NUMC=(n)=>(n>100&&PHW())?PHW().num(n-100):('00'+n).slice(-3)+'/100';

const faces={};
function faceURL(n){                      /* n de 1 a 100, 101 a 150 pour Halloween */
  if(n>100)return PHW()?PHW().face(n-100):dosURL();
  if(faces[n])return faces[n];
  const i=n-1, C=JEU[i];
  if(!C)return dosURL();
  const c=document.createElement('canvas');
  c.width=CW*2;c.height=CH*2;
  const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);
  dessinerCarte(g,C,1200+i*137);
  return faces[n]=c.toDataURL('image/png');
}
const RARETE=(n)=>n>100?(PHW()?PHW().rarete(n-100):'commune'):((JEU[n-1]||{}).rarete||'commune');
const NOM_CARTE=(n)=>n>100?(PHW()?PHW().nom(n-100):'?'):((JEU[n-1]||{}).nom||'?');

const FINE={ultra:1,epic:1,legend:1,ex:1,fullart:1,secrete:1};
const GROSSE={legend:1,ex:1,fullart:1,secrete:1};
const NOM_RAR={commune:'COMMUNE',rare:'RARE',ultra:'ULTRA RARE',epic:'EPIC',
  legend:'LÉGENDAIRE',ex:'EX',fullart:'FULL ART',secrete:'SECRÈTE'};
const TON={commune:'#cdbfa6',rare:'#9fd0e8',ultra:'#7fd2ff',epic:'#c79bff',
  legend:'#ffd978',ex:'#ff9d62',fullart:'#8fe8ff',secrete:'#ff9ae0'};

/* ---------------- le style, posé une seule fois ---------------- */
const CSS_PKD=`
#pkd{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;
  align-items:center;overflow-x:hidden;
  padding:calc(14px + env(safe-area-inset-top,0px)) 12px calc(22px + env(safe-area-inset-bottom,0px));
  background:radial-gradient(80% 50% at 50% 2%,#2b2338 0%,rgba(43,35,56,0) 62%),
    radial-gradient(70% 38% at 50% 100%,#1b222e 0%,rgba(27,34,46,0) 72%),#13111a;
  color:#f2ece0;font-family:Georgia,serif;overflow-y:auto;-webkit-overflow-scrolling:touch}
#pkd .ent{text-align:center;position:relative;z-index:3}
#pkd .ent b{display:block;font:900 13px Arial,sans-serif;letter-spacing:.3em;color:#e8c877}
#pkd .ent i{display:block;font-size:12px;color:rgba(242,236,224,.5);margin-top:4px}
#pkd .hp{position:absolute;top:12px;right:12px;z-index:50;width:34px;height:34px;
  border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);
  color:rgba(242,236,224,.52);font-size:14px;line-height:1;display:grid;place-items:center}
/* LA SCENE SE MESURE EN HAUTEUR D'ECRAN, PAS EN LARGEUR.
   Sur un telephone tenu debout, la place qui manque est en bas, jamais sur
   les cotes : c'est donc la hauteur restante qui doit decider de la taille
   du sachet et des cartes. Tout ce qui est dedans se donne un pourcentage
   de cette scene, plafonne par la largeur, et plus une taille fixe. */
#pkd .sc{position:relative;width:100%;max-width:980px;flex:1 1 auto;z-index:2;min-height:250px;
  display:flex;align-items:center;justify-content:center;perspective:1600px;margin-top:6px}
#pkd .sc.plie{flex:0 0 0;min-height:0;height:0;margin-top:0}
#pkd .pous{position:absolute;inset:0;pointer-events:none;overflow:hidden}
#pkd .pous i{position:absolute;width:2px;height:2px;border-radius:50%;
  background:rgba(255,240,210,.5);animation:pkdDerive linear infinite}
@keyframes pkdDerive{0%{transform:translate(0,30px);opacity:0}12%{opacity:.7}
  88%{opacity:.5}100%{transform:translate(var(--dx),-130px);opacity:0}}
#pkd .sol{position:absolute;bottom:7%;left:50%;transform:translateX(-50%);
  width:min(480px,80vw);height:56px;border-radius:50%;
  background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.62),rgba(0,0,0,0));pointer-events:none}
/* LE NOIR QUI TOMBE SUR LES GROSSES CARTES. Il etait pose dans la scene en
   debordant de quarante vmax de chaque cote : la page se baladait alors
   lateralement sur tous les telephones. Fixe au cadre, il couvre l'ecran
   sans rien ajouter a ce qu'il y a a faire defiler. */
#pkd .rid{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:0;
  background:radial-gradient(42% 42% at 50% 50%,rgba(6,5,9,0) 0%,rgba(6,5,9,.82) 72%);
  transition:opacity 1.1s ease}
#pkd .rid.on{opacity:1}

#pkd .sac{position:relative;height:min(76%,calc(62vw * 1.4),460px);width:auto;aspect-ratio:300/420;
  transform-style:preserve-3d;touch-action:none;will-change:transform}
#pkd .sac .h,#pkd .sac .b{position:absolute;left:-6%;width:112%;overflow:hidden;
  filter:drop-shadow(0 18px 34px rgba(0,0,0,.62))}
#pkd .sac .h{top:0;height:24%;transform-origin:50% 100%}
#pkd .sac .b{top:0;height:100%;transform-origin:50% 30%}
#pkd .sac .h img,#pkd .sac .b img{position:absolute;left:5.36%;top:0;width:89.3%;
  height:auto;display:block;border-radius:4px}
#pkd .sac .gr{position:absolute;inset:0;border-radius:4px;pointer-events:none;opacity:.5;
  mix-blend-mode:overlay;background-image:radial-gradient(rgba(255,255,255,.5) .5px,transparent .6px);
  background-size:3px 3px}
#pkd .sac .lu{position:absolute;inset:0;border-radius:4px;pointer-events:none;
  background:linear-gradient(112deg,rgba(255,255,255,0) 33%,rgba(255,255,255,.34) 46%,
    rgba(170,225,255,.2) 53%,rgba(255,210,150,.16) 58%,rgba(255,255,255,0) 70%);
  background-size:320% 100%;mix-blend-mode:screen}
#pkd .sac .te{position:absolute;left:4%;right:4%;top:23.4%;height:3px;pointer-events:none;
  background:linear-gradient(90deg,rgba(255,240,200,0),rgba(255,245,215,1),rgba(255,240,200,0));
  opacity:0;filter:blur(1.2px)}
#pkd .sac.ouv .h{animation:pkdArrache 1.5s cubic-bezier(.22,.62,.3,1) forwards}
#pkd .sac.ouv .b{animation:pkdOuvre 1.9s cubic-bezier(.3,.5,.4,1) forwards}
@keyframes pkdArrache{0%{transform:none}20%{transform:translate(-3px,-9px) rotate(-2.5deg)}
  100%{transform:translate(84px,-200px) rotate(38deg) scale(.93);opacity:0}}
@keyframes pkdOuvre{0%{transform:none}14%{transform:scaleY(1.03) rotateX(-7deg)}
  46%{transform:scaleY(1) rotateX(-4deg) translateY(4px)}
  100%{transform:translateY(240px) rotate(-6deg) scale(.95);opacity:0}}
#pkd .ind{position:absolute;bottom:-32px;left:50%;transform:translateX(-50%);white-space:nowrap;
  font:400 clamp(11px,3vw,12.5px) Arial,sans-serif;color:rgba(242,236,224,.5);letter-spacing:.04em;
  animation:pkdResp 2.6s ease-in-out infinite;pointer-events:none}
@keyframes pkdResp{0%,100%{opacity:.4}50%{opacity:.95}}

#pkd .pile{position:absolute;height:min(56%,calc(42vw * 1.4),330px);width:auto;aspect-ratio:300/420;
  display:none}
#pkd .pile.la{display:block}
#pkd .pile .dc{position:absolute;inset:0;border-radius:7px;overflow:hidden;
  box-shadow:0 10px 24px rgba(0,0,0,.6);animation:pkdSort 1s cubic-bezier(.2,.66,.3,1) backwards}
#pkd .pile .dc img{width:100%;height:100%;display:block}
@keyframes pkdSort{0%{transform:translateY(74px) scale(.9);opacity:0}30%{opacity:1}100%{opacity:1}}
#pkd .pile.fri::after{content:'';position:absolute;inset:-4px;border-radius:9px;pointer-events:none;
  background:linear-gradient(118deg,rgba(255,255,255,0) 38%,rgba(255,225,150,.75) 50%,
    rgba(255,255,255,0) 62%);background-size:300% 100%;animation:pkdBalaye 1.5s ease-in-out}
@keyframes pkdBalaye{0%{background-position:170% 0}100%{background-position:-70% 0}}

#pkd .rev{position:absolute;height:min(80%,calc(74vw * 1.4),520px);width:auto;aspect-ratio:300/420;
  display:none;
  transform-style:preserve-3d;touch-action:none;
  transition:transform 1.05s cubic-bezier(.22,.62,.26,1),opacity .5s}
#pkd .rev.la{display:block}
#pkd .rev .in{position:absolute;inset:0;transform-style:preserve-3d;
  transition:transform 1s cubic-bezier(.32,.68,.28,1)}
#pkd .rev .in.vu{transform:rotateY(180deg)}
#pkd .rev .d,#pkd .rev .f{position:absolute;inset:0;border-radius:9px;overflow:hidden;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 24px 46px rgba(0,0,0,.7)}
#pkd .rev .f{transform:rotateY(180deg)}
#pkd .rev img{width:100%;height:100%;display:block}
#pkd .rev .ho{position:absolute;inset:0;pointer-events:none;mix-blend-mode:color-dodge;opacity:0;
  transition:opacity .6s;background:linear-gradient(110deg,rgba(255,0,120,0) 30%,
    rgba(255,170,60,.26) 42%,rgba(110,255,215,.24) 50%,rgba(150,120,255,.26) 58%,rgba(0,0,0,0) 70%);
  background-size:280% 100%}
#pkd .rev.br .f .ho{opacity:1}
#pkd .rev .au{position:absolute;inset:-14%;border-radius:22px;pointer-events:none;z-index:-1;
  opacity:0;transition:opacity .9s;filter:blur(26px);
  background:radial-gradient(50% 50% at 50% 50%,var(--ton,#fff) 0%,transparent 72%)}
#pkd .rev.ae .au{opacity:.55}
#pkd .rev.fl{animation:pkdFlotte 6s ease-in-out infinite}
@keyframes pkdFlotte{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
#pkd .rev.pa{transform:translateX(128%) rotate(10deg) scale(.86)!important;opacity:0}
#pkd .neuf{position:absolute;top:-10px;right:-10px;z-index:4;
  font:900 9px Arial,sans-serif;letter-spacing:1.6px;color:#1a1208;background:#e8c877;
  border-radius:999px;padding:5px 9px;box-shadow:0 4px 12px rgba(0,0,0,.5);opacity:0;
  transition:opacity .5s}
#pkd .rev.ae .neuf.si{opacity:1}

#pkd .ec{position:absolute;inset:0;pointer-events:none;overflow:hidden}
#pkd .ec .fla{position:absolute;inset:0;opacity:0;
  background:radial-gradient(44% 44% at 50% 50%,rgba(255,245,215,.6),rgba(255,245,215,0) 74%)}
#pkd .ec .fla.on{animation:pkdEclate 1.6s cubic-bezier(.2,.6,.3,1) forwards}
@keyframes pkdEclate{0%{opacity:0;transform:scale(.74)}26%{opacity:1}100%{opacity:0;transform:scale(1.32)}}
#pkd .ec .ra{position:absolute;left:50%;top:50%;--r:min(1200px,170vmax);
  width:var(--r);height:var(--r);margin:calc(var(--r) / -2) 0 0 calc(var(--r) / -2);
  opacity:0;mix-blend-mode:screen;filter:blur(.7px);
  background:conic-gradient(from 0deg,rgba(255,232,170,.46) 0 1.2deg,rgba(255,232,170,0) 1.2deg 10deg);
  -webkit-mask-image:radial-gradient(closest-side,#000 5%,rgba(0,0,0,.6) 32%,transparent 68%);
  mask-image:radial-gradient(closest-side,#000 5%,rgba(0,0,0,.6) 32%,transparent 68%)}
#pkd .ec .ra.on{animation:pkdTourne 4s cubic-bezier(.18,.5,.3,1) forwards}
@keyframes pkdTourne{0%{opacity:0;transform:rotate(0) scale(.58)}32%{opacity:.62}
  100%{opacity:0;transform:rotate(30deg) scale(1.04)}}
#pkd .eti{position:absolute;width:5px;height:5px;border-radius:50%;background:#ffe9b0;
  box-shadow:0 0 13px 4px rgba(255,220,140,.5);pointer-events:none}

/* LE NOM DE LA RARETE SE LIT AU-DESSUS DE LA SCENE, PLUS DEDANS. Pose en
   absolu a six pour cent du haut, il atterrissait sur la carte des que
   l'ecran etait court. Il prend maintenant sa ligne, toujours la meme
   hauteur : rien ne saute quand il apparait. Le retrait compense
   l'interlettrage, qui sinon pousse le mot vers la gauche. */
#pkd .cri{flex:0 0 auto;z-index:3;height:19px;margin-top:9px;text-indent:.3em;
  font:900 clamp(12px,3.3vw,16px)/19px Arial,sans-serif;letter-spacing:.3em;
  white-space:nowrap;opacity:0;pointer-events:none;text-shadow:0 2px 18px rgba(0,0,0,.9)}
#pkd .cri.on{animation:pkdCrie 3.8s cubic-bezier(.25,.6,.3,1) forwards}
@keyframes pkdCrie{0%{opacity:0;transform:translateY(9px);letter-spacing:.1em}
  24%{opacity:1;transform:none;letter-spacing:.3em}
  74%{opacity:1;transform:none;letter-spacing:.3em}
  100%{opacity:0;transform:translateY(-6px);letter-spacing:.36em}}

/* LE RAPPEL DE CE QU'IL FAUT FAIRE, MONTRE SUR LA PREMIERE CARTE SEULEMENT.
   Les pastilles disent combien il en reste, elles ne disent pas comment
   passer a la suivante. */
#pkd .ast{position:absolute;bottom:calc(3% + 16px);left:50%;transform:translateX(-50%);
  white-space:nowrap;font:400 clamp(10.5px,2.9vw,12.5px) Arial,sans-serif;
  color:rgba(242,236,224,.42);pointer-events:none;opacity:0;transition:opacity .6s}
#pkd .ast.la{opacity:1}
#pkd .cpt{position:absolute;bottom:3%;left:50%;transform:translateX(-50%);display:none;gap:7px}
#pkd .cpt.la{display:flex}
#pkd .cpt i{width:6px;height:6px;border-radius:50%;background:rgba(242,236,224,.17);transition:.5s}
#pkd .cpt i.vu{background:#e8c877;box-shadow:0 0 9px rgba(232,200,119,.6)}
#pkd .cpt i.ici{transform:scale(1.6);background:#f2ece0}

/* LES CARTES DEJA VUES TIENNENT SUR UNE SEULE LIGNE. En passant a la ligne,
   la rangee mangeait le bas de l'ecran et la carte en cours remontait. */
#pkd .tir{display:flex;gap:min(6px,1.4vw);flex-wrap:nowrap;justify-content:center;
  align-items:flex-start;width:100%;margin-top:4px;height:min(59px,11.2vw);flex:0 0 auto}
#pkd .tir img{height:100%;width:auto;border-radius:4px;box-shadow:0 5px 12px rgba(0,0,0,.5);
  animation:pkdRange .9s cubic-bezier(.2,.62,.3,1) backwards}
@keyframes pkdRange{0%{transform:translateY(-56px) scale(1.5) rotate(6deg);opacity:0}100%{opacity:1}}

#pkd .eta{display:none;width:100%;max-width:700px;margin:6px auto 0;justify-content:center;
  align-items:flex-end;flex-wrap:wrap;gap:min(9px,2vw)}
#pkd .eta.la{display:flex}
#pkd .eta .c{width:min(126px,30vw);aspect-ratio:300/420;position:relative;border-radius:7px;
  overflow:hidden;box-shadow:0 12px 26px rgba(0,0,0,.58);
  animation:pkdPousse 1s cubic-bezier(.2,.62,.3,1) backwards}
@keyframes pkdPousse{0%{transform:translateY(30px) scale(.92);opacity:0}100%{opacity:1}}
#pkd .eta .c img{width:100%;height:100%;display:block}
/* LE BANDEAU « NOUVELLE » SE POSE EN BAS : en haut a gauche il tombait
   pile sur le nom de la carte, et on ne lisait plus laquelle on venait
   de sortir. */
#pkd .eta .c u{position:absolute;bottom:5px;left:5px;right:5px;text-align:center;
  font:900 8px Arial,sans-serif;letter-spacing:1.3px;color:#1a1208;
  background:rgba(232,200,119,.94);border-radius:999px;padding:3px 6px;
  text-decoration:none;box-shadow:0 2px 6px rgba(0,0,0,.4)}

#pkd .act{display:flex;gap:9px;justify-content:center;margin-top:16px;flex-wrap:wrap}
#pkd .act button{font:900 12px Arial,sans-serif;letter-spacing:1.4px;border-radius:999px;
  padding:12px 20px;border:1px solid #e8c877;background:#e8c877;color:#241a0a}
#pkd .act button.v{background:rgba(255,255,255,.06);color:#f2ece0;border-color:rgba(255,255,255,.2)}
#pkd .act button[disabled]{opacity:.45}

#pkd .lp{position:fixed;inset:0;z-index:60;display:none;background:rgba(7,6,10,.92);
  align-items:center;justify-content:center;padding:22px}
#pkd .lp.la{display:flex}
#pkd .lp img{max-height:84vh;max-height:84dvh;max-width:92vw;width:auto;height:auto;
  border-radius:12px;box-shadow:0 30px 70px rgba(0,0,0,.85)}
#pkd .lp b{position:absolute;bottom:22px;left:0;right:0;text-align:center;
  font:400 12px Georgia,serif;color:rgba(242,236,224,.45)}

/* ---------------- le classeur ---------------- */
#pkd .cl{width:100%;max-width:760px;margin:10px auto 0}
#pkd .cl .ba{display:flex;justify-content:space-between;align-items:baseline;
  font:400 12px Georgia,serif;color:rgba(242,236,224,.55);margin-bottom:10px}
#pkd .cl .ba b{font:900 22px Georgia,serif;color:#e8c877}
#pkd .cl .ja{height:5px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden;
  margin-bottom:16px}
#pkd .cl .ja i{display:block;height:100%;background:linear-gradient(90deg,#c9a24a,#f0dca0)}
#pkd .cl .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px}
#pkd .cl .ca{position:relative;aspect-ratio:300/420;border-radius:6px;overflow:hidden;
  background:#1c1a24;box-shadow:0 5px 14px rgba(0,0,0,.5)}
#pkd .cl .ca img{width:100%;height:100%;display:block}
#pkd .cl .ca.no{display:grid;place-items:center;border:1px dashed rgba(242,236,224,.14)}
#pkd .cl .ca.no span{font:900 13px Arial,sans-serif;color:rgba(242,236,224,.22)}
#pkd .cl .ca u{position:absolute;bottom:4px;right:4px;font:900 8px Arial,sans-serif;
  background:rgba(0,0,0,.6);color:#e8c877;border-radius:999px;padding:2px 5px;text-decoration:none}
#pkd .cl h4{font:900 10px Arial,sans-serif;letter-spacing:2.4px;color:rgba(242,236,224,.4);
  margin:20px 0 9px}
`;
function poserStyle(){
  if(document.getElementById('cssPkd'))return;
  const st=document.createElement('style');
  st.id='cssPkd';st.textContent=CSS_PKD;document.head.appendChild(st);
}

/* =====================================================================
   L'OUVERTURE D'UN PAQUET
   cartes : les dix numéros rendus par le serveur, déjà dans l'ordre.
   neuves : celles que le joueur n'avait pas encore.
   ===================================================================== */
function ouvrirPaquet(cartes,neuves,fini,ed){
  poserStyle();
  HW=(ed==='hw');
  const nouv=new Set(neuves||[]);
  const cal=document.createElement('div');
  cal.id='pkd';
  cal.innerHTML=
    '<button class="hp" aria-label="Son">♪</button>'+
    '<div class="rid"></div>'+
    '<div class="ent"><b>POKÉDOCK</b><i>'+(HW?'Halloween 2026 · cinquante monstres sur le port':'Première édition · le port en cent cartes')+'</i></div>'+
    '<div class="cri"></div>'+
    '<div class="sc">'+
      '<div class="pous"></div><div class="sol"></div>'+
      '<div class="sac"><div class="b"><img alt=""></div><div class="h"><img alt=""></div>'+
        '<div class="gr"></div><div class="lu"></div><div class="te"></div>'+
        '<div class="ind">Tire la languette vers le bas</div></div>'+
      '<div class="pile"></div>'+
      '<div class="rev"><div class="au"></div><u class="neuf">NOUVELLE</u>'+
        '<div class="in"><div class="d"><img alt=""></div>'+
        '<div class="f"><img alt=""><div class="ho"></div></div></div></div>'+
      '<div class="ec"><div class="fla"></div><div class="ra"></div></div>'+
      '<div class="cpt"></div><div class="ast">Touche la carte pour la suivante</div>'+
    '</div>'+
    '<div class="tir"></div><div class="eta"></div>'+
    '<div class="act"><button class="v" data-f="1" hidden>RANGER DANS LE CLASSEUR</button></div>'+
    '<div class="lp"><img alt=""><b>Touche l’écran pour fermer</b></div>';
  document.body.appendChild(cal);

  const q=(s)=>cal.querySelector(s);
  const sac=q('.sac'), pile=q('.pile'), rev=q('.rev'), dedans=q('.rev .in');
  const sc=q('.sc'), rid=q('.rid'), ec=q('.ec'), fla=q('.fla'), ra=q('.ra');
  const cri=q('.cri'), cpt=q('.cpt'), tir=q('.tir'), eta=q('.eta'), ast=q('.ast');
  const holo=q('.ho'), neufEt=q('.neuf'), lp=q('.lp'), hp=q('.hp');
  const bFin=q('[data-f]');

  q('.rev .d img').src=dosURL();
  sac.querySelectorAll('img').forEach(im=>im.src=sacURL());

  for(let i=0;i<18;i++){
    const d=document.createElement('i');
    d.style.left=(5+Math.random()*90)+'%';d.style.top=(55+Math.random()*45)+'%';
    d.style.setProperty('--dx',(Math.random()*60-30)+'px');
    d.style.animationDuration=(13+Math.random()*16)+'s';
    d.style.animationDelay=(-Math.random()*20)+'s';
    d.style.opacity=.2+Math.random()*.5;
    q('.pous').appendChild(d);
  }
  const dents=(()=>{const p=[];for(let i=0;i<=16;i++)p.push([i*6.25,(i%2?2.4:0)]);return p;})();
  q('.sac .h').style.clipPath='polygon(0 0,100% 0,'+
    dents.slice().reverse().map(([x,d])=>x+'% '+(d?'100%':'90%')).join(',')+')';
  q('.sac .b').style.clipPath='polygon('+
    dents.map(([x,d])=>x+'% '+(d?'24%':'21.6%')).join(',')+',100% 100%,0 100%)';

  let phase='sachet', prise=false, y0=0, k=0;
  const cib={rx:0,ry:0,ty:0,sy:1}, cou={rx:0,ry:0,ty:0,sy:1};
  let bruitDepuis=0, vivant=true;
  (function boucle(){
    if(!vivant)return;
    requestAnimationFrame(boucle);
    if(phase!=='sachet')return;
    let d=0;
    for(const key in cib){const e2=cib[key]-cou[key];cou[key]+=e2*0.14;d+=Math.abs(e2);}
    sac.style.transform='rotateX('+cou.rx.toFixed(2)+'deg) rotateY('+cou.ry.toFixed(2)+
      'deg) translateY('+cou.ty.toFixed(1)+'px) scaleY('+cou.sy.toFixed(3)+')';
    q('.lu').style.backgroundPosition=(50-cou.ry*2.6)+'% 0';
    const t=performance.now();
    if(d>1.4&&t-bruitDepuis>120){bruitDepuis=t;Son.froisser(Math.min(1,d/22));}
  })();

  sc.addEventListener('pointermove',ev=>{
    if(phase!=='sachet')return;
    if(prise){
      const x=Math.max(0,ev.clientY-y0);
      cib.rx=-Math.min(12,x*0.19);cib.ry=0;
      cib.ty=Math.min(30,x*0.42);cib.sy=1+Math.min(0.075,x*0.0011);
      q('.te').style.opacity=Math.min(1,x/62);
      Son.tendre(Math.min(1,x/62));
      if(x>62)ouvrir();
      return;
    }
    const r=sac.getBoundingClientRect();
    cib.rx=-((ev.clientY-r.top)/r.height-0.5)*17;
    cib.ry=((ev.clientX-r.left)/r.width-0.5)*28;
    cib.ty=0;cib.sy=1;
  });
  sc.addEventListener('pointerdown',ev=>{
    Son.reveiller();
    if(phase!=='sachet')return;
    prise=true;y0=ev.clientY;Son.froisser(1);
  });
  const lacher=()=>{
    if(!prise)return;prise=false;Son.detendre();
    if(phase==='sachet'){cib.rx=cib.ry=cib.ty=0;cib.sy=1;q('.te').style.opacity=0;}
  };
  sc.addEventListener('pointerup',lacher);
  sc.addEventListener('pointercancel',lacher);
  sc.addEventListener('click',()=>{if(phase==='sachet')ouvrir();});
  const vibre=(m)=>{try{navigator.vibrate&&navigator.vibrate(m);}catch(x){}};

  function ouvrir(){
    if(phase!=='sachet')return;
    phase='ouvre';prise=false;
    Son.reveiller();Son.dechirer();vibre([14,40,26]);
    sac.classList.add('ouv');sac.style.transform='none';
    q('.te').style.opacity=0;
    const ind=q('.ind');if(ind)ind.remove();
    fla.classList.add('on');
    setTimeout(poserLaPile,620);
    setTimeout(()=>{sac.style.display='none';},1900);
  }

  function poserLaPile(){
    pile.innerHTML='';pile.classList.add('la');
    for(let i=0;i<cartes.length;i++){
      const d=document.createElement('div');
      d.className='dc';
      d.style.transform='translate('+((i-5)*0.8)+'px,'+(-i*1.7)+'px) rotate('+((i%3-1)*0.6)+'deg)';
      d.style.animationDelay=(i*70)+'ms';
      d.innerHTML='<img alt="">';d.querySelector('img').src=dosURL();
      pile.appendChild(d);
      setTimeout(()=>Son.glisser(.55),i*70+120);
    }
    cpt.innerHTML='';
    for(let i=0;i<cartes.length;i++)cpt.appendChild(document.createElement('i'));
    cpt.classList.add('la');
    phase='pile';k=0;
    setTimeout(monter,1450);
  }

  const majCompte=()=>[...cpt.children].forEach((d,j)=>{
    d.className=j<k?'vu':(j===k?'ici':'');});

  function monter(){
    if(k>=cartes.length){etaler();return;}
    const n=cartes[k], r=RARETE(n), fin=!!FINE[r], gros=!!GROSSE[r];
    majCompte();
    q('.rev .f img').src=faceURL(n);
    rev.className='rev la'+(fin?' br':'');
    rev.style.setProperty('--ton',TON[r]);
/* LA CARTE PRECEDENTE EST ENCORE RETOURNEE QUAND LA SUIVANTE ARRIVE.
       Retirer « vu » tout seul ramenait rotateY de 180 a 0 EN ANIMANT, et
       comme on le remet a 180 trois dixiemes plus tard, on voyait la carte
       se de-retourner puis se re-retourner — deux ou trois battements pour
       une seule carte. On remet donc la face cachee d'un coup, transition
       coupee, avant de laisser l'animation faire son travail. */
    dedans.style.transition='none';
    dedans.className='in';
    dedans.offsetHeight;
    dedans.style.transition='';
    neufEt.className='neuf'+(nouv.has(n)?' si':'');
    if(k===cartes.length-1&&fin){
      pile.classList.add('fri');setTimeout(()=>pile.classList.remove('fri'),1600);
    }
    const lent=gros?1.55:1;
    rev.style.transition='none';
    rev.style.transform='translateY(26px) scale(.70)';
    rev.offsetHeight;
    rev.style.transition='transform '+(1.05*lent).toFixed(2)+
      's cubic-bezier(.22,.62,.26,1),opacity .5s';
    requestAnimationFrame(()=>{rev.style.transform='none';});
    Son.glisser(1);
    if(gros){rid.classList.add('on');q('.sol').style.opacity=.35;}
    if(fin)setTimeout(()=>Son.montee(gros?1.5:1),260*lent);
    setTimeout(()=>{dedans.classList.add('vu');Son.claquer();},380*lent);
    setTimeout(()=>{
      rev.classList.add('ae');
      Son.carillon(r);
      if(fin){
        ra.classList.remove('on');void ra.offsetWidth;ra.classList.add('on');
        fla.classList.remove('on');void fla.offsetWidth;fla.classList.add('on');
        etincelles(r==='secrete'?20:gros?15:10);
        vibre(gros?[8,60,8,60,18]:[10]);
      }
      cri.textContent=NOM_RAR[r];cri.style.color=TON[r];
      cri.classList.remove('on');void cri.offsetWidth;cri.classList.add('on');
      rev.classList.add('fl');
      if(k===0)ast.classList.add('la');
      phase='lue';
    },1150*lent);
    phase='monte';
  }

  function etincelles(n){
    const r=ec.getBoundingClientRect();
    for(let j=0;j<n;j++){
      const s=document.createElement('i');
      s.className='eti';
      s.style.left=(r.width/2)+'px';s.style.top=(r.height/2)+'px';
      ec.appendChild(s);
      const a=Math.random()*Math.PI*2, d=70+Math.random()*160;
      s.animate([{transform:'translate(0,0) scale(.4)',opacity:0},
        {transform:'translate('+Math.cos(a)*d*0.45+'px,'+Math.sin(a)*d*0.45+'px) scale(1)',
         opacity:.95,offset:.26},
        {transform:'translate('+Math.cos(a)*d+'px,'+(Math.sin(a)*d-100)+'px) scale(.2)',opacity:0}],
        {duration:2400+Math.random()*1400,easing:'cubic-bezier(.2,.5,.3,1)'})
        .onfinish=()=>s.remove();
    }
  }

  rev.addEventListener('pointermove',ev=>{
    if(!rev.classList.contains('br'))return;
    const r=rev.getBoundingClientRect();
    holo.style.backgroundPosition=(((ev.clientX-r.left)/r.width)*210-25)+'% 0';
  });
  let gx=0,glis=false;
  rev.addEventListener('pointerdown',ev=>{
    if(phase!=='lue'){glis=false;return;}
    glis=true;gx=ev.clientX;rev.classList.remove('fl');
  });
  rev.addEventListener('pointermove',ev=>{
    if(!glis||phase!=='lue')return;
    const d=ev.clientX-gx;
    rev.style.transition='none';
    rev.style.transform='translateX('+d+'px) rotate('+(d*0.05)+'deg)';
    if(Math.abs(d)>96){glis=false;rev.style.transition='';ranger();}
  });
  const relache=()=>{if(!glis)return;glis=false;rev.style.transition='';rev.style.transform='none';};
  rev.addEventListener('pointerup',ev=>{
    const vrai=glis, bouge=Math.abs(ev.clientX-gx)>6;
    relache();
    if(vrai&&phase==='lue'&&!bouge)ranger();
  });
  rev.addEventListener('pointercancel',relache);

  function ranger(){
    if(phase!=='lue')return;
    phase='range';
    rev.classList.remove('fl','ae');rev.style.transition='';rev.classList.add('pa');
    ast.classList.remove('la');
    rid.classList.remove('on');q('.sol').style.opacity='';
    Son.glisser(1.1);
    const n=cartes[k];
    const im=document.createElement('img');
    im.src=faceURL(n);im.alt='';
    im.onclick=()=>loupe(n);
    tir.appendChild(im);
    setTimeout(()=>Son.poser(),240);
    const d=pile.lastElementChild;if(d)d.remove();
    setTimeout(()=>{k++;majCompte();monter();},780);
  }

  function etaler(){
    tir.innerHTML='';
    rev.className='rev';pile.classList.remove('la');cpt.classList.remove('la');
    /* LE NOM DE LA DERNIERE RARETE S'EFFACE AVEC LA SCENE : sa ligne restait
       sinon ouverte en haut de l'etalage, avec SECRETE encore affiche. */
    cri.classList.remove('on');cri.style.display='none';
    sc.classList.add('plie');
    eta.innerHTML='';eta.classList.add('la');
    cartes.forEach((n,j)=>{
      const el=document.createElement('div');
      el.className='c';el.style.animationDelay=(j*90)+'ms';
      el.innerHTML='<img alt="">'+(nouv.has(n)?'<u>NOUVELLE</u>':'');
      el.querySelector('img').src=faceURL(n);
      el.onclick=()=>loupe(n);
      eta.appendChild(el);
      setTimeout(()=>Son.glisser(.45),j*90);
    });
    setTimeout(()=>Son.final(),cartes.length*90+200);
    bFin.hidden=false;
    phase='fini';
  }

  function loupe(n){
    lp.querySelector('img').src=faceURL(n);
    lp.querySelector('b').textContent=NOM_CARTE(n)+' · '+
      NUMC(n)+' — touche pour fermer';
    lp.classList.add('la');
  }
  lp.onclick=()=>lp.classList.remove('la');

  hp.onclick=(ev)=>{
    ev.stopPropagation();Son.reveiller();
    const m=!Son.estMuet();Son.muet(m);hp.textContent=m?'✕':'♪';
  };
  bFin.onclick=()=>{
    vivant=false;HW=false;
    try{Son.detendre();}catch(x){}
    cal.remove();
    if(typeof fini==='function')fini();
  };
  return cal;
}

/* =====================================================================
   LE CLASSEUR : les cent cases, dans l'ordre des raretés
   ===================================================================== */
const SECTIONS=[['LES COMMUNES',1,40],['LES RARES',41,62],['LES ULTRA RARES',63,76],
  ['LES EPIC',77,85],['LES LÉGENDAIRES',86,91],['LES EX',92,95],
  ['LES FULL ART',96,98],['LES SECRÈTES',99,100]];

function classeur(col,fermer,ed){
  poserStyle();
  const hw=(ed==='hw'&&PHW()), TOT=hw?50:100;
  const SECS=hw?PHW().SECTIONS.map(([t,a,b])=>[t,a+100,b+100]):SECTIONS;
  const avoir={};(col&&col.cartes||[]).forEach(c=>avoir[c.n]=c.q);
  const n=Object.keys(avoir).length;
  const cal=document.createElement('div');
  cal.id='pkd';
  cal.innerHTML=
    '<div class="ent"><b>LE CLASSEUR</b><i>'+(hw?'Halloween 2026':'Première édition')+'</i></div>'+
    '<div class="cl"><div class="ba"><span><b>'+n+'</b> / '+TOT+' cartes</span>'+
      '<span>'+((col&&col.paquets)||0)+' paquet'+(((col&&col.paquets)||0)>1?'s':'')+' ouvert'+
      (((col&&col.paquets)||0)>1?'s':'')+'</span></div>'+
      '<div class="ja"><i style="width:'+(n/TOT*100)+'%"></i></div>'+
      SECS.map(([t,a,b])=>{
        let h='<h4>'+t+'</h4><div class="gr">';
        for(let i=a;i<=b;i++){
          h+=avoir[i]
            ? '<div class="ca" data-n="'+i+'"><img alt="" src="'+faceURL(i)+'">'+
              (avoir[i]>1?'<u>×'+avoir[i]+'</u>':'')+'</div>'
            : '<div class="ca no"><span>'+NUMC(i).split('/')[0]+'</span></div>';
        }
        return h+'</div>';
      }).join('')+
    '</div>'+
    '<div class="act"><button data-x="1">REFERMER</button></div>'+
    '<div class="lp"><img alt=""><b>Touche l’écran pour fermer</b></div>';
  document.body.appendChild(cal);
  const lp=cal.querySelector('.lp');
  cal.querySelectorAll('.ca[data-n]').forEach(d=>d.onclick=()=>{
    const i=+d.dataset.n;
    lp.querySelector('img').src=faceURL(i);
    lp.querySelector('b').textContent=NOM_CARTE(i)+' · '+NUMC(i);
    lp.classList.add('la');
  });
  lp.onclick=()=>lp.classList.remove('la');
  cal.querySelector('[data-x]').onclick=()=>{cal.remove();if(typeof fermer==='function')fermer();};
  return cal;
}

/* =====================================================================
   LE RAYON, dans le panneau du Bar des Docks
   ctx : { acheter(), collection(), enEuros(c), euros() }
   ===================================================================== */
function rayon(hote,ctx){
  poserStyle();
  /* DEUX EDITIONS SUR LE MEME RAYON : la premiere et Halloween 2026.
     Chacune a sa collection, son paquet et son classeur ; on ne les
     melange jamais. */
  const aHW=!!(ctx.hw&&PHW());
  let ED='1re';try{ED=localStorage.getItem('bdl.pkd.ed')||(aHW?'hw':'1re');}catch(x){ED=aHW?'hw':'1re';}
  if(!aHW)ED='1re';
  const COL={'1re':null,hw:null};
  let occupe=false;
  /* MENU B : la collection d'abord. Un grand cercle, une barre par
     rarete, le paquet, puis les cartes du dernier paquet ouvert. */
  const SEC_1=[['Communes',1,40,'#cdbfa6'],['Rares',41,62,'#9fd0e8'],['Ultra',63,76,'#7fd2ff'],
    ['Epic',77,85,'#c79bff'],['Légend.',86,91,'#ffb070'],['EX',92,95,'#ff8a8a'],
    ['Full Art',96,98,'#f0d48a'],['Secrètes',99,100,'#ffffff']];
  const SEC_H=[['Communes',101,118,'#ff9a2a'],['Rares',119,130,'#e8f0ff'],['Ultra',131,137,'#5ae8ff'],
    ['Epic',138,142,'#c08aff'],['Légend.',143,145,'#ffcf5a'],['EX',146,147,'#ff3a3a'],
    ['Full Art',148,149,'#ff8ae8'],['Secrète',150,150,'#ffe08a']];
  const src=()=>ED==='hw'?ctx.hw:ctx;
  const sac=()=>ED==='hw'?PHW().sachet():(SAC_CACHE||(SAC_CACHE=graverSachet()));
  const peindre=()=>{
    const hw=ED==='hw', col=COL[ED], TOT=hw?50:100, SEC=hw?SEC_H:SEC_1;
    const avoir={};(col&&col.cartes||[]).forEach(c=>avoir[c.n]=c.q);
    const n=(col&&typeof col.total==='number')?col.total:0;
    let dbl=0;Object.values(avoir).forEach(q=>{if(q>1)dbl+=q-1;});
    const der=(col&&Array.isArray(col.derniers))?col.derniers:[];
    const reste=TOT-n, ton=hw?'#ff9a2a':'#e8c47a';
    const bu=document.getElementById('barBulle');
    if(bu&&col&&typeof col.total==='number')bu.textContent=hw
      ?(reste<=0?'« Les cinquante monstres. Même moi, ils me font peur. »'
        :n===0?'« Le carton d’Halloween vient d’arriver. Huit euros, et gare à toi. »'
        :'« Encore '+reste+' monstre'+(reste>1?'s':'')+' à attraper. Ferme bien ton classeur la nuit. »')
      :(reste<=0?'« L’album complet. Respect, mon grand. »'
        :n===0?'« Ton premier paquet ? Six euros, et l’album commence. »'
        :'« Plus que '+reste+' carte'+(reste>1?'s':'')+' et t’as tout l’album, mon grand. »');
    hote.innerHTML=
      (aHW?'<div class="pkb-ed"><button data-ed="hw" class="'+(hw?'on hw':'')+'">🎃 Halloween 2026</button>'+
        '<button data-ed="1re" class="'+(hw?'':'on')+'">Première édition</button></div>':'')+
      '<div class="pkb-hero'+(hw?' hw':'')+'"><div class="pkb-big" style="background:conic-gradient('+ton+' '+(n/TOT*360)+'deg,#2e3036 0)">'+
        '<div><b>'+n+'</b><small>/ '+TOT+'</small></div></div><div class="pkb-secs">'+
        SEC.map(([t,a2,b2,co])=>{let k=0;for(let i=a2;i<=b2;i++)if(avoir[i])k++;const tt=b2-a2+1;
          return '<div class="pkb-sr"><em>'+t+'</em><u><i style="width:'+(k/tt*100)+'%;background:'+co+'"></i></u><s>'+k+'/'+tt+'</s></div>';}).join('')+
      '</div></div>'+
      '<div class="pkb-pk'+(hw?' hw':'')+'"><img alt="" src="'+sac()+'"><div><b>'+(hw?'Paquet Halloween · 10 cartes':'Un paquet de 10 cartes')+'</b>'+
        '<span>'+(hw?'50 monstres neufs. La Citrouille d’Or : 1 sur 250.':'6 communes et 4 tirages. Les secrètes : 1 sur 250.')+'</span>'+
        '<button id="pkdAch" class="pkb-gold'+(hw?' hw':'')+'"'+(occupe?' disabled':'')+'>'+
          (occupe?'Fanny cherche un paquet…':(hw?'Ouvrir · 8,00 €':'Ouvrir · 6,00 €'))+'</button></div></div>'+
      '<div class="pkd-msg" id="pkdMsg"></div>'+
      (der.length?'<h4 class="pkb-h">TES DERNIÈRES CARTES</h4><div class="pkb-rec">'+
        der.map(k=>'<img alt="" data-z="'+k+'" src="'+faceURL(k)+'">').join('')+'</div>':'')+
      '<div class="pkb-row"><button id="pkdCla"><i>📒</i>Classeur</button>'+
        (hw?'<button disabled class="pkb-nm"><i>🏷️</i>Marché<small>après Halloween</small></button>'
           :'<button id="pkdMar"><i>🏷️</i>Marché'+(dbl?' <small>'+dbl+'</small>':'')+'</button>')+'</div>';
    hote.querySelectorAll('[data-ed]').forEach(b=>b.onclick=()=>{
      if(occupe||b.dataset.ed===ED)return;ED=b.dataset.ed;
      try{localStorage.setItem('bdl.pkd.ed',ED);}catch(x){}
      peindre();relire();});
    const ach=hote.querySelector('#pkdAch');
    if(ach)ach.onclick=acheter;
    const ouvrirCl=()=>classeur(COL[ED]||{cartes:[],total:0,paquets:0},null,ED);
    hote.querySelectorAll('[data-z]').forEach(i=>i.onclick=ouvrirCl);
    const cl=hote.querySelector('#pkdCla');
    if(cl)cl.onclick=ouvrirCl;
/* LE MARCHE REND LA MAIN AU RAYON : une carte achetee ou vendue change
       la collection, donc on la relit en refermant. */
    const mr=hote.querySelector('#pkdMar');
    if(mr)mr.onclick=()=>marche(ctx,async()=>{
      try{COL['1re']=await ctx.collection();}catch(x){}
      peindre();
    });
  };
  const dire=(t)=>{const m=hote.querySelector('#pkdMsg');if(m)m.textContent=t||'';};
  const relire=async()=>{const ed=ED;try{COL[ed]=await src().collection();}catch(x){}if(ed===ED)peindre();};
  async function acheter(){
    if(occupe)return;
    const ed=ED;
    occupe=true;peindre();dire('');
    let r=null;
    try{r=await src().acheter();}catch(x){}
    occupe=false;
    if(!r||r.erreur){peindre();dire((r&&r.erreur)||'Le paquet n’a pas pu s’ouvrir. Réessaie.');return;}
    peindre();
    ouvrirPaquet(r.cartes||[],r.nouvelles||[],async()=>{
      try{COL[ed]=await (ed==='hw'?ctx.hw:ctx).collection();}catch(x){}
      peindre();
    },ed);
  }
  peindre();relire();
}

/* le CSS du rayon vit avec celui du bar, il est donc rendu à part */
const CSS_RAYON=`
#bar .bdPage>#pkdVue{background:none;color:#f4ecd8;border-radius:0}
#bar .pkb-hero{display:flex;gap:14px;align-items:center;background:#1e2024;border:1px solid #34363c;border-radius:18px;padding:12px}
#bar .pkb-big{flex:none;width:104px;height:104px;border-radius:50%;display:grid;place-items:center}
#bar .pkb-big div{width:84px;height:84px;border-radius:50%;background:#1e2024;display:grid;place-items:center;align-content:center;text-align:center}
#bar .pkb-big b{font-size:28px;line-height:1;color:#e8c47a}#bar .pkb-big small{font-size:11px;font-weight:700;color:#a8a090}
#bar .pkb-secs{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
#bar .pkb-sr{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#c8bca0}
#bar .pkb-sr em{font-style:normal;width:62px;white-space:nowrap}
#bar .pkb-sr u{flex:1;height:5px;border-radius:3px;background:#2e3036;overflow:hidden;text-decoration:none}
#bar .pkb-sr u i{display:block;height:100%}
#bar .pkb-sr s{text-decoration:none;width:32px;text-align:right;color:#8a8478}
#bar .pkb-pk{display:flex;gap:12px;align-items:center;margin-top:12px;background:linear-gradient(110deg,#2a2016,#1e2024);border:1px solid #5a4628;border-radius:18px;padding:10px 12px}
#bar .pkb-pk img{flex:none;width:72px;border-radius:5px;transform:rotate(-5deg);box-shadow:0 6px 12px rgba(0,0,0,.5)}
#bar .pkb-pk>div{flex:1;min-width:0}#bar .pkb-pk b{font-size:16px;display:block;line-height:1.1;color:#f4ecd8}
#bar .pkb-pk span{font-size:12px;color:#a8a090;font-weight:700;display:block;margin:2px 0 8px;line-height:1.25}
#bar .pkb-gold{display:block;width:100%;border:0;border-radius:14px;padding:9px 8px;font:800 15px 'Baloo 2',system-ui,sans-serif;color:#1c1e22;background:linear-gradient(#f0d48a,#c9a24a);box-shadow:0 4px 0 #8a6a2a}
#bar .pkb-gold:active{transform:translateY(3px);box-shadow:0 1px 0 #8a6a2a}
#bar .pkb-gold[disabled]{opacity:.55}
#bar .pkb-h{margin:12px 2px 6px;font-size:12px;letter-spacing:1.5px;color:#a8946a}
#bar .pkb-rec{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
#bar .pkb-rec img{flex:none;height:118px;border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,.5)}
#bar .pkb-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
#bar .pkb-row button{border:1px solid #3a3c42;background:#1e2024;color:#f4ecd8;border-radius:14px;padding:10px;font:800 14px 'Baloo 2',system-ui,sans-serif;display:flex;align-items:center;gap:8px;justify-content:center}
#bar .pkb-row button i{font-style:normal;font-size:20px}#bar .pkb-row button small{color:#e8c47a;font-size:12px}
#bar .pkb-ed{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;background:#1a1b1e;border:1px solid #2e3036;border-radius:14px;padding:4px}
#bar .pkb-ed button{border:0;border-radius:10px;padding:7px 4px;font:800 13px 'Baloo 2',system-ui,sans-serif;background:none;color:#a8a090}
#bar .pkb-ed button.on{background:#2e3036;color:#f4ecd8}#bar .pkb-ed button.on.hw{background:linear-gradient(#3a1a4a,#2a1030);color:#ffb04a;box-shadow:0 0 12px rgba(255,138,26,.25)}
#bar .pkb-hero.hw{border-color:#5a2a6a;background:linear-gradient(160deg,#241430,#1e2024)}#bar .pkb-hero.hw .pkb-big b{color:#ff9a2a}
#bar .pkb-pk.hw{background:linear-gradient(110deg,#2a1030,#1e2024);border-color:#7a3a8a}
#bar .pkb-gold.hw{background:linear-gradient(#ffb04a,#e8761e);box-shadow:0 4px 0 #8a3a0a}
#bar .pkb-row button.pkb-nm{opacity:.5;flex-direction:row}#bar .pkb-row button.pkb-nm small{color:#a8a090;font-size:10.5px}
#bar .pkd-msg{margin-top:8px;font:700 12px 'Baloo 2',system-ui,sans-serif;color:#e8a44a;text-align:center;min-height:0}
#bar .pkd-msg:empty{display:none}
@media(min-width:720px){#bar .pkb-rec img{height:150px}}
`;


/* ======= pokedock_marche.js ======= */
/* =====================================================================
   LE MARCHE AUX CARTES

   On ne vend que ses doubles, et la carte quitte le classeur des qu'elle
   est en vitrine. Tout le reste — qui a quoi, combien ça coute, qui
   touche quoi — se decide en base : ici on affiche, on demande, et on
   recharge ce que le serveur repond.
   ===================================================================== */
const CSS_MAR=`
#pkdm{position:fixed;inset:0;z-index:42;display:flex;flex-direction:column;
  align-items:center;padding:14px 12px calc(20px + env(safe-area-inset-bottom,0px));
  background:radial-gradient(80% 50% at 50% 2%,#2b2338 0%,rgba(43,35,56,0) 62%),#13111a;
  color:#f2ece0;font-family:Georgia,serif;overflow-y:auto;-webkit-overflow-scrolling:touch}
#pkdm .ent{text-align:center;margin-bottom:10px}
#pkdm .ent b{display:block;font:900 12px Arial,sans-serif;letter-spacing:.3em;color:#e8c877}
#pkdm .ent i{display:block;font-size:11.5px;color:rgba(242,236,224,.5);margin-top:4px}
#pkdm .co{width:100%;max-width:560px}
#pkdm .bo{display:flex;justify-content:space-between;align-items:baseline;
  background:#0f2742;border:1px solid rgba(201,162,74,.3);border-radius:10px;
  padding:9px 12px;margin-bottom:11px}
#pkdm .bo small{font:700 9px Arial,sans-serif;letter-spacing:1.6px;color:#c9a24a}
#pkdm .bo b{font:900 17px Georgia,serif;color:#f4ead2}
/* .ong PORTE UN FOND CREME dans la feuille commune du jeu : le
   conteneur heritait d'un bandeau clair sur l'ecran sombre du marche.
   Meme bug qu'au tableau du port et que chez Madeleine. */
#pkdm .mOng{display:flex;gap:6px;margin-bottom:11px}
#pkdm .mOng button{flex:1;font:900 9px Arial,sans-serif;letter-spacing:1.3px;
  border-radius:8px;padding:10px 4px;border:1px solid rgba(255,255,255,.14);
  background:transparent;color:rgba(242,236,224,.5)}
#pkdm .mOng button.on{background:#e8c877;color:#241a0a;border-color:#e8c877}
#pkdm h4{font:900 9px Arial,sans-serif;letter-spacing:2.2px;
  color:rgba(242,236,224,.38);margin:16px 0 7px}
#pkdm .vide{text-align:center;font-style:italic;font-size:12px;
  color:rgba(242,236,224,.38);padding:22px 10px;line-height:1.6}

#pkdm .an{display:flex;gap:9px;align-items:center;padding:9px 0;
  border-top:1px solid rgba(255,255,255,.055)}
#pkdm .an img{width:46px;border-radius:4px;flex:none;box-shadow:0 4px 11px rgba(0,0,0,.5)}
#pkdm .an .nf{flex:1;min-width:0}
#pkdm .an .nf b{display:block;font:400 12.5px Georgia,serif;color:#f4ead2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pkdm .an .nf small{display:block;font-size:10px;color:rgba(242,236,224,.5);margin-top:2px}
#pkdm .an .nf u{font:900 7px Arial,sans-serif;letter-spacing:1px;text-decoration:none;
  border-radius:999px;padding:2px 5px;margin-right:4px;color:#1a1208}
#pkdm .an .ct{display:block;font-size:9.5px;color:#9fd0e8;margin-top:2px}
#pkdm .an .ct s{text-decoration:none;color:rgba(242,236,224,.4)}
#pkdm .an .px{text-align:right;flex:none}
#pkdm .an .px b{display:block;font:900 14px Georgia,serif;color:#e8c877}
#pkdm .an .px button{margin-top:4px;font:900 8.5px Arial,sans-serif;letter-spacing:1.1px;
  border:0;border-radius:7px;padding:7px 10px;background:#c9a24a;color:#1a1208}
#pkdm .an .px button.v{background:transparent;color:rgba(242,236,224,.5);
  border:1px solid rgba(255,255,255,.18)}
#pkdm .an .px button.pas{background:rgba(255,255,255,.07);color:rgba(242,236,224,.3)}

#pkdm .ve{background:#0f2742;border:1px solid rgba(201,162,74,.3);
  border-radius:10px;padding:11px;margin-top:4px}
#pkdm .ve .te{display:flex;gap:10px;align-items:center;margin-bottom:10px}
#pkdm .ve .te img{width:56px;border-radius:5px}
#pkdm .ve .te b{display:block;font:400 13px Georgia,serif;color:#f4ead2}
#pkdm .ve .te small{display:block;font-size:10px;color:#a8c4d8;margin-top:3px}
#pkdm .ve label{display:block;font:700 9px Arial,sans-serif;letter-spacing:1.4px;
  color:#c9a24a;margin-bottom:5px}
#pkdm .ve .ch{display:flex;align-items:center;gap:8px;background:#0a1b2e;
  border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 11px}
#pkdm .ve .ch input{flex:1;background:none;border:0;color:#f4ead2;outline:none;
  font:900 19px Georgia,serif;width:100%;-moz-appearance:textfield}
#pkdm .ve .ch input::-webkit-outer-spin-button,
#pkdm .ve .ch input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
#pkdm .ve .ch span{font:900 17px Georgia,serif;color:#e8c877}
#pkdm .ve .det{margin-top:9px;font-size:11px;color:#a8c4d8;line-height:1.7}
#pkdm .ve .det b{color:#f4ead2}
#pkdm .ve .det .cm{color:#e08a7a}
#pkdm .ve .ok{width:100%;margin-top:10px;border:0;border-radius:9px;padding:12px;
  background:#c9a24a;color:#1a1208;font:900 10.5px Arial,sans-serif;letter-spacing:1.5px}
#pkdm .ve .ok[disabled]{opacity:.45}

#pkdm .dbl{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:7px}
#pkdm .dbl .c{position:relative;aspect-ratio:300/420;border-radius:6px;overflow:hidden;
  box-shadow:0 4px 12px rgba(0,0,0,.5);border:2px solid transparent}
#pkdm .dbl .c.on{border-color:#e8c877}
#pkdm .dbl .c img{width:100%;height:100%;display:block}
#pkdm .dbl .c u{position:absolute;bottom:3px;right:3px;font:900 7.5px Arial,sans-serif;
  background:rgba(0,0,0,.65);color:#e8c877;border-radius:999px;padding:2px 5px;
  text-decoration:none}

/* ---- LA REPRISE ---- */
#pkdm .rp{background:#0f2742;border:1px solid rgba(201,162,74,.3);border-radius:10px;
  padding:11px 12px;margin-bottom:11px}
#pkdm .rp p{margin:0;font-size:11.5px;line-height:1.6;color:#a8c4d8}
#pkdm .rp p b{color:#f4ead2}
#pkdm .rp .ja{display:flex;justify-content:space-between;align-items:baseline;
  margin-top:9px;font:700 9px Arial,sans-serif;letter-spacing:1.4px;color:#c9a24a}
#pkdm .rp .ja s{text-decoration:none;color:rgba(242,236,224,.45)}
#pkdm .rp .bar{height:4px;border-radius:3px;background:rgba(255,255,255,.1);
  margin-top:5px;overflow:hidden}
#pkdm .rp .bar u{display:block;height:100%;background:#c9a24a}
#pkdm .tv{width:100%;margin-top:10px;border:0;border-radius:9px;padding:13px;
  background:#c9a24a;color:#1a1208;font:900 10.5px Arial,sans-serif;letter-spacing:1.4px}
#pkdm .tv[disabled]{opacity:.4}
#pkdm .rl{display:flex;gap:9px;align-items:center;padding:9px 0;
  border-top:1px solid rgba(255,255,255,.055)}
#pkdm .rl img{width:40px;border-radius:4px;flex:none;box-shadow:0 3px 9px rgba(0,0,0,.5)}
#pkdm .rl .nf{flex:1;min-width:0}
#pkdm .rl .nf b{display:block;font:400 12px Georgia,serif;color:#f4ead2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pkdm .rl .nf small{display:block;font-size:9.5px;color:rgba(242,236,224,.5);margin-top:2px}
#pkdm .rl .nf u{font:900 7px Arial,sans-serif;letter-spacing:1px;text-decoration:none;
  border-radius:999px;padding:2px 5px;margin-right:4px;color:#1a1208}
#pkdm .rl .nf .av{display:block;font-size:9.5px;color:#e08a7a;margin-top:2px}
#pkdm .rl .bt{flex:none;display:flex;flex-direction:column;gap:4px;align-items:flex-end}
#pkdm .rl .bt b{font:900 12.5px Georgia,serif;color:#e8c877}
#pkdm .rl .bt span{display:flex;gap:4px}
#pkdm .rl .bt button{border:0;border-radius:7px;padding:7px 9px;min-height:32px;
  background:#c9a24a;color:#1a1208;font:900 8px Arial,sans-serif;letter-spacing:.8px}
#pkdm .rl .bt button.s{background:rgba(255,255,255,.08);color:rgba(242,236,224,.7)}
#pkdm .msg{text-align:center;font-size:11.5px;color:#e8a44a;min-height:16px;margin-top:9px}
#pkdm .msg.ok{color:#7ad6a0}
#pkdm .act{display:flex;gap:9px;justify-content:center;margin-top:16px}
#pkdm .act button{font:900 11px Arial,sans-serif;letter-spacing:1.5px;border-radius:999px;
  padding:12px 22px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);
  color:#f2ece0}
#pkdm .lp{position:fixed;inset:0;z-index:70;display:none;background:rgba(7,6,10,.92);
  align-items:center;justify-content:center;padding:22px}
#pkdm .lp.la{display:flex}
#pkdm .lp img{max-height:84vh;max-width:90vw;border-radius:12px}
`;

const TON_M={commune:'#cdbfa6',rare:'#9fd0e8',ultra:'#7fd2ff',epic:'#c79bff',
  legend:'#ffd978',ex:'#ff9d62',fullart:'#8fe8ff',secrete:'#ff9ae0'};
const NOM_M={commune:'COMMUNE',rare:'RARE',ultra:'ULTRA',epic:'EPIC',
  legend:'LÉGEND.',ex:'EX',fullart:'FULL ART',secrete:'SECRÈTE'};
const eur=(c)=>((c||0)/100).toLocaleString('fr-FR',
  {minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const eurCourt=(c)=>Math.round((c||0)/100).toLocaleString('fr-FR')+' €';

/* ctx : { marche(), vendre(n,prix), retirer(id), acheterAnnonce(id),
           reprendre(n,k), reprendreTout(), majEuros(c) }
   ACHETER UNE ANNONCE N'EST PAS ACHETER UN PAQUET : le rayon et le
   marche partagent le meme ctx, et deux « acheter » dans le meme objet
   auraient fait ouvrir un paquet a chaque clic sur une carte. */
function marche(ctx,fermer){
  poserStyle();
  if(!document.getElementById('cssPkdMar')){
    const st=document.createElement('style');
    st.id='cssPkdMar';st.textContent=CSS_MAR;document.head.appendChild(st);
  }
  const cal=document.createElement('div');
  cal.id='pkdm';
  cal.innerHTML=
    '<div class="ent"><b>LE MARCHÉ AUX CARTES</b>'+
      '<i>Première édition · les prix sont ceux que les joueurs demandent</i></div>'+
    '<div class="co">'+
      '<div class="bo"><small>TA BOURSE</small><b id="mBo">—</b></div>'+
      '<div class="mOng"><button data-g="achat" class="on">ACHETER</button>'+
        '<button data-g="vente">VENDRE</button>'+
        '<button data-g="reprise">LA REPRISE</button></div>'+
      '<div id="mVue"><div class="vide">On ouvre les vitrines…</div></div>'+
      '<div class="msg" id="mMsg"></div>'+
      '<div class="act"><button data-x="1">REFERMER</button></div>'+
    '</div>'+
    '<div class="lp"><img alt=""></div>';
  document.body.appendChild(cal);

  const q=(s)=>cal.querySelector(s);
  const lp=q('.lp');
  lp.onclick=()=>lp.classList.remove('la');
  q('[data-x]').onclick=()=>{cal.remove();if(typeof fermer==='function')fermer();};

  let D=null, ONG='achat', SEL=null, occupe=false;
  const dire=(t,bon)=>{const m=q('#mMsg');m.textContent=t||'';m.className='msg'+(bon?' ok':'');};

  cal.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{
    ONG=b.dataset.g;
    cal.querySelectorAll('[data-g]').forEach(x=>x.classList.toggle('on',x.dataset.g===ONG));
    dire('');peindre();
  });

  const loupe=(n)=>{lp.querySelector('img').src=faceURL(n);lp.classList.add('la');};

/* UNE LIGNE D'ANNONCE. L'ecart a la cote est la vraie information : un
     prix seul ne dit pas s'il est bon. */
  const ligne=(a,mien)=>{
    const r=RARETE(a.n);
    const ec=a.cote?Math.round(100*(a.prix-a.cote)/a.cote):0;
    const trop=!mien&&D&&a.prix>(D.euros||0);
    return '<div class="an"><img alt="" src="'+faceURL(a.n)+'" data-z="'+a.n+'">'+
      '<div class="nf"><b>'+NOM_CARTE(a.n)+'</b>'+
      '<small><u style="background:'+TON_M[r]+'">'+NOM_M[r]+'</u>'+
        ('00'+a.n).slice(-3)+'/100 · '+(mien?'ton annonce':(a.vendeur||'un docker'))+'</small>'+
      (a.cote?'<span class="ct">cote '+eurCourt(a.cote)+
        (a.reelle?'':' <s>(de départ)</s>')+
        (ec?' · '+(ec>0?'+':'')+ec+' %':'')+'</span>':'')+
      '</div>'+
      '<div class="px"><b>'+eur(a.prix)+'</b>'+
      '<button class="'+(mien?'v':(trop?'pas':''))+'" data-'+(mien?'ret':'ach')+'="'+a.id+'"'+
        (trop?' disabled':'')+'>'+
        (mien?'RETIRER':(trop?'TROP CHER':'ACHETER'))+'</button></div></div>';
  };

  function peindre(){
    const V=q('#mVue');
    q('#mBo').textContent=D?eur(D.euros):'—';
    if(!D){V.innerHTML='<div class="vide">On ouvre les vitrines…</div>';return;}

    /* =================================================================
       LA REPRISE
       Le marche aux cartes ne marche que si quelqu'un veut CE double-la.
       Les communes, personne n'en veut : chaque joueur en a douze. Elles
       restaient donc au classeur pour toujours, et ouvrir un paquet
       finissait par ne plus produire que des cartes mortes.
       Le marchand, lui, reprend tout, tout de suite, au tarif de la
       maison. Il paie BEAUCOUP moins que les joueurs — c'est le prix de
       ne pas attendre, et c'est ce qui fait que le marche entre joueurs
       reste le bon endroit pour une belle carte.
       ================================================================= */
    if(ONG==='reprise'){
      const dbl=(D.doubles||[]);
      const pla=D.reprise_plafond||5000, jou=D.reprise_jour||0;
      const resteJour=Math.max(0,pla-jou);
      /* ce que « tout vendre » rapporterait : communes et rares seulement */
      let totTout=0, nbTout=0;
      dbl.forEach(d=>{ if(d.n<=62){ totTout+=(d.reprise||0)*(d.q-1); nbTout+=d.q-1; } });
      const totBorne=Math.min(totTout,resteJour);
      let h='<div class="rp"><p><b>Les communes et les rares ne trouvent jamais '+
        'preneur au march\u00e9 : tout le monde en a.</b> Le marchand, lui, les '+
        'reprend quand m\u00eame \u2014 quelques centimes la carte. C\u2019est peu, '+
        'et c\u2019est normal : un paquet co\u00fbte six euros, et le marchand ne '+
        'peut pas rendre plus qu\u2019il n\u2019a \u00e9t\u00e9 mis. Pour une belle '+
        'carte, passe par <b>VENDRE</b> : l\u00e0 c\u2019est un joueur qui paie, '+
        'et il paie la cote.</p>'+
        '<div class="ja"><span>SA CAISSE DU JOUR</span>'+
          '<s>'+eur(jou)+' / '+eurCourt(pla)+'</s></div>'+
        '<div class="bar"><u style="width:'+Math.round(jou/pla*100)+'%"></u></div>'+
        '<button class="tv" id="rTout"'+((nbTout&&totBorne)?'':' disabled')+'>'+
          (nbTout?('TOUT VENDRE \u00b7 '+nbTout+' CARTE'+(nbTout>1?'S':'')+' \u00b7 '+eur(totBorne))
                 :'AUCUN DOUBLE COMMUN NI RARE')+
        '</button>'+
        '<p style="margin-top:7px;font-size:10.5px;color:rgba(242,236,224,.45)">'+
        'Ce bouton ne touche QUE les communes et les rares. Le reste se vend '+
        'carte par carte, en regardant la cote.</p></div>';
      if(!dbl.length){
        h+='<div class="vide">Tu n\u2019as aucun double.<br>'+
           'Ouvre des paquets : les cartes en trop finissent ici.</div>';
      }else{
        h+='<h4>TES DOUBLES \u2014 '+dbl.length+' CARTE'+(dbl.length>1?'S':'')+'</h4>'+
          dbl.map(d=>{
            const r=RARETE(d.n), pe=d.reprise||0, tous=d.q-1;
            /* L'AVERTISSEMENT NE SERT QU'EN HAUT DU CLASSEUR. Le tarif
               est adosse au prix du paquet, la cote a ce qu'un
               collectionneur accepte de payer : l'ecart est donc
               enorme PARTOUT, y compris sur une commune. Affiche a
               chaque ligne, le message devenait du bruit et donnait
               l'impression qu'on se faisait avoir a tous les coups.
               Or une commune ne se vendra jamais au marche : personne
               n'en veut. On ne previent donc que la ou une vente
               entre joueurs est vraiment possible — a partir de
               l'ultra. */
            const fois=(d.n>=63&&pe>0&&d.cote)?Math.round(d.cote/pe):0;
            return '<div class="rl"><img alt="" src="'+faceURL(d.n)+'" data-z="'+d.n+'">'+
              '<div class="nf"><b>'+NOM_CARTE(d.n)+'</b>'+
              '<small><u style="background:'+TON_M[r]+'">'+NOM_M[r]+'</u>'+
                '\u00d7'+d.q+' \u00b7 cote '+eurCourt(d.cote||0)+'</small>'+
              (fois>=8?'<span class="av">un joueur t\u2019en donnerait '+fois+' fois '+
                 'plus \u2014 mets-la plut\u00f4t en vitrine</span>':'')+
              '</div>'+
              '<div class="bt"><b>'+eur(pe)+'</b><span>'+
                '<button class="s" data-r1="'+d.n+'">\u00d71</button>'+
                (tous>1?'<button data-rt="'+d.n+'" data-k="'+tous+'">\u00d7'+tous+'</button>':'')+
              '</span></div></div>';
          }).join('');
      }
      V.innerHTML=h;
      V.querySelectorAll('[data-z]').forEach(i=>i.onclick=()=>loupe(+i.dataset.z));
      V.querySelectorAll('[data-r1]').forEach(b=>b.onclick=()=>reprendre(+b.dataset.r1,1));
      V.querySelectorAll('[data-rt]').forEach(b=>b.onclick=()=>reprendre(+b.dataset.rt,+b.dataset.k));
      const bt=q('#rTout');if(bt&&!bt.disabled)bt.onclick=()=>reprendreTout();
      return;
    }

    if(ONG==='achat'){
      const autres=(D.annonces||[]).filter(a=>!a.mien);
      V.innerHTML=
        '<h4>'+autres.length+' CARTE'+(autres.length>1?'S':'')+' EN VENTE</h4>'+
        (autres.length?autres.map(a=>ligne(a,false)).join('')
          :'<div class="vide">Personne ne vend pour l’instant.<br>'+
           'Reviens quand les classeurs se seront remplis.</div>');
    }else{
      const dbl=(D.doubles||[]), mien=(D.miennes||[]);
      let h='';
      if(!dbl.length){
        h+='<div class="vide">Tu n’as aucun double à vendre.<br>'+
           'Ouvre des paquets : les cartes en trop finissent ici.</div>';
      }else{
        h+='<h4>TES DOUBLES — CHOISIS-EN UN</h4><div class="dbl">'+
          dbl.map(d=>'<div class="c'+(SEL&&SEL.n===d.n?' on':'')+'" data-d="'+d.n+'">'+
            '<img alt="" src="'+faceURL(d.n)+'"><u>×'+d.q+'</u></div>').join('')+'</div>';
        if(SEL){
          const c=SEL.cote||0;
          h+='<div class="ve"><div class="te"><img alt="" src="'+faceURL(SEL.n)+'">'+
            '<div><b>'+NOM_CARTE(SEL.n)+'</b><small>'+('00'+SEL.n).slice(-3)+'/100 · '+
            NOM_M[RARETE(SEL.n)]+' · tu en as '+SEL.q+'</small></div></div>'+
            '<label>TON PRIX</label>'+
            '<div class="ch"><input id="mPx" type="number" inputmode="numeric" min="1" '+
              'value="'+Math.max(1,Math.round(c/100))+'"><span>€</span></div>'+
            '<div class="det" id="mDet"></div>'+
            '<button class="ok" id="mOk">METTRE EN VENTE · 7 JOURS</button></div>';
        }
      }
      h+='<h4>TES ANNONCES — '+mien.length+' / 10</h4>'+
        (mien.length?mien.map(a=>ligne(Object.assign({},a,
            {cote:(dbl.find(d=>d.n===a.n)||{}).cote}),true)).join('')
          :'<div class="vide">Aucune annonce en cours.</div>');
      V.innerHTML=h;
    }

    V.querySelectorAll('[data-z]').forEach(i=>i.onclick=()=>loupe(+i.dataset.z));
    V.querySelectorAll('[data-d]').forEach(d=>d.onclick=()=>{
      const n=+d.dataset.d;
      SEL=(SEL&&SEL.n===n)?null:(D.doubles||[]).find(x=>x.n===n);
      dire('');peindre();
    });
    V.querySelectorAll('[data-ach]').forEach(b=>b.onclick=()=>acheter(+b.dataset.ach));
    V.querySelectorAll('[data-ret]').forEach(b=>b.onclick=()=>retirer(+b.dataset.ret));
    const px=q('#mPx');
    if(px){
      const maj=()=>{
        const e2=Math.max(0,Math.round(parseFloat(px.value||'0')*100));
        const com=Math.round(e2*0.08);
        q('#mDet').innerHTML=
          'Cote actuelle : <b>'+eurCourt(SEL.cote||0)+'</b><br>'+
          'Commission de la maison (8 %) : <span class="cm">− '+eur(com)+'</span><br>'+
          'Tu touches : <b>'+eur(e2-com)+'</b> quand elle part';
        const ok=q('#mOk');if(ok)ok.disabled=!(e2>=100);
      };
      px.oninput=maj;maj();
      q('#mOk').onclick=()=>vendre(SEL.n,Math.round(parseFloat(px.value||'0')*100));
    }
  }

  async function recharger(){
    try{D=await ctx.marche();}catch(x){D=null;}
    if(D&&typeof D.euros==='number'&&ctx.majEuros)ctx.majEuros(D.euros);
    if(SEL)SEL=(D&&D.doubles||[]).find(x=>x.n===SEL.n)||null;
    peindre();
  }
  const agir=async(p,bon)=>{
    if(occupe)return;occupe=true;dire('…');
    let r=null;try{r=await p;}catch(x){}
    occupe=false;
    if(!r||r.erreur){dire((r&&r.erreur)||'Le marché n’a pas répondu. Réessaie.');return;}
    await recharger();dire(bon(r),true);
  };
  const acheter=(id)=>agir(ctx.acheterAnnonce(id),
    r=>'Achetée : '+NOM_CARTE(r.numero)+' pour '+eur(r.prix)+'.');
  const retirer=(id)=>agir(ctx.retirer(id),
    r=>NOM_CARTE(r.numero)+' est revenue dans ton classeur.');
  const vendre=(n,p)=>agir(ctx.vendre(n,p),
    r=>NOM_CARTE(r.numero)+' est en vitrine pour '+eur(r.prix)+'.');
  const reprendre=(n,k)=>agir(ctx.reprendre(n,k),
    r=>r.combien+' \u00d7 '+NOM_CARTE(r.numero)+' \u2014 le marchand te donne '+eur(r.gagne)+'.');
  const reprendreTout=()=>agir(ctx.reprendreTout(),
    r=>r.cartes+' carte'+(r.cartes>1?'s':'')+' reprise'+(r.cartes>1?'s':'')+
       ' \u2014 '+eur(r.gagne)+' dans ta bourse.');

  recharger();
  return cal;
}

window.Pokedock={
  rayon:rayon, classeur:classeur, ouvrirPaquet:ouvrirPaquet, marche:marche,
  carte:faceURL, dos:dosURL, sachet:sacURL, css:CSS_RAYON,
  nom:NOM_CARTE, rarete:RARETE, total:100
};

})();
