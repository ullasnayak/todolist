"use client";

import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FilterDropdown, SearchFilter } from "../../components/filters";
import useTasks from "../hooks/useTask";
import StatusBoardColumn, { Task } from "../sortable/board-column";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import TaskForm from "./createTaskForm";

export default function TasksBoard({ user }: { user: unknown }) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedDueDate, setSelectedDueDate] = useState<string>("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortDirection,] = useState<"asc" | "desc">("asc");
    const {
        tasks,
        fetchTasks,
        deleteTask,
        updateStatus,
        updateTaskPositions,
    } = useTasks(user?.id);
    const [sortField,] = useState<
        "title" | "due_date" | "status" | "category"
    >("due_date");
    const [activeTask, setActiveTask] = useState<Task | null>(null);



    useEffect(() => {
        if (user?.id) {
            fetchTasks(
                searchQuery,
                selectedCategory,
                selectedDueDate,
                sortField,
                sortDirection
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        user?.id,
        searchQuery,
        selectedCategory,
        selectedDueDate,
        sortField,
        sortDirection,
    ]);

    const statuses = [
        {
            status: "To Do",
            color: "red",
            tasks: tasks.filter((task) => task.status === "To Do"),
        },
        {
            status: "In Progress",
            color: "blue",
            tasks: tasks.filter((task) => task.status === "In Progress"),
        },
        {
            status: "Completed",
            color: "green",
            tasks: tasks.filter((task) => task.status === "Completed"),
        },
    ];

    const onDragStart = (event: { active: unknown }) => {
        const { active } = event;
        const draggedTask = tasks.find((task) => task.id === active.id);
        if (draggedTask) {
            setActiveTask(draggedTask);
        }
    };

    const onDragEnd = async (event: { active: unknown; over: unknown }) => {
        const { active, over } = event;
        if (!over) return;

        const movedTask = tasks.find((task) => task.id === active.id);
        if (!movedTask) return;

        let newStatus = movedTask.status;

        if (over.data.current?.isColumnDropZone) {
            newStatus = over.data.current.status;
        } else if (over.data.current?.isTask) {
            const overTask = tasks.find((task) => task.id === over.id);
            newStatus = overTask?.status || movedTask.status;
        }

        if (newStatus !== movedTask.status) {
            await updateStatus(movedTask.id, newStatus);
        } else {
            const statusTasks = tasks.filter((task) => task.status === newStatus);
            const oldIndex = statusTasks.findIndex((task) => task.id === active.id);
            const newIndex = statusTasks.findIndex((task) => task.id === over.id);

            if (oldIndex !== newIndex) {
                const reorderedTasks = arrayMove(statusTasks, oldIndex, newIndex);
                await updateTaskPositions(reorderedTasks, newStatus);
                fetchTasks(
                    searchQuery,
                    selectedCategory,
                    selectedDueDate,
                    sortField,
                    sortDirection
                );
            }
        }

        setActiveTask(null);
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <SearchFilter
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    <div className="flex gap-2">
                        <FilterDropdown
                            options={[
                                { value: "All", label: "All Categories" },
                                { value: "Work", label: "Work" },
                                { value: "Personal", label: "Personal" },
                            ]}
                            selectedValue={selectedCategory}
                            onChange={setSelectedCategory}
                        />

                        <FilterDropdown
                            options={[
                                { value: "All", label: "All Due Dates" },
                                { value: "Today", label: "Today" },
                                { value: "Tomorrow", label: "Tomorrow" },
                                { value: "This Week", label: "This Week" },
                                { value: "Overdue", label: "Overdue" },
                            ]}
                            selectedValue={selectedDueDate}
                            onChange={setSelectedDueDate}
                        />
                    </div>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="default"
                            className="mb-4 flex bg-purple-900 items-center gap-2"
                        >
                            ADD TASK
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
                                    setIsModalOpen(false);
                                    fetchTasks(
                                        searchQuery,
                                        selectedCategory,
                                        selectedDueDate,
                                        sortField,
                                        sortDirection
                                    );
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="flex flex-col md:flex-row gap-6">
                <DndContext
                    collisionDetection={closestCenter}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    {statuses.map(({ status, color, tasks: statusTasks }) => (
                        <StatusBoardColumn
                            key={status}
                            status={status}
                            color={color}
                            tasks={statusTasks}
                            user={user}
                            deleteTask={deleteTask}
                        />
                    ))}
                    <DragOverlay>
                        {activeTask ? (
                            <div className="bg-white rounded-lg border p-3 shadow-lg w-full flex flex-wrap md:flex-nowrap items-center gap-2">
                                <GripVertical
                                    size={16}
                                    className="text-gray-400 cursor-move hover:text-gray-600 mr-2"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800 flex-1 min-w-[120px]">
                                            {activeTask.title}
                                        </span>
                                    </div>
                                    <div className="ml-6 mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                        <span className="text-sm text-gray-500 w-28 text-center hidden sm:block">
                                            {new Date(activeTask.due_date).toLocaleDateString(
                                                "en-GB",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                }
                                            )}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full text-center w-24 ${activeTask.status === "To Do"
                                                ? "bg-pink-200 text-red-800"
                                                : activeTask.status === "In Progress"
                                                    ? "bg-blue-300 text-blue-800"
                                                    : "bg-green-200 text-green-800"
                                                }`}
                                        >
                                            {activeTask.status}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full w-24 text-center hidden sm:block">
                                            {activeTask.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}