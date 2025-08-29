"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { Task } from "@/components/types/task";
import { AddTaskModal } from "./AddTaskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FiMenu, FiGrid, FiList } from "react-icons/fi";
import { FaRegFileAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useUser } from "@supabase/auth-helpers-react";
import { CardView } from "./CardView";

export function TodoTable({ initialTasks }: { initialTasks: Task[] }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [dueDateFilter, setDueDateFilter] = useState("Any");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "card">("list");
    const user = useUser();
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data, error } = await supabase
                    .from("tasks")
                    .select("*")
                    .order("created_at", { ascending: true });

                if (error) throw error;
                setTasks(data || []);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();

        const subscription = supabase
            .channel("tasks_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "tasks" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        setTasks((prev) => [...prev, payload.new as Task]);
                    } else if (payload.eventType === "UPDATE") {
                        setTasks((prev) =>
                            prev.map((task) =>
                                task.id === payload.new.id ? (payload.new as Task) : task
                            )
                        );
                    } else if (payload.eventType === "DELETE") {
                        setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const filteredTasks = useMemo(() => {
        let result = tasks;

        if (searchTerm) {
            result = result.filter(
                (task) =>
                    task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.taskCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.dueOn.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== "All") {
            result = result.filter((task) => task.taskCategory === categoryFilter);
        }

        const today = new Date().toISOString().split("T")[0];
        switch (dueDateFilter) {
            case "Today":
                result = result.filter((task) => task.dueOn === today);
                break;
            case "This Week":
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const nextWeekStr = nextWeek.toISOString().split("T")[0];
                result = result.filter(
                    (task) => task.dueOn >= today && task.dueOn <= nextWeekStr
                );
                break;
            case "Overdue":
                result = result.filter((task) => task.dueOn < today);
                break;
        }

        return result;
    }, [tasks, searchTerm, categoryFilter, dueDateFilter]);

    const todoTasks = filteredTasks.filter((task) => task.taskStatus === "Pending");
    const inProgressTasks = filteredTasks.filter(
        (task) => task.taskStatus === "In Progress"
    );
    const completedTasks = filteredTasks.filter(
        (task) => task.taskStatus === "Completed"
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((task) => task.id === active.id);
        if (!activeTask) return;

        let newStatus = activeTask.taskStatus;
        if (over.id === "in-progress") newStatus = "In Progress";
        else if (over.id === "completed") newStatus = "Completed";
        else if (over.id === "todo") newStatus = "Pending";

        await updateTaskStatus(active.id, newStatus);
    };

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("tasks")
                .update({ taskStatus: newStatus })
                .eq("id", taskId);

            if (error) throw error;

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId ? { ...task, taskStatus: newStatus } : task
                )
            );
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleAddTask = async (newTask: Omit<Task, "id">) => {
        try {
            const { data, error } = await supabase
                .from("tasks")
                .insert([{ ...newTask, taskStatus: "Pending" }])
                .select();

            if (error) throw error;
            if (data) setTasks((prev) => [...prev, data[0]]);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const renderTable = (
        status: string,
        tasks: Task[],
        bgColor: string,
        title: string
    ) => (
        <div className="mb-6">
            <h3 className={`text-lg font-semibold p-3 ${bgColor} rounded-t-lg`}>
                {title} {tasks.length === 0 && (
                    <span className="text-gray-500 font-normal">(No tasks)</span>
                )}
            </h3>
            <div className="overflow-x-auto border border-t-0 rounded-b-lg">
                <table className="min-w-full bg-white table-fixed">
                    <colgroup>
                        <col style={{ width: "30%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "25%" }} />
                    </colgroup>
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-3 px-4 border-b text-left">Task Name</th>
                            <th className="py-3 px-4 border-b text-left">Due On</th>
                            <th className="py-3 px-4 border-b text-left">Status</th>
                            <th className="py-3 px-4 border-b text-left">Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length > 0 ? (
                            <SortableContext
                                items={tasks}
                                strategy={verticalListSortingStrategy}
                            >
                                {tasks.map((task) => (
                                    <SortableItem key={task.id} id={task.id}>
                                        <>
                                            <td className="py-3 px-4 border-b">{task.taskName}</td>
                                            <td className="py-3 px-4 border-b">
                                                {new Date(task.dueOn).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 border-b">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${task.taskStatus === "Completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : task.taskStatus === "In Progress"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {task.taskStatus}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border-b">{task.taskCategory}</td>
                                        </>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-4 text-center text-gray-500">
                                    {searchTerm || categoryFilter !== "All" || dueDateFilter !== "Any"
                                        ? "No matching tasks found"
                                        : "No tasks in this category"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="border-b pb-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center mt-1">
                            <FaRegFileAlt className="h-5 w-5 text-gray-500 mr-2" />
                            <h1 className="text-2xl font-extrabold text-gray-800">TaskBuddy</h1>
                        </div>
                        <div className="flex items-center mt-1">
                            <FiMenu className="h-5 w-5 text-gray-500 mr-2" />
                            <p className="text-sm font-medium text-gray-500">List</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex border rounded-lg overflow-hidden">
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className="rounded-none"
                            >
                                <FiList className="h-4 w-4 mr-2" />
                                List
                            </Button>
                            <Button
                                variant={viewMode === "card" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("card")}
                                className="rounded-none"
                            >
                                <FiGrid className="h-4 w-4 mr-2" />
                                Cards
                            </Button>
                        </div>

                        {user && (
                            <>
                                {user.user_metadata?.avatar_url && (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <span className="text-sm font-medium text-gray-700">
                                    {user.user_metadata?.name || user.email}
                                </span>
                            </>
                        )}
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">Filter by:</span>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[130px] rounded-lg">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            <SelectItem value="Work">Work</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                        <SelectTrigger className="w-[130px] rounded-lg">
                            <SelectValue placeholder="Due Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Any">Any Date</SelectItem>
                            <SelectItem value="Today">Today</SelectItem>
                            <SelectItem value="This Week">This Week</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex space-x-3">
                    <Input
                        placeholder="Search"
                        className="w-[180px] rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <AddTaskModal onAddTask={handleAddTask}>
                        <Button className="bg-purple-600 hover:bg-purple-700 rounded-lg px-4">
                            ADD TASK
                        </Button>
                    </AddTaskModal>
                </div>
            </div>

            {viewMode === "list" ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    {renderTable("todo", todoTasks, "bg-purple-100", "To Do")}
                    {renderTable("in-progress", inProgressTasks, "bg-blue-100", "In Progress")}
                    {renderTable("completed", completedTasks, "bg-green-100", "Completed")}
                </DndContext>
            ) : (
                <CardView
                    todoTasks={todoTasks}
                    inProgressTasks={inProgressTasks}
                    completedTasks={completedTasks}
                    onStatusChange={updateTaskStatus}
                />
            )}
        </div>
    );
}