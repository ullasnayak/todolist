export interface Task {
  id: string;
  taskName: string;
  dueOn: string;
  taskStatus: 'Pending' | 'In Progress' | 'Completed';
  taskCategory: string;
}