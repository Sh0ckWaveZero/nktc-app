import axios from 'axios';
import { authConfig } from '@/configs/auth';
import { LocalStorageService } from './localStorageService';

const localStorageService = new LocalStorageService();

class ApiService {
  private getAuthHeaders() {
    const token = localStorageService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getStudentsWithCheckInStatus(params?: any) {
    try {
      // First get students
      const response = await axios.get(`${authConfig.studentEndpoint}/list`, {
        headers: this.getAuthHeaders(),
        params,
      });

      const students = response.data;

      // If we have classroomId and teacherId, try to get existing check-in data
      if (params?.classroomId) {
        try {
          // We'll need teacherId for this - for now we'll use a placeholder or get it from auth
          // This should be enhanced to get the actual teacher ID
          const checkInResponse = await axios.get(
            `${authConfig.activityCheckInEndpoint}/teacher/1/classroom/${params.classroomId}/start-date/${params.date || new Date().toISOString().split('T')[0]}/daily-report`,
            {
              headers: this.getAuthHeaders(),
            }
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
                internship: checkInData.reportCheckIn?.internship || []
              }
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
      const response = await axios.get(`${authConfig.studentEndpoint}/list`, {
        headers: this.getAuthHeaders(),
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
      const response = await axios.get(`${authConfig.classroomEndpoint}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }
  }

  async getTeacherClassroomsAndStudents(teacherId: string) {
    try {
      const response = await axios.get(`${authConfig.teacherEndpoint}/${teacherId}/students`, {
        headers: this.getAuthHeaders(),
      });
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
      const response = await axios.post(`${authConfig.activityCheckInEndpoint}`, checkInData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error saving check-in data:', error);
      throw error;
    }
  }

  async getCheckInData(teacherId: string, classroomId: string, date: string) {
    try {
      const response = await axios.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${teacherId}/classroom/${classroomId}/start-date/${date}/daily-report`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching check-in data:', error);
      throw error;
    }
  }

  async get(endpoint: string, token?: string) {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : this.getAuthHeaders();
      const response = await axios.get(`${authConfig.backEndUrl}${endpoint}`, {
        headers,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
