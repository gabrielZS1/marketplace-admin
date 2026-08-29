import Constants from "expo-constants";

const WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId ?? "";

let configured = false;

// A lib é um módulo nativo — pode não existir num build antigo (sem o rebuild).
// Carregamos com require() protegido pra o app não quebrar na importação.
function getModule() {
  try {
    return require("@react-native-google-signin/google-signin");
  } catch {
    return null;
  }
}

export function configureGoogleSignIn() {
  const mod = getModule();
  if (!mod || configured || !WEB_CLIENT_ID) return;
  mod.GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
  configured = true;
}

/**
 * Abre o fluxo do Google e devolve { idToken } — ou null se o usuário cancelou.
 * Lança Error (mensagem pt-BR) em qualquer outra falha.
 */
export async function signInWithGoogle() {
  const mod = getModule();
  if (!mod) {
    throw new Error(
      "Login com Google indisponível nesta versão do app. Atualize para a versão mais recente.",
    );
  }
  if (!WEB_CLIENT_ID) {
    throw new Error("Login com Google não está configurado.");
  }

  configureGoogleSignIn();

  const { GoogleSignin, statusCodes } = mod;

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();

    // v13+ : { type: "success", data: { idToken } }  |  versões antigas: { idToken }
    const idToken = result?.data?.idToken ?? result?.idToken ?? null;
    if (!idToken) {
      throw new Error("Não foi possível obter o token do Google.");
    }
    return { idToken };
  } catch (err) {
    if (
      err?.code === statusCodes?.SIGN_IN_CANCELLED ||
      err?.code === statusCodes?.IN_PROGRESS
    ) {
      return null;
    }
    if (err?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error("Google Play Services indisponível ou desatualizado.");
    }
    throw new Error(err?.message || "Falha ao entrar com o Google.");
  }
}
