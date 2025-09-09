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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login Page</h2>
      <form onSubmit={handleLogin} style={{ display: "inline-block" }}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: "8px", margin: "5px" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "8px", margin: "5px" }}
          />
        </div>
        <button
          type="submit"
          style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}
        >
          Login
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
