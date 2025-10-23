import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

class ApiService {

  async getStudentsWithCheckInStatus(params?: any) {
    try {
      // First get students
      const response = await httpClient.get(`${authConfig.studentEndpoint}/list`, {
        params,
      });

      const students = response.data;

      // If we have classroomId and teacherId, try to get existing check-in data
      if (params?.classroomId) {
        try {
          // We'll need teacherId for this - for now we'll use a placeholder or get it from auth
          // This should be enhanced to get the actual teacher ID
          const checkInResponse = await httpClient.get(
            `${authConfig.activityCheckInEndpoint}/teacher/1/classroom/${params.classroomId}/start-date/${params.date || new Date().toISOString().split('T')[0]}/daily-report`
          );

          // If we have existing check-in data, merge it with students
          if (checkInResponse.data && checkInResponse.data.length > 0) {
            const checkInData = checkInResponse.data[0]; // Get first classroom data

            return students.map((student: any) => ({
              ...student,
              existingCheckIn: {
                present: checkInData.reportCheckIn?.present || [],
                absent: checkInData.reportCheckIn?.absent || [],
                late: checkInData.reportCheckIn?.late || [],
                leave: checkInData.reportCheckIn?.leave || [],
                internship: checkInData.reportCheckIn?.internship || [],
              },
            }));
          }
        } catch (checkInError) {
          // If no existing check-in data, just return students
          console.log('No existing check-in data found');
        }
      }

      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getStudents(params?: any) {
    try {
      const response = await httpClient.get(`${authConfig.studentEndpoint}/list`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getClassrooms() {
    try {
      const response = await httpClient.get(`${authConfig.classroomEndpoint}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }
  }

  async getTeacherClassroomsAndStudents(teacherId: string) {
    try {
      const response = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher classrooms and students:', error);
      throw error;
    }
  }

  async saveCheckInData(checkInData: {
    teacherId: string;
    classroomId: string;
    checkInDate: string;
    present: string[];
    absent: string[];
    late: string[];
    leave: string[];
    internship: string[];
  }) {
    try {
      const response = await httpClient.post(`${authConfig.activityCheckInEndpoint}`, checkInData);
      return response.data;
    } catch (error) {
      console.error('Error saving check-in data:', error);
      throw error;
    }
  }

  async getCheckInData(teacherId: string, classroomId: string, date: string) {
    try {
      const response = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${teacherId}/classroom/${classroomId}/start-date/${date}/daily-report`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching check-in data:', error);
      throw error;
    }
  }

  async get(endpoint: string, config?: any) {
    try {
      const response = await httpClient.get(`${authConfig.backEndUrl}${endpoint}`, config);
      return response;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async post(endpoint: string, data?: any, config?: any) {
    try {
      const response = await httpClient.post(`${authConfig.backEndUrl}${endpoint}`, data, config);
      return response;
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  }

  async put(endpoint: string, data?: any, config?: any) {
    try {
      const response = await httpClient.put(`${authConfig.backEndUrl}${endpoint}`, data, config);
      return response;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  }

  async patch(endpoint: string, data?: any, config?: any) {
    try {
      const response = await httpClient.patch(`${authConfig.backEndUrl}${endpoint}`, data, config);
      return response;
    } catch (error) {
      console.error(`Error patching ${endpoint}:`, error);
      throw error;
    }
  }

  async delete(endpoint: string, config?: any) {
    try {
      const response = await httpClient.delete(`${authConfig.backEndUrl}${endpoint}`, config);
      return response;
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
