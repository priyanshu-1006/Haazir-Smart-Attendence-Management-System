import Notification from "../models/Notification";
import Student from "../models/Student";
import Course from "../models/Course";

/**
 * NotificationService - Centralized service for creating and managing notifications
 */
class NotificationService {
  /**
   * Create an attendance preview notification (before teacher finalizes)
   */
  static async notifyAttendancePreview(params: {
    studentId: number;
    courseName: string;
    courseCode: string;
    date: string;
    timeSlot?: string;
    status: "present" | "absent";
    sessionId: string;
    reason?: string;
  }) {
    try {
      const {
        studentId,
        courseName,
        courseCode,
        date,
        timeSlot,
        status,
        sessionId,
        reason,
      } = params;

      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const timeInfo = timeSlot ? ` at ${timeSlot}` : "";
      const statusEmoji = status === "present" ? "✅" : "⚠️";
      const statusText = status === "present" ? "Present" : "Absent";

      const message =
        status === "present"
          ? `You will be marked PRESENT for ${courseCode} - ${courseName} on ${formattedDate}${timeInfo}. Teacher has NOT finalized yet.`
          : `You will be marked ABSENT for ${courseCode} - ${courseName} on ${formattedDate}${timeInfo}. ${
              reason ? `Reason: ${reason}. ` : ""
            }⚠️ Inform your teacher immediately if this is incorrect! Teacher has NOT finalized yet.`;

      const notification = await Notification.create({
        user_id: studentId,
        user_role: "student",
        type: "attendance_preview",
        title: `${statusEmoji} Attendance Preview - ${statusText}`,
        message: message,
        related_data: {
          course_name: courseName,
          course_code: courseCode,
          date: date,
          time_slot: timeSlot,
          status: status,
          session_id: sessionId,
          reason: reason,
          is_preview: true,
        },
        priority: status === "absent" ? "urgent" : "high",
        is_read: false,
      });

      console.log(
        `📢 Preview notification sent to student ${studentId} - Status: ${status}`
      );
      return notification;
    } catch (error) {
      console.error("Error creating attendance preview notification:", error);
      throw error;
    }
  }

  /**
   * Create an attendance absent notification
   */
  static async notifyAttendanceAbsent(params: {
    studentId: number;
    courseName: string;
    courseCode: string;
    date: string;
    timeSlot?: string;
    attendanceId?: number;
  }) {
    try {
      const {
        studentId,
        courseName,
        courseCode,
        date,
        timeSlot,
        attendanceId,
      } = params;

      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const timeInfo = timeSlot ? ` at ${timeSlot}` : "";

      const notification = await Notification.create({
        user_id: studentId,
        user_role: "student",
        type: "attendance_absent",
        title: "⚠️ Absent Marked",
        message: `You were marked absent for ${courseCode} - ${courseName} on ${formattedDate}${timeInfo}.`,
        related_data: {
          course_name: courseName,
          course_code: courseCode,
          date: date,
          time_slot: timeSlot,
          attendance_id: attendanceId,
        },
        priority: "high",
        is_read: false,
      });

      console.log(
        `📢 Notification sent to student ${studentId} for absent attendance`
      );
      return notification;
    } catch (error) {
      console.error("Error creating attendance absent notification:", error);
      throw error;
    }
  }

  /**
   * Create an attendance warning notification (for low attendance)
   */
  static async notifyAttendanceWarning(params: {
    studentId: number;
    courseName: string;
    courseCode: string;
    attendancePercentage: number;
    threshold: number;
  }) {
    try {
      const {
        studentId,
        courseName,
        courseCode,
        attendancePercentage,
        threshold,
      } = params;

      const notification = await Notification.create({
        user_id: studentId,
        user_role: "student",
        type: "attendance_warning",
        title: "🚨 Low Attendance Alert",
        message: `Your attendance in ${courseCode} - ${courseName} is ${attendancePercentage.toFixed(
          1
        )}%, below the required ${threshold}%. Please improve your attendance.`,
        related_data: {
          course_name: courseName,
          course_code: courseCode,
          attendance_percentage: attendancePercentage,
          threshold: threshold,
        },
        priority: "urgent",
        is_read: false,
      });

      console.log(`📢 Low attendance warning sent to student ${studentId}`);
      return notification;
    } catch (error) {
      console.error("Error creating attendance warning notification:", error);
      throw error;
    }
  }

  /**
   * Create a grade update notification
   */
  static async notifyGradeUpdate(params: {
    studentId: number;
    courseName: string;
    courseCode: string;
    gradeName: string;
    score: number;
  }) {
    try {
      const { studentId, courseName, courseCode, gradeName, score } = params;

      const notification = await Notification.create({
        user_id: studentId,
        user_role: "student",
        type: "grade_update",
        title: "📝 New Grade Posted",
        message: `Your grade for ${gradeName} in ${courseCode} - ${courseName} has been posted: ${score}`,
        related_data: {
          course_name: courseName,
          course_code: courseCode,
          grade_name: gradeName,
          score: score,
        },
        priority: "normal",
        is_read: false,
      });

      console.log(`📢 Grade notification sent to student ${studentId}`);
      return notification;
    } catch (error) {
      console.error("Error creating grade notification:", error);
      throw error;
    }
  }

  /**
   * Create a general announcement notification
   */
  static async notifyAnnouncement(params: {
    userIds: number[];
    userRole: string;
    title: string;
    message: string;
    priority?: string;
    relatedData?: any;
  }) {
    try {
      const {
        userIds,
        userRole,
        title,
        message,
        priority = "normal",
        relatedData,
      } = params;

      const notifications = await Promise.all(
        userIds.map((userId) =>
          Notification.create({
            user_id: userId,
            user_role: userRole,
            type: "announcement",
            title: `📢 ${title}`,
            message: message,
            related_data: relatedData,
            priority: priority,
            is_read: false,
          })
        )
      );

      console.log(`📢 Announcement sent to ${userIds.length} users`);
      return notifications;
    } catch (error) {
      console.error("Error creating announcement notifications:", error);
      throw error;
    }
  }

  /**
   * Get unread notifications for a user
   */
  static async getUnreadNotifications(userId: number) {
    try {
      const notifications = await Notification.findAll({
        where: {
          user_id: userId,
          is_read: false,
        },
        order: [["created_at", "DESC"]],
        limit: 50,
      });

      return notifications;
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user (with pagination)
   */
  static async getAllNotifications(userId: number, limit = 50, offset = 0) {
    try {
      const { count, rows: notifications } = await Notification.findAndCountAll(
        {
          where: { user_id: userId },
          order: [["created_at", "DESC"]],
          limit,
          offset,
        }
      );

      return { total: count, notifications };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number, userId: number) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, user_id: userId },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.update({
        is_read: true,
        read_at: new Date(),
      });

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number) {
    try {
      const updated = await Notification.update(
        {
          is_read: true,
          read_at: new Date(),
        },
        {
          where: {
            user_id: userId,
            is_read: false,
          },
        }
      );

      return updated[0]; // Returns count of updated rows
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: number, userId: number) {
    try {
      const deleted = await Notification.destroy({
        where: {
          id: notificationId,
          user_id: userId,
        },
      });

      return deleted > 0;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Delete all read notifications for a user
   */
  static async clearReadNotifications(userId: number) {
    try {
      const deleted = await Notification.destroy({
        where: {
          user_id: userId,
          is_read: true,
        },
      });

      return deleted;
    } catch (error) {
      console.error("Error clearing read notifications:", error);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: number) {
    try {
      const count = await Notification.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      });

      return count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }
}

export default NotificationService;
