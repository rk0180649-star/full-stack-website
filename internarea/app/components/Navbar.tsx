"use client";
import { useState } from "react";
import logo from "../Assets/logo.png";
import Link from "next/link";
import { auth, provider } from "../firebase/firebase";
import { Search, Menu, X } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { selectuser, logout } from "../Feature/Userslice";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  photo: string;
}

const Navbar = () => {
  const user = useSelector(selectuser);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handlelogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in successfully");
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    }
  };

  // Universal Logout (Google + Email dono ke liye)
  const handlelogout = async () => {
    try {
      // 1. Firebase Logout (Google User)
      if (auth.currentUser) {
        await signOut(auth);
      }

      // 2. Clear LocalStorage (Email User)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 3. Clear Redux State
      dispatch(logout());

      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  };

  // ... baki ka JSX code waisa hi rahega
  return (
    <div className="relative sticky top-0 z-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex-shrink-0">
                <img src={logo.src} alt="InternArea Logo" className="h-12 w-auto object-contain" />
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/pages/internship" className="text-gray-700 hover:text-blue-600 font-medium text-sm">
                  Internships
                </Link>
                <Link href="/pages/job" className="text-gray-700 hover:text-blue-600 font-medium text-sm">
                  Jobs
                </Link>
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search opportunities..."
                    className="ml-2 bg-transparent focus:outline-none text-sm w-44"
                  />
                </div>
              </div>
            </div>

            {/* destop emailo login buttom */}
            <div className="hidden md:block">
              {!user && (
                <Link
                  href="/pages/gmailloginpage"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-full transition shadow-sm"
                >
                  Email Login
                </Link>
              )}
            </div>
                    
              {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link href="/pages/profile">
                    <img src={user.photo} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
                  </Link>
                  <button
                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
                    onClick={handlelogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlelogin}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center space-x-2 hover:bg-gray-50 text-sm font-medium shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  <Link href="/pages/adminlogin" className="text-xs text-gray-600 hover:text-gray-900 font-medium">
                    Admin
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 focus:outline-none"
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-5 space-y-4 shadow-lg">
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                className="ml-2 bg-transparent focus:outline-none text-sm w-full"
              />
            </div>

            <div className="flex flex-col space-y-3 font-medium text-gray-700">
              <Link
                href="/pages/internship"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600 py-1"
              >
                Internships
              </Link>
              <Link
                href="/pages/job"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600 py-1"
              >
                Jobs
              </Link>
              <Link
                href="/pages/adminlogin"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600 py-1 text-sm text-gray-500"
              >
                Admin Login
              </Link>
            </div>

            {/* Mobile User / Login Button */}
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link
                    href="/pages/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2"
                  >
                    <img src={user.photo} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
                    <span className="text-sm font-medium text-gray-700">Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handlelogout();
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                  >
                    Logout
                  </button>
                </div>
             ) : (
                <div className="flex flex-col gap-2 w-full mt-2">
                  {/* Email Login Button */}
                  <Link
                    href="/pages/gmailloginpage"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                    Email Login
                  </Link>

                  {/* Continue with Google Button */}
                  <button
                    onClick={() => {
                      handlelogin();
                      setIsOpen(false);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 flex items-center justify-center space-x-2 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;