import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SendMessages from './pages/SendMessages';
import ResumenEnvio from './pages/ResumenEnvio';
import ResumenGrupos from'./pages/Resumen_grupos';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EnterCodePage from './pages/EnterCodePage';
import NotFound from './pages/NotFound';
import SignOutPage from './pages/SignOutPage';
import SurveyStep1 from './components/Survey/SurveyStep1';
import SurveyStep2 from './components/Survey/SurveyStep2';
import SurveyStep3 from './components/Survey/SurveyStep3';
import SurveyStep4 from './components/Survey/SurveyStep4';
import LoadingPage from './pages/LoadingPage';
import { I18n } from '@aws-amplify/core';
import PricingPage from './pages/PricingPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import GroupMessageSender from './pages/GroupMessageSender';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import axios from 'axios';

// Importa el nuevo componente
import GroupSelectorPage from './pages/GroupSelectorPage';
import Chats from './pages/Chats';

Amplify.configure(awsExports);
I18n.setLanguage('es');

function App() {
  return (
    <Router>
      <div className="App">
        <Authenticator.Provider>
          <AppContent />
        </Authenticator.Provider>
      </div>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/dashboard';

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/chekout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/enter-code" element={<EnterCodePage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/survey/step1" element={<RequireAuth><SurveyStep1 /></RequireAuth>} />
          <Route path="/survey/step2" element={<RequireAuth><SurveyStep2 /></RequireAuth>} />
          <Route path="/survey/step3" element={<RequireAuth><SurveyStep3 /></RequireAuth>} />
          <Route path="/survey/step4" element={<RequireAuth><SurveyStep4 /></RequireAuth>} />
          <Route path="/loading" element={<RequireAuth><LoadingPage /></RequireAuth>} />
          <Route path="/signout" element={<RequireAuth><SignOutPage /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/send-messages" element={<RequireAuth><SendMessages /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/resumen" element={<RequireAuth><ResumenEnvio /></RequireAuth>} />
          <Route path="/resumen-groups" element={<RequireAuth><ResumenGrupos /></RequireAuth>} />
          <Route path="/group-message-sender" element={<RequireAuth><GroupMessageSender /></RequireAuth>} />

          {/* Agrega la nueva ruta para GroupSelectorPage */}
          <Route path="/group-selector" element={<RequireAuth><GroupSelectorPage /></RequireAuth>} />
          <Route path="/chats" element={<RequireAuth><Chats /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function RequireAuth({ children }) {
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [isPaid, setIsPaid] = React.useState(false);

  React.useEffect(() => {
    const checkPaymentStatus = async () => {
      if (authStatus !== 'authenticated' || !user) {
        setLoading(false);
        return;
      }

      try {
        const userAttributesStr = localStorage.getItem('userAttributes');
        const userAttributes = userAttributesStr ? JSON.parse(userAttributesStr) : null;
        
        if (!userAttributes?.sub) {
          console.error('ID de usuario no encontrado');
          setLoading(false);
          return;
        }

        const response = await axios.get(`https://rw8emddjlb.execute-api.eu-west-3.amazonaws.com/xr21321//user`, {
          params: { userId: userAttributes.sub }
        });
        
        setIsPaid(response.data.PaymentStatus === 'Active');
      } catch (error) {
        console.error('Error al verificar estado de pago:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [user, authStatus]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isPaid && location.pathname !== '/pricing') {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return children;
}

export default App;
