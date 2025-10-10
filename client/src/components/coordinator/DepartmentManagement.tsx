import React, { useEffect, useMemo, useState } from "react";
import {
  fetchAllDepartments,
  fetchAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  api,
} from "../../services/api";
import SectionManagement from "./SectionManagement";
import BulkSectionEnrollment from './BulkSectionEnrollmentSimple';
import BatchBifurcation from "./BatchBifurcation";

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState("");
  const [courseForm, setCourseForm] = useState({
    course_name: "",
    course_code: "",
  });
  const [courseError, setCourseError] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  
  // Student enrollment and batch bifurcation states
  const [selectedSectionForBifurcation, setSelectedSectionForBifurcation] = useState<any>(null);
  const [showStudentEnrollment, setShowStudentEnrollment] = useState(false);
  const [showBatchBifurcation, setShowBatchBifurcation] = useState(false);
  const [availableSections, setAvailableSections] = useState<any[]>([]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const deps = await fetchAllDepartments();
      setDepartments(deps);
      if (!selectedDeptId && deps.length > 0) {
        setSelectedDeptId(String(deps[0].department_id ?? deps[0].id));
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async (deptId: string) => {
    if (!deptId) {
      setCourses([]);
      return;
    }
    try {
      // Server-side filter
      const { data } = await api.get(`/courses?department_id=${deptId}`);
      setCourses(data);
    } catch (e) {
      setCourses([]);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDeptId) loadCourses(selectedDeptId);
  }, [selectedDeptId]);

  // Load sections for the selected department
  const loadSections = async (deptId: string) => {
    if (!deptId) {
      setAvailableSections([]);
      return;
    }
    try {
      const { data } = await api.get(`/sections?department_id=${deptId}`);
      setAvailableSections(data || []);
    } catch (e) {
      setAvailableSections([]);
    }
  };

  useEffect(() => {
    if (selectedDeptId) {
      loadCourses(selectedDeptId);
      loadSections(selectedDeptId);
    }
  }, [selectedDeptId]);

  const createDepartment = async () => {
    if (!newDeptName.trim()) return;
    await api.post("/departments", { name: newDeptName.trim() });
    setNewDeptName("");
    await loadDepartments();
  };

  const startEditDept = (d: any) => {
    setEditingDeptId(String(d.department_id ?? d.id));
    setEditingDeptName(d.name ?? d.department_name ?? "");
  };

  const saveDept = async () => {
    if (!editingDeptId) return;
    await api.put(`/departments/${editingDeptId}`, { name: editingDeptName });
    setEditingDeptId(null);
    setEditingDeptName("");
    await loadDepartments();
  };

  const deleteDept = async (id: string) => {
    await api.delete(`/departments/${id}`);
    if (selectedDeptId === id) setSelectedDeptId("");
    await loadDepartments();
  };

  const submitCourse = async () => {
    setCourseError(null);
    if (!selectedDeptId) {
      alert("Select a department first");
      return;
    }
    if (!courseForm.course_name || !courseForm.course_code) {
      setCourseError("Course name and code are required");
      return;
    }
    if (
      courseForm.course_name.trim().length < 2 ||
      courseForm.course_code.trim().length < 2
    ) {
      setCourseError("Course name and code must be at least 2 characters");
      return;
    }
    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, {
          ...courseForm,
          department_id: Number(selectedDeptId),
        });
        setEditingCourseId(null);
      } else {
        await createCourse({
          ...courseForm,
          department_id: Number(selectedDeptId),
        });
      }
      setCourseForm({ course_name: "", course_code: "" });
      await loadCourses(selectedDeptId);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Failed to save course";
      setCourseError(msg);
    }
  };

  const startEditCourse = (c: any) => {
    setEditingCourseId(String(c.course_id));
    setCourseForm({ course_name: c.course_name, course_code: c.course_code });
  };

  const removeCourse = async (courseId: string) => {
    await deleteCourse(courseId);
    await loadCourses(selectedDeptId);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Department Management</h1>

      {/* Departments CRUD */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">Departments</h2>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2 mb-3">
          <input
            className="border rounded px-2 py-1"
            placeholder="New department name"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={createDepartment}
          >
            Add
          </button>
        </div>
        <ul className="divide-y">
          {departments.map((d: any) => {
            const id = String(d.department_id ?? d.id);
            const isEditing = editingDeptId === id;
            return (
              <li key={id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="dept"
                    checked={selectedDeptId === id}
                    onChange={() => setSelectedDeptId(id)}
                  />
                  {isEditing ? (
                    <input
                      className="border rounded px-2 py-1"
                      value={editingDeptName}
                      onChange={(e) => setEditingDeptName(e.target.value)}
                    />
                  ) : (
                    <span className="font-medium">
                      {d.name ?? d.department_name}
                    </span>
                  )}
                </div>
                <div className="space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded"
                        onClick={saveDept}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-300 px-2 py-1 rounded"
                        onClick={() => {
                          setEditingDeptId(null);
                          setEditingDeptName("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                        onClick={() => startEditDept(d)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded"
                        onClick={() => deleteDept(id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Dynamic Sections Management */}
      {selectedDeptId && <SectionManagement departmentId={selectedDeptId} />}

      {/* Student Enrollment Management */}
      {selectedDeptId && (
        <div className="bg-white rounded shadow p-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowStudentEnrollment(!showStudentEnrollment);
                  setShowBatchBifurcation(false);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showStudentEnrollment
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bulk Section Enrollment
              </button>
              <button
                onClick={() => {
                  setShowBatchBifurcation(!showBatchBifurcation);
                  setShowStudentEnrollment(false);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showBatchBifurcation
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Batch Bifurcation
              </button>
            </div>
          </div>

          {showStudentEnrollment && (
            <div className="mt-4">
              <BulkSectionEnrollment 
                departmentId={selectedDeptId}
                onEnrollmentComplete={() => {
                  // Refresh data if needed
                  loadSections(selectedDeptId);
                }}
              />
            </div>
          )}

          {showBatchBifurcation && (
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Section for Batch Bifurcation
                </label>
                <select
                  value={selectedSectionForBifurcation?.section_id || ''}
                  onChange={(e) => {
                    const section = availableSections.find(s => s.section_id === Number(e.target.value));
                    setSelectedSectionForBifurcation(section || null);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[300px]"
                >
                  <option value="">Select a section</option>
                  {availableSections.map(section => (
                    <option key={section.section_id} value={section.section_id}>
                      {section.section_name} (Semester {section.semester})
                    </option>
                  ))}
                </select>
              </div>

              {selectedSectionForBifurcation && (
                <BatchBifurcation
                  sectionId={selectedSectionForBifurcation.section_id}
                  sectionName={selectedSectionForBifurcation.section_name}
                  onBifurcationComplete={() => {
                    // Refresh data if needed
                    loadSections(selectedDeptId);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Courses under selected department */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">
          Courses {selectedDeptId ? `in Department #${selectedDeptId}` : ""}
        </h2>
        {courseError && <div className="text-red-600 mb-2">{courseError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            className="border rounded px-2 py-1"
            placeholder="Course Name"
            value={courseForm.course_name}
            onChange={(e) =>
              setCourseForm((f) => ({ ...f, course_name: e.target.value }))
            }
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Course Code"
            value={courseForm.course_code}
            onChange={(e) =>
              setCourseForm((f) => ({ ...f, course_code: e.target.value }))
            }
          />
          <button
            className="bg-yellow-600 text-white px-3 py-1 rounded"
            onClick={submitCourse}
          >
            {editingCourseId ? "Update Course" : "Add Course"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Course</th>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c: any) => (
                <tr key={c.course_id} className="border-b">
                  <td className="py-2 pr-4">{c.course_name}</td>
                  <td className="py-2 pr-4">{c.course_code}</td>
                  <td className="py-2 pr-4 space-x-2">
                    <button
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                      onClick={() => startEditCourse(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => removeCourse(String(c.course_id))}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;
