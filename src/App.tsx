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
  Printer, 
  Loader2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  const handlePrint = () => {
    window.print();
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
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
                  >
                    <Printer size={18} /> Imprimir ficha
                  </button>
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
                <div className="bg-white shadow-xl rounded-none md:rounded-2xl overflow-hidden border border-stone-200 print:shadow-none print:border-none">
                  {/* Sheet Header */}
                  <div className="bg-emerald-600 p-8 text-white flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-100 text-sm font-bold uppercase tracking-wider">
                        <Sparkles size={14} /> Ficha Didáctica de Matemáticas
                      </div>
                      <h2 className="text-3xl font-bold leading-tight">{sheet.title}</h2>
                      <p className="text-emerald-50 text-lg opacity-90">{sheet.topic}</p>
                    </div>
                    <div className="hidden sm:block border-2 border-emerald-400/30 rounded-lg p-3 text-center">
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
                        <div key={idx} className="space-y-4">
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
