// import { combineReducers } from "@reduxjs/toolkit";

import { SET_IS_LOGGED } from "./actionTypes/actionTypes";
// import { restCheckReducer as restCheck } from "./rest_check";

const initialState = {
  isLogged: false,
};

export const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_IS_LOGGED:
      return {
        ...state,
        isLogged: true,
      };
    case "":
      return state;
    default:
      return state;
  }
};
