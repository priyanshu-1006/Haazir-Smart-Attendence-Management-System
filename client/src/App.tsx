import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ToastProvider } from "./components/common/Toast";

import Login from "./pages/Login";

import Layout from "./components/common/Layout";


import DepartmentManagement from "./components/coordinator/DepartmentManagement";

import EnhancedStudentDashboard from "./pages/EnhancedStudentDashboard";
import Profile from "./pages/Profile";

import EnhancedStudentProfile from "./pages/EnhancedStudentProfile";

import EnhancedMyTimetable from "./pages/EnhancedMyTimetable";
import NotificationCenter from "./pages/NotificationCenter";
import TakeAttendance from "./components/teacher/TakeAttendance";
import EnhancedStudentAttendance from "./pages/EnhancedStudentAttendance";
import EnhancedGradeTracker from "./components/student/EnhancedGradeTracker";

import EnhancedAnnouncementSystem from "./components/student/EnhancedAnnouncementSystem";

import TeacherAttendanceDashboard from "./components/teacher/TeacherAttendanceDashboard";

import StudentAttendanceView from "./components/student/StudentAttendanceView";
import AttendanceHistoryCalendar from "./components/teacher/AttendanceHistoryCalendar";
import UnifiedAttendanceHistory from "./components/teacher/UnifiedAttendanceHistory";
import SmartAttendanceDashboard from "./components/teacher/SmartAttendanceDashboard";


const getRole = (): string | null => {
  try {
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    return u?.role || null;
  } catch {
    return null;
  }
};

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

interface PrivateRouteProps {
  path: string;
  exact?: boolean;
  roles: string[];
  component?: React.ComponentType<any>;
  render?: () => React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  roles,
  component: Component,
  render,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      console.log(
        "🔐 PrivateRoute checking:",
        props.location.pathname,
        "Required roles:",
        roles
      );
      const token = getToken();
      const role = getRole();
      console.log("👤 Current role:", role, "Has token:", !!token);

      if (!token || !role) {
        console.log("❌ No token/role - redirecting to login");
        return (
          <Redirect
            to={{ pathname: "/login", state: { from: props.location } }}
          />
        );
      }

      if (!roles.includes(role)) {
        console.log("❌ Role mismatch - user is", role, "but needs", roles);
        // Redirect to appropriate dashboard based on role
        const dashboardPaths = {
          coordinator: "/coordinator",
          teacher: "/teacher",
          student: "/student",
        };
        return (
          <Redirect
            to={dashboardPaths[role as keyof typeof dashboardPaths] || "/login"}
          />
        );
      }

      console.log("✅ Access granted to", props.location.pathname);
      if (render) return render();
      if (Component) return <Component {...props} />;
      return null;
    }}
  />
);

// Route configurations by role for better organization
const coordinatorRoutes = [
  
  { path: "/departments", component: DepartmentManagement },
  
];

const teacherRoutes = [
  
  { path: "/attendance/take", component: TakeAttendance },
  { path: "/teacher/attendance", component: TeacherAttendanceDashboard },
  { path: "/teacher/attendance/history", component: UnifiedAttendanceHistory },
  { path: "/teacher/smart-attendance", component: SmartAttendanceDashboard },
];

import CourseDetailPage from "./pages/CourseDetailPage";


const studentRoutes = [
  { path: "/student", component: EnhancedStudentDashboard, exact: true },
  { path: "/attendance/me", component: EnhancedStudentAttendance },
  { path: "/student/attendance", component: StudentAttendanceView },
  
  { path: "/student/course/:courseId", component: CourseDetailPage },
  
  { path: "/student/profile", component: EnhancedStudentProfile },
  { path: "/student/grades", component: EnhancedGradeTracker },
  { path: "/student/announcements", component: EnhancedAnnouncementSystem },
  { path: "/student/notifications", component: NotificationCenter },
];

const sharedRoutes = [
  {
    path: "/my-timetable",
    component: EnhancedMyTimetable,
    roles: ["teacher", "student"],
  },
  {
    path: "/profile",
    component: Profile,
    roles: ["coordinator", "teacher", "student"],
  },
];

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Switch>
            {/* Public Routes */}
            
            <Route path="/login-old" component={Login} />

            {/* Coordinator Routes */}
            {coordinatorRoutes.map(({ path, component: Component, exact }) => (
              <PrivateRoute
                key={path}
                path={path}
                exact={exact}
                roles={["coordinator"]}
                render={() => (
                  <Layout>
                    <Component />
                  </Layout>
                )}
              />
            ))}

            {/* Teacher Routes */}
            {teacherRoutes.map(({ path, component: Component, exact }) => (
              <PrivateRoute
                key={path}
                path={path}
                exact={exact}
                roles={["teacher"]}
                render={() => (
                  <Layout>
                    <Component />
                  </Layout>
                )}
              />
            ))}

            {/* Student Routes */}
            {studentRoutes.map(({ path, component: Component, exact }) => {
              console.log(
                "🔍 Registering student route:",
                path,
                "exact:",
                exact
              );
              return (
                <PrivateRoute
                  key={path}
                  path={path}
                  exact={exact}
                  roles={["student"]}
                  render={() => {
                    console.log("✅ Rendering student route:", path);
                    return (
                      <Layout>
                        <Component />
                      </Layout>
                    );
                  }}
                />
              );
            })}

            {/* Shared Routes */}
            {sharedRoutes.map(({ path, component: Component, roles }) => (
              <PrivateRoute
                key={path}
                path={path}
                roles={roles}
                render={() => (
                  <Layout>
                    <Component />
                  </Layout>
                )}
              />
            ))}

            {/* 404 Route */}
            <Route
              path="*"
              render={() => {
                const role = getRole();
                const token = getToken();

                if (!token || !role) {
                  return <Redirect to="/login" />;
                }

                // Redirect to appropriate dashboard for unknown routes
                const dashboardPaths = {
                  coordinator: "/coordinator",
                  teacher: "/teacher",
                  student: "/student",
                };

                return (
                  <Redirect
                    to={
                      dashboardPaths[role as keyof typeof dashboardPaths] ||
                      "/login"
                    }
                  />
                );
              }}
            />
          </Switch>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
