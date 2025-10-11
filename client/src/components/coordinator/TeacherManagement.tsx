import React, { useEffect, useMemo, useState } from "react";
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
  const [assigningCourses, setAssigningCourses] = useState<number | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [ts, deps, cs] = await Promise.all([
        fetchAllTeachers(),
        fetchAllDepartments(),
        fetchAllCourses(),
      ]);
      setTeachers(ts);
      setDepartments(deps);
      setCourses(cs);
    } catch (e: any) {
      console.error("API Error details:", e);
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Failed to load teachers, departments, or courses";
      setError(
        `Error: ${errorMessage}. Please check if you are logged in and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
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
    setAssigningCourses(teacherId);
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

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading teachers...</span>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            👨‍🏫 Teacher Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage teachers and assign courses
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Teachers: {teachers.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Add/Edit Teacher Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editingId ? "✏️ Edit Teacher" : "➕ Add New Teacher"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter teacher name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
            >
              <option value="">Select department</option>
              {departments.map((d: any) => (
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
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            </>
          )}
          {editingId && (
            <div className="md:col-span-2 flex items-center">
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-lg text-sm">
                <span className="font-medium">Note:</span> Editing teacher #
                {editingId}. Email cannot be changed here.
              </div>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingId ? "💾 Update" : "➕ Add Teacher"}
            </button>
            {editingId && (
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={resetForm}
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            📋 Teachers List
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher: any) => (
                <tr key={teacher.teacher_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {teacher.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {teacher.teacher_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {teacher.department?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => startCourseAssignment(teacher.teacher_id)}
                      className="text-purple-600 hover:text-purple-900 font-medium"
                    >
                      📚 Manage Courses
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => startEdit(teacher)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(teacher.teacher_id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Assignment Modal */}
      {assigningCourses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 bg-purple-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                📚 Assign Courses to Teacher
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Select courses to assign to this teacher
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course: any) => (
                  <div
                    key={course.course_id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCourses.includes(course.course_id.toString())
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      toggleCourseSelection(course.course_id.toString())
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {course.course_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {course.course_code}
                        </p>
                        <p className="text-xs text-gray-400">
                          {course.department?.name}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedCourses.includes(course.course_id.toString())
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedCourses.includes(
                          course.course_id.toString()
                        ) && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setAssigningCourses(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ❌ Cancel
              </button>
              <button
                onClick={handleCourseAssignment}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                💾 Assign Courses ({selectedCourses.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
