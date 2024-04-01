import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import "./header.scss";
import "../../../sass/style.scss";

import { useDispatch, useSelector } from "react-redux";
import { setIsLogged } from "../../store/actions/actions";
import { Services } from "../../store/services";

function Header(props) {
  const dispatch = useDispatch();
  let [showSubMenu, setShowSubMenu] = useState(false);
  const { isLoggedIn, setIsLoggedIn, user } = props;

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
            Steganography App
          </a>
          {isLoggedIn && user && user.first_name ? ( // Check if user is logged in
            <nav>
              <li>
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
                    Hello, {user.first_name}
                  </a>
                  <ul className={`nav__submenu ${showSubMenu ? "show" : ""}`}>
                    <li>
                      <a
                        className="text-white"
                        href={handleLogout}
                        onClick={handleLogout}
                      >
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </nav>
          ) : (
            // If user is not logged in
            <a className="btn bg-color-canilla" href="/login">
              Login
            </a>
          )}
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
