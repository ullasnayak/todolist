"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Task } from "./types/task";
import { useState, useMemo } from "react";

export function AddTaskModal({
    onAddTask,
    onCancel,
}: {
    onAddTask: (task: Omit<Task, "id">) => void;
    onCancel?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [task, setTask] = useState<Omit<Task, "id">>({
        taskTitle: "",
        taskDescription: "",
        dueOn: "",
        taskStatus: "Pending",
        taskCategory: "Personal",
        attachment: null,
    });

    const characterCount = useMemo(() => {
        return task.taskDescription?.length || 0;
    }, [task.taskDescription]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTask(task);
        setOpen(false);
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        setOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setTask({ ...task, attachment: e.target.files[0] });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="mb-4 bg-[#7B1984] hover:bg-[#6a1672]">
                    Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-lg">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-xl font-semibold text-gray-800">Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 px-1">
                    <div className="space-y-2">
                        <Input
                            id="taskTitle"
                            placeholder="Task title"
                            value={task.taskTitle}
                            onChange={(e) => setTask({ ...task, taskTitle: e.target.value })}
                            required
                            className="border-gray-300 focus:border-[#7B1984] focus:ring-[#7B1984]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Textarea
                            id="taskDescription"
                            placeholder="Description"
                            value={task.taskDescription}
                            onChange={(e) => {
                                if (e.target.value.length <= 300) {
                                    setTask({ ...task, taskDescription: e.target.value });
                                }
                            }}
                            className="min-h-[120px] border-gray-300 focus:border-[#7B1984] focus:ring-[#7B1984]"
                        />
                        <div className="text-right text-sm text-gray-500">
                            {characterCount}/300
                        </div>
                    </div>

                    {/* Task Category, Due Date, and Status in one row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-700">Task Category</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={task.taskCategory === "Work" ? "default" : "outline"}
                                    className={`rounded-md border ${task.taskCategory === "Work" ? "bg-[#7B1984] text-white" : "border-gray-300 text-gray-700"}`}
                                    onClick={() => setTask({ ...task, taskCategory: "Work" })}
                                    type="button"
                                >
                                    Work
                                </Button>
                                <Button
                                    variant={task.taskCategory === "Personal" ? "default" : "outline"}
                                    className={`rounded-md border ${task.taskCategory === "Personal" ? "bg-[#7B1984] text-white" : "border-gray-300 text-gray-700"}`}
                                    onClick={() => setTask({ ...task, taskCategory: "Personal" })}
                                    type="button"
                                >
                                    Personal
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueOn" className="text-gray-700">Due Date</Label>
                            <Input
                                id="dueOn"
                                type="date"
                                value={task.dueOn}
                                onChange={(e) => setTask({ ...task, dueOn: e.target.value })}
                                required
                                className="border-gray-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taskStatus" className="text-gray-700">Status</Label>
                            <Select
                                value={task.taskStatus}
                                onValueChange={(value) =>
                                    setTask({ ...task, taskStatus: value as Task["taskStatus"] })
                                }
                            >
                                <SelectTrigger className="border-gray-300">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Attachment Input */}
                    <div className="space-y-2">
                        <Label htmlFor="attachment" className="text-gray-700">Attachment</Label>
                        <div className="flex items-center justify-center w-full mb-32">
                            <label
                                htmlFor="attachment"
                                className="flex flex-col items-center justify-center w-full h-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center p-4">

                                    <p className="text-sm text-gray-500 text-center">
                                        Drop your files here or <span className="text-[#7B1984] font-medium">update</span>
                                    </p>
                                </div>
                                <Input
                                    id="attachment"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-14 -mx-6 -mb-6 px-6 py-4 bg-gray-100 flex justify-end gap-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            CANCEL
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#7B1984] hover:bg-[#6a1672]"
                        >
                            CREATE
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}