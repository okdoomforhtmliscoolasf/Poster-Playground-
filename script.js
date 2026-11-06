(() => {
  const $ = (id) => document.getElementById(id);
  const poster = $("poster");
  const headline = $("headline"), subtitle = $("subtitle"), microcopy = $("microcopy");
  const palettes = [
    {bg:"#f4b8d2",ink:"#171717",accent:"#3457e8",paper:"#fff8eb"},
    {bg:"#3457e8",ink:"#fff8eb",accent:"#ff8b45",paper:"#fff5df"},
    {bg:"#f5df4d",ink:"#171717",accent:"#f04e37",paper:"#fff8eb"},
    {bg:"#bcb4f5",ink:"#171717",accent:"#d5f28c",paper:"#fff8eb"}
  ];
  let paletteIndex = 0, layout = "stack";
  function update() {
    $("posterHeadline").innerHTML = escapeHTML(headline.value).replace(/\n/g,"<br>");
    $("posterSubtitle").textContent = subtitle.value;
    $("posterMicro").textContent = microcopy.value;
    poster.classList.toggle("no-border", !$("borderToggle").checked);
    poster.classList.toggle("no-grain", !$("grainToggle").checked);
    poster.classList.toggle("ink-invert", $("inkToggle").checked);
    poster.classList.toggle("font-grotesk", $("fontChoice").value === "grotesk");
    poster.classList.toggle("font-mono", $("fontChoice").value === "mono");
    poster.classList.remove("layout-stack","layout-split","layout-center");
    poster.classList.add("layout-"+layout);
    const shape = $("shapeChoice").value;
    $("posterShape").className = "poster-shape " + (shape==="circle"?"shape-circle":shape==="bars"?"shape-bars":"shape-star");
    $("posterShape").textContent = shape==="star"?"✳":"";
    $("posterShape").style.display = shape==="none"?"none":"block";
    const c = palettes[paletteIndex];
    poster.style.backgroundColor = c.bg;
    poster.style.color = c.ink;
    poster.style.setProperty("--blue", c.accent);
    poster.style.setProperty("--ink", $("inkToggle").checked ? c.paper : c.ink);
    document.querySelectorAll(".palette").forEach((b,i)=>b.classList.toggle("active",i===paletteIndex));
    document.querySelectorAll(".choice").forEach(b=>b.classList.toggle("active",b.dataset.layout===layout));
  }
  function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  [headline,subtitle,microcopy,$("fontChoice"),$("shapeChoice"),$("borderToggle"),$("grainToggle"),$("inkToggle")].forEach(el=>el.addEventListener("input",update));
  $("palettes").addEventListener("click",e=>{const b=e.target.closest("[data-palette]");if(!b)return;paletteIndex=Number(b.dataset.palette);update();});
  $("layouts").addEventListener("click",e=>{const b=e.target.closest("[data-layout]");if(!b)return;layout=b.dataset.layout;update();});
  function randomise(){
    const words=[["THINK","BIGGER"],["MAKE","SOME NOISE"],["STAY","CURIOUS"],["IDEAS","IN MOTION"],["NOTHING","ORDINARY"],["CREATE","MORE"]];
    const pick=words[Math.floor(Math.random()*words.length)];
    headline.value=pick.join("\n");
    subtitle.value=["A STUDY IN CREATIVE CHAOS","GOOD IDEAS DON'T SIT STILL","EXPERIMENT / EXPLORE / REPEAT","A LITTLE LOUDER EVERY DAY"][Math.floor(Math.random()*4)];
    microcopy.value="ISSUE "+String(Math.ceil(Math.random()*99)).padStart(3,"0")+" / FIELD NOTES";
    paletteIndex=Math.floor(Math.random()*palettes.length);
    layout=["stack","split","center"][Math.floor(Math.random()*3)];
    $("fontChoice").value=["black","grotesk","mono"][Math.floor(Math.random()*3)];
    $("shapeChoice").value=["star","circle","bars","none"][Math.floor(Math.random()*4)];
    $("inkToggle").checked=Math.random()>.72;
    update(); $("status").textContent="A fresh composition. Make it yours.";
  }
  $("randomButton").addEventListener("click",randomise);
  $("randomTop").addEventListener("click",randomise);
  function downloadPNG(){
    const c=palettes[paletteIndex], w=1080,h=1350;
    const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext("2d");
    const inverted=$("inkToggle").checked, bg=inverted?c.ink:c.bg, ink=inverted?c.paper:c.ink;
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    if($("grainToggle").checked){ctx.fillStyle=inverted?"#ffffff12":"#17171712";for(let y=0;y<h;y+=13)for(let x=0;x<w;x+=13){ctx.beginPath();ctx.arc(x,y,1.1,0,Math.PI*2);ctx.fill();}}
    if($("borderToggle").checked){ctx.strokeStyle=ink;ctx.lineWidth=8;ctx.strokeRect(35,35,w-70,h-70);}
    ctx.fillStyle=ink;ctx.textBaseline="top";
    const mono='"DM Mono", monospace', black='"Archivo Black", Impact, sans-serif', grotesk='"Space Grotesk", sans-serif';
    const font=$("fontChoice").value==="mono"?mono:$("fontChoice").value==="grotesk"?grotesk:black;
    ctx.font=`24px ${mono}`;ctx.fillText(microcopy.value.slice(0,55),75,72);ctx.textAlign="right";ctx.fillText("PP—001",1005,72);ctx.textAlign="left";
    const shape=$("shapeChoice").value;
    if(shape==="star"){ctx.fillStyle=c.accent;ctx.font=`180px ${grotesk}`;ctx.textAlign="right";ctx.fillText("✳",970,260);ctx.textAlign="left";}
    if(shape==="circle"){ctx.fillStyle=c.accent;ctx.beginPath();ctx.arc(825,520,190,0,Math.PI*2);ctx.fill();}
    if(shape==="bars"){ctx.fillStyle=c.accent;for(let i=0;i<5;i++)ctx.fillRect(720,330+i*75,290,35);}
    const lines=headline.value.toUpperCase().split(/\n/).slice(0,3);
    const center=layout==="center";
    ctx.textAlign=center?"center":"left";
    const x=center?w/2:75, base=layout==="split"?430:490;
    let fontSize=layout==="split"?142:172;
    if($("fontChoice").value==="mono")fontSize=layout==="split"?118:140;
    if($("fontChoice").value==="grotesk")fontSize=layout==="split"?145:170;
    const maxWidth=layout==="split"?760:930;
    ctx.font=`800 ${fontSize}px ${font}`;
    while(lines.some(line=>ctx.measureText(line).width>maxWidth)&&fontSize>70){fontSize-=6;ctx.font=`800 ${fontSize}px ${font}`;}
    ctx.fillStyle=ink;
    lines.forEach((line,i)=>ctx.fillText(line, x, base+i*fontSize*.88, maxWidth));
    ctx.font=`700 28px ${mono}`;ctx.fillText(subtitle.value.toUpperCase().slice(0,70),x,base+lines.length*fontSize*.9+35);
    ctx.textAlign="left";ctx.font=`22px ${mono}`;ctx.fillText("POSTER PLAYGROUND",75,1250);
    ctx.textAlign="right";ctx.fillStyle=c.accent;ctx.font=`800 72px ${black}`;ctx.fillText("001",1005,1210);
    const a=document.createElement("a");a.download="poster-playground-design.png";a.href=canvas.toDataURL("image/png");a.click();
    $("status").textContent="PNG exported. Go make something.";
  }
  $("downloadButton").addEventListener("click",downloadPNG);
  update();
})();