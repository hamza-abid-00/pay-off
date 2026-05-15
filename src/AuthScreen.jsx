import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";

export default function AuthScreen() {
  const { signIn, signUp, firebaseEnabled } = useAuth();
  const [mode, setMode]         = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) { setErr("Enter email and password."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      if (mode === "signin") await signIn(email, password);
      else                   await signUp(email, password);
    } catch (e2) {
      setErr(e2.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-phone">
        <div className="auth-notch" />
        <div className="auth-screen">
          <div className="auth-sb"><span>9:41</span><span>•••</span><span>⚡ 91%</span></div>

          <div className="auth-hero">
            <div className="auth-logo">
              <span className="auth-logo-em">🏡</span>
              <span className="auth-logo-name">Payoff</span>
            </div>
            <div className="auth-slogan">The fitness app for your home goals</div>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${mode === "signin" ? "on" : ""}`}
                onClick={() => { setMode("signin"); setErr(null); }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === "signup" ? "on" : ""}`}
                onClick={() => { setMode("signup"); setErr(null); }}
              >
                Create account
              </button>
            </div>

            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {err && <div className="auth-err">{err}</div>}

            <button className="auth-cta" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signin" ? "Sign in →" : "Create account →"}
            </button>

            <div className="auth-foot">
              {mode === "signin" ? (
                <>New here? <button type="button" className="auth-link" onClick={() => setMode("signup")}>Create an account</button></>
              ) : (
                <>Already have one? <button type="button" className="auth-link" onClick={() => setMode("signin")}>Sign in</button></>
              )}
            </div>

            {!firebaseEnabled && (
              <div className="auth-demo">
                Demo mode · accounts stored locally. Add Firebase keys in <code>.env</code> for cloud sync.
              </div>
            )}
          </form>
        </div>
      </div>

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.auth-shell{
  min-height:100vh;background:linear-gradient(180deg,#FFF8F0 0%,#FCE7D7 100%);
  display:flex;align-items:center;justify-content:center;padding:24px;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;
}
.auth-phone{
  position:relative;width:390px;height:844px;background:#fff;border-radius:48px;
  box-shadow:0 30px 80px rgba(155,107,74,0.25),0 0 0 12px #111 inset;
}
.auth-notch{
  position:absolute;top:8px;left:50%;transform:translateX(-50%);
  width:120px;height:32px;background:#000;border-radius:99px;z-index:5;
}
.auth-screen{
  position:absolute;inset:11px;border-radius:38px;overflow:hidden;
  background:#FFF8F0;color:#1F1612;padding:50px 22px 0;display:flex;flex-direction:column;
}
.auth-sb{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#3A2E25;padding:0 4px 18px}

.auth-hero{text-align:center;padding:28px 0 22px}
.auth-logo{display:inline-flex;align-items:center;gap:10px}
.auth-logo-em{font-size:36px}
.auth-logo-name{font-size:44px;font-weight:900;letter-spacing:-2px;color:#1F1612;line-height:1}
.auth-slogan{font-size:14px;color:#9B6B4A;margin-top:10px;font-weight:600}

.auth-form{background:#fff;border-radius:24px;padding:18px 18px 22px;box-shadow:0 10px 30px -18px rgba(155,107,74,0.4),0 0 0 1px rgba(0,0,0,0.04)}
.auth-tabs{display:flex;background:#FFF1E4;border-radius:14px;padding:4px;margin-bottom:16px}
.auth-tab{
  flex:1;background:transparent;border:none;padding:9px 8px;border-radius:10px;
  font-size:13px;font-weight:700;color:#9B6B4A;cursor:pointer;letter-spacing:-0.2px;
}
.auth-tab.on{background:#fff;color:#1F1612;box-shadow:0 4px 12px -6px rgba(155,107,74,0.4)}

.auth-label{display:block;font-size:11px;letter-spacing:1px;color:#9B6B4A;font-weight:700;text-transform:uppercase;margin:10px 4px 6px}
.auth-input{
  width:100%;border:1.5px solid #FCE7D7;background:#FFF8F0;border-radius:12px;padding:12px 14px;
  font-size:15px;font-weight:600;color:#1F1612;outline:none;transition:border-color .15s ease;
}
.auth-input:focus{border-color:#7C3AED;background:#fff}

.auth-err{
  margin-top:12px;background:#FFF1F2;border:1px solid #FECDD3;color:#9F1239;
  border-radius:10px;padding:8px 10px;font-size:12px;font-weight:600;
}

.auth-cta{
  width:100%;margin-top:16px;background:linear-gradient(135deg,#7C3AED,#EA580C);
  color:#fff;border:none;border-radius:14px;padding:14px;font-size:15px;font-weight:800;
  cursor:pointer;letter-spacing:-0.2px;transition:transform .12s ease,opacity .12s ease;
}
.auth-cta:active{transform:scale(0.98)}
.auth-cta:disabled{opacity:0.6;cursor:not-allowed}

.auth-foot{text-align:center;margin-top:14px;font-size:12px;color:#9B6B4A;font-weight:600}
.auth-link{background:none;border:none;color:#7C3AED;font-weight:800;cursor:pointer;padding:0;font-size:12px}

.auth-demo{
  margin-top:14px;background:#FFFBEB;border:1px solid #FCD34D;color:#92400E;
  border-radius:10px;padding:8px 10px;font-size:11px;font-weight:600;text-align:center;line-height:1.45;
}
.auth-demo code{background:#FEF3C7;border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}

@media (max-width:430px){
  .auth-shell{padding:0}
  .auth-phone{width:100vw;height:100vh;border-radius:0;box-shadow:none}
  .auth-notch{display:none}
  .auth-screen{inset:0;border-radius:0;padding-top:20px}
}
`;
