import React from "react";

const Timetable = () => {
    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    const periods = Array.from({ length: 9 }, (_, i) => i + 1); // 9 slots including lunch

    return (
        <div className="p-6">
            <div className="w-full overflow-x-auto">
                <table className="min-w-full border-collapse bg-white shadow-lg">
                    {/* Header */}
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-3 bg-purple-900 text-white">
                                Time/Day
                            </th>
                            {days.map((day) => (
                                <th
                                    key={day}
                                    className="border border-gray-300 p-3 bg-purple-900 text-white"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {periods.map((period) => (
                            <tr
                                key={period}
                                className={period === 5 ? "bg-gray-100" : ""}
                            >
                                <td className="border border-gray-300 p-3 font-medium">
                                    {period === 5
                                        ? "Lunch Break"
                                        : `Period ${period}`}
                                </td>
                                {days.map((day) => (
                                    <td
                                        key={`${day}-${period}`}
                                        className="border border-gray-300 p-3"
                                    >
                                        {period === 5 ? (
                                            <div className="text-center text-gray-600">
                                                Lunch Break
                                            </div>
                                        ) : (
                                            <div className="min-h-[60px]">
                                                {/* Subject content will go here */}
                                                <div className="text-sm font-medium">
                                                    Subject Name
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Teacher Name
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Timetable;
