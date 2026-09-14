import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const { token, user } = response.data;

  await AsyncStorage.setItem("accessToken", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));

  return response.data;
};

const register = async (name, email, password) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
};

const logout = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("user");
};

const getStoredUser = async () => {
  const user = await AsyncStorage.getItem("user");

  if (!user) {
    return null;
  }

  return JSON.parse(user);
};

const getToken = async () => {
  return await AsyncStorage.getItem("accessToken");
};

const authService = {
  login,
  register,
  logout,
  getStoredUser,
  getToken,
};

export default authService;