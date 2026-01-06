import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { CoursesDatabase, CourseData } from '../types';

const DB_FILE = 'courses.json';

export class JSONDatabase {
  private dbPath: string;

  constructor() {
    // Store in userData directory (persistent across app updates)
    this.dbPath = path.join(app.getPath('userData'), DB_FILE);
  }

  async initialize(): Promise<void> {
    try {
      await fs.access(this.dbPath);
    } catch {
      // File doesn't exist, create it with default data
      await this.write({});
    }
  }

  async read(): Promise<CoursesDatabase> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);
      return {};
    }
  }

  async write(data: CoursesDatabase): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing database:', error);
      throw error;
    }
  }

  async getAllCourses(): Promise<CoursesDatabase> {
    return await this.read();
  }

  async getCourse(courseCode: string): Promise<CourseData | null> {
    const db = await this.read();
    return db[courseCode] || null;
  }

  async addCourse(courseCode: string, courseData: CourseData): Promise<void> {
    const db = await this.read();
    db[courseCode] = courseData;
    await this.write(db);
  }

  async updateCourse(courseCode: string, courseData: CourseData): Promise<void> {
    const db = await this.read();
    if (db[courseCode]) {
      db[courseCode] = courseData;
      await this.write(db);
    }
  }

  async deleteCourse(courseCode: string): Promise<void> {
    const db = await this.read();
    delete db[courseCode];
    await this.write(db);
  }

  async importCourses(courses: CoursesDatabase): Promise<void> {
    await this.write(courses);
  }
}
