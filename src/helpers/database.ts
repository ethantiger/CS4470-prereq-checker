import { app } from "electron";
import fs from "fs/promises";
import path from "path";
import { CoursesFile, CourseData } from "../types";

const DB_FILE = "courses.json";

const EMPTY_DB: CoursesFile = {
  program: "Computer Science",
  courses: {},
};

export class JSONDatabase {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(app.getPath("userData"), DB_FILE);
  }

  async initialize(): Promise<void> {
    try {
      await fs.access(this.dbPath);
    } catch {
      await this.write(EMPTY_DB);
    }
  }

  private async read(): Promise<CoursesFile> {
    try {
      const data = await fs.readFile(this.dbPath, "utf-8");
      return JSON.parse(data) as CoursesFile;
    } catch {
      return EMPTY_DB;
    }
  }

  private async write(data: CoursesFile): Promise<void> {
    await fs.writeFile(
      this.dbPath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  }

  // --------- SAFE PUBLIC API ---------

  async getAllCourses(): Promise<Record<string, CourseData>> {
    const db = await this.read();
    return db.courses;
  }

  async getCourse(code: string): Promise<CourseData | null> {
    const db = await this.read();
    return db.courses[code] ?? null;
  }

  async addCourse(code: string, course: CourseData): Promise<void> {
    const db = await this.read();
    db.courses[code] = course;
    await this.write(db);
  }

  async updateCourse(code: string, course: CourseData): Promise<void> {
    const db = await this.read();
    if (db.courses[code]) {
      db.courses[code] = course;
      await this.write(db);
    }
  }

  async deleteCourse(code: string): Promise<void> {
    const db = await this.read();
    delete db.courses[code];
    await this.write(db);
  }

  async importCourses(courses: Record<string, CourseData>): Promise<void> {
    const db = await this.read();
    db.courses = courses;
    await this.write(db);
  }
}
