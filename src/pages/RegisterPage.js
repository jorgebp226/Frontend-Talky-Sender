import React, { useState } from 'react';
import { Authenticator, useTheme, View, Image, Text, Heading, useAuthenticator, CheckboxField } from '@aws-amplify/ui-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';
import { I18n } from '@aws-amplify/core';
import { theme } from './loginPageConfig';
import { useUserAttributes } from '../hooks/useUserAttributes';

const components = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View padding={tokens.space.medium}>
        <Link to="/">
          <Image
            alt="Logo de Talky"
            src={`${process.env.PUBLIC_URL}/Talkylogo.png`}
            height="80px"
            style={{ position: 'absolute', top: '20px', left: '20px', cursor: 'pointer' }}
          />
        </Link>
      </View>
    );
  },
  Footer() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Text color={tokens.colors.neutral[80]}>
          &copy; Todos los derechos reservados
        </Text>
      </View>
    );
  },
  SignUp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {I18n.get('Crea tu cuenta en Talky')}
        </Heading>
      );
    },
    Footer({ setMarketingConsent }) {
      return (
        <View textAlign="left" padding="20px">
          <CheckboxField
            label={
              <Text>
                No quiero recibir correos electrónicos sobre Talky, actualizaciones de productos y funciones relacionadas, ni tampoco prácticas recomendadas de marketing ni promociones de Talky. Al no marcar la casilla, acepto que se me suscriba de forma predeterminada.
              </Text>
            }
            name="marketing-consent"
            value="yes"
            onChange={(e) => setMarketingConsent(!e.target.checked)}
          />
          <Text padding="20px 0">
            Al crear una cuenta, aceptas nuestras <Link to="/terms-and-conditions">Condiciones</Link> y declaras haber leído y estar de acuerdo con la <Link to="/privacy-policy">Declaración de privacidad global</Link>.
          </Text>
        </View>
      );
    },
  },
};

const formFields = {
  signUp: {
    email: {
      label: I18n.get('Correo electrónico'),
      placeholder: I18n.get('Introduce tu correo electrónico'),
      isRequired: true,
      order: 1
    },
    password: {
      label: I18n.get('Contraseña'),
      isRequired: true,
      order: 2
    },
    confirm_password: {
      label: I18n.get('Confirmar contraseña'),
      isRequired: true,
      order: 3
    }
  }
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signUp } = useAuthenticator((context) => [context.user, context.signUp]);
  const [marketingConsent, setMarketingConsent] = useState(true);

  // Hook para obtener y registrar los atributos del usuario solo si está autenticado
  useUserAttributes(!!user);
  
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/chekout';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSignUp = async (formData) => {
    try {
      const result = await signUp({
        username: formData.username,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            'custom:marketing_consent': marketingConsent.toString(),
          },
        },
      });
      console.log('User signed up successfully:', result);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <View className="auth-wrapper" style={{ background: 'white' }}>
      <Authenticator
        initialState="signUp"
        components={{
          ...components,
          SignUp: {
            ...components.SignUp,
            Footer: () => components.SignUp.Footer({ setMarketingConsent }),
          },
        }}
        formFields={formFields}
        signUpAttributes={['email']}
        socialProviders={['google']}
        theme={theme}
        services={{
          handleSignUp,
        }}
      >
        {() => (
          <View>
            <Text>{I18n.get('Procesando registro...')}</Text>
          </View>
        )}
      </Authenticator>
    </View>
  );
};

export default RegisterPage;