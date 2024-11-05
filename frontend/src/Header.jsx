import { useContext } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { usercontext } from "./UserContext";
import { toast, ToastContainer } from "react-toastify";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(usercontext);

  useEffect(() => {
    fetch("http://localhost:5000/profile", {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, [setUserInfo]);

  function Logout() {
    fetch("http://localhost:5000/logout", {
      credentials: "include",
      method: "POST",
    }).then((response) => {
      if (response.ok) {
        setUserInfo(null); // Update user context
        toast.success("Logged out successfully"); // Show success toast
      } else {
        toast.error("Failed to log out. Please try again."); // Optional error handling
      }
    });
  }

  const username = userInfo?.username;
  return (
    <>
      <header>
        <Link to="/" className="logo">
          MyBlog
        </Link>
        <nav>
          {username && (
            <>
              <Link to="/create">Create New Post</Link>
              <a onClick={Logout}>Logout</a>
            </>
          )}
          {!username && (
            <>
              <Link to="/login">login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        
      />
    </>
  );
}
