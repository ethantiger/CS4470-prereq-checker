import { PDFParse } from 'pdf-parse';
import type { Course } from '../types/index';

PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs');

async function extractText(file: File): Promise<string> {
  const pdfParser = new PDFParse({data: await file.arrayBuffer()});

  const textResult = await pdfParser.getText();
  const text = textResult.text;
  
  // Check if the PDF is empty
  if (!text || text.trim().length < 10) {
    throw new Error('PDF appears to be empty or corrupted');
  }
  
  return text;
}

const COURSE_LINE_RE = /^(?<code>[A-Z]{2,}\s*\d{4}[A-Z])\s+(?<section>\d{3})\s+(?<campus>UW)\s+(?<title>.+?)\s+(?<units>\d+\.\d)\s+(?<grade>\d{3})?/gim;

function findCourseLines(text: string) {
  const out = [];
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
  // First try to split by actual student IDs
  const studentIdPattern = /^\d{9}/gm;
  const studentIdMatches = [...text.matchAll(studentIdPattern)];
  
  if (studentIdMatches.length > 0) {
    // Use original logic for non-redacted PDFs
    const segments: string[] = [];
    for (let i = 0; i < studentIdMatches.length; i++) {
      const startIndex = studentIdMatches[i].index!;
      const endIndex = i < studentIdMatches.length - 1 ? studentIdMatches[i + 1].index! : text.length;
      segments.push(text.slice(startIndex, endIndex));
    }
    return segments;
  }
  
  // If no student IDs found split by "Page : X" markers (for redacted PDFs)
  const pageMarkerPattern = /Page\s*:\s*(\d+)/gm;
  const pageMatches = [...text.matchAll(pageMarkerPattern)];
  
  if (pageMatches.length > 0) {
    const segments: string[] = [];
    let currentStudentStart = pageMatches[0].index!;
    let lastPageNum = 0;
    
    for (let i = 0; i < pageMatches.length; i++) {
      const pageNum = Number(pageMatches[i][1]);
      
      // If page number resets to 1 (and we're not at the first page), start a new student
      if (pageNum === 1 && lastPageNum > 0) {
        const endIndex = pageMatches[i].index!;
        segments.push(text.slice(currentStudentStart, endIndex));
        currentStudentStart = pageMatches[i].index!;
      }
      
      lastPageNum = pageNum;
    }
    
    segments.push(text.slice(currentStudentStart, text.length));
    
    return segments;
  }
  
  return [text];
}

async function extractInfo(file: File) {
  try {
    const text = await extractText(file);
    const segments = splitByStudentID(text);
    
    if (segments.length === 0 || segments.every(s => s.trim().length === 0)) {
      throw new Error('No student data found in PDF');
    }
    
    // Check if this appears to be a redacted PDF (uses Page: X markers instead of student IDs)
    const hasPageMarkers = segments.some(s => /Page:\s*\d+/m.test(s));
    const hasStudentIds = segments.some(s => /^\d{9}/m.test(s));
    
    console.log(`Processing PDF: ${hasPageMarkers && !hasStudentIds ? 'Redacted (using page markers)' : 'Standard (using student IDs)'}, ${segments.length} segments found`);
    
    const students = segments.map((segment, index) => {
      try {
        const courses = findCourseLines(segment);
        const id = findStudentID(segment, index);
        const name = findStudentName(segment);
        
        // For redacted PDFs
        let finalName = name;
        if (!hasStudentIds && !name) {
          finalName = `Student ${index + 1} (Name Redacted)`;
        }
        
        return { id, courses, name: finalName };
      } catch (error) {
        throw new Error(`Failed to parse student segment ${index + 1}: ${error.message}`);
      }
    });
    
    
    const validStudents = students.filter(s => s.id && !isNaN(s.id));
    
    if (validStudents.length === 0) {
      throw new Error('No valid student records could be created');
    }
    
    console.log(`Successfully processed ${validStudents.length} student records`);
    
    
    return validStudents.length === 1 ? validStudents[0] : validStudents;
    
  } catch (error) {
    
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

export { extractInfo }