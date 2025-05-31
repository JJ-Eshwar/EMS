
"use client";
import React, { useState, useEffect } from "react"; // Added useEffect for logging example
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";

const Header: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession(); 
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    console.log("Header Session Status:", status);
    console.log("Header Session Data:", session);
  }, [session, status]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  
  const handleSignIn = () => {
    router.push("/sign-in"); 
  };

  
  const handleSignOut = () => {
    signOut({ redirect: false });
    toast.success("SignOut Successful");
    setTimeout(() => {
      router.push("/sign-in");
    }, 1000);
  };

  
  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-full py-1 flex items-center justify-between mx-auto border-b-2 border-gray-300 h-14  z-10 bg-[#f3f7f9]">
      <Image
        src="https://res.cloudinary.com/dhrbg2jbi/image/upload/c_crop,w_600,h_650,g_auto/v1729231721/Untitled_design_1__page-0001_bngic2.jpg"
        height={50}
        width={50}
        alt="logo"
      />

      <div className="md:hidden cursor-pointer" onClick={toggleMenu}>
        {menuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </div>

      <div className="hidden md:flex gap-6">
        <span
          className={`cursor-pointer font-sans ${
            isActive("/about")
              ? "text-primary-red"
              : "text-[#8f9ca3] hover:text-primary-red"
          }`}
          onClick={() => router.push("/about")}
        >
          About
        </span>
        {/* <span
          className={`cursor-pointer font-sans ${
            isActive("/business")
              ? "text-primary-red"
              : "text-[#8f9ca3] hover:text-primary-red"
          }`}
          onClick={() => router.push("/business")}
        >
          For Business
        </span> */}
        <span
          className={`cursor-pointer font-sans ${
            isActive("/demo")
              ? "text-primary-red"
              : "text-[#8f9ca3] hover:text-primary-red"
          }`}
          onClick={() => router.push("/demo")}
        >
          Try for free
        </span>
        <span
          className={`cursor-pointer font-sans ${
            isActive("/Pricing") // Consider if this should be /Information/Pricing based on mobile menu
              ? "text-primary-red"
              : "text-[#8f9ca3] hover:text-primary-red"
          }`}
          onClick={() => router.push("/Pricing")}
        >
          Pricing
        </span>
      </div>

      <div className="hidden md:flex gap-2">
        {session ? ( 
          <button
            className="bg-[#ffe8e5] shadow-sm h-8 px-4 rounded-2xl"
            onClick={handleSignOut}
          >
            <span className="text-primary-red font-sans">Sign Out</span>
          </button>
        ) : (
          <button
            className="bg-[#ffe8e5] shadow-sm h-8 px-4 rounded-2xl"
            onClick={handleSignIn}
          >
            <span className="text-primary-red font-sans">Sign In</span>
          </button>
        )}
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-[#f3f7f9] flex flex-col items-start p-4 z-20">
          <span
            className={`cursor-pointer font-sans ${
              isActive("/about")
                ? "text-primary-red"
                : "text-[#8f9ca3] hover:text-primary-red"
            } py-2`}
            onClick={() => { router.push("/about"); setMenuOpen(false); }}
          >
            About
          </span>
          {/* <span
            className={`cursor-pointer font-sans ${
              isActive("/business")
                ? "text-primary-red"
                : "text-[#8f9ca3] hover:text-primary-red"
            } py-2`}
            onClick={() => { router.push("/business"); setMenuOpen(false); }}
          >
            For Business
          </span> */}
          <span
            className={`cursor-pointer font-sans ${
              isActive("/demo")
                ? "text-primary-red"
                : "text-[#8f9ca3] hover:text-primary-red"
            } py-2`}
            onClick={() => { router.push("/demo"); setMenuOpen(false); }}
          >
            Try for free
          </span>
          <span
            className={`cursor-pointer font-sans ${
              isActive("/Pricing") // Corrected from /Information/Pricing to match desktop
                ? "text-primary-red"
                : "text-[#8f9ca3] hover:text-primary-red"
            } py-2`}
            onClick={() => { router.push("/Pricing"); setMenuOpen(false); }}
          >
            Pricing
          </span>
          {/* Adding Sign In/Sign Out to mobile menu for completeness */}
          <div className="py-2 w-full">
            {session ? (
              <button
                className="bg-[#ffe8e5] shadow-sm h-8 px-4 rounded-2xl w-full text-left"
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
              >
                <span className="text-primary-red font-sans">Sign Out</span>
              </button>
            ) : (
              <button
                className="bg-[#ffe8e5] shadow-sm h-8 px-4 rounded-2xl w-full text-left"
                onClick={() => { handleSignIn(); setMenuOpen(false); }}
              >
                <span className="text-primary-red font-sans">Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;

