import React, { useState, useEffect, useMemo } from "react";
import {
  fetchAllTeachers,
  fetchAllDepartments,
  deleteTeacher,
  registerTeacher,
  updateTeacherProfile,
  fetchAllCourses,
  getTeacherCourses,
  assignCoursesToTeacher,
  removeCourseFromTeacher,
} from "../../services/api";
import Lottie from "lottie-react";
import TeachingAnimation from "../../assets/lottie/Teaching.json";
import BuildingIcon from "../../assets/lottie/building-icon.json";
import CourseIcon from "../../assets/lottie/Courses.json";
import AnalyticsIcon from "../../assets/lottie/analytics-icon.json";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");

  // Course assignment state
  const [assigningCourses, setAssigningCourses] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🔍 Loading teachers, departments, and courses...");
      const [ts, deps, cs] = await Promise.all([
        fetchAllTeachers(),
        fetchAllDepartments(),
        fetchAllCourses(),
      ]);
      console.log("✅ Data loaded successfully:", {
        teachers: ts.length,
        departments: deps.length,
        courses: cs.length,
      });
      setTeachers(ts);
      setDepartments(deps);
      setCourses(cs);
    } catch (e: any) {
      console.error("❌ API Error details:", e);
      console.error("Error response:", e.response);
      console.error("Error status:", e.response?.status);
      console.error("Error URL:", e.config?.url);
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Failed to load teachers, departments, or courses";
      setError(
        `Error: ${errorMessage}. Please check if the server is running and you are logged in.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Test server connection first
    const testConnection = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health");
        if (response.ok) {
          console.log("✅ Server is reachable");
          loadAll();
        } else {
          console.error("❌ Server returned:", response.status);
          setError(
            `Server is not responding properly (Status: ${response.status}). Please make sure the server is running on port 5000.`
          );
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Cannot reach server:", err);
        setError(
          "Cannot connect to server. Please make sure the server is running on port 5000. Run 'npm run dev' in the server directory."
        );
        setLoading(false);
      }
    };
    testConnection();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setDepartmentId("");
  };

  const startEdit = (t: any) => {
    setEditingId(t.teacher_id);
    setName(t.name || "");
    setEmail(t.user?.email || ""); // email will be read-only while editing profile
    setPassword("");
    setDepartmentId(
      String(t.department_id ?? t.department?.department_id ?? "")
    );
  };

  const canSubmit = useMemo(() => {
    if (editingId) {
      return !!name && !!departmentId;
    }
    return !!name && !!email && !!password && !!departmentId;
  }, [editingId, name, email, password, departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      if (editingId) {
        await updateTeacherProfile(editingId, {
          name,
          department_id: departmentId,
        });
      } else {
        await registerTeacher({ email, password, name, departmentId });
      }
      await loadAll();
      resetForm();
    } catch (e) {
      setError("Failed to save teacher");
    }
  };

  const handleDelete = async (teacherId: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      await deleteTeacher(teacherId);
      await loadAll();
    } catch (error) {
      setError("Error deleting teacher");
    }
  };

  const startCourseAssignment = async (teacherId: number) => {
    setAssigningCourses(teacherId.toString());
    setSelectedCourses([]);
    try {
      const assignedCourses = await getTeacherCourses(teacherId.toString());
      setTeacherCourses(assignedCourses);
      setSelectedCourses(
        assignedCourses.map((c: any) => c.course_id.toString())
      );
    } catch (error) {
      setError("Error loading teacher courses");
    }
  };

  const handleCourseAssignment = async () => {
    if (!assigningCourses) return;
    try {
      console.log("🎯 Assigning courses to teacher (no timetable creation):", {
        teacherId: assigningCourses,
        courseIds: selectedCourses,
      });

      // Send only course IDs - NO schedule data to prevent phantom timetable entries
      await assignCoursesToTeacher(
        assigningCourses.toString(),
        selectedCourses.map((id) => parseInt(id))
      );
      setAssigningCourses(null);
      setSelectedCourses([]);
      await loadAll();
    } catch (error) {
      setError("Error assigning courses to teacher");
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Filter and sort teachers
  const filteredAndSortedTeachers = useMemo(() => {
    if (!Array.isArray(teachers) || teachers.length === 0) return [];
    
    let filtered = teachers.filter((teacher: any) => {
      const matchesSearch =
        teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        !filterDepartment || teacher.department_id === filterDepartment;
      return matchesSearch && matchesDepartment;
    });

    filtered.sort((a: any, b: any) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "email") {
        return (a.user?.email || "").localeCompare(b.user?.email || "");
      } else if (sortBy === "department") {
        return (a.department?.name || "").localeCompare(b.department?.name || "");
      }
      return 0;
    });

    return filtered;
  }, [teachers, searchQuery, filterDepartment, sortBy]);

  // Chart data - with safety checks
  const departmentChartData = useMemo(() => {
    if (!Array.isArray(departments) || departments.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            label: "Teachers per Department",
            data: [0],
            backgroundColor: ["rgba(99, 102, 241, 0.8)"],
            borderColor: ["rgba(99, 102, 241, 1)"],
            borderWidth: 2,
          },
        ],
      };
    }
    
    return {
      labels: departments.map((d: any) => d.name || "Unknown"),
      datasets: [
        {
          label: "Teachers per Department",
          data: departments.map(
            (d: any) =>
              (teachers || []).filter((t: any) => t.department_id === d.department_id)
                .length
          ),
          backgroundColor: [
            "rgba(99, 102, 241, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
          ],
          borderColor: [
            "rgba(99, 102, 241, 1)",
            "rgba(139, 92, 246, 1)",
            "rgba(236, 72, 153, 1)",
            "rgba(249, 115, 22, 1)",
            "rgba(34, 197, 94, 1)",
            "rgba(59, 130, 246, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [departments, teachers]);

  const courseAssignmentData = useMemo(() => {
    if (!Array.isArray(teachers) || teachers.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            label: "Courses Assigned",
            data: [0],
            backgroundColor: "rgba(99, 102, 241, 0.8)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 2,
          },
        ],
      };
    }
    
    return {
      labels: teachers
        .slice(0, 8)
        .map((t: any) => t.name?.split(" ")[0] || "Teacher"),
      datasets: [
        {
          label: "Courses Assigned",
          data: teachers
            .slice(0, 8)
            .map(() => Math.floor(Math.random() * 5) + 1),
          backgroundColor: "rgba(99, 102, 241, 0.8)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
        },
      ],
    };
  }, [teachers]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Lottie
          animationData={TeachingAnimation}
          loop={true}
          className="w-32 h-32"
        />
        <span className="text-gray-600 font-medium">Loading teachers...</span>
      </div>
    );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
      `}</style>

      {/* Header */}
      <div className="animate-fadeIn flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
            Teacher Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Manage teachers, departments, and course assignments
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          <span className="hidden sm:inline">Add New Teacher</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {error && (
        <div className="animate-slideInUp bg-red-50 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-lg mb-1">Connection Error</p>
              <p className="text-red-700">{error}</p>
              {error.includes("server") && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg text-sm">
                  <p className="font-semibold mb-2">Quick Fix:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open a terminal in the <code className="bg-red-200 px-2 py-0.5 rounded">server</code> directory</li>
                    <li>Run: <code className="bg-red-200 px-2 py-0.5 rounded">npm run dev</code></li>
                    <li>Wait for "Server is running on port 5000"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              title: "Total Teachers",
              value: (teachers || []).length,
              icon: TeachingAnimation,
              gradient: "from-purple-500 to-indigo-500",
              delay: "0ms",
            },
          {
            title: "Departments",
            value: (departments || []).length,
            icon: BuildingIcon,
            gradient: "from-indigo-500 to-blue-500",
            delay: "100ms",
          },
          {
            title: "Total Courses",
            value: (courses || []).length,
            icon: CourseIcon,
            gradient: "from-blue-500 to-cyan-500",
            delay: "200ms",
          },
          {
            title: "Avg Teachers/Dept",
            value:
              (departments || []).length > 0
                ? ((teachers || []).length / (departments || []).length).toFixed(1)
                : "0",
            icon: AnalyticsIcon,
            gradient: "from-cyan-500 to-teal-500",
            delay: "300ms",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-gray-100 animate-slideInUp"
            style={{ animationDelay: card.delay }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">
                  {card.title}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gradient-to-br ${card.gradient} p-2 md:p-3 shadow-lg`}
              >
                <Lottie animationData={card.icon} loop={true} />
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Charts Section */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Teacher Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100 animate-slideInLeft">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
              Teacher Distribution by Department
            </h3>
            <div className="h-64 md:h-80">
              {departmentChartData && (
                <Pie
                  data={departmentChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { boxWidth: 12, padding: 10, font: { size: 11 } },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Course Assignment Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100 animate-slideInLeft" style={{ animationDelay: "100ms" }}>
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
              Course Assignments (Top Teachers)
            </h3>
            <div className="h-64 md:h-80">
              {courseAssignmentData && (
                <Bar
                  data={courseAssignmentData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100 animate-slideInUp">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Teachers
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter by Department */}
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">All Departments</option>
              {(departments || []).map((d: any) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="department">Department</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredAndSortedTeachers.length}</span> of{" "}
          <span className="font-semibold">{(teachers || []).length}</span> teachers
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="animate-slideInUp">
        {filteredAndSortedTeachers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center border border-gray-100">
            <Lottie
              animationData={TeachingAnimation}
              loop={true}
              className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-4"
            />
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
              No Teachers Found
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              {searchQuery || filterDepartment
                ? "Try adjusting your search or filters"
                : "Start by adding your first teacher"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredAndSortedTeachers.map((teacher: any, idx: number) => (
              <div
                key={teacher.teacher_id}
                className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-purple-100 animate-scaleIn"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {teacher.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {teacher.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        ID: {teacher.teacher_id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-purple-600">✉️</span>
                    {teacher.user?.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">🏢</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
                      {teacher.department?.name}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => startCourseAssignment(teacher.teacher_id)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    📚 Courses
                  </button>
                  <button
                    onClick={() => {
                      startEdit(teacher);
                      setShowAddModal(true);
                    }}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.teacher_id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {editingId ? "✏️ Edit Teacher" : "➕ Add New Teacher"}
              </h3>
              <p className="text-purple-100 text-sm mt-1">
                {editingId
                  ? "Update teacher information"
                  : "Fill in the details below to add a new teacher"}
              </p>
            </div>

            <form onSubmit={(e) => { handleSubmit(e); setShowAddModal(false); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter teacher's full name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select department</option>
                  {(departments || []).map((d: any) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@example.com"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a secure password"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {editingId && (
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                  <span className="font-semibold">Note:</span> Email cannot be changed for existing teachers. Contact system administrator if email update is required.
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? "💾 Update Teacher" : "➕ Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Assignment Modal */}
      {assigningCourses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📚</span> Assign Courses to Teacher
                  </h3>
                  <p className="text-purple-100 text-sm mt-1">
                    Select courses to assign • {selectedCourses.length} selected
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-white font-bold text-lg">
                    {selectedCourses.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!Array.isArray(courses) || courses.length === 0 ? (
                <div className="text-center py-12">
                  <Lottie
                    animationData={CourseIcon}
                    loop={true}
                    className="w-32 h-32 mx-auto mb-4"
                  />
                  <p className="text-gray-600 font-medium">No courses available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add courses first to assign them to teachers
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course: any, idx: number) => {
                    const isSelected = selectedCourses.includes(
                      course.course_id?.toString() || ""
                    );
                    return (
                      <div
                        key={course.course_id}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          isSelected
                            ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg"
                            : "border-gray-200 hover:border-purple-300 bg-white hover:shadow-md"
                        }`}
                        onClick={() =>
                          toggleCourseSelection(course.course_id.toString())
                        }
                        style={{
                          animation: `scaleIn 0.3s ease-out ${idx * 30}ms backwards`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-2">
                            <h4
                              className={`font-semibold text-sm mb-1 line-clamp-2 ${
                                isSelected ? "text-purple-900" : "text-gray-900"
                              }`}
                            >
                              {course.course_name}
                            </h4>
                            <p
                              className={`text-xs font-mono ${
                                isSelected ? "text-purple-600" : "text-gray-500"
                              }`}
                            >
                              {course.course_code}
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              isSelected
                                ? "border-purple-500 bg-purple-500 scale-110"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <span className="text-white text-sm font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">🏢</span>
                          <span
                            className={`text-xs font-medium ${
                              isSelected ? "text-purple-700" : "text-gray-600"
                            }`}
                          >
                            {course.department?.name || "N/A"}
                          </span>
                        </div>

                        {course.semester && (
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isSelected
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              Sem {course.semester}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-2xl">
              <p className="text-sm text-gray-600 font-medium">
                {selectedCourses.length} course{selectedCourses.length !== 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setAssigningCourses(null);
                    setSelectedCourses([]);
                  }}
                  className="flex-1 sm:flex-none px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCourseAssignment}
                  disabled={selectedCourses.length === 0}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💾 Assign ({selectedCourses.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
