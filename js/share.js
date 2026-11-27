"use strict";
/* Share each evidence card directly using stable URL fragments.
   Native share sheets on mobile; clipboard or a manual-copy prompt elsewhere. */
document.querySelectorAll(".claim .share-claim").forEach(button=>{
  button.addEventListener("click",async()=>{
    const card=button.closest(".claim");
    const link=new URL(window.location.href);
    link.hash=card.id;
    const url=link.toString();
    const label=card.querySelector("h3")?.textContent?.trim()||"ONS migration evidence";
    if(navigator.share){
      try{await navigator.share({title:"UK Migration in Context",text:label,url});return;}
      catch(error){if(error?.name==="AbortError")return;}
    }
    try{
      await navigator.clipboard.writeText(url);
      const text=button.querySelector("span");
      text.textContent="Link copied!";
      window.setTimeout(()=>{text.textContent="Share this claim";},2200);
    }catch(error){
      window.prompt("Copy this link:",url);
    }
  });
});



/* Filter verdicts client-side. Keep every claim and its stable fragment link in the HTML. */
const claimFilters=[...document.querySelectorAll("[data-claim-filter]")];
const claimCards=[...document.querySelectorAll(".claims .claim")];
const filterStatus=document.getElementById("claim-filter-status");
let activeClaimFilter="all";
function applyClaimFilter(filter){
  if(!["all","supported","contradicted","uncertain"].includes(filter))return;
  activeClaimFilter=filter;
  let visible=0;
  claimCards.forEach(card=>{
    const verdict=card.querySelector(".verdict");
    const match=filter==="all"||verdict.classList.contains(filter);
    card.hidden=!match;
    if(match)visible++;
  });
  claimFilters.forEach(button=>{
    const active=button.dataset.claimFilter===filter;
    button.setAttribute("aria-pressed",String(active));
    button.classList.toggle("is-active",active);
  });
  const label=filter==="all"?"all":filter==="uncertain"?"not established":filter;
  if(filterStatus)filterStatus.textContent=filter==="all"?"Showing all "+visible+" claims.":"Showing "+visible+" "+label+" claims.";
}
claimFilters.forEach(button=>button.addEventListener("click",()=>applyClaimFilter(button.dataset.claimFilter)));
function revealLinkedClaim(){
  const id=decodeURIComponent(location.hash.slice(1));
  if(!id.startsWith("claim-"))return;
  const target=document.getElementById(id);
  if(target?.classList.contains("claim")&&target.hidden){
    applyClaimFilter("all");
    target.scrollIntoView({block:"start"});
  }
}
window.addEventListener("hashchange",revealLinkedClaim);
revealLinkedClaim();
