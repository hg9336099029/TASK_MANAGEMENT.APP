"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";

const UserContext = React.createContext();

// Set global axios config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://task-management-app-2-0a9j.onrender.com/api/v1";
//axios.defaults.baseURL = "http://localhost:8000/api/v1";
export const UserContextProvider = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [userState, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();
    if (!userState.email.includes("@") || userState.password.length < 6) {
      toast.error("Enter valid email & password (min 6 chars)");
      return;
    }

    try {
      await axios.post("/register", userState);
      toast.success("User registered successfully");
      setUserState({ name: "", email: "", password: "" });
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/login", {
        email: userState.email,
        password: userState.password,
      });

      toast.success("Logged in successfully");
      setUserState({ email: "", password: "" });

      await getUser();
      router.push("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const logoutUser = async () => {
    try {
      await axios.get("/logout");
      setUser({});
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const userLoginStatus = async () => {
    try {
      const res = await axios.get("/login-status");
      return !!res.data;
    } catch {
      return false;
    }
  };

  const getUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/user");
      setUser(res.data);
    } catch {
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (e, data) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch("/user", data);
      setUser(res.data);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const emailVerification = async () => {
    setLoading(true);
    try {
      await axios.post("/verify-email");
      toast.success("Verification email sent");
    } catch {
      toast.error("Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (verifyToken) => {
    setLoading(true);
    try {
      await axios.post(`/verify-user/${verifyToken}`);
      toast.success("Email verified");
      await getUser();
      router.push("/");
    } catch {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordEmail = async (email) => {
    setLoading(true);
    try {
      await axios.post("/forgot-password", { email });
      toast.success("Reset email sent");
    } catch {
      toast.error("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetToken, password) => {
    setLoading(true);
    try {
      await axios.post(`/reset-password/${resetToken}`, { password });
      toast.success("Password reset");
      router.push("/login");
    } catch {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await axios.patch("/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed");
    } catch {
      toast.error("Change failed");
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/users");
      setAllUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      getAllUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handlerUserInput = (name) => (e) => {
    setUserState((prev) => ({
      ...prev,
      [name]: e.target.value,
    }));
  };

  useEffect(() => {
    const checkLoginAndGetUser = async () => {
      const loggedIn = await userLoginStatus();
      if (loggedIn) {
        await getUser();
      }
    };
    checkLoginAndGetUser();
  }, []);

  useEffect(() => {
    if (user.role === "admin") {
      getAllUsers();
    }
  }, [user.role]);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        userState,
        handlerUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
        allUsers,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
