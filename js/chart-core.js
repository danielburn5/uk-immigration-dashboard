"use strict";
/* Shared responsive, pointer-interactive SVG renderer for Overview and Explore. */
const number=n=>new Intl.NumberFormat("en-GB").format(n*1000);
const short=n=>Math.abs(n)>=1000?(n/1000).toFixed(n%1000===0?0:2)+"m":n+"k";
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
function chart(root,points,series,opts={}){
 const W=850,H=335,M={l:52,r:20,t:22,b:42},PW=W-M.l-M.r,PH=H-M.t-M.b;
 const vals=points.flatMap(p=>series.map(s=>p[s.key]));
 const mn=Math.min(0,...vals), mx=Math.max(0,...vals);
 const top=Math.ceil(mx/opts.step)*opts.step || opts.step, bot=mn<0?Math.floor(mn/opts.step)*opts.step:0;
 const x=i=>M.l+i*PW/Math.max(1,points.length-1),y=v=>M.t+(top-v)/(top-bot)*PH;
 const grid=Array.from({length:5},(_,i)=>bot+(top-bot)*i/4).map(v=>'<line class="'+(Math.abs(v)<1?"zero":"gridline")+'" x1="'+M.l+'" x2="'+(W-M.r)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text class="axis" x="'+(M.l-9)+'" y="'+(y(v)+4)+'" text-anchor="end">'+short(Math.round(v))+'</text>').join("");
 const ticks=points.map((p,i)=>i===0||i===points.length-1||((points.length<=7||i%2===0)&&i!==points.length-2)?'<text class="axis" x="'+x(i)+'" y="'+(H-12)+'" text-anchor="middle">'+p[0]+'</text>':"").join("");
 const split=opts.methodBreakYear?points.findIndex(p=>p[0]===opts.methodBreakYear):-1;
 const makePath=(part,s,start)=>part.map((p,i)=>(i?"L":"M")+x(i+start).toFixed(1)+","+y(p[s.key]).toFixed(1)).join(" ");
 const lines=series.map(s=>{
   const segments=split>0?[{data:points.slice(0,split),start:0},{data:points.slice(split),start:split}]:[{data:points,start:0}];
   return segments.map(seg=>'<path class="plot-line" stroke="'+s.color+'" d="'+makePath(seg.data,s,seg.start)+'"/>').join("")+
     points.map((p,i)=>'<circle class="point" cx="'+x(i)+'" cy="'+y(p[s.key])+'" r="3.5" fill="'+s.color+'"/>').join("");
 }).join("");
 const methodMarker=split>0?'<line x1="'+(x(split-1)+x(split))/2+'" x2="'+(x(split-1)+x(split))/2+'" y1="'+M.t+'" y2="'+(H-M.b)+'" stroke="#84939a" stroke-width="1.5" stroke-dasharray="5 5"/><text x="'+((x(split-1)+x(split))/2+7)+'" y="'+(M.t+12)+'" font-size="12" fill="#526673">Method change</text>':"";
 const legend=series.map(s=>'<span style="--swatch:'+s.color+'">'+esc(s.label)+'</span>').join("");
 root.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opts.title||"Migration trend chart")+'">'+grid+ticks+methodMarker+lines+'<rect class="hit" x="'+M.l+'" y="'+M.t+'" width="'+PW+'" height="'+PH+'" fill="transparent" style="cursor:crosshair"/></svg><div class="legend">'+legend+'</div><div class="tooltip" aria-hidden="true"></div>';
 const hit=root.querySelector(".hit"),tip=root.querySelector(".tooltip");
 function show(e){const svg=root.querySelector("svg"),rect=svg.getBoundingClientRect(),px=(e.clientX-rect.left)/rect.width*W;const i=Math.min(points.length-1,Math.max(0,Math.round((px-M.l)/PW*(points.length-1))));let text='<strong>Year ending June '+points[i][0]+'</strong>';series.forEach(s=>{text+='<div class="tipline"><span>'+esc(s.label)+'</span><b>'+number(points[i][s.key])+'</b></div>'});tip.innerHTML=text;tip.classList.add("visible");const pos=x(i)/W*rect.width;tip.style.left=Math.max(2,Math.min(rect.width-205,pos-90))+"px";tip.style.top="24px"}
 hit.addEventListener("pointermove",show);hit.addEventListener("pointerdown",show);hit.addEventListener("pointerleave",()=>tip.classList.remove("visible"));
}
