export type TopicId = 
  | 'decena' 
  | 'configuraciones_geometricas' 
  | 'hasta_15' 
  | 'recoleccion_datos' 
  | 'secuencia_tiempo' 
  | 'composicion_geometrica' 
  | 'longitudes' 
  | 'hasta_30';

export interface Topic {
  id: TopicId;
  title: string;
  description: string;
  icon: string;
}

export interface DidacticSheet {
  title: string;
  topic: string;
  objective: string;
  instructions: string;
  activities: Activity[];
  teacherNotes: string;
}

export interface Activity {
  type: 'exercise' | 'problem' | 'drawing' | 'table';
  content: string;
  visualDescription?: string; // For the teacher to know what to draw or look for
}
