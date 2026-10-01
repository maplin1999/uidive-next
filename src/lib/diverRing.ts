// Ported from the old site's diverCertRingClass() (app.js). Returns one of
// the .diver-ring-* classes defined in globals.css for a diver's avatar
// border, based on their certification (and verified-host status, when
// known -- most call sites don't have that cheaply available, so it
// defaults to false and just falls back to the cert-based ring).
export function diverCertRingClass(cert: string | null | undefined, isVerified = false): string {
  if (isVerified) return "diver-ring-verified";
  switch (cert) {
    case "Instructor":
      return "diver-ring-instructor";
    case "Divemaster":
      return "diver-ring-divemaster";
    case "Rescue Diver":
      return "diver-ring-rescue";
    case "Advanced Open Water":
      return "diver-ring-advanced";
    case "Open Water Diver":
      return "diver-ring-openwater";
    default:
      return "diver-ring-none";
  }
}
