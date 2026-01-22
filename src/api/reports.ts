import { Router } from 'express';
import PDFDocument from 'pdfkit';
export const reportsRouter = Router();

reportsRouter.get('/evaluation-report', (req, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=evaluation_report.pdf');
  doc.pipe(res);

  doc.fontSize(16).fillColor('#2c3e50').text('Project Self-Evaluation', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(10).fillColor('black');
  doc.text('Project title: Online Quiz Platform - Quizify');
  doc.text('Deployment URL: http://spider.foi.hr:12159/');
  doc.text('Team / Members: Team 08 - Andrej Pavesic, Roman Protsak');
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.fontSize(12).text('Gating Checklist:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10)
     .text('• Deployed and runnable on spider.foi.hr: YES')
     .text('• Passwords stored securely (Bcrypt): YES')
     .text('• Role-based authorization enforced: YES');
  doc.moveDown();

  doc.fontSize(12).text('Mandatory Assessment:', { underline: true });
  doc.moveDown(0.5);

  const assessmentData = [
    { area: 'System Design & Documentation', crit: 'Architecture (FE/BE/DB integration)', max: 5, score: 5 },
    { area: 'System Design & Documentation', crit: 'Data model / ERD + relationships', max: 3, score: 3 },
    { area: 'System Design & Documentation', crit: 'Roles & business rules (incl. 2 regular user types)', max: 3, score: 3 },
    { area: 'System Design & Documentation', crit: 'API documentation', max: 4, score: 3 },
    { area: 'Backend Implementation', crit: 'Core entities & CRUD', max: 15, score: 15 },
    { area: 'Backend Implementation', crit: 'Business rules enforced server-side', max: 7, score: 7 },
    { area: 'Backend Implementation', crit: 'Data integrity & validation', max: 5, score: 5 },
    { area: 'Backend Implementation', crit: 'Security & access control', max: 5, score: 5 },
    { area: 'Backend Implementation', crit: 'Error handling + audit logging', max: 3, score: 2 },
    { area: 'Frontend Implementation', crit: 'Role-based UI alignment', max: 10, score: 10 },
    { area: 'Frontend Implementation', crit: 'Usability & responsiveness', max: 8, score: 8 },
    { area: 'Frontend Implementation', crit: 'Server-side handling (filtering/sorting)', max: 6, score: 5 },
    { area: 'Frontend Implementation', crit: 'Business data charts', max: 4, score: 4 },
    { area: 'Frontend Implementation', crit: 'Angular code quality & standards', max: 4, score: 3 },
    { area: 'Frontend Implementation', crit: 'Integration stability', max: 3, score: 2 },
  ];

  let currentArea = "";

  assessmentData.forEach(item => {
    if (item.area !== currentArea) {
      currentArea = item.area;
      doc.moveDown(0.8);
      doc.fontSize(11).fillColor('#2980b9').text(currentArea, { oblique: true }); 
      doc.fillColor('black').fontSize(10);
    }
    
    doc.text(`  - ${item.crit}: ${item.score}/${item.max}`);
  });

  doc.moveDown();

  doc.fontSize(12).fillColor('black').text('Bonus Points:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text('• PDF Report export - Implemented via /authors page button.');

  doc.end();
});