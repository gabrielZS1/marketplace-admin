import { useState } from "react";
import { Text, View } from "react-native";
import { authApi } from "../../api/authApi";
import Screen from "../../components/ui/Screen";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";

export default function ChangePasswordScreen({ navigation }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const valid =
    current.length > 0 && next.length >= 8 && next === confirm;

  async function handleSave() {
    if (!valid || loading) return;
    setError(null);
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: next });
      setDone(true);
    } catch (err) {
      setError(err.message || "Não foi possível trocar a senha.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Screen
        navigation={navigation}
        title="Senha alterada"
        footer={<Button title="Voltar" onPress={() => navigation.goBack()} />}
      >
        <Text className="mt-4 text-[14px] leading-5 text-gray-500">
          Pronto! Sua senha foi atualizada. Use a nova senha no próximo login.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      navigation={navigation}
      title="Trocar senha"
      footer={
        <Button title="Salvar nova senha" onPress={handleSave} loading={loading} disabled={!valid} />
      }
    >
      <Field
        label="Senha atual"
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
        autoCapitalize="none"
      />
      <Field
        label="Nova senha"
        value={next}
        onChangeText={setNext}
        secureTextEntry
        autoCapitalize="none"
        placeholder="Mínimo 8 caracteres"
      />
      <Field
        label="Confirmar nova senha"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
      />

      {next.length > 0 && next.length < 8 ? (
        <Text className="mt-2 text-[12px] text-gray-400">A senha precisa ter pelo menos 8 caracteres.</Text>
      ) : null}
      {confirm.length > 0 && next !== confirm ? (
        <Text className="mt-2 text-[12px] text-red-600">As senhas não conferem.</Text>
      ) : null}
      {error ? <Text className="mt-3 text-[13px] text-red-600">{error}</Text> : null}
    </Screen>
  );
}
