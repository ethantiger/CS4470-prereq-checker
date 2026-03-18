import { PDFParse } from 'pdf-parse';
import type { Course, Student } from '../types/index';

PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs');

async function extractText(file: File): Promise<string> {
  const pdfParser = new PDFParse({data: await file.arrayBuffer()});

  const textResult = await pdfParser.getText();
  const text = textResult.text;
  
  return text;
}

const TRANSFER_COURSE_RE = /^(?<dept>[A-Z]+)\s+(?<number>\d{4}[A-Z])\s+(?<title>.+?)\s+(?<credits>\d+\.\d+)\s+CR$/gim;
const COURSE_LINE_RE = /^(?<code>[A-Z]{2,}\s*\d{4}[A-Z])\s+(?<section>\d{3})\s+(?<campus>UW)\s+(?<title>.+?)\s+(?<units>\d+\.\d)\s+(?<grade>\d{3})?/gim;

function findCourseLines(text: string) {
  const out = [];

  for (const m of text.matchAll(TRANSFER_COURSE_RE)) {
    const g = m.groups || {};
    out.push({
      code: (g.dept || '').trim() + ' ' + (g.number || '').trim(),
      campus: 'TRANSFER',
      title: (g.title || '').trim(),
      units: g.credits ? Number(g.credits) : null,
      grade: 'CR',
    } as Course);
  }

  for (const m of text.matchAll(COURSE_LINE_RE)) {
    const g = m.groups || {};
    out.push({
      code: (g.code || '').trim(),
      campus: (g.campus || '').trim(),
      title: (g.title || '').trim(),
      units: g.units ? Number(g.units) : null,
      grade: g.grade ? Number(g.grade) : null,
    } as Course);
  }
  return out;
}

function findStudentID(text: string, segmentIndex: number = 0): number {
  // First try to find actual full 9-digit student ID at start of line (this should work for non-redacted PDFs)
  const fullIdMatch = text.match(/^(\d{9})/m);
  if (fullIdMatch) {
    const id = Number(fullIdMatch[1]);
    if (!isNaN(id) && fullIdMatch[1].length === 9) {
      return id;
    }
  }
  
  // Look for partial student ID starting with "251" (OCR may show as "25L", "25_", "251.", etc.)
  // This code may need to be removed in future if OCR accuracy improves/when using non redacted files
  const partialIdMatch = text.match(/\b25[1LlI_.\s]+[\s']*(\d+)/m);
  if (partialIdMatch) {
    const capturedDigits = partialIdMatch[1].replace(/\D/g, '');
    let fullId = '251' + capturedDigits;
    while (fullId.length < 9) {
      fullId += Math.floor(Math.random() * 10);
    }
    
    fullId = fullId.substring(0, 9);
    
    const id = Number(fullId);
    if (!isNaN(id)) {
      return id;
    }
  }
  
  // Fallback: generate ID starting with 251 based on segment index
  const fallbackId = 251000000 + segmentIndex + 1;
  return fallbackId;
}

function findStudentName(text: string): string | null {
  const match = text.match(/^Primary Name:\s*(?<name>[A-Za-z ,'-]+?)\s+Birthdate:/m);
  const name = match?.groups?.name?.trim();
  
  // Remove line once we are using non redacted files
  return name || null;
}

function splitByStudentID(text: string): string[] {
  const newPagePattern = /(?<studentId>\d{5,9})\s+THE UNIVERSITY OF WESTERN ONTARIO/g
  const pages = [...text.matchAll(newPagePattern)];

  const segments: string[] = [];
  let currentStudentId = pages[0].groups!.studentId;
  let currentStudentStart = pages[0].index!;
  for (let i = 1; i < pages.length; i++) {
    if (pages[i].groups!.studentId !== currentStudentId) {
      const endIndex = pages[i].index!;
      segments.push(text.slice(currentStudentStart, endIndex));
      currentStudentId = pages[i].groups!.studentId;
      currentStudentStart = pages[i].index!;
    }
  }
  segments.push(text.slice(currentStudentStart, text.length));
  return segments;
}

async function extractInfo(file: File): Promise<Student[]> {
  try {
    const text = await extractText(file);
    const segments = splitByStudentID(text);
    
    if (segments.length === 0 || segments.every(s => s.trim().length === 0)) {
      throw new Error('No student data found in PDF');
    }
    
    const students = segments.map((segment, index) => {
      try {
        const courses = findCourseLines(segment);
        const id = findStudentID(segment, index);
        const name = findStudentName(segment);
        return { id, courses, name } as Student;
      } catch (error) {
        throw new Error(`Failed to parse student segment ${index + 1}: ${error.message}`);
      }
    });
        
    console.log(`Successfully processed ${students.length} student records`);
    
    return students;
    
  } catch (error) {
    
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

export { extractInfo }