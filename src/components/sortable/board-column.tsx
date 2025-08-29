"use client";
import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Loader2, CheckCircle } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import TaskForm from "../forms/createTaskForm";
import SortableBoardTask from "./board-sortable";

export type Task = {
    status: string;
    id: string;
    title: string;
    due_date: string;
    category: string;
    description?: string;
};

export type StatusColumnProps = {
    status: string;
    tasks: Task[];
    color: string;
    user: any;
    deleteTask: (taskId: string) => void;
};

function StatusBoardColumn({
    status,
    tasks,
    user,
    color,
    deleteTask,
}: StatusColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
        data: {
            isColumnDropZone: true,
            status: status,
        },
    });

    const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
    const bgColors: Record<StatusColumnProps["status"], string> = {
        "To Do": "text-pink-500",
        "In Progress": "text-blue-500",
        Completed: "text-green-500",
    };

    const headerIcons: Record<StatusColumnProps["status"], JSX.Element> = {
        "To Do": <ClipboardList size={20} className="text-pink-500" />,
        "In Progress": <Loader2 size={20} className="text-blue-500" />,
        Completed: <CheckCircle size={20} className="text-green-500" />,
    };

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 bg-gray-200 rounded-lg shadow-sm ${isOver ? "ring-2 ring-purple-500" : ""}`}
        >
            {/* Apply background color only to the heading */}
            <div className={`p-4 rounded-t-lg ${bgColors[status]}`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2">
                        {headerIcons[status]}
                        {status} ({tasks.length})
                    </h3>
                    <Dialog
                        open={isPlusModalOpen}
                        onOpenChange={(open) => setIsPlusModalOpen(open)}
                    >
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                                <Plus size={16} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl w-full overflow-auto p-6">
                            <DialogHeader>
                                <DialogTitle>Create a New Task</DialogTitle>
                                <DialogDescription>
                                    Fill in the details for the new task.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="w-full">
                                <TaskForm
                                    user={user}
                                    onSuccess={() => {
                                        setIsPlusModalOpen(false);
                                    }}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Rest of the column without background color */}
            <div className="p-2 min-h-[150px]">
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {tasks.map((task) => (
                            <SortableBoardTask
                                key={task.id}
                                user={user}
                                task={task}
                                deleteTask={deleteTask}
                            />
                        ))}
                    </div>
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500">
                        Drop here to move to {status}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatusBoardColumn;