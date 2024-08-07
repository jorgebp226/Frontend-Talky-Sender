import React from 'react';
import { View, Text } from '@aws-amplify/ui-react';

const PrivacyPolicy = () => {
  return (
    <View padding="20px">
      <Text as="h1">Política de Privacidad</Text>
      <Text>
        <h2>1. Introducción</h2>
        En Talky Sender, respetamos su privacidad y estamos comprometidos a proteger los datos personales que compartes con nosotros. Esta Política de Privacidad explica cómo recopilamos, utilizamos y protegemos su información.
        
        <h2>2. Información que Recopilamos</h2>
        Recopilamos los siguientes tipos de información:
        <ul>
          <li>Información de cuenta de WhatsApp: Incluye credenciales generadas con la librería de Bailyes de JavaScript.</li>
          <li>Mensajes: Guardamos de manera segura los mensajes enviados y recibidos a través de su cuenta de WhatsApp.</li>
          <li>Datos de uso: Información sobre cómo utiliza nuestra App, incluyendo análisis de rendimiento de los mensajes.</li>
        </ul>
        
        <h2>3. Uso de la Información</h2>
        Utilizamos la información recopilada para:
        <ul>
          <li>Proporcionar y mejorar nuestros servicios.</li>
          <li>Enviar mensajes personalizados a sus clientes.</li>
          <li>Realizar análisis de rendimiento de sus mensajes.</li>
          <li>Garantizar la seguridad de su cuenta y nuestros servicios.</li>
          <li>Entrenar modelos de aprendizaje automático para mejorar nuestras recomendaciones y métricas.</li>
        </ul>
        
        <h2>4. Compartición de Información</h2>
        No compartimos su información personal con terceros, excepto en las siguientes circunstancias:
        <ul>
          <li>Con su consentimiento explícito.</li>
          <li>Para cumplir con obligaciones legales.</li>
          <li>Para proteger y defender nuestros derechos y propiedades.</li>
        </ul>
        
        <h2>5. Seguridad</h2>
        Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra accesos no autorizados, alteraciones, divulgaciones o destrucción.
        
        <h2>6. Retención de Datos</h2>
        Retenemos su información personal solo durante el tiempo necesario para cumplir con los fines para los cuales fue recopilada, incluyendo cumplir con requisitos legales, contables o de informes.
        
        <h2>7. Sus Derechos</h2>
        En virtud del RGPD, usted tiene derecho a:
        <ul>
          <li>Acceder a sus datos personales.</li>
          <li>Rectificar datos inexactos o incompletos.</li>
          <li>Solicitar la eliminación de sus datos personales.</li>
          <li>Oponerse al tratamiento de sus datos personales.</li>
          <li>Solicitar la portabilidad de sus datos.</li>
          <li>Retirar su consentimiento en cualquier momento.</li>
        </ul>
        
        <h2>8. Cambios en la Política de Privacidad</h2>
        Podemos actualizar esta Política de Privacidad de vez en cuando. Cualquier cambio será notificado a través de nuestra App y será efectivo inmediatamente después de su publicación.
        
        <h2>9. Contacto</h2>
        Si tiene alguna pregunta o inquietud sobre esta Política de Privacidad, puede contactarnos en [dirección de correo electrónico de contacto].
      </Text>
    </View>
  );
};

export default PrivacyPolicy;
