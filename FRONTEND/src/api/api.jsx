
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
});


const register = (email, firstname, lastname, password) => {
  return api.post("/api/auth/register", {
    email,
    firstname,
    lastname,
    password
  });
};


const login = (email, password) => {
  return api.post("/api/auth/login", {
    email,
    password
  });
};


const createChat = (title) => {
  return api.post("/api/chat", {
    title
  });
};


const getChats = () => {
  return api.get("/api/chat");
};

const getMessages = (chatId) => {
  return api.get(`/api/chat/${chatId}/messages`);
};

export {
  register,
  login,
  createChat,
  getChats,
  getMessages
};

