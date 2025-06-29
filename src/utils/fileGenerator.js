import createCsvWriter from 'csv-writer';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Utility class for generating export files
 */
class FileGenerator {
  /**
   * Generate CSV file from data
   * @param {Array} data - Array of objects to export
   * @param {Array} headers - Array of header objects {id, title}
   * @param {string} filename - Name of the file
   * @returns {Promise<string>} Path to generated file
   */
  static async generateCSV(data, headers, filename) {
    const exportDir = path.join(process.cwd(), 'uploads', 'exports');
    
    // Ensure export directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${filename}.csv`);
    
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filePath,
      header: headers
    });

    await csvWriter.writeRecords(data);
    return filePath;
  }

  /**
   * Generate Excel file from data
   * @param {Array} data - Array of objects to export
   * @param {Array} headers - Array of header objects {id, title}
   * @param {string} filename - Name of the file
   * @returns {Promise<string>} Path to generated file
   */
  static async generateExcel(data, headers, filename) {
    const exportDir = path.join(process.cwd(), 'uploads', 'exports');
    
    // Ensure export directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${filename}.xlsx`);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet format
    const worksheetData = [
      headers.map(h => h.title), // Header row
      ...data.map(row => headers.map(h => row[h.id] || '')) // Data rows
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    
    // Write file
    XLSX.writeFile(workbook, filePath);
    
    return filePath;
  }

  /**
   * Generate PDF file from data
   * @param {Array} data - Array of objects to export
   * @param {Array} headers - Array of header objects {id, title}
   * @param {string} filename - Name of the file
   * @param {Object} options - PDF options
   * @returns {Promise<string>} Path to generated file
   */
  static async generatePDF(data, headers, filename, options = {}) {
    const exportDir = path.join(process.cwd(), 'uploads', 'exports');
    
    // Ensure export directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${filename}.pdf`);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add title
        doc.fontSize(20).text(options.title || 'Reporte de Datos', 50, 50);
        doc.moveDown();

        // Add metadata
        if (options.metadata) {
          doc.fontSize(12);
          Object.entries(options.metadata).forEach(([key, value]) => {
            doc.text(`${key}: ${value}`);
          });
          doc.moveDown();
        }

        // Create table
        const tableTop = doc.y;
        const tableLeft = 50;
        const rowHeight = 25;
        const colWidth = (doc.page.width - 100) / headers.length;

        // Draw headers
        doc.fontSize(10).fillColor('black');
        headers.forEach((header, i) => {
          const x = tableLeft + (i * colWidth);
          doc.rect(x, tableTop, colWidth, rowHeight).stroke();
          doc.text(header.title, x + 5, tableTop + 8, { width: colWidth - 10 });
        });

        // Draw data rows
        data.forEach((row, rowIndex) => {
          const y = tableTop + ((rowIndex + 1) * rowHeight);
          
          // Check if we need a new page
          if (y + rowHeight > doc.page.height - 50) {
            doc.addPage();
            return; // Skip this row, it would be cut off
          }

          headers.forEach((header, colIndex) => {
            const x = tableLeft + (colIndex * colWidth);
            doc.rect(x, y, colWidth, rowHeight).stroke();
            const cellValue = row[header.id] || '';
            doc.text(String(cellValue), x + 5, y + 8, { width: colWidth - 10 });
          });
        });

        // Add footer
        doc.fontSize(8).fillColor('gray');
        doc.text(
          `Generado el ${new Date().toLocaleString('es-ES')}`,
          50,
          doc.page.height - 50
        );

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clean up old export files (older than 24 hours)
   */
  static async cleanupOldFiles() {
    const exportDir = path.join(process.cwd(), 'uploads', 'exports');
    
    if (!fs.existsSync(exportDir)) {
      return;
    }

    const files = fs.readdirSync(exportDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    for (const file of files) {
      const filePath = path.join(exportDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Get file size in human readable format
   * @param {string} filePath - Path to the file
   * @returns {string} File size
   */
  static getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default FileGenerator;
