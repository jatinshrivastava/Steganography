import * as Sentry from "@sentry/react";
import React, { useState } from "react";
import { Provider } from "react-redux";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Header from "./components/header/header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import configureStore from "./store";

const store = configureStore({});
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <Provider store={store}>
        <BrowserRouter>
          {isLoggedIn ? (
            <Header
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              user={user}
            />
          ) : (
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          )}
          <Routes>
            <Route
              element={<Home isLoggedIn={isLoggedIn} user={user} />}
              path="/"
            />
            <Route
              element={
                <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
              }
              path="/login"
            />
            {/* Add more routes here */}
          </Routes>
        </BrowserRouter>
      </Provider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
