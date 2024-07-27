import { useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'eu-west-3_evgrQogwE', // Reemplaza con tu User Pool ID
  ClientId: '6i0hat96cv235qrmfip0uok35d' // Reemplaza con tu App Client ID
};

const userPool = new CognitoUserPool(poolData);

export const useUserAttributes = (isAuthenticated) => {
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('El usuario no está autenticado todavía.');
      return;
    }

    const user = userPool.getCurrentUser();
    if (!user) {
      console.error('No se encontró un usuario actualmente autenticado.');
      return;
    }

    user.getSession((err, session) => {
      if (err) {
        console.error('Error al obtener la sesión:', err);
        return;
      }

      if (!session.isValid()) {
        console.error('La sesión no es válida.');
        return;
      }

      console.log('La sesión es válida:', session.isValid());

      user.getUserAttributes((err, attributes) => {
        if (err) {
          console.error('Error al obtener los atributos del usuario:', err);
          return;
        }

        if (!attributes) {
          console.error('No se encontraron atributos para el usuario.');
          return;
        }

        const attrs = attributes.reduce((acc, attribute) => {
          acc[attribute.Name] = attribute.Value;
          return acc;
        }, {});

        localStorage.setItem('userAttributes', JSON.stringify(attrs));
        //console.log('Atributos del usuario:', attrs); // Log aquí
      });
    });
  }, [isAuthenticated]);
};
