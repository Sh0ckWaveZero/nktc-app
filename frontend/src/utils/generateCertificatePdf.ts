import { degrees, PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'
import SarabunBase64 from './font-base64';

interface UserData {
  account: {
    title: string;
    firstName: string;
    lastName: string;
  };
}

/**
สร้างไฟล์ PDF ใบเกียรติบัตรความประพฤติดี
@async
@function generateCertificatePdf
@param {Blob} blob ข้อมูล PDF ที่ต้องการแปลง
@param {UserData} userData ข้อมูลผู้ใช้งาน
@returns {Promise<Uint8Array>} ข้อมูล PDF ที่แปลงแล้ว
*/
async function generateCertificatePdf(blob: any, userData: UserData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(blob);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(SarabunBase64.regular);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  const fullName = `${userData.account.title} ${userData.account.firstName} ${userData.account.lastName}`;
  const educationYears = process.env.NEXT_PUBLIC_EDUCATION_YEARS || '';
  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const textSize = 46;
  const fullNameWidth = font.widthOfTextAtSize(fullName, textSize);
  const currentDateWidth = font.widthOfTextAtSize(currentDate, textSize);

  firstPage.drawText(fullName, {
    x: width / 2 - fullNameWidth / 2,
    y: height / 2,
    size: textSize,
    font,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(0),
  });

  firstPage.drawText(educationYears, {
    x: width / 2 + 520,
    y: height / 2 - 123,
    size: 40,
    font,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(0),
  });

  firstPage.drawText(currentDate, {
    x: width / 2 - currentDateWidth / 2,
    y: height / 2 - 205,
    size: 40,
    font,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(0),
  });

  const modifiedPdfBytes = await pdfDoc.save();
  return modifiedPdfBytes;
}

export default generateCertificatePdf;
