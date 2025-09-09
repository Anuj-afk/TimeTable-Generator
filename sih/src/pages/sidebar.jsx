import React from "react";
import { Outlet, Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="flex">
            <div className="fixed left-0 top-0 h-screen w-16 bg-purple-900 flex flex-col justify-between">
                {/* Top Section with Navigation Items */}
                <div className="flex flex-col items-center pt-4 space-y-4">
                    {/* Timetable Icon/Button */}
                    <Link
                        to="/"
                        className="p-3 hover:bg-purple-700 rounded-lg text-white transition duration-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </Link>
                </div>

                {/* Bottom Section */}
                <div className="mb-4 flex flex-col items-center space-y-4">
                    {/* Admin Link */}
                    <Link
                        to="/admin"
                        className="p-3 hover:bg-purple-700 rounded-lg text-white transition duration-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </Link>

                    {/* Logo */}
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition duration-300">
                        <span className="text-purple-900 font-bold text-sm">
                            LOGO
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

export default Sidebar;
