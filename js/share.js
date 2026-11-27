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

