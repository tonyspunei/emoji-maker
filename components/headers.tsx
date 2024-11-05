"use client";

import { Button } from "./ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Headers() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="flex justify-end items-center space-x-4 my-4 mr-4">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <div className="md:hidden">
        <Button 
          variant="ghost"
          size="icon"
          aria-label="Toggle Menu"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
    </header>
  );
}