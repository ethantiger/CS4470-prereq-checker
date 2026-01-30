import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { JSONDatabase } from './helpers/database';
import { StudentJSONDatabase } from './helpers/studentDatabase';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const db = new JSONDatabase();
const studentDb = new StudentJSONDatabase();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await db.initialize();
  await studentDb.initialize();
  
  // Register IPC handlers for courses
  ipcMain.handle('db:getAllCourses', () => db.getAllCourses());
  ipcMain.handle('db:getCourse', (_, courseCode) => db.getCourse(courseCode));
  ipcMain.handle('db:addCourse', (_, courseCode, courseData) => 
    db.addCourse(courseCode, courseData));
  ipcMain.handle('db:updateCourse', (_, courseCode, courseData) => 
    db.updateCourse(courseCode, courseData));
  ipcMain.handle('db:deleteCourse', (_, courseCode) => db.deleteCourse(courseCode));
  ipcMain.handle('db:importCourses', (_, courses) => db.importCourses(courses));
  
  // Register IPC handlers for students
  ipcMain.handle('students:getAll', () => studentDb.getAllStudents());
  ipcMain.handle('students:get', (_, studentId) => studentDb.getStudent(studentId));
  ipcMain.handle('students:add', (_, student) => studentDb.addStudent(student));
  ipcMain.handle('students:update', (_, studentId, student) => 
    studentDb.updateStudent(studentId, student));
  ipcMain.handle('students:delete', (_, studentId) => studentDb.deleteStudent(studentId));
  ipcMain.handle('students:import', (_, students) => studentDb.importStudents(students));
  ipcMain.handle('students:clear', () => studentDb.clearAllStudents());
  
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  // Clear student database on app close
  await studentDb.clearAllStudents();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
