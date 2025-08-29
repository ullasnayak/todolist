"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Trash,
    GripVertical,
    ChevronDown,
    Edit3,
    MoreHorizontal,
    Eye,
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
import TaskDetail from "../task-details";
import { Checkbox } from "@/components/ui/checkbox";
import TaskForm from "../forms/createTaskForm";

type Task = {
    id: string;
    title: string;
    due_date: string;
    category: string;
    status: string;
};
export type SortableTaskProps = {
    task: Task;
    user: string;
    openTaskModal: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    isModalOpen: boolean;
    selectedTaskForModal?: Task | null;
    updateStatus: (taskId: string, status: string) => void;
    isSelected: boolean;
    onSelectTask: (taskId: string, isSelected: boolean) => void;
};

function SortableListTask({
    task,
    user,
    deleteTask,
    updateStatus,
    isSelected,
    onSelectTask,
}: SortableTaskProps & {
    isSelected: boolean;
    onSelectTask: (taskId: string, isSelected: boolean) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: task.id });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            {...attributes}
            className="bg-gray-200 rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow w-full flex flex-wrap items-center gap-4 overflow-x-auto"
        >
            <Checkbox
                checked={isSelected}
                onCheckedChange={(checked: boolean) => onSelectTask(task.id, checked)}
                className="w-5 h-5 shrink-0"
            />

            <GripVertical
                size={16}
                className="text-gray-400 cursor-move hover:text-gray-600 w-5 h-5 shrink-0"
                {...listeners}
            />

            <span className="text-sm font-medium text-gray-800 flex-1 truncate min-w-[100px]">
                {task.title}
            </span>

            <div className="relative min-w-[120px]">
                <select
                    className="appearance-none border border-gray-300 p-2 rounded-lg text-sm bg-gray-300 cursor-pointer hover:border-gray-400 transition-colors w-full"
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
                <ChevronDown
                    size={16}
                    className="absolute right-3 top-3 text-gray-500 pointer-events-none"
                />
            </div>

            {/* Due Date */}
            <span className="text-xs text-gray-500 min-w-[80px] truncate">
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

            {/* Category */}
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full min-w-[80px] truncate">
                {task.category}
            </span>

            {/* More Options */}
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
                        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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
                                        setIsEditModalOpen(false);
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

export default SortableListTask;