
    // ========================================
    // CHATBOT VENDEDOR - SISTEMA INTELIGENTE
    // ========================================

    (function() {
      'use strict';

      // ===== CONFIGURACIÓN =====
      const CONFIG = {
        developerName: 'Ernesto',
        whatsappNumber: '972498691', // Cambiar por número real
        autoOpenDelay: 6000, // 6 segundos
        inactivityTimeout: 45000, // 45 segundos
        typingDelay: { min: 800, max: 2000 },
        messageDelay: { min: 500, max: 1500 }
      };

      // ===== ESTADO DEL CHATBOT =====
      const state = {
        isOpen: false,
        hasOpened: false,
        conversationStage: 0,
        leadScore: 0,
        projectType: null,
        businessType: null,
        hasProblem: false,
        needsConsultation: false,
        isTyping: false,
        inactivityTimer: null,
        reEngagementCount: 0
      };

      // ===== ELEMENTOS DEL DOM =====
      let toggleBtn = null;
      let chatWindow = null;
      let messagesContainer = null;
      let inputField = null;
      let sendBtn = null;
      let closeBtn = null;

      // ===== BASE DE DATOS DE RESPUESTAS =====
      const RESPONSES = {
        greeting: {
          message: `Hola, estoy ayudando a ${CONFIG.developerName}, desarrollador de software, a analizar nuevos proyectos.\n\n¿Estás buscando crear algún sistema, aplicación o página web para tu negocio?`,
          quickReplies: [
            'Crear una pagina web',
            'Crear una aplicacion web',
            'Automatizar procesos',
            'Crear una tienda online',
            'Solo estoy mirando'
          ]
        },

        projectTypes: {
          'Crear una pagina web': {
            message: 'Excelente elección. Una página web profesional puede ser el activo digital más importante para tu negocio.\n\n¿Es para un negocio que ya está funcionando o es un proyecto nuevo?',
            quickReplies: ['Negocio existente', 'Proyecto nuevo', 'Ambos casos'],
            score: 15,
            type: 'web'
          },
          'Crear una aplicacion web': {
            message: 'Las aplicaciones web son una gran inversión. Permiten automatizar procesos y escalar operaciones.\n\n¿Qué tipo de problema o necesidad quieres resolver?',
            quickReplies: ['Gestion de datos', 'Automatizacion', 'Plataforma de servicios', 'Otro'],
            score: 20,
            type: 'app'
          },
          'Automatizar procesos': {
            message: 'La automatización es clave para escalar cualquier negocio. ${CONFIG.developerName} ha ayudado a empresas a reducir hasta un 60% el tiempo en tareas repetitivas.\n\n¿Qué procesos te gustaría automatizar?',
            quickReplies: ['Facturacion', 'Gestion de clientes', 'Inventarios', 'Otro proceso'],
            score: 20,
            type: 'automation'
          },
          'Crear una tienda online': {
            message: 'Una tienda online bien desarrollada puede aumentar significativamente tus ventas. El comercio electrónico sigue creciendo año tras año.\n\n¿Ya vendes productos físicamente o es un negocio 100% digital?',
            quickReplies: ['Ya vendo fisicamente', '100% digital', 'Es un proyecto nuevo'],
            score: 18,
            type: 'ecommerce'
          },
          'Solo estoy mirando': {
            message: `Entiendo, no hay presión.\n\nSi tienes alguna pregunta sobre desarrollo de software, diseño web o tecnología en general, estoy aquí para ayudarte.\n\nTambién puedes ver algunos proyectos de ${CONFIG.developerName} en el portafolio.`,
            quickReplies: ['Ver proyectos', 'Tengo una pregunta', 'Gracias, vuelvo luego'],
            score: 2,
            type: 'browser'
          }
        },

        businessStage: {
          'Negocio existente': {
            message: 'Perfecto. Trabajar con negocios establecidos tiene grandes ventajas: ya hay datos, procesos y clientes.\n\n¿Cuál es el principal desafío que enfrentas actualmente con tu presencia digital?',
            quickReplies: ['Sitio desactualizado', 'No aparecemos en Google', 'No generamos ventas', 'Otro desafio'],
            score: 10
          },
          'Proyecto nuevo': {
            message: 'Empezar con una base sólida es fundamental. Un proyecto bien desarrollado desde el inicio evita problemas costosos después.\n\n¿Ya tienes definida la idea o necesitas orientación para estructurarla?',
            quickReplies: ['Idea definida', 'Necesito orientacion', 'Tengo un borrador'],
            score: 8
          },
          'Ambos casos': {
            message: 'Interesante escenario. ${CONFIG.developerName} tiene experiencia trabajando con empresas en transición.\n\nCuéntame más: ¿qué situación específica quieres resolver?',
            quickReplies: ['Expandir negocio', 'Modernizar sistemas', 'Nuevo producto/servicio'],
            score: 12
          }
        },

        problems: {
          'Sitio desactualizado': {
            message: 'Un sitio desactualizado puede estar costándote clientes sin que te des cuenta. La primera impresión digital es crucial.\n\n${CONFIG.developerName} puede crear un sitio moderno, rápido y optimizado para convertir visitantes en clientes.',
            score: 8
          },
          'No aparecemos en Google': {
            message: 'El SEO técnico es fundamental. Un sitio bien desarrollado desde la base tiene más probabilidades de rankear.\n\n${CONFIG.developerName} desarrolla sitios con SEO técnico incluido desde el día uno.',
            score: 8
          },
          'No generamos ventas': {
            message: 'Este es uno de los problemas más comunes. Un sitio sin estrategia de conversión es solo una tarjeta de presentación cara.\n\n${CONFIG.developerName} diseña con psicología de conversión: cada elemento tiene un propósito.',
            score: 10
          },
          'Gestion de datos': {
            message: 'La gestión de datos eficiente puede ahorrar horas de trabajo semanales. ${CONFIG.developerName} ha desarrollado sistemas que reducen hasta un 70% el tiempo en tareas administrativas.',
            score: 10
          },
          'Automatizacion': {
            message: 'La automatización inteligente transforma operaciones. Imagina procesos que funcionen 24/7 sin intervención manual.\n\n${CONFIG.developerName} especializa en crear sistemas que trabajan mientras tú descansas.',
            score: 10
          },
          'Idea definida': {
            message: 'Excelente. Tener claridad acelera enormemente el proceso de desarrollo.\n\nCon la información correcta, ${CONFIG.developerName} puede darte un estimado preciso y empezar a trabajar pronto.',
            score: 12
          },
          'Necesito orientacion': {
            message: 'No te preocupes, es normal. Muchos clientes exitosos empezaron sin saber exactamente lo que necesitaban.\n\n${CONFIG.developerName} ofrece consultas gratuitas para ayudarte a estructurar tu idea y definir el alcance.',
            score: 6
          }
        },

        interestIndicators: [
          'Cuanto cuesta',
          'precio',
          'presupuesto',
          'tiempo',
          'plazo',
          'cuando podria',
          'necesito',
          'urgente',
          'proyecto'
        ],

        closing: {
          threshold: 25,
          messages: [
            'Por lo que me comentas, definitivamente es un proyecto interesante. ${CONFIG.developerName} puede ayudarte a desarrollar esa solución.\n\nSi quieres, podemos revisar tu proyecto ahora mismo por WhatsApp y resolver tus dudas en vivo.',
            'Tienes un proyecto con buen potencial. ${CONFIG.developerName} ha trabajado en casos similares con excelentes resultados.\n\nLa mejor forma de avanzar es conversar directamente. ¿Te gustaría que ${CONFIG.developerName} te contacte por WhatsApp?',
            'Veo que tienes claridad en lo que necesitas. Eso facilita mucho el proceso de desarrollo.\n\n${CONFIG.developerName} está disponible para discutir los detalles de tu proyecto. ¿Hablamos por WhatsApp?'
          ]
        },

        reEngagement: [
          '¿Sigues ahí? Si tienes alguna pregunta, estoy para ayudarte.',
          '¿Necesitas más información sobre algún servicio? Puedo ayudarte.',
          'Si prefieres, también puedes contactar directamente a ${CONFIG.developerName} por WhatsApp.'
        ]
      };

      // ===== FUNCIONES UTILITARIAS =====
      function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
      }

      function getCurrentTime() {
        return new Date().toLocaleTimeString('es-MX', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }

      function containsKeywords(text, keywords) {
        const lowerText = text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword));
      }

      // ===== GESTIÓN DE MENSAJES =====
      function addMessage(text, isBot = true, withReplies = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
        
        const avatarSvg = isBot 
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

        const formattedText = text.replace(/\${CONFIG\.developerName}/g, CONFIG.developerName);

        messageDiv.innerHTML = `
          <div class="message-avatar">${avatarSvg}</div>
          <div class="message-content">
            <div class="message-bubble">${escapeHtml(formattedText)}</div>
            <div class="message-time">${getCurrentTime()}</div>
          </div>
        `;

        messagesContainer.appendChild(messageDiv);
        
        if (withReplies && withReplies.length > 0) {
          const repliesDiv = document.createElement('div');
          repliesDiv.className = 'quick-replies';
          
          withReplies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = reply;
            btn.addEventListener('click', () => handleQuickReply(reply));
            repliesDiv.appendChild(btn);
          });
          
          messagesContainer.appendChild(repliesDiv);
        }

        scrollToBottom();
      }

      function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
          <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
      }

      function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
      }

      function addCTAButton() {
        const ctaDiv = document.createElement('div');
        ctaDiv.className = 'message bot';
        ctaDiv.innerHTML = `
          <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div class="message-content">
  <a href="https://wa.me/${CONFIG.whatsappNumber}?text=🚀%20Hola%20${CONFIG.developerName}!%0A%0A👋%20Estoy%20interesado%20en%20desarrollar%20un%20*proyecto%20web*.%0A%0A💡%20Me%20gustaria%20saber:%0A•%20Como%20podemos%20empezar%0A•%20Tiempo%20de%20desarrollo%0A•%20Costo%20aproximado%0A%0A📲%20Quedo%20atento%20a%20tu%20respuesta.%20Gracias!" 
     target="_blank" 
     class="cta-button">
     
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>

    Hablar por WhatsApp
  </a>
</div>
        `;
        messagesContainer.appendChild(ctaDiv);
        scrollToBottom();
      }

      function scrollToBottom() {
        requestAnimationFrame(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      }

      // ===== LÓGICA DE CONVERSACIÓN =====
      function processUserMessage(text) {
        // Reset inactivity timer
        resetInactivityTimer();
        
        // Add user message
        addMessage(text, false);
        
        // Show typing indicator
        state.isTyping = true;
        addTypingIndicator();
        
        // Process after delay
        const delay = randomDelay(CONFIG.typingDelay.min, CONFIG.typingDelay.max);
        
        setTimeout(() => {
          removeTypingIndicator();
          state.isTyping = false;
          generateResponse(text);
        }, delay);
      }

      function generateResponse(text) {
        const lowerText = text.toLowerCase();
        
        // Check for interest indicators
        if (containsKeywords(text, RESPONSES.interestIndicators)) {
          state.leadScore += 15;
          state.hasProblem = true;
        }

        // Stage-based responses
        switch (state.conversationStage) {
          case 0:
            handleInitialResponse(text);
            break;
          case 1:
            handleProjectResponse(text);
            break;
          case 2:
            handleBusinessResponse(text);
            break;
          case 3:
            handleProblemResponse(text);
            break;
          default:
            handleGeneralResponse(text);
        }

        // Check if ready to close
        if (state.leadScore >= RESPONSES.closing.threshold && state.conversationStage >= 2) {
          setTimeout(() => {
            showClosingMessage();
          }, randomDelay(CONFIG.messageDelay.min, CONFIG.messageDelay.max));
        }
      }

      function handleInitialResponse(text) {
        // Find matching project type
        let matched = false;
        
        for (const [key, value] of Object.entries(RESPONSES.projectTypes)) {
          if (text.toLowerCase().includes(key.toLowerCase().substring(0, 10))) {
            state.projectType = value.type;
            state.leadScore += value.score;
            state.conversationStage = 1;
            addMessage(value.message, true, value.quickReplies);
            matched = true;
            break;
          }
        }

        if (!matched) {
          // Treat as custom response
          state.leadScore += 5;
          state.conversationStage = 1;
          addMessage('Entiendo. Cuéntame más sobre lo que necesitas y te ayudo a identificar la mejor solución.', true);
        }
      }

      function handleProjectResponse(text) {
        let matched = false;
        
        for (const [key, value] of Object.entries(RESPONSES.businessStage)) {
          if (text.toLowerCase().includes(key.toLowerCase().substring(0, 8))) {
            state.businessType = key;
            state.leadScore += value.score;
            state.conversationStage = 2;
            addMessage(value.message, true, value.quickReplies);
            matched = true;
            break;
          }
        }

        if (!matched) {
          state.conversationStage = 2;
          addMessage('Interesante. ¿Qué problema específico quieres solucionar con este proyecto?', true);
        }
      }

      function handleBusinessResponse(text) {
        let matched = false;
        
        for (const [key, value] of Object.entries(RESPONSES.problems)) {
          if (text.toLowerCase().includes(key.toLowerCase().substring(0, 6))) {
            state.leadScore += value.score;
            state.hasProblem = true;
            state.conversationStage = 3;
            addMessage(value.message, true);
            matched = true;
            break;
          }
        }

        if (!matched) {
          state.leadScore += 8;
          state.conversationStage = 3;
          addMessage('Gracias por compartir eso. ${CONFIG.developerName} ha trabajado en casos similares y puede ofrecerte una solución personalizada.\n\n¿Te gustaría saber más sobre el proceso de trabajo?', true, ['Si, cuentame', 'Prefiero hablar directo']);
        }
      }

      function handleProblemResponse(text) {
        if (text.toLowerCase().includes('si') || text.toLowerCase().includes('claro')) {
          addMessage('El proceso es simple:\n\n1. Agendamos una llamada gratuita para entender tu proyecto\n2. Recibes una propuesta detallada con precios y tiempos\n3. Si aceptas, comenzamos el desarrollo\n4. Recibes actualizaciones constantes hasta la entrega\n\nTodo claro y sin sorpresas.', true);
        } else {
          handleGeneralResponse(text);
        }
      }

      function handleGeneralResponse(text) {
        state.leadScore += 5;
        
        if (state.leadScore < RESPONSES.closing.threshold) {
          addMessage('Entiendo. ¿Hay algo específico sobre el desarrollo de tu proyecto que te gustaría saber?', true);
        }
      }

      function showClosingMessage() {
        const messageIndex = Math.min(state.reEngagementCount, RESPONSES.closing.messages.length - 1);
        const closingMessage = RESPONSES.closing.messages[messageIndex];
        
        addMessage(closingMessage, true);
        setTimeout(() => {
          addCTAButton();
        }, 500);
      }

      function handleQuickReply(text) {
        // Remove existing quick replies
        const existingReplies = document.querySelector('.quick-replies');
        if (existingReplies) existingReplies.remove();
        
        // Process the reply
        processUserMessage(text);
      }

      // ===== GESTIÓN DE UI =====
      function openChat() {
        state.isOpen = true;
        state.hasOpened = true;
        toggleBtn.classList.add('active');
        chatWindow.classList.add('open');
        
        // Remove notification dot
        const dot = toggleBtn.querySelector('.notification-dot');
        if (dot) dot.style.display = 'none';
        
        // Start conversation if first time
        if (messagesContainer.children.length === 0) {
          setTimeout(() => {
            addMessage(RESPONSES.greeting.message, true, RESPONSES.greeting.quickReplies);
          }, 500);
        }
        
        resetInactivityTimer();
        inputField.focus();
      }

      function closeChat() {
        state.isOpen = false;
        toggleBtn.classList.remove('active');
        chatWindow.classList.remove('open');
        clearInactivityTimer();
      }

      function toggleChat() {
        if (state.isOpen) {
          closeChat();
        } else {
          openChat();
        }
      }

      // ===== AUTOMATIZACIÓN =====
      function resetInactivityTimer() {
        clearInactivityTimer();
        
        state.inactivityTimer = setTimeout(() => {
          if (state.isOpen && !state.isTyping && state.reEngagementCount < 2) {
            showReEngagement();
          }
        }, CONFIG.inactivityTimeout);
      }

      function clearInactivityTimer() {
        if (state.inactivityTimer) {
          clearTimeout(state.inactivityTimer);
          state.inactivityTimer = null;
        }
      }

      function showReEngagement() {
        state.reEngagementCount++;
        const message = RESPONSES.reEngagement[Math.min(state.reEngagementCount - 1, RESPONSES.reEngagement.length - 1)];
        addMessage(message, true);
      }

      function autoOpen() {
        if (!state.hasOpened) {
          // Show notification animation
          toggleBtn.style.animation = 'none';
          toggleBtn.offsetHeight; // Trigger reflow
          toggleBtn.style.animation = 'floatIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
          
          setTimeout(() => {
            openChat();
          }, 500);
        }
      }

      // ===== EVENT HANDLERS =====
      function handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }

      function sendMessage() {
        const text = inputField.value.trim();
        if (text) {
          inputField.value = '';
          inputField.style.height = 'auto';
          processUserMessage(text);
        }
      }

      function autoResizeInput() {
        inputField.style.height = 'auto';
        inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
      }

      // ===== INICIALIZACIÓN =====
      function init() {
        // Get DOM elements
        toggleBtn = document.getElementById('chatbotToggle');
        chatWindow = document.getElementById('chatbotWindow');
        messagesContainer = document.getElementById('chatbotMessages');
        inputField = document.getElementById('chatbotInput');
        sendBtn = document.getElementById('chatbotSend');
        closeBtn = document.getElementById('chatbotClose');

        // Bind events
        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', closeChat);
        sendBtn.addEventListener('click', sendMessage);
        inputField.addEventListener('keydown', handleInputKeydown);
        inputField.addEventListener('input', autoResizeInput);

        // Auto-open after delay
        setTimeout(autoOpen, CONFIG.autoOpenDelay);

        // Detect page visibility
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            clearInactivityTimer();
          } else if (state.isOpen) {
            resetInactivityTimer();
          }
        });
      }

      // Start when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();
  