import React from 'react';
import { Authenticator, useTheme, View, Image, Text, Heading, useAuthenticator } from '@aws-amplify/ui-react';
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

  SignIn: {
    Header() {
      const { tokens } = useTheme();

      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {I18n.get('Te damos la bienvenida.')}
        </Heading>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: I18n.get('nombre@empresa.com'),
      label: I18n.get('Tu correo'),
    },
    password: {
      label: I18n.get('Contraseña'),
    },
  },
  signUp: {
    username: {
      label: I18n.get('Correo electrónico'),
      placeholder: I18n.get('Introduce tu correo electrónico'),
    },
    password: {
      label: I18n.get('Contraseña'),
    },
    confirm_password: {
      label: I18n.get('Confirmar contraseña'),
    },
  },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthenticator((context) => [context.user]);

  // Hook para obtener y registrar los atributos del usuario solo si está autenticado
  useUserAttributes(!!user);

  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  return (
    <View className="auth-wrapper" style={{ background: 'white' }}>
      <Authenticator
        components={components}
        formFields={formFields}
        socialProviders={['google']}
        variation="default"
        loginMechanisms={['email']}
        theme={theme}
      >
        {({ signOut }) => (
          <View>
            <Text>{I18n.get('Iniciando sesión...')}</Text>
          </View>
        )}
      </Authenticator>
    </View>
  );
};

export default LoginPage;
