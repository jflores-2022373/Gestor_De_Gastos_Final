/** Fecha de hoy en formato YYYY-MM-DD según la hora LOCAL (no UTC). */
export function hoyLocal(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Convierte "2026-09-20T12:00:00.000Z" en "2026-09-20" para un <input type="date">. */
export function aFechaInput(iso: string): string {
  return iso.slice(0, 10);
}
