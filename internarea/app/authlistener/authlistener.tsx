"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../firebase/firebase";
import { login, logout } from '../Feature/Userslice'

export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    return auth.onAuthStateChanged((authuser) => {
      if (authuser) {
        dispatch(
          login({
            uid: authuser.uid,
            photo: authuser.photoURL,
            name: authuser.displayName,
            email: authuser.email,
            phoneNumber: authuser.phoneNumber,
          })
        );
      } else {
        dispatch(logout());
      }
    });
  }, [dispatch]);

  return null;
}