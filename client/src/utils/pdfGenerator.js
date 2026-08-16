import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

// Register the autoTable plugin explicitly for Vite ESM support
applyPlugin(jsPDF);

/**
 * Compiles user data into a beautifully formatted PDF report.
 * @param {Object} userData - The user data payload returned from the backend export API.
 */
export const generatePDFReport = (userData, contentSelection = 'all') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  // Primary Theme Colors (Classic/Serene styling)
  const primaryColor = [249, 115, 22];  // #f97316 (Orange/Saffron)
  const secondaryColor = [30, 41, 59];  // #1e293b (Slate 800)
  const lightBgColor = [255, 251, 235]; // #fffbeb (Warm Cream)

  // Helper to add Footer on each page
  const addPageFooter = (pdfDoc, currentPageNum, totalPagesPlaceholder) => {
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(148, 163, 184); // Slate 400
    
    // Left side: copyright
    pdfDoc.text('Character Coach — vvym.blogspot.com', margin, pageHeight - 10);
    
    // Right side: page number
    const pageText = `Page ${currentPageNum}`;
    pdfDoc.text(pageText, pageWidth - margin - 15, pageHeight - 10);
  };

  // --- PAGE 1: TITLE & PROFILE SUMMARY ---

  // Decorative Top Accent Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Logo & Branding
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...primaryColor);
  doc.text('Character Coach', margin, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...secondaryColor);
  doc.text('Personal Progress & Character Assessment Report', margin, 32);

  // Divider Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(margin, 36, pageWidth - margin, 36);

  // Profile Information Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.text('1. Account & Profile Summary', margin, 46);

  // Render Profile info in a neat grid using autoTable
  doc.autoTable({
    startY: 50,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: [51, 65, 85], // Slate 700
      lineColor: [241, 245, 249],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [30, 41, 59] },
      1: { cellWidth: 120 }
    },
    body: [
      ['Name', userData.account.name || 'N/A'],
      ['Email Address', userData.account.email || 'N/A'],
      ['Streak Calculation Mode', `${userData.profile?.streakType || 'Daily'} Streak`],
      ['Age Group', userData.profile?.ageGroup || 'N/A'],
      ['Joined On', userData.account.createdAt ? new Date(userData.account.createdAt).toLocaleDateString() : 'N/A'],
      ['Report Generated At', new Date(userData.exportedAt || new Date()).toLocaleString()],
      ['Date Range Filter', userData.dateRangeLabel || 'All Time']
    ]
  });

  let currentY = doc.lastAutoTable.finalY + 15;
  let sectionIndex = 2;

  // Custom Attributes Section (Only if present and assessments selected)
  if ((contentSelection === 'all' || contentSelection === 'assessments') && userData.customAttributes && userData.customAttributes.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.text(`${sectionIndex}. Custom Attributes Created`, margin, currentY);
    currentY += 5;
    sectionIndex++;

    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 25 },
        2: { cellWidth: 110 }
      },
      head: [['Attribute Name', 'Category', 'Description']],
      body: userData.customAttributes.map(attr => [
        attr.name,
        attr.category,
        attr.description || 'N/A'
      ])
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // --- PAGE 2: ASSESSMENT HISTORY ---
  
  if ((contentSelection === 'all' || contentSelection === 'assessments') && userData.assessments && userData.assessments.length > 0) {
    // If not much space left on page 1, push assessments to page 2
    if (currentY > 160) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY += 5;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.text(`${sectionIndex}. Self-Assessment History`, margin, currentY);
    currentY += 5;
    sectionIndex++;

    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3.5,
        textColor: [51, 65, 85],
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Date
        1: { cellWidth: 40, fontStyle: 'bold' }, // Attribute
        2: { cellWidth: 15 }, // Score
        3: { cellWidth: 50 }, // Effort Level
        4: { cellWidth: 55 }  // Reflection
      },
      head: [['Date', 'Attribute Name', 'Score', 'Effort Level', 'Notes / Reflection']],
      body: userData.assessments.map(assess => [
        new Date(assess.assessmentDate).toLocaleDateString(),
        assess.attributeName,
        `${assess.alignmentScore} / 5`,
        assess.effortLevel || 'N/A',
        assess.personalNote || ''
      ])
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  // --- PAGE 3: JOURNAL NOTES ---
  
  if ((contentSelection === 'all' || contentSelection === 'notes') && userData.journalNotes && userData.journalNotes.length > 0) {
    // Check if we should push journal notes to a new page
    if (currentY > 180) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY += 5;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.text(`${sectionIndex}. Reflective Journal Notes`, margin, currentY);
    currentY += 5;

    doc.autoTable({
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 4,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 22 }, // Date
        1: { cellWidth: 45, fontStyle: 'bold' }, // Attribute
        2: { cellWidth: 113 }  // Note content
      },
      head: [['Date', 'Attribute Name', 'Journal Entry Content']],
      body: userData.journalNotes.map(note => [
        new Date(note.createdAt).toLocaleDateString(),
        note.attributeName,
        note.content
      ])
    });
  }

  // Add headers/footers to all pages dynamically
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Add thin header line on pages 2+
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text('Character Coach — Personal Progress Report', margin, 10);
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(margin, 12, pageWidth - margin, 12);
    }
    
    addPageFooter(doc, i, totalPages);
  }

  // Trigger Save/Download
  const pdfName = `character-coach-report-${userData.account.id}.pdf`;
  doc.save(pdfName);
};
