import { useEffect, useState } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useAuthenticator } from '@aws-amplify/ui-react';

const poolData = {
  UserPoolId: 'eu-west-3_evgrQogwE', // Reemplaza con tu User Pool ID
  ClientId: '6i0hat96cv235qrmfip0uok35d' // Reemplaza con tu App Client ID
};

const userPool = new CognitoUserPool(poolData);

export const useUserAttributes = () => {
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const [attributes, setAttributes] = useState(null);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !user) {
      return;
    }

    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err || !session.isValid()) {
        console.error('Error de sesión:', err);
        return;
      }

      cognitoUser.getUserAttributes((err, userAttributes) => {
        if (err) {
          console.error('Error al obtener atributos:', err);
          return;
        }

        const attrs = userAttributes.reduce((acc, attr) => {
          acc[attr.Name] = attr.Value;
          return acc;
        }, {});

        localStorage.setItem('userAttributes', JSON.stringify(attrs));
        setAttributes(attrs);
      });
    });
  }, [user, authStatus]);

  return attributes;
};
