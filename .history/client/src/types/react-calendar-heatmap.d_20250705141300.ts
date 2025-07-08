declare module 'react-calendar-heatmap' {
  import * as React from 'react';

  export interface HeatmapValue {
    date: string;
    count?: number;
  }

  export interface CalendarHeatmapProps {
    startDate: Date | string;
    endDate: Date | string;
    values: HeatmapValue[];
    classForValue?: (value: HeatmapValue | undefined) => string;
    tooltipDataAttrs?: (value: HeatmapValue | undefined) => Record<string, string>;
    showWeekdayLabels?: boolean;
    gutterSize?: number;
    horizontal?: boolean;
  }

  const CalendarHeatmap: React.FC<CalendarHeatmapProps>;

  export default CalendarHeatmap;
}
