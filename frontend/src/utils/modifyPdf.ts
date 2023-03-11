import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'
import SarabunBase64 from './font-base64';
import { UserDataType } from "../context/types";

async function modifyPdf(blob: any, user: UserDataType) {
  const pdfDoc = await PDFDocument.load(blob);
  pdfDoc.registerFontkit(fontkit);
  const helveticaFont = await pdfDoc.embedFont(SarabunBase64.regular);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  const fullName = `${user?.account?.title}${user?.account?.firstName} ${user?.account?.lastName}`;
  const educationsYears = process.env.NEXT_PUBLIC_EDUCATION_YEARS || '';
  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const textSize = 46;
  const textWidth = helveticaFont.widthOfTextAtSize(fullName, textSize);
  const textCurrentDate = helveticaFont.widthOfTextAtSize(currentDate, textSize);
  const textHeight = helveticaFont.heightAtSize(textSize);

  firstPage.drawText(fullName, {
    x: width / 2 - textWidth / 2,
    y: height / 2,
    size: 46,
    font: helveticaFont,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(0),
  });

  firstPage.drawText(educationsYears, {
    x: width / 2 + 520,
    y: height / 2 - 123,
    size: 40,
    font: helveticaFont,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(0),
  });

  firstPage.drawText(currentDate, {
    x: width / 2 - textCurrentDate / 2,
    y: height / 2 - 205,
    size: 40,
    font: helveticaFont,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(0),
  });
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}

export default modifyPdf;
