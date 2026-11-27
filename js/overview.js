"use strict";
const overviewRoot=document.getElementById("overview-net");
if(overviewRoot){
  const points=DATA.filter(row=>row[0]>=2021).map(row=>({0:row[0],net:row[9]}));
  chart(overviewRoot,points,[{key:"net",label:"Net migration",color:"#176f70"}],{
    step:250,
    title:"UK net migration, years ending June 2021 to June 2026"
  });
}
