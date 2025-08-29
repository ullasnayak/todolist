"use client";

import { Task } from "@/components/types/task";
import { Button } from "@/components/ui/button";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableItem } from "./SortableItem";

interface CardViewProps {
    todoTasks: Task[];
    inProgressTasks: Task[];
    completedTasks: Task[];
    onStatusChange: (taskId: string, newStatus: string) => void;
}

export function CardView({
    todoTasks,
    inProgressTasks,
    completedTasks,
    onStatusChange,
}: CardViewProps) {
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        // Find which column the item was dropped in
        let newStatus = "Pending";
        if (overId === "in-progress-column") newStatus = "In Progress";
        else if (overId === "completed-column") newStatus = "Completed";

        onStatusChange(activeId, newStatus);
    };

    const renderTaskCard = (task: Task) => (
        <SortableItem key={task.id} id={task.id}>
            <div className="p-4 hover:bg-gray-50 border-b cursor-grab active:cursor-grabbing">
                <div className="flex items-start">
                    <input
                        type="checkbox"
                        className="mt-1 mr-3"
                        checked={task.taskStatus === "Completed"}
                        onChange={() => {
                            const newStatus = task.taskStatus === "Completed" ? "Pending" : "Completed";
                            onStatusChange(task.id, newStatus);
                        }}
                    />
                    <div className="flex-1">
                        <p className="font-medium">{task.taskName}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                            <span className="capitalize">{task.taskCategory}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(task.dueOn).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${task.taskStatus === "Completed"
                            ? "bg-green-100 text-green-800"
                            : task.taskStatus === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                    >
                        {task.taskStatus}
                    </span>
                </div>
            </div>
        </SortableItem>
    );

    return (
        <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* To Do Column */}
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <div className="bg-gray-100 p-3 border-b">
                        <h3 className="font-semibold">TO DO</h3>
                    </div>
                    <SortableContext
                        id="todo-column"
                        items={todoTasks}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="divide-y">
                            {todoTasks.length > 0 ? (
                                todoTasks.map(renderTaskCard)
                            ) : (
                                <div className="p-4 text-center text-gray-500">No tasks</div>
                            )}
                        </div>
                    </SortableContext>
                </div>

                {/* In Progress Column */}
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <div className="bg-blue-100 p-3 border-b">
                        <h3 className="font-semibold">IN PROGRESS</h3>
                    </div>
                    <SortableContext
                        id="in-progress-column"
                        items={inProgressTasks}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="divide-y">
                            {inProgressTasks.length > 0 ? (
                                inProgressTasks.map(renderTaskCard)
                            ) : (
                                <div className="p-4 text-center text-gray-500">No tasks</div>
                            )}
                        </div>
                    </SortableContext>
                </div>

                {/* Completed Column */}
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <div className="bg-green-100 p-3 border-b">
                        <h3 className="font-semibold">COMPLETED</h3>
                    </div>
                    <SortableContext
                        id="completed-column"
                        items={completedTasks}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="divide-y">
                            {completedTasks.length > 0 ? (
                                completedTasks.map(renderTaskCard)
                            ) : (
                                <div className="p-4 text-center text-gray-500">No tasks</div>
                            )}
                        </div>
                    </SortableContext>
                </div>
            </div>

            {/* Action buttons at bottom */}
            <div className="flex space-x-4 mt-6">
                <Button variant="ghost" className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" checked readOnly className="mr-2" />
                    Search
                </Button>
                <Button variant="ghost" className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" checked readOnly className="mr-2" />
                    ADD TASK
                </Button>
            </div>
        </DndContext>
    );
}