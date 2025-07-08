import ActivityCalendar from 'react-activity-calendar';

const Heatmap = () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    // Align to full weeks
    const startDate = new Date(sixMonthsAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    // Generate full range
    const fullData = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
        fullData.push({ date: cursor.toISOString().split('T')[0], count: 0, level: 0 });
        cursor.setDate(cursor.getDate() + 1);
    }

    const tasksDone = [
        { date: '2025-01-10', count: 2 },
        { date: '2025-01-14', count: 4 },
        { date: '2025-01-22', count: 3 },
        { date: '2025-02-03', count: 1 },
        { date: '2025-02-07', count: 5 },
        { date: '2025-02-11', count: 2 },
        { date: '2025-02-25', count: 6 },
        { date: '2025-03-01', count: 3 },
        { date: '2025-03-04', count: 7 },
        { date: '2025-03-10', count: 2 },
        { date: '2025-03-17', count: 4 },
        { date: '2025-03-21', count: 6 },
        { date: '2025-04-01', count: 3 },
        { date: '2025-04-05', count: 5 },
        { date: '2025-04-09', count: 8 },
        { date: '2025-04-12', count: 2 },
        { date: '2025-04-18', count: 9 },
        { date: '2025-04-23', count: 4 },
        { date: '2025-05-01', count: 6 },
        { date: '2025-05-06', count: 3 },
        { date: '2025-05-10', count: 7 },
        { date: '2025-05-13', count: 2 },
        { date: '2025-05-18', count: 5 },
        { date: '2025-05-23', count: 1 },
        { date: '2025-06-01', count: 3 },
        { date: '2025-06-04', count: 6 },
        { date: '2025-06-08', count: 4 },
        { date: '2025-06-12', count: 8 },
        { date: '2025-06-16', count: 2 },
        { date: '2025-06-20', count: 5 },
        { date: today.toISOString().split('T')[0], count: 5 },
    ];

    const mergedData = fullData.map((entry) => {
        const task = tasksDone.find((t) => t.date === entry.date);
        const count = task ? task.count : 0;
        return {
            date: entry.date,
            count,
            level:
                count >= 15 ? 4 :
                    count >= 10 ? 3 :
                        count >= 5 ? 2 :
                            count >= 1 ? 1 : 0,
        };
    });

    //   const totalTasks = mergedData.reduce((sum, day) => sum + day.count, 0);

    return (
        <div style={{ minHeight: 260 }}>
            <ActivityCalendar
                data={mergedData}
                hideTotalCount={true} // 👈 hides default top text
                // showTooltip
                showWeekdayLabels
                // weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                blockSize={22}
                blockMargin={3}
                theme={{
                    dark: ['#1c1c1c', '#3b195a', '#59297b', '#8640b3', '#b374f2'],
                    light: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
                }}
                startDate={startDate.toISOString().split('T')[0]}
                endDate={endDate.toISOString().split('T')[0]}
                renderBlock={(block, activity) => (
                    <g>
                        {block}
                        <title>
                            {activity.count > 0
                                ? `${activity.count} task${activity.count > 1 ? 's' : ''} done on ${activity.date}`
                                : `No tasks done on ${activity.date}`}
                        </title>
                    </g>
                )}
            />

            {/* ✅ Custom footer summary */}

        </div>
    );
};

export default Heatmap;
