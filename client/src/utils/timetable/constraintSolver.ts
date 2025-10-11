/**
 * Constraint-Based Timetable Solver
 * Uses Backtracking with Forward Checking and Constraint Propagation
 */

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  slotIndex: number;
}

export interface CourseSession {
  courseId: number;
  courseName: string;
  courseCode: string;
  teacherId: number;
  teacherName: string;
  sessionType: "theory" | "lab" | "tutorial";
  sessionsPerWeek: number;
  duration: number; // in minutes
  semester: number;
  section: string;
  roomPreference?: string;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  type: "theory" | "lab" | "both";
}

export interface Assignment {
  courseId: number;
  courseName: string;
  courseCode: string;
  teacherId: number;
  teacherName: string;
  roomId: number;
  roomName: string;
  timeSlotId: string;
  day: string;
  startTime: string;
  endTime: string;
  sessionType: "theory" | "lab" | "tutorial";
  semester: number;
  section: string;
}

export interface Constraints {
  hard: {
    noTeacherConflict: boolean;
    noRoomConflict: boolean;
    noStudentConflict: boolean;
    respectSessionRequirements: boolean;
    maxTeacherHoursPerDay: number;
  };
  soft: {
    lunchBreakMandatory: boolean;
    avoidBackToBackLabs: boolean;
    morningTheoryPreference: boolean;
    teacherWorkloadBalance: boolean;
    minimizeGaps: boolean;
  };
  weights: {
    lunchBreak: number;
    backToBackLabs: number;
    morningTheory: number;
    workloadBalance: number;
    gaps: number;
  };
  lunchBreak?: {
    startTime: string;
    endTime: string;
  };
}

export class TimetableConstraintSolver {
  private timeSlots: TimeSlot[];
  private courseSessions: CourseSession[];
  private rooms: Room[];
  private constraints: Constraints;
  private assignments: Assignment[] = [];
  private maxIterations: number;

  constructor(
    timeSlots: TimeSlot[],
    courseSessions: CourseSession[],
    rooms: Room[],
    constraints: Constraints,
    maxIterations: number = 10000
  ) {
    this.timeSlots = timeSlots;
    this.courseSessions = courseSessions;
    this.rooms = rooms;
    this.constraints = constraints;
    this.maxIterations = maxIterations;
  }

  /**
   * Main solving method using Backtracking with Forward Checking
   */
  public solve(): Assignment[] | null {
    this.assignments = [];

    // Expand course sessions to individual instances
    const sessionsToSchedule = this.expandCourseSessions();

    // Sort by Most Constrained Variable (MCV) heuristic
    const sortedSessions = this.sortByConstraintComplexity(sessionsToSchedule);

    console.log(`Starting to schedule ${sortedSessions.length} sessions...`);

    // Start backtracking
    if (this.backtrack(sortedSessions, 0, 0)) {
      console.log(
        `✓ Solution found with ${this.assignments.length} assignments`
      );
      return this.assignments;
    }

    console.log("✗ No solution found within iteration limit");
    return null;
  }

  /**
   * Expand course sessions into individual instances
   * e.g., 3 sessions per week → 3 separate sessions to schedule
   */
  private expandCourseSessions(): CourseSession[] {
    const expanded: CourseSession[] = [];

    for (const session of this.courseSessions) {
      for (let i = 0; i < session.sessionsPerWeek; i++) {
        expanded.push({ ...session });
      }
    }

    return expanded;
  }

  /**
   * Backtracking algorithm with constraint propagation
   */
  private backtrack(
    sessions: CourseSession[],
    sessionIndex: number,
    iterations: number
  ): boolean {
    // Check iteration limit
    if (iterations > this.maxIterations) {
      return false;
    }

    // Base case: all sessions assigned
    if (sessionIndex === sessions.length) {
      return true;
    }

    const session = sessions[sessionIndex];

    // Get valid time slots for this session (Domain Filtering)
    const validTimeSlots = this.getValidTimeSlots(session);

    // Try each time slot
    for (const timeSlot of validTimeSlots) {
      // Get valid rooms for this session
      const validRooms = this.getValidRooms(session);

      // Try each room
      for (const room of validRooms) {
        const assignment: Assignment = {
          courseId: session.courseId,
          courseName: session.courseName,
          courseCode: session.courseCode,
          teacherId: session.teacherId,
          teacherName: session.teacherName,
          roomId: room.id,
          roomName: room.name,
          timeSlotId: timeSlot.id,
          day: timeSlot.day,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          sessionType: session.sessionType,
          semester: session.semester,
          section: session.section,
        };

        // Forward Checking: Check if assignment is valid
        if (this.isValidAssignment(assignment)) {
          // Make assignment
          this.assignments.push(assignment);

          // Recurse
          if (this.backtrack(sessions, sessionIndex + 1, iterations + 1)) {
            return true; // Solution found
          }

          // Backtrack: remove assignment
          this.assignments.pop();
        }
      }
    }

    return false; // No valid assignment found
  }

  /**
   * Check if an assignment violates any HARD constraints
   * Mathematical constraint checking
   */
  private isValidAssignment(assignment: Assignment): boolean {
    // Hard Constraint 1: No teacher conflict
    // ∀ a1, a2 ∈ Assignments: (a1.teacher = a2.teacher ∧ a1.time = a2.time) → false
    if (this.constraints.hard.noTeacherConflict) {
      const teacherConflict = this.assignments.some(
        (a) =>
          a.teacherId === assignment.teacherId &&
          a.timeSlotId === assignment.timeSlotId
      );
      if (teacherConflict) return false;
    }

    // Hard Constraint 2: No room conflict
    // ∀ a1, a2 ∈ Assignments: (a1.room = a2.room ∧ a1.time = a2.time) → false
    if (this.constraints.hard.noRoomConflict) {
      const roomConflict = this.assignments.some(
        (a) =>
          a.roomId === assignment.roomId &&
          a.timeSlotId === assignment.timeSlotId
      );
      if (roomConflict) return false;
    }

    // Hard Constraint 3: No student conflict (same semester/section)
    // ∀ a1, a2 ∈ Assignments: (a1.semester = a2.semester ∧ a1.section = a2.section ∧ a1.time = a2.time) → false
    if (this.constraints.hard.noStudentConflict) {
      const studentConflict = this.assignments.some(
        (a) =>
          a.semester === assignment.semester &&
          a.section === assignment.section &&
          a.timeSlotId === assignment.timeSlotId
      );
      if (studentConflict) return false;
    }

    // Hard Constraint 4: Room type matches session type
    // sessionType = 'lab' → roomType ∈ {'lab', 'both'}
    if (this.constraints.hard.respectSessionRequirements) {
      const room = this.rooms.find((r) => r.id === assignment.roomId);
      if (assignment.sessionType === "lab" && room?.type === "theory") {
        return false;
      }
    }

    // Hard Constraint 5: Max teacher hours per day
    // Count(assignments for teacher on same day) ≤ maxTeacherHoursPerDay
    if (this.constraints.hard.maxTeacherHoursPerDay > 0) {
      const teacherDayHours = this.assignments.filter(
        (a) => a.teacherId === assignment.teacherId && a.day === assignment.day
      ).length;

      if (teacherDayHours >= this.constraints.hard.maxTeacherHoursPerDay) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get valid time slots for a session (Domain Filtering)
   */
  private getValidTimeSlots(session: CourseSession): TimeSlot[] {
    let validSlots = [...this.timeSlots];

    // Filter out lunch break if mandatory
    if (
      this.constraints.soft.lunchBreakMandatory &&
      this.constraints.lunchBreak
    ) {
      validSlots = validSlots.filter(
        (slot) => !this.isLunchTime(slot.startTime, slot.endTime)
      );
    }

    return validSlots;
  }

  /**
   * Get valid rooms for a session
   */
  private getValidRooms(session: CourseSession): Room[] {
    return this.rooms.filter((room) => {
      // Lab sessions need lab rooms
      if (session.sessionType === "lab") {
        return room.type === "lab" || room.type === "both";
      }
      // Theory can use any room
      return true;
    });
  }

  /**
   * Sort sessions by Most Constrained Variable (MCV) heuristic
   * Labs > Tutorials > Theory (labs are harder to schedule)
   */
  private sortByConstraintComplexity(
    sessions: CourseSession[]
  ): CourseSession[] {
    return sessions.sort((a, b) => {
      // Priority 1: Session type (labs are most constrained)
      const typeOrder = { lab: 3, tutorial: 2, theory: 1 };
      const typeDiff = typeOrder[b.sessionType] - typeOrder[a.sessionType];
      if (typeDiff !== 0) return typeDiff;

      // Priority 2: More sessions per week = more constrained
      const sessionDiff = b.sessionsPerWeek - a.sessionsPerWeek;
      if (sessionDiff !== 0) return sessionDiff;

      // Priority 3: Alphabetical
      return a.courseName.localeCompare(b.courseName);
    });
  }

  /**
   * Check if time overlaps with lunch break
   */
  private isLunchTime(startTime: string, endTime: string): boolean {
    if (!this.constraints.lunchBreak) return false;

    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const lunchStart = this.timeToMinutes(
      this.constraints.lunchBreak.startTime
    );
    const lunchEnd = this.timeToMinutes(this.constraints.lunchBreak.endTime);

    // Check overlap: (start < lunchEnd) && (end > lunchStart)
    return start < lunchEnd && end > lunchStart;
  }

  /**
   * Convert time string to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Calculate fitness score for solution quality
   * Lower score = better solution
   *
   * Fitness Function: F = Σ(wi × pi)
   * where wi = weight, pi = penalty count
   */
  public calculateFitness(assignments: Assignment[]): number {
    let totalPenalty = 0;

    // Soft Constraint 1: Lunch break violations
    if (this.constraints.soft.lunchBreakMandatory) {
      const lunchViolations = this.countLunchBreakViolations(assignments);
      totalPenalty += lunchViolations * this.constraints.weights.lunchBreak;
    }

    // Soft Constraint 2: Back-to-back labs
    if (this.constraints.soft.avoidBackToBackLabs) {
      const backToBackCount = this.countBackToBackLabs(assignments);
      totalPenalty += backToBackCount * this.constraints.weights.backToBackLabs;
    }

    // Soft Constraint 3: Morning theory preference
    if (this.constraints.soft.morningTheoryPreference) {
      const afternoonTheory = this.countAfternoonTheoryClasses(assignments);
      totalPenalty += afternoonTheory * this.constraints.weights.morningTheory;
    }

    // Soft Constraint 4: Teacher workload balance
    if (this.constraints.soft.teacherWorkloadBalance) {
      const imbalance = this.calculateWorkloadImbalance(assignments);
      totalPenalty += imbalance * this.constraints.weights.workloadBalance;
    }

    // Soft Constraint 5: Minimize student gaps
    if (this.constraints.soft.minimizeGaps) {
      const totalGaps = this.calculateStudentGaps(assignments);
      totalPenalty += totalGaps * this.constraints.weights.gaps;
    }

    return totalPenalty;
  }

  /**
   * Mathematical: Count lunch break violations
   * Violation = |{a ∈ Assignments : a.time ∩ lunchTime ≠ ∅}|
   */
  private countLunchBreakViolations(assignments: Assignment[]): number {
    if (!this.constraints.lunchBreak) return 0;

    return assignments.filter((a) => this.isLunchTime(a.startTime, a.endTime))
      .length;
  }

  /**
   * Mathematical: Count back-to-back lab sessions
   * Count pairs (a1, a2) where both are labs and |slotIndex1 - slotIndex2| = 1
   */
  private countBackToBackLabs(assignments: Assignment[]): number {
    let count = 0;
    const labAssignments = assignments.filter((a) => a.sessionType === "lab");

    for (let i = 0; i < labAssignments.length; i++) {
      for (let j = i + 1; j < labAssignments.length; j++) {
        const slot1 = this.timeSlots.find(
          (s) => s.id === labAssignments[i].timeSlotId
        );
        const slot2 = this.timeSlots.find(
          (s) => s.id === labAssignments[j].timeSlotId
        );

        // Same teacher, same day, consecutive slots
        if (
          slot1 &&
          slot2 &&
          labAssignments[i].teacherId === labAssignments[j].teacherId &&
          slot1.day === slot2.day &&
          Math.abs(slot1.slotIndex - slot2.slotIndex) === 1
        ) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Mathematical: Count afternoon theory classes
   * Afternoon = time ≥ 14:00 (2 PM)
   */
  private countAfternoonTheoryClasses(assignments: Assignment[]): number {
    return assignments.filter((a) => {
      if (a.sessionType !== "theory") return false;
      const startMinutes = this.timeToMinutes(a.startTime);
      return startMinutes >= 14 * 60; // After 2 PM
    }).length;
  }

  /**
   * Mathematical: Calculate teacher workload imbalance using Standard Deviation
   *
   * Standard Deviation: σ = √(Σ(xi - μ)² / N)
   * where xi = teacher hours, μ = mean hours, N = number of teachers
   */
  private calculateWorkloadImbalance(assignments: Assignment[]): number {
    const teacherHours = new Map<number, number>();

    // Count hours per teacher
    for (const assignment of assignments) {
      const current = teacherHours.get(assignment.teacherId) || 0;
      teacherHours.set(assignment.teacherId, current + 1);
    }

    const hoursArray = Array.from(teacherHours.values());
    if (hoursArray.length === 0) return 0;

    // Calculate mean (μ)
    const mean = hoursArray.reduce((sum, h) => sum + h, 0) / hoursArray.length;

    // Calculate variance (σ²)
    const variance =
      hoursArray.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) /
      hoursArray.length;

    // Return standard deviation (σ)
    return Math.sqrt(variance);
  }

  /**
   * Mathematical: Calculate total gaps in student schedules
   *
   * Gap = empty time slots between consecutive classes
   * Total Gaps = Σ(gaps per section per day)
   */
  private calculateStudentGaps(assignments: Assignment[]): number {
    let totalGaps = 0;

    // Group by semester + section
    const groups = this.groupBySemesterSection(assignments);

    for (const [key, groupAssignments] of groups) {
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

      for (const day of days) {
        // Get all slots for this day, sorted by time
        const daySlots = groupAssignments
          .filter((a) => a.day === day)
          .map((a) => this.timeSlots.find((s) => s.id === a.timeSlotId))
          .filter((s): s is TimeSlot => s !== undefined)
          .sort((a, b) => a.slotIndex - b.slotIndex);

        // Count gaps between consecutive classes
        for (let i = 0; i < daySlots.length - 1; i++) {
          const gap = daySlots[i + 1].slotIndex - daySlots[i].slotIndex - 1;
          totalGaps += Math.max(0, gap);
        }
      }
    }

    return totalGaps;
  }

  /**
   * Group assignments by semester and section
   */
  private groupBySemesterSection(
    assignments: Assignment[]
  ): Map<string, Assignment[]> {
    const groups = new Map<string, Assignment[]>();

    for (const assignment of assignments) {
      const key = `${assignment.semester}-${assignment.section}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(assignment);
    }

    return groups;
  }

  /**
   * Get solution statistics
   */
  public getSolutionStats(assignments: Assignment[]): {
    totalAssignments: number;
    fitnessScore: number;
    teacherUtilization: Map<number, number>;
    roomUtilization: Map<number, number>;
    lunchViolations: number;
    backToBackLabs: number;
    afternoonTheory: number;
    workloadImbalance: number;
    totalGaps: number;
  } {
    const teacherUtilization = new Map<number, number>();
    const roomUtilization = new Map<number, number>();

    for (const assignment of assignments) {
      // Teacher utilization
      const teacherCount = teacherUtilization.get(assignment.teacherId) || 0;
      teacherUtilization.set(assignment.teacherId, teacherCount + 1);

      // Room utilization
      const roomCount = roomUtilization.get(assignment.roomId) || 0;
      roomUtilization.set(assignment.roomId, roomCount + 1);
    }

    return {
      totalAssignments: assignments.length,
      fitnessScore: this.calculateFitness(assignments),
      teacherUtilization,
      roomUtilization,
      lunchViolations: this.countLunchBreakViolations(assignments),
      backToBackLabs: this.countBackToBackLabs(assignments),
      afternoonTheory: this.countAfternoonTheoryClasses(assignments),
      workloadImbalance: this.calculateWorkloadImbalance(assignments),
      totalGaps: this.calculateStudentGaps(assignments),
    };
  }
}
