import GoogleSignInButton from "@/components/auth/google-signin-button";

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <GoogleSignInButton />
    </div>
  );
}
