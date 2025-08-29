"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "../ui/input";
import { useCreateOrUpdateTask } from "../hooks/mutation/task";
import SortableListTask from "./list-sortable";

type Task = {
    id: string;
    title: string;
    due_date: string;
    category: string;
    status: string;
};

type StatusColumnProps = {
    status: string;
    color: string;
    tasks: Task[];
    user: any;
    fetchTasks: (
        searchQuery: string,
        selectedCategory: string,
        selectedDueDate: string,
        sortField: "title" | "due_date" | "status" | "category",
        sortDirection: "asc" | "desc"
    ) => void;
    deleteTask: (taskId: string) => void;
    updateStatus: (taskId: string, newStatus: string) => void;
    openTaskModal: (task: Task) => void;
    isModalOpen: boolean;
    searchQuery: string; // Add searchQuery
    selectedCategory: string; // Add selectedCategory
    selectedDueDate: string; // Add selectedDueDate
    sortField: "title" | "due_date" | "status" | "category"; // Add sortField
    sortDirection: "asc" | "desc";
    selectedTaskForModal: Task | null;
    selectedTasks: Set<string>;
    onSelectTask: (taskId: string, isSelected: boolean) => void;
};

function StatusListColumn({
    status,
    tasks,
    user,
    deleteTask,
    updateStatus,
    openTaskModal,
    isModalOpen,
    selectedTaskForModal,
    selectedTasks,
    onSelectTask,
    fetchTasks,
    searchQuery,
    selectedCategory,
    selectedDueDate,
    sortField,
    sortDirection,
}: StatusColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
        data: {
            isColumnDropZone: true,
            status: status,
        },
    });

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [newTaskCategory, setNewTaskCategory] = useState("Work");
    const [isAddingTask, setIsAddingTask] = useState(false);

    const createOrUpdateTaskMutation = useCreateOrUpdateTask();

    const bgColors: Record<StatusColumnProps["status"], string> = {
        "To Do": "bg-pink-200",
        "In Progress": "bg-blue-300",
        Completed: "bg-green-200",
    };

    const initialTasks = tasks.slice(0, 5);
    const remainingTasks = tasks.slice(5);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;

        const taskData = {
            user_id: user.id,
            title: newTaskTitle,
            description: "",
            category: newTaskCategory,
            due_date: newTaskDueDate || new Date().toISOString(),
            status: status,
        };

        createOrUpdateTaskMutation.mutate(
            { taskData },
            {
                onSuccess: () => {
                    setNewTaskTitle("");
                    setNewTaskDueDate("");
                    setNewTaskCategory("Work");
                    setIsAddingTask(false);
                    fetchTasks(
                        searchQuery,
                        selectedCategory,
                        selectedDueDate,
                        sortField,
                        sortDirection
                    );
                },
            }
        );
    };

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 bg-gray-100 rounded-xl shadow-lg border-2 mt-6 mx-4 transition-all duration-200
          ${isOver ? "border-purple-500 ring-2 ring-purple-400" : "border-gray-100"}
          overflow-hidden`}
        >
            {/* Column Header */}
            <div className={`p-4 rounded-t-lg ${bgColors[status]}`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-800">
                        {status} <span className="text-gray-600">({tasks.length})</span>
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setIsAddingTask(!isAddingTask)}
                    >
                        <ChevronDown size={16} />
                    </Button>
                </div>
            </div>

            {/* Task List */}
            <div className="p-4 min-h-[150px]">
                {/* Add Task Input */}
                {isAddingTask && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <Input
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="flex-1 bg-gray-200 border border-gray-300 rounded-lg p-2 text-sm"
                        />
                        <Input
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="flex-1 bg-gray-200 border border-gray-300 rounded-lg p-2 text-sm"
                        />
                        <select
                            value={newTaskCategory}
                            onChange={(e) => setNewTaskCategory(e.target.value)}
                            className="flex-1 bg-gray-200 border border-gray-300 rounded-lg p-2 text-sm"
                        >
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>

                        </select>
                        <Button
                            variant="default"
                            className="bg-purple-600 text-white rounded-lg p-2 text-sm"
                            onClick={handleAddTask}
                        >
                            Add
                        </Button>
                    </div>
                )}

                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {/* Display the first 5 tasks */}
                        {initialTasks.map((task) => (
                            <SortableListTask
                                key={task.id}
                                task={task}
                                user={user}
                                deleteTask={deleteTask}
                                updateStatus={updateStatus}
                                openTaskModal={openTaskModal}
                                isModalOpen={isModalOpen}
                                selectedTaskForModal={selectedTaskForModal}
                                isSelected={selectedTasks.has(task.id)}
                                onSelectTask={onSelectTask}
                            />
                        ))}

                        {/* Accordion for remaining tasks */}
                        {remainingTasks.length > 0 && (
                            <Accordion type="single" collapsible>
                                <AccordionItem value="item-1" className="border-none">
                                    <AccordionTrigger className="text-sm text-gray-600 hover:no-underline">
                                        <span className="flex items-center">
                                            <ChevronDown size={16} className="mr-2" />
                                            Show {remainingTasks.length} more tasks
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3">
                                            {remainingTasks.map((task) => (
                                                <SortableListTask
                                                    key={task.id}
                                                    task={task}
                                                    user={user}
                                                    deleteTask={deleteTask}
                                                    updateStatus={updateStatus}
                                                    openTaskModal={openTaskModal}
                                                    isModalOpen={isModalOpen}
                                                    selectedTaskForModal={selectedTaskForModal}
                                                    isSelected={selectedTasks.has(task.id)}
                                                    onSelectTask={onSelectTask}
                                                />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </div>
                </SortableContext>

                {/* Empty drop zone */}
                {tasks.length === 0 && (
                    <div className="h-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500">
                        Drop here to move to {status}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatusListColumn;
