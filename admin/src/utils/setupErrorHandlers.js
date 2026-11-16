import logger from "./logger";
/**
 * Handler global para erros de JS não capturados (fora do ciclo de render — ex:
 * dentro de um onPress ou de uma promise). O ErrorBoundary cuida dos erros de
 * render; este cuida do resto, evitando que o app feche do nada.
 */
export function setupErrorHandlers() {
  if (typeof ErrorUtils === "undefined") return;

  const defaultHandler = ErrorUtils.getGlobalHandler?.();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.error("[GlobalError]", isFatal ? "(fatal)" : "", error);

    // Em produção, logger.error envia o erro ao Sentry (se configurado).

    // Em desenvolvimento, mantém a redbox (ajuda a achar o bug).
    if (__DEV__ && defaultHandler) {
      defaultHandler(error, isFatal);
    }
    // Em produção: não re-propaga — o app segue funcionando quando dá.
  });
}
