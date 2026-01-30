import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { Student } from '../types';

const DB_FILE = 'students.json';

export interface StudentsDatabase {
  [studentId: string]: Student;
}

export class StudentJSONDatabase {
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

  async read(): Promise<StudentsDatabase> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading student database:', error);
      return {};
    }
  }

  async write(data: StudentsDatabase): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing student database:', error);
      throw error;
    }
  }

  async getAllStudents(): Promise<Student[]> {
    const db = await this.read();
    return Object.values(db);
  }

  async getStudent(studentId: number): Promise<Student | null> {
    const db = await this.read();
    return db[studentId.toString()] || null;
  }

  async addStudent(student: Student): Promise<void> {
    const db = await this.read();
    db[student.id.toString()] = student;
    await this.write(db);
  }

  async updateStudent(studentId: number, student: Student): Promise<void> {
    const db = await this.read();
    if (db[studentId.toString()]) {
      db[studentId.toString()] = student;
      await this.write(db);
    }
  }

  async deleteStudent(studentId: number): Promise<void> {
    const db = await this.read();
    delete db[studentId.toString()];
    await this.write(db);
  }

  async importStudents(students: Student[]): Promise<void> {
    const db: StudentsDatabase = {};
    students.forEach(student => {
      db[student.id.toString()] = student;
    });
    await this.write(db);
  }

  async clearAllStudents(): Promise<void> {
    await this.write({});
  }
}
