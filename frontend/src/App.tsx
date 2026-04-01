import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import SocialMedia from './pages/SocialMedia'
import StudentAchievements from './pages/StudentAchievements'
import ContentUpload from './pages/ContentUpload'
import StudentSegmentation from './pages/StudentSegmentation'
import AlertManagement from './pages/AlertManagement'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/social-media" element={<SocialMedia />} />
        <Route path="/student-achievements" element={<StudentAchievements />} />
        <Route path="/content-upload" element={<ContentUpload />} />
        <Route path="/student-segmentation" element={<StudentSegmentation />} />
        <Route path="/alert-management" element={<AlertManagement />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
