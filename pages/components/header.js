import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  PaperAirplaneIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Header({ handleSignOut }) {
  const { data: session } = useSession();

  return (
    <nav className=" bg-white w-full flex relative justify-between shadow-xl items-center mx-auto px-8 h-20">
      <a
        href="https://flowbite.com/"
        class="flex items-center rounded-full overflow-hidden"
      >
        <img
          src="https://avatars.githubusercontent.com/u/102989849?v=4"
          class="h-20 "
          alt="Flowbite Logo"
        />
      </a>

      {session ? (
        <a
          onClick={handleSignOut}
          className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 gap-2
        focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
        >
          Sign Out
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            ></path>
          </svg>
        </a>
      ) : (
        <a
          href="/auth/signIn"
          className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 gap-2
         focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
        >
          Sign in
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            ></path>
          </svg>
        </a>
      )}
    </nav>
  );
}
