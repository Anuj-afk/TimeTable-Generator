import React, { useState } from "react";

const Admin = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // Example timetable data - replace with your actual data
    const teacherTimetables = {
        "John Doe": [
            { day: "Monday", periods: ["CS101", "CS102", "Break", "CS103", "", "", "", ""] },
            { day: "Tuesday", periods: ["", "CS101", "Break", "", "CS102", "CS103", "", ""] },
            // ...add other days
        ],
        "Jane Smith": [
            { day: "Monday", periods: ["MATH101", "", "Break", "MATH102", "", "MATH103", "", ""] },
            { day: "Tuesday", periods: ["", "MATH101", "Break", "MATH102", "", "", "MATH103", ""] },
            // ...add other days
        ],
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        const dummyData = [
            { id: 1, name: "Computer Science", faculty: "John Doe" },
            { id: 2, name: "Mathematics", faculty: "Jane Smith" },
            { id: 3, name: "Physics", faculty: "Alan Turing" },
        ];

        const filteredResults = dummyData.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.faculty.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults(filteredResults);
    };

    const handleTeacherClick = (faculty) => {
        setSelectedTeacher(faculty);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            {/* Search Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search courses, faculty..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleTeacherClick(result.faculty)}
                                >
                                    <h3 className="font-medium">{result.name}</h3>
                                    <p className="text-gray-600">{result.faculty}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No results found</p>
                    )}
                </div>
            )}

            {/* Teacher Timetable */}
            {selectedTeacher && teacherTimetables[selectedTeacher] && (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {selectedTeacher}'s Timetable
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
                                {teacherTimetables[selectedTeacher].map((day, index) => (
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

export default Admin;
