import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Save, WandSparkles, X } from "lucide-react";
import { InstalledEquipment } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: InstalledEquipment) => void;
}

const emptyForm = {
  projectName: "",
  clientName: "",
  siteName: "",
  address: "",
  zone: "",
  productName: "",
  productReference: "",
  family: "",
  brand: "",
  model: "",
  serialNumber: "",
  exactLocation: "",
  installationDate: "",
  technician: "",
  supplier: "",
};

export function InstalledEquipmentAddModal({ isOpen, onClose, onSave }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [projects, setProjects] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [projectNeeds, setProjectNeeds] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      Promise.all([
        fetch("/api/projects").then((r) => r.json()).catch(() => []),
        fetch("/api/products").then((r) => r.json()).catch(() => []),
        fetch("/api/project-needs").then((r) => r.json()).catch(() => []),
        fetch("/api/clients").then((r) => r.json()).catch(() => []),
      ]).then(([projectData, productData, needsData, clientData]) => {
        setProjects(Array.isArray(projectData) ? projectData : []);
        setProducts(Array.isArray(productData) ? productData : []);
        setProjectNeeds(Array.isArray(needsData) ? needsData : []);
        setClients(Array.isArray(clientData) ? clientData : []);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (field: keyof typeof emptyForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const fillDemo = () => {
    setForm({
      projectName: "Installation réseau - Hôtel Les Oliviers",
      clientName: "Hôtel Les Oliviers",
      siteName: "Bâtiment principal",
      address: "Tizi-Ouzou, site principal",
      zone: "Accueil",
      productName: "Caméra IP Hikvision",
      productReference: "CAM-HIK-EXT",
      family: "Vidéosurveillance",
      brand: "Hikvision",
      model: "DS-2CD2043G0-I",
      serialNumber: `HIK-DEMO-${Date.now().toString().slice(-4)}`,
      exactLocation: "Entrée principale, au-dessus de la réception",
      installationDate: new Date().toISOString().split("T")[0],
      technician: "Technicien démonstration",
      supplier: "DistriCam",
    });
  };

  const selectProject = (projectName: string) => {
    const project = projects.find((item) => item.name === projectName);
    setForm((current) => ({
      ...current,
      projectName,
      clientName: project?.clientName || current.clientName,
      siteName: project?.siteName || "Site principal",
      address: project ? "Adresse du site du projet" : current.address,
      productName: "",
      productReference: "",
      family: "",
      brand: "",
      model: "",
      supplier: "",
    }));
  };

  const selectProduct = (productName: string) => {
    const product = products.find((item) => item.name === productName)
      || linkedProducts.find((item) => item.name === productName);
    setForm((current) => ({
      ...current,
      productName,
      productReference: product?.reference || current.productReference,
      family: product?.family || current.family,
      brand: product?.brand || current.brand,
      model: product?.model || current.model,
      supplier: product?.supplierName || current.supplier,
    }));
  };

  const selectedProject = projects.find((project) => project.name === form.projectName);
  const selectedNeed = projectNeeds.find((need) =>
    need.projectId === selectedProject?.id || need.projectName === form.projectName
  );
  const linkedProducts = (selectedNeed?.products || []).map((needProduct: any) => {
    const catalogProduct = products.find((product) =>
      product.id === needProduct.productId || product.reference === needProduct.reference
    );
    return {
      ...catalogProduct,
      id: needProduct.productId || catalogProduct?.id || needProduct.id,
      name: needProduct.label || catalogProduct?.name,
      reference: needProduct.reference || catalogProduct?.reference,
    };
  });

  const save = () => {
    if (!form.projectName || !form.clientName || !form.productName || !form.exactLocation) return;
    const today = form.installationDate || new Date().toISOString().split("T")[0];
    const warrantyEnd = new Date(today);
    warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 3);

    onSave({
      id: `eq-${Date.now()}`,
      clientId: `client-${Date.now()}`,
      clientName: form.clientName,
      siteId: `site-${Date.now()}`,
      siteName: form.siteName,
      address: form.address,
      zone: form.zone,
      productId: `product-${Date.now()}`,
      productName: form.productName,
      productReference: form.productReference || "REF-DEMO",
      family: form.family || "Équipement",
      brand: form.brand || "Non renseignée",
      model: form.model || "Non renseigné",
      serialNumber: form.serialNumber || "Non sérialisé",
      exactLocation: form.exactLocation,
      status: "actif",
      installationDate: today,
      supplierWarranty: 36,
      clientWarranty: 36,
      startOfWarranty: today,
      endOfWarranty: warrantyEnd.toISOString(),
      technician: form.technician || "Technicien",
      supplier: form.supplier || "Non renseigné",
      purchaseDate: today,
      history: [{
        id: `history-${Date.now()}`,
        date: today,
        type: "installation",
        description: `Équipement installé à l'emplacement : ${form.exactLocation}`,
        user: form.technician || "Technicien",
      }],
      documents: [],
      interventions: [],
    });
  };

  const fields: Array<[keyof typeof emptyForm, string, string]> = [
    ["address", "Adresse", "Adresse du site"],
    ["productReference", "Référence produit", "CAM-001"],
    ["model", "Modèle", "DS-2CD..."],
    ["serialNumber", "Numéro de série", "S/N"],
    ["exactLocation", "Emplacement exact *", "Entrée principale..."],
    ["installationDate", "Date d'installation", ""],
  ];

  const selectFields: Array<[keyof typeof emptyForm, string, string[]]> = [
    ["clientName", "Client *", clients.map((item) => item.name)],
    ["siteName", "Site client", ["Site principal", "Bâtiment principal", "Parking", "Salle serveur"]],
    ["zone", "Zone", ["Accueil", "Extérieur", "Salle serveur", "Parking", "Bureau"]],
    ["family", "Famille", ["Vidéosurveillance", "Réseau", "Sécurité", "Téléphonie", "Serveur"]],
    ["brand", "Marque", ["Hikvision", "Cisco", "Dell", "APC", "Ubiquiti"]],
    ["technician", "Technicien", ["Technicien démonstration", "Marc Dubois", "Karim Benali", "Sofiane Kaci"]],
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden bg-white rounded-xl border border-slate-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ajouter un équipement installé</h2>
            <p className="text-sm text-slate-500">Enregistrer le matériel et son emplacement exact chez le client.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fillDemo} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100">
              <WandSparkles className="w-4 h-4" /> Remplissage démo
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="md:col-span-2">
            <span className="block mb-1 text-sm font-medium text-slate-700">Projet client *</span>
            <select value={form.projectName} onChange={(event) => selectProject(event.target.value)} className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sélectionner un projet existant</option>
              {projects.map((project) => <option key={project.id} value={project.name}>{project.reference} - {project.name}</option>)}
              {projects.length === 0 && <option value="Installation réseau - Hôtel Les Oliviers">Projet démonstration</option>}
            </select>
          </label>

          <label className="md:col-span-2">
            <span className="block mb-1 text-sm font-medium text-slate-700">Produit installé *</span>
            <select value={form.productName} onChange={(event) => selectProduct(event.target.value)} className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sélectionner un produit</option>
              {linkedProducts.map((product: any) => <option key={product.id} value={product.name}>{product.reference} - {product.name}</option>)}
            </select>
            {form.projectName && linkedProducts.length === 0 && (
              <span className="block mt-1 text-xs text-amber-600">Aucun besoin produit enregistré pour ce projet.</span>
            )}
          </label>

          {selectFields.map(([field, label, options]) => (
            <label key={field}>
              <span className="block mb-1 text-sm font-medium text-slate-700">{label}</span>
              <select value={form[field]} onChange={(event) => update(field, event.target.value)} className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Sélectionner</option>
                {Array.from(new Set(options.filter(Boolean))).map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          ))}

          {fields.map(([field, label, placeholder]) => (
            <label key={field} className={field === "exactLocation" ? "md:col-span-2" : ""}>
              <span className="block mb-1 text-sm font-medium text-slate-700">{label}</span>
              <input
                type={field === "installationDate" ? "date" : "text"}
                value={form[field]}
                onChange={(event) => update(field, event.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg">Annuler</button>
          <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            <Save className="w-4 h-4" /> Enregistrer l'équipement
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
