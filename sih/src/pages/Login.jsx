import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Sample users
  const users = {
    student: { username: "student", password: "123", path: "/" },
    teacher: { username: "teacher", password: "456", path: "/teacher" },
    admin: { username: "admin", password: "789", path: "/admin" },
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      username === users.student.username &&
      password === users.student.password
    ) {
      navigate(users.student.path);
    } else if (
      username === users.teacher.username &&
      password === users.teacher.password
    ) {
      navigate(users.teacher.path);
    } else if (
      username === users.admin.username &&
      password === users.admin.password
    ) {
      navigate(users.admin.path);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          width: "320px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Login</h2>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            background: "#2575fc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Login
        </button>
        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;
