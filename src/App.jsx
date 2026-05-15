import { AuthProvider, useAuth } from "./AuthContext.jsx";
import AuthScreen from "./AuthScreen.jsx";
import PayoffApp from "./PayoffApp.jsx";

function Gate() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#FFF8F0 0%,#FCE7D7 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "-apple-system,BlinkMacSystemFont,\"SF Pro Display\",\"Segoe UI\",sans-serif",
        color: "#9B6B4A", fontWeight: 600, letterSpacing: "0.2px"
      }}>
        Loading Payoff…
      </div>
    );
  }

  return user ? <PayoffApp /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
