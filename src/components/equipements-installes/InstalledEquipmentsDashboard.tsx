import React, { useState } from "react";
import { InstalledEquipment } from "./types";
import {
  Server,
  Search,
  Filter,
  AlertOctagon,
  Clock,
  Building2,
  CheckCircle2,
  Activity,
  ArrowRightLeft,
  Wrench,
  FileText,
  AlertTriangle,
  X,
  History,
  Plus,
} from "lucide-react";
import { cn, safeFormatDate } from "../../lib/utils";
import { CustomSelect } from "../ui/CustomSelect";
import { ModuleSearchFilters } from '../ui/ModuleSearchFilters';

interface InstalledEquipmentsDashboardProps {
  data: InstalledEquipment[];
  onSelectEquipment: (eq: InstalledEquipment) => void;
  onAddClick: () => void;
}

export function InstalledEquipmentsDashboard({
  data,
  onSelectEquipment,
  onAddClick,
}: InstalledEquipmentsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filters State
  const [filters, setFilters] = useState({
    client: "",
    site: "",
    family: "",
    status: "",
    warrantyExpiring: false,
    warrantyExpired: false,
    inFailure: false,
  });

  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  // Helper
  const isExpiringSoon = (dateStr: string) => {
    const end = new Date(dateStr);
    return end > now && end <= threeMonthsFromNow;
  };

  const isExpired = (dateStr: string) => {
    return new Date(dateStr) < now;
  };

  // KPIs
  const totalEquipments = data.length;
  const activeEquipments = data.filter((d) => d.status === "actif").length;
  const failedEquipments = data.filter((d) => d.status === "en_panne").length;
  const expiringWarranties = data.filter((d) =>
    isExpiringSoon(d.endOfWarranty),
  ).length;
  const uniqueSites = new Set(data.map((d) => `${d.clientId}-${d.siteId}`))
    .size;

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filters.client && item.clientName !== filters.client) return false;
    if (filters.site && item.siteName !== filters.site) return false;
    if (filters.family && item.family !== filters.family) return false;
    if (filters.status && item.status !== filters.status) return false;

    if (filters.warrantyExpiring && !isExpiringSoon(item.endOfWarranty))
      return false;
    if (filters.warrantyExpired && !isExpired(item.endOfWarranty)) return false;
    if (filters.inFailure && item.status !== "en_panne") return false;

    return true;
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clients = Array.from(new Set(data.map((d) => d.clientName))).sort();
  const sites = Array.from(
    new Set(data.map((d) => d.siteName).filter(Boolean)),
  ).sort();
  const families = Array.from(new Set(data.map((d) => d.family))).sort();

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Équipements installés
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Parc matériel installé, localisations et état des garanties.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un équipement
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">
                {totalEquipments}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Total installés
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Parc complet
            </p>
          </div>
        </div>

        {/* Actifs */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">
                {activeEquipments}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Actifs
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              En fonctionnement
            </p>
          </div>
        </div>

        {/* En Panne */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800/30 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">
                {failedEquipments}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              En panne
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Nécessite intervention
            </p>
          </div>
        </div>

        {/* Garanties bientôt expirées */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">
                {expiringWarranties}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Garanties &lt; 3m
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Expirations proches
            </p>
          </div>
        </div>

        {/* Sites */}
        <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">
                {uniqueSites}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sites couverts
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Multi-clients
            </p>
          </div>
        </div>
      </div>

      <ModuleSearchFilters
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par équipement, N/S ou client..."
        activeFiltersCount={activeFiltersCount}
        advancedFilters={
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Client
                </label>
                <CustomSelect
                  value={filters.client}
                  onChange={(val) => setFilters({ ...filters, client: val })}
                  options={[
                    { value: "", label: "Tous les clients" },
                    ...clients.map((c) => ({ value: c, label: c }))
                  ]}
                  className="w-full relative z-40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Site
                </label>
                <CustomSelect
                  value={filters.site}
                  onChange={(val) => setFilters({ ...filters, site: val })}
                  options={[
                    { value: "", label: "Tous les sites" },
                    ...sites.map((s) => ({ value: s as string, label: s as string }))
                  ]}
                  className="w-full relative z-30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Famille
                </label>
                <CustomSelect
                  value={filters.family}
                  onChange={(val) => setFilters({ ...filters, family: val })}
                  options={[
                    { value: "", label: "Toutes" },
                    ...families.map((f) => ({ value: f, label: f }))
                  ]}
                  className="w-full relative z-30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Statut
                </label>
                <CustomSelect
                  value={filters.status}
                  onChange={(val) => setFilters({ ...filters, status: val })}
                  options={[
                    { value: "", label: "Tous" },
                    { value: "actif", label: "Actif" },
                    { value: "en_panne", label: "En panne" },
                    { value: "en_maintenance", label: "En maintenance" },
                    { value: "remplace", label: "Remplacé" },
                    { value: "retire", label: "Retiré" },
                    { value: "hors_service", label: "Hors service" }
                  ]}
                  className="w-full relative z-30"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasActiveContract}
                  onChange={(e) =>
                    setFilters({ ...filters, hasActiveContract: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                />
                Contrat de maintenance actif
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.warrantyExpiring}
                  onChange={(e) =>
                    setFilters({ ...filters, warrantyExpiring: e.target.checked })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                />
                Garantie bientôt expirée ({'<'} 3 mois)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.warrantyExpired}
                  onChange={(e) =>
                    setFilters({ ...filters, warrantyExpired: e.target.checked })
                  }
                  className="rounded text-slate-600 focus:ring-slate-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                />
                Garantie expirée
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inFailure}
                  onChange={(e) =>
                    setFilters({ ...filters, inFailure: e.target.checked })
                  }
                  className="rounded text-rose-600 focus:ring-rose-500 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                />
                Équipements en panne
              </label>
            </div>

            <div className="flex items-center justify-between pt-3">
               <div className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredData.length} résultat(s) trouvé(s)
               </div>
               <button 
                 onClick={() => setFilters({ client: "", site: "", family: "", status: "", warrantyExpiring: false, warrantyExpired: false, inFailure: false, hasActiveContract: false })}
                 className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
               >
                 Réinitialiser les filtres
               </button>
            </div>
          </div>
        }
      />

      {/* Table */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Client & Site
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Équipement
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Emplacement
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Fin Garantie
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredData.map((item) => {
                let StatusIcon = Activity;
                let statusColor =
                  "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-400 border-slate-200 dark:border-slate-800/10";

                if (item.status === "actif") {
                  StatusIcon = CheckCircle2;
                  statusColor =
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/10";
                }
                if (item.status === "en_panne") {
                  StatusIcon = AlertOctagon;
                  statusColor =
                    "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/10";
                }
                if (item.status === "en_maintenance") {
                  StatusIcon = Wrench;
                  statusColor =
                    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/10";
                }

                let warrantyStatus = "Valide";
                let warrantyColor = "text-emerald-600 dark:text-emerald-400";
                if (isExpired(item.endOfWarranty)) {
                  warrantyStatus = "Expirée";
                  warrantyColor =
                    "text-rose-600 dark:text-rose-400 font-medium";
                } else if (isExpiringSoon(item.endOfWarranty)) {
                  warrantyStatus = "< 3 mois";
                  warrantyColor =
                    "text-amber-600 dark:text-amber-400 font-medium";
                }

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    onClick={() => onSelectEquipment(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30">
                          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                            {item.clientName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.siteName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.productName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.serialNumber} • {item.family}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {item.exactLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          statusColor,
                        )}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {item.status.replace("_", " ").charAt(0).toUpperCase() +
                          item.status.replace("_", " ").slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {safeFormatDate(item.endOfWarranty)}
                      </div>
                      <div className={cn("text-xs mt-0.5", warrantyColor)}>
                        {warrantyStatus}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm"
                  >
                    Aucun équipement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
