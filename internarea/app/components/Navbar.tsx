"use client";
import {useEffect, useRef, useState} from "react";
import logo from "../Assets/logo.png";
import Link from "next/link";
import {auth, provider} from "../firebase/firebase";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectuser } from "../Feature/Userslice";


interface User{
    name: string;
    email: string;
    photo: string;
}

const Navbar = () => {
   const user=useSelector(selectuser)

    const handlelogin = async() =>{
      try{
        await signInWithPopup(auth, provider);
        toast.success("loggesd in succesfully")
      }catch (error){
        console.error(error);
        toast.error("login failed");

      }



      //  setuser({
       //     name: 'rupesh',
        //    email: 'rk0180649@gmail.com',
        //    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=640&h=640&fit=crop&crop=faces"
       // });
    };

    const handlelogout = () =>{
      signOut(auth);
    };

   {/* useEffect(() => {
    const handleclickOutside = (event: any) => {
    if (
      dropdownref.current &&
      !dropdownref.current.contains(event.target)
    ) {
      setisprofiledropdown(false);
    }
   };
    document.addEventListener("mousedown", handleclickOutside);

    return () =>
    document.removeEventListener(
      "mousedown",
      handleclickOutside
    );
   }, []); */}

    return(
        <div className="relative">
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex  h-16 items-center space-x-20 ">
                {/* logo */}
                <div className="flex-shrink-0" >
                    <a href="/"  className="text-xl font-bold text-blue-600">
                    <img src={logo.src} alt="" className="h-16"/> 
                    </a>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8"
                 >  {/*  ref={dropdownref} yah uper div me laga tha hidden md me*/}

               <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
               <Link href={"/pages/internship"}>
               <span>Internships</span>
               </Link>
               </button>

               <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
               <Link href={"/pages/job"}>
               <span>Jobs</span>
               </Link>
               </button>

              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={16} className="text-gray-400"  />
              <input
                  type="text"
                  placeholder="Search opportunities..."
                 className="ml-2 bg-transparent focus:outline-none text-sm w-48"
              />
              </div>
              </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative flex">
                <button
                  className="flex items-center space-x-2"   
                >{/* onClick={() => setisprofiledropdown(!isprofiledropdown)}  uper wala butttom me tha */}
                  <Link href={"pages/profile"}>
                  <img
                    src={user.photo}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  </Link>
              {/*delete somethings */}
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
                  onClick={handlelogout}
                >
                  Logout
                </button>
              {/*  {isprofiledropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <p className="text-sm text-gray-700 font-semibold">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                )}*/}
              </div>
            ) : (
              <>
                  <button
                   onClick={handlelogin}
                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-center space-x-2 hover:bg-gray-50"
                   >
            <svg className="w-5 h-5 viewBox=0 0 24 24">
               <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
               <path
               fill="#34A853"
               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
               />
               <path
               fill="#FBBC05"
               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
               />
               <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                 />
            </svg>
                  {/* Google SVG yahan hai */}
                  <span className="font-medium">Continue with Google</span>
                  </button>
{/*
                  <button className="bg-blue-600 text-white font-medium text-xs  px-4 py-1.5 rounded-full hover:bg-blue-700">
                    {""}
                  <Link href="/">Register</Link>
                  </button>*/}
                  <a href="/pages/adminlogin" className="text-xs text-gray-600 hover:text-gray-900 font-medium">
                  Admin
                  </a>
                  </>
                )}
                </div>
              </div>
            </div>
          </nav>
        </div>
        
    );

}

export default Navbar;