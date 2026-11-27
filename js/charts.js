"use strict";\nconst colors={arr:"#267a77",dep:"#b65b45",net:"#336cab",non:"#336cab",eu:"#b65b45",brit:"#8974ab"};
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
 const lines=series.map(s=>'<path class="plot-line" stroke="'+s.color+'" d="'+points.map((p,i)=>(i?"L":"M")+x(i).toFixed(1)+","+y(p[s.key]).toFixed(1)).join(" ")+'"/>'+points.map((p,i)=>'<circle class="point" cx="'+x(i)+'" cy="'+y(p[s.key])+'" r="3.5" fill="'+s.color+'"/>').join("")).join("");
 const legend=series.map(s=>'<span style="--swatch:'+s.color+'">'+esc(s.label)+'</span>').join("");
 root.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opts.title||"Migration trend chart")+'">'+grid+ticks+lines+'<rect class="hit" x="'+M.l+'" y="'+M.t+'" width="'+PW+'" height="'+PH+'" fill="transparent" style="cursor:crosshair"/></svg><div class="legend">'+legend+'</div><div class="tooltip" aria-hidden="true"></div>';
 const hit=root.querySelector(".hit"),tip=root.querySelector(".tooltip");
 function show(e){const svg=root.querySelector("svg"),rect=svg.getBoundingClientRect(),px=(e.clientX-rect.left)/rect.width*W;const i=Math.min(points.length-1,Math.max(0,Math.round((px-M.l)/PW*(points.length-1))));let text='<strong>Year ending June '+points[i][0]+'</strong>';series.forEach(s=>{text+='<div class="tipline"><span>'+esc(s.label)+'</span><b>'+number(points[i][s.key])+'</b></div>'});tip.innerHTML=text;tip.classList.add("visible");const pos=x(i)/W*rect.width;tip.style.left=Math.max(2,Math.min(rect.width-205,pos-90))+"px";tip.style.top="24px"}
 hit.addEventListener("pointermove",show);hit.addEventListener("pointerdown",show);hit.addEventListener("pointerleave",()=>tip.classList.remove("visible"));
}
function table(id,cols,records){const t=document.getElementById(id);t.innerHTML='<details class="data"><summary>Inspect the exact values</summary><div class="overflow"><table><thead><tr>'+cols.map(c=>'<th scope="col">'+esc(c)+'</th>').join("")+'</tr></thead><tbody>'+records.map(r=>'<tr>'+r.map((v,i)=>'<td>'+(i===0?esc(v):esc(number(v)))+'</td>').join("")+'</tr>').join("")+'</tbody></table></div></details>'}
const all=DATA.map(r=>({0:r[0],arrival:r[1],departure:r[5],net:r[9]}));
let totalMode="flows";
function drawTotal(){const series=totalMode==="flows"?[{key:"arrival",label:"Arriving",color:colors.arr},{key:"departure",label:"Leaving",color:colors.dep}]:[{key:"net",label:"Net migration",color:colors.net}];chart(document.getElementById("total-chart"),all,series,{step:200,title:"All UK long-term immigration and emigration, years ending June 2012 to 2026"});table("total-data",["Year","Arrivals","Departures","Net"],all.map(r=>[r[0],r.arrival,r.departure,r.net]));}
document.querySelectorAll("[data-total]").forEach(b=>b.addEventListener("click",()=>{totalMode=b.dataset.total;document.querySelectorAll("[data-total]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));drawTotal()}));drawTotal();
const british=DATA.filter(r=>r[0]>=2022).map(r=>({0:r[0],arrival:r[2],departure:r[6],net:r[10]}));
chart(document.getElementById("british-chart"),british,[{key:"arrival",label:"Arriving",color:colors.arr},{key:"departure",label:"Leaving",color:colors.dep}],{step:50,title:"British nationals arriving and leaving, June 2022 to June 2026"});
table("british-data",["Year","Arrivals","Departures","Net"],british.map(r=>[r[0],r.arrival,r.departure,r.net]));
const nationality=DATA.filter(r=>r[0]>=2021).map(r=>({0:r[0],brit:r[2],eu:r[3],non:r[4]}));
chart(document.getElementById("nationality-chart"),nationality,[{key:"non",label:"Non-EU+",color:colors.non},{key:"eu",label:"EU+",color:colors.eu},{key:"brit",label:"British",color:colors.brit}],{step:200,title:"Long-term UK immigration by nationality group, June 2021 to June 2026"});
table("nationality-data",["Year","Non-EU+","EU+","British"],nationality.map(r=>[r[0],r.non,r.eu,r.brit]));
const reasonLabels=["Work","Study","Family","Humanitarian","Asylum","Other"],reasonColors=["#267a77","#336cab","#8974ab","#789c93","#b65b45","#7d8d97"];
let reasonYear=2026;
function drawReasons(){const a=REASONS[reasonYear],max=Math.max(...a),total=DATA.find(r=>r[0]===reasonYear)[4],ws=a[0]+a[1],pct=Math.round(ws/total*100);document.getElementById("reasons-chart").innerHTML=a.map((v,i)=>'<div class="reason"><span>'+reasonLabels[i]+'</span><div class="track" role="img" aria-label="'+reasonLabels[i]+': '+number(v)+'"><div class="fill" style="width:'+(v/max*100).toFixed(1)+'%;background:'+reasonColors[i]+'"></div></div><span class="num">'+short(v)+' <small>('+Math.round(v/total*100)+'%)</small></span></div>').join("");document.getElementById("reasons-note").textContent="Work and study account for "+number(ws)+" of "+number(total)+" non-EU+ arrivals in "+reasonYear+" (around "+pct+"%), including dependants. Asylum accounts for "+number(a[4])+" (around "+Math.round(a[4]/total*100)+"%). These are initial immigration reasons, not assessments of people's character or contribution.";table("reason-data",["Reason","Arrivals"],a.map((v,i)=>[reasonLabels[i],v]));}
document.querySelectorAll("[data-reason]").forEach(b=>b.addEventListener("click",()=>{reasonYear=Number(b.dataset.reason);document.querySelectorAll("[data-reason]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));drawReasons()}));drawReasons();

\nfunction drawAge(group){
 const dat=AGE_DATA[group], max=Math.max(...dat.arrivals,...dat.departures);
 const root=document.getElementById("age-chart");
 root.setAttribute("aria-label",(group==="british"?"British":"Non-EU+")+" nationals: immigration and emigration by age, year ending June 2026");
 root.innerHTML=AGE_LABELS.map((band,i)=>{
  const a=dat.arrivals[i], d=dat.departures[i];
  return '<div class="age-row"><div class="age-band">'+band+'</div><div class="age-pair">'+
   [[a,"#267a77","Arriving"],[d,"#b65b45","Leaving"]].map(([v,col,label])=>
    '<div class="age-line" aria-label="'+label+' '+band+': '+number(v)+'"><div class="age-track"><div class="age-fill" style="width:'+(v/max*100).toFixed(2)+'%;background:'+col+'"></div></div><span class="age-value">'+v+'k</span></div>'
   ).join("")+'</div></div>';
 }).join("");
 document.getElementById("age-insight").textContent=dat.insight;
 table("age-data",["Age band","Arriving","Leaving"],AGE_LABELS.map((band,i)=>[band,dat.arrivals[i],dat.departures[i]]));
}
document.querySelectorAll("[data-age-group]").forEach(button=>{
 button.addEventListener("click",()=>{
  document.querySelectorAll("[data-age-group]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
  drawAge(button.dataset.ageGroup);
 });
});
drawAge("british");
