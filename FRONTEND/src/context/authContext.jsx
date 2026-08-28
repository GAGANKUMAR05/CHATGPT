
import { createContext, useState } from "react";

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");


  return (
    <AuthContext.Provider
      value={{
        email,
        setEmail,

        firstname,
        setFirstname,

        lastname,
        setLastname,

        password,
        setPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

