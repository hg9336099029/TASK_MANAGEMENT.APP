import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const UserContext = React.createContext();

// Always include credentials for cross-origin cookies
axios.defaults.withCredentials = true;

export const UserContextProvider = ({ children }) => {
  const token = Cookies.get("token");

  //const serverUrl = "https://task-management-app-2-0a9j.onrender.com/api/v1";
  const serverUrl = "http://localhost:8000"; // or your production backend URL
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
      await axios.post(`${serverUrl}/api/v1/register`, userState);
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
      const res = await axios.post(
        `${serverUrl}/api/v1/login`,
        {
          email: userState.email,
          password: userState.password,
        }
      );

      Cookies.set("token", res.data.token, {
        expires: 2,
        secure: true,
        sameSite: "None",
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
      // if backend handles logout with cookie clearing, call this:
      // await axios.get(`${serverUrl}/api/v1/logout`);
      Cookies.remove("token", {
        secure: true,
        sameSite: "None",
      });

      setUser({});
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const userLoginStatus = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/login-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return !!res.data;
    } catch (error) {
      return false;
    }
  };

  const getUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
    } catch (error) {
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (e, data) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.patch(`${serverUrl}/api/v1/user`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      await axios.post(
        `${serverUrl}/api/v1/verify-email`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Verification email sent");
    } catch (error) {
      toast.error("Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (verifyToken) => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/verify-user/${verifyToken}`);
      toast.success("Email verified");
      await getUser();
      router.push("/");
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordEmail = async (email) => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/forgot-password`, { email });
      toast.success("Reset email sent");
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetToken, password) => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/v1/reset-password/${resetToken}`, {
        password,
      });
      toast.success("Password reset");
      router.push("/login");
    } catch (error) {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await axios.patch(
        `${serverUrl}/api/v1/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Password changed");
    } catch (error) {
      toast.error("Change failed");
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/v1/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllUsers(res.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${serverUrl}/api/v1/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User deleted");
      getAllUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handlerUserInput = (name) => (e) => {
    setUserState((prevState) => ({
      ...prevState,
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
