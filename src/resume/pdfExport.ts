import type { FormDataType } from './types';

export async function exportToPDF(formData: FormDataType): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const { about, education, skills, experience } = formData;
  let yPos = 20;
  const pageMargin = 15;
  const pageWidth = doc.internal.pageSize.getWidth() - 2 * pageMargin;
  const sectionSpacing = 12;
  const itemSpacing = 7;

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(about.name, pageMargin, yPos);
  yPos += itemSpacing;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let contactLine = `${about.email} | ${about.phone} | ${about.location}`;
  if (about.profession) contactLine = `${about.profession} | ${contactLine}`;
  doc.text(contactLine, pageMargin, yPos);
  yPos += itemSpacing;

  if (about.links && about.links.length > 0) {
    about.links.forEach(link => {
      if (link.title && link.url) {
        doc.setTextColor(40, 116, 166);
        doc.textWithLink(link.title, pageMargin, yPos, { url: link.url });
        doc.setTextColor(0, 0, 0);
        yPos += 5;
      }
    });
  }
  yPos += sectionSpacing / 2;

  if (about.summary) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Professional Summary', pageMargin, yPos);
    yPos += itemSpacing;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(about.summary, pageWidth);
    doc.text(summaryLines, pageMargin, yPos);
    yPos += summaryLines.length * 5 + sectionSpacing;
  }

  if (skills.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills', pageMargin, yPos);
    yPos += itemSpacing;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const skillText = skills.map(s => `${s.name} (${s.level})`).join('  •  ');
    const skillLines = doc.splitTextToSize(skillText, pageWidth);
    doc.text(skillLines, pageMargin, yPos);
    yPos += skillLines.length * 5 + sectionSpacing;
  }

  if (experience.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Experience', pageMargin, yPos);
    yPos += itemSpacing;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    experience.forEach(exp => {
      if (yPos > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPos = pageMargin;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title, pageMargin, yPos);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${exp.company} | ${exp.period} | ${exp.location}`, pageMargin, yPos + 5);
      yPos += 10;
      const respLines = doc.splitTextToSize(exp.responsibilities, pageWidth - 5);
      doc.text(respLines, pageMargin + 5, yPos);
      yPos += respLines.length * 5 + 2;
      if (exp.achievements && exp.achievements.length > 0) {
        doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
        exp.achievements.forEach(ach => {
          if (yPos > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); yPos = pageMargin; }
          const achLines = doc.splitTextToSize(`• ${ach.text}`, pageWidth - 10);
          doc.text(achLines, pageMargin + 10, yPos);
          yPos += achLines.length * 5;
        });
      }
      yPos += itemSpacing;
    });
    yPos += sectionSpacing / 2;
  }

  if (education.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Education', pageMargin, yPos);
    yPos += itemSpacing;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    education.forEach(edu => {
      if (yPos > doc.internal.pageSize.getHeight() - 30) { doc.addPage(); yPos = pageMargin; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, pageMargin, yPos);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.institution} | ${edu.year}`, pageMargin, yPos + 5);
      yPos += 10;
      if (edu.description) {
        const descLines = doc.splitTextToSize(edu.description, pageWidth - 5);
        doc.text(descLines, pageMargin + 5, yPos);
        yPos += descLines.length * 5;
      }
      yPos += itemSpacing;
    });
  }

  doc.save(`${about.name.replace(/\s+/g, '_') || 'resume'}.pdf`);
}