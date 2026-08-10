// Alias de compatibilidad → la implementación vive en /api/signal (nombre
// neutro que los adblockers no bloquean). Se mantiene para no perder eventos
// de páginas ya cacheadas que aún apuntan a /api/track.
export { POST } from "../signal/route";
