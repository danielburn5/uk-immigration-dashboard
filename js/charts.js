"use strict";
const colors={arr:"#267a77",dep:"#b65b45",net:"#336cab",non:"#336cab",eu:"#b65b45",brit:"#8974ab"};
function table(id,cols,records){const t=document.getElementById(id);t.innerHTML='<details class="data"><summary>Inspect the exact values</summary><div class="overflow"><table><thead><tr>'+cols.map(c=>'<th scope="col">'+esc(c)+'</th>').join("")+'</tr></thead><tbody>'+records.map(r=>'<tr>'+r.map((v,i)=>'<td>'+(i===0?esc(v):esc(number(v)))+'</td>').join("")+'</tr>').join("")+'</tbody></table></div></details>'}
const all=DATA.map(r=>({0:r[0],arrival:r[1],departure:r[5],net:r[9]}));
let totalMode="flows";
function drawTotal(){const series=totalMode==="flows"?[{key:"arrival",label:"Arriving",color:colors.arr},{key:"departure",label:"Leaving",color:colors.dep}]:[{key:"net",label:"Net migration",color:colors.net}];chart(document.getElementById("total-chart"),all,series,{step:200,methodBreakYear:2021,title:"All UK long-term immigration and emigration, years ending June 2012 to 2026; methodology change around 2021"});table("total-data",["Year","Arrivals","Departures","Net"],all.map(r=>[r[0],r.arrival,r.departure,r.net]));}
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

function drawAge(group){
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
