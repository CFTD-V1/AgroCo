<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Definición de intents del asistente
    |--------------------------------------------------------------------------
    |
    | Cada intent incluye palabras clave y respuestas de tono cercano.
    | El servicio selecciona la respuesta adecuada según el mensaje ingresado.
    |
    */
    'intents' => [
        'app_overview' => [
            'keywords' => [
                'como funciona', 'como funciona el sistema', 'como funciona la app', 'como funciona el aplicativo',
                'como usar', 'para que sirve',
                'que hace la app', 'explicame la app', 'que es agroco',
                'manual', 'ayuda general', 'como me ayuda'
            ],
            'responses' => [
                'AGROCO te ayuda a organizar tus lotes, registrar los análisis de suelo y generar planes de fertilización en PDF listos para compartir. Todo gira alrededor de tres pasos: crear lotes, registrar análisis y generar el plan.',
                'Piensa en la app como un cuaderno digital para tu finca: guardas tus lotes, subes los resultados de laboratorio y el sistema calcula por ti las dosis sugeridas de nutrientes por hectárea. Así mantienes un historial ordenado.',
                'La aplicación conecta tus datos de suelo con una guía nutricional de arroz. Tú ingresas la información de tus lotes y análisis, y el sistema te devuelve recomendaciones claras y un plan descargable.',
            ],
            'follow_up' => [
                'Si quieres, dime si deseas que te explique primero lotes, análisis o planes y vamos paso a paso.'
            ],
        ],

        'getting_started' => [
            'keywords' => [
                'que debo hacer primero', 'por donde empiezo', 'primer paso',
                'como empezar', 'que hago primero', 'iniciar en la app'
            ],
            'responses' => [
                'El primer paso es crear al menos un lote con su nombre y área. Luego registras un análisis de suelo para ese lote y, por último, generas el plan de fertilización. Con esos tres pasos ya tienes todo el flujo básico.',
                'Empieza por ir a la sección "Mis lotes" y crear un lote con nombre, área y ubicación. Después ve a "Análisis", vincula el análisis al lote y al final usa "Generar plan" para obtener el PDF.',
                'Primero: registra tus lotes. Segundo: ingresa los análisis de suelo de laboratorio. Tercero: genera los planes de fertilización. Si me dices en qué paso estás, te guío con más detalle.',
            ],
            'follow_up' => [
                '¿Quieres que te envíe los pasos detallados para crear un lote nuevo ahora mismo?'
            ],
        ],

        'greeting' => [
            'keywords' => ['hola', 'buenas', 'saludo', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches', 'que mas'],
            'responses' => [
                'Hola productor, ¡qué gusto saludarte! ¿En qué puedo acompañarte hoy?',
                '¡Qué alegría verte por aquí! Dime qué parte del sistema quieres que revisemos juntos.',
                'Hola, estoy listo para ayudarte con tus lotes, análisis o planes. ¿Qué te gustaría hacer?',
            ],
            'follow_up' => [
                'Recuerda que puedes preguntarme sobre registro, lotes, análisis de suelo o planes de fertilización.',
            ],
        ],

        'gratitude' => [
            'keywords' => ['gracias', 'muchas gracias', 'te agradezco', 'excelente', 'muy amable'],
            'responses' => [
                '¡Con gusto! Me alegra ayudarte. ¿Quieres revisar algo más?',
                'Para eso estoy. Cuando necesites orientación con tus cultivos puedes volver a escribirme.',
            ],
            'follow_up' => ['Si ya terminaste, recuerda generar y descargar tus planes actualizados.'],
        ],

        'farewell' => [
            'keywords' => ['chao', 'hasta luego', 'nos vemos', 'adios'],
            'responses' => [
                'Que tengas un día productivo y lleno de buenas cosechas. Aquí estaré cuando me necesites.',
                '¡Hasta pronto! Mantén al día tus análisis para que las recomendaciones sigan certeras.',
            ],
            'follow_up' => [],
        ],

        'registration_help' => [
            'keywords' => ['registr', 'crear usuario', 'nuevo usuario', 'darse de alta'],
            'responses' => [
                'Para registrarte ingresa tu nombre completo (al menos un nombre y un apellido), tu documento y ocupación. El sistema genera una contraseña usando tu documento. Al iniciar sesión podrás cambiarla sin problema.',
                'Ve a la opción "Registrarme", escribe tus datos personales y asegúrate de que el documento coincida con el que usarás para iniciar sesión. Estoy aquí por si se presenta algún bloqueo.',
            ],
            'follow_up' => ['Si tu correo es correcto, te enviaré los planes al instante cuando los generes.'],
        ],

        'login_help' => [
            'keywords' => ['iniciar sesion', 'login', 'entrar', 'no puedo entrar', 'contraseña', 'clave'],
            'responses' => [
                'Para iniciar sesión usa tu nombre completo como lo registraste (al menos nombre y apellido) y el número de identificación. Si olvidaste la contraseña escribe a soporte@agroco.com y te ayudamos a restablecerla.',
                'Si el sistema dice "credenciales inválidas", revisa que escribas el nombre sin abreviar y tu documento sin espacios. Tras varios intentos fallidos te bloqueamos por unos minutos para proteger tu cuenta.',
            ],
            'follow_up' => ['Cuando ingreses nuevamente verifica que tus planes estén actualizados.'],
        ],

        'email_verification' => [
            'keywords' => ['correo', 'verificar', 'email', 'no me llega', 'enviar correo'],
            'responses' => [
                'Verifica tu correo: si aparece como pendiente, entra a tu perfil y actualízalo. Cuando el correo está verificado, puedo enviarte los planes automáticamente.',
                'Si no te llega el PDF, asegúrate de que tu correo esté verificado. Al generar un plan te aviso si el envío quedó pendiente.',
            ],
            'follow_up' => ['Puedes reenviar el plan descargando el PDF y compartiéndolo por WhatsApp.'],
        ],

        'email_update_help' => [
            'keywords' => ['actualizar correo', 'cambiar correo', 'actualizar email', 'actualizar gmail', 'cambiar gmail', 'editar correo'],
            'responses' => [
                'Para actualizar tu correo (por ejemplo tu Gmail) entra a la sección "Perfil". Edita el campo de email, guarda los cambios y listo: a partir de ahí usaremos esa dirección para enviarte los planes en PDF.',
                'Si cambias de correo, recuerda revisar que esté bien escrito y que puedas recibir mensajes allí. El PDF del plan se enviará siempre al correo registrado en tu perfil.',
            ],
            'follow_up' => ['Si quieres, también puedes descargar el PDF desde la app y compartirlo por el canal que prefieras.'],
        ],

        'lots_help' => [
            'keywords' => ['lote', 'campo', 'predio', 'crear lote', 'actualizar lote', 'area', 'área', 'hectarea', 'hectareas'],
            'responses' => [
                'Ingresa a "Mis lotes", presiona "Agregar lote" y registra nombre, área en hectáreas y fecha de siembra (debe ser actual o pasada). Puedes añadir la ubicación para que tu equipo lo identifique rápido.',
                'Recuerda que un lote sin análisis no genera plan. Si eliminas un lote, también se borran sus análisis y planes asociados, así que haz una copia si necesitas conservarlos.',
            ],
            'follow_up' => ['Cuando completes el lote pasa a registrar el análisis de suelo para activar las recomendaciones.'],
        ],

        'analyses_help' => [
            'keywords' => ['analisis', 'análisis', 'laboratorio', 'suelo', 'nutrientes'],
            'responses' => [
                'Para registrar un análisis selecciona el lote, ingresa la fecha y los valores de laboratorio (P, K, Ca, Mg, etc.). Guarda y luego podrás generar el plan.',
                'Carga los resultados tal como vienen en el informe. Si un dato no aplica déjalo vacío, el sistema usará valores por defecto y te avisará qué nutrientes revisar.',
            ],
            'follow_up' => ['Cuando tengas el informe, ingresa cada nutriente para generar el plan actualizado.'],
        ],

        'plan_generation' => [
            'keywords' => [
                'plan', 'fertilizacion', 'fertilización', 'generar plan', 'recomendacion', 'recomendación',
                'descargar pdf', 'descargo el pdf', 'como descargo el pdf', 'donde esta el pdf', 'pdf del plan'
            ],
            'responses' => [
                'Una vez registres el análisis, abre la tarjeta y pulsa "Generar plan". Calculamos las dosis y te preparamos el PDF con recomendaciones por hectárea.',
                'Si modificas un análisis, vuelve a generar el plan para actualizar las dosis y la descarga. Así mantienes a tu equipo sincronizado.',
                'Para descargar el PDF entra al detalle del análisis que ya tiene plan, busca el botón "Descargar PDF" y ábrelo. Si tu correo está verificado, también te llega una copia por email.',
            ],
            'follow_up' => ['Verifica que tu correo esté verificado si necesitas recibir el PDF automáticamente.'],
        ],

        'fertilizer_explanation' => [
            'keywords' => [
                'para que sirven los fertilizantes', 'para que sirve ese fertilizante',
                'que es la urea', 'para que sirve la urea',
                'para que sirve el dap', 'para que sirve el kcl',
                'fuentes de nutrientes', 'que significan los productos del plan'
            ],
            'responses' => [
                'Cada fertilizante del plan aporta nutrientes específicos: la urea aporta Nitrógeno (N) para el crecimiento de la planta; el DAP aporta N y sobre todo Fósforo (P₂O₅) para raíces y macollamiento; el KCl aporta Potasio (K₂O) para llenado de grano y resistencia al acame; el sulfato de amonio aporta Nitrógeno y Azufre (S); y las enmiendas como yeso, cal o dolomita ayudan a corregir Ca y Mg y mejorar la estructura del suelo.',
                'Piensa en los fertilizantes como cajas de nutrientes: cada producto del plan tiene una función (N, P, K, S, Ca, Mg o micronutrientes como Zn, B, Mn). El sistema ya calculó las dosis, así que solo debes seguir las cantidades y fases indicadas en el PDF.',
            ],
            'follow_up' => ['Si me dices el nombre de un fertilizante específico (urea, DAP, KCl, yeso, etc.) puedo contarte qué rol cumple en el cultivo de arroz.'],
        ],

        'navigation_help' => [
            'keywords' => ['donde esta', 'no encuentro', 'menu', 'menú', 'navegar', 'pantalla'],
            'responses' => [
                'En la app, arriba encuentras el menú para ir a Inicio, Perfil y salir. Desde el inicio puedes entrar a "Mis lotes" y "Análisis" para manejar tu información.',
                'Si trabajas desde la web, el menú lateral te deja pasar de lotes a análisis en un clic. Yo puedo guiarte paso a paso si me cuentas qué buscas.',
            ],
            'follow_up' => ['¿Quieres que te envíe los pasos para crear un lote o registrar un análisis?'],
        ],

        'password_reset' => [
            'keywords' => ['olvide la contraseña', 'olvidé la contraseña', 'restablecer clave', 'recuperar password'],
            'responses' => [
                'Si olvidaste la contraseña, en la pantalla de inicio de sesión selecciona "Recuperar contraseña" (si está disponible) o escríbenos a soporte@agroco.com y te ayudamos a restablecerla.',
                'Por seguridad, cualquier contraseña temporal debe cambiarse apenas ingreses de nuevo. Elige una clave que no sea igual a tu documento.',
            ],
            'follow_up' => ['Guarda tu nueva contraseña y evita compartirla.'],
        ],
    ],

    'fallback_responses' => [
        'Gracias por tu mensaje. ¿Podrías contarme con más detalle qué parte del sistema quieres usar (registro, lotes, análisis, plan)?',
        'Aún estoy aprendiendo. Intenta decirme si necesitas ayuda con registro, lotes, análisis o generación de planes.',
        'Estoy aquí para ayudarte. Si me dices qué quieres hacer paso a paso podré guiarte mejor.',
        '¿Te refieres a registro, análisis, plan o almacenamiento? Dame una pista y te respondo mejor.',
    ],
];

