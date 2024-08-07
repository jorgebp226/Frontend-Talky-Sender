import React from 'react';
import { View, Text } from '@aws-amplify/ui-react';

const TermsAndConditions = () => {
  return (
    <View padding="20px">
      <Text as="h1">Términos y Condiciones</Text>
      <Text>
        <h2>1. Introducción</h2>
        Bienvenido a Talky Sender ("nosotros", "nuestro", "la App"). Estos Términos y Condiciones ("Términos") regulan el uso de nuestro servicio de software como servicio (SAAS) que permite a los usuarios conectar sus cuentas de WhatsApp para enviar mensajes personalizados y realizar análisis de los mensajes enviados y recibidos. Al utilizar nuestra App, usted ("usuario", "usted") acepta estos Términos en su totalidad. Si no está de acuerdo con estos Términos, no debe utilizar nuestra App.
        
        <h2>2. Descripción del Servicio</h2>
        Talky Sender permite a los usuarios conectar sus cuentas de WhatsApp a nuestra plataforma mediante la librería de Bailyes de JavaScript. Esto nos permite:
        <ul>
          <li>Enviar mensajes personalizados a través de WhatsApp.</li>
          <li>Guardar credenciales generadas de manera segura.</li>
          <li>Almacenar de manera segura en MongoDB los mensajes enviados y recibidos para ofrecer análisis de rendimiento.</li>
        </ul>
        
        <h2>3. Uso de la App</h2>
        <ul>
          <li>Los usuarios deben ser mayores de 18 años para utilizar la App.</li>
          <li>Usted es responsable de la seguridad de sus credenciales de WhatsApp. No comparta sus credenciales con terceros.</li>
          <li>Usted garantiza que el uso que hará de la App cumplirá con todas las leyes y regulaciones aplicables, incluyendo las leyes de protección de datos.</li>
        </ul>
        
        <h2>4. Propiedad Intelectual</h2>
        Todos los derechos de propiedad intelectual sobre la App y su contenido son propiedad de Talky Sender, salvo que se indique lo contrario. Usted no puede copiar, modificar, distribuir, vender o alquilar ninguna parte de nuestros servicios o software, ni realizar ingeniería inversa del software.
        
        <h2>5. Limitación de Responsabilidad</h2>
        Talky Sender no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por la pérdida de beneficios o ingresos, ya sea incurridos directa o indirectamente, ni por la pérdida de datos, uso, fondo de comercio u otras pérdidas intangibles.
        
        <h2>6. Terminación</h2>
        Nos reservamos el derecho de suspender o terminar su acceso a la App en cualquier momento, sin previo aviso y por cualquier motivo, incluyendo la violación de estos Términos.
        
        <h2>7. Modificaciones</h2>
        Podemos revisar estos Términos en cualquier momento. Las modificaciones serán efectivas inmediatamente después de su publicación en nuestra App. Su uso continuado de la App tras la publicación de cualquier cambio constituye su aceptación de los nuevos Términos.
        
        <h2>8. Ley Aplicable</h2>
        Estos Términos se regirán e interpretarán de acuerdo con las leyes de España. Cualquier disputa relacionada con estos Términos será sometida a la jurisdicción exclusiva de los tribunales de Madrid, España.

        <h2>9. Recolección y Uso de Datos</h2>
        Al utilizar nuestra App, usted acepta que podamos recolectar y utilizar sus datos personales y los datos de sus mensajes de WhatsApp para mejorar nuestros servicios y ofrecer análisis de rendimiento personalizados. Toda la información será manejada de acuerdo con nuestra Política de Privacidad.

        <h2>10. Política de Uso Aceptable</h2>
        Usted se compromete a no utilizar la App para enviar mensajes no solicitados o spam, ni para cualquier propósito ilegal o no autorizado. Nos reservamos el derecho de suspender o terminar su cuenta si se detecta un uso indebido de la App.

        <h2>11. Confidencialidad</h2>
        Ambas partes acuerdan mantener la confidencialidad de cualquier información confidencial a la que tengan acceso durante la duración del uso de la App. Esta obligación de confidencialidad permanecerá en vigor aun después de la terminación de estos Términos.
      </Text>
    </View>
  );
};

export default TermsAndConditions;
