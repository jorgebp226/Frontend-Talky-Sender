import { I18n } from '@aws-amplify/core';
import { createTheme } from '@aws-amplify/ui-react';

I18n.putVocabularies({
  es: {
    'Sign In': 'Iniciar sesión',
    'Sign Up': 'Crear cuenta',
    'Enter your Email': 'Introduce tu correo electrónico',
    'Enter your Password': 'Introduce tu contraseña',
    'Forgot your password?': '¿Olvidaste tu contraseña?',
    'Reset Password': 'Restablecer contraseña',
    'No account?': '¿No tienes cuenta?',
    'Create account': 'Crear cuenta',
    'Have an account?': '¿Ya tienes una cuenta?',
    'Sign in': 'Iniciar sesión',
    'Sign in with Google': 'Iniciar sesión con Google',
    'Sign up': 'Registrarse',
    'Create Account': 'Crear cuenta',
    'Confirm Password': 'Confirmar contraseña',
    'Please confirm your Password': 'Por favor, confirma tu contraseña',
    'Confirm Sign Up': 'Confirmar registro',
    'Resend Code': 'Reenviar código',
    'Back to Sign In': 'Volver a Iniciar sesión',
    'or': 'o inicia sesión con tu correo electrónico',
  },
});

I18n.setLanguage('es');

const theme = createTheme({
  name: 'custom-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: '#f5f5f5' },
          80: { value: '#4285f4' },
          90: { value: '#3367d6' },
          100: { value: '#2a56c6' },
        },
      },
    },
    components: {
      button: {
        primary: {
          backgroundColor: { value: '{colors.brand.primary.80}' },
          _hover: {
            backgroundColor: { value: '{colors.brand.primary.90}' },
          },
          _active: {
            backgroundColor: { value: '{colors.brand.primary.100}' },
          },
        },
      },
    },
  },
});

export { theme };