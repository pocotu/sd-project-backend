import fs from 'fs';
import path from 'path';

/**
 * Simple file generator for testing (without external dependencies)
 */
class SimpleFileGenerator {
  /**
   * Generate CSV file from data
   */
  static async generateCSV(data, headers, filename) {
    const exportDir = path.join(process.cwd(), 'uploads', 'exports');
    
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${filename}.csv`);
    
    // Simple CSV generation
    const headerLine = headers.map(h => h.title).join(',');
    const dataLines = data.map(row => 
      headers.map(h => {
        const value = row[h.id] || '';
        // Escape quotes and wrap in quotes if needed
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    const csvContent = [headerLine, ...dataLines].join('\n');
    fs.writeFileSync(filePath, csvContent, 'utf8');
    
    return filePath;
  }

  /**
   * Generate Excel file (simple CSV for testing)
   */
  static async generateExcel(data, headers, filename) {
    // For testing, just generate CSV
    return await this.generateCSV(data, headers, filename);
  }

  /**
   * Generate PDF file (simple text for testing)
   */
  static async generatePDF(data, headers, filename, options = {}) {
    const exportDir = path.join(process.cwd(), 'uploads', 'exports');
    
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${filename}.pdf`);
    
    // Simple text content for testing
    let content = `${options.title || 'Report'}\n\n`;
    
    if (options.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        content += `${key}: ${value}\n`;
      });
      content += '\n';
    }

    // Add data
    const headerLine = headers.map(h => h.title).join('\t');
    content += headerLine + '\n';
    
    data.forEach(row => {
      const dataLine = headers.map(h => row[h.id] || '').join('\t');
      content += dataLine + '\n';
    });

    fs.writeFileSync(filePath, content, 'utf8');
    
    return filePath;
  }

  /**
   * Clean up old files
   */
  static async cleanupOldFiles() {
    const exportDir = path.join(process.cwd(), 'uploads', 'exports');
    
    if (!fs.existsSync(exportDir)) {
      return;
    }

    const files = fs.readdirSync(exportDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(exportDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Get file size
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

export default SimpleFileGenerator;
