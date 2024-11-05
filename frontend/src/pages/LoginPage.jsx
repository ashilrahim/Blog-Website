import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { usercontext } from "../UserContext";
import { toast, ToastContainer } from "react-toastify";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(usercontext);
  const [loading, setLoading] = useState(false); // Add a loading state

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); // Set loading to true
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      const userInfo = await response.json();
      setUserInfo(userInfo);
      toast.success("Successfully logged in!", {
        autoClose: 3000, // Automatically close after 3 seconds
        closeOnClick: true, // Allow toast to be closed by clicking
      });
      setTimeout(() => {
        setRedirect(true);
      }, 2000);
    } else {
      toast.error("Wrong credentials. Please try again.", {
        autoClose: 3000,
      });
    }
    setLoading(false); // Reset loading state
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form className="login" onSubmit={handleLogin}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      <ToastContainer
        position="top-center"
        autoClose={3000} // Automatically close after 3 seconds
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
      />
    </form>
  );
}
