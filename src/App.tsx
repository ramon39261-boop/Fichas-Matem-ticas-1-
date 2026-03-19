import React, { useState } from 'react';
import { 
  Layout, 
  BookOpen, 
  Shapes, 
  Hash, 
  BarChart3, 
  Clock, 
  Maximize2, 
  Ruler, 
  ChevronRight, 
  Share2,
  Loader2,
  Sparkles,
  ArrowLeft,
  Download,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType 
} from 'docx';
import { Topic, TopicId, DidacticSheet } from './types';
import { generateDidacticSheet } from './services/gemini';

const TOPICS: Topic[] = [
  { id: 'decena', title: 'La decena', description: 'Agrupamientos de 10 elementos.', icon: 'Hash' },
  { id: 'configuraciones_geometricas', title: 'Configuraciones geométricas', description: 'Reconocimiento de formas y figuras.', icon: 'Shapes' },
  { id: 'hasta_15', title: 'Hasta 15', description: 'Conteo y escritura de números hasta 15.', icon: 'Hash' },
  { id: 'recoleccion_datos', title: 'Recolección y registro de datos', description: 'Tablas y pictogramas sencillos.', icon: 'BarChart3' },
  { id: 'secuencia_tiempo', title: 'Secuencia de sucesos en el tiempo', description: 'Antes, después, días de la semana.', icon: 'Clock' },
  { id: 'composicion_geometrica', title: 'Composición y descomposición', description: 'Armar figuras con otras figuras.', icon: 'Maximize2' },
  { id: 'longitudes', title: 'Explorar longitudes', description: 'Comparación directa de tamaños.', icon: 'Ruler' },
  { id: 'hasta_30', title: 'Hasta 30', description: 'Conteo y series numéricas hasta 30.', icon: 'Hash' },
];

const IconMap: Record<string, React.ElementType> = {
  Hash,
  Shapes,
  BarChart3,
  Clock,
  Maximize2,
  Ruler,
};

export default function App() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [sheet, setSheet] = useState<DidacticSheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (topic: Topic) => {
    setLoading(true);
    setError(null);
    setSelectedTopic(topic);
    try {
      const data = await generateDidacticSheet(topic.id, topic.title);
      setSheet(data);
    } catch (err) {
      console.error(err);
      setError('Hubo un error al generar la ficha. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedTopic(null);
    setSheet(null);
    setError(null);
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!sheet) return;
    setLoading(true);
    try {
      const element = document.getElementById('didactic-sheet');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            const props = ['color', 'backgroundColor', 'borderColor', 'boxShadow'];
            props.forEach(prop => {
              const val = (el.style as any)[prop] || style.getPropertyValue(prop);
              if (val && (val.includes('oklch') || val.includes('oklab'))) {
                if (prop === 'backgroundColor') el.style.backgroundColor = '#ffffff';
                else if (prop === 'color') el.style.color = '#000000';
                else if (prop === 'borderColor') el.style.borderColor = '#cccccc';
                else if (prop === 'boxShadow') el.style.boxShadow = 'none';
              }
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const fileName = `Ficha_${sheet.title.replace(/\s+/g, '_')}.pdf`;
      
      // Direct download is more reliable than navigator.share after async work
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!sheet) return;
    
    let text = `*${sheet.title}*\n`;
    text += `_Tema: ${sheet.topic}_\n\n`;
    text += `*Objetivo:* ${sheet.objective}\n\n`;
    text += `*Actividades:*\n`;
    
    sheet.activities.forEach((activity, idx) => {
      text += `\n${idx + 1}. ${activity.content}\n`;
    });
    
    text += `\n_Generado por Fichas Matemáticas 1°_`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleDownloadWord = async () => {
    if (!sheet) return;
    setLoading(true);
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: sheet.title,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: sheet.topic,
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Objetivo de Aprendizaje: ", bold: true }),
                  new TextRun({ text: sheet.objective, italics: true }),
                ],
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Instrucciones Generales: ", bold: true }),
                  new TextRun({ text: sheet.instructions }),
                ],
              }),
              new Paragraph({ text: "" }),
              ...sheet.activities.flatMap((activity, index) => [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${index + 1}. `, bold: true }),
                    new TextRun({ 
                      text: activity.type === 'exercise' ? 'Ejercicio Práctico' :
                            activity.type === 'problem' ? 'Resolución de Problema' :
                            activity.type === 'drawing' ? 'Actividad Creativa' :
                            activity.type === 'table' ? 'Registro de Datos' : 'Actividad',
                      bold: true 
                    }),
                  ],
                }),
                new Paragraph({ text: activity.content }),
                activity.visualDescription ? new Paragraph({
                  children: [
                    new TextRun({ text: `[Espacio para: ${activity.visualDescription}]`, italics: true, color: "888888" }),
                  ],
                }) : new Paragraph({ text: "" }),
                new Paragraph({ text: "" }),
              ]),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Notas para el Docente: ", bold: true }),
                  new TextRun({ text: sheet.teacherNotes }),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `Ficha_${sheet.title.replace(/\s+/g, '_')}.docx`;
      downloadFile(blob, fileName);
    } catch (err) {
      console.error('Error generating Word doc:', err);
      setError('No se pudo generar el documento Word. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 py-6 px-4 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl text-stone-900">Fichas Matemáticas 1°</h1>
              <p className="text-stone-500 text-sm">Programa Sintético 2022 • Bloque 1</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">Docentes México</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!selectedTopic ? (
            <motion.div
              key="topic-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl text-stone-800">¿Qué tema trabajaremos hoy?</h2>
                <p className="text-stone-500">Selecciona un contenido del Bloque 1 para generar una ficha didáctica personalizada.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TOPICS.map((topic) => {
                  const Icon = IconMap[topic.icon] || Hash;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleGenerate(topic)}
                      className="group relative bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex flex-col gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-800 group-hover:text-emerald-700 transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                          {topic.description}
                        </p>
                      </div>
                      <div className="mt-auto pt-4 flex items-center text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        GENERAR FICHA <ChevronRight size={14} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sheet-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between no-print">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-medium"
                >
                  <ArrowLeft size={18} /> Volver al menú
                </button>
                {sheet && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={handleWhatsAppShare}
                      className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] transition-colors shadow-sm font-medium"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </button>
                    <button 
                      onClick={handleDownloadWord}
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 font-medium"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                      Word
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      disabled={loading}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 font-medium"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                      PDF
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="animate-spin text-emerald-600" size={48} />
                  <div className="text-center">
                    <p className="text-lg font-medium text-stone-800">Generando actividades...</p>
                    <p className="text-stone-500 text-sm">Alineando con el Programa Sintético 2022</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center space-y-4">
                  <p className="text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={() => handleGenerate(selectedTopic)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : sheet && (
                <div id="didactic-sheet" className="bg-white shadow-xl rounded-none md:rounded-2xl overflow-hidden border border-stone-200 print:shadow-none print:border-none">
                  {/* Sheet Header */}
                  <div className="bg-emerald-600 p-8 text-white flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-100 text-sm font-bold uppercase tracking-wider">
                        <Sparkles size={14} /> Ficha Didáctica de Matemáticas
                      </div>
                      <h2 className="text-3xl font-bold leading-tight">{sheet.title}</h2>
                      <p className="text-emerald-50 text-lg opacity-90">{sheet.topic}</p>
                    </div>
                    <div className="hidden sm:block border-2 border-emerald-500 rounded-lg p-3 text-center">
                      <div className="text-[10px] uppercase font-bold tracking-tighter opacity-60">Grado</div>
                      <div className="text-2xl font-black">1°</div>
                    </div>
                  </div>

                  {/* Sheet Content */}
                  <div className="p-8 md:p-12 space-y-10">
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-100">
                      <div className="md:col-span-2 space-y-4">
                        <h4 className="text-stone-400 text-xs font-bold uppercase tracking-widest">Objetivo de Aprendizaje</h4>
                        <p className="text-stone-700 leading-relaxed italic">"{sheet.objective}"</p>
                      </div>
                      <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <h4 className="text-stone-400 text-xs font-bold uppercase tracking-widest">Instrucciones Generales</h4>
                        <p className="text-stone-600 text-sm">{sheet.instructions}</p>
                      </div>
                    </section>

                    <section className="space-y-12">
                      {sheet.activities.map((activity, idx) => (
                        <div key={idx} className="space-y-4 print-break-inside-avoid">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                              {idx + 1}
                            </span>
                            <h4 className="text-stone-900 font-bold text-lg">
                              {activity.type === 'exercise' && 'Ejercicio Práctico'}
                              {activity.type === 'problem' && 'Resolución de Problema'}
                              {activity.type === 'drawing' && 'Actividad Creativa'}
                              {activity.type === 'table' && 'Registro de Datos'}
                            </h4>
                          </div>
                          
                          <div className="pl-11 space-y-4">
                            <p className="text-stone-800 text-lg leading-relaxed whitespace-pre-wrap">
                              {activity.content}
                            </p>
                            
                            {activity.visualDescription && (
                              <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-8 min-h-[150px] flex items-center justify-center text-center">
                                <p className="text-stone-400 text-sm italic">
                                  [Espacio para: {activity.visualDescription}]
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </section>

                    <section className="pt-8 border-t border-stone-100 no-print">
                      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-sm uppercase tracking-wider">
                          <BookOpen size={16} /> Notas para el Docente
                        </div>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          {sheet.teacherNotes}
                        </p>
                      </div>
                    </section>
                  </div>

                  {/* Sheet Footer */}
                  <div className="bg-stone-50 p-6 border-t border-stone-100 flex justify-between items-center text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                    <span>Secretaría de Educación Pública • Programa 2022</span>
                    <span>Página 1 de 1</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-stone-400 text-xs no-print">
        <p>© 2026 Herramienta de Apoyo Docente • Matemáticas 1° Primaria</p>
        <p className="mt-1">Generado con Inteligencia Artificial para fines educativos.</p>
      </footer>
    </div>
  );
}
