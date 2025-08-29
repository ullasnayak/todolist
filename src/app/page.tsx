"use client";
import Image from "next/image";
import { NotebookPenIcon } from "lucide-react";
import useSupabaseClient from "@/lib/supabase/client";

const Home = () => {
    const supabase = useSupabaseClient();

    const loginWithGoogle = () => {
        supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="relative flex flex-col md:flex-row h-screen w-screen bg-[#f9f5f3] overflow-hidden p-6 md:p-0">
            <div className="flex flex-col justify-center items-center md:items-start px-6 md:px-20 w-full md:w-1/2 text-center md:text-left z-10">
                <h1 className="text-purple-700 text-3xl font-bold flex items-center gap-2">
                    <NotebookPenIcon size={35} className="text-purple-700" />
                    TaskBuddy
                </h1>
                <p className="mt-3 max-w-xs md:max-w-sm font-semibold font text-xs md:text-base text-gray-700">
                    Streamline your workflow and track progress effortlessly with our
                    all-in-one task management app.
                </p>
                <button
                    className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    onClick={loginWithGoogle}
                    type="button"
                >
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google logo"
                        width={20}
                        height={20}
                        className="mr-2 rounded-full"
                    />
                    Continue with Google
                </button>
            </div>

            <div className="hidden lg:flex w-1/2 items-center justify-center relative bg-pink-50 overflow-hidden">
                <div className="absolute w-[800px] h-[800px] rounded-full border-[1px] border-pink-200"></div>
                <div className="absolute w-[600px] h-[600px] rounded-full border-[1px] border-pink-200"></div>
                <div className="absolute w-[400px] h-[400px] rounded-full border-[1px] border-pink-200"></div>
                <div className="absolute w-[200px] h-[200px] rounded-full border-[1px] border-pink-200"></div>
            </div>
        </div>
    );
};

export default Home;