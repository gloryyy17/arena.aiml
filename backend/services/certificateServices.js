const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateCertificatePDF = async ({ studentName, eventTitle, eventDate, verificationId }) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'certificates');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `${verificationId}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  // Generate QR code as a data URL (points to a public verification page)
  const verifyUrl = `${process.env.CLIENT_URL}/verify/${verificationId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#5B47FB');

    doc.fontSize(28).fillColor('#1A1A1C').font('Helvetica-Bold')
      .text('Certificate of Participation', 0, 100, { align: 'center' });

    doc.fontSize(14).fillColor('#555').font('Helvetica')
      .text('This certifies that', 0, 160, { align: 'center' });

    doc.fontSize(24).fillColor('#5B47FB').font('Helvetica-Bold')
      .text(studentName, 0, 190, { align: 'center' });

    doc.fontSize(14).fillColor('#555').font('Helvetica')
      .text(`has successfully participated in`, 0, 230, { align: 'center' });

    doc.fontSize(20).fillColor('#1A1A1C').font('Helvetica-Bold')
      .text(eventTitle, 0, 255, { align: 'center' });

    doc.fontSize(12).fillColor('#777').font('Helvetica')
      .text(`Held on ${eventDate}`, 0, 290, { align: 'center' });

    // QR code, bottom right
    doc.image(qrDataUrl, doc.page.width - 150, doc.page.height - 150, { width: 100 });
    doc.fontSize(8).fillColor('#999')
      .text(verificationId, doc.page.width - 150, doc.page.height - 45, { width: 100, align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/uploads/certificates/${fileName}`));
    stream.on('error', reject);
  });
};

module.exports = { generateCertificatePDF };