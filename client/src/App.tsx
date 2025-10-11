import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ToastProvider } from "./components/common/Toast";
import LandingPage from "./pages/LandingPage";
import LandingPageNew from "./pages/LandingPageNew";
import PricingPage from "./pages/PricingPage";
import FeaturesPage from "./pages/FeaturesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Login from "./pages/Login";
import EnhancedLogin from "./pages/EnhancedLogin";
import Layout from "./components/common/Layout";
import Dashboard from "./components/coordinator/Dashboard";
import StudentManagement from "./components/coordinator/StudentManagement";
import EnhancedStudentManagement from "./components/coordinator/EnhancedStudentManagement";
import StudentProfileDashboard from "./components/coordinator/StudentProfileDashboard";
import TeacherManagement from "./components/coordinator/TeacherManagement";
import CourseManagement from "./components/coordinator/CourseManagement";
import TimetableManagement from "./components/coordinator/TimetableManagement";
import DepartmentManagement from "./components/coordinator/DepartmentManagement";
import AttendancePage from "./components/coordinator/AttendancePage";
import AnalyticsDashboard from "./components/coordinator/AnalyticsDashboard";
import StudentEnrollment from "./components/coordinator/StudentEnrollment";
import TeacherDashboard from "./pages/TeacherDashboard";
import EnhancedTeacherDashboard from "./pages/EnhancedTeacherDashboard";
import EnhancedTeacherTimetable from "./pages/EnhancedTeacherTimetable";
import EnhancedStudentDashboard from "./pages/EnhancedStudentDashboard";
import Profile from "./pages/Profile";
import StudentProfile from "./pages/StudentProfile";
import EnhancedStudentProfile from "./pages/EnhancedStudentProfile";
import MyTimetable from "./pages/MyTimetable";
import EnhancedMyTimetable from "./pages/EnhancedMyTimetable";
import NotificationCenter from "./pages/NotificationCenter";
import TakeAttendance from "./components/teacher/TakeAttendance";
import EnhancedStudentAttendance from "./pages/EnhancedStudentAttendance";
import EnhancedGradeTracker from "./components/student/EnhancedGradeTracker";
import StudentSmartAttendance from "./pages/StudentSmartAttendance";
import StudentFaceEnrollment from "./pages/StudentFaceEnrollment";
import EnhancedAnnouncementSystem from "./components/student/EnhancedAnnouncementSystem";
import EnhancedResultManagement from "./components/coordinator/EnhancedResultManagement";
import TeacherAttendanceDashboard from "./components/teacher/TeacherAttendanceDashboard";
import StudentCourseEnrollment from "./components/coordinator/StudentCourseEnrollment";
import AttendanceReportsDashboard from "./components/coordinator/AttendanceReportsDashboard";
import StudentAttendanceView from "./components/student/StudentAttendanceView";
import AttendanceHistoryCalendar from "./components/teacher/AttendanceHistoryCalendar";
import UnifiedAttendanceHistory from "./components/teacher/UnifiedAttendanceHistory";
import SmartAttendanceDashboard from "./components/teacher/SmartAttendanceDashboard";
import SmartDataEntryPage from "./pages/SmartDataEntryPage";
import SmartTimetableGenerator from "./pages/SmartTimetableGenerator";
import TimetableResults from "./pages/TimetableResultsClean";

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
  { path: "/coordinator", component: Dashboard, exact: true },
  { path: "/students", component: EnhancedStudentManagement },
  { path: "/students/:id", component: StudentProfileDashboard },
  { path: "/teachers", component: TeacherManagement },
  { path: "/courses", component: CourseManagement },
  { path: "/departments", component: DepartmentManagement },
  { path: "/timetable/generate", component: SmartTimetableGenerator }, // More specific route first
  { path: "/timetable/results", component: TimetableResults }, // Results page
  { path: "/timetable", component: TimetableManagement },
  { path: "/attendance", component: AttendancePage, exact: true },
  { path: "/attendance/reports", component: AttendanceReportsDashboard },
  { path: "/students/enrollment", component: StudentCourseEnrollment },
  { path: "/analytics", component: AnalyticsDashboard },
  { path: "/results", component: EnhancedResultManagement },
  { path: "/coordinator/student-enrollment", component: StudentEnrollment },
  { path: "/smart-data-entry", component: SmartDataEntryPage },
];

const teacherRoutes = [
  { path: "/teacher", component: EnhancedTeacherDashboard, exact: true },
  { path: "/teacher/dashboard", component: TeacherDashboard, exact: true },
  { path: "/my-timetable", component: EnhancedTeacherTimetable, exact: true },
  { path: "/teacher/timetable", component: EnhancedTeacherTimetable, exact: true },
  { path: "/attendance/take", component: TakeAttendance },
  { path: "/teacher/attendance", component: TeacherAttendanceDashboard },
  { path: "/teacher/attendance/history", component: UnifiedAttendanceHistory },
  { path: "/teacher/smart-attendance", component: SmartAttendanceDashboard },
];

import CourseDetailPage from "./pages/CourseDetailPage";
import EnhancedAttendanceStats from "./pages/EnhancedAttendanceStats";

const studentRoutes = [
  { path: "/student", component: EnhancedStudentDashboard, exact: true },
  { path: "/attendance/me", component: EnhancedStudentAttendance },
  { path: "/student/attendance", component: StudentAttendanceView },
  { path: "/student/attendance/stats", component: EnhancedAttendanceStats },
  { path: "/student/course/:courseId", component: CourseDetailPage },
  { path: "/student/face-enrollment", component: StudentFaceEnrollment },
  { path: "/student/smart-attendance", component: StudentSmartAttendance },
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
            <Route path="/" exact component={LandingPageNew} />
            <Route path="/landing" exact component={LandingPageNew} />
            <Route path="/landing-old" exact component={LandingPage} />
            <Route path="/pricing" exact component={PricingPage} />
            <Route path="/features" exact component={FeaturesPage} />
            <Route path="/about" exact component={AboutPage} />
            <Route path="/contact" exact component={ContactPage} />
            <Route path="/login" component={EnhancedLogin} />
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
