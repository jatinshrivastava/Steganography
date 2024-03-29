import PropTypes from "prop-types";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setIsLogged } from "../store/actions/actions";
import { loginUser } from "../store/services"; // Import the loginUser API call

function Login({ setIsLoggedIn, setUser }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    // Make API call to login user
    if (username && password) {
      const data = { username, password };
      dispatch(loginUser(data))
        .then((response) => {
          console.log("Response:", response);
          // Check if login was successful
          if (response.payload.status === 200) {
            // Handle successful login
            console.log("Login successful");
            // dispatch(setIsLogged());
            localStorage.setItem("user", JSON.stringify(response.payload));
            setIsLoggedIn(localStorage.getItem("user"));
            setUser(response.payload);
            setUsername("");
            setPassword("");
            setError("");
            navigate("/");
          } else {
            // Handle unsuccessful login
            console.error("Login failed");
            setError("Invalid username or password");
          }
          return 0;
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle error here
        });
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">
            Username
            <input
              className="form-control"
              id="username"
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="password">
            Password
            <input
              className="form-control"
              id="password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

Login.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
};

export default Login;
