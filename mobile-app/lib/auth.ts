import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken } from "./api";

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  setToken(token);
}

export async function loadToken() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) setToken(token);
  return token;
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  setToken(null);
}
