"use client";

import { useState, useRef } from "react";
import { X, FileSignature, RotateCcw, Download, Check, AlertCircle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import { GameWithComponents } from "@/types";

interface RemitoModalProps {
  games: GameWithComponents[];
  initialGameId?: string;
  onClose: () => void;
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
      // Signature data URL
      const signatureImage = sigCanvasRef.current?.toDataURL("image/png");

      // Initialize jsPDF (Portrait, mm, A4: 210 x 297 mm)
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const remitoCode = `REM-${Date.now().toString().slice(-6)}`;

      // 1. Header (Wireframe clean high-contrast)
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(15, 15, 180, 22, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("courier", "bold");
      doc.setFontSize(14);
      doc.text("TABERNA // REMITO DE ENTREGA DIGITAL", 20, 24);

      doc.setFontSize(9);
      doc.setFont("courier", "normal");
      doc.text(`FOLIO: ${remitoCode} | FECHA: ${deliveryDate}`, 20, 31);

      // 2. Client & Rental Details Box
      doc.setTextColor(15, 23, 42);
      doc.setDrawColor(203, 213, 225);
      doc.rect(15, 42, 180, 42);

      doc.setFont("courier", "bold");
      doc.setFontSize(10);
      doc.text("DATOS DEL CLIENTE Y PERÍODO DE ALQUILER", 20, 48);

      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.text(`Cliente: ${clientData.firstName} ${clientData.lastName} ${clientData.dni ? `(DNI: ${clientData.dni})` : ""}`, 20, 56);
      doc.text(`Teléfono: ${clientData.phone || "No especificado"} | Email: ${clientData.email || "No especificado"}`, 20, 63);
      doc.text(`Domicilio: ${clientData.address || "No especificado"}`, 20, 70);
      doc.text(`Fecha de Retiro: ${deliveryDate} | Fecha Pactada de Devolución: ${returnDate}`, 20, 77);

      // 3. Game & Components Inventory Box
      doc.rect(15, 89, 180, 65);
      doc.setFont("courier", "bold");
      doc.setFontSize(10);
      doc.text(`JUEGO ENTREGADO: ${selectedGame.name.toUpperCase()}`, 20, 96);
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.text(`Categoría: ${selectedGame.category} | Tarifa: $${selectedGame.price.toLocaleString("es-AR")}`, 20, 102);

      // Components sub-table
      doc.line(20, 106, 190, 106);
      doc.setFont("courier", "bold");
      doc.text("DETALLE DE PIEZAS VERIFICADAS AL MOMENTO DE LA ENTREGA:", 20, 112);

      const comp = selectedGame.components;
      doc.setFont("courier", "normal");
      doc.text(`- Cartas / Mazos:  ${comp?.cards ?? 0} unid.`, 25, 120);
      doc.text(`- Fichas / Tokens: ${comp?.tokens ?? 0} unid.`, 110, 120);

      doc.text(`- Dados:           ${comp?.dice ?? 0} unid.`, 25, 127);
      doc.text(`- Losetas / Tabl.: ${comp?.tiles ?? 0} unid.`, 110, 127);

      doc.text(`- Otras piezas:    ${comp?.others ?? 0} unid.`, 25, 134);
      if (comp?.othersDescription) {
        doc.text(`  Detalle: ${comp.othersDescription}`, 25, 141);
      }

      doc.setFontSize(8);
      doc.text(`Obs: ${notes}`, 20, 149);

      // 4. Responsibility Terms
      doc.rect(15, 159, 180, 30);
      doc.setFont("courier", "bold");
      doc.setFontSize(8);
      doc.text("TÉRMINOS DE CONFORMIDAD Y CUSTODIA:", 20, 165);
      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      const terms = [
        "1. El cliente declara haber verificado e inspeccionado el juego de mesa detallado,",
        "   recibiéndolo completo con el inventario de piezas indicado y en perfectas condiciones.",
        "2. Se compromete a cuidar el material y devolverlo en la fecha límite acordada.",
        "3. La pérdida o rotura de componentes conllevará el cobro del costo de reposición.",
      ];
      terms.forEach((t, i) => {
        doc.text(t, 20, 171 + i * 4.5);
      });

      // 5. Signature Section
      doc.rect(15, 194, 180, 50);
      doc.setFont("courier", "bold");
      doc.setFontSize(9);
      doc.text("CONFORMIDAD Y FIRMA DIGITAL DEL CLIENTE:", 20, 201);

      if (signatureImage) {
        // Embed the image on the PDF
        doc.addImage(signatureImage, "PNG", 30, 204, 60, 25);
      }

      doc.line(25, 234, 95, 234);
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.text("Firma del Cliente Receptor", 35, 239);

      doc.line(115, 234, 185, 234);
      doc.text("Firma y Sello Taberna", 130, 239);

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
          {/* Game Selection */}
          <div className="border border-zinc-200 p-4 bg-zinc-50/50">
            <label className="block text-xs font-mono uppercase text-zinc-600 mb-1 font-bold">
              Seleccionar Juego a Entregar *
            </label>
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="wire-input text-xs font-mono"
            >
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.category}) - Stock: {g.stock}
                </option>
              ))}
            </select>

            {/* Inventory preview */}
            {selectedGame && selectedGame.components && (
              <div className="mt-3 pt-3 border-t border-zinc-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-xs">
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
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase font-bold text-zinc-800 block">
              Datos del Cliente Receptor
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  Teléfono
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
                  Email
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
                  Domicilio
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
