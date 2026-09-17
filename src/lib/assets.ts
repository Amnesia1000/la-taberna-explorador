/**
 * Registro centralizado de imágenes estáticas de la carpeta /public.
 * Permite control de versiones (cache-busting) para que cuando modifiques
 * un archivo de imagen, los navegadores y Next.js carguen la nueva versión
 * de forma inmediata sin mostrar la versión vieja en caché.
 */
export const ASSETS = {
  logo: "/Logo.png?v=1",
  ficha: "/ficha.png?v=1",
  disponible: "/disponible.png?v=2",
  amplia: "/amplia.png?v=1",
  tavernWall: "/tavern-wall.jpg?v=1",
} as const;
