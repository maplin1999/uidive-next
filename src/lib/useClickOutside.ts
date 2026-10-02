import { RefObject, useEffect } from "react";

// Same pattern Header.tsx's account dropdown and HeroSearch.tsx's Where/
// When/Activity dropdowns already use by hand -- closes whatever's open
// when the person clicks anywhere outside the given element. Pulled out
// here so every dropdown/menu can opt in instead of reimplementing (or
// forgetting to implement) the same document-click listener.
export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [ref, onOutside]);
}
