import React, { useState, useEffect } from 'react';

const ClassTimetable = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);
    const [timetableData, setTimetableData] = useState({ classes: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTimetableData();
    }, []);

    const fetchTimetableData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/get-timetables');
            const data = await response.json();
            setTimetableData(data);
        } catch (error) {
            console.error('Error fetching timetable data:', error);
            // Fallback to dummy data
            setTimetableData({
                classes: {
                    "10A": [
                        { day: "Monday", periods: ["Math", "Physics", "Break", "Chemistry", "English", "CS", "History", "Geography"] },
                        { day: "Tuesday", periods: ["Physics", "Math", "Break", "CS", "Chemistry", "English", "Geography", "History"] },
                    ],
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        // If the class exists in our data, select it
        if (timetableData.classes[query]) {
            setSelectedClass(query);
        } else {
            setSelectedClass(null);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Class Timetables</h1>
            
            {/* Search Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search class (e.g., 10A, 11B)"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        list="class-list"
                    />
                    <datalist id="class-list">
                        {Object.keys(timetableData.classes).map(className => (
                            <option key={className} value={className} />
                        ))}
                    </datalist>
                </div>
            </div>

            {/* Timetable Display */}
            {selectedClass && timetableData.classes[selectedClass] && (
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
                                {timetableData.classes[selectedClass].map((day, index) => (
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