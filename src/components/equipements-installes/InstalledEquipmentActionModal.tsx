import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertOctagon,
  RefreshCw,
  LogOut,
  ArrowRightLeft,
  FileText,
  Wrench,
  PowerOff,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { InstalledEquipment } from "./types";
import { CustomSelect } from "../ui/CustomSelect";

export type ActionType =
  | "panne"
  | "remplacement"
  | "retrait"
  | "transfert"
  | "document"
  | "maintenance"
  | "hors_service";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (action: ActionType) => void;
  action: ActionType;
  equipment: InstalledEquipment;
}

export function InstalledEquipmentActionModal({
  isOpen,
  onClose,
  onComplete,
  action,
  equipment,
}: ActionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // States for selects
  const [gravitePanne, setGravitePanne] = useState("");
  const [typePanne, setTypePanne] = useState("");
  const [motifRemplacement, setMotifRemplacement] = useState("");
  const [motifRetrait, setMotifRetrait] = useState("");
  const [siteTransfert, setSiteTransfert] = useState("");
  const [typeDoc, setTypeDoc] = useState("");
  const [typeMaintenance, setTypeMaintenance] = useState("");
  const [prioriteMaint, setPrioriteMaint] = useState("normale");

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setGravitePanne("");
      setTypePanne("");
      setMotifRemplacement("");
      setMotifRetrait("");
      setSiteTransfert("");
      setTypeDoc("");
      setTypeMaintenance("");
      setPrioriteMaint("normale");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onComplete(action);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  const getActionDetails = () => {
    switch (action) {
      case "panne":
        return {
          title: "Déclarer en panne",
          icon: AlertOctagon,
          color: "text-rose-600",
          bgColor: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
          submitColor: "bg-rose-600 hover:bg-rose-700",
        };
      case "remplacement":
        return {
          title: "Remplacer équipement",
          icon: RefreshCw,
          color: "text-indigo-600",
          bgColor: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
          submitColor: "bg-indigo-600 hover:bg-indigo-700",
        };
      case "retrait":
        return {
          title: "Retirer équipement",
          icon: LogOut,
          color: "text-amber-600",
          bgColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
          submitColor: "bg-amber-600 hover:bg-amber-700",
        };
      case "transfert":
        return {
          title: "Transférer emplacement",
          icon: ArrowRightLeft,
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
          submitColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "document":
        return {
          title: "Ajouter document",
          icon: FileText,
          color: "text-emerald-600",
          bgColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
          submitColor: "bg-emerald-600 hover:bg-emerald-700",
        };
      case "maintenance":
        return {
          title: "Planifier maintenance",
          icon: Wrench,
          color: "text-violet-600",
          bgColor: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
          submitColor: "bg-violet-600 hover:bg-violet-700",
        };
      case "hors_service":
        return {
          title: "Marquer hors service",
          icon: PowerOff,
          color: "text-slate-600",
          bgColor: "bg-slate-100 dark:bg-slate-800 text-slate-600",
          submitColor:
            "bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600",
        };
      default:
        return {
          title: "Action",
          icon: Wrench,
          color: "text-slate-600",
          bgColor: "bg-slate-100 text-slate-600",
          submitColor: "bg-indigo-600 hover:bg-indigo-700",
        };
    }
  };

  const { title, icon: Icon, bgColor, submitColor } = getActionDetails();

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                bgColor,
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {equipment.productName} • {equipment.serialNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Action enregistrée
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                La modification a été prise en compte avec succès.
              </p>
            </div>
          ) : (
            <form
              id="action-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* PANNE */}
              {action === "panne" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm shadow-transparent">
                        Date de la panne
                      </label>
                      <input
                        type="datetime-local"
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Gravité
                      </label>
                      <CustomSelect
                        className="w-full"
                        required
                        value={gravitePanne}
                        onChange={setGravitePanne}
                        options={[
                          { value: "mineure", label: "Mineure (pas d'impact opérationnel)" },
                          { value: "majeure", label: "Majeure (service dégradé)" },
                          { value: "critique", label: "Critique (arrêt total)" }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Type de panne
                    </label>
                    <CustomSelect
                      className="w-full"
                      required
                      value={typePanne}
                      onChange={setTypePanne}
                      options={[
                        { value: "materiel", label: "Défaut matériel" },
                        { value: "logiciel", label: "Bug / Plante logiciel" },
                        { value: "reseau", label: "Perte de réseau / signal" },
                        { value: "electrique", label: "Problème d'alimentation" },
                        { value: "autre", label: "Autre" }
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Technicien intervenant
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Jean Admin"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Description détaillée du problème
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Expliquez les symptômes et le contexte de la panne..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    ></textarea>
                  </div>
                </>
              )}

              {/* REMPLACEMENT */}
              {action === "remplacement" && (
                <>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800/80 mb-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Ancien équipement
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {equipment.productName}
                    </div>
                    <div className="font-mono text-xs mt-1 bg-slate-200 dark:bg-slate-800 inline-block px-1.5 py-0.5 rounded">
                      {equipment.serialNumber}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nouveau Numéro de série / MAC
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Scanner ou saisir..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800/50 outline-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Motif du remplacement
                      </label>
                      <CustomSelect
                        className="w-full z-10"
                        required
                        value={motifRemplacement}
                        onChange={setMotifRemplacement}
                        options={[
                          { value: "panne", label: "Panne irréparable" },
                          { value: "vetuste", label: "Vétusté programmée" },
                          { value: "evolution", label: "Évolution technique" },
                          { value: "casse", label: "Casse / Vandalisme" }
                        ]}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Technicien
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Lier un document (PV de remplacement)
                    </label>
                    <input
                      type="file"
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* RETRAIT */}
              {action === "retrait" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Date de retrait
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Motif
                    </label>
                    <CustomSelect
                      className="w-full"
                      required
                      value={motifRetrait}
                      onChange={setMotifRetrait}
                      options={[
                        { value: "fin_contrat", label: "Fin de contrat de service" },
                        { value: "changement", label: "Changement d'infrastructure" },
                        { value: "plus_besoin", label: "Plus de besoin réseau/physique" }
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Destination après retrait
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        "Retour Stock",
                        "Retour Fournisseur",
                        "Poubelle / Recyclage",
                      ].map((dest) => (
                        <label
                          key={dest}
                          className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <input
                            type="radio"
                            name="dest"
                            className="text-indigo-600 focus:ring-indigo-500"
                            required
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {dest}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Commentaire
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    ></textarea>
                  </div>
                </>
              )}

              {/* TRANSFERT */}
              {action === "transfert" && (
                <>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase">
                        Actuel
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white mt-1">
                        {equipment.siteName || equipment.clientName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {equipment.exactLocation}
                      </div>
                    </div>
                    <ArrowRightLeft className="w-5 h-5 text-slate-400" />
                    <div className="text-right">
                      <div className="text-xs font-semibold text-blue-500 uppercase">
                        Nouveau
                      </div>
                      <div className="font-medium text-slate-400 mt-1 uppercase text-xs">
                        À DÉFINIR
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Client
                      </label>
                      <CustomSelect
                        className="w-full z-20"
                        value={equipment.clientId}
                        onChange={() => {}}
                        options={[
                          { value: equipment.clientId, label: equipment.clientName }
                        ]}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Site
                      </label>
                      <CustomSelect
                        className="w-full z-10"
                        required
                        value={siteTransfert}
                        onChange={setSiteTransfert}
                        options={[
                          { value: "s1", label: "Siège principal" },
                          { value: "s2", label: "Annexe" },
                          { value: "s3", label: "Entrepôt logistique" }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nouvel Emplacement Exact
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Salle réunion RDC..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Date du transfert
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Technicien
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DOCUMENT */}
              {action === "document" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Type de document
                    </label>
                    <CustomSelect
                      className="w-full"
                      required
                      value={typeDoc}
                      onChange={setTypeDoc}
                      options={[
                        { value: "rapport", label: "Rapport d'intervention" },
                        { value: "pv", label: "PV de recette / d'installation" },
                        { value: "photo", label: "Photo / Plan d'ingénierie" },
                        { value: "garantie", label: "Certificat de garantie" },
                        { value: "autre", label: "Autre" }
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Fichier
                    </label>
                    <input
                      type="file"
                      required
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-300 hover:file:bg-slate-200 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nom / Description
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Description courte..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Date d'édition
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}

              {/* MAINTENANCE */}
              {action === "maintenance" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Date prévue
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Type de maintenance
                      </label>
                      <CustomSelect
                        className="w-full z-20"
                        required
                        value={typeMaintenance}
                        onChange={setTypeMaintenance}
                        options={[
                          { value: "preventive", label: "Maintenance préventive" },
                          { value: "curative", label: "Maintenance curative / Correction" },
                          { value: "maj", label: "Mise à jour firmware/logiciel" },
                          { value: "controle", label: "Contrôle de routine / Nettoyage" }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Technicien assigné
                      </label>
                      <input
                        type="text"
                        placeholder="Assignation (Optionnel)"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Priorité
                      </label>
                      <CustomSelect
                        className="w-full z-10"
                        required
                        value={prioriteMaint}
                        onChange={setPrioriteMaint}
                        options={[
                          { value: "basse", label: "Basse" },
                          { value: "normale", label: "Normale" },
                          { value: "haute", label: "Haute" },
                          { value: "urgente", label: "Urgente" }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Notes et objectifs
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Détailler l'intervention..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    ></textarea>
                  </div>
                </>
              )}

              {/* HORS SERVICE */}
              {action === "hors_service" && (
                <>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg mb-6">
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                      Vous êtes sur le point de marquer cet équipement comme
                      "Hors service".
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1">
                      L'équipement restera dans la base mais sera ignoré des
                      alertes garanties et de l'état du parc actif.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Date de mise hors service
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Justificatif rapide
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Casse totale, vétusté, non-renouvellement..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    ></textarea>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        {!isSuccess && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="action-form"
              disabled={isSubmitting}
              className={cn(
                "px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2",
                submitColor,
                isSubmitting && "opacity-70 cursor-not-allowed",
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Traitement...
                </>
              ) : (
                "Confirmer"
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// Dummy Check icon since it wasn't imported from lucide-react initially
const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
