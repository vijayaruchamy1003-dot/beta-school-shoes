import React, { useState, useEffect } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2, Plus } from 'lucide-react';
import { schoolOrderApi } from '../../api/client';
import { BulkImportRow, BulkImportResponse, School } from '../../types';

interface SchoolOrderExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools?: School[];
  defaultSchoolId?: string;
  defaultSchoolName?: string;
  onSuccess: (result: BulkImportResponse) => void;
}

export const downloadSimpleSchoolOrderTemplate = (schoolName?: string) => {
  const cleanPrefix = schoolName
    ? schoolName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
    : 'School';

  const headers = [
    'Admission No',
    'Student Name',
    'Class',
    'Section',
    'Category',
    'Product Name',
    'Size',
    'Quantity',
    'Unit Price',
  ];

  // Simple sample rows showing how 1 student can have multiple items (or multiple students)
  const sampleRows = [
    ['ADM-101', 'Rahul Kumar', 'Class 5', 'A', 'SHOES', 'Classic Oxford Lace-Up School Shoe', '3', '1', '749'],
    ['ADM-101', 'Rahul Kumar', 'Class 5', 'A', 'SHIRTS', 'White Half Sleeve Uniform Shirt', '30', '2', '450'],
    ['ADM-101', 'Rahul Kumar', 'Class 5', 'A', 'SOCKS', 'School Uniform Socks (2 Pairs)', 'Medium', '2', '199'],
    ['ADM-102', 'Priya Sharma', 'Class 5', 'A', 'SHOES', 'Mary Jane Single-Strap Girls Shoe', '2', '1', '749'],
    ['ADM-102', 'Priya Sharma', 'Class 5', 'A', 'SHIRTS', 'White Half Sleeve Uniform Shirt', '28', '2', '450'],
  ];

  const csvContent =
    '\uFEFF' +
    headers.join(',') +
    '\n' +
    sampleRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n') +
    '\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${cleanPrefix}_Orders_Excel_Template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Parse CSV / TSV line respecting quotes
const parseDelimitedLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
};

const parseTextToRows = (text: string): BulkImportRow[] => {
  const cleanText = text.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const lines = cleanText.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];

  // Detect tab vs comma delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const rawRows = lines.map(l => parseDelimitedLine(l, delimiter));
  if (rawRows.length === 0) return [];

  // Check if first row is a header row
  const headerCheck = rawRows[0].map(h => h.toLowerCase());
  const hasHeader =
    headerCheck.some(h => h.includes('student') || h.includes('name') || h.includes('product') || h.includes('admission') || h.includes('size'));

  const startIdx = hasHeader ? 1 : 0;

  // Map column positions flexibly
  let colMap = {
    admissionNumber: 0,
    studentName: 1,
    gradeClass: 2,
    section: 3,
    category: 4,
    productName: 5,
    sizeLabel: 6,
    quantity: 7,
    unitPrice: 8,
  };

  if (hasHeader) {
    headerCheck.forEach((h, idx) => {
      if (h.includes('adm') || h.includes('roll') || h.includes('id')) colMap.admissionNumber = idx;
      else if (h.includes('student') || (h.includes('name') && !h.includes('product') && !h.includes('parent'))) colMap.studentName = idx;
      else if (h.includes('class') || h.includes('grade') || h.includes('std')) colMap.gradeClass = idx;
      else if (h.includes('sec')) colMap.section = idx;
      else if (h.includes('cat') || h.includes('type')) colMap.category = idx;
      else if (h.includes('product') || h.includes('item') || h.includes('model')) colMap.productName = idx;
      else if (h.includes('size')) colMap.sizeLabel = idx;
      else if (h.includes('qty') || h.includes('quant')) colMap.quantity = idx;
      else if (h.includes('price') || h.includes('rate') || h.includes('amount')) colMap.unitPrice = idx;
    });
  }

  const parsed: BulkImportRow[] = [];
  for (let i = startIdx; i < rawRows.length; i++) {
    const cols = rawRows[i];
    if (cols.every(c => !c.trim())) continue;

    const studentName = (cols[colMap.studentName] || '').trim();
    const productName = (cols[colMap.productName] || '').trim();
    if (!studentName && !productName) continue;

    parsed.push({
      admissionNumber: (cols[colMap.admissionNumber] || '').trim(),
      studentName: studentName || 'Student',
      gradeClass: (cols[colMap.gradeClass] || 'Class 1').trim(),
      section: (cols[colMap.section] || 'A').trim(),
      category: (cols[colMap.category] || 'SHOES').trim().toUpperCase(),
      productName: productName || 'School Shoe',
      sizeLabel: (cols[colMap.sizeLabel] || 'Free').trim(),
      quantity: Math.max(1, parseInt(cols[colMap.quantity] || '1', 10) || 1),
      unitPrice: parseFloat(cols[colMap.unitPrice] || '0') || 0,
    });
  }

  return parsed;
};

export const SchoolOrderExcelImportModal: React.FC<SchoolOrderExcelImportModalProps> = ({
  isOpen,
  onClose,
  schools = [],
  defaultSchoolId = '',
  defaultSchoolName = '',
  onSuccess,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState(defaultSchoolId);
  const [rows, setRows] = useState<BulkImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedSchoolId(defaultSchoolId || (schools[0]?.id ?? ''));
      setRows([]);
      setFileName('');
      setErrorMsg('');
    }
  }, [isOpen, defaultSchoolId, schools]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrorMsg('');

    try {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
        // Dynamically load SheetJS if not already loaded to support native .xlsx files
        let XLSX = (window as any).XLSX;
        if (!XLSX) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Could not load Excel parser'));
            document.head.appendChild(script);
          });
          XLSX = (window as any).XLSX;
        }
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const csvText = XLSX.utils.sheet_to_csv(firstSheet);
        const parsed = parseTextToRows(csvText);
        if (parsed.length === 0) {
          setErrorMsg('No valid student order rows found in the Excel file.');
        }
        setRows(parsed);
      } else {
        const text = await file.text();
        const parsed = parseTextToRows(text);
        if (parsed.length === 0) {
          setErrorMsg('No valid student order rows found in the file. Please check the template format.');
        }
        setRows(parsed);
      }
    } catch (err: any) {
      setErrorMsg('Failed to read file. Please use the downloaded Excel/CSV template.');
    }
  };

  const handleUpdateRow = (idx: number, field: keyof BulkImportRow, value: any) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [field]: value };
    setRows(updated);
  };

  const handleRemoveRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleAddEmptyRow = () => {
    setRows([
      ...rows,
      {
        admissionNumber: '',
        studentName: '',
        gradeClass: 'Class 5',
        section: 'A',
        category: 'SHOES',
        productName: '',
        sizeLabel: '3',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleImportSubmit = async () => {
    if (!selectedSchoolId) {
      setErrorMsg('Please select a school first.');
      return;
    }
    const validRows = rows.filter(r => r.studentName.trim() !== '' && r.productName.trim() !== '');
    if (validRows.length === 0) {
      setErrorMsg('Please upload an Excel/CSV file or add at least one valid student order row.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await schoolOrderApi.bulkImportOrders({
        schoolId: selectedSchoolId,
        status: 'CONFIRMED',
        stockPolicy: 'BOOKING_ONLY',
        rows: validRows,
      });
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to import student orders.');
    } finally {
      setSubmitting(false);
    }
  };

  // Count distinct students in preview
  const distinctStudentsCount = new Set(
    rows.map(r => (r.admissionNumber?.trim() || `${r.studentName.trim()}-${r.gradeClass}`).toUpperCase())
  ).size;

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-black text-navy-950">
                Excel / CSV Bulk Order Import
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Download the simple template, fill in students and their product orders in Excel, and upload it here.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* School Selector (if opened from global orders list) */}
          {!defaultSchoolId && schools.length > 0 && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-700 mb-1">Select School for Import *</label>
              <select
                value={selectedSchoolId}
                onChange={e => setSelectedSchoolId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-navy-950"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 1 & Step 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Download Template */}
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                  Step 1
                </span>
                <h3 className="font-black text-sm text-navy-950">Download Simple Excel Template</h3>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Includes simple columns: <strong>Admission No, Student Name, Class, Section, Category, Product Name, Size, Quantity, Unit Price</strong>. Repeat a student's row to add multiple products for the same student.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadSimpleSchoolOrderTemplate(defaultSchoolName)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel Template (.csv)</span>
              </button>
            </div>

            {/* Step 2: Upload Filled File */}
            <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                  Step 2
                </span>
                <h3 className="font-black text-sm text-navy-950">Upload Filled Excel / CSV File</h3>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Select your saved <strong>.csv</strong> or <strong>.xlsx</strong> file from Excel. You can review and edit all rows below before confirming.
                </p>
              </div>
              <label className="w-full py-2.5 px-4 rounded-xl bg-navy-950 hover:bg-navy-850 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{fileName ? `Uploaded: ${fileName}` : 'Choose Excel / CSV File'}</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Preview & Editable Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-black text-navy-950">
                  Order Rows Preview ({rows.length} {rows.length === 1 ? 'item' : 'items'} across {distinctStudentsCount} {distinctStudentsCount === 1 ? 'student' : 'students'})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddEmptyRow}
                className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-navy-950 font-bold text-[11px] flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Row Manually</span>
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600">No rows loaded yet.</p>
                <p className="text-[11px]">
                  Download the template in Step 1, add your students &amp; orders in Excel, and upload it in Step 2.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-2">Adm No</th>
                      <th className="py-2 px-2">Student Name *</th>
                      <th className="py-2 px-2">Class</th>
                      <th className="py-2 px-2">Sec</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2">Product Name *</th>
                      <th className="py-2 px-2">Size *</th>
                      <th className="py-2 px-2">Qty</th>
                      <th className="py-2 px-2">Price (₹)</th>
                      <th className="py-2 px-2 text-center">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Auto"
                            value={r.admissionNumber || ''}
                            onChange={e => handleUpdateRow(idx, 'admissionNumber', e.target.value)}
                            className="w-20 px-2 py-1 rounded border border-slate-200 font-mono text-[11px]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Student Name"
                            value={r.studentName}
                            onChange={e => handleUpdateRow(idx, 'studentName', e.target.value)}
                            className="w-32 px-2 py-1 rounded border border-slate-200 font-bold text-navy-950 text-[11px]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={r.gradeClass || ''}
                            onChange={e => handleUpdateRow(idx, 'gradeClass', e.target.value)}
                            className="w-16 px-2 py-1 rounded border border-slate-200 text-[11px]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={r.section || ''}
                            onChange={e => handleUpdateRow(idx, 'section', e.target.value)}
                            className="w-10 px-2 py-1 rounded border border-slate-200 text-[11px] uppercase"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="SHOES"
                            value={r.category || ''}
                            onChange={e => handleUpdateRow(idx, 'category', e.target.value)}
                            className="w-20 px-2 py-1 rounded border border-slate-200 font-bold text-[10px] uppercase"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Product Name"
                            value={r.productName}
                            onChange={e => handleUpdateRow(idx, 'productName', e.target.value)}
                            className="w-40 px-2 py-1 rounded border border-slate-200 text-[11px]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={r.sizeLabel}
                            onChange={e => handleUpdateRow(idx, 'sizeLabel', e.target.value)}
                            className="w-14 px-2 py-1 rounded border border-slate-200 font-mono font-bold text-[11px]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            min={1}
                            value={r.quantity}
                            onChange={e => handleUpdateRow(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                            className="w-14 px-2 py-1 rounded border border-slate-200 font-mono text-[11px]"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            min={0}
                            value={r.unitPrice || 0}
                            onChange={e => handleUpdateRow(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 rounded border border-slate-200 font-mono text-[11px]"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 text-red-400 hover:text-red-700 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-500">
            Same student rows are automatically grouped into a single Student Order.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={submitting || rows.length === 0}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Importing Orders...' : `Create ${distinctStudentsCount || ''} Student Orders`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
