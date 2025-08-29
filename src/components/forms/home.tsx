"use client";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { LayoutList, LayoutGrid, ListCheck } from "lucide-react";
import TasksBoard from "./board-view";
import TasksList from "./list-view";
import Profile from "../profile";

export default function Tasks({ user }: { user: unknown }) {
    const [viewMode, setViewMode] = useState<"list" | "board">("list");

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-black flex items-center gap-2">
                    <ListCheck size={30} className="text-black" /> TaskBuddy
                </h1>
                <Profile />
            </header>

            <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                    <LayoutList size={20} />
                    List
                </span>
                <Switch
                    checked={viewMode === "board"}
                    onCheckedChange={(checked) => setViewMode(checked ? "board" : "list")}
                    className="bg-gray-200 border-gray-300 data-[state=checked]:bg-blue-600 transition-all w-9 h-6 rounded-full relative"
                >
                    <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${viewMode === "board" ? "translate-x-8" : ""
                            }`}
                    />
                </Switch>
                <span className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                    <LayoutGrid size={20} />
                    Board
                </span>
            </div>

            <div className="w-full overflow-x-auto">
                {viewMode === "list" ? (
                    <TasksList user={user} />
                ) : (
                    <TasksBoard user={user} />
                )}
            </div>
        </div>
    );
}