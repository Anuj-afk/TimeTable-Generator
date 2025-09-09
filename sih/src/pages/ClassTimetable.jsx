import React, { useState } from 'react';

const ClassTimetable = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);

    // Example class timetable data - replace with your actual data
    const classTimetables = {
        "Class 10A": [
            { day: "Monday", periods: ["Math", "Physics", "Break", "Chemistry", "English", "CS", "History", "Geography"] },
            { day: "Tuesday", periods: ["Physics", "Math", "Break", "CS", "Chemistry", "English", "Geography", "History"] },
            // Add more days...
        ],
        "Class 11B": [
            { day: "Monday", periods: ["CS", "Math", "Break", "Physics", "Chemistry", "English", "Geography", "History"] },
            { day: "Tuesday", periods: ["English", "CS", "Break", "Math", "Physics", "Chemistry", "History", "Geography"] },
            // Add more days...
        ],
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        // If the class exists in our data, select it
        if (classTimetables[query]) {
            setSelectedClass(query);
        } else {
            setSelectedClass(null);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Class Timetables</h1>
            
            {/* Search Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search class (e.g., Class 10A)"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        list="class-list"
                    />
                    <datalist id="class-list">
                        {Object.keys(classTimetables).map(className => (
                            <option key={className} value={className} />
                        ))}
                    </datalist>
                </div>
            </div>

            {/* Timetable Display */}
            {selectedClass && classTimetables[selectedClass] && (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {selectedClass} Timetable
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Day
                                    </th>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                                        <th key={period} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Period {period}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classTimetables[selectedClass].map((day, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {day.day}
                                        </td>
                                        {day.periods.map((period, periodIndex) => (
                                            <td key={periodIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {period || "-"}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassTimetable;