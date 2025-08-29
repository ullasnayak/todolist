"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Trash,
    GripVertical,
    MoreHorizontal,
    Eye,
    Edit3,
    CheckCircle,
} from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import TaskDetail from "@/components/task-details";
import TaskForm from "../forms/createTaskForm";
export type Task = {
    status: string;
    id: string;
    title: string;
    due_date: string;
    category: string;
    description?: string;
};

export type SortableTaskProps = {
    task: Task;
    deleteTask: (taskId: string) => void;
    user: string;
};

function SortableBoardTask({ task, deleteTask, user }: SortableTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : "auto",
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow w-full flex flex-wrap md:flex-nowrap items-center gap-2 ${isDragging ? "opacity-0" : "opacity-100"
                }`}
        >
            {/* Drag Handle */}
            <GripVertical
                size={16}
                className="text-gray-400 cursor-move hover:text-gray-600 mr-2"
                {...listeners}
            />

            {/* Task Details */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    {task.status === "Completed" && (
                        <CheckCircle size={16} className="text-green-500" />
                    )}
                    <span
                        className={`text-sm font-medium text-gray-800 flex-1 min-w-[120px] ${task.status === "Completed" ? "line-through" : ""
                            }`}
                    >
                        {task.title}
                    </span>
                </div>
                <div className="ml-6 mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="text-sm text-gray-500 w-28 text-center hidden sm:block">
                        {new Date(task.due_date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </span>

                    {/* Status Badge */}
                    <span className="text-xs px-2 py-1 rounded-full text-center min-w-[80px] truncate bg-gray-200 text-gray-800">
                        {task.status}
                    </span>

                    {/* Category Badge */}
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full w-24 text-center hidden sm:block">
                        {task.category}
                    </span>
                </div>
            </div>

            {/* Actions Menu */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-100 w-8 h-8 shrink-0"
                    >
                        <MoreHorizontal size={16} className="text-gray-600" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                    <div className="space-y-1">
                        {/* View Task */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Eye size={16} className="mr-2 text-gray-500" />
                                    View
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl w-full overflow-auto p-6">
                                <DialogHeader>
                                    <DialogTitle>Task Details</DialogTitle>
                                    <DialogDescription>
                                        View the details of the task.
                                    </DialogDescription>
                                </DialogHeader>
                                <TaskDetail taskId={task.id} />
                            </DialogContent>
                        </Dialog>

                        {/* Edit Task */}
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Edit3 size={16} className="mr-2 text-gray-500" />
                                    Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl w-full overflow-auto p-6">
                                <DialogHeader>
                                    <DialogTitle>Edit Task</DialogTitle>
                                    <DialogDescription>
                                        Edit the task details below.
                                    </DialogDescription>
                                </DialogHeader>
                                <TaskForm
                                    taskId={task.id}
                                    user={user}
                                    onSuccess={() => {
                                        setIsModalOpen(false);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>

                        {/* Delete Task */}
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => deleteTask(task.id)}
                        >
                            <Trash size={16} className="mr-2" />
                            Delete
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default SortableBoardTask;