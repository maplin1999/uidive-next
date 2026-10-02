import { useEffect } from "react";

// The old site had one global listener that closed ANY open modal on
// Escape (see closeModalById's keydown handler + the "Lets every modal
// close via Escape key or by clicking its backdrop" comment in app.js) --
// since every modal there shared one DOM structure. Here each modal is its
// own React component, so that behavior has to be opted into individually.
// Call this at the top of a modal component with its own close handler.
export function useEscapeClose(onClose: () => void) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
}
