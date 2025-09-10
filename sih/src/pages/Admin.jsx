import React, { useState, useEffect } from "react";

const Admin = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [timetableData, setTimetableData] = useState({ teachers: {}, classes: {} });
    const [loading, setLoading] = useState(true);

    // Fetch timetable data on component mount
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
            // Keep using dummy data as fallback
            setTimetableData({
                teachers: {
                    "John Doe": [
                        { day: "Monday", periods: ["CS101", "CS102", "Break", "CS103", "", "", "", ""] },
                        { day: "Tuesday", periods: ["", "CS101", "Break", "", "CS102", "CS103", "", ""] },
                    ],
                    "Jane Smith": [
                        { day: "Monday", periods: ["MATH101", "", "Break", "MATH102", "", "MATH103", "", ""] },
                        { day: "Tuesday", periods: ["", "MATH101", "Break", "MATH102", "", "", "MATH103", ""] },
                    ],
                },
                classes: {}
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const results = [];
        
        // Search through teachers
        Object.keys(timetableData.teachers).forEach(teacherName => {
            if (teacherName.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    id: `teacher-${teacherName}`,
                    name: `${teacherName} (Teacher)`,
                    faculty: teacherName,
                    type: 'teacher'
                });
            }
        });

        // Search through classes
        Object.keys(timetableData.classes).forEach(className => {
            if (className.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    id: `class-${className}`,
                    name: `${className} (Class)`,
                    faculty: className,
                    type: 'class'
                });
            }
        });

        // Add subject-based search (search within timetable content)
        Object.entries(timetableData.teachers).forEach(([teacherName, schedule]) => {
            const subjects = schedule.flatMap(day => day.periods).filter(Boolean);
            const hasMatchingSubject = subjects.some(subject => 
                subject.toLowerCase().includes(query.toLowerCase())
            );
            
            if (hasMatchingSubject && !results.some(r => r.faculty === teacherName)) {
                results.push({
                    id: `subject-${teacherName}`,
                    name: `${teacherName} (Teaching: ${query})`,
                    faculty: teacherName,
                    type: 'teacher'
                });
            }
        });

        setSearchResults(results.slice(0, 10)); // Limit results
    };

    const handleTeacherClick = (faculty, type) => {
        setSelectedTeacher({ name: faculty, type: type || 'teacher' });
    };

    const getCurrentTimetable = () => {
        if (!selectedTeacher) return null;
        
        if (selectedTeacher.type === 'teacher') {
            return timetableData.teachers[selectedTeacher.name];
        } else {
            return timetableData.classes[selectedTeacher.name];
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
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            {/* Refresh Button */}
            <div className="mb-4">
                <button
                    onClick={fetchTimetableData}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                    Refresh Data
                </button>
            </div>
            
            {/* Search Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search teachers, classes, or subjects..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </span>
                </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
                <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Search Results</h2>
                    {searchResults.length > 0 ? (
                        <div className="space-y-4">
                            {searchResults.map(result => (
                                <div 
                                    key={result.id} 
                                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition duration-200"
                                    onClick={() => handleTeacherClick(result.faculty, result.type)}
                                >
                                    <h3 className="font-medium">{result.name}</h3>
                                    <p className="text-gray-600 capitalize">{result.type}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No results found</p>
                    )}
                </div>
            )}

            {/* Timetable Display */}
            {selectedTeacher && getCurrentTimetable() && (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {selectedTeacher.name}'s Timetable ({selectedTeacher.type})
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                                        <th key={period} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Period {period}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {getCurrentTimetable().map((day, index) => (
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

            {/* Data Summary */}
            <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Data Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-indigo-50 rounded">
                        <div className="text-2xl font-bold text-indigo-600">
                            {Object.keys(timetableData.teachers).length}
                        </div>
                        <div className="text-sm text-gray-600">Teachers</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                            {Object.keys(timetableData.classes).length}
                        </div>
                        <div className="text-sm text-gray-600">Classes</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
