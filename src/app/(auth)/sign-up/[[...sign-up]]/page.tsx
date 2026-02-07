import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-12 text-slate-100">
      <SignUp />
    </div>
  );
}
