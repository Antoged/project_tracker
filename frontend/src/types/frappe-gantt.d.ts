declare module 'frappe-gantt' {
  interface Task {
    id: string;
    name: string;
    start: Date;
    end: Date;
    progress: number;
    dependencies?: string[];
    custom_class?: string;
  }

  interface GanttOptions {
    view_mode?: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';
    header_height?: number;
    column_width?: number;
    step?: number;
    bar_height?: number;
    bar_corner_radius?: number;
    arrow_curve?: number;
    padding?: number;
    date_format?: string;
    language?: string;
    custom_popup_html?: (task: Task) => string;
    on_click?: (task: Task) => void;
    on_date_change?: (task: Task, start: Date, end: Date) => void;
    on_progress_change?: (task: Task, progress: number) => void;
    on_view_change?: (mode: string) => void;
  }

  class Gantt {
    constructor(wrapper: HTMLElement, tasks: Task[], options?: GanttOptions);
    change_view_mode(mode: GanttOptions['view_mode']): void;
    refresh(tasks: Task[]): void;
    destroy?(): void;
  }

  export default Gantt;
}
