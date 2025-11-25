"use client";

import { useState, useMemo } from "react";
// Importaciones de componentes de UI
import ImageAdjustmentPage from "../../components/ui/ImageAdjustmentPage";
import ImageUploadAndAdjustModal from "../../components/ui/ImageUploadAndAdjustModal";
// Importación del nuevo modal de éxito
import SuccessConfirmationModal from "../../components/ui/SuccessConfirmationModal";

// NOTA: Si SectionTitle no existe en el proyecto, esta definición lo simula.
const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold mb-4 border-b-2 pb-1" style={{ borderColor: "#16469B", color: "#16469B" }}>
        {title}
    </h2>
);

// Colores institucionales
const AZUL_MARINO = "#16469B";
const GRIS_CLARO = "#D8D8D8";

// Simulación de los datos del perfil del usuario
const InitialUserProfile = {
    phone: "6622399230",
};

export default function PerfilPage() {
  // 📸 ESTADOS DE IMAGEN
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoPending, setIsPhotoPending] = useState(false);

  // 🟢 ESTADOS DEL MODAL DE ÉXITO (NUEVOS)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [userProfile, setUserProfile] = useState(InitialUserProfile);

  // Edición de Teléfono
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [draftPhone, setDraftPhone] = useState(userProfile.phone);

  // 🔒 Edición de Contraseña
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Lógica para detectar si hay cambios sin guardar
  const hasPhoneChanged = draftPhone !== userProfile.phone;

  // Validación de formulario de contraseña
  const isPasswordFormValid = isEditingPassword && currentPassword && newPassword && confirmPassword && (newPassword === confirmPassword) && newPassword.length >= 6;

  // Determina si se debe mostrar el bloque de guardar cambios global (Confirmar/Cancelar)
  const hasUnsavedChanges = useMemo(() => {
    return hasPhoneChanged || isPhotoPending;
  }, [hasPhoneChanged, isPhotoPending]);


  // --- MANEJO DE LA FOTO DE PERFIL ---

  const handleFileSelected = (file: File) => {
    // 1. Guarda el archivo temporalmente (esto dispara el renderizado de ImageAdjustmentPage)
    setTempFile(file);
    // 2. Cierra el modal de pre-carga
    setIsModalOpen(false);
  };

  const handleSavePhoto = (finalFile: File) => {
    console.log("Foto final ajustada y lista para subir:", finalFile);
    // 1. Elimina la vista de ajuste
    setTempFile(null);
    // 2. Marca que hay una foto pendiente de confirmar con el botón global
    setIsPhotoPending(true);
    console.log(`Simulación: La foto está lista para ser subida con el botón 'Confirmar'.`);
  };

  const handleCancelAdjustment = () => {
    // Cancela la foto y regresa a la vista de perfil
    setTempFile(null);
  };


  // --- MANEJO DEL FORMULARIO DE CONTRASEÑA ---

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordFormValid) return;

    // Simulación de API OK
    console.log("¡Contraseña actualizada con éxito! (Simulación de API OK)");

    // 1. Simulación de cierre y limpieza del formulario
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);

    // 2. Abrir Modal de Éxito con mensaje de contraseña (NUEVO)
    setSuccessMessage("La contraseña ha sido actualizada con éxito.");
    setIsSuccessModalOpen(true);
  };

  // Lógica de guardar (Confirmar cambios)
  const handleSaveChanges = () => {
    let successMsg = "Cambios guardados con éxito.";

    if (hasPhoneChanged) {
        setUserProfile(prev => ({ ...prev, phone: draftPhone }));
        console.log(`Teléfono actualizado a: ${draftPhone} (Simulación de API OK)`);
    }

    if (isPhotoPending) {
        // En una app real: Subir la imagen y actualizar photoUrl con la nueva URL
        console.log("Subiendo la nueva foto de perfil... (Simulación de API OK)");
        successMsg = "Los cambios de perfil y la foto se han guardado con éxito.";
    }

    // Resetear estados de cambio (hace que hasUnsavedChanges sea FALSE)
    setIsPhotoPending(false);
    setIsEditingPhone(false);

    // Abrir Modal de Éxito (NUEVO)
    setSuccessMessage(successMsg);
    setIsSuccessModalOpen(true);

    console.log("¡Cambios guardados con éxito!");
  };

  // Lógica de cancelar (Descartar cambios)
  const handleDiscardChanges = () => {
    // Revertir estados de borrador al estado guardado
    setDraftPhone(userProfile.phone);
    setIsEditingPhone(false);

    // Revertir estados de foto
    setIsPhotoPending(false);
    setTempFile(null);
    setIsModalOpen(false);

    // Resetear formulario de contraseña si estaba abierto
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);

    console.log("Cambios descartados.");
  };

  // 🚨 RENDERIZADO CONDICIONAL 1: Si hay un archivo temporal seleccionado,
  // mostramos la página de ajuste (Prioridad máxima)
  if (tempFile) {
    return (
      <ImageAdjustmentPage
        file={tempFile}
        onSave={handleSavePhoto}
        onCancel={handleCancelAdjustment}
      />
    );
  }

  // --- Renderizado de la Vista de Perfil ---
  return (
    <div className="py-8 px-4 md:px-8 max-w-6xl mx-auto">

      {/* ⚠️ RENDERIZADO CONDICIONAL 2: El Modal de Carga de Imagen */}
      <ImageUploadAndAdjustModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileSelected={handleFileSelected}
      />

      {/* 💚 RENDERIZADO CONDICIONAL 3: El Modal de Éxito (NUEVO) */}
      <SuccessConfirmationModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title="Actualización Completa"
          message={successMessage}
      />

      {/* ℹ️ Contenedor de Información Personal */}
      <div className="flex flex-col md:flex-row gap-12 items-start">

        {/* 👤 Foto de Perfil */}
        <div className="flex flex-col items-center w-full md:w-auto">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: AZUL_MARINO }}
          >
            {/* SVG del Ícono de Perfil Grande */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-24 h-24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          {/* ✅ Botón/Enlace que abre el Modal para la foto */}
          <button
            onClick={() => setIsModalOpen(true)} // ¡Activado de nuevo!
            className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1 mt-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Cambiar foto de perfil {isPhotoPending && <span className="text-red-500 text-xs">(Pendiente)</span>}
          </button>
        </div>

        {/* 📋 Detalles de Información Personal */}
        <div className="flex-grow w-full md:w-auto">
          <SectionTitle title="Información Personal" />
          <div className="space-y-1 text-gray-700 font-sans pl-2">
            <p className="font-semibold uppercase text-xs" style={{ color: AZUL_MARINO }}>Universidad de Sonora</p>
            <p>Nombre: <span className="font-medium">Ochoa Hernandez José Luis</span></p>
            <p>Clave: <span className="font-medium">316390</span></p>
            <p>Correo institucional: <span className="font-medium">joseluis.ochoa@unison.mx</span></p>
            <p>Puesto: <span className="font-medium">Maestro de tiempo completo</span></p>
            <p>Campus: <span className="font-medium">Hermosillo</span></p>

            {/* Campo de Teléfono Editable */}
            <div className="flex items-center gap-2">
                {/* Icono de teléfono */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Teléfono de trabajo:

                {isEditingPhone ? (
                    // MODO EDICIÓN
                    <>
                        <input
                            type="tel"
                            value={draftPhone}
                            onChange={(e) => setDraftPhone(e.target.value)}
                            className={`font-medium border ${hasPhoneChanged ? 'border-yellow-500' : 'border-gray-300'} rounded px-1`}
                        />
                        {/* Botones de acción para el campo de edición */}
                        {hasPhoneChanged && (
                            <button onClick={() => { setIsEditingPhone(false); setDraftPhone(userProfile.phone); }} className="text-sm text-red-500 hover:text-red-700 transition">
                                X
                            </button>
                        )}
                    </>
                ) : (
                    // MODO LECTURA
                    <span className={`font-medium ${hasPhoneChanged ? 'text-yellow-700' : 'text-blue-600'}`}>{userProfile.phone}</span>
                )}

                {/* Botón de editar teléfono (solo si no está editando) */}
                {!isEditingPhone && (
                    <button onClick={() => setIsEditingPhone(true)} className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                )}
            </div>

          </div>
        </div>
      </div>

      <hr className="my-8" />

      {/* 🔒 Seguridad de Cuenta */}
      <div className="mt-8">
        <SectionTitle title="Seguridad de Cuenta" />
        <div className="space-y-2 text-gray-700 font-sans pl-2">
            <p className="text-sm">Última fecha/hora de inicio de sesión: <span className="font-medium">14/09/2025 a las 15:59 hrs.</span></p>

            {/* Botón de editar contraseña */}
            <div className="flex flex-col">
                <button
                    onClick={() => setIsEditingPassword(prev => !prev)}
                    className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1 w-fit"
                >
                    {/* Icono de lápiz (editar) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Cambiar contraseña
                </button>

                {/* 🔑 FORMULARIO DE EDICIÓN DE CONTRASEÑA (Condicional) */}
                {isEditingPassword && (
                    <form onSubmit={handleUpdatePassword} className="mt-4 space-y-3 p-4 max-w-lg">

                        {/* Contraseña Actual */}
                        <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">Contraseña actual:</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-2/3 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* Nueva Contraseña */}
                        <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">Contraseña nueva:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-2/3 p-2 border rounded focus:ring-blue-500 ${newPassword.length > 0 && newPassword.length < 6 ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">Contraseña nueva:</label> {/* Se repite el label por diseño de la imagen original */}
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-2/3 p-2 border rounded focus:ring-blue-500 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                                required
                            />
                            {/* Etiqueta de Confirmación lateral, como en la imagen */}
                            <span className="ml-3 text-sm text-gray-500 hidden md:inline">Confirmación</span>
                        </div>

                        <div className="flex justify-start pt-2">
                            <button
                                type="submit"
                                disabled={!isPasswordFormValid}
                                className={`px-4 py-2 rounded font-medium text-white transition ${isPasswordFormValid ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}
                                style={{ backgroundColor: AZUL_MARINO }}
                            >
                                Actualizar
                            </button>
                        </div>

                        {/* Mensajes de error simples */}
                        {(newPassword.length > 0 && newPassword.length < 6) && (
                            <p className="text-red-500 text-xs mt-1">La nueva contraseña debe tener al menos 6 caracteres.</p>
                        )}
                        {(confirmPassword && newPassword !== confirmPassword) && (
                            <p className="text-red-500 text-xs mt-1">La confirmación no coincide con la nueva contraseña.</p>
                        )}
                    </form>
                )}
            </div>
        </div>
      </div>

      {/* 4. BLOQUE DE GUARDAR CAMBIOS (Aparece condicionalmente) */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-2xl border-t border-gray-200 flex justify-end items-center z-50">
            <div className="mr-8 text-gray-700 font-medium text-sm">
                ¿Desea guardar los cambios realizados?
            </div>
            <button
                onClick={handleDiscardChanges}
                className={`px-6 py-2 rounded font-medium text-gray-700 hover:bg-gray-200 transition mr-3`}
                style={{ backgroundColor: GRIS_CLARO }}
            >
                Cancelar
            </button>
            <button
                onClick={handleSaveChanges}
                className={`px-6 py-2 rounded font-medium text-white transition hover:opacity-90`}
                style={{ backgroundColor: AZUL_MARINO }}
            >
                Confirmar
            </button>
        </div>
      )}

    </div>
  );
}