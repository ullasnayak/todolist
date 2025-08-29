import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import useSupabaseClient from "@/lib/supabase/client";

export interface Task {
    id: string;
    title: string;
    due_date: string;
    status: string;
    category: string;
    task_tags: { tag: string }[];
}

export default function useTasks(userId: string) {
    const supabase = useSupabaseClient();
    const router = useRouter(); // Initialize router
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async (
        searchQuery: string,
        selectedCategory: string,
        selectedDueDate: string,
        sortField: "title" | "due_date" | "status" | "category",
        sortDirection: "asc" | "desc"
    ) => {
        if (!userId) return;

        try {
            let query = supabase
                .from("tasks")
                .select("id, title, due_date, status, category, position, task_tags(tag)")
                .eq("user_id", userId)
                .order("position", { ascending: true }); // Sort by position

            if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);
            if (selectedCategory !== "All")
                query = query.eq("category", selectedCategory);

            const today = new Date().toISOString().split("T")[0];
            switch (selectedDueDate) {
                case "Today":
                    query = query.eq("due_date", today);
                    break;
                case "Tomorrow":
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    query = query.eq("due_date", tomorrow.toISOString().split("T")[0]);
                    break;
                case "This Week":
                    const startOfWeek = new Date();
                    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    query = query
                        .gte("due_date", startOfWeek.toISOString().split("T")[0])
                        .lte("due_date", endOfWeek.toISOString().split("T")[0]);
                    break;
                case "Overdue":
                    query = query.lt("due_date", today).neq("status", "Completed");
                    break;
            }

            const { data: tasksData, error } = await query;

            if (error) throw error;

            // Sort tasks after fetching
            let sortedTasks = tasksData || [];
            if (sortField === "due_date") {
                sortedTasks.sort((a: Task, b: Task) => {
                    const dateA = new Date(a.due_date).getTime(); // Convert to timestamp
                    const dateB = new Date(b.due_date).getTime(); // Convert to timestamp
                    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
                });
            } else {
                // Default sorting for other fields (e.g., title, status, category)
                sortedTasks.sort((a: Task, b: Task) => {
                    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
                    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                });
            }

            setTasks(sortedTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const { error } = await supabase.from("tasks").delete().eq("id", taskId);
            if (error) throw error;
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const updateTaskPositions = async (reorderedTasks: Task[], status: string) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error("User is not authenticated.");
            return;
        }

        try {
            const updates = reorderedTasks.map((task, index) => ({
                id: task.id,
                title: task.title,
                category: task.category,
                due_date: task.due_date,
                position: index,
                status: status,
                user_id: user.id,
            }));

            const { error } = await supabase.from("tasks").upsert(updates);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating task positions:", error);
        }
    };

    const updateStatus = async (taskId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("tasks")
                .update({ status: newStatus })
                .eq("id", taskId);
            if (error) throw error;
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            );
            router.push("/home");
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    return {
        tasks,
        loading,
        fetchTasks,
        deleteTask,
        updateStatus,
        updateTaskPositions
    };
}