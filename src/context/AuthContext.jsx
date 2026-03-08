import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const user = sessionStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse user from sessionStorage:", error);
      return null;
    }
  });

  const updateUser = (data) => {
    setCurrentUser(data);
  };

  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem("user", JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to save user to sessionStorage:", error);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
