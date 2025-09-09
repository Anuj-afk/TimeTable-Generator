import React from "react";
import { Outlet, Link } from "react-router-dom";

const AdminSidebar = () => {
    return (
        <div className="flex">
            <div className="fixed left-0 top-0 h-screen w-16 bg-indigo-900 flex flex-col justify-between">
                {/* Top Section with Navigation Items */}
                <div className="flex flex-col items-center pt-4 space-y-4">
                    {/* Dashboard Icon/Button */}
                    <Link
                        to="/admin"
                        className="p-3 hover:bg-indigo-700 rounded-lg text-white transition duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </Link>

                    {/* Dataset Icon/Button */}
                    <Link
                        to="/admin/dataset"
                        className="p-3 hover:bg-indigo-700 rounded-lg text-white transition duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </Link>

                    {/* Class Timetable Icon/Button */}
                    <Link
                        to="/admin/class-timetable"
                        className="p-3 hover:bg-indigo-700 rounded-lg text-white transition duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </Link>
                </div>

                {/* Bottom Section */}
                <div className="mb-4 flex flex-col items-center space-y-4">
                    {/* Back to User View */}
                    <Link
                        to="/"
                        className="p-3 hover:bg-indigo-700 rounded-lg text-white transition duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                    </Link>

                    {/* Admin Logo */}
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition duration-300">
                        <span className="text-indigo-900 font-bold text-sm">
                            ADMIN
                        </span>
                    </div>
                </div>
            </div>
            <main className="flex-1 ml-16">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminSidebar;