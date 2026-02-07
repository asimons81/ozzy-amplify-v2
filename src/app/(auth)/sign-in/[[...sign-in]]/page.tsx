import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-12 text-slate-100">
      <SignIn />
    </div>
  );
}
