import React from 'react'
import { Route, Routes} from 'react-router-dom'
import Sidebar from './pages/sidebar'
import AdminSidebar from './pages/AdminSidebar'
import './App.css'
import Timetable from './pages/Timetable'
import Admin from './pages/Admin'
import Dataset from './pages/Dataset'
import ClassTimetable from './pages/ClassTimetable'

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route path='/' element={<Sidebar />}>
        <Route index element={<Timetable />} />
      </Route>

      {/* Admin Routes */}
      <Route path='/admin' element={<AdminSidebar />}>
        <Route index element={<Admin />} />
        <Route path="dataset" element={<Dataset />} />
        <Route path="class-timetable" element={<ClassTimetable />} />
      </Route>
    </Routes>
  )
}

export default App