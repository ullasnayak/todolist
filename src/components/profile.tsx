import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/app/utils/superbase/check-env-vars";
import { useEffect, useState } from "react";
import useSupabaseClient from "@/lib/supabase/client";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import AccountForm from "./forms/accout-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useProfile } from "./hooks/query/profile";

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const supabase = useSupabaseClient();

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, [supabase]);

    const { data: profile } = useProfile(user?.id);

    if (!hasEnvVars) {
        return (
            <div className="flex gap-4 items-center text-red-500">
                Please update .env.local file with anon key and URL
            </div>
        );
    }

    return user ? (
        <div className="flex flex-col items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-all">
                        <Avatar className="w-9 h-9 border border-gray-300 shadow-sm">
                            <AvatarImage
                                src={profile?.avatar_url || "https://github.com/shadcn.png"}
                                alt="Profile"
                            />
                            <AvatarFallback>
                                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-800">
                            {profile?.full_name || "User"}
                        </span>
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    align="end"
                    side="bottom"
                    avoidCollisions={true}
                    className="w-80 max-w-lg z-50 bg-white shadow-xl rounded-lg border p-4 overflow-auto max-h-[80vh]"
                >
                    <AccountForm user={user} />
                </PopoverContent>
            </Popover>

            <form action={signOutAction} className="w-full flex justify-center">
                <Button
                    type="submit"
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-all rounded-full shadow-sm"
                >
                    <LogOut size={14} />
                    Logout
                </Button>
            </form>
        </div>
    ) : (
        <div className="flex gap-2">null</div>
    );
}