const landingImages = import.meta.glob('@/assets/landing/*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
});

const resolveLandingAsset = (filename) => {
  const matchKey = Object.keys(landingImages).find((path) =>
    path.endsWith(`/${filename}`)
  );
  return matchKey ? landingImages[matchKey] : null;
};

// TODO: Subir imágenes reales en apps/web/src/assets/landing/ con estos nombres exactos:
export const LANDING_ASSET_PATHS = {
  joseOperador: 'apps/web/src/assets/landing/jose-operador.webp',
  appCaja: 'apps/web/src/assets/landing/app-caja.webp',
  appGastos: 'apps/web/src/assets/landing/app-gastos.webp',
  appReporte: 'apps/web/src/assets/landing/app-reporte.webp',
};

export const LANDING_ASSETS = {
  joseOperador: resolveLandingAsset('jose-operador.webp'),
  appCaja: resolveLandingAsset('app-caja.webp'),
  appGastos: resolveLandingAsset('app-gastos.webp'),
  appReporte: resolveLandingAsset('app-reporte.webp'),
};
