'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { FaRegFileAlt } from 'react-icons/fa';

export default function LoginPage() {

    const handleGoogleLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 flex">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center mt-1 mb-2">
                            <FaRegFileAlt className="h-5 w-5 text-purple-600 mr-2" />
                            <h1 className="text-2xl font-bold text-purple-600">TaskBuddy</h1>
                        </div>

                        <p className="text-gray-700 font-medium mb-8 max-w-md mx-auto">
                            Streamline your workflow and track progress effortlessly with our all-in-one task management app.
                        </p>
                    </div>


                    <Button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-black text-gray-200 hover:bg-gray-800 border border-gray-900 rounded-md py-3 px-4 font-medium"
                    >
                        <img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt="Google logo"
                            width={20}
                            height={20}
                            className="mr-2 rounded-full"
                        />


                        Continue with Google
                    </Button>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 items-center justify-center relative bg-pink-50 overflow-hidden">
                <div className="absolute w-[800px] h-[800px] rounded-full border-[1px] border-pink-200"></div>
                <div className="absolute w-[600px] h-[600px] rounded-full border-[1px] border-pink-200"></div>
                <div className="absolute w-[400px] h-[400px] rounded-full border-[1px] border-pink-200"></div>
                <div className="absolute w-[200px] h-[200px] rounded-full border-[1px] border-pink-200"></div>


            </div>

        </div>
    );
}