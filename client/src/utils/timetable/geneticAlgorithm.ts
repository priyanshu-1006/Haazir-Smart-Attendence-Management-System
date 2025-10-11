/**
 * Genetic Algorithm for Timetable Optimization
 * Evolutionary approach to find optimal timetables
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
}

export class GeneticTimetableOptimizer {
  private timeSlots: TimeSlot[];
  private courseSessions: CourseSession[];
  private rooms: Room[];
  private constraints: Constraints;

  // GA Parameters
  private populationSize: number;
  private generations: number;
  private mutationRate: number;
  private crossoverRate: number;
  private elitismCount: number;

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
  }

  /**
   * Main optimization method
   * Genetic Algorithm: Population Evolution
   */
  public optimize(): Chromosome | null {
    console.log("🧬 Starting Genetic Algorithm...");

    // Step 1: Initialize population
    let population = this.initializePopulation();
    console.log(`✓ Initialized population of ${population.length}`);

    let bestChromosome = population[0];
    let generationsWithoutImprovement = 0;
    const maxStagnation = 100;

    // Step 2: Evolution loop
    for (let gen = 0; gen < this.generations; gen++) {
      // Evaluate fitness for all chromosomes
      population = this.evaluatePopulation(population);

      // Sort by fitness (lower is better)
      population.sort((a, b) => a.fitness - b.fitness);

      // Track best solution
      if (population[0].fitness < bestChromosome.fitness) {
        bestChromosome = { ...population[0] };
        generationsWithoutImprovement = 0;

        if (gen % 50 === 0) {
          console.log(
            `Gen ${gen}: Best fitness = ${bestChromosome.fitness.toFixed(2)}`
          );
        }
      } else {
        generationsWithoutImprovement++;
      }

      // Early stopping if no improvement
      if (generationsWithoutImprovement > maxStagnation) {
        console.log(`Early stopping at generation ${gen}`);
        break;
      }

      // Create next generation
      const nextGeneration: Chromosome[] = [];

      // Elitism: Keep best chromosomes
      for (let i = 0; i < this.elitismCount; i++) {
        nextGeneration.push({ ...population[i] });
      }

      // Create offspring through crossover and mutation
      while (nextGeneration.length < this.populationSize) {
        // Selection: Tournament selection
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);

        // Crossover
        let offspring: Chromosome;
        if (Math.random() < this.crossoverRate) {
          offspring = this.crossover(parent1, parent2);
        } else {
          offspring = { ...parent1 };
        }

        // Mutation
        if (Math.random() < this.mutationRate) {
          offspring = this.mutate(offspring);
        }

        nextGeneration.push(offspring);
      }

      population = nextGeneration;
    }

    console.log(
      `✓ Optimization complete. Best fitness: ${bestChromosome.fitness.toFixed(
        2
      )}`
    );
    return bestChromosome;
  }

  /**
   * Initialize population with random valid timetables
   */
  private initializePopulation(): Chromosome[] {
    const population: Chromosome[] = [];

    for (let i = 0; i < this.populationSize; i++) {
      const chromosome = this.createRandomChromosome();
      if (chromosome) {
        population.push(chromosome);
      }
    }

    return population;
  }

  /**
   * Create a random valid chromosome (timetable)
   */
  private createRandomChromosome(): Chromosome | null {
    const assignments: Assignment[] = [];

    // Expand sessions
    const sessionsToSchedule: CourseSession[] = [];
    for (const session of this.courseSessions) {
      for (let i = 0; i < session.sessionsPerWeek; i++) {
        sessionsToSchedule.push({ ...session });
      }
    }

    // Shuffle for randomness
    this.shuffleArray(sessionsToSchedule);

    // Try to assign each session
    for (const session of sessionsToSchedule) {
      const assignment = this.createRandomAssignment(session, assignments);
      if (assignment) {
        assignments.push(assignment);
      }
    }

    return {
      assignments,
      fitness: 0, // Will be calculated later
    };
  }

  /**
   * Create random assignment for a session
   */
  private createRandomAssignment(
    session: CourseSession,
    existingAssignments: Assignment[]
  ): Assignment | null {
    // Get available time slots
    const availableSlots = this.timeSlots.filter((slot) => {
      // Check if slot is available
      return !existingAssignments.some(
        (a) =>
          a.timeSlotId === slot.id &&
          (a.teacherId === session.teacherId ||
            a.roomId === this.getRandomRoom(session)?.id ||
            (a.semester === session.semester && a.section === session.section))
      );
    });

    if (availableSlots.length === 0) return null;

    // Pick random slot
    const timeSlot =
      availableSlots[Math.floor(Math.random() * availableSlots.length)];

    // Get valid room
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

  /**
   * Get random valid room for session
   */
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
   * Evaluate fitness for entire population
   */
  private evaluatePopulation(population: Chromosome[]): Chromosome[] {
    return population.map((chromosome) => ({
      ...chromosome,
      fitness: this.calculateFitness(chromosome.assignments),
    }));
  }

  /**
   * Calculate fitness score (lower is better)
   * Same as constraint solver fitness function
   */
  private calculateFitness(assignments: Assignment[]): number {
    let penalty = 0;

    // Hard constraints violations (high penalty)
    penalty += this.countHardConstraintViolations(assignments) * 1000;

    // Soft constraints (weighted penalties)
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
   * Count hard constraint violations
   */
  private countHardConstraintViolations(assignments: Assignment[]): number {
    let violations = 0;

    // Check teacher conflicts
    const teacherSlots = new Map<string, number>();
    for (const a of assignments) {
      const key = `${a.teacherId}-${a.timeSlotId}`;
      teacherSlots.set(key, (teacherSlots.get(key) || 0) + 1);
    }
    for (const count of teacherSlots.values()) {
      if (count > 1) violations += count - 1;
    }

    // Check room conflicts
    const roomSlots = new Map<string, number>();
    for (const a of assignments) {
      const key = `${a.roomId}-${a.timeSlotId}`;
      roomSlots.set(key, (roomSlots.get(key) || 0) + 1);
    }
    for (const count of roomSlots.values()) {
      if (count > 1) violations += count - 1;
    }

    // Check student conflicts
    const studentSlots = new Map<string, number>();
    for (const a of assignments) {
      const key = `${a.semester}-${a.section}-${a.timeSlotId}`;
      studentSlots.set(key, (studentSlots.get(key) || 0) + 1);
    }
    for (const count of studentSlots.values()) {
      if (count > 1) violations += count - 1;
    }

    return violations;
  }

  /**
   * Tournament selection
   * Mathematical: Select k random individuals, return fittest
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

    // Return fittest (lowest fitness)
    return tournament.reduce((best, current) =>
      current.fitness < best.fitness ? current : best
    );
  }

  /**
   * Crossover: Single-point crossover
   * Mathematical: Combine two parent chromosomes
   */
  private crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    const crossoverPoint = Math.floor(
      Math.random() * parent1.assignments.length
    );

    const offspring: Assignment[] = [
      ...parent1.assignments.slice(0, crossoverPoint),
      ...parent2.assignments.slice(crossoverPoint),
    ];

    return {
      assignments: offspring,
      fitness: 0,
    };
  }

  /**
   * Mutation: Randomly change some assignments
   * Mathematical: Introduce random variations
   */
  private mutate(chromosome: Chromosome): Chromosome {
    const mutated = { ...chromosome };
    const numMutations = Math.ceil(chromosome.assignments.length * 0.1); // Mutate 10%

    for (let i = 0; i < numMutations; i++) {
      const index = Math.floor(Math.random() * mutated.assignments.length);
      const assignment = mutated.assignments[index];

      // Mutate either time slot or room
      if (Math.random() < 0.5) {
        // Change time slot
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
        // Change room
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

    return mutated;
  }

  /**
   * Utility: Shuffle array (Fisher-Yates algorithm)
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Soft constraint calculation methods (same as constraint solver)
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
