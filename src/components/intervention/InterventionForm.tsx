import { useState, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  Clock, 
  FileText, 
  Wrench, 
  Paperclip, 
  CheckSquare, 
  MessageSquare,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  Printer,
  ChevronRight,
  GripVertical
  ,WandSparkles, CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InterventionPreview } from './InterventionPreview';

export function InterventionForm() {
  const [priority, setPriority] = useState('Medium');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [demoData, setDemoData] = useState<any>({});
  const [formVersion, setFormVersion] = useState(0);
  const [savedInterventions, setSavedInterventions] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sit-erp-sav-interventions') || '[]');
    } catch {
      return [];
    }
  });
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const fillDemo = () => {
    let failedEquipment: any = null;
    try {
      const saved = JSON.parse(localStorage.getItem('sit-erp-installed-equipments') || '[]');
      failedEquipment = saved.find((equipment: any) => equipment.status === 'en_panne');
    } catch {}

    failedEquipment ||= {
      clientName: 'Hôtel X',
      siteName: 'Parking',
      address: "15 Rue de l'Hôtellerie, Tizi-Ouzou",
      productName: 'Caméra IP Hikvision',
      serialNumber: 'HIK-10002',
      exactLocation: 'Parking nord',
    };

    setDemoData({
      clientName: failedEquipment.clientName,
      street: failedEquipment.address || 'Adresse du site client',
      city: 'Tizi-Ouzou',
      equipment: `${failedEquipment.productName} - ${failedEquipment.serialNumber}`,
      description: `Diagnostic et dépannage de ${failedEquipment.productName}, déclaré en panne à l'emplacement ${failedEquipment.exactLocation}.`,
      notes: `Intervention liée au site ${failedEquipment.siteName || 'principal'}.`,
      date: new Date().toISOString().split('T')[0],
    });
    setPriority('High');
    setFormVersion((version) => version + 1);
  };

  const handleOpenPreview = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const data = Object.fromEntries(formData.entries());
      setPreviewData({ ...data, priority });
      setIsPreviewOpen(true);
    }
  };

  const confirmAndAssign = () => {
    if (!formRef.current) return;
    const values = Object.fromEntries(new FormData(formRef.current).entries());
    const intervention = {
      id: `sav-${Date.now()}`,
      reference: `SAV-${String(savedInterventions.length + 1).padStart(4, '0')}`,
      clientName: values.clientName || demoData.clientName || 'Client',
      equipment: values.equipment || demoData.equipment || 'Équipement',
      description: values.description || 'Intervention SAV',
      date: values.date || new Date().toISOString().split('T')[0],
      priority,
      status: 'Assignée',
      technician: 'Mark Logger',
    };
    const updated = [intervention, ...savedInterventions];
    setSavedInterventions(updated);
    localStorage.setItem('sit-erp-sav-interventions', JSON.stringify(updated));
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };
  
  return (
    <div className={cn("flex h-full w-full bg-slate-50 relative overflow-hidden", isPreviewOpen && "hide-on-print")}>
      {isPreviewOpen && (
        <InterventionPreview 
          data={previewData} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      )}
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto w-full">
        {showSavedMessage && (
          <div className="fixed top-20 right-6 z-[80] flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5" />
            Intervention validée et assignée.
          </div>
        )}
        <form key={formVersion} ref={formRef} className="p-8 pb-32 max-w-4xl mx-auto space-y-8" onSubmit={e => e.preventDefault()}>
        
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Intervention Order</h1>
                <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                  Draft
                </span>
              </div>
              <p className="text-sm font-mono text-slate-500 dark:text-slate-400">BI-2024-00142</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Créée par l'administrateur SAV</p>
              <button type="button" onClick={fillDemo} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100">
                <WandSparkles className="w-4 h-4" /> Remplissage démo
              </button>
            </div>
          </div>

          {savedInterventions.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Interventions SAV enregistrées</h2>
                  <p className="text-xs text-slate-500 mt-1">Dernières interventions validées et assignées.</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-lg">{savedInterventions.length}</span>
              </div>
              <div className="space-y-2">
                {savedInterventions.slice(0, 4).map((intervention) => (
                  <div key={intervention.id} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center"><Wrench className="w-4 h-4" /></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{intervention.reference}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full">{intervention.status}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 truncate">{intervention.clientName} - {intervention.equipment}</p>
                      <p className="text-xs text-slate-500">{intervention.technician} • {intervention.date}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-600">{intervention.priority}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-6">
            {/* Client & Site */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Client & Site
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Client <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      name="clientName"
                      type="text" 
                      placeholder="Search existing client..." 
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-slate-900 transition-colors"
                      defaultValue={demoData.clientName || "Acme Corp (Contact: Jane Doe)"}
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 hover:text-indigo-700 px-2">
                      + New
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                    <input name="phone" type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input name="email" type="email" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue="jane.doe@acmecorp.com" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Intervention Address <span className="text-rose-500 ml-1">*</span></label>
                  <div className="space-y-3">
                    <input name="street" type="text" placeholder="Street Address" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue={demoData.street || "123 Industrial Parkway, Building 4"} />
                    <div className="grid grid-cols-2 gap-3">
                      <input name="city" type="text" placeholder="City" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue={demoData.city || "Techville"} />
                      <input name="zip" type="text" placeholder="Postal Code" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue="90210" />
                    </div>
                    <input name="country" type="text" placeholder="Country" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue="United States" />
                    <textarea name="notes" placeholder="Consignes d'accès au site..." className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[60px]" defaultValue={demoData.notes || ''}></textarea>
                  </div>
                </div>
              </div>
            </section>

            {/* Intervention Details */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Intervention Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Équipement en panne *</label>
                  <input name="equipment" type="text" readOnly value={demoData.equipment || ''} placeholder="Utilisez le remplissage démo pour sélectionner un équipement en panne" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Type <span className="text-rose-500">*</span></label>
                    <select name="type" defaultValue="Installation" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900">
                      <option>Maintenance</option>
                      <option>Repair</option>
                      <option>Installation</option>
                      <option>Inspection</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Priority <span className="text-rose-500">*</span></label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-md transition-colors",
                            priority === p ? 
                              p === 'Urgent' ? "bg-rose-500 text-white shadow" : 
                              p === 'High' ? "bg-amber-500 text-white shadow" : 
                              p === 'Medium' ? "bg-indigo-500 text-white shadow" : 
                              "bg-emerald-500 text-white shadow"
                            : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Description <span className="text-rose-500">*</span></label>
                  <textarea 
                    name="description"
                    placeholder="Describe what needs to be done..." 
                    className="w-full px-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    defaultValue={demoData.description || "Décrire le problème rencontré et l'intervention à réaliser."}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Scheduling & Assignment */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" /> Scheduling & Assignment
              </h2>
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Planned Date <span className="text-rose-500">*</span></label>
                    <input name="date" type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue={demoData.date || "2026-05-10"} />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Time Slot <span className="text-rose-500">*</span></label>
                    <div className="flex gap-2">
                      <input name="timeStart" type="time" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue="09:00" />
                      <span className="text-slate-400 self-center">-</span>
                      <input name="timeEnd" type="time" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue="14:00" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Est. Duration</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="duration" type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue="5h 00m" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Deadline Date (Opt.)</label>
                    <input name="deadline" type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Assigned Technicians</label>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" /> No Schedule Conflicts
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                          ML
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Mark Logger <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">Team Lead</span></p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Available all day</p>
                          </div>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-rose-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <button className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add Technician
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Materials & Parts */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-400" /> Materials & Parts
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm mb-4">
                  <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="pb-3 font-semibold">Product / Part</th>
                      <th className="pb-3 font-semibold w-24">Qty</th>
                      <th className="pb-3 font-semibold text-right w-32">Status</th>
                      <th className="pb-3 font-semibold text-right w-24">Est. Cost</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="group">
                      <td className="py-3 pr-4">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-900" defaultValue="HVAC Pro Series B" />
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          <input type="number" className="w-16 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm text-center" defaultValue="1" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">u</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                          In Stock (12)
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        $2,450.00
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-slate-300 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                    <tr className="group">
                      <td className="py-3 pr-4">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input type="text" className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-900" defaultValue="Sealant Tape Heavy Duty" />
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          <input type="number" className="w-16 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-sm text-center" defaultValue="3" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">roll</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex items-center justify-end gap-1">
                          <AlertCircle className="w-3 h-3" /> Low (4)
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                         $45.00
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-slate-300 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Item
                </button>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-4">Total Materials est.</span>
                  <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">$2,495.00</span>
                </div>
              </div>
            </section>

            {/* Checklist */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
               <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-400" /> Pre-Intervention Checklist
              </h2>
              
              <div className="space-y-2 mb-4">
                {[
                  { text: 'Electrical safety clearance verified', req: true },
                  { text: 'Client briefed on expected downtime', req: true },
                  { text: 'Old unit serial number recorded', req: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-lg group">
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                    <input type="text" className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:bg-white dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1" defaultValue={item.text} />
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", item.req ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500")}>
                        {item.req ? 'Required' : 'Optional'}
                      </span>
                      <button className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                 <Plus className="w-3 h-3" /> Add Task
              </button>
            </section>

            {/* Documents */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
               <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" /> Documents & Attachments
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="relative group border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center text-center">
                   <button className="absolute -top-2 -right-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-1 text-slate-400 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 className="w-3 h-3" /></button>
                   <FileText className="w-8 h-8 text-blue-500 mb-2" />
                   <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate w-full">HVAC_Manual.pdf</p>
                   <p className="text-[10px] text-slate-400 mt-0.5">2.4 MB</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 transition-colors cursor-pointer">
                 <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                   <Plus className="w-5 h-5" />
                 </div>
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click or drag & drop files here</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            </section>

            {/* Internal Notes */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
               <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" /> Internal Notes
              </h2>
              <textarea 
                  placeholder="Private notes (not visible to client)..." 
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm min-h-[100px] bg-amber-50/30 focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue="Client mentioned they might want an upgrade on the thermostat next month. Have Mark pitch the Series X if he has time."
                ></textarea>
            </section>

          </div>
        </form>
      </div>

      {/* Sticky Right Summary Panel */}
      <div className="hidden lg:block w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 h-full overflow-y-auto shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.02)] relative z-10">
        <div className="p-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Intervention Summary</h3>
          
          <div className="space-y-6">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Draft
                </span>
             </div>

             <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Priority</p>
                <div className="flex items-center gap-2">
                   <div className={cn(
                      "w-3 h-3 rounded-full",
                      priority === 'Urgent' ? "bg-rose-500" : 
                      priority === 'High' ? "bg-amber-500" : 
                      priority === 'Medium' ? "bg-indigo-500" : "bg-emerald-500"
                   )}></div>
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{priority}</span>
                </div>
             </div>

             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assignee</p>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">ML</div>
                   <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark Logger</p>
                </div>
             </div>

             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">May 10, 2026</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">09:00 - 14:00 (5h 00m)</p>
             </div>

             <div className="pt-4 border-t border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Completion Readiness</p>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                  <div className="bg-emerald-500 h-full w-[80%]"></div>
               </div>
               <p className="text-xs text-slate-500 dark:text-slate-400">Missing required: Client Email</p>
             </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 lg:right-80 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-8 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
         <button className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors">
            Discard Form
         </button>
         
         <div className="flex items-center gap-3">
            <button type="button" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-slate-200 outline-none">
               Save as Draft
            </button>
            <button type="button" onClick={handleOpenPreview} className="px-4 py-2 bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
               <Eye className="w-4 h-4" /> Preview
            </button>
            <button type="button" onClick={handleOpenPreview} className="px-4 py-2 bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
               <Printer className="w-4 h-4" />
            </button>
            <button type="button" onClick={confirmAndAssign} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center gap-2 ms-2 cursor-pointer">
               Confirm & Assign <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}
