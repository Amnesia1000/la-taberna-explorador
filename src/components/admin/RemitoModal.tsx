"use client";

import { useState, useEffect, useRef } from "react";
import { X, FileSignature, RotateCcw, Download, Check, AlertCircle, Puzzle, UserCheck, UserPlus } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import { GameWithComponents, UserData } from "@/types";
import { formatOthersDescription } from "@/lib/utils";
import { getUsers, createUser } from "@/lib/actions/users";

interface RemitoModalProps {
  games: GameWithComponents[];
  initialGameId?: string;
  onClose: () => void;
}

async function getBase64FromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}

async function getCompressedQrBase64(rawUrl?: string | null): Promise<string | null> {
  if (!rawUrl || !rawUrl.trim()) return null;
  const target = rawUrl.trim();

  let sourceDataUrl: string | null = null;

  if (target.startsWith("data:image")) {
    sourceDataUrl = target;
  } else {
    // Intentar obtener la imagen original directa por si es un QR personalizado subido por el usuario
    const directBase64 = await getBase64FromUrl(target);
    if (directBase64 && directBase64.startsWith("data:image")) {
      sourceDataUrl = directBase64;
    } else {
      // Fallback: Generar QR de alta resolución si es una URL web
      sourceDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(target)}`;
    }
  }

  // Redimensionar a 600x600 a alta fidelidad (preserva logos, colores y detalles personalizados)
  // exportando a JPEG 0.90 para lograr un peso controlado de ~200KB - 400KB
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 0, 0, 600, 600);
        resolve(canvas.toDataURL("image/jpeg", 0.90));
      } else {
        resolve(sourceDataUrl);
      }
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}

export default function RemitoModal({
  games,
  initialGameId,
  onClose,
}: RemitoModalProps) {
  const [selectedGameId, setSelectedGameId] = useState<string>(
    initialGameId || (games[0]?.id ?? "")
  );

  const selectedGame = games.find((g) => g.id === selectedGameId);

  // Expansions selected for this remito
  const [selectedExpansionsForRemito, setSelectedExpansionsForRemito] = useState<string[]>([]);

  // Registered users state
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Client Information
  const [clientData, setClientData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    phone: "",
    email: "",
    address: "",
  });

  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [returnDate, setReturnDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const [notes, setNotes] = useState<string>(
    "Componentes revisados y contados en presencia del cliente al momento de la entrega."
  );

  const [generating, setGenerating] = useState(false);
  const [signatureError, setSignatureError] = useState(false);

  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    getUsers().then((res) => {
      if (res.success && res.data) {
        setRegisteredUsers(res.data as unknown as UserData[]);
      }
    });
  }, []);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (!userId) return;

    const found = registeredUsers.find((u) => u.id === userId);
    if (found) {
      setClientData((prev) => ({
        ...prev,
        firstName: found.firstName || "",
        lastName: found.lastName || "",
        email: found.email || "",
        phone: found.phone || "",
        address: found.address || "",
      }));
    }
  };

  const handleClearSignature = () => {
    sigCanvasRef.current?.clear();
    setSignatureError(false);
  };

  const handleGeneratePdf = async () => {
    if (!selectedGame) return;

    if (!clientData.firstName || !clientData.lastName) {
      alert("Por favor ingresa al menos el Nombre y Apellido del cliente.");
      return;
    }

    if (sigCanvasRef.current?.isEmpty()) {
      setSignatureError(true);
      return;
    }

    setGenerating(true);

    try {
      // Auto-crear usuario si completó todos los campos obligatorios y no existe aún
      if (
        clientData.firstName.trim() &&
        clientData.lastName.trim() &&
        clientData.email.trim() &&
        clientData.phone.trim() &&
        clientData.address.trim()
      ) {
        const exists = registeredUsers.some(
          (u) => u.email.toLowerCase() === clientData.email.trim().toLowerCase()
        );
        if (!exists) {
          try {
            await createUser({
              firstName: clientData.firstName.trim(),
              lastName: clientData.lastName.trim(),
              email: clientData.email.trim(),
              phone: clientData.phone.trim(),
              address: clientData.address.trim(),
            });
          } catch (err) {
            console.warn("No se pudo autocrear el cliente en DB:", err);
          }
        }
      }

      // Fetch QRs para Manual y Video
      const [manualQrBase64, videoQrBase64] = await Promise.all([
        getCompressedQrBase64(selectedGame.qrManual),
        getCompressedQrBase64(selectedGame.qrVideo),
      ]);

      // Expansiones seleccionadas
      const selectedExpObjects = (selectedGame.expansions || []).filter((exp) =>
        selectedExpansionsForRemito.includes(exp.id)
      );

      // Signature data URL
      const signatureImage = sigCanvasRef.current?.toDataURL("image/png");

      // Initialize jsPDF with compression enabled
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const remitoCode = `REM-${Date.now().toString().slice(-6)}`;

      // 1. Header (Wireframe clean high-contrast)
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(15, 12, 180, 18, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("courier", "bold");
      doc.setFontSize(13);
      doc.text("TABERNA // REMITO DE ENTREGA DIGITAL", 20, 20);

      doc.setFontSize(8.5);
      doc.setFont("courier", "normal");
      doc.text(`FOLIO: ${remitoCode} | FECHA: ${deliveryDate}`, 20, 26);

      // 2. Client & Rental Details Box (Compact 2-line layout)
      doc.setTextColor(15, 23, 42);
      doc.setDrawColor(203, 213, 225);
      doc.rect(15, 33, 180, 22);

      doc.setFont("courier", "bold");
      doc.setFontSize(9);
      doc.text("DATOS DEL CLIENTE Y PERÍODO DE ALQUILER", 20, 38);

      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      const clientNamePhone = `Cliente: ${clientData.firstName} ${clientData.lastName} ${clientData.dni ? `(DNI: ${clientData.dni})` : ""} | Teléfono: ${clientData.phone || "No especificado"}`;
      doc.text(clientNamePhone, 20, 44);

      const datesStr = `Fecha Retiro: ${deliveryDate} | Fecha Pactada Devolución: ${returnDate}`;
      doc.text(datesStr, 20, 50);

      // 3. Game & Components Inventory Box
      const inventoryBoxY = 58;
      let currentY = inventoryBoxY + 6;

      const expNamesStr = selectedExpObjects.map((e) => e.name).join(", ");
      const headerTitle = selectedExpObjects.length > 0
        ? `JUEGO ENTREGADO: ${selectedGame.name.toUpperCase()} (+ EXP: ${expNamesStr.toUpperCase()})`
        : `JUEGO ENTREGADO: ${selectedGame.name.toUpperCase()}`;

      doc.setFont("courier", "bold");
      doc.setFontSize(9);
      doc.text(headerTitle, 20, currentY);
      
      currentY += 5;
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.text(`Categoría: ${selectedGame.category} | Tarifa Base: $${selectedGame.price.toLocaleString("es-AR")}`, 20, currentY);

      currentY += 3.5;
      doc.line(20, currentY, 190, currentY);
      
      currentY += 4.5;
      doc.setFont("courier", "bold");
      doc.setFontSize(8.5);
      doc.text("DETALLE DE PIEZAS VERIFICADAS AL MOMENTO DE LA ENTREGA:", 20, currentY);

      const comp = selectedGame.components;
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      currentY += 6;
      doc.text(`- Cartas / Mazos:  ${comp?.cards ?? 0} unid.`, 25, currentY);
      doc.text(`- Fichas / Tokens: ${comp?.tokens ?? 0} unid.`, 110, currentY);

      currentY += 5;
      doc.text(`- Dados:           ${comp?.dice ?? 0} unid.`, 25, currentY);
      doc.text(`- Losetas / Tabl.: ${comp?.tiles ?? 0} unid.`, 110, currentY);

      currentY += 5;
      doc.text(`- Otras piezas:    ${comp?.others ?? 0} unid.`, 25, currentY);
      
      const formattedOthers = formatOthersDescription(comp?.othersDescription);
      if (formattedOthers) {
        currentY += 5;
        doc.text(`  Detalle: ${formattedOthers}`, 25, currentY);
      }

      if (selectedExpObjects.length > 0) {
        selectedExpObjects.forEach((exp) => {
          const expComp = exp.components;
          const expOthers = formatOthersDescription(expComp?.othersDescription);
          currentY += 5;
          doc.setFont("courier", "bold");
          doc.setFontSize(8);
          doc.text(`* EXPANSIÓN: ${exp.name.toUpperCase()}`, 25, currentY);
          currentY += 4;
          doc.setFont("courier", "normal");
          doc.setFontSize(7.5);
          doc.text(`  Cartas: ${expComp?.cards ?? 0} | Fichas: ${expComp?.tokens ?? 0} | Dados: ${expComp?.dice ?? 0} | Losetas: ${expComp?.tiles ?? 0} ${expOthers ? `| Detalle: ${expOthers}` : ""}`, 25, currentY);
        });
      }

      currentY += 5;
      doc.setFontSize(7.5);
      doc.text(`Obs: ${notes}`, 20, currentY);

      currentY += 3.5;
      const inventoryBoxHeight = Math.max(45, currentY - inventoryBoxY);
      doc.rect(15, inventoryBoxY, 180, inventoryBoxHeight);

      // 3.5. QR Codes Box (Manual & Video Tutorial - Larger 32x32mm QRs)
      let qrBoxHeight = 0;
      if (manualQrBase64 || videoQrBase64) {
        const qrBoxY = inventoryBoxY + inventoryBoxHeight + 4;
        qrBoxHeight = 44;
        doc.rect(15, qrBoxY, 180, qrBoxHeight);
        doc.setFont("courier", "bold");
        doc.setFontSize(8.5);
        doc.text("CÓDIGOS QR DE ACCESO A REGLAMENTO Y VIDEO TUTORIAL:", 20, qrBoxY + 6);

        let qrX = 20;
        if (manualQrBase64) {
          doc.addImage(manualQrBase64, "JPEG", qrX, qrBoxY + 9, 31, 31, undefined, "FAST");
          doc.setFont("courier", "bold");
          doc.setFontSize(8.5);
          doc.text("QR MANUAL / REGLAS", qrX + 34, qrBoxY + 20);
          doc.setFont("courier", "normal");
          doc.setFontSize(7.5);
          doc.text("Escanear para ver PDF de reglas", qrX + 34, qrBoxY + 26);
          qrX += 88;
        }

        if (videoQrBase64) {
          doc.addImage(videoQrBase64, "JPEG", qrX, qrBoxY + 9, 31, 31, undefined, "FAST");
          doc.setFont("courier", "bold");
          doc.setFontSize(8.5);
          doc.text("QR VIDEO TUTORIAL", qrX + 34, qrBoxY + 20);
          doc.setFont("courier", "normal");
          doc.setFontSize(7.5);
          doc.text("Escanear para ver cómo jugar", qrX + 34, qrBoxY + 26);
        }
      }

      // 4. Responsibility Terms
      const termsBoxY = inventoryBoxY + inventoryBoxHeight + (qrBoxHeight > 0 ? qrBoxHeight + 8 : 4);
      doc.rect(15, termsBoxY, 180, 24);
      doc.setFont("courier", "bold");
      doc.setFontSize(8);
      doc.text("TÉRMINOS DE CONFORMIDAD Y CUSTODIA:", 20, termsBoxY + 5);
      doc.setFont("courier", "normal");
      doc.setFontSize(7);
      const terms = [
        "1. El cliente declara haber verificado e inspeccionado el juego de mesa detallado,",
        "   recibiéndolo completo con el inventario de piezas indicado y en perfectas condiciones.",
        "2. Se compromete a cuidar el material y devolverlo en la fecha límite acordada.",
        "3. La pérdida o rotura de componentes conllevará el cobro del costo de reposición.",
      ];
      terms.forEach((t, i) => {
        doc.text(t, 20, termsBoxY + 9.5 + i * 4);
      });

      // 5. Signature Section
      const sigBoxY = termsBoxY + 28;
      doc.rect(15, sigBoxY, 180, 42);
      doc.setFont("courier", "bold");
      doc.setFontSize(8.5);
      doc.text("CONFORMIDAD Y FIRMA DIGITAL DEL CLIENTE:", 20, sigBoxY + 5);

      if (signatureImage) {
        // Embed the image on the PDF
        doc.addImage(signatureImage, "PNG", 30, sigBoxY + 7, 55, 22);
      }

      doc.line(25, sigBoxY + 31, 95, sigBoxY + 31);
      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.text("Firma del Cliente Receptor", 35, sigBoxY + 36);

      doc.line(115, sigBoxY + 31, 185, sigBoxY + 31);
      doc.text("Firma y Sello Taberna", 130, sigBoxY + 36);

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Documento generado electrónicamente por Sistema Taberna // ${remitoCode} // ${new Date().toLocaleString("es-AR")}`,
        15,
        280
      );

      // Download PDF
      const sanitizedName = selectedGame.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      doc.save(`remito-${sanitizedName}-${deliveryDate}.pdf`);

      onClose();
    } catch (err) {
      console.error("Error al generar el remito PDF:", err);
      alert("Ocurrió un error al compilar el PDF.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white border-2 border-zinc-900 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-zinc-900" />
            <h3 className="font-mono text-sm uppercase font-bold text-zinc-900">
              Generar Remito Digital de Entrega
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Game Selection & Expansions */}
          <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-600 mb-1 font-bold">
                Seleccionar Juego Principal a Entregar *
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => {
                  setSelectedGameId(e.target.value);
                  setSelectedExpansionsForRemito([]);
                }}
                className="wire-input text-xs font-mono"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.category}) - Stock: {g.stock}
                  </option>
                ))}
              </select>
            </div>

            {/* Expansions selection list */}
            {selectedGame && selectedGame.expansions && selectedGame.expansions.length > 0 && (
              <div className="pt-3 border-t border-zinc-200">
                <label className="block text-xs font-mono uppercase text-zinc-800 font-bold mb-2 flex items-center gap-1.5">
                  <Puzzle className="w-3.5 h-3.5 text-amber-700" />
                  Expansiones Incluidas en este Remito (Opcional):
                </label>
                <div className="space-y-1.5">
                  {selectedGame.expansions.map((exp) => {
                    const isChecked = selectedExpansionsForRemito.includes(exp.id);
                    return (
                      <label
                        key={exp.id}
                        className={`flex items-center gap-2.5 p-2 border rounded-sm cursor-pointer transition text-xs font-mono ${
                          isChecked
                            ? "bg-amber-100/70 border-amber-400 font-bold"
                            : "bg-white border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setSelectedExpansionsForRemito((prev) =>
                              e.target.checked
                                ? [...prev, exp.id]
                                : prev.filter((id) => id !== exp.id)
                            );
                          }}
                          className="h-4 w-4 text-amber-700 rounded border-amber-400 focus:ring-amber-500 accent-amber-700"
                        />
                        <span className="text-zinc-900">{exp.name}</span>
                        <span className="text-[10px] text-zinc-500 ml-auto">
                          (Cartas: {exp.components?.cards ?? 0}, Fichas: {exp.components?.tokens ?? 0}, Dados: {exp.components?.dice ?? 0})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inventory preview */}
            {selectedGame && selectedGame.components && (
              <div className="pt-3 border-t border-zinc-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-xs">
                <div className="bg-white border border-zinc-200 p-1.5">
                  <span className="text-[10px] text-zinc-400 block">CARTAS</span>
                  <span className="font-bold">{selectedGame.components.cards}</span>
                </div>
                <div className="bg-white border border-zinc-200 p-1.5">
                  <span className="text-[10px] text-zinc-400 block">FICHAS</span>
                  <span className="font-bold">{selectedGame.components.tokens}</span>
                </div>
                <div className="bg-white border border-zinc-200 p-1.5">
                  <span className="text-[10px] text-zinc-400 block">DADOS</span>
                  <span className="font-bold">{selectedGame.components.dice}</span>
                </div>
                <div className="bg-white border border-zinc-200 p-1.5">
                  <span className="text-[10px] text-zinc-400 block">LOSETAS</span>
                  <span className="font-bold">{selectedGame.components.tiles}</span>
                </div>
                <div className="bg-white border border-zinc-200 p-1.5">
                  <span className="text-[10px] text-zinc-400 block">OTROS</span>
                  <span className="font-bold">{selectedGame.components.others}</span>
                </div>
              </div>
            )}
          </div>

          {/* Client Details */}
          <div className="space-y-3 border border-zinc-200 p-4 bg-zinc-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-2">
              <span className="font-mono text-xs uppercase font-bold text-zinc-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Datos del Cliente Receptor
              </span>

              {/* Selector de Cliente Registrado */}
              {registeredUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    Cliente Registrado:
                  </span>
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleUserSelect(e.target.value)}
                    className="wire-input text-xs py-1"
                  >
                    <option value="">-- Cliente Nuevo / Carga Manual --</option>
                    {registeredUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={clientData.firstName}
                  onChange={(e) => setClientData({ ...clientData, firstName: e.target.value })}
                  placeholder="Lucas"
                  className="wire-input text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={clientData.lastName}
                  onChange={(e) => setClientData({ ...clientData, lastName: e.target.value })}
                  placeholder="Benítez"
                  className="wire-input text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  DNI / Identificación
                </label>
                <input
                  type="text"
                  value={clientData.dni}
                  onChange={(e) => setClientData({ ...clientData, dni: e.target.value })}
                  placeholder="38.456.789"
                  className="wire-input text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  placeholder="+54 9 11 4455-6677"
                  className="wire-input text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  placeholder="cliente@email.com"
                  className="wire-input text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Domicilio *
                </label>
                <input
                  type="text"
                  value={clientData.address}
                  onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                  placeholder="Av. Corrientes 1234, CABA"
                  className="wire-input text-xs"
                />
              </div>
            </div>

            <p className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-sm flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Al completar todos los datos del cliente (Nombre, Apellido, Teléfono, Email y Domicilio), se registrará automáticamente en la base de datos de usuarios si aún no existe.
              </span>
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                Fecha de Entrega
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="wire-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                Fecha Pactada de Devolución
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="wire-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Signature Canvas Pad */}
          <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase font-bold text-zinc-900 block">
                  Firma Manuscrita del Cliente (Canvas Digital) *
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Firme en el recuadro con el ratón o en pantalla táctil
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearSignature}
                className="px-2.5 py-1 text-xs font-mono uppercase border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>

            <div
              className={`border-2 bg-white rounded-none relative h-40 ${
                signatureError ? "border-red-500" : "border-zinc-300"
              }`}
            >
              <SignatureCanvas
                ref={sigCanvasRef}
                canvasProps={{
                  className: "w-full h-full cursor-crosshair",
                }}
                backgroundColor="#ffffff"
                penColor="#09090b"
                onBegin={() => setSignatureError(false)}
              />
              <div className="absolute bottom-2 right-2 pointer-events-none text-[10px] font-mono text-zinc-300 uppercase">
                Área de firma digital
              </div>
            </div>

            {signatureError && (
              <p className="text-xs text-red-600 font-mono flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Se requiere la firma del cliente para emitir el remito.</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 font-mono text-xs uppercase tracking-wider"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={generating}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{generating ? "Compilando PDF..." : "Descargar Remito PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
