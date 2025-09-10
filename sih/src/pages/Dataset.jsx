import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const Dataset = () => {
    const [tableData, setTableData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadedFile(file);
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (fileExt === 'csv') {
            handleCSV(file);
        } else if (['xlsx', 'xls'].includes(fileExt)) {
            handleExcel(file);
        }
    };

    const handleCSV = (file) => {
        Papa.parse(file, {
            complete: (results) => {
                setHeaders(results.data[0]);
                setTableData(results.data.slice(1));
            },
            header: false
        });
    };

    const handleExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            setHeaders(jsonData[0]);
            setTableData(jsonData.slice(1));
        };
        reader.readAsArrayBuffer(file);
    };

    const handleGenerate = async () => {
        if (!uploadedFile) {
            alert('Please upload a file first');
            return;
        }

        console.log('🚀 Starting timetable generation...');
        setIsGenerating(true);

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            console.log('📤 Sending file to backend...');
            
            const response = await fetch('http://localhost:5000/generate-timetable', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                
                if (blob.size === 0) {
                    throw new Error('Received empty file from server');
                }

                // Save the generated file for later reading
                const saveFormData = new FormData();
                saveFormData.append('file', blob, 'latest_timetables.xlsx');
                
                fetch('http://localhost:5000/save-latest-timetable', {
                    method: 'POST',
                    body: saveFormData,
                }).catch(err => console.warn('Could not save latest timetable:', err));

                // Download the file
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated_timetables.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                alert('Timetable generated and downloaded successfully!');
                
            } else {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.error || 'Server error');
                } catch (parseError) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
            }
        } catch (error) {
            console.error('❌ Error in handleGenerate:', error);
            alert(`Error generating timetable: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dataset Input</h1>
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="space-y-6">
                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <input 
                            type="file" 
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-purple-50 file:text-purple-700
                                hover:file:bg-purple-100"
                        />
                        {uploadedFile && (
                            <p className="text-sm text-gray-600">
                                Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    {/* Data Display */}
                    {tableData.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {headers.map((header, index) => (
                                                <th 
                                                    key={index}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tableData.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, cellIndex) => (
                                                    <td 
                                                        key={cellIndex}
                                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                                    >
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Generate Button */}
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className={`px-6 py-2 rounded-lg text-white font-medium
                                        ${isGenerating 
                                            ? 'bg-purple-400 cursor-not-allowed' 
                                            : 'bg-purple-600 hover:bg-purple-700 transition duration-300'
                                        }`}
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                <circle 
                                                    className="opacity-25" 
                                                    cx="12" 
                                                    cy="12" 
                                                    r="10" 
                                                    stroke="currentColor" 
                                                    strokeWidth="4"
                                                />
                                                <path 
                                                    className="opacity-75" 
                                                    fill="currentColor" 
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Generating...
                                        </div>
                                    ) : (
                                        'Generate Timetable'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dataset;