/* =====================================================================
   LES MEUBLES DE L'APPART — le catalogue, les murs, les sols, et les
   dessins. Partagé par le lieu (appart.js) et l'éditeur (appartdeco.js).
   Chaque meuble se dessine une fois, en double résolution, vu de trois
   quarts comme le reste du port ; ses pieds sont en bas au milieu.
   Les prix sont redits par le serveur (appart_prix) : c'est lui qui encaisse.
   ===================================================================== */
(()=>{
if(window.MEUBLES)return;
const lin=(g,x0,y0,x1,y1,st)=>{const r=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>r.addColorStop(o,c));return r;};
const rad=(g,x,y,r0,r1,st)=>{const r=g.createRadialGradient(x,y,r0,x,y,r1);st.forEach(([o,c])=>r.addColorStop(o,c));return r;};
const rr=(g,x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);};
const ombre=(g,cx,cy,rx,ry,a)=>{g.fillStyle='rgba(20,10,0,'+(a||.28)+')';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();};
const bois=(g,x0,x1,c)=>lin(g,x0,0,x1,0,[[0,c[0]],[.5,c[1]],[1,c[0]]]);
const CHENE=['#8a5a2a','#c8904a'],NOYER=['#4a2a14','#7a4a24'],BLANC=['#d8d2c4','#fffaf0'];
const OR=g=>lin(g,0,0,0,1,[[0,'#fff2b8'],[1,'#c8922a']]);void OR;
/* ---------- les dessins ---------- */
function canape(c1,c2){return (g,w,h)=>{ombre(g,w/2,h-3,w/2-2,6);
  for(const x of [8,w-12])g.fillStyle='#3a2410',g.fillRect(x,h-10,4,8);
  g.fillStyle=lin(g,0,6,0,30,[[0,c1],[1,c2]]);rr(g,4,6,w-8,30,10);g.fill();
  g.fillStyle='rgba(0,0,0,.12)';for(let k=1;k<3;k++)g.fillRect(4+k*(w-8)/3-1,10,2,22);
  g.fillStyle=lin(g,0,28,0,h-8,[[0,c1],[1,c2]]);rr(g,2,28,w-4,h-38,8);g.fill();
  g.fillStyle='rgba(255,255,255,.14)';for(let k=0;k<3;k++){rr(g,8+k*(w-16)/3,30,(w-16)/3-4,8,4);g.fill();}
  g.fillStyle=lin(g,0,18,0,h-8,[[0,c1],[1,c2]]);rr(g,0,18,12,h-26,6);g.fill();rr(g,w-12,18,12,h-26,6);g.fill();
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(2,20,4,h-32);
  g.fillStyle='#f6e6c0';rr(g,16,14,16,14,4);g.fill();g.fillStyle='rgba(0,0,0,.08)';g.fillRect(16,24,16,4);};}
function fauteuil(g,w,h){ombre(g,w/2,h-3,w/2-2,5);g.fillStyle='#3a2410';g.fillRect(6,h-9,3,7);g.fillRect(w-9,h-9,3,7);
  g.fillStyle=lin(g,0,2,0,26,[[0,'#f0b83a'],[1,'#b8801c']]);rr(g,4,2,w-8,28,12);g.fill();
  g.fillStyle=lin(g,0,24,0,h-8,[[0,'#f0b83a'],[1,'#a8701c']]);rr(g,2,24,w-4,h-32,8);g.fill();
  g.fillStyle='rgba(255,255,255,.2)';rr(g,8,26,w-16,6,3);g.fill();g.fillStyle='rgba(0,0,0,.12)';g.fillRect(w/2-.5,6,1,18);}
function tableBasse(g,w,h){ombre(g,w/2,h-3,w/2-2,5);g.fillStyle=bois(g,0,w,NOYER);for(const x of [5,w-9])g.fillRect(x,8,4,h-10);
  g.fillStyle=lin(g,0,0,0,10,[[0,'#a86a3a'],[1,'#6a3a14']]);rr(g,0,0,w,10,3);g.fill();g.fillStyle='rgba(255,255,255,.2)';g.fillRect(4,2,w-8,2);
  g.fillStyle='#f6f2ea';rr(g,w*.55,-5,12,6,2);g.fill();g.fillStyle='#d83a3a';g.beginPath();g.arc(w*.3,-2,3,0,7);g.fill();}
function tapisRond(g,w,h){g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(w/2,h/2+2,w/2,h/2,0,0,7);g.fill();
  g.fillStyle='#f2e6cc';g.beginPath();g.ellipse(w/2,h/2,w/2,h/2,0,0,7);g.fill();
  for(let k=1;k<5;k++){g.strokeStyle=k%2?'#c84a2a':'#2a3a5a';g.lineWidth=2.5;g.beginPath();g.ellipse(w/2,h/2,w/2-k*8,h/2-k*5,0,0,7);g.stroke();}
  g.fillStyle='#c84a2a';for(let k=0;k<12;k++){const a=k/12*Math.PI*2;g.beginPath();g.moveTo(w/2+Math.cos(a)*w*.38,h/2+Math.sin(a)*h*.38);g.lineTo(w/2+Math.cos(a+.1)*w*.3,h/2+Math.sin(a+.1)*h*.3);g.lineTo(w/2+Math.cos(a-.1)*w*.3,h/2+Math.sin(a-.1)*h*.3);g.fill();}}
function tapisPersan(g,w,h){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(2,3,w-2,h-2);g.fillStyle='#7a1420';g.fillRect(0,0,w,h);
  g.strokeStyle='#e8c060';g.lineWidth=2;g.strokeRect(5,5,w-10,h-10);g.fillStyle='#1a2a5a';g.fillRect(10,10,w-20,h-20);
  g.fillStyle='#a81c2a';g.beginPath();g.moveTo(w/2,14);g.lineTo(w-22,h/2);g.lineTo(w/2,h-14);g.lineTo(22,h/2);g.fill();g.strokeStyle='#e8c060';g.lineWidth=1;g.stroke();
  g.fillStyle='#e8c060';g.beginPath();g.arc(w/2,h/2,6,0,7);g.fill();for(let x=2;x<w;x+=4){g.fillStyle='#f6ead0';g.fillRect(x,-3,1.5,3);g.fillRect(x,h,1.5,3);}}
function meubleTv(g,w,h){ombre(g,w/2,h-3,w/2-2,5);g.fillStyle=bois(g,0,w,CHENE);rr(g,2,h-26,w-4,22,3);g.fill();
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;g.strokeRect(6,h-22,w/2-8,14);g.strokeRect(w/2+2,h-22,w/2-8,14);
  g.fillStyle='#16161c';rr(g,8,2,w-16,h-32,3);g.fill();const sc=lin(g,0,5,0,h-32,[[0,'#2a4a8a'],[.5,'#5a8ad8'],[1,'#1a2a5a']]);g.fillStyle=sc;g.fillRect(11,5,w-22,h-38);
  g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(11,5);g.lineTo(40,5);g.lineTo(18,h-33);g.lineTo(11,h-33);g.fill();g.fillStyle='#16161c';g.fillRect(w/2-6,h-30,12,4);}
function biblio(g,w,h){ombre(g,w/2,h-2,w/2,5);g.fillStyle=bois(g,0,w,NOYER);g.fillRect(0,0,w,h-2);g.fillStyle='#2a1408';g.fillRect(4,4,w-8,h-10);
  const C=['#c84a2a','#2a5a9a','#e8b83a','#3a8a4a','#8a3a8a','#f6ead0','#1a1a22'];for(let r=0;r<4;r++){const y=4+r*((h-10)/4);g.fillStyle=bois(g,0,w,NOYER);g.fillRect(4,y+(h-10)/4-3,w-8,3);
    let x=6;let k=r*3;while(x<w-10){const bw=4+((k*7)%5),bh=(h-10)/4-6-((k*3)%5);g.fillStyle=C[k%C.length];g.fillRect(x,y+(h-10)/4-3-bh,bw,bh);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x+1,y+(h-10)/4-bh,bw-2,1.5);x+=bw+1;k++;if(k%9===4){x+=6;}}}}
function lampadaire(g,w,h){ombre(g,w/2,h-2,8,3);g.fillStyle='#2a2a30';g.beginPath();g.ellipse(w/2,h-4,8,3,0,0,7);g.fill();g.fillRect(w/2-1,22,2,h-26);
  g.fillStyle=rad(g,w/2,18,2,40,[[0,'rgba(255,230,160,.45)'],[1,'rgba(255,230,160,0)']]);g.fillRect(w/2-40,-20,80,80);
  g.fillStyle=lin(g,0,4,0,24,[[0,'#fff6dc'],[1,'#e8c88a']]);g.beginPath();g.moveTo(w/2-8,4);g.lineTo(w/2+8,4);g.lineTo(w/2+11,22);g.lineTo(w/2-11,22);g.closePath();g.fill();}
function plante(g,w,h){ombre(g,w/2,h-2,12,4);g.fillStyle=lin(g,w/2-11,0,w/2+11,0,[[0,'#a85a2a'],[.5,'#e8904a'],[1,'#a85a2a']]);g.beginPath();g.moveTo(w/2-11,h-20);g.lineTo(w/2+11,h-20);g.lineTo(w/2+8,h-2);g.lineTo(w/2-8,h-2);g.fill();
  for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.42,L=20+((k*5)%9);g.fillStyle=k%2?'#2a7a3a':'#3a9a4a';g.save();g.translate(w/2,h-22);g.rotate(a+Math.PI/2);g.beginPath();g.ellipse(0,-L/2-2,7,L/2,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.15)';g.fillRect(-.5,-L,1,L);g.restore();}}
function cactus(g,w,h){ombre(g,w/2,h-2,8,3);g.fillStyle='#e8d8b8';rr(g,w/2-8,h-14,16,12,3);g.fill();g.fillStyle='#c84a2a';g.fillRect(w/2-8,h-14,16,3);
  g.fillStyle=lin(g,w/2-5,0,w/2+5,0,[[0,'#2a7a3a'],[.5,'#5aba5a'],[1,'#2a7a3a']]);rr(g,w/2-5,6,10,h-18,5);g.fill();rr(g,w/2-12,14,6,12,3);g.fill();rr(g,w/2+6,10,6,10,3);g.fill();g.fillStyle='#ff6ab8';g.beginPath();g.arc(w/2,6,3,0,7);g.fill();}
function litDouble(g,w,h){ombre(g,w/2,h-3,w/2,6);g.fillStyle=bois(g,0,w,NOYER);rr(g,0,0,w,26,6);g.fill();g.fillStyle='rgba(255,255,255,.15)';g.fillRect(4,3,w-8,3);
  g.fillStyle='#5a3a1a';g.fillRect(2,h-12,w-4,9);g.fillStyle='#fffaf0';rr(g,4,18,w-8,h-30,6);g.fill();
  for(const x of [8,w/2+2]){g.fillStyle=lin(g,0,22,0,38,[[0,'#ffffff'],[1,'#e2dcd0']]);rr(g,x,22,w/2-10,16,6);g.fill();}
  g.fillStyle=lin(g,0,40,0,h-12,[[0,'#3a6ab8'],[1,'#1a3a7a']]);rr(g,2,42,w-4,h-54,6);g.fill();g.fillStyle='rgba(255,255,255,.12)';for(let y=48;y<h-14;y+=8)g.fillRect(4,y,w-8,1.5);
  g.fillStyle='rgba(255,255,255,.5)';rr(g,2,42,w-4,8,4);g.fill();}
function litSimple(g,w,h){ombre(g,w/2,h-3,w/2,5);g.fillStyle=bois(g,0,w,CHENE);rr(g,0,0,w,22,5);g.fill();g.fillStyle='#6a4018';g.fillRect(2,h-12,w-4,9);
  g.fillStyle='#fffaf0';rr(g,3,14,w-6,h-26,5);g.fill();g.fillStyle=lin(g,0,18,0,32,[[0,'#fff'],[1,'#e2dcd0']]);rr(g,7,18,w-14,13,5);g.fill();
  g.fillStyle=lin(g,0,36,0,h-12,[[0,'#e8604a'],[1,'#a8302a']]);rr(g,2,36,w-4,h-48,5);g.fill();g.fillStyle='rgba(255,255,255,.2)';for(let x=8;x<w-4;x+=10)g.fillRect(x,38,2,h-52);}
function armoire(g,w,h){ombre(g,w/2,h-2,w/2,5);g.fillStyle=bois(g,0,w,CHENE);g.fillRect(0,4,w,h-6);g.fillStyle=lin(g,0,0,0,6,[[0,'#d8a060'],[1,'#8a5a2a']]);g.fillRect(-2,0,w+4,6);
  g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1;g.strokeRect(4,10,w/2-6,h-22);g.strokeRect(w/2+2,10,w/2-6,h-22);g.strokeStyle='rgba(255,255,255,.2)';g.strokeRect(8,14,w/2-14,h-30);g.strokeRect(w/2+6,14,w/2-14,h-30);
  g.fillStyle='#f0c860';g.beginPath();g.arc(w/2-5,h/2,2,0,7);g.arc(w/2+5,h/2,2,0,7);g.fill();}
function chevet(g,w,h){ombre(g,w/2,h-2,w/2,3);g.fillStyle=bois(g,0,w,CHENE);g.fillRect(1,8,w-2,h-10);g.fillStyle='#d8a060';g.fillRect(0,6,w,3);g.strokeStyle='rgba(0,0,0,.25)';g.strokeRect(4,12,w-8,h-18);g.fillStyle='#f0c860';g.fillRect(w/2-2,16,4,2);
  g.fillStyle='#f0e0c0';g.beginPath();g.moveTo(w/2-6,-8);g.lineTo(w/2+6,-8);g.lineTo(w/2+8,2);g.lineTo(w/2-8,2);g.fill();g.fillStyle='#8a6a4a';g.fillRect(w/2-1,2,2,4);}
function frigo(g,w,h){ombre(g,w/2,h-2,w/2,4);g.fillStyle=lin(g,0,0,w,0,[[0,'#7ac8b8'],[.4,'#b8f0e0'],[1,'#5aa898']]);rr(g,0,0,w,h-2,10);g.fill();
  g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=1;g.beginPath();g.moveTo(2,h*.36);g.lineTo(w-2,h*.36);g.stroke();g.fillStyle='#e8ecf2';g.fillRect(w-8,10,3,16);g.fillRect(w-8,h*.4,3,20);
  g.fillStyle='rgba(255,255,255,.35)';g.fillRect(4,4,4,h-12);g.fillStyle='#ff6a3a';g.fillRect(10,h*.5,6,6);g.fillStyle='#ffd23a';g.fillRect(18,h*.55,5,5);}
function cuisine(g,w,h){ombre(g,w/2,h-2,w/2,4);g.fillStyle=lin(g,0,10,0,h,[[0,'#f6f2ea'],[1,'#c8c2b4']]);g.fillRect(0,12,w,h-14);
  for(let k=0;k<3;k++){g.strokeStyle='rgba(0,0,0,.2)';g.strokeRect(3+k*(w-6)/3,18,(w-6)/3-3,h-24);g.fillStyle='#8a8e98';g.fillRect(3+k*(w-6)/3+(w-6)/6-6,22,12,2);}
  g.fillStyle=lin(g,0,4,0,14,[[0,'#3a3a42'],[1,'#1a1a22']]);g.fillRect(-2,4,w+4,10);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(0,5,w,2);
  g.fillStyle='#b8bcc6';rr(g,10,5,30,8,3);g.fill();g.fillStyle='#8ab8e0';rr(g,13,6,24,5,2);g.fill();g.strokeStyle='#d8dce4';g.lineWidth=2;g.beginPath();g.moveTo(25,6);g.lineTo(25,-4);g.lineTo(30,-4);g.stroke();
  for(const x of [w-46,w-30]){g.fillStyle='#0a0a0e';g.beginPath();g.ellipse(x,8,6,3,0,0,7);g.fill();g.strokeStyle='#ff4a2a';g.lineWidth=.8;g.beginPath();g.ellipse(x,8,4,2,0,0,7);g.stroke();}
  g.fillStyle='#c84a2a';rr(g,w-58,-2,14,7,2);g.fill();}
function tableBistrot(g,w,h){ombre(g,w/2,h-3,w/2-4,6);
  const chaise=(x,fl)=>{g.fillStyle='#2a2a30';g.fillRect(x,h-22,2,20);g.fillRect(x+12,h-22,2,20);g.fillStyle='#c8904a';rr(g,x-1,h-26,16,6,2);g.fill();g.fillStyle='#2a2a30';g.fillRect(fl?x+12:x,h-46,2,22);g.fillStyle='#c8904a';rr(g,fl?x+8:x-2,h-48,8,22,3);g.fill();};
  chaise(4,0);chaise(w-18,1);g.fillStyle='#2a2a30';g.fillRect(w/2-1.5,16,3,h-20);g.beginPath();g.ellipse(w/2,h-4,10,3,0,0,7);g.fill();
  g.fillStyle=lin(g,0,6,0,18,[[0,'#f6f2ea'],[1,'#b8b2a4']]);g.beginPath();g.ellipse(w/2,12,26,9,0,0,7);g.fill();g.strokeStyle='#8a8e98';g.lineWidth=1.5;g.stroke();
  g.fillStyle='#fff';g.beginPath();g.ellipse(w/2-8,10,5,2.5,0,0,7);g.fill();g.fillStyle='#6a3a14';g.beginPath();g.ellipse(w/2-8,9.5,3,1.5,0,0,7);g.fill();g.fillStyle='#3a8a4a';g.fillRect(w/2+6,2,3,8);g.fillStyle='#ff4a6a';g.beginPath();g.arc(w/2+7.5,1,3,0,7);g.fill();}
function aquarium(g,w,h){ombre(g,w/2,h-2,w/2,4);g.fillStyle=bois(g,0,w,NOYER);g.fillRect(2,h-24,w-4,22);g.strokeStyle='rgba(0,0,0,.3)';g.strokeRect(6,h-20,w-12,14);
  g.fillStyle=lin(g,0,4,0,h-24,[[0,'#7ad8ff'],[1,'#1a6aa8']]);g.fillRect(0,4,w,h-28);g.fillStyle='#e8d8a8';g.fillRect(0,h-32,w,8);
  g.fillStyle='#3a9a4a';for(let k=0;k<4;k++){g.beginPath();g.moveTo(8+k*18,h-30);g.quadraticCurveTo(4+k*18,h-50,10+k*18,h-60);g.quadraticCurveTo(12+k*18,h-46,12+k*18,h-30);g.fill();}
  for(const [x,y,c] of [[w*.3,20,'#ff8a1a'],[w*.65,32,'#ffd23a'],[w*.5,14,'#ff4a8a']]){g.fillStyle=c;g.beginPath();g.ellipse(x,y,5,3,0,0,7);g.fill();g.beginPath();g.moveTo(x-4,y);g.lineTo(x-8,y-3);g.lineTo(x-8,y+3);g.fill();}
  g.fillStyle='rgba(255,255,255,.6)';for(let k=0;k<5;k++){g.beginPath();g.arc(w*.8,10+k*7,1.5,0,7);g.fill();}
  g.strokeStyle='#2a2a30';g.lineWidth=2;g.strokeRect(0,4,w,h-28);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(3,6,4,h-34);g.fillStyle='#2a2a30';g.fillRect(-1,0,w+2,5);}
function guitare(g,w,h){ombre(g,w/2,h-2,8,3);g.strokeStyle='#2a2a30';g.lineWidth=1.5;g.beginPath();g.moveTo(w/2-7,h-2);g.lineTo(w/2,h-16);g.lineTo(w/2+7,h-2);g.stroke();
  g.fillStyle=lin(g,0,0,w,0,[[0,'#8a3a10'],[.5,'#e8904a'],[1,'#8a3a10']]);g.beginPath();g.ellipse(w/2,h-22,9,8,0,0,7);g.fill();g.beginPath();g.ellipse(w/2,h-34,7,6,0,0,7);g.fill();
  g.fillStyle='#1a0a04';g.beginPath();g.arc(w/2,h-28,2.6,0,7);g.fill();g.fillStyle='#4a2a14';g.fillRect(w/2-1.5,2,3,h-38);g.fillStyle='#2a1408';rr(g,w/2-3,0,6,7,1);g.fill();
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.4;g.beginPath();g.moveTo(w/2,4);g.lineTo(w/2,h-18);g.stroke();}
function jukebox(g,w,h){ombre(g,w/2,h-2,w/2,4);g.fillStyle=lin(g,0,0,w,0,[[0,'#8a1a1a'],[.5,'#d83a3a'],[1,'#8a1a1a']]);g.beginPath();g.moveTo(0,h-2);g.lineTo(0,24);g.arc(w/2,24,w/2,Math.PI,0);g.lineTo(w,h-2);g.closePath();g.fill();
  g.strokeStyle=lin(g,0,0,0,h,[[0,'#fff2b8'],[1,'#c8922a']]);g.lineWidth=2.5;g.stroke();
  g.strokeStyle='rgba(255,180,60,.9)';g.lineWidth=3;g.beginPath();g.arc(w/2,26,w/2-7,Math.PI,0);g.stroke();g.strokeStyle='rgba(120,220,255,.9)';g.beginPath();g.arc(w/2,26,w/2-12,Math.PI,0);g.stroke();
  g.fillStyle='#1a0a14';rr(g,8,30,w-16,22,3);g.fill();for(let k=0;k<4;k++){g.fillStyle='#f6ead0';g.fillRect(11,33+k*5,w-22,3);}
  g.fillStyle='#c8c8d0';rr(g,8,56,w-16,h-66,3);g.fill();g.fillStyle='#8a8e98';for(let y=60;y<h-12;y+=4)g.fillRect(10,y,w-20,1.5);}
function borne(g,w,h){ombre(g,w/2,h-2,w/2,4);g.fillStyle=lin(g,0,0,w,0,[[0,'#1a1a3a'],[.5,'#3a2a8a'],[1,'#1a1a3a']]);g.beginPath();g.moveTo(2,h-2);g.lineTo(2,30);g.lineTo(6,6);g.lineTo(w-6,6);g.lineTo(w-2,30);g.lineTo(w-2,h-2);g.closePath();g.fill();
  g.fillStyle='#ff3ab8';g.fillRect(6,6,w-12,8);g.fillStyle='#0a0a12';g.fillRect(7,18,w-14,24);g.fillStyle='#2ad84a';g.fillRect(10,30,4,4);g.fillStyle='#ffd23a';g.fillRect(w-16,22,3,3);g.fillRect(w-24,26,3,3);g.fillStyle='#4ad8ff';g.fillRect(w/2-2,34,4,4);
  g.fillStyle='#2a2a4a';g.beginPath();g.moveTo(0,46);g.lineTo(w,46);g.lineTo(w-3,54);g.lineTo(3,54);g.fill();g.fillStyle='#ff3a3a';g.beginPath();g.arc(12,50,2.5,0,7);g.fill();g.fillStyle='#3a8aff';g.beginPath();g.arc(w-14,50,2.5,0,7);g.arc(w-8,50,2.5,0,7);g.fill();}
function piano(g,w,h){ombre(g,w/2,h-3,w/2,6);g.fillStyle='#0a0a0e';g.beginPath();g.moveTo(4,h-30);g.lineTo(4,10);g.quadraticCurveTo(w*.7,-6,w-4,20);g.lineTo(w-4,h-30);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(10,12);g.quadraticCurveTo(w*.5,0,w*.7,6);g.lineTo(w*.66,12);g.quadraticCurveTo(w*.4,6,12,18);g.fill();
  g.fillStyle='#1a1a22';g.fillRect(2,h-32,w-4,8);g.fillStyle='#fffaf0';g.fillRect(4,h-30,w-8,6);g.fillStyle='#0a0a0e';for(let x=8;x<w-8;x+=6)if(x%14!==4)g.fillRect(x,h-30,3,4);
  g.fillStyle='#0a0a0e';for(const x of [10,w-14])g.fillRect(x,h-24,4,20);g.fillStyle='#f0c860';g.fillRect(9,h-6,6,2);g.fillRect(w-15,h-6,6,2);}
function maquette(g,w,h){ombre(g,w/2,h-2,w/2,3);g.fillStyle=bois(g,0,w,NOYER);g.fillRect(4,h-10,w-8,8);g.fillStyle='#f0c860';g.fillRect(4,h-11,w-8,1.5);
  g.fillStyle='#8a4a1a';g.beginPath();g.moveTo(4,h-24);g.lineTo(w-4,h-24);g.lineTo(w-10,h-12);g.lineTo(10,h-12);g.fill();g.fillStyle='#3a2a1a';for(const x of [w*.32,w*.6])g.fillRect(x,6,1.5,h-30);
  g.fillStyle='#fffaf0';for(const [x,s] of [[w*.32,1],[w*.6,1.2]]){g.beginPath();g.moveTo(x+1.5,8);g.quadraticCurveTo(x+12*s,16,x+1.5,h-28);g.fill();}g.fillStyle='#d83a3a';g.fillRect(w*.6,3,8,3);}
function trophee(g,w,h){ombre(g,w/2,h-2,w/2-2,3);g.fillStyle='#2a1a10';g.fillRect(4,h-10,w-8,8);g.fillStyle=lin(g,0,0,w,0,[[0,'#a8701c'],[.5,'#fff2b8'],[1,'#a8701c']]);
  g.fillRect(w/2-2,h-18,4,8);g.beginPath();g.moveTo(w/2-10,4);g.lineTo(w/2+10,4);g.quadraticCurveTo(w/2+9,h-16,w/2,h-18);g.quadraticCurveTo(w/2-9,h-16,w/2-10,4);g.fill();
  g.strokeStyle='#d8a840';g.lineWidth=2;g.beginPath();g.arc(w/2-11,12,5,Math.PI*.5,Math.PI*1.5);g.stroke();g.beginPath();g.arc(w/2+11,12,5,-Math.PI*.5,Math.PI*.5);g.stroke();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(w/2-6,6,2,12);}
/* les objets accrochés au mur */
function cadre(g,w,h,f){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(3,4,w,h);g.fillStyle=lin(g,0,0,w,h,[[0,'#fff2b8'],[.5,'#c8922a'],[1,'#fff2b8']]);g.fillRect(0,0,w,h);g.save();g.beginPath();g.rect(4,4,w-8,h-8);g.clip();f(g,4,4,w-8,h-8);g.restore();}
function tableauCalanques(g,w,h){cadre(g,w,h,(g,x,y,W,H)=>{g.fillStyle=lin(g,0,y,0,y+H,[[0,'#8ad0ff'],[1,'#e8f6ff']]);g.fillRect(x,y,W,H);g.fillStyle='#e8e2d4';g.beginPath();g.moveTo(x,y+H*.7);g.lineTo(x+W*.2,y+H*.25);g.lineTo(x+W*.4,y+H*.6);g.lineTo(x+W*.6,y+H*.2);g.lineTo(x+W,y+H*.6);g.lineTo(x+W,y+H);g.lineTo(x,y+H);g.fill();
  g.fillStyle='#1ab8c8';g.fillRect(x,y+H*.72,W,H*.28);g.fillStyle='#2a7a3a';g.fillRect(x+W*.12,y+H*.4,3,3);g.fillRect(x+W*.7,y+H*.35,4,3);g.fillStyle='#fff';g.fillRect(x+W*.5,y+H*.8,6,2);});}
function tableauBonneMere(g,w,h){cadre(g,w,h,(g,x,y,W,H)=>{g.fillStyle=lin(g,0,y,0,y+H,[[0,'#ff9a5a'],[.6,'#ffd08a'],[1,'#3a5a9a']]);g.fillRect(x,y,W,H);g.fillStyle='#3a3a5a';g.beginPath();g.moveTo(x,y+H*.75);g.quadraticCurveTo(x+W/2,y+H*.35,x+W,y+H*.75);g.lineTo(x+W,y+H);g.lineTo(x,y+H);g.fill();
  g.fillStyle='#e8dcc8';g.fillRect(x+W/2-4,y+H*.3,8,H*.2);g.fillRect(x+W/2-1.5,y+H*.18,3,H*.14);g.fillStyle='#ffd23a';g.beginPath();g.arc(x+W/2,y+H*.17,2.5,0,7);g.fill();});}
function horloge(g,w,h){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(w/2+2,h/2+3,w/2,0,7);g.fill();g.fillStyle=bois(g,0,w,NOYER);g.beginPath();g.arc(w/2,h/2,w/2,0,7);g.fill();g.fillStyle='#fffaf0';g.beginPath();g.arc(w/2,h/2,w/2-3,0,7);g.fill();
  g.fillStyle='#2a2a30';for(let k=0;k<12;k++){const a=k/12*Math.PI*2;g.fillRect(w/2+Math.cos(a)*(w/2-6)-.7,h/2+Math.sin(a)*(w/2-6)-.7,1.4,1.4);}
  g.strokeStyle='#2a2a30';g.lineCap='round';g.lineWidth=1.6;g.beginPath();g.moveTo(w/2,h/2);g.lineTo(w/2+5,h/2-3);g.stroke();g.lineWidth=1;g.beginPath();g.moveTo(w/2,h/2);g.lineTo(w/2-2,h/2-9);g.stroke();g.strokeStyle='#c83a3a';g.lineWidth=.6;g.beginPath();g.moveTo(w/2,h/2);g.lineTo(w/2+6,h/2+6);g.stroke();}
function neon(g,w,h){g.fillStyle='rgba(0,0,0,.35)';rr(g,2,3,w,h,6);g.fill();g.fillStyle='#120a1a';rr(g,0,0,w,h,6);g.fill();
  g.save();g.font='900 '+(h*.42)+'px "Baloo 2",Arial';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#ff3ab8';g.shadowBlur=8;g.fillStyle='#ff9ae0';g.fillText('BATTLE',w/2,h*.32);g.shadowColor='#3ad8ff';g.fillStyle='#b8f4ff';g.fillText('DOCK',w/2,h*.72);g.restore();}
function etagere(g,w,h){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(2,h-4,w,4);g.fillStyle=bois(g,0,w,CHENE);g.fillRect(0,h-7,w,5);
  g.fillStyle='#e8904a';g.fillRect(6,h-17,10,10);g.fillStyle='#3a9a4a';g.beginPath();g.ellipse(11,h-21,8,6,0,0,7);g.fill();
  for(let k=0;k<4;k++){g.fillStyle=['#2a5a9a','#c84a2a','#e8b83a','#3a8a4a'][k];g.fillRect(24+k*5,h-20,4,13);}g.fillStyle='#fffaf0';g.beginPath();g.ellipse(w-12,h-12,6,5,0,0,7);g.fill();g.fillStyle='#8a5a2a';g.fillRect(w-13,h-20,2,4);}
/* ---------- le catalogue ---------- */
const M=[
 /* Salon */
 ['canape_bleu','Canapé bleu nuit','salon',1500,96,58,30,canape('#4a6ab8','#1a2a6a')],
 ['canape_rouge','Canapé velours rouge','salon',1500,96,58,30,canape('#d84a4a','#8a1a1a')],
 ['canape_vert','Canapé vert sauge','salon',1500,96,58,30,canape('#8ab88a','#4a7a4a')],
 ['fauteuil','Fauteuil moutarde','salon',600,44,50,24,fauteuil],
 ['table_basse','Table basse en noyer','salon',300,64,26,26,tableBasse],
 ['tapis_rond','Tapis berbère','salon',400,110,70,0,tapisRond,{tapis:1}],
 ['tapis_persan','Tapis persan','salon',900,140,84,0,tapisPersan,{tapis:1}],
 ['meuble_tv','Meuble télé','salon',1200,92,64,22,meubleTv],
 ['biblio','Bibliothèque','salon',800,70,110,18,biblio],
 ['lampadaire','Lampadaire','salon',250,24,96,8,lampadaire],
 ['monstera','Monstera','salon',150,44,64,14,plante],
 ['cactus','Cactus en fleur','salon',80,28,44,10,cactus],
 /* Chambre */
 ['lit_double','Lit double','chambre',2500,100,118,88,litDouble],
 ['lit_simple','Lit simple','chambre',900,58,106,78,litSimple],
 ['armoire','Armoire en chêne','chambre',1100,72,122,24,armoire],
 ['chevet','Table de chevet','chambre',150,28,32,16,chevet],
 /* Cuisine */
 ['frigo','Frigo rétro','cuisine',900,42,96,24,frigo],
 ['cuisine','Cuisine équipée','cuisine',2200,124,66,28,cuisine],
 ['table_bistrot','Table de bistrot','cuisine',700,90,58,30,tableBistrot],
 /* Plaisirs */
 ['aquarium','Aquarium','plaisir',6000,80,74,22,aquarium],
 ['guitare','Guitare sur pied','plaisir',1500,24,60,8,guitare],
 ['jukebox','Juke-box','plaisir',12000,52,88,24,jukebox],
 ['borne','Borne d’arcade','plaisir',8000,44,90,26,borne],
 ['piano','Piano à queue','plaisir',25000,104,84,36,piano],
 ['maquette','Maquette de voilier','plaisir',3000,52,52,14,maquette],
 ['trophee','Coupe d’or','plaisir',2000,30,46,10,trophee],
 /* Au mur */
 ['t_calanques','Tableau des Calanques','mur',800,64,46,0,tableauCalanques,{mur:1}],
 ['t_bonnemere','Tableau de la Bonne Mère','mur',1200,48,62,0,tableauBonneMere,{mur:1}],
 ['horloge','Horloge','mur',300,30,30,0,horloge,{mur:1}],
 ['neon','Néon Battle Dock','mur',2500,74,34,0,neon,{mur:1}],
 ['etagere','Étagère murale','mur',350,66,30,0,etagere,{mur:1}]];
const MEUBLES={};for(const [id,nom,cat,prix,w,h,d,f,o] of M)MEUBLES[id]=Object.assign({id,nom,cat,prix,w,h,d,f},o||{});
const CATS=[['salon','Salon'],['chambre','Chambre'],['cuisine','Cuisine'],['plaisir','Plaisirs'],['mur','Au mur']];
/* ---------- les murs et les sols ---------- */
const MURS={creme:['Peinture crème',0],sauge:['Vert sauge',400],marine:['Bleu marine',400],terracotta:['Terracotta',400],fleuri:['Papier peint fleuri',900],rayures:['Rayures marines',900],brique:['Brique',1200],lambris:['Lambris bois',1500]};
const SOLS={chene:['Parquet chêne',0],tomettes:['Tomettes de Provence',1200],hongrie:['Point de Hongrie',1500],damier:['Damier noir et blanc',1500],beton:['Béton ciré',900],moquette:['Moquette douce',600],marbre:['Marbre blanc',4000]};
function peindreMur(g,k,x,y,w,h){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();peindreMur0(g,k,x,y,w,h);g.restore();}
function peindreMur0(g,k,x,y,w,h){const B={creme:['#f2e6cc','#e2d2b0'],sauge:['#a8c4a0','#8aa882'],marine:['#2a3a6a','#1a2a4a'],terracotta:['#d8805a','#b8603a']}[k];
  if(B){g.fillStyle=lin(g,0,y,0,y+h,[[0,B[0]],[1,B[1]]]);g.fillRect(x,y,w,h);return;}
  if(k==='fleuri'){g.fillStyle='#f6ecd8';g.fillRect(x,y,w,h);for(let i=x+10;i<x+w;i+=26)for(let j=y+12;j<y+h;j+=26){const o=((j-y)/26|0)%2?13:0;g.fillStyle='#e88a9a';for(let a=0;a<5;a++){g.beginPath();g.arc(i+o+Math.cos(a*1.26)*3,j+Math.sin(a*1.26)*3,2.4,0,7);g.fill();}g.fillStyle='#ffd23a';g.beginPath();g.arc(i+o,j,1.5,0,7);g.fill();g.fillStyle='#7aaa6a';g.fillRect(i+o+4,j+3,4,1.5);}return;}
  if(k==='rayures'){g.fillStyle='#fffaf0';g.fillRect(x,y,w,h);g.fillStyle='#4a6ab8';for(let i=x;i<x+w;i+=24)g.fillRect(i,y,10,h);return;}
  if(k==='brique'){g.fillStyle='#b85a3a';g.fillRect(x,y,w,h);g.fillStyle='rgba(240,220,200,.6)';for(let j=y;j<y+h;j+=11){g.fillRect(x,j,w,1.5);const o=((j-y)/11|0)%2?12:0;for(let i=x+o;i<x+w;i+=24)g.fillRect(i,j,1.5,11);}
    for(let j=y;j<y+h;j+=11)for(let i=x;i<x+w;i+=24){g.fillStyle='rgba(0,0,0,'+((i*7+j*3)%5)*.02+')';g.fillRect(i+2,j+2,20,8);}return;}
  if(k==='lambris'){for(let i=x;i<x+w;i+=14){g.fillStyle=lin(g,i,0,i+14,0,[[0,'#a86a3a'],[.5,'#c8884a'],[1,'#8a5a2a']]);g.fillRect(i,y,14,h);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(i,y,1,h);}return;}
  g.fillStyle='#f2e6cc';g.fillRect(x,y,w,h);}
function peindreSol(g,k,x,y,w,h){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();peindreSol0(g,k,x,y,w,h);g.restore();}
function peindreSol0(g,k,x,y,w,h){
  if(k==='tomettes'){for(let j=y,r=0;j<y+h;j+=16,r++)for(let i=x-(r%2)*9;i<x+w;i+=18){g.fillStyle=['#c8603a','#b8502a','#d8704a'][(i*3+j)%3|0];g.beginPath();for(let a=0;a<6;a++)g.lineTo(i+9+Math.cos(a*Math.PI/3)*9.5,j+8+Math.sin(a*Math.PI/3)*8.5);g.fill();}return;}
  if(k==='hongrie'){g.fillStyle='#a86a3a';g.fillRect(x,y,w,h);for(let j=y-20;j<y+h;j+=12)for(let i=x;i<x+w;i+=24){for(const s of [-1,1]){g.fillStyle=((i+j)/12|0)%2?'#c8884a':'#b8783a';g.beginPath();g.moveTo(i+12,j);g.lineTo(i+12+s*12,j+8);g.lineTo(i+12+s*12,j+20);g.lineTo(i+12,j+12);g.fill();g.strokeStyle='rgba(60,30,10,.35)';g.lineWidth=.6;g.stroke();}}return;}
  if(k==='damier'){for(let j=y,r=0;j<y+h;j+=24,r++)for(let i=x,c=0;i<x+w;i+=24,c++){g.fillStyle=(r+c)%2?'#1a1a1e':'#f6f2ea';g.fillRect(i,j,24,24);}return;}
  if(k==='beton'){g.fillStyle=lin(g,x,y,x+w,y+h,[[0,'#b8b4ac'],[.5,'#d2cec6'],[1,'#a8a49c']]);g.fillRect(x,y,w,h);for(let i=0;i<40;i++){g.fillStyle='rgba(255,255,255,'+(.03+((i*7)%5)*.01)+')';g.beginPath();g.ellipse(x+((i*97)%w),y+((i*61)%h),30,12,i,0,7);g.fill();}return;}
  if(k==='moquette'){g.fillStyle='#8a7aa8';g.fillRect(x,y,w,h);for(let i=0;i<900;i++){g.fillStyle=i%2?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)';g.fillRect(x+((i*37)%w),y+((i*53)%h),2,2);}return;}
  if(k==='marbre'){g.fillStyle='#f4f2ee';g.fillRect(x,y,w,h);g.strokeStyle='rgba(150,150,160,.35)';g.lineWidth=1;for(let i=0;i<14;i++){g.beginPath();g.moveTo(x+((i*83)%w),y);g.bezierCurveTo(x+((i*41)%w),y+h*.3,x+((i*67)%w),y+h*.6,x+((i*29)%w),y+h);g.stroke();}
    g.strokeStyle='rgba(200,170,90,.35)';for(let j=y;j<y+h;j+=60){g.beginPath();g.moveTo(x,j);g.lineTo(x+w,j);g.stroke();}for(let i=x;i<x+w;i+=60){g.beginPath();g.moveTo(i,y);g.lineTo(i,y+h);g.stroke();}return;}
  /* le parquet de chêne, lame par lame */
  for(let j=y,r=0;j<y+h;j+=12,r++){let i=x-((r*37)%60);while(i<x+w){const L=50+((r*13+i)%40);g.fillStyle=['#c8904a','#b8803a','#d8a05a','#be8a44'][(r+((i/7)|0))%4];g.fillRect(i,j,L,12);g.fillStyle='rgba(60,30,10,.28)';g.fillRect(i,j,1,12);g.fillRect(i,j+11,L,1);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(i+2,j+2,L-4,2);i+=L;}}}
/* ---------- les images, faites une fois ---------- */
const CACHE={};
function sprite(id,fl){const k=id+(fl?'~':'');if(CACHE[k])return CACHE[k];const m=MEUBLES[id];if(!m)return null;const P=6,D=2,c=document.createElement('canvas');c.width=(m.w+P*2)*D;c.height=(m.h+P*2)*D;const g=c.getContext('2d');
  g.setTransform(D,0,0,D,P*D,P*D);if(fl){g.translate(m.w,0);g.scale(-1,1);}try{m.f(g,m.w,m.h);}catch(x){}return CACHE[k]={c,w:m.w+P*2,h:m.h+P*2,ox:m.w/2+P,oy:m.h+P};}
window.MEUBLES=MEUBLES;window.MEUBLE_CATS=CATS;window.APPART_MURS=MURS;window.APPART_SOLS=SOLS;window.peindreMurAppart=peindreMur;window.peindreSolAppart=peindreSol;window.spriteMeuble=sprite;
window.APPART_DEPART={mur:'creme',sol:'chene',items:[{m:'lit_simple',x:110,y:330,f:0},{m:'chevet',x:162,y:262,f:0},{m:'table_bistrot',x:470,y:380,f:0},{m:'monstera',x:600,y:240,f:0},{m:'cactus',x:40,y:420,f:0}]};
window.APPART_OFFERTS={lit_simple:1,chevet:1,table_bistrot:1,monstera:1,cactus:1};
})();
