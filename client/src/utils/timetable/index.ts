/**
 * Integrated Timetable Generator
 * Combines Constraint Solving and Genetic Algorithm
 */

import {
  TimetableConstraintSolver,
  TimeSlot,
  CourseSession,
  Room,
  Assignment,
  Constraints,
} from "./constraintSolver";
import { GeneticTimetableOptimizer } from "./geneticAlgorithm";
import { EnhancedGeneticAlgorithm } from "./enhancedGeneticAlgorithm";

export interface TimetableGenerationConfig {
  approach: "constraint" | "genetic" | "hybrid";
  maxIterations?: number;
  populationSize?: number;
  generations?: number;
  mutationRate?: number;
  crossoverRate?: number;
}

export interface TimetableResult {
  success: boolean;
  assignments: Assignment[];
  statistics: {
    totalAssignments: number;
    fitnessScore: number;
    lunchViolations: number;
    backToBackLabs: number;
    afternoonTheory: number;
    workloadImbalance: number;
    totalGaps: number;
    teacherUtilization: { [key: number]: number };
    roomUtilization: { [key: number]: number };
  };
  approach: string;
  executionTime: number;
}

export class IntegratedTimetableGenerator {
  private timeSlots: TimeSlot[];
  private courseSessions: CourseSession[];
  private rooms: Room[];
  private constraints: Constraints;

  constructor(
    timeSlots: TimeSlot[],
    courseSessions: CourseSession[],
    rooms: Room[],
    constraints: Constraints
  ) {
    this.timeSlots = timeSlots;
    this.courseSessions = courseSessions;
    this.rooms = rooms;
    this.constraints = constraints;
  }

  /**
   * Main generation method
   */
  public async generate(
    config: TimetableGenerationConfig
  ): Promise<TimetableResult> {
    console.log(
      `🚀 Starting timetable generation with ${config.approach} approach...`
    );
    const startTime = Date.now();

    let result: TimetableResult | null = null;

    switch (config.approach) {
      case "constraint":
        result = await this.generateWithConstraintSolver(config);
        break;

      case "genetic":
        result = await this.generateWithGeneticAlgorithm(config);
        break;

      case "hybrid":
        result = await this.generateHybrid(config);
        break;

      default:
        throw new Error(`Unknown approach: ${config.approach}`);
    }

    if (result) {
      result.executionTime = Date.now() - startTime;
      console.log(`✓ Generation completed in ${result.executionTime}ms`);
    }

    return result || this.getEmptyResult();
  }

  /**
   * Approach 1: Constraint-Based Solver
   * Uses backtracking with forward checking
   * Best for: Smaller datasets, guaranteed valid solutions
   */
  private async generateWithConstraintSolver(
    config: TimetableGenerationConfig
  ): Promise<TimetableResult> {
    const solver = new TimetableConstraintSolver(
      this.timeSlots,
      this.courseSessions,
      this.rooms,
      this.constraints,
      config.maxIterations || 10000
    );

    const assignments = solver.solve();

    if (!assignments) {
      return {
        success: false,
        assignments: [],
        statistics: this.getEmptyStatistics(),
        approach: "constraint",
        executionTime: 0,
      };
    }

    const stats = solver.getSolutionStats(assignments);

    return {
      success: true,
      assignments,
      statistics: {
        totalAssignments: stats.totalAssignments,
        fitnessScore: stats.fitnessScore,
        lunchViolations: stats.lunchViolations,
        backToBackLabs: stats.backToBackLabs,
        afternoonTheory: stats.afternoonTheory,
        workloadImbalance: stats.workloadImbalance,
        totalGaps: stats.totalGaps,
        teacherUtilization: this.mapToObject(stats.teacherUtilization),
        roomUtilization: this.mapToObject(stats.roomUtilization),
      },
      approach: "constraint",
      executionTime: 0,
    };
  }

  /**
   * Approach 2: Enhanced Genetic Algorithm with Repair
   * Uses evolutionary computation with automatic repair mechanisms
   * Best for: Larger datasets, optimization-focused
   * SOLVES: Validity issue - repairs invalid solutions automatically
   * SOLVES: Completeness issue - ensures valid solutions are found
   */
  private async generateWithGeneticAlgorithm(
    config: TimetableGenerationConfig
  ): Promise<TimetableResult> {
    const optimizer = new EnhancedGeneticAlgorithm(
      this.timeSlots,
      this.courseSessions,
      this.rooms,
      this.constraints,
      {
        populationSize: config.populationSize || 100,
        generations: config.generations || 500,
        mutationRate: config.mutationRate || 0.1,
        crossoverRate: config.crossoverRate || 0.8,
        repairProbability: 0.7, // 70% chance to repair invalid solutions
      }
    );

    const chromosome = optimizer.optimize();

    if (!chromosome) {
      return {
        success: false,
        assignments: [],
        statistics: this.getEmptyStatistics(),
        approach: "genetic",
        executionTime: 0,
      };
    }

    const solver = new TimetableConstraintSolver(
      this.timeSlots,
      this.courseSessions,
      this.rooms,
      this.constraints
    );

    const stats = solver.getSolutionStats(chromosome.assignments);

    return {
      success: true,
      assignments: chromosome.assignments,
      statistics: {
        totalAssignments: stats.totalAssignments,
        fitnessScore: stats.fitnessScore,
        lunchViolations: stats.lunchViolations,
        backToBackLabs: stats.backToBackLabs,
        afternoonTheory: stats.afternoonTheory,
        workloadImbalance: stats.workloadImbalance,
        totalGaps: stats.totalGaps,
        teacherUtilization: this.mapToObject(stats.teacherUtilization),
        roomUtilization: this.mapToObject(stats.roomUtilization),
      },
      approach: "genetic",
      executionTime: 0,
    };
  }

  /**
   * Approach 3: Hybrid (Constraint + Genetic)
   * First tries constraint solver, then optimizes with GA
   * Best for: Best quality solutions
   */
  private async generateHybrid(
    config: TimetableGenerationConfig
  ): Promise<TimetableResult> {
    console.log(
      "Step 1: Generating initial solution with constraint solver..."
    );

    // Step 1: Get initial valid solution using constraint solver
    const constraintResult = await this.generateWithConstraintSolver({
      ...config,
      maxIterations: 5000, // Limit iterations for speed
    });

    if (!constraintResult.success) {
      console.log("Step 1 failed. Falling back to genetic algorithm only...");
      return this.generateWithGeneticAlgorithm(config);
    }

    console.log("Step 2: Optimizing solution with genetic algorithm...");

    // Step 2: Optimize using genetic algorithm
    const geneticResult = await this.generateWithGeneticAlgorithm({
      ...config,
      generations: config.generations || 300, // Fewer generations since we start with good solution
    });

    // Compare and return better solution
    if (
      geneticResult.success &&
      geneticResult.statistics.fitnessScore <
        constraintResult.statistics.fitnessScore
    ) {
      console.log("✓ Genetic optimization improved solution");
      return {
        ...geneticResult,
        approach: "hybrid",
      };
    }

    console.log("✓ Constraint solution was already optimal");
    return {
      ...constraintResult,
      approach: "hybrid",
    };
  }

  /**
   * Utility: Convert Map to plain object
   */
  private mapToObject(map: Map<number, number>): { [key: number]: number } {
    const obj: { [key: number]: number } = {};
    for (const [key, value] of Array.from(map.entries())) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Utility: Get empty statistics
   */
  private getEmptyStatistics() {
    return {
      totalAssignments: 0,
      fitnessScore: 0,
      lunchViolations: 0,
      backToBackLabs: 0,
      afternoonTheory: 0,
      workloadImbalance: 0,
      totalGaps: 0,
      teacherUtilization: {},
      roomUtilization: {},
    };
  }

  /**
   * Utility: Get empty result
   */
  private getEmptyResult(): TimetableResult {
    return {
      success: false,
      assignments: [],
      statistics: this.getEmptyStatistics(),
      approach: "none",
      executionTime: 0,
    };
  }

  /**
   * Generate multiple solutions and return best
   */
  public async generateMultipleSolutions(
    count: number,
    config: TimetableGenerationConfig
  ): Promise<TimetableResult[]> {
    console.log(`🔄 Generating ${count} solutions...`);

    const results: TimetableResult[] = [];

    for (let i = 0; i < count; i++) {
      console.log(`\nAttempt ${i + 1}/${count}`);
      const result = await this.generate(config);
      if (result.success) {
        results.push(result);
      }
    }

    // Sort by fitness (lower is better)
    results.sort(
      (a, b) => a.statistics.fitnessScore - b.statistics.fitnessScore
    );

    console.log(`\n✓ Generated ${results.length} valid solutions`);
    return results;
  }

  /**
   * Validate a timetable solution
   */
  public validateSolution(assignments: Assignment[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check teacher conflicts
    const teacherMap = new Map<string, Assignment[]>();
    for (const assignment of assignments) {
      const key = `${assignment.teacherId}-${assignment.timeSlotId}`;
      if (!teacherMap.has(key)) {
        teacherMap.set(key, []);
      }
      teacherMap.get(key)!.push(assignment);
    }

    for (const [key, assignments] of Array.from(teacherMap.entries())) {
      if (assignments.length > 1) {
        errors.push(
          `Teacher ${assignments[0].teacherName} has ${assignments.length} classes at the same time (${assignments[0].startTime})`
        );
      }
    }

    // Check room conflicts
    const roomMap = new Map<string, Assignment[]>();
    for (const assignment of assignments) {
      const key = `${assignment.roomId}-${assignment.timeSlotId}`;
      if (!roomMap.has(key)) {
        roomMap.set(key, []);
      }
      roomMap.get(key)!.push(assignment);
    }

    for (const [key, assignments] of Array.from(roomMap.entries())) {
      if (assignments.length > 1) {
        errors.push(
          `Room ${assignments[0].roomName} has ${assignments.length} classes at the same time (${assignments[0].startTime})`
        );
      }
    }

    // Check student conflicts
    const studentMap = new Map<string, Assignment[]>();
    for (const assignment of assignments) {
      const key = `${assignment.semester}-${assignment.section}-${assignment.timeSlotId}`;
      if (!studentMap.has(key)) {
        studentMap.set(key, []);
      }
      studentMap.get(key)!.push(assignment);
    }

    for (const [key, assignments] of Array.from(studentMap.entries())) {
      if (assignments.length > 1) {
        errors.push(
          `Semester ${assignments[0].semester} Section ${assignments[0].section} has ${assignments.length} classes at the same time (${assignments[0].startTime})`
        );
      }
    }

    // Check lunch break violations
    if (
      this.constraints.soft.lunchBreakMandatory &&
      this.constraints.lunchBreak
    ) {
      const lunchViolations = assignments.filter((a) =>
        this.isLunchTime(a.startTime, a.endTime)
      );

      if (lunchViolations.length > 0) {
        warnings.push(
          `${lunchViolations.length} classes scheduled during lunch break`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if time overlaps with lunch
   */
  private isLunchTime(startTime: string, endTime: string): boolean {
    if (!this.constraints.lunchBreak) return false;

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const [lunchStartH, lunchStartM] = this.constraints.lunchBreak.startTime
      .split(":")
      .map(Number);
    const [lunchEndH, lunchEndM] = this.constraints.lunchBreak.endTime
      .split(":")
      .map(Number);

    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    const lunchStart = lunchStartH * 60 + lunchStartM;
    const lunchEnd = lunchEndH * 60 + lunchEndM;

    return start < lunchEnd && end > lunchStart;
  }
}

/**
 * Export utility functions and types
 */
export type { TimeSlot, CourseSession, Room, Assignment, Constraints };
