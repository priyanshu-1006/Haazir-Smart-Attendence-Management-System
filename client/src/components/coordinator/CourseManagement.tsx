import React, { useEffect, useState } from "react";
import {
  fetchAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchAllDepartments,
} from "../../services/api";

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [semester, setSemester] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [filterDepartment, setFilterDepartment] = useState<string>("");

  useEffect(() => {
    loadCourses();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await fetchAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !courseName.trim() ||
      !courseCode.trim() ||
      !semester.trim() ||
      !departmentId.trim()
    ) {
      setError("Please fill in all fields including semester and department");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingCourseId) {
        console.log("🔄 Attempting to update course:", {
          id: editingCourseId,
          course_name: courseName,
          course_code: courseCode,
          department_id: parseInt(departmentId),
          semester: parseInt(semester),
        });

        const result = await updateCourse(editingCourseId, {
          course_name: courseName,
          course_code: courseCode,
          department_id: parseInt(departmentId),
          semester: parseInt(semester),
        } as any);

        console.log("✅ Update result:", result);
        setEditingCourseId(null);
      } else {
        await createCourse({
          course_name: courseName,
          course_code: courseCode,
          department_id: parseInt(departmentId),
          semester: parseInt(semester),
        } as any);
      }

      setCourseName("");
      setCourseCode("");
      setSemester("");
      setDepartmentId("");
      await loadCourses();
    } catch (error: any) {
      console.error("Error saving course:", error);

      if (error?.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (error?.response?.status === 404) {
        setError("Course not found. Please refresh and try again.");
      } else {
        setError(
          `Failed to save course: ${
            error?.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: any) => {
    console.log("✏️ Editing course data:", course);
    setCourseName(course.course_name);
    setCourseCode(course.course_code);
    setSemester(course.semester ? course.semester.toString() : "");
    setDepartmentId(
      course.department_id ? course.department_id.toString() : ""
    );
    setEditingCourseId(course.course_id);
    setError(null);
    console.log("📝 Form state after edit:", {
      courseName: course.course_name,
      courseCode: course.course_code,
      semester: course.semester ? course.semester.toString() : "",
      departmentId: course.department_id ? course.department_id.toString() : "",
      editingCourseId: course.course_id,
    });
  };

  const handleDelete = async (courseId: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteCourse(courseId);
      await loadCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingCourseId(null);
    setCourseName("");
    setCourseCode("");
    setSemester("");
    setDepartmentId("");
    setError(null);
  };

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find(
      (dept) => dept.department_id === departmentId
    );
    return department ? department.name : "Unknown Department";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          📚 Course Management
        </h1>
        <div className="text-sm text-gray-500">
          Total Courses:{" "}
          <span className="font-semibold text-blue-600">
            {(() => {
              let filteredCourses = courses;
              if (filterSemester) {
                filteredCourses = filteredCourses.filter(
                  (c) => String(c.semester) === String(filterSemester)
                );
              }
              if (filterDepartment) {
                filteredCourses = filteredCourses.filter(
                  (c) => String(c.department_id) === String(filterDepartment)
                );
              }
              return filteredCourses.length;
            })()}
          </span>
          {(filterSemester || filterDepartment) && (
            <span className="text-green-600 ml-2">
              ({filterSemester && `Semester ${filterSemester}`}
              {filterSemester && filterDepartment && " & "}
              {filterDepartment &&
                `${getDepartmentName(parseInt(filterDepartment))}`}
              )
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Add/Edit Course Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editingCourseId ? "✏️ Edit Course" : "➕ Add New Course"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="courseName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Name
              </label>
              <input
                id="courseName"
                type="text"
                placeholder="e.g., Data Structures and Algorithms"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="courseCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Code
              </label>
              <input
                id="courseCode"
                type="text"
                placeholder="e.g., CS-301"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="semester"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Semester
              </label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Department
              </label>
              <select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingCourseId ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{editingCourseId ? "💾 Update Course" : "➕ Add Course"}</>
              )}
            </button>

            {editingCourseId && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              📋 Course List
            </h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Semester:
                </label>
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Sem {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Department:
                </label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.name.length > 15
                        ? dept.name.substring(0, 15) + "..."
                        : dept.name}
                    </option>
                  ))}
                </select>
              </div>
              {(filterSemester || filterDepartment) && (
                <button
                  onClick={() => {
                    setFilterSemester("");
                    setFilterDepartment("");
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-md transition-colors duration-200"
                >
                  🗑️ Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading && courses.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500">
                Add your first course using the form above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses
                .filter((course) => {
                  // Semester filter
                  const semesterMatch =
                    !filterSemester ||
                    String(course.semester) === String(filterSemester);
                  // Department filter
                  const departmentMatch =
                    !filterDepartment ||
                    String(course.department_id) === String(filterDepartment);
                  return semesterMatch && departmentMatch;
                })
                .map((course) => (
                  <div
                    key={course.course_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                          {course.course_name}
                        </h3>
                        <p className="text-blue-600 font-medium text-sm mt-1">
                          {course.course_code}
                        </p>
                        {course.department_id && (
                          <p className="text-purple-600 font-medium text-xs mt-1">
                            🏢 {getDepartmentName(course.department_id)}
                          </p>
                        )}
                        {course.semester && (
                          <p className="text-green-600 font-medium text-xs mt-1">
                            📚 Semester {course.semester}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleEdit(course)}
                        disabled={loading}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(course.course_id, course.course_name)
                        }
                        disabled={loading}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
