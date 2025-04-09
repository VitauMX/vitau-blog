// Sample posts for development when Ghost API is unavailable
const samplePosts = [
  {
    id: 'sample-1',
    title: 'La importancia de una buena alimentación',
    primary_tag: { 
      name: 'Nutrición',
      slug: 'nutricion'
    },
    slug: 'importancia-buena-alimentacion',
    feature_image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    reading_time: 5,
    published_at: new Date().toISOString(),
    html: `
      <p>Una buena alimentación es fundamental para mantener una vida saludable y prevenir enfermedades. Consumir alimentos variados y equilibrados proporciona a nuestro cuerpo los nutrientes necesarios para funcionar correctamente.</p>
      
      <h2>Beneficios de una alimentación saludable</h2>
      
      <p>Entre los principales beneficios de mantener una dieta equilibrada se encuentran:</p>
      
      <ul>
        <li>Mayor energía durante el día</li>
        <li>Mejor calidad del sueño</li>
        <li>Sistema inmunológico más fuerte</li>
        <li>Reducción del riesgo de enfermedades crónicas</li>
        <li>Mantenimiento de un peso saludable</li>
      </ul>
      
      <h2>Recomendaciones para mejorar tu alimentación</h2>
      
      <p>Algunos consejos para mejorar tus hábitos alimenticios incluyen:</p>
      
      <ol>
        <li>Aumentar el consumo de frutas y verduras</li>
        <li>Reducir el consumo de alimentos procesados</li>
        <li>Beber suficiente agua durante el día</li>
        <li>Consumir proteínas magras</li>
        <li>Incluir grasas saludables en tu dieta</li>
      </ol>
      
      <p>Recuerda que cada persona es diferente, por lo que es importante adaptar tu alimentación a tus necesidades específicas. Consulta con un profesional de la salud si tienes dudas sobre cómo mejorar tu dieta.</p>
    `,
    excerpt: 'Una buena alimentación es fundamental para mantener una vida saludable y prevenir enfermedades. Consumir alimentos variados y equilibrados proporciona a nuestro cuerpo los nutrientes necesarios para funcionar correctamente.'
  },
  {
    id: 'sample-2',
    title: 'Ejercicios para hacer en casa',
    primary_tag: { 
      name: 'Fitness',
      slug: 'fitness'
    },
    slug: 'ejercicios-para-hacer-en-casa',
    feature_image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    reading_time: 8,
    published_at: new Date().toISOString(),
    html: `
      <p>Mantenerse activo en casa es posible con una rutina de ejercicios simple pero efectiva. No necesitas equipamiento especializado para conseguir buenos resultados.</p>
      
      <h2>Beneficios del ejercicio en casa</h2>
      
      <p>Algunos de los beneficios de entrenar en casa incluyen:</p>
      
      <ul>
        <li>Ahorro de tiempo al evitar desplazamientos</li>
        <li>Mayor privacidad</li>
        <li>Flexibilidad de horarios</li>
        <li>Economía al no pagar membresías</li>
      </ul>
      
      <h2>Rutina básica de ejercicios</h2>
      
      <p>Aquí tienes una rutina de 30 minutos que puedes hacer en casa:</p>
      
      <ol>
        <li>Calentamiento (5 minutos): movilidad articular y saltos suaves</li>
        <li>Sentadillas (3 series de 15 repeticiones)</li>
        <li>Flexiones de pecho (3 series de 10 repeticiones)</li>
        <li>Abdominales (3 series de 20 repeticiones)</li>
        <li>Plancha frontal (3 series de 30 segundos)</li>
        <li>Zancadas (3 series de 12 repeticiones por pierna)</li>
        <li>Estiramiento final (5 minutos)</li>
      </ol>
      
      <p>Recuerda mantener una buena postura durante los ejercicios y adaptar la intensidad a tu nivel de condición física. Si sientes dolor, detente inmediatamente.</p>
    `,
    excerpt: 'Mantenerse activo en casa es posible con una rutina de ejercicios simple pero efectiva. No necesitas equipamiento especializado para conseguir buenos resultados.'
  },
  {
    id: 'sample-3',
    title: 'Consejos para mejorar tu sueño',
    primary_tag: { 
      name: 'Bienestar',
      slug: 'bienestar'
    },
    slug: 'consejos-mejorar-sueno',
    feature_image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    reading_time: 4,
    published_at: new Date().toISOString(),
    html: `
      <p>Un sueño de calidad es esencial para nuestra salud física y mental. Durante el sueño, nuestro cuerpo se repara y nuestro cerebro procesa la información del día.</p>
      
      <h2>Consecuencias de un mal descanso</h2>
      
      <p>La falta de sueño puede provocar:</p>
      
      <ul>
        <li>Disminución de la concentración y memoria</li>
        <li>Cambios de humor e irritabilidad</li>
        <li>Debilitamiento del sistema inmunológico</li>
        <li>Mayor riesgo de enfermedades crónicas</li>
        <li>Aumento de peso</li>
      </ul>
      
      <h2>Recomendaciones para mejorar la calidad del sueño</h2>
      
      <p>Algunos consejos que pueden ayudarte a dormir mejor:</p>
      
      <ol>
        <li>Mantén un horario regular para acostarte y levantarte</li>
        <li>Crea un ambiente propicio: oscuridad, silencio y temperatura adecuada</li>
        <li>Evita pantallas (celular, TV, computadora) al menos una hora antes de dormir</li>
        <li>Reduce el consumo de cafeína y alcohol, especialmente por la tarde</li>
        <li>Practica técnicas de relajación antes de dormir</li>
      </ol>
      
      <p>Si tus problemas de sueño persisten a pesar de seguir estas recomendaciones, consulta con un médico ya que podría tratarse de un trastorno del sueño que requiere atención especializada.</p>
    `,
    excerpt: 'Un sueño de calidad es esencial para nuestra salud física y mental. Durante el sueño, nuestro cuerpo se repara y nuestro cerebro procesa la información del día.'
  },
  {
    id: 'sample-4',
    title: 'Hábitos para una vida saludable',
    primary_tag: { 
      name: 'Vida saludable',
      slug: 'vida-saludable'
    },
    slug: 'habitos-vida-saludable',
    feature_image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    reading_time: 6,
    published_at: new Date().toISOString(),
    html: `
      <p>Adoptar hábitos saludables es una inversión a largo plazo para nuestro bienestar físico y mental. Pequeños cambios en nuestra rutina diaria pueden tener un gran impacto en nuestra calidad de vida.</p>
      
      <h2>Hábitos saludables recomendados</h2>
      
      <ul>
        <li>Alimentación equilibrada: consumir alimentos variados y naturales</li>
        <li>Actividad física regular: al menos 30 minutos diarios</li>
        <li>Hidratación adecuada: beber entre 1.5 y 2 litros de agua al día</li>
        <li>Descanso suficiente: dormir entre 7-8 horas diarias</li>
        <li>Gestión del estrés: practicar técnicas de relajación</li>
      </ul>
      
      <h2>¿Cómo incorporar nuevos hábitos?</h2>
      
      <p>La clave para adoptar nuevos hábitos y mantenerlos es:</p>
      
      <ol>
        <li>Establecer objetivos realistas y específicos</li>
        <li>Introducir cambios gradualmente</li>
        <li>Ser constante y tener paciencia</li>
        <li>Celebrar los pequeños logros</li>
        <li>No desanimarse por los retrocesos ocasionales</li>
      </ol>
      
      <p>Recuerda que cada persona es única, por lo que debes adaptar estos consejos a tus circunstancias personales, preferencias y necesidades específicas.</p>
    `,
    excerpt: 'Adoptar hábitos saludables es una inversión a largo plazo para nuestro bienestar físico y mental. Pequeños cambios en nuestra rutina diaria pueden tener un gran impacto en nuestra calidad de vida.'
  }
];

// Sample categories for development when Ghost API is unavailable
const sampleCategories = [
  {
    id: 'sample-cat-1',
    name: 'Nutrición',
    slug: 'nutricion',
    feature_image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    count: { posts: 5 },
    description: 'Consejos y artículos sobre alimentación saludable, dietas equilibradas y nutrición deportiva.'
  },
  {
    id: 'sample-cat-2',
    name: 'Fitness',
    slug: 'fitness',
    feature_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    count: { posts: 8 },
    description: 'Rutinas de ejercicio, entrenamiento funcional y consejos para mantenerse activo y en forma.'
  },
  {
    id: 'sample-cat-3',
    name: 'Bienestar',
    slug: 'bienestar',
    feature_image: 'https://images.unsplash.com/photo-1532798442725-41036acc7489?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    count: { posts: 3 },
    description: 'Artículos sobre salud mental, meditación, técnicas de relajación y equilibrio emocional.'
  },
  {
    id: 'sample-cat-4',
    name: 'Vida saludable',
    slug: 'vida-saludable',
    feature_image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    count: { posts: 6 },
    description: 'Consejos para adoptar un estilo de vida más saludable, sostenible y equilibrado en todos los aspectos.'
  }
];

// Use CommonJS exports for gatsby-node.js compatibility
module.exports = {
  samplePosts,
  sampleCategories
} 