import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./header.scss";
import "../../../sass/style.scss";

import { useDispatch, useSelector } from "react-redux";

import { setIsLogged } from "../../store/actions/actions";
import { Services } from "../../store/services";

function Header(props) {
  const dispatch = useDispatch();
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { isLoggedIn, setIsLoggedIn, user } = props;
  const [activeLink, setActiveLink] = useState("Steganography");
  const location = useLocation();

  useEffect(() => {
    // Set the active link state to the current pathname
    setActiveLink(location.pathname);
  }, [location]);

  const openSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

  const handleLogout = async () => {
    await dispatch(Services.logoutUser())
      .then((response) => {
        console.log("Response:", response);
        // Check if logout was successful
        if (response.payload.status === 200) {
          // Handle successful login
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          console.log("Logout successful");
          // dispatch(setIsLogged());
          window.location.reload();
        } else {
          // Handle unsuccessful logout
          console.error("logout failed");
        }
        return 0;
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
  };

  return (
    <header>
      <div className="navbar sticky-top bg-color-dark-purple">
        <div className="container-fluid">
          <a className="navbar-brand text-white" href="/#">
            Info Sec II by Jatin Shrivastava
          </a>
          <nav className="d-flex gap-4">
            <div className="pe-4 row d-flex gap-4">
              <a
                className={`nav-link col ${activeLink === "/" ? "active" : ""}`}
                href="/"
              >
                <span className="align-middle">Steganography</span>
              </a>
              <a
                className={`nav-link col ${
                  activeLink === "/cryptography" ? "active" : ""
                }`}
                href="/cryptography"
              >
                <span className="align-middle">Cryptography</span>
              </a>
            </div>
            {isLoggedIn && user && user.first_name ? ( // Check if user is logged in
              <li className="d-flex mt-1">
                <div
                  className="profile-btn"
                  role="button"
                  tabIndex="0"
                  onClick={() => openSubMenu}
                  onKeyUp={openSubMenu}
                  onMouseEnter={() => setShowSubMenu(true)}
                  onMouseLeave={() => setShowSubMenu(false)}
                >
                  <a className="text-white profile_icon" href="/#">
                    <span className="align-middle">
                      Hello, {user.first_name}
                    </span>
                  </a>
                  <ul className={`nav__submenu ${showSubMenu ? "show" : ""}`}>
                    <li>
                      <a
                        className="text-white"
                        href="/#"
                        onClick={handleLogout}
                      >
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            ) : (
              // If user is not logged in
              <a className="btn bg-color-canilla" href="/login">
                Login
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  setIsLoggedIn: PropTypes.func.isRequired,
  user: PropTypes.object,
};

Header.defaultProps = {
  user: {},
};

export default Header;
