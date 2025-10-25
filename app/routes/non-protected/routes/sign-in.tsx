import { SignIn } from "@clerk/react-router";
import React from "react";

export default function SignedInPage() {
  return <SignIn routing="hash" />;
}
