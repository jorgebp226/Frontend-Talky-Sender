// src/components/plans.js

export const plans = {
    monthly: [
      {
        name: 'Básico',
        price: '150€',
        period: '/mes',
        initialPrice: '150€/mes (los primeros 12 meses)',
        regularPrice: '192.32€/mes (después de los 12 meses)',
        features: [
          'Hasta 100 contactos',
          'Hasta 500 mensajes al mes',
          'Envío de mensajes personalizados sin imágenes',
          'Soporte por correo electrónico'
        ],
        priceId: 'price_1PgiSCCNobZETuuSNjMZMCso',
      },
      {
        name: 'Estándar',
        price: '300€',
        period: '/mes',
        initialPrice: '300€/mes (los primeros 12 meses)',
        regularPrice: '348€/mes (después de los 12 meses)',
        features: [
          'Hasta 400 contactos',
          'Hasta 1,000 mensajes al mes',
          'Envío de mensajes personalizados con imágenes',
          'Soporte por correo electrónico y chat en vivo',
        ],
        priceId: 'price_1PgiSZCNobZETuuSXxbq64wW',
        popular: true,
      },
      {
        name: 'Premium',
        price: '600€',
        period: '/mes',
        initialPrice: '600€/mes (los primeros 12 meses)',
        regularPrice: '678€/mes (después de los 12 meses)',
        features: [
          'Hasta 1,000 contactos',
          'Hasta 5,000 mensajes al mes',
          'Envío de mensajes personalizados con imágenes y multimedia (videos, documentos)',
          'Soporte prioritario 24/7',
          'Informes avanzados con analítica detallada',
        ],
        priceId: 'price_1PgiT7CNobZETuuSU4WZXITt',
      },
      {
        name: 'Custom', // Nueva opción Custom
        price: 'Variable',
        period: '',
        features: ['Este plan requiere un código personalizado para activar'],
        priceId: 'price_1Q2pcICNobZETuuSUp9cqppq', // Este es el price_id que se guardará
      },
    ],
    yearly: [
      {
        name: 'Básico',
        price: '125€',
        period: '/mes',
        features: [
          'Hasta 100 contactos',
          'Hasta 500 mensajes al mes',
          'Envío de mensajes personalizados sin imágenes',
          'Soporte por correo electrónico',
          'Informes básicos de entrega y lectura'
        ],
        priceId: 'price_1PgiV3CNobZETuuSjYl75c62',
      },
      {
        name: 'Estándar',
        price: '249€',
        period: '/mes',
        features: [
          'Hasta 400 contactos',
          'Hasta 1,000 mensajes al mes',
          'Envío de mensajes personalizados con imágenes',
          'Soporte por correo electrónico y chat en vivo',
          'Informes avanzados de entrega y lectura',
          'Integración con CRM'
        ],
        priceId: 'price_1PgiUSCNobZETuuSidBlmy2J',
        popular: true,
      },
      {
        name: 'Premium',
        price: '499€',
        period: '/mes',
        features: [
          'Hasta 1,000 contactos',
          'Hasta 5,000 mensajes al mes',
          'Envío de mensajes personalizados con imágenes y multimedia (videos, documentos)',
          'Soporte prioritario 24/7',
          'Informes avanzados con analítica detallada',
          'Integración con CRM y herramientas de marketing',
          'Automatización de campañas'
        ],
        priceId: 'price_1PgiTtCNobZETuuSMIuumhXr',
      },
      {
        name: 'Custom', // Nueva opción Custom
        price: 'Variable',
        period: '',
        features: ['Este plan requiere un código personalizado para activar'],
        priceId: 'price_1Q2pcICNobZETuuSUp9cqppq', // Este es el price_id que se guardará
      },
    ],
  };
  