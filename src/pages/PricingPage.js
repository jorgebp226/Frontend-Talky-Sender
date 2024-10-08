import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingPage.css';
import Header from '../components/Header2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const plans = {
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
      priceId: 'price_1Pl7ICCNobZETuuSkogOJhfj',
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
      priceId: 'price_1Pl7HhCNobZETuuSU2R71M0i',
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
      priceId: 'price_1Pl7H8CNobZETuuSh8M73qD5',
    },
    {
      name: 'Custom', // Nueva opción Custom
      price: 'Variable',
      period: '',
      features: ['Este plan requiere un código personalizado para activar'],
      priceId: 'price_1Q2q6dCNobZETuuSkqYK0Se0', // Este es el price_id que se guardará
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
      priceId: 'price_1Pl7EkCNobZETuuSqKuEep2Q',
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
      priceId: 'price_1Pl7G0CNobZETuuSTW40UOws',
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
      priceId: 'price_1Pl7GZCNobZETuuSySWpNTlt',
    },
    {
      name: 'Custom', // Nueva opción Custom
      price: 'Variable',
      period: '',
      features: ['Este plan requiere un código personalizado para activar'],
      priceId: 'price_1Q2q6dCNobZETuuSkqYK0Se0', // Este es el price_id que se guardará
    },
  ],
};

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('yearly');
  const navigate = useNavigate();

  useEffect(() => {
    setBillingCycle('yearly');
  }, []);

  const handlePlanSelection = (plan) => {
    if (plan.name === 'Custom') {
      // Guardar el price_id específico para Custom
      localStorage.setItem('selectedPriceId', plan.priceId);
      localStorage.setItem('selectedPlanName', plan.name); // Aquí ya se guarda correctamente el nombre del plan
      localStorage.removeItem('selectedBillingCycle'); // Eliminar el ciclo de facturación para evitar conflictos
      navigate('/enter-code'); // Redirigir a la página de código
    } else {
      localStorage.setItem('selectedPriceId', plan.priceId);
      localStorage.setItem('selectedPlanName', plan.name);
      localStorage.setItem('selectedBillingCycle', billingCycle); // Guardar solo para planes que no sean Custom
      navigate('/register');
    }
  };

  return (
    <div className="pricing-page">
      <Header />
      <div className="pricing-container">
        <h1 className="pricing-title">La elección obvia para una comunicación centrada en el cliente</h1>
        <p className="pricing-subtitle">Elige el plan que mejor se ajusta a las necesidades de tu negocio.</p>
        
        <div className="billing-toggle">
          <span className={billingCycle === 'monthly' ? 'active' : ''}>Mensual</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={billingCycle === 'yearly'}
              onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            />
            <span className="slider round"></span>
          </label>
          <span className={billingCycle === 'yearly' ? 'active' : ''}>Anual (ahorra 15%)</span>
        </div>

        <div className="pricing-plans">
          {plans[billingCycle].map((plan, index) => (
            <div key={index} className={`pricing-plan ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-tag">Más popular</div>}
              <h2>{plan.name}</h2>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <ul className="features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <FontAwesomeIcon icon={faCheck} className="feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePlanSelection(plan)} className="select-plan-btn">
                Seleccionar plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
