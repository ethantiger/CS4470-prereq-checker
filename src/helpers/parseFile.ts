import { PDFParse } from 'pdf-parse';
import type { Course } from '../types/index';

PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs');

async function extractText(file: File): Promise<string> {
  const pdfParser = new PDFParse({data: await file.arrayBuffer()});

  const textResult = await pdfParser.getText();
  return textResult.text;
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

function findStudentID(text: string): number {
  return Number(text.slice(0, 9));
}

function findStudentName(text: string): string | null {
  const match = text.match(/^Primary Name:\s*(?<name>[A-Za-z ,'-]+?)\s+Birthdate:/m);
  return match?.groups?.name?.trim() || null;
}

async function extractInfo(file: File) {
  const text = await extractText(file)
  const courses = findCourseLines(text);
  const id = findStudentID(text);
  const name = findStudentName(text);
  return { id, courses, name };
}

export { extractInfo }