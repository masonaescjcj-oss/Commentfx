/** Small country flags, drawn rather than fetched, so they cost no request. */
const SHAPES: Record<string, string> = {
  GB: '<rect width="20" height="14" fill="#0B2C6B"/><path d="M0 0l20 14M20 0 0 14" stroke="#fff" stroke-width="2.6"/><path d="M0 0l20 14M20 0 0 14" stroke="#CE1124" stroke-width="1.3"/><path d="M10 0v14M0 7h20" stroke="#fff" stroke-width="3.6"/><path d="M10 0v14M0 7h20" stroke="#CE1124" stroke-width="2"/>',
  AU: '<rect width="20" height="14" fill="#0B2C6B"/><path d="M0 0l9 6.5M9 0 0 6.5" stroke="#fff" stroke-width="1.2"/><circle cx="14.5" cy="9.5" r="1.5" fill="#fff"/><circle cx="16.8" cy="4" r="1" fill="#fff"/>',
  // The island plus the two olive branches. Without the branches it reads as a
  // smudge at 20px, which is the only size this is ever drawn at.
  CY: '<rect width="20" height="14" fill="#fff"/><path d="M5.4 4.9 12.6 4.2l2.8 1-1.7 1.2-2.9.2-1.2 1-2.2-.2-.9-1.2-1.1-.3Z" fill="#D57800"/><path d="M8.3 8.9c1.1 1 2.3 1 3.4 0" stroke="#4E9F3D" stroke-width=".85" fill="none" stroke-linecap="round"/><path d="M8.9 10c.7.6 1.5.6 2.2 0" stroke="#4E9F3D" stroke-width=".75" fill="none" stroke-linecap="round"/>',
  SC: '<rect width="20" height="14" fill="#fff"/><path d="M0 14 0 0h5Z" fill="#003F87"/><path d="M0 14 5 0h5.5Z" fill="#FCD856"/><path d="M0 14 10.5 0H20Z" fill="#D62828"/><path d="M0 14 20 0v6.5Z" fill="#fff"/><path d="M0 14 20 6.5V14Z" fill="#007A3D"/>',
  ZA: '<rect width="20" height="14" fill="#002395"/><rect width="20" height="7" fill="#DE3831"/><path d="M0 0l8 7-8 7z" fill="#007A4D"/><path d="M0 1.6 6.4 7 0 12.4z" fill="#fff"/><path d="M0 3.4 4.6 7 0 10.6z" fill="#000"/>',
  MU: '<rect width="20" height="3.5" fill="#EA2839"/><rect y="3.5" width="20" height="3.5" fill="#1A206D"/><rect y="7" width="20" height="3.5" fill="#FFD500"/><rect y="10.5" width="20" height="3.5" fill="#00A551"/>',
  BZ: '<rect width="20" height="14" fill="#003F87"/><rect width="20" height="2.2" fill="#CE1126"/><rect y="11.8" width="20" height="2.2" fill="#CE1126"/><circle cx="10" cy="7" r="3.4" fill="#fff"/>',
  VC: '<rect width="20" height="14" fill="#FCD116"/><rect width="6" height="14" fill="#0072C6"/><rect x="14" width="6" height="14" fill="#009E49"/>',
  AE: '<rect width="20" height="14" fill="#fff"/><rect width="20" height="4.66" fill="#00843D"/><rect y="9.33" width="20" height="4.67" fill="#000"/><rect width="5.5" height="14" fill="#CE1126"/>',
  SG: '<rect width="20" height="14" fill="#fff"/><rect width="20" height="7" fill="#ED2939"/><circle cx="5" cy="3.5" r="2.2" fill="#fff"/><circle cx="6" cy="3.5" r="2.2" fill="#ED2939"/>',
  US: '<rect width="20" height="14" fill="#fff"/><path d="M0 2h20M0 6h20M0 10h20" stroke="#B22234" stroke-width="2"/><rect width="9" height="7" fill="#3C3B6E"/>',
  DE: '<rect width="20" height="4.67" fill="#000"/><rect y="4.67" width="20" height="4.66" fill="#DD0000"/><rect y="9.33" width="20" height="4.67" fill="#FFCE00"/>',
  CH: '<rect width="20" height="14" fill="#D52B1E"/><rect x="8.4" y="3.4" width="3.2" height="7.2" fill="#fff"/><rect x="6.4" y="5.4" width="7.2" height="3.2" fill="#fff"/>',
  MT: '<rect width="20" height="14" fill="#fff"/><rect x="10" width="10" height="14" fill="#CF142B"/>',
  CZ: '<rect width="20" height="7" fill="#fff"/><rect y="7" width="20" height="7" fill="#D7141A"/><path d="M0 0l8.2 7L0 14z" fill="#11457E"/>',
  IL: '<rect width="20" height="14" fill="#fff"/><rect y="2" width="20" height="1.8" fill="#0038B8"/><rect y="10.2" width="20" height="1.8" fill="#0038B8"/><path d="M10 4.6l2.6 4.5H7.4z" fill="none" stroke="#0038B8" stroke-width=".9"/><path d="M10 9.9 7.4 5.4h5.2z" fill="none" stroke="#0038B8" stroke-width=".9"/>',
};

export function Flag({ code, w = 16, title }: { code: string; w?: number; title?: string }) {
  // hasOwn, not a bare lookup: a code of "constructor" would otherwise reach
  // dangerouslySetInnerHTML with something off Object.prototype.
  const shape = Object.hasOwn(SHAPES, code) ? SHAPES[code] : undefined;
  const h = Math.round((w / 20) * 14);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 20 14"
      role="img"
      aria-label={title ?? code}
      className="shrink-0 rounded-[3px]"
      style={{ boxShadow: 'inset 0 0 0 1px rgb(13 20 33 / 0.08)' }}
      dangerouslySetInnerHTML={{ __html: shape ?? '<rect width="20" height="14" fill="#D8DCE4"/>' }}
    />
  );
}
