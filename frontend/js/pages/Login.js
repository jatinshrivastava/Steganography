import PropTypes from "prop-types";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setIsLogged } from "../store/actions/actions";
import { Services } from "../store/services"; // Import the loginUser API call

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
      dispatch(Services.loginUser(data))
        .then((response) => {
          console.log("Response:", response);
          // Check if login was successful
          if (response.payload.status === 200) {
            // Handle successful login
            console.log("Login successful");
            // dispatch(setIsLogged());
            localStorage.setItem("user", JSON.stringify(response.payload));
            setIsLoggedIn(true);
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
    <div className="container mb-5 mt-6">
      <div className="col">
        <div className="row d-flex justify-content-center">
          <div className="card shadow-sm mt-5 p-4 w-50">
            <div className="text-center">
              <span>
                <h2>Login</h2>
              </span>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="username">
                    Email
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
                <div className="form-group mt-3">
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
                <button
                  className="btn bg-color-dark-purple text-white mt-3 w-25"
                  type="submit"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
};

export default Login;
