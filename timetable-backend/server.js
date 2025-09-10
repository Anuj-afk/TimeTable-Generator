const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create directories if they don't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
if (!fs.existsSync('outputs')) {
    fs.mkdirSync('outputs');
}

app.post('/generate-timetable', upload.single('file'), (req, res) => {
    console.log('📁 File upload received:', req.file?.originalname);
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputPath = `outputs/generated_timetable_${Date.now()}.xlsx`;

    console.log('📥 Input file:', inputPath);
    console.log('📤 Expected output:', outputPath);

    console.log('🐍 Starting Python script...');
    const startTime = Date.now();

    const pythonProcess = spawn('python', ['timetablegenerator.py', inputPath, outputPath], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('🐍 Python stdout:', output);
        pythonOutput += output;
    });

    pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.log('🐍 Python stderr:', error);
        pythonError += error;
    });

    pythonProcess.on('close', (code) => {
        const executionTime = (Date.now() - startTime) / 1000;
        console.log(`🐍 Python script completed with code ${code} in ${executionTime}s`);
        
        // Clean up input file
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
            console.log('🗑️ Input file cleaned up');
        }

        if (code !== 0) {
            console.error('❌ Python script failed with code:', code);
            console.error('❌ Python error output:', pythonError);
            
            // Check if file was created despite the error
            if (!fs.existsSync(outputPath)) {
                return res.status(500).json({ 
                    error: 'Python script failed',
                    details: pythonError,
                    exitCode: code
                });
            }
        }

        // Log Python output for debugging
        if (pythonOutput && pythonOutput.length > 0) {
            console.log('✅ Python script output:', pythonOutput);
        }

        // Check if output file was created
        console.log('🔍 Checking if output file exists:', outputPath);
        const fileExists = fs.existsSync(outputPath);
        console.log('📂 Output file exists:', fileExists);
        
        if (!fileExists) {
            console.error('❌ Output file was not created');
            return res.status(500).json({ error: 'Timetable file was not generated' });
        }

        // Get file stats
        const stats = fs.statSync(outputPath);
        console.log('📊 Output file size:', stats.size, 'bytes');

        if (stats.size === 0) {
            console.error('❌ Output file is empty');
            fs.unlinkSync(outputPath);
            return res.status(500).json({ error: 'Generated file is empty' });
        }

        console.log('📤 Sending file to client...');

        // Set proper headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="generated_timetables.xlsx"');

        // Send the generated file back
        res.download(outputPath, 'generated_timetables.xlsx', (downloadErr) => {
            if (downloadErr) {
                console.error('❌ Download error:', downloadErr);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to send file' });
                }
            } else {
                console.log('✅ File sent successfully');
            }
            
            // Clean up output file after sending (or attempting to send)
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
                console.log('🗑️ Output file cleaned up');
            }
        });
    });

    pythonProcess.on('error', (error) => {
        console.error('❌ Failed to start Python process:', error);
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        res.status(500).json({ error: 'Failed to start Python script' });
    });
});

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Add this new endpoint after your existing routes

app.get('/get-timetables', async (req, res) => {
    try {
        const XLSX = require('xlsx');
        const outputDir = path.join(__dirname, 'outputs');
        
        // For demo purposes, we'll read from a sample file
        // In production, you might want to save the latest generated file with a known name
        const sampleFile = path.join(__dirname, 'latest_timetables.xlsx');
        
        if (!fs.existsSync(sampleFile)) {
            return res.json({ 
                teachers: {}, 
                classes: {},
                message: "No timetable data available. Please generate timetables first." 
            });
        }

        const workbook = XLSX.readFile(sampleFile);
        const teachers = {};
        const classes = {};

        // Process each sheet
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Skip empty sheets or summary sheet
            if (data.length === 0 || sheetName === 'Summary') return;
            
            // Determine if this is a teacher or class sheet based on content
            const processedData = processSheetData(data, sheetName);
            
            if (isTeacherSheet(data)) {
                teachers[sheetName] = processedData;
            } else {
                classes[sheetName] = processedData;
            }
        });

        res.json({ teachers, classes });
        
    } catch (error) {
        console.error('Error reading timetables:', error);
        res.status(500).json({ error: 'Failed to read timetable data' });
    }
});

// Helper function to process sheet data
function processSheetData(data, sheetName) {
    if (data.length < 2) return [];
    
    const headers = data[0];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
    
    const result = [];
    
    // Process each row (skip header)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && days.includes(row[0])) {
            const daySchedule = {
                day: row[0],
                periods: []
            };
            
            // Extract periods (columns 1-8)
            for (let j = 1; j <= 8; j++) {
                daySchedule.periods.push(row[j] || "");
            }
            
            result.push(daySchedule);
        }
    }
    
    return result;
}

// Helper function to determine if sheet contains teacher data
function isTeacherSheet(data) {
    // Simple heuristic: if the sheet contains class codes (like 10A, 11B) in cells, it's a teacher sheet
    // If it contains teacher names, it's a class sheet
    const content = data.flat().join(' ').toLowerCase();
    const classPattern = /\d{1,2}[a-f]/g;
    return classPattern.test(content);
}

// Add endpoint to save the latest generated file for reading
app.post('/save-latest-timetable', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const latestPath = path.join(__dirname, 'latest_timetables.xlsx');
        
        // Copy the uploaded file to a known location
        fs.copyFileSync(req.file.path, latestPath);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ message: 'Latest timetable saved successfully' });
        
    } catch (error) {
        console.error('Error saving latest timetable:', error);
        res.status(500).json({ error: 'Failed to save timetable' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});