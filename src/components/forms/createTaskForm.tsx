"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityLog from "@/components/activity-log";
import { useGetTask } from "../hooks/query/task";
import useSupabaseClient from "@/app/utils/superbase/client";
import { useCreateOrUpdateTask } from "../hooks/mutation/task";

type TaskFormProps = {
    user: any;
    taskId?: string;
    onSuccess?: () => void;
};

export default function TaskForm({ user, taskId, onSuccess }: TaskFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<"Work" | "Personal" | "">("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState<
        "To Do" | "In Progress" | "Completed" | ""
    >("");
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

    const { data: tasks } = useGetTask(taskId || "");
    const supabase = useSupabaseClient();
    const task = tasks;

    const submitMutation = useCreateOrUpdateTask();

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setCategory(task.category);
            setDueDate(task.due_date);
            setStatus(task.status);

            if (task.task_attachments.length > 0) {
                const filePath = task.task_attachments[0].file_url;
                downloadAttachment(filePath);
            }
        }
    }, [task]);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        setAttachmentFile(file);
        setAttachmentUrl(URL.createObjectURL(file));
    };

    const downloadAttachment = async (filePath: string) => {
        try {
            const { data, error } = await supabase.storage
                .from("task_attachments")
                .download(filePath);
            if (error) throw error;
            setAttachmentUrl(URL.createObjectURL(data));
        } catch (error) {
            console.error("Error downloading attachment:", error);
        }
    };

    const handleSave = () => {
        const taskData = {
            user_id: user.id,
            title,
            description,
            category,
            due_date: dueDate,
            status,
            position: 0, // Default position (will be updated in the mutation)
        };

        const mutation = submitMutation;
        mutation.mutate(
            { taskId, taskData, attachmentFile },
            {
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                },
            }
        );
    };
    return (
        <div className="bg-gray-100 p-6 rounded-lg">
            <Tabs defaultValue="create-task" className="w-full">
                {/* Tabs List */}
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create-task">Create Task</TabsTrigger>
                    <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
                </TabsList>

                {/* Create Task Tab */}
                <TabsContent value="create-task">
                    <Card className="w-full max-w-2xl bg-white rounded-lg shadow-sm">
                        <CardContent className="flex flex-col space-y-4 p-6">
                            {/* Title */}
                            <div className="flex flex-col">
                                <label htmlFor="title" className="text-gray-700 text-sm">
                                    Task Title
                                </label>
                                <Input
                                    id="title"
                                    placeholder="Task title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div className="flex flex-col">
                                <label htmlFor="description" className="text-gray-700 text-sm">
                                    Description
                                </label>
                                <Textarea
                                    id="description"
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>

                            {/* Category, Due Date, Status in One Line */}
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Category */}
                                <div className="flex flex-col w-full">
                                    <label className="text-gray-700 text-sm">Category</label>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            className={`${category === "Work" ? "bg-purple-300" : ""
                                                } border border-gray-300 rounded-lg p-2 text-sm`}
                                            onClick={() => setCategory("Work")}
                                        >
                                            Work
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className={`${category === "Personal" ? "bg-purple-300" : ""
                                                } border border-gray-300 rounded-lg p-2 text-sm`}
                                            onClick={() => setCategory("Personal")}
                                        >
                                            Personal
                                        </Button>
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="flex flex-col w-full">
                                    <label htmlFor="due-date" className="text-gray-700 text-sm">
                                        Due Date
                                    </label>
                                    <Input
                                        id="due-date"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm"
                                    />
                                </div>

                                {/* Status */}
                                <div className="flex flex-col w-full">
                                    <label className="text-gray-700 text-sm">Status</label>
                                    <Select
                                        value={status}
                                        onValueChange={(val) =>
                                            setStatus(val as "To Do" | "In Progress" | "Completed")
                                        }
                                    >
                                        <SelectTrigger className="bg-gray-50 border border-gray-300 rounded-lg p-2 w-full text-sm">
                                            <SelectValue placeholder="Choose Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="To Do">To Do</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Attachment Preview */}
                            {attachmentUrl && (
                                <div className="relative w-full h-40">
                                    <Image
                                        src={attachmentUrl}
                                        alt="Attachment Preview"
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Attachment Upload */}
                            <div className="flex flex-col">
                                <label className="text-gray-700 text-sm">Attachment</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer text-blue-600 flex items-center gap-2 text-sm"
                                >
                                    <Camera className="h-5 w-5" /> Upload Attachment
                                </label>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-2">
                                <Button
                                    className="bg-purple-600 text-white rounded-lg p-2 text-sm"
                                    onClick={handleSave}
                                >
                                    {submitMutation?.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Log Tab */}
                <TabsContent value="activity-log">
                    <Card className="w-full max-w-2xl bg-white rounded-lg shadow-sm">
                        <CardContent className="p-6">
                            <ActivityLog taskId={taskId || ""} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}