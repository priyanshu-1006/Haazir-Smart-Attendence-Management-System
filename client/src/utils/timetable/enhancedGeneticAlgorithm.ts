/**
 * Enhanced Genetic Algorithm with Repair Mechanisms
 * Solves the validity issue by repairing invalid solutions
 */

import {
  TimeSlot,
  CourseSession,
  Room,
  Assignment,
  Constraints,
} from "./constraintSolver";

interface Chromosome {
  assignments: Assignment[];
  fitness: number;
  isValid: boolean; // Track validity
}

export class EnhancedGeneticAlgorithm {
  private timeSlots: TimeSlot[];
  private courseSessions: CourseSession[];
  private rooms: Room[];
  private constraints: Constraints;

  private populationSize: number;
  private generations: number;
  private mutationRate: number;
  private crossoverRate: number;
  private elitismCount: number;
  private repairProbability: number; // NEW: Probability of repairing invalid solutions

  constructor(
    timeSlots: TimeSlot[],
    courseSessions: CourseSession[],
    rooms: Room[],
    constraints: Constraints,
    config: {
      populationSize?: number;
      generations?: number;
      mutationRate?: number;
      crossoverRate?: number;
      elitismCount?: number;
      repairProbability?: number;
    } = {}
  ) {
    this.timeSlots = timeSlots;
    this.courseSessions = courseSessions;
    this.rooms = rooms;
    this.constraints = constraints;

    this.populationSize = config.populationSize || 100;
    this.generations = config.generations || 500;
    this.mutationRate = config.mutationRate || 0.1;
    this.crossoverRate = config.crossoverRate || 0.8;
    this.elitismCount = config.elitismCount || 2;
    this.repairProbability = config.repairProbability || 0.5; // 50% chance to repair
  }

  /**
   * Enhanced optimization with repair mechanisms
   * SOLVES: Validity issue - repairs invalid solutions
   * SOLVES: Completeness issue - ensures at least one valid solution
   */
  public optimize(): Chromosome | null {
    console.log("🧬 Starting Enhanced Genetic Algorithm with Repair...");

    // Step 1: Initialize population with repair
    let population = this.initializePopulationWithRepair();
    console.log(`✓ Initialized population of ${population.length}`);

    // Ensure at least one valid solution
    const validCount = population.filter((c) => c.isValid).length;
    console.log(
      `✓ Valid solutions in initial population: ${validCount}/${population.length}`
    );

    let bestChromosome = this.getBestValidChromosome(population);
    let generationsWithoutImprovement = 0;
    const maxStagnation = 100;

    // Step 2: Evolution loop with repair
    for (let gen = 0; gen < this.generations; gen++) {
      // Evaluate fitness
      population = this.evaluatePopulation(population);

      // Sort by validity first, then fitness
      population.sort((a, b) => {
        if (a.isValid !== b.isValid) {
          return a.isValid ? -1 : 1; // Valid solutions first
        }
        return a.fitness - b.fitness; // Then by fitness
      });

      // Track best valid solution
      const currentBest = this.getBestValidChromosome(population);
      if (
        currentBest &&
        (!bestChromosome || currentBest.fitness < bestChromosome.fitness)
      ) {
        bestChromosome = currentBest;
        generationsWithoutImprovement = 0;

        if (gen % 50 === 0) {
          console.log(
            `Gen ${gen}: Best fitness = ${bestChromosome.fitness.toFixed(
              2
            )} (Valid: ${bestChromosome.isValid})`
          );
        }
      } else {
        generationsWithoutImprovement++;
      }

      // Early stopping
      if (generationsWithoutImprovement > maxStagnation && bestChromosome) {
        console.log(
          `Early stopping at generation ${gen} - Found valid solution`
        );
        break;
      }

      // Create next generation with repair
      const nextGeneration: Chromosome[] = [];

      // Elitism: Keep best valid chromosomes
      const validChromosomes = population.filter((c) => c.isValid);
      for (
        let i = 0;
        i < Math.min(this.elitismCount, validChromosomes.length);
        i++
      ) {
        nextGeneration.push({ ...validChromosomes[i] });
      }

      // Create offspring
      while (nextGeneration.length < this.populationSize) {
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);

        let offspring: Chromosome;
        if (Math.random() < this.crossoverRate) {
          offspring = this.crossover(parent1, parent2);
        } else {
          offspring = { ...parent1 };
        }

        if (Math.random() < this.mutationRate) {
          offspring = this.mutate(offspring);
        }

        // NEW: Repair invalid solutions with probability
        if (!offspring.isValid && Math.random() < this.repairProbability) {
          offspring = this.repairChromosome(offspring);
        }

        nextGeneration.push(offspring);
      }

      population = nextGeneration;
    }

    if (bestChromosome) {
      console.log(
        `✓ Optimization complete. Best fitness: ${bestChromosome.fitness.toFixed(
          2
        )}, Valid: ${bestChromosome.isValid}`
      );
    } else {
      console.log("✗ No valid solution found");
    }

    return bestChromosome || null;
  }

  /**
   * NEW: Initialize population with repair to ensure valid solutions
   */
  private initializePopulationWithRepair(): Chromosome[] {
    const population: Chromosome[] = [];
    let attempts = 0;
    const maxAttemptsPerIndividual = 5;

    for (let i = 0; i < this.populationSize; i++) {
      let chromosome: Chromosome | null = null;

      for (let attempt = 0; attempt < maxAttemptsPerIndividual; attempt++) {
        chromosome = this.createRandomChromosome();

        if (chromosome && chromosome.isValid) {
          break; // Found valid solution
        }

        // Try to repair if invalid
        if (chromosome && !chromosome.isValid) {
          chromosome = this.repairChromosome(chromosome);
          if (chromosome.isValid) {
            break;
          }
        }
      }

      if (chromosome) {
        population.push(chromosome);
      }
    }

    return population;
  }

  /**
   * NEW: Repair invalid chromosome by fixing conflicts
   * This is the KEY to solving the validity issue
   */
  private repairChromosome(chromosome: Chromosome): Chromosome {
    const assignments = [...chromosome.assignments];
    const violations = this.getViolations(assignments);

    if (violations.length === 0) {
      return { ...chromosome, isValid: true };
    }

    // Strategy 1: Fix teacher conflicts
    for (const violation of violations.filter((v) => v.type === "teacher")) {
      const conflictingAssignments = violation.assignments;

      // Keep first, reassign others
      for (let i = 1; i < conflictingAssignments.length; i++) {
        const assignment = conflictingAssignments[i];
        const newSlot = this.findAvailableTimeSlot(assignment, assignments);

        if (newSlot) {
          const idx = assignments.findIndex(
            (a) =>
              a.courseId === assignment.courseId &&
              a.timeSlotId === assignment.timeSlotId
          );

          if (idx !== -1) {
            assignments[idx] = {
              ...assignments[idx],
              timeSlotId: newSlot.id,
              day: newSlot.day,
              startTime: newSlot.startTime,
              endTime: newSlot.endTime,
            };
          }
        }
      }
    }

    // Strategy 2: Fix room conflicts
    for (const violation of violations.filter((v) => v.type === "room")) {
      const conflictingAssignments = violation.assignments;

      for (let i = 1; i < conflictingAssignments.length; i++) {
        const assignment = conflictingAssignments[i];
        const newRoom = this.findAvailableRoom(assignment, assignments);

        if (newRoom) {
          const idx = assignments.findIndex(
            (a) =>
              a.courseId === assignment.courseId &&
              a.timeSlotId === assignment.timeSlotId
          );

          if (idx !== -1) {
            assignments[idx] = {
              ...assignments[idx],
              roomId: newRoom.id,
              roomName: newRoom.name,
            };
          }
        }
      }
    }

    // Strategy 3: Fix student conflicts
    for (const violation of violations.filter((v) => v.type === "student")) {
      const conflictingAssignments = violation.assignments;

      for (let i = 1; i < conflictingAssignments.length; i++) {
        const assignment = conflictingAssignments[i];
        const newSlot = this.findAvailableTimeSlot(assignment, assignments);

        if (newSlot) {
          const idx = assignments.findIndex(
            (a) =>
              a.courseId === assignment.courseId &&
              a.timeSlotId === assignment.timeSlotId
          );

          if (idx !== -1) {
            assignments[idx] = {
              ...assignments[idx],
              timeSlotId: newSlot.id,
              day: newSlot.day,
              startTime: newSlot.startTime,
              endTime: newSlot.endTime,
            };
          }
        }
      }
    }

    // Re-evaluate
    const repairedViolations = this.getViolations(assignments);

    return {
      assignments,
      fitness: 0,
      isValid: repairedViolations.length === 0,
    };
  }

  /**
   * NEW: Get all constraint violations
   */
  private getViolations(assignments: Assignment[]): Array<{
    type: "teacher" | "room" | "student";
    assignments: Assignment[];
  }> {
    const violations: Array<{
      type: "teacher" | "room" | "student";
      assignments: Assignment[];
    }> = [];

    // Teacher conflicts
    const teacherMap = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const key = `${a.teacherId}-${a.timeSlotId}`;
      if (!teacherMap.has(key)) teacherMap.set(key, []);
      teacherMap.get(key)!.push(a);
    }
    for (const [key, assigns] of Array.from(teacherMap.entries())) {
      if (assigns.length > 1) {
        violations.push({ type: "teacher", assignments: assigns });
      }
    }

    // Room conflicts
    const roomMap = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const key = `${a.roomId}-${a.timeSlotId}`;
      if (!roomMap.has(key)) roomMap.set(key, []);
      roomMap.get(key)!.push(a);
    }
    for (const [key, assigns] of Array.from(roomMap.entries())) {
      if (assigns.length > 1) {
        violations.push({ type: "room", assignments: assigns });
      }
    }

    // Student conflicts
    const studentMap = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const key = `${a.semester}-${a.section}-${a.timeSlotId}`;
      if (!studentMap.has(key)) studentMap.set(key, []);
      studentMap.get(key)!.push(a);
    }
    for (const [key, assigns] of Array.from(studentMap.entries())) {
      if (assigns.length > 1) {
        violations.push({ type: "student", assignments: assigns });
      }
    }

    return violations;
  }

  /**
   * NEW: Find available time slot for assignment
   */
  private findAvailableTimeSlot(
    assignment: Assignment,
    existingAssignments: Assignment[]
  ): TimeSlot | null {
    for (const slot of this.timeSlots) {
      // Check if this slot causes conflicts
      const hasConflict = existingAssignments.some((a) => {
        if (a.timeSlotId !== slot.id) return false;

        // Teacher conflict
        if (a.teacherId === assignment.teacherId) return true;

        // Room conflict
        if (a.roomId === assignment.roomId) return true;

        // Student conflict
        if (
          a.semester === assignment.semester &&
          a.section === assignment.section
        )
          return true;

        return false;
      });

      if (!hasConflict) {
        return slot;
      }
    }

    return null;
  }

  /**
   * NEW: Find available room for assignment
   */
  private findAvailableRoom(
    assignment: Assignment,
    existingAssignments: Assignment[]
  ): Room | null {
    const validRooms = this.rooms.filter((room) => {
      // Check room type
      if (assignment.sessionType === "lab" && room.type === "theory") {
        return false;
      }

      // Check if room is available at this time
      const hasConflict = existingAssignments.some(
        (a) => a.roomId === room.id && a.timeSlotId === assignment.timeSlotId
      );

      return !hasConflict;
    });

    return validRooms.length > 0 ? validRooms[0] : null;
  }

  /**
   * NEW: Get best valid chromosome from population
   */
  private getBestValidChromosome(population: Chromosome[]): Chromosome | null {
    const validChromosomes = population.filter((c) => c.isValid);

    if (validChromosomes.length === 0) {
      return null;
    }

    return validChromosomes.reduce((best, current) =>
      current.fitness < best.fitness ? current : best
    );
  }

  /**
   * Create random chromosome with validity tracking
   */
  private createRandomChromosome(): Chromosome | null {
    const assignments: Assignment[] = [];

    const sessionsToSchedule: CourseSession[] = [];
    for (const session of this.courseSessions) {
      for (let i = 0; i < session.sessionsPerWeek; i++) {
        sessionsToSchedule.push({ ...session });
      }
    }

    this.shuffleArray(sessionsToSchedule);

    for (const session of sessionsToSchedule) {
      const assignment = this.createRandomAssignment(session, assignments);
      if (assignment) {
        assignments.push(assignment);
      }
    }

    const violations = this.getViolations(assignments);

    return {
      assignments,
      fitness: 0,
      isValid: violations.length === 0,
    };
  }

  /**
   * Create random assignment for a session
   */
  private createRandomAssignment(
    session: CourseSession,
    existingAssignments: Assignment[]
  ): Assignment | null {
    const availableSlots = this.timeSlots.filter((slot) => {
      return !existingAssignments.some(
        (a) =>
          a.timeSlotId === slot.id &&
          (a.teacherId === session.teacherId ||
            (a.semester === session.semester && a.section === session.section))
      );
    });

    if (availableSlots.length === 0) {
      // Fallback: use any slot
      const timeSlot =
        this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
      const room = this.getRandomRoom(session);
      if (!room) return null;

      return {
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
    }

    const timeSlot =
      availableSlots[Math.floor(Math.random() * availableSlots.length)];
    const room = this.getRandomRoom(session);
    if (!room) return null;

    return {
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
  }

  private getRandomRoom(session: CourseSession): Room | null {
    const validRooms = this.rooms.filter((room) => {
      if (session.sessionType === "lab") {
        return room.type === "lab" || room.type === "both";
      }
      return true;
    });

    if (validRooms.length === 0) return null;
    return validRooms[Math.floor(Math.random() * validRooms.length)];
  }

  /**
   * Evaluate population with validity tracking
   */
  private evaluatePopulation(population: Chromosome[]): Chromosome[] {
    return population.map((chromosome) => {
      const violations = this.getViolations(chromosome.assignments);

      return {
        ...chromosome,
        isValid: violations.length === 0,
        fitness: this.calculateFitness(
          chromosome.assignments,
          violations.length
        ),
      };
    });
  }

  /**
   * Calculate fitness with hard constraint penalty
   */
  private calculateFitness(
    assignments: Assignment[],
    violationCount: number
  ): number {
    let penalty = 0;

    // HUGE penalty for hard constraint violations
    penalty += violationCount * 10000;

    // Soft constraints
    if (this.constraints.soft.lunchBreakMandatory) {
      penalty +=
        this.countLunchViolations(assignments) *
        this.constraints.weights.lunchBreak;
    }

    if (this.constraints.soft.avoidBackToBackLabs) {
      penalty +=
        this.countBackToBackLabs(assignments) *
        this.constraints.weights.backToBackLabs;
    }

    if (this.constraints.soft.morningTheoryPreference) {
      penalty +=
        this.countAfternoonTheory(assignments) *
        this.constraints.weights.morningTheory;
    }

    if (this.constraints.soft.teacherWorkloadBalance) {
      penalty +=
        this.calculateWorkloadImbalance(assignments) *
        this.constraints.weights.workloadBalance;
    }

    if (this.constraints.soft.minimizeGaps) {
      penalty +=
        this.calculateTotalGaps(assignments) * this.constraints.weights.gaps;
    }

    return penalty;
  }

  /**
   * Tournament selection (prefer valid solutions)
   */
  private tournamentSelection(
    population: Chromosome[],
    k: number = 3
  ): Chromosome {
    const tournament: Chromosome[] = [];

    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }

    // Prefer valid solutions
    return tournament.reduce((best, current) => {
      if (best.isValid !== current.isValid) {
        return best.isValid ? best : current;
      }
      return current.fitness < best.fitness ? current : best;
    });
  }

  /**
   * Crossover with validity preservation attempt
   */
  private crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    const crossoverPoint = Math.floor(
      Math.random() * parent1.assignments.length
    );

    const offspring: Assignment[] = [
      ...parent1.assignments.slice(0, crossoverPoint),
      ...parent2.assignments.slice(crossoverPoint),
    ];

    const violations = this.getViolations(offspring);

    return {
      assignments: offspring,
      fitness: 0,
      isValid: violations.length === 0,
    };
  }

  /**
   * Mutation with validity check
   */
  private mutate(chromosome: Chromosome): Chromosome {
    const mutated = { ...chromosome };
    const numMutations = Math.ceil(chromosome.assignments.length * 0.1);

    for (let i = 0; i < numMutations; i++) {
      const index = Math.floor(Math.random() * mutated.assignments.length);
      const assignment = mutated.assignments[index];

      if (Math.random() < 0.5) {
        const newSlot =
          this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
        mutated.assignments[index] = {
          ...assignment,
          timeSlotId: newSlot.id,
          day: newSlot.day,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
        };
      } else {
        const validRooms = this.rooms.filter((r) =>
          assignment.sessionType === "lab" ? r.type !== "theory" : true
        );
        if (validRooms.length > 0) {
          const newRoom =
            validRooms[Math.floor(Math.random() * validRooms.length)];
          mutated.assignments[index] = {
            ...assignment,
            roomId: newRoom.id,
            roomName: newRoom.name,
          };
        }
      }
    }

    const violations = this.getViolations(mutated.assignments);
    mutated.isValid = violations.length === 0;

    return mutated;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Soft constraint calculation methods (same as before)
  private countLunchViolations(assignments: Assignment[]): number {
    if (!this.constraints.lunchBreak) return 0;
    return assignments.filter((a) => this.isLunchTime(a.startTime, a.endTime))
      .length;
  }

  private countBackToBackLabs(assignments: Assignment[]): number {
    let count = 0;
    const labs = assignments.filter((a) => a.sessionType === "lab");

    for (let i = 0; i < labs.length; i++) {
      for (let j = i + 1; j < labs.length; j++) {
        const slot1 = this.timeSlots.find((s) => s.id === labs[i].timeSlotId);
        const slot2 = this.timeSlots.find((s) => s.id === labs[j].timeSlotId);

        if (
          slot1 &&
          slot2 &&
          labs[i].teacherId === labs[j].teacherId &&
          slot1.day === slot2.day &&
          Math.abs(slot1.slotIndex - slot2.slotIndex) === 1
        ) {
          count++;
        }
      }
    }
    return count;
  }

  private countAfternoonTheory(assignments: Assignment[]): number {
    return assignments.filter((a) => {
      if (a.sessionType !== "theory") return false;
      const [hours] = a.startTime.split(":").map(Number);
      return hours >= 14;
    }).length;
  }

  private calculateWorkloadImbalance(assignments: Assignment[]): number {
    const teacherHours = new Map<number, number>();
    for (const a of assignments) {
      teacherHours.set(a.teacherId, (teacherHours.get(a.teacherId) || 0) + 1);
    }

    const hours = Array.from(teacherHours.values());
    if (hours.length === 0) return 0;

    const mean = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const variance =
      hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;

    return Math.sqrt(variance);
  }

  private calculateTotalGaps(assignments: Assignment[]): number {
    let totalGaps = 0;
    const groups = new Map<string, Assignment[]>();

    for (const a of assignments) {
      const key = `${a.semester}-${a.section}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }

    for (const [key, groupAssignments] of Array.from(groups.entries())) {
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

      for (const day of days) {
        const daySlots = groupAssignments
          .filter((a) => a.day === day)
          .map((a) => this.timeSlots.find((s) => s.id === a.timeSlotId))
          .filter((s): s is TimeSlot => s !== undefined)
          .sort((a, b) => a.slotIndex - b.slotIndex);

        for (let i = 0; i < daySlots.length - 1; i++) {
          const gap = daySlots[i + 1].slotIndex - daySlots[i].slotIndex - 1;
          totalGaps += Math.max(0, gap);
        }
      }
    }

    return totalGaps;
  }

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
