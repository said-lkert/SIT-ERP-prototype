import React, { useEffect, useState } from "react";
import { InstalledEquipmentsDashboard } from "./InstalledEquipmentsDashboard";
import { InstalledEquipmentFiche } from "./InstalledEquipmentFiche";
import { mockInstalledEquipments } from "./mockData";
import { InstalledEquipment } from "./types";
import { InstalledEquipmentAddModal } from "./InstalledEquipmentAddModal";

export function InstalledEquipmentsModule() {
  const [equipments, setEquipments] =
    useState<InstalledEquipment[]>(() => {
      try {
        const saved = localStorage.getItem("sit-erp-installed-equipments");
        return saved ? JSON.parse(saved) : mockInstalledEquipments;
      } catch {
        return mockInstalledEquipments;
      }
    });
  const [selectedEquipment, setSelectedEquipment] =
    useState<InstalledEquipment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sit-erp-installed-equipments", JSON.stringify(equipments));
  }, [equipments]);

  return (
    <div className="h-full w-full p-4 md:p-8 bg-slate-50 dark:bg-slate-900">
      {selectedEquipment ? (
        <InstalledEquipmentFiche
          data={selectedEquipment}
          onBack={() => setSelectedEquipment(null)}
          onUpdate={(updated) => {
            setEquipments((current) => current.map((item) => item.id === updated.id ? updated : item));
            setSelectedEquipment(updated);
          }}
        />
      ) : (
        <InstalledEquipmentsDashboard
          data={equipments}
          onSelectEquipment={setSelectedEquipment}
          onAddClick={() => setIsAddModalOpen(true)}
        />
      )}
      <InstalledEquipmentAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(equipment) => {
          setEquipments((current) => [equipment, ...current]);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
