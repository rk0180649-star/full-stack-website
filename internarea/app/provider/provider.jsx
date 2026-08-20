"use client";
import { Provider } from "react-redux";
import { store } from "../store/store";
import AuthListener from "../authlistener/authlistener";

export default function Providers({ children}){
  
  return (
    <Provider store={store}>
      <AuthListener />
      {children}
    </Provider>
  );
}