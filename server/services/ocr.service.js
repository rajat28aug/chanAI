import Tesseract from 'tesseract.js';

export async function solveFromImage(imageBase64) {
  const res = await Tesseract.recognize(imageBase64, 'eng');
  return res.data.text || '';
}


