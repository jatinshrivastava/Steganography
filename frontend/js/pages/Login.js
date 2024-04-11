import PropTypes from "prop-types";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setIsLogged } from "../store/actions/actions";
import { Services } from "../store/services"; // Import the loginUser API call

function Login({ setIsLoggedIn, setUser }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Signup state
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    // Make API call to login user
    if (loginUsername && loginPassword) {
      const data = { username: loginUsername, password: loginPassword };
      dispatch(Services.loginUser(data))
        .then((response) => {
          console.log("Response:", response);
          // Check if login was successful
          if (response.payload.status === 200) {
            // Handle successful login
            console.log("Login successful");
            localStorage.setItem("user", JSON.stringify(response.payload));
            setIsLoggedIn(true);
            setUser(response.payload);
            setLoginUsername("");
            setLoginPassword("");
            setLoginError("");
            navigate("/");
          } else {
            // Handle unsuccessful login
            console.error("Login failed");
            setLoginError("Invalid username or password");
          }
          return 0;
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle error here
        });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    // Make API call to signup user
    if (
      signupFirstName &&
      signupLastName &&
      signupEmail &&
      signupPassword &&
      confirmPassword
    ) {
      if (signupPassword !== confirmPassword) {
        setSignupError("Passwords do not match");
        return;
      }
      const data = {
        first_name: signupFirstName,
        last_name: signupLastName,
        email: signupEmail,
        password: signupPassword,
      };
      dispatch(Services.signupUser(data))
        .then((response) => {
          console.log("Signup Response:", response);
          // Check if signup was successful
          if (response.payload.status === 200) {
            // Handle successful signup
            console.log("Signup successful");
            // Show success alert
            alert("Signup successful! Please login.");
            setSignupFirstName("");
            setSignupLastName("");
            setSignupEmail("");
            setSignupPassword("");
            setConfirmPassword("");
            setSignupError("");
            setIsLogin(true);
            navigate("/login"); // Navigate to login after successful signup
          } else {
            // Handle unsuccessful signup
            console.error("Signup failed");
            setSignupError("Signup failed, please try again");
          }
          return 0;
        })
        .catch((error) => {
          console.error("Signup Error:", error);
          // Handle error here
        });
    }
  };

  const swap = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="container mb-5 mt-6">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm mt-5 p-4">
            <div className="text-center">
              {isLogin ? <h2>Login</h2> : <h2>Sign up</h2>}
              <div className="mt-4">
                {isLogin ? (
                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <label htmlFor="loginUsername">
                        Email{" "}
                        <input
                          className="form-control"
                          id="loginUsername"
                          required
                          type="text"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label htmlFor="loginPassword">
                        Password{" "}
                        <input
                          className="form-control"
                          id="loginPassword"
                          required
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                      </label>
                    </div>
                    {loginError && (
                      <div className="alert alert-danger">{loginError}</div>
                    )}
                    <button
                      className="btn bg-color-dark-purple text-white mt-3 w-100"
                      type="submit"
                    >
                      Login
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup}>
                    <div className="form-group">
                      <label htmlFor="signupFirstName">
                        First Name{" "}
                        <input
                          className="form-control"
                          id="signupFirstName"
                          required
                          type="text"
                          value={signupFirstName}
                          onChange={(e) => setSignupFirstName(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label htmlFor="signupLastName">
                        Last Name{" "}
                        <input
                          className="form-control"
                          id="signupLastName"
                          required
                          type="text"
                          value={signupLastName}
                          onChange={(e) => setSignupLastName(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label htmlFor="signupEmail">
                        Email{" "}
                        <input
                          className="form-control"
                          id="signupEmail"
                          required
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label htmlFor="signupPassword">
                        Password{" "}
                        <input
                          className="form-control"
                          id="signupPassword"
                          required
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">
                        Confirm Password{" "}
                        <input
                          className="form-control"
                          id="confirmPassword"
                          required
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </label>
                    </div>
                    {signupError && (
                      <div className="alert alert-danger">{signupError}</div>
                    )}
                    <button
                      className="btn bg-color-dark-purple text-white mt-3 w-100"
                      type="submit"
                    >
                      Sign up
                    </button>
                  </form>
                )}
                <p className="pt-2">
                  {isLogin ? (
                    <>
                      Don't have an account?&nbsp;
                      <button
                        className="btn btn-link text-decoration-none p-0"
                        type="button"
                        onClick={swap}
                      >
                        Sign up!
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?&nbsp;
                      <button
                        className="btn btn-link text-decoration-none p-0"
                        type="button"
                        onClick={swap}
                      >
                        Login!
                      </button>
                    </>
                  )}
                </p>
              </div>
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
