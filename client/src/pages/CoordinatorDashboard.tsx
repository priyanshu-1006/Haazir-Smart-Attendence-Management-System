import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

interface User {
  user_id: number;
  email: string;
  role: string;
}

const CoordinatorDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    departments: 0
  });
  const history = useHistory();

  useEffect(() => {
    // Get user info from token
    const token = localStorage.getItem('token');
    if (!token) {
      history.push('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        user_id: payload.userId,
        email: payload.email,
        role: payload.role
      });
    } catch (error) {
      console.error('Invalid token');
      localStorage.removeItem('token');
      history.push('/');
    }
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Coordinator Dashboard
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.teachers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.courses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Management</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200">
                👤 Add New Student
              </button>
              <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200">
                👥 View All Students
              </button>
              <button 
                onClick={() => history.push('/coordinator/student-enrollment')}
                className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
              >
                📋 Student Enrollment
              </button>
              <button 
                onClick={() => history.push('/coordinator/smart-data-entry')}
                className="w-full text-left px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 text-blue-700 rounded border border-blue-200 transition-colors"
              >
                � Smart Data Entry
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Teacher Management</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200">
                Add New Teacher
              </button>
              <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200">
                View All Teachers
              </button>
              <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200">
                Assign Courses
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Management</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                Add New Course
              </button>
              <button className="w-full text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                View All Courses
              </button>
              <button className="w-full text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                Course Enrollment
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">� Department Management</h3>
            <div className="space-y-3">
              <button 
                onClick={() => history.push('/departments')}
                className="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors"
              >
                🏢 Add New Department
              </button>
              <button 
                onClick={() => history.push('/departments')}
                className="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors"
              >
                📋 View All Departments
              </button>
              <button 
                onClick={() => history.push('/departments')}
                className="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors"
              >
                📚 Manage Semesters
              </button>
              <button 
                onClick={() => history.push('/departments')}
                className="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors"
              >
                👥 Manage Sections
              </button>
              <button 
                onClick={() => history.push('/coordinator/student-enrollment')}
                className="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors"
              >
                🎯 Enroll Students to Sections
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timetable Management</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200">
                Create Timetable
              </button>
              <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200">
                View Schedules
              </button>
              <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200">
                Attendance Reports
              </button>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Backend API: Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Database: Connected (SQLite)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Authentication: Active</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoordinatorDashboard;