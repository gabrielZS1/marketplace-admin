import { reportError } from "../services/monitoring";

// Logs só em desenvolvimento. Em produção:
//  - log / warn não fazem nada (nada de dados do usuário no log do aparelho);
//  - error vai para o relatório de falhas (Sentry), se estiver ativo.

const noop = () => {};

function errorInProduction(...args) {
  const err = args.find((a) => a instanceof Error);
  if (err) {
    const label = args.find((a) => typeof a === "string");
    reportError(err, label ? { contexto: label } : undefined);
    return;
  }
  reportError(args.filter((a) => typeof a === "string").join(" ") || "Erro sem mensagem");
}

const logger = __DEV__
  ? {
      log: (...args) => console.log(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args),
    }
  : {
      log: noop,
      warn: noop,
      error: errorInProduction,
    };

export default logger;
