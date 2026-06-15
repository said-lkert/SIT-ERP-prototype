import { X, Printer, Hexagon, Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InterventionPreviewProps {
  data: Record<string, any>;
  onClose: () => void;
}

export function InterventionPreview({ data, onClose }: InterventionPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-300 print:static print:bg-transparent print:backdrop-blur-none">
      <style>{`
        @media print {
          body, html, #root {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          /* Hide anything else outside the modal if possible, or just let it be covered */
          .hide-on-print {
            display: none !important;
          }
        }
      `}</style>
      
      {/* Toolbar */}
      <div className="h-16 bg-slate-900 border-b border-white/10 px-6 flex items-center justify-between shrink-0 print:hidden shadow-lg z-10">
        <h2 className="text-white font-medium">Intervention Order Preview</h2>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors focus:ring-2 focus:ring-white/20 outline-none"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible">
        <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-slate-900/5 print:shadow-none print:ring-0 p-12 sm:p-14 flex flex-col relative font-sans text-slate-900 dark:text-white mb-20 print:mb-0">
          
          {/* Document Header */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded flex items-center justify-center text-white print:bg-indigo-600 print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <Hexagon className="w-8 h-8 fill-indigo-600 stroke-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">SIT-ERP Corp Ltd.</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Smart Enterprise Solutions</p>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
               <p>123 Business Rd., HQ Block</p>
               <p>London, UK EC1A 1BB</p>
               <p>contact@sit-erp.com</p>
               <p>+44 20 7123 4567</p>
            </div>
          </div>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-10 flex justify-between items-center print:bg-indigo-50 print:border-indigo-600" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
             <h2 className="text-xl font-bold text-indigo-900 tracking-wider">BON D'INTERVENTION</h2>
             <p className="font-mono font-bold text-indigo-700">Ref: BI-2024-00142</p>
          </div>

          {/* Client & Intervention Meta */}
          <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
             <div>
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Client Information</h3>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{data.clientName || '—'}</p>
                <p className="text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2"><User className="w-3 h-3 text-slate-400" /> Contact Details</p>
                <div className="pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                   <p>{data.phone || '—'}</p>
                   <p>{data.email || '—'}</p>
                </div>
                
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs mt-4 mb-1 flex items-center gap-2 border-t border-slate-100 pt-3"><MapPin className="w-3 h-3 text-slate-400" /> Site Address</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                   {data.street || '—'}<br/>
                   {data.zip || ''} {data.city || '—'}<br/>
                   {data.country || ''}
                </p>
             </div>

             <div>
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Intervention Metadata</h3>
                <table className="w-full text-slate-600 dark:text-slate-400">
                   <tbody>
                      <tr>
                         <td className="py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300 w-1/3">Creation Date:</td>
                         <td className="py-2">May 03, 2026</td>
                      </tr>
                      <tr>
                         <td className="py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300">Planned Date:</td>
                         <td className="py-2">{data.date || '—'}</td>
                      </tr>
                      <tr>
                         <td className="py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300">Time / Duration:</td>
                         <td className="py-2">
                           {data.timeStart || '—'} - {data.timeEnd || '—'} 
                           {data.duration ? ` (${data.duration})` : ''}
                         </td>
                      </tr>
                      <tr>
                         <td className="py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300">Type:</td>
                         <td className="py-2">{data.type || '—'}</td>
                      </tr>
                      <tr>
                         <td className="py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300">Priority:</td>
                         <td className="py-2">
                           <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider",
                              data.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                              data.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                              data.priority === 'Medium' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                           )} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                              {data.priority || 'Medium'}
                           </span>
                         </td>
                      </tr>
                      <tr>
                         <td className="py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300">Status:</td>
                         <td className="py-2">Draft</td>
                      </tr>
                      <tr>
                         <td className="py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-100">Assignee:</td>
                         <td className="py-2 border-t border-slate-100 font-medium text-slate-900 dark:text-white">Mark Logger</td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Description of Work</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded min-h-[100px] text-sm text-slate-700 dark:text-slate-300 print:bg-slate-50 print:border-slate-200 whitespace-pre-wrap" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
               {data.description || <span className="text-slate-400 italic">No description provided.</span>}
            </div>
          </div>

          {/* Materials */}
          <div className="mb-10">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Materials & Parts Required</h3>
            <table className="w-full text-sm text-left border-collapse">
               <thead className="bg-slate-100 text-slate-600 dark:text-slate-400 font-semibold print:bg-slate-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <tr>
                     <th className="py-2 px-3 border border-slate-200 dark:border-slate-700">Reference</th>
                     <th className="py-2 px-3 border border-slate-200 dark:border-slate-700">Description</th>
                     <th className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-center">Qty</th>
                     <th className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-right">Unit Price</th>
                     <th className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-right">Total</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className="bg-white dark:bg-slate-900 print:bg-white">
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 font-mono text-xs">P-HV-001</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700">HVAC Pro Series B</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-center">1 u</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-right">$2,450.00</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-right">$2,450.00</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-950 print:bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 font-mono text-xs">C-TAP-HD</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700">Sealant Tape Heavy Duty</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-center">3 roll</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-right">$15.00</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-right">$45.00</td>
                  </tr>
                  <tr className="font-bold bg-white dark:bg-slate-900 print:bg-white">
                     <td colSpan={4} className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-right uppercase tracking-wider text-xs">Total Estimated</td>
                     <td className="py-2 px-3 border border-slate-200 dark:border-slate-700 text-right">$2,495.00</td>
                  </tr>
               </tbody>
            </table>
          </div>

          {/* Checklist */}
          <div className="mb-10 flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Pre-Intervention Checklist</h3>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
               {['Electrical safety clearance verified', 'Client briefed on expected downtime', 'Old unit serial number recorded'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                     <div className="w-4 h-4 border border-slate-400 rounded-sm shrink-0 print:border-black"></div>
                     {item}
                  </li>
               ))}
               <li className="flex items-center gap-3 text-slate-400">
                  <div className="w-4 h-4 border border-slate-300 rounded-sm shrink-0 border-dashed"></div>
                  <span className="border-b border-slate-200 dark:border-slate-700 border-dashed pb-0.5 inline-block w-64"></span>
               </li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="mt-auto pt-8 flex justify-between gap-8 mb-8">
             <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-1">Technician Signature</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Date : __________________</p>
                <div className="h-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 print:bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                   {/* Signature area */}
                </div>
             </div>
             <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-1">Client Signature</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Date : __________________</p>
                <div className="h-24 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 print:bg-slate-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                   {/* Signature area */}
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px] text-slate-400">
             <p>SIT-ERP Corp Ltd. - Document generated automatically</p>
             <p>Page 1 / 1</p>
          </div>

        </div>
      </div>
    </div>
  );
}
