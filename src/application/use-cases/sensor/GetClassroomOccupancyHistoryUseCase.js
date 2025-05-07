/**
 * Gets historical occupancy data for analysis
 * including average occupancy, maximum occupancy,
 * and utilization rate over a specified date range.
 */

class GetClassroomOccupancyHistoryUseCase {
  constructor(sensorRepository, classroomRepository) {
    this.sensorRepository = sensorRepository;
    this.classroomRepository = classroomRepository;
  }

  async execute({ classroomId, fromDate, toDate, interval = 'hourly' }) {
    // Step 1: Validate input
    if (!classroomId) {
      throw new Error('Classroom ID is required');
    }

    // Step 2: Check if classroom exists
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found`);
    }

    // Step 3: Prepare date range (default to last 7 days if not specified)
    const endDate = toDate ? new Date(toDate) : new Date();
    const startDate = fromDate 
      ? new Date(fromDate) 
      : new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago

    // Step 4: Get the historical occupancy data
    const occupancyHistory = await this.sensorRepository.getOccupancyHistory(
      classroomId,
      startDate,
      endDate,
      interval
    );

    // Step 5: Calculate averages and maximum values
    let maxOccupancy = 0;
    let totalOccupancy = 0;
    let readingsCount = occupancyHistory.length;

    for (const reading of occupancyHistory) {
      if (reading.occupancyCount > maxOccupancy) {
        maxOccupancy = reading.occupancyCount;
      }
      totalOccupancy += reading.occupancyCount;
    }

    const averageOccupancy = readingsCount > 0 ? totalOccupancy / readingsCount : 0;
    const utilizationRate = readingsCount > 0 ? (totalOccupancy / (readingsCount * classroom.capacity)) * 100 : 0;

    // Step 6: Return the results
    return {
      classroomId,
      classroomFullName: classroom.fullName,
      capacity: classroom.capacity,
      startDate,
      endDate,
      interval,
      readings: occupancyHistory,
      stats: {
        maxOccupancy,
        averageOccupancy,
        utilizationRate,
        readingsCount
      }
    };
  }
}

export default GetClassroomOccupancyHistoryUseCase;