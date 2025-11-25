"use client";

import React, { useState, useCallback } from 'react';
import { UploadCloud, XCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

// --- CONFIGURACIÓN DE COLORES ---
const AZUL_UNISON = "#16469B";
const DORADO_UNISON = "#FFD100";

// --- TIPOS ---
type ModalType = 'none' | 'preview' | 'success' | 'error_file' | 'error_format' | 'loading';

export default function SubirCalificacionesPage() {
  const [modal, setModal] = useState<ModalType>('none');
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploadStats, setUploadStats] = useState({ actualizados: 0, errores: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  // --- PROCESAR ARCHIVO CLIENT SIDE ---
  const processFile = useCallback((file: File) => {
    console.log("====== INICIANDO PROCESO DEL ARCHIVO ======");
    console.log("Archivo recibido:", file);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    console.log("Validación de extensión:", isExcel);

    if (!isExcel) {
      console.log("ERROR: Formato inválido");
      setErrorMessage("El formato del archivo no es válido. Solo .xlsx o .xls");
      setModal('error_format');
      return;
    }

    setFileName(file.name);
    setFileToUpload(file);
    setModal('loading');

    const reader = new FileReader();

    reader.onload = (e) => {
      console.log("Archivo leído en memoria correctamente.");

      try {
        const data = e.target?.result;

        console.log("Leyendo workbook XLSX...");
        const workbook = XLSX.read(data, { type: 'binary' });

        console.log("Hojas encontradas:", workbook.SheetNames);

        const sheetName = workbook.SheetNames[0];
        console.log("Usando hoja:", sheetName);

        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        console.log("JSON generado desde Excel:", jsonData);

        if (jsonData.length === 0) {
          console.log("ERROR: Archivo sin registros");
          setErrorMessage("El archivo está vacío o no tiene datos legibles.");
          setModal('error_format');
          return;
        }

        console.log("ÉXITO: Datos cargados. Total registros:", jsonData.length);
        setPreviewData(jsonData);
        setModal('preview');

      } catch (error) {
        console.error("ERROR INTERNO LEYENDO ARCHIVO:", error);
        setErrorMessage("Ocurrió un error al leer el archivo internamente.");
        setModal('error_file');
      }
    };

    reader.onerror = (err) => {
      console.error("ERROR en FileReader:", err);
      setErrorMessage("No se pudo leer el archivo.");
      setModal('error_file');
    };

    reader.readAsBinaryString(file);
  }, []);

  // --- ENVÍO AL SERVIDOR ---
  const handleConfirmUpload = async () => {
    console.log("====== ENVIANDO AL SERVIDOR ======");

    if (!fileToUpload) {
      console.log("ERROR: fileToUpload es null");
      return;
    }

    setModal('loading');

    try {
      const formData = new FormData();
      formData.append('excel', fileToUpload);

      console.log("Realizando petición POST a /api/upload-calificaciones");

      const response = await fetch('/api/upload-calificaciones', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      console.log("Respuesta del servidor:", result);

      if (!response.ok) {
        console.log("ERROR desde el servidor:", result);
        throw new Error(result.mensaje || 'Error en el servidor');
      }

      console.log("ÉXITO: Datos actualizados:", result);

      setUploadStats({
        actualizados: result.totalActualizados || 0,
        errores: result.totalErrores || 0
      });

      setModal('success');

    } catch (error: any) {
      console.error("ERROR en upload:", error);
      setErrorMessage(error.message || "Error al conectar con el servidor.");
      setModal('error_file');
    }
  };

  // --- MANEJO DRAG & DROP ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) processFile(files[0]);
    e.target.value = '';
  };

  // --- MODAL ---
  const Modal = ({ type, title, message, children, onConfirm }: any) => {
    let icon, color;
    switch (type) {
      case 'success': icon = <CheckCircle className="w-10 h-10" />; color = 'text-green-600'; break;
      case 'error': icon = <XCircle className="w-10 h-10" />; color = 'text-red-600'; break;
      case 'alert': icon = <AlertTriangle className="w-10 h-10" />; color = 'text-yellow-600'; break;
      case 'loading': icon = <Loader2 className="w-10 h-10 animate-spin" />; color = 'text-blue-600'; break;
      default: icon = <AlertTriangle className="w-10 h-10" />; color = 'text-gray-600';
    }

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className={`text-xl font-semibold flex items-center gap-2 ${color}`}>
              {icon} {title}
            </h3>
            {type !== 'loading' && (
              <button onClick={() => setModal('none')} className="text-gray-400 hover:text-gray-600 transition">
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-4">{message}</p>
            {children}
          </div>

          {type !== 'loading' && (
            <div className="p-4 flex justify-end border-t">
              {title.includes('Vista previa') ? (
                <>
                  <button onClick={() => setModal('none')} className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                  <button onClick={onConfirm} className="px-6 py-2 text-white font-semibold rounded-lg transition" style={{ backgroundColor: DORADO_UNISON }}>Confirmar Carga</button>
                </>
              ) : (
                <button onClick={onConfirm} className="px-6 py-2 text-white font-semibold rounded-lg transition" style={{ backgroundColor: AZUL_UNISON }}>Aceptar</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- MODALES ---
  const renderModal = () => {
    switch (modal) {
      case 'loading':
        return <Modal type="loading" title="Procesando..." message="Por favor espere mientras procesamos el archivo." />;

      case 'preview': {
        const headers = previewData.length > 0 ? Object.keys(previewData[0]) : [];

        return (
          <Modal
            type="alert"
            title="Vista previa del archivo"
            message={`Archivo: ${fileName}. Registros detectados: ${previewData.length}.`}
            onConfirm={handleConfirmUpload}
          >
            <div className="border rounded-lg bg-white shadow-inner max-h-80 overflow-auto">
              <table className="min-w-max w-full border-collapse text-sm">
                <thead className="bg-gray-100 sticky top-0 shadow">
                  <tr>
                    {headers.map(header => (
                      <th key={header} className="px-4 py-2 text-left border-b font-semibold text-gray-700">{header}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {previewData.slice(0, 100).map((row, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      {headers.map(h => (
                        <td key={`${index}-${h}`} className="px-4 py-2 border-b whitespace-nowrap text-gray-800">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.length > 100 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Mostrando solo los primeros 100 registros...
              </p>
            )}
          </Modal>
        );
      }

      case 'success':
        return (
          <Modal
            type="success"
            title="Carga Exitosa"
            message={`Registros actualizados: ${uploadStats.actualizados}. Errores: ${uploadStats.errores}.`}
            onConfirm={() => { setModal('none'); setFileName(''); setPreviewData([]); }}
          />
        );

      case 'error_file':
      case 'error_format':
        return (
          <Modal
            type="error"
            title="Error en la carga"
            message={errorMessage}
            onConfirm={() => setModal('none')}
          />
        );

      default:
        return null;
    }
  };

  // --- UI PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-100/50 p-8 pt-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-4" style={{ color: AZUL_UNISON }}>
          Subir Calificaciones por Grupo
        </h1>

        <p className="text-gray-700 mb-6 max-w-2xl">
          Seleccione el archivo Excel. Debe contener las columnas requeridas (matricula, codigo_materia, calificacion, etc).
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-4 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer max-w-md mx-auto ${
            isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-500'
          }`}
          style={{ borderColor: AZUL_UNISON }}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <UploadCloud className="w-16 h-16 mx-auto mb-4" style={{ color: AZUL_UNISON }} />
          <p className="text-lg font-medium text-gray-700">
            Arrastra tu archivo aquí <br /> o haz click para seleccionarlo
          </p>

          <input
            type="file"
            id="file-upload-input"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
          />

          <button
            type="button"
            className="mt-6 px-8 py-3 font-semibold rounded-lg shadow-md transition-colors hover:shadow-lg"
            style={{ backgroundColor: DORADO_UNISON, color: AZUL_UNISON }}
          >
            Cargar
          </button>
        </div>

        <div className="flex justify-center mt-8">
          <button
            className="px-8 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-sm"
            onClick={() => { setModal('none'); setFileName(''); }}
          >
            Cancelar
          </button>
        </div>

        {renderModal()}
      </div>
    </div>
  );
}
