"use strict";
const chartEl=document.getElementById("overview-net");
if(chartEl){
 const points=DATA.filter(row=>row[0]>=2021).map(row=>({year:row[0],value:row[9]}));
 const width=740,height=260,left=50,right=22,top=20,bottom=42,max=1000;
 const X=i=>left+(width-left-right)*i/(points.length-1);
 const Y=v=>top+(height-top-bottom)*(1-v/max);
 const grid=[0,250,500,750,1000].map(n=>'<line x1="'+left+'" y1="'+Y(n)+'" x2="'+(width-right)+'" y2="'+Y(n)+'" stroke="#e8eded"/><text x="'+(left-9)+'" y="'+(Y(n)+4)+'" font-size="12" text-anchor="end" fill="#718089">'+(n===0?"0":n+"k")+'</text>').join("");
 const path=points.map((p,i)=>(i?"L":"M")+X(i)+","+Y(p.value)).join(" ");
 const dots=points.map((p,i)=>'<circle cx="'+X(i)+'" cy="'+Y(p.value)+'" r="4" fill="#176f70"><title>Year ending June '+p.year+': '+p.value.toLocaleString("en-GB")+',000</title></circle><text x="'+X(i)+'" y="'+(height-13)+'" text-anchor="middle" font-size="12" fill="#718089">'+p.year+'</text>').join("");
 chartEl.innerHTML='<svg viewBox="0 0 '+width+' '+height+'" style="width:100%;height:auto" role="img" aria-label="Net migration fell from 924,000 in June 2023 to 77,000 in June 2026">'+grid+'<path d="'+path+'" fill="none" stroke="#176f70" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+dots+'</svg>';
}
