import { useEffect, useState } from "react";
import useSupabaseClient from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

type ActivityLog = {
    id: string;
    action: string;
    description: string;
    created_at: string;
};

export default function ActivityLog({ taskId }: { taskId: string }) {
    const supabase = useSupabaseClient();
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from("activity_logs")
                .select("*")
                .eq("task_id", taskId)
                .order("created_at", { ascending: false });

            if (error) {
                setLogs([]);
            } else if (Array.isArray(data)) {
                setLogs(data);
            } else {
                setLogs([]);
            }
        };

        fetchLogs();
    }, [taskId, supabase]);

    const displayedLogs = logs.slice(0, 10);

    return (
        <Card className="w-full max-w-2xl p-4 bg-white rounded-xl shadow-md">
            <CardContent className="flex flex-col space-y-4">
                <h2 className="text-lg font-semibold">Activity Log</h2>
                <div className="overflow-y-auto max-h-64">
                    {displayedLogs.length > 0 ? (
                        displayedLogs.map((log) => (
                            <div key={log.id} className="border-b py-4">
                                <p className="text-sm text-gray-600 mb-1">{log.action}</p>
                                <p className="text-gray-800 mb-2">{log.description}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(log.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No activity recorded.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}