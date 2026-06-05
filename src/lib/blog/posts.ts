export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: "Dra. Mariana Rodríguez Méndez" | "Camila Rodríguez Méndez";
  category: string;
  date: string;
  readTime: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "el-impacto-del-estres-en-tu-salud-hormonal",
    title: "El impacto del estrés en tu salud hormonal y cómo gestionarlo",
    excerpt:
      "Descubrí cómo el cortisol crónico afecta tu ciclo menstrual, tu metabolismo y qué estrategias prácticas podés implementar hoy para recuperar el equilibrio.",
    content: `
      <p>Vivimos en una época donde estar ocupados se glorifica, pero nuestro cuerpo no fue diseñado para sostener niveles altos de cortisol de manera crónica. Como nutricionista funcional, veo a diario cómo el estrés silencioso es la raíz de desajustes hormonales, problemas de tiroides y fatiga crónica.</p>
      
      <h2>¿Qué pasa cuando el cortisol no baja?</h2>
      <p>El cortisol es necesario. Nos despierta por la mañana y nos ayuda a reaccionar ante el peligro. Sin embargo, cuando permanece elevado, el cuerpo entra en modo "supervivencia". En este estado, la producción de hormonas reproductivas pasa a un segundo plano. Tu cuerpo interpreta que no es un entorno seguro para procrear ni para tener un metabolismo acelerado.</p>
      
      <ul>
        <li><strong>Ciclos irregulares:</strong> Retrasos en la menstruación o ciclos anovulatorios.</li>
        <li><strong>Resistencia a la insulina:</strong> El cortisol eleva el azúcar en sangre, lo que puede llevar a picos de insulina y almacenamiento de grasa abdominal.</li>
        <li><strong>Problemas de sueño:</strong> Dificultad para conciliar el sueño o despertares nocturnos (especialmente entre las 2 y 4 AM).</li>
      </ul>

      <h2>Estrategias para recuperar el equilibrio</h2>
      <p>No se trata de eliminar el estrés por completo, sino de enseñarle a tu sistema nervioso a volver a la calma (estado parasimpático). Priorizá el descanso, establecé límites saludables en tu entorno laboral y asegurate de nutrir tu cuerpo con alimentos ricos en magnesio y omega-3.</p>
      
      <p>Pequeños cambios, como 10 minutos de respiración profunda al despertar y exponerte a la luz solar temprana, pueden marcar una diferencia abismal en cómo tus células se comunican.</p>
    `,
    author: "Dra. Mariana Rodríguez Méndez",
    category: "Salud Hormonal",
    date: "12 May 2026",
    readTime: "4 min",
  },
  {
    id: "2",
    slug: "entrenamiento-de-fuerza-mujeres",
    title: "Por qué el entrenamiento de fuerza es innegociable para las mujeres",
    excerpt:
      "Desmitificamos el miedo a 'ponerse grande' y exploramos los beneficios reales de levantar pesas: desde la densidad ósea hasta la longevidad metabólica.",
    content: `
      <p>Durante años se nos vendió la idea de que las mujeres solo debían hacer horas interminables de cardio para verse "tonificadas". Como entrenadora, mi misión es romper ese mito: el verdadero cambio en tu composición corporal y en tu salud a largo plazo ocurre en la sala de pesas.</p>
      
      <h2>Más músculo, más salud</h2>
      <p>El tejido muscular es metabólicamente activo. Esto significa que a mayor masa muscular, más calorías quemará tu cuerpo en reposo. Pero los beneficios van mucho más allá de la estética:</p>
      
      <ul>
        <li><strong>Densidad ósea:</strong> El entrenamiento de fuerza es la herramienta número uno para prevenir la osteoporosis. El impacto mecánico sobre los huesos estimula su regeneración.</li>
        <li><strong>Sensibilidad a la insulina:</strong> El músculo actúa como una esponja para la glucosa, mejorando cómo tu cuerpo maneja los carbohidratos.</li>
        <li><strong>Empoderamiento:</strong> Hay una confianza única que se traslada del gimnasio a la vida real cuando descubrís de lo que tu cuerpo es capaz.</li>
      </ul>

      <h2>¿Por dónde empezar?</h2>
      <p>No necesitás entrenar 6 días a la semana. Empezá con 3 sesiones enfocadas en patrones de movimiento básicos: sentadillas, pesos muertos, empujes y tirones. Priorizá la técnica sobre el peso, y poco a poco implementá la sobrecarga progresiva.</p>
    `,
    author: "Camila Rodríguez Méndez",
    category: "Entrenamiento",
    date: "28 Abr 2026",
    readTime: "3 min",
  },
  {
    id: "3",
    slug: "microbiota-intestinal-segundo-cerebro",
    title: "Microbiota Intestinal: El segundo cerebro que define tu energía",
    excerpt:
      "Una inmersión profunda en cómo las bacterias de tu intestino influyen en tus antojos, tu estado de ánimo y tu sistema inmunológico.",
    content: `
      <p>Tu intestino alberga trillones de microorganismos que forman un ecosistema complejo llamado microbiota. Hoy sabemos que este ecosistema no solo digiere nuestros alimentos, sino que dialoga constantemente con nuestro cerebro, sistema inmune y hormonas.</p>
      
      <h2>La conexión intestino-cerebro</h2>
      <p>¿Sabías que gran parte de la serotonina (la hormona del bienestar) se produce en el intestino? Una microbiota desequilibrada (disbiosis) no solo causa inflamación y distensión abdominal, sino que está íntimamente ligada a la ansiedad, la niebla mental y los cambios de humor bruscos.</p>
      
      <h2>Nutriendo tu jardín interior</h2>
      <p>Para cultivar una microbiota diversa y resiliente, la clave es la variedad en tu alimentación:</p>
      <ul>
        <li><strong>Fibra prebiótica:</strong> Alimenta a las bacterias buenas. Encontrala en espárragos, cebollas, ajo, plátano verde y avena.</li>
        <li><strong>Alimentos fermentados:</strong> Kéfir, chucrut, kimchi y kombucha aportan cepas probióticas beneficiosas.</li>
        <li><strong>Polifenoles:</strong> Los compuestos que dan color a los frutos rojos, el cacao oscuro y el té verde son el festín favorito de tus bacterias protectoras.</li>
      </ul>
      <p>Recordá que el estrés crónico también altera la composición de tu microbiota, por lo que un abordaje integrativo es esencial.</p>
    `,
    author: "Dra. Mariana Rodríguez Méndez",
    category: "Nutrición",
    date: "15 Abr 2026",
    readTime: "5 min",
  },
  {
    id: "4",
    slug: "movilidad-el-eslabon-perdido",
    title: "Movilidad: El eslabón perdido en tu rutina de entrenamiento",
    excerpt:
      "La flexibilidad te permite doblarte, la movilidad te permite controlar ese rango de movimiento. Por qué debés priorizarla antes de cargar peso.",
    content: `
      <p>Es común ver a personas en el gimnasio pasar directamente del escritorio a levantar peso. La movilidad suele ser la parte más subestimada del entrenamiento, pero es la diferencia entre progresar de manera sostenida o lesionarte en el intento.</p>
      
      <h2>Flexibilidad vs. Movilidad</h2>
      <p>Mientras que la flexibilidad es la capacidad pasiva de elongar un músculo, la movilidad requiere fuerza y control del sistema nervioso en todo el rango de movimiento articular. Podés ser muy flexible pero tener poca movilidad, lo que te hace inestable bajo carga.</p>
      
      <h2>Por qué integrarla a tu rutina</h2>
      <p>Dedicar 10 minutos a rutinas de movilidad (como CARs - Rotaciones Articulares Controladas) antes de entrenar prepara tus tejidos y optimiza tus posturas. Una mejor movilidad de cadera y tobillo, por ejemplo, te permitirá lograr una sentadilla más profunda y eficiente.</p>
    `,
    author: "Camila Rodríguez Méndez",
    category: "Entrenamiento",
    date: "02 Abr 2026",
    readTime: "3 min",
  },
  {
    id: "5",
    slug: "ayuno-intermitente-mujeres",
    title: "Ayuno intermitente en mujeres: Lo que nadie te cuenta",
    excerpt:
      "El ayuno puede ser una excelente herramienta metabólica, pero en el cuerpo femenino las reglas cambian. Cómo hacerlo de forma segura y respetuosa.",
    content: `
      <p>El ayuno intermitente ha ganado una inmensa popularidad por sus beneficios metabólicos, pero gran parte de la investigación original se realizó en hombres o en modelos animales. El cuerpo de la mujer en edad reproductiva es exquisitamente sensible a la disponibilidad de energía.</p>
      
      <h2>El reloj biológico femenino</h2>
      <p>La restricción calórica severa o las ventanas de ayuno muy prolongadas (más de 16 horas) pueden ser interpretadas por el hipotálamo como un estado de escasez. En respuesta, puede suprimir la ovulación y la producción de progesterona para "ahorrar" energía.</p>
      
      <h2>El enfoque integrativo</h2>
      <p>Si querés explorar el ayuno, hacelo en sincronía con tu ciclo menstrual. Durante la fase folicular (primera mitad del ciclo), el cuerpo suele tolerar mejor los ayunos suaves de 12 a 14 horas. Sin embargo, en la fase lútea (antes de la menstruación), el requerimiento energético aumenta y el cuerpo es más vulnerable al estrés, por lo que es un buen momento para acortar las ventanas de ayuno o suspenderlas.</p>
      <p>Escuchá a tu cuerpo. Si el ayuno te causa ansiedad, alteraciones en el sueño o pérdida del periodo, no es la herramienta adecuada para vos en este momento.</p>
    `,
    author: "Dra. Mariana Rodríguez Méndez",
    category: "Bienestar",
    date: "20 Mar 2026",
    readTime: "4 min",
  },
  {
    id: "6",
    slug: "conecta-con-tu-cuerpo",
    title: "Entrenar para conectar, no para castigar",
    excerpt:
      "Redefiniendo nuestra relación con el ejercicio. Cómo pasar de entrenar por culpa a entrenar desde el amor propio y el autocuidado.",
    content: `
      <p>Demasiadas veces utilizamos el ejercicio como un castigo por lo que comimos el fin de semana, o como un medio para encajar en un estándar estético inalcanzable. Este enfoque no solo es insostenible, sino que drena nuestra energía mental y emocional.</p>
      
      <h2>El cambio de paradigma</h2>
      <p>Te invito a cambiar la narrativa: el movimiento es una celebración de lo que tu cuerpo puede hacer hoy. Cuando entrenás para ser más fuerte, para tener más energía en tu día a día, o simplemente para despejar la mente, la adherencia surge de forma natural.</p>
      
      <h2>Escucha activa</h2>
      <p>No todos los días debés exigirte al 100%. Habrá días de récords personales, y habrá días donde una caminata al aire libre o una sesión suave de movilidad es exactamente lo que tu sistema nervioso necesita. La verdadera disciplina incluye saber cuándo presionar y cuándo descansar.</p>
    `,
    author: "Camila Rodríguez Méndez",
    category: "Mindset",
    date: "05 Mar 2026",
    readTime: "3 min",
  },
];
