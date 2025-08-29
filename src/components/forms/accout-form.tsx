"use client";
import { useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Avatars from "../avathar";
import { signOutAction } from "@/app/actions";
import { useGetProfile } from "../hooks/query/task";
import { useUpdateProfile } from "../hooks/mutation/task";

export default function AccountForm({ user }: { user: User | null }) {
    const { data: profile } = useGetProfile(user?.id);
    const updateProfileMutation = useUpdateProfile();

    const [fullname, setFullname] = useState<string | null>(
        profile?.full_name || null
    );
    const [username, setUsername] = useState<string | null>(
        profile?.username || null
    );
    const [website, setWebsite] = useState<string | null>(
        profile?.website || null
    );
    const [avatar_url, setAvatarUrl] = useState<string | null>(
        profile?.avatar_url || null
    );

    useEffect(() => {
        if (profile) {
            setFullname(profile.full_name || "");
            setUsername(profile.username || "");
            setWebsite(profile.website || "");
            setAvatarUrl(profile.avatar_url || "");
        }
    }, [profile]);

    const handleUpdateProfile = () => {
        if (!user?.id) return;

        updateProfileMutation.mutate({
            userId: user.id,
            fullname,
            username,
            website,
            avatar_url,
        });
    };

    return (
        <Card className="w-full max-w-2xl p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl shadow-purple-100/50 border border-white/20 mx-auto mt-8">
            <CardContent className="flex flex-col space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center text-center">
                    <Avatars
                        uid={user?.id ?? null}
                        url={avatar_url}
                        size={100}
                        onUpload={(url) => {
                            setAvatarUrl(url);
                            handleUpdateProfile();
                        }}
                    />
                    <span className="text-gray-600 text-sm mt-2">{user?.email}</span>
                </div>

                {/* Input Fields */}
                <div className="space-y-4 w-full">
                    <Input
                        id="fullName"
                        type="text"
                        placeholder="Full Name"
                        value={fullname || ""}
                        onChange={(e) => setFullname(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 hover:border-purple-300"
                    />
                    <Input
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={username || ""}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 hover:border-purple-300"
                    />
                    <Input
                        id="website"
                        type="url"
                        placeholder="Website"
                        value={website || ""}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 hover:border-purple-300"
                    />
                </div>

                {/* Buttons */}
                <div className="flex flex-col space-y-3 w-full">
                    <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300 flex justify-center items-center gap-2 shadow-lg shadow-purple-500/30"
                        onClick={handleUpdateProfile}
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            "Update Profile"
                        )}
                    </Button>
                    <Button
                        onClick={() => signOutAction()}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 flex justify-center items-center gap-2 shadow-lg shadow-red-500/30"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}