import React, { useState, useRef, useEffect } from "react";
import { InstalledEquipment } from "./types";
import {
  InstalledEquipmentActionModal,
  ActionType,
} from "./InstalledEquipmentActionModal";
import {
  ArrowLeft,
  Server,
  Building2,
  Calendar,
  Activity,
  Settings,
  FileText,
  Clock,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  History,
  FileDigit,
  Download,
  AlertCircle,
  RefreshCw,
  LogOut,
  ArrowRightLeft,
  PowerOff,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { cn, safeFormatDate } from "../../lib/utils";

interface InstalledEquipmentFicheProps {
  data: InstalledEquipment;
  onBack: () => void;
  onUpdate: (equipment: InstalledEquipment) => void;
}

type TabType =
  | "resume"
  | "localisation"
  | "garanties"
  | "interventions"
  | "documents"
  | "historique";

export function InstalledEquipmentFiche({
  data,
  onBack,
  onUpdate,
}: InstalledEquipmentFicheProps) {
  const [activeTab, setActiveTab] = useState<TabType>("resume");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ActionType | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let StatusIcon = Activity;
  let statusColor =
    "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  let statusText = "Actif";

  switch (data.status) {
    case "actif":
      StatusIcon = CheckCircle2;
      statusColor =
        "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/20";
      statusText = "Actif";
      break;
    case "en_panne":
      StatusIcon = AlertOctagon;
      statusColor =
        "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800/20";
      statusText = "En panne";
      break;
    case "en_maintenance":
      StatusIcon = Wrench;
      statusColor =
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/20";
      statusText = "En maintenance";
      break;
    case "remplace":
      StatusIcon = ArrowLeft; // Assuming something
      statusColor =
        "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800/20";
      statusText = "Remplacé";
      break;
    case "retire":
    case "hors_service":
      StatusIcon = AlertTriangle;
      statusColor =
        "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
      statusText = "Hors service";
      break;
  }

  const now = new Date();
  const endDate = new Date(data.endOfWarranty);
  const isWarrantyExpired = now > endDate;
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);
  const isWarrantyExpiringSoon =
    !isWarrantyExpired && endDate <= threeMonthsFromNow;

  let warrantyStatusText = "Valide";
  let warrantyIconColor = "text-emerald-500";
  if (isWarrantyExpired) {
    warrantyStatusText = "Expirée";
    warrantyIconColor = "text-rose-500";
  } else if (isWarrantyExpiringSoon) {
    warrantyStatusText = "Expire bientôt";
    warrantyIconColor = "text-amber-500";
  }

  const sortedInterventions = [...(data.interventions || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const lastIntervention = sortedInterventions[0];
  const incidentCount = data.history.filter((h) => h.type === "panne").length;

  const handleActionComplete = (action: ActionType) => {
    const statusByAction: Partial<Record<ActionType, InstalledEquipment["status"]>> = {
      panne: "en_panne",
      maintenance: "en_maintenance",
      remplacement: "remplace",
      retrait: "retire",
      hors_service: "hors_service",
      transfert: "actif",
    };
    const eventType = action === "hors_service" || action === "retrait"
      ? "retrait"
      : action === "document"
        ? "document"
        : action;

    onUpdate({
      ...data,
      status: statusByAction[action] || data.status,
      exactLocation: action === "transfert" ? "Nouvel emplacement transféré" : data.exactLocation,
      history: [{
        id: `event-${Date.now()}`,
        date: new Date().toISOString(),
        type: eventType as any,
        description: `Action enregistrée : ${action.replace("_", " ")}`,
        user: "Technicien",
      }, ...(data.history || [])],
    });
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "resume", label: "Résumé", icon: FileDigit },
    { id: "localisation", label: "Localisation", icon: MapPin },
    { id: "garanties", label: "Garanties", icon: ShieldCheck },
    { id: "interventions", label: "Interventions / SAV", icon: Wrench },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "historique", label: "Historique", icon: History },
  ];

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30 shrink-0">
              <Server className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {data.productName}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-xs">
                  {data.serialNumber}
                </span>
                <span>•</span>
                <span>{data.clientName}</span>
                <span>•</span>
                <span>{data.siteName || "Site principal"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto ml-16 md:ml-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border shadow-sm",
              statusColor,
            )}
          >
            <StatusIcon className="w-4 h-4" />
            {statusText}
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              Options
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOptionsOpen && "rotate-180",
                )}
              />
            </button>
            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-1.5 text-slate-700 dark:text-slate-300">
                  <button
                    onClick={() => {
                      setModalAction("panne");
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-rose-600 dark:text-rose-400"
                  >
                    <AlertOctagon className="w-4 h-4" /> Déclarer en panne
                  </button>
                  <button
                    onClick={() => {
                      setModalAction("remplacement");
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-indigo-600 dark:text-indigo-400"
                  >
                    <RefreshCw className="w-4 h-4" /> Remplacer équipement
                  </button>
                  <button
                    onClick={() => {
                      setModalAction("retrait");
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-amber-500" /> Retirer
                    équipement
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setModalAction("transfert");
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-blue-500" />{" "}
                    Transférer emplacement
                  </button>
                  <button
                    onClick={() => {
                      setModalAction("maintenance");
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Wrench className="w-4 h-4 text-violet-500" /> Planifier
                    maintenance
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setModalAction("document");
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4 text-emerald-500" /> Ajouter
                    document
                  </button>
                  <button
                    onClick={() => {
                      setModalAction("hors_service");
                      setIsOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                  >
                    <PowerOff className="w-4 h-4" /> Marquer hors service
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contextual KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Statut
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {statusText}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
              isWarrantyExpired
                ? "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800/30"
                : isWarrantyExpiringSoon
                  ? "bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800/30"
                  : "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/30",
            )}
          >
            <ShieldCheck className={cn("w-5 h-5", warrantyIconColor)} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Garantie
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {warrantyStatusText}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30">
            <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dernière Inter
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {safeFormatDate(lastIntervention?.date)}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800/30">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Incidents
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {incidentCount} enregistré{incidentCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar flex-shrink-0">
        <div className="flex space-x-6 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300",
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {activeTab === "resume" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Produit Info */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Identification Produit
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Produit :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {data.productName}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    N° de Série :
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-900 dark:text-white font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                      {data.serialNumber}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Famille :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {data.family}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Marque :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {data.brand}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Modèle :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {data.model}
                  </div>
                </div>
              </div>
            </div>

            {/* Implantation Info */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Détails Implantation
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Client :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {data.clientName}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Site :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {data.siteName || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Installation :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {safeFormatDate(data.installationDate)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Technician :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {data.technician}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Fournisseur :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {data.supplier}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm">
                    Date d'achat :
                  </div>
                  <div className="col-span-2 text-slate-900 dark:text-white font-medium text-sm">
                    {safeFormatDate(data.purchaseDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "localisation" && (
          <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Fiche Localisation
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Emplacement physique précis de l'équipement
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Client Propriétaire
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {data.clientName}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Site / Établissement
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {data.siteName || "-"}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Adresse Physique
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <p className="font-medium text-slate-900 dark:text-white">
                    {data.address || "Adresse non renseignée"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Zone / Bâtiment
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg border-l-4 border-l-indigo-500">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {data.zone || "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Emplacement Exact
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg border-l-4 border-l-emerald-500">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {data.exactLocation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "garanties" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Couverture de Garantie
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Détails des périodes de garantie fournisseur et client.
                </p>
              </div>
              <div
                className={cn(
                  "px-4 py-2 rounded-lg font-bold border",
                  isWarrantyExpired
                    ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800/20"
                    : isWarrantyExpiringSoon
                      ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/20"
                      : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/20",
                )}
              >
                {warrantyStatusText.toUpperCase()}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fournisseur */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Garantie
                  Fournisseur
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Durée Initiale
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {data.supplierWarranty} mois
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Date de départ (Achat)
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {safeFormatDate(data.purchaseDate)}
                  </div>
                  <div className="col-span-2 mt-2">
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                      Conditions Fournisseur
                    </label>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      {data.warrantyConditions || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Garantie
                  Client
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Durée Allouée
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {data.clientWarranty} mois
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Date de départ (Inst.)
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {safeFormatDate(data.startOfWarranty)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Fin de couverture
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {safeFormatDate(data.endOfWarranty)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "interventions" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Registre des interventions SAV
              </h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                + Lier une intervention
              </button>
            </div>

            {!data.interventions || data.interventions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>Aucune intervention SAV enregistrée pour cet équipement.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {data.interventions.map((inter) => (
                  <div
                    key={inter.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <div className="flex items-center gap-3 mb-2 md:mb-0">
                        <span
                          className={cn(
                            "px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                            inter.type === "panne"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                              : inter.type === "maintenance"
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                          )}
                        >
                          {inter.type}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Le {safeFormatDate(inter.date)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Tech:{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {inter.technician}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">
                          Diagnostic
                        </p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">
                          {inter.diagnostic}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                          {inter.cost && (
                            <span className="text-xs font-bold text-slate-400">
                              {inter.cost} €
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">
                          Résultat / Action
                        </p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">
                          {inter.result}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Documents liés à l'équipement
              </h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition-colors">
                <FileText className="w-4 h-4" /> Uploader
              </button>
            </div>

            {data.documents.length === 0 ? (
              <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p>Aucun document (PV, Rapport, Photo) n'est attaché.</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileDigit className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {safeFormatDate(doc.date)} •{" "}
                        {doc.type.toUpperCase()}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "historique" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> Timeline du Cycle
              de Vie
            </h3>
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-8 pb-4">
              {data.history.map((event, index) => {
                let EventIcon = Activity;
                let iconColor = "text-slate-400";
                let bgColor = "bg-white dark:bg-slate-900";

                if (event.type === "installation") {
                  EventIcon = Wrench;
                  iconColor = "text-indigo-600 dark:text-indigo-400";
                  bgColor = "bg-indigo-50 dark:bg-indigo-900/50";
                }
                if (event.type === "panne") {
                  EventIcon = AlertOctagon;
                  iconColor = "text-rose-600 dark:text-rose-400";
                  bgColor = "bg-rose-50 dark:bg-rose-900/50";
                }
                if (
                  event.type === "maintenance" ||
                  event.type === "remplacement"
                ) {
                  EventIcon = Settings;
                  iconColor = "text-amber-600 dark:text-amber-400";
                  bgColor = "bg-amber-50 dark:bg-amber-900/50";
                }
                if (event.type === "document") {
                  EventIcon = FileText;
                  iconColor = "text-blue-600 dark:text-blue-400";
                  bgColor = "bg-blue-50 dark:bg-blue-900/50";
                }

                return (
                  <div key={event.id} className="relative pl-8 group">
                    <div
                      className={cn(
                        "absolute -left-[1.1rem] w-8 h-8 flex items-center justify-center border-2 border-white dark:border-slate-900 rounded-full shadow-sm transition-transform group-hover:scale-110",
                        bgColor,
                      )}
                    >
                      <EventIcon className={cn("w-4 h-4", iconColor)} />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                          {event.type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          {safeFormatDate(event.date)} à{" "}
                          {new Date(event.date).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {event.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        Action tracée par :{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {event.user}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {modalAction && (
        <InstalledEquipmentActionModal
          isOpen={!!modalAction}
          onClose={() => setModalAction(null)}
          onComplete={handleActionComplete}
          action={modalAction}
          equipment={data}
        />
      )}
    </div>
  );
}
