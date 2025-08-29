"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    GripVertical,
    ChevronDown,
    Circle,
    CheckCircle,
    Trash2,
    Clock,
    MoreVertical,
} from "lucide-react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import TaskForm from "./createTaskForm";
import useTasks from "../hooks/useTask";
import { FilterDropdown, SearchFilter } from "@/components/filters";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusListColumn from "../sortable/list-column";

export default function TasksList({ user }: { user: unknown }) {
    const {
        tasks,
        fetchTasks,
        deleteTask,
        updateTaskPositions,
        updateStatus,
    } = useTasks(user?.id);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedDueDate, setSelectedDueDate] = useState<string>("All");
    const [sortField, setSortField] = useState<
        "title" | "due_date" | "status" | "category"
    >("due_date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedTaskForModal, setSelectedTaskForModal] = useState<unknown | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());


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
    const handleSort = (field: "title" | "due_date" | "status" | "category") => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };
    const handleSelectTask = (taskId: string, isSelected: boolean) => {
        setSelectedTasks((prev) => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(taskId);
            } else {
                newSet.delete(taskId);
            }
            return newSet;
        });
    };

    const handleBulkUpdateStatus = async (status: string) => {
        for (const taskId of Array.from(selectedTasks)) {
            await updateStatus(taskId, status);
        }
        setSelectedTasks(new Set());
    };

    const handleBulkDelete = async () => {
        for (const taskId of Array.from(selectedTasks)) {
            await deleteTask(taskId);
        }
        setSelectedTasks(new Set());
    };

    const openTaskModal = (task: any) => {
        setSelectedTaskForModal(task);
        setIsModalOpen(true);
    };

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

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const onDragStart = (event: any) => {
        const { active } = event;
        const draggedTask = tasks.find((task) => task.id === active.id);
        if (draggedTask) {
            setActiveTask(draggedTask);
        }
    };

    const onDragEnd = async (event: any) => {
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
        <div className="bg-gray-50">
            <div>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <div className="flex gap-2 items-center">
                                <span className="font-semibold">Filter By:</span>

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

                        <div className="flex items-center gap-4">
                            <SearchFilter
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />


                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="mb-4 flex bg-purple-900 items-center gap-2 mt-2"
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
                        </div>
                    </div>
                </div>
                {selectedTasks.size > 0 && (
                    <div className="flex flex-wrap gap-3 justify-between items-center w-full">
                        <div className="hidden sm:flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => handleBulkUpdateStatus("To Do")}
                                className="bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 rounded-lg shadow-sm"
                            >
                                <Circle size={18} className="mr-2 text-red-500" />
                                To Do
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => handleBulkUpdateStatus("In Progress")}
                                className="bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-300 rounded-lg shadow-sm"
                            >
                                <Clock size={18} className="mr-2 text-blue-500" />
                                In Progress
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => handleBulkUpdateStatus("Completed")}
                                className="bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-300 rounded-lg shadow-sm"
                            >
                                <CheckCircle size={18} className="mr-2 text-green-500" />
                                Completed
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleBulkDelete}
                                className="bg-red-200 text-red-700 hover:bg-red-300 transition-all duration-300 rounded-lg shadow-sm"
                            >
                                <Trash2 size={18} className="mr-2" />
                                Delete
                            </Button>
                        </div>

                        {/* Mobile-friendly dropdown */}
                        <div className="sm:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300 rounded-lg shadow-sm"
                                    >
                                        <MoreVertical size={22} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="rounded-lg shadow-lg bg-white dark:bg-gray-900"
                                >
                                    <DropdownMenuItem
                                        onClick={() => handleBulkUpdateStatus("To Do")}
                                        className="hover:bg-red-100 text-red-600 transition-all duration-300"
                                    >
                                        <Circle size={18} className="mr-2 text-red-500" />
                                        To Do
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleBulkUpdateStatus("In Progress")}
                                        className="hover:bg-blue-100 text-blue-600 transition-all duration-300"
                                    >
                                        <Clock size={18} className="mr-2 text-blue-500" />
                                        In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleBulkUpdateStatus("Completed")}
                                        className="hover:bg-green-100 text-green-600 transition-all duration-300"
                                    >
                                        <CheckCircle size={18} className="mr-2 text-green-500" />
                                        Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleBulkDelete}
                                        className="hover:bg-red-200 text-red-700 transition-all duration-300"
                                    >
                                        <Trash2 size={18} className="mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                )}

                <div className="hidden sm:block bg-gray-50 px-4">
                    <div className="w-3/2 flex items-center justify-between text-sm font-medium text-gray-500 border-b border-gray-200 pb-3">
                        <div className="w-6 mr-2" />
                        <button
                            onClick={() => handleSort("title")}
                            className="flex-1  text-left flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            Task Name
                            {sortField === "title" && (
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort("due_date")}
                            className="w-32 text-center flex items-center justify-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            Due Date
                            {sortField === "due_date" && (
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort("status")}
                            className="w-24 text-center flex items-center justify-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            Status
                            {sortField === "status" && (
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort("category")}
                            className="w-24 text-center flex items-center justify-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                            Category
                            {sortField === "category" && (
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                                />
                            )}
                        </button>
                        <div className="w-8 ml-2" />
                    </div>
                </div>

                {tasks.length === 0 ? (
                    <p className="text-center text-gray-500">No tasks available.</p>
                ) : (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                    >
                        {statuses.map(({ status, color, tasks: statusTasks }) => (
                            <StatusListColumn
                                key={status}
                                status={status}
                                color={color}
                                tasks={statusTasks}
                                user={user}
                                deleteTask={deleteTask}
                                updateStatus={updateStatus}
                                openTaskModal={openTaskModal}
                                isModalOpen={isModalOpen}
                                selectedTaskForModal={selectedTaskForModal}
                                selectedTasks={selectedTasks}
                                onSelectTask={handleSelectTask}
                                fetchTasks={fetchTasks}
                                searchQuery={searchQuery}
                                selectedCategory={selectedCategory}
                                selectedDueDate={selectedDueDate}
                                sortField={sortField}
                                sortDirection={sortDirection}
                            />
                        ))}
                        <DragOverlay>
                            {activeTask ? (
                                <div className="bg-gray-200 rounded-lg border p-3 shadow-lg w-full flex flex-wrap md:flex-nowrap items-center gap-2">
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
                                                    ? "bg-pink-300 text-red-800"
                                                    : activeTask.status === "In Progress"
                                                        ? "bg-blue-200 text-blue-800"
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
                )}
            </div>
        </div>
    );
}

type Task = {
    id: string;
    title: string;
    due_date: string;
    category: string;
    status: string;
};

export type Tasks = {
    id: string;
    title: string;
    due_date: string;
    category: string;
};