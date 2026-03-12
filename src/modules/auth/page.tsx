import { Apple, Lock, Mail, Smartphone, type LucideIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_ROUTE } from "../../app/router/navigation";

type AuthMode = "login" | "register";

interface AuthModeCopy {
  formTitle: string;
  formSubtitle: string;
  heroTitle: string;
  heroDescription: string;
  primaryActionLabel: string;
  accountPrompt: string;
  accountActionLabel: string;
}

const AUTH_COPY: Record<AuthMode, AuthModeCopy> = {
  login: {
    formTitle: "Welcome Back",
    formSubtitle: "Access your workspace",
    heroTitle: "Control IoT at Scale",
    heroDescription: "Login to monitor telemetry, manage provisioning, and drive secure command pipelines.",
    primaryActionLabel: "Login",
    accountPrompt: "Don't have an account yet?",
    accountActionLabel: "Sign up",
  },
  register: {
    formTitle: "Create Account",
    formSubtitle: "Start your workspace",
    heroTitle: "Build Your IoT Workspace",
    heroDescription:
      "Register your workspace and start onboarding vendors, parameters, devices, and policies in one flow.",
    primaryActionLabel: "Create Account",
    accountPrompt: "Already have an account?",
    accountActionLabel: "Sign in",
  },
};

interface InputFieldProps {
  label: string;
  placeholder: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

function InputField({
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
  type = "text",
}: InputFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#2f5a8f]">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#5d86b7]">
          <Icon size={14} />
        </span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-[11px] border border-[#9eb9d8] bg-[#dce8f5] px-9 text-[17px] tracking-[-0.015em] text-[#173e6c] outline-none transition focus:border-[#5f94cf] focus:ring-2 focus:ring-[#5f94cf]/20"
        />
      </span>
    </label>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";
  const copy = AUTH_COPY[mode];
  const apiBase =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    (import.meta.env.VITE_API_URL as string | undefined) ??
    "http://localhost:4000/api";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }
    setIsSubmitting(true);

    const authPath = isLogin ? "/auth/login" : "/auth/register";
    const derivedName = email.includes("@") ? email.split("@")[0] : email;
    const payload = isLogin
      ? { email: email.trim(), password }
      : { name: derivedName || "User", email: email.trim(), password, phone: phone.trim() };

    try {
      const response = await fetch(`${apiBase}${authPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = (await response.json().catch(() => ({}))) as {
        token?: string;
        accessToken?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(responseData.message || `Auth request failed (${response.status})`);
      }

      const token = responseData.token || responseData.accessToken;
      if (token) {
        window.localStorage.setItem("orbit_token", token);
      }
      window.localStorage.setItem("auth_email", email.trim());
      if (!isLogin && phone.trim()) {
        window.localStorage.setItem("auth_phone", phone.trim());
      }
      navigate(DEFAULT_ROUTE);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div className="min-h-screen bg-[#dce8f5] text-[#153f72]">
      <div className="relative min-h-screen overflow-hidden border border-[#bfd2e6] md:m-3 md:min-h-[calc(100vh-24px)] md:rounded-[30px]">
        <div className="grid min-h-screen md:grid-cols-2">
          <section
            className={[
              "flex items-center justify-center px-6 py-10 md:px-10 lg:px-16",
              isLogin ? "md:order-1" : "md:order-2",
            ].join(" ")}
          >
            <div className="w-full max-w-[420px]">
              <div className="flex rounded-full border border-[#9bb8d8] bg-[#d8e5f3] p-1 shadow-[inset_0_1px_3px_rgba(255,255,255,0.75)]">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage(null);
                  }}
                  className={[
                    "h-9 flex-1 rounded-full text-[13px] font-semibold transition",
                    mode === "login"
                      ? "bg-[#1f8cff] text-white shadow-[0_4px_12px_rgba(31,140,255,0.4)]"
                      : "text-[#335f94] hover:text-[#1f4c82]",
                  ].join(" ")}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage(null);
                  }}
                  className={[
                    "h-9 flex-1 rounded-full text-[13px] font-semibold transition",
                    mode === "register"
                      ? "bg-[#1f8cff] text-white shadow-[0_4px_12px_rgba(31,140,255,0.4)]"
                      : "text-[#335f94] hover:text-[#1f4c82]",
                  ].join(" ")}
                >
                  Register
                </button>
              </div>

              <div className="mt-5 text-center">
                <h1
                  className="text-[50px] font-semibold leading-[0.98] tracking-[-0.04em] text-[#103e73]"
                >
                  {copy.formTitle}
                </h1>
                <p className="mt-3 text-sm font-medium text-[#5a80ad]">{copy.formSubtitle}</p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <InputField
                  label="Username / Email"
                  placeholder="admin@iot.local"
                  icon={Mail}
                  value={email}
                  onChange={setEmail}
                />

                {!isLogin && (
                  <InputField
                    label="Phone"
                    placeholder="+91"
                    icon={Smartphone}
                    value={phone}
                    onChange={setPhone}
                  />
                )}

                <InputField
                  label="Password"
                  placeholder="........"
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={setPassword}
                />

                {!isLogin && (
                  <p className="text-[12px] font-medium text-[#c2943b]">Password strength: medium</p>
                )}
                {errorMessage && (
                  <p className="rounded-[11px] border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-[11px] bg-[#1f8cff] text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[0_9px_20px_rgba(31,140,255,0.28)] transition hover:bg-[#127fea]"
                >
                  {isSubmitting ? "Please wait..." : copy.primaryActionLabel}
                </button>

                <div className="flex items-center gap-3 text-[12px] font-medium text-[#476f9e]">
                  <span className="h-px flex-1 bg-[#8aabce]" />
                  OR
                  <span className="h-px flex-1 bg-[#8aabce]" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#9eb9d8] bg-[#dce8f5] text-sm font-semibold text-[#2c5c95]"
                  >
                    <Apple size={15} />
                    Apple
                  </button>
                  <button
                    type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#9eb9d8] bg-[#dce8f5] text-sm font-semibold text-[#2c5c95]"
                  >
                    <span className="text-[17px] leading-none">G</span>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex h-10 items-center justify-center rounded-[10px] border border-[#9eb9d8] bg-[#dce8f5] text-sm font-semibold text-[#2c5c95]"
                  >
                    X
                  </button>
                </div>

                <p className="pt-1 text-center text-[13px] text-[#5a80ad]">
                  {copy.accountPrompt}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(isLogin ? "register" : "login");
                      setErrorMessage(null);
                    }}
                    className="font-semibold text-[#1472d2] transition hover:text-[#0a5cae]"
                  >
                    {copy.accountActionLabel}
                  </button>
                </p>
              </form>
            </div>
          </section>

          <section
            className={[
              "relative flex overflow-hidden bg-[#d4e2f1] px-8 py-10 md:px-10 lg:px-14",
              isLogin
                ? "border-t border-[#bfd2e6] md:order-2 md:border-l md:border-t-0"
                : "border-t border-[#bfd2e6] md:order-1 md:border-r md:border-t-0",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[42%] top-[-18%] h-[140%] w-[6px] rotate-[31deg] bg-gradient-to-b from-transparent via-[#9ec5eb] to-transparent opacity-85" />
            </div>

            <div className="relative z-10 flex h-full w-full flex-col">
              <div className="max-w-[560px]">
                <p className="text-[18px] font-semibold uppercase tracking-[0.14em] text-[#2b71c8]">
                  Hive Connect Platform
                </p>
                <h2
                  className="mt-4 text-[66px] font-semibold leading-[0.95] tracking-[-0.045em] text-[#163f72]"
                >
                  {copy.heroTitle}
                </h2>
                <p className="mt-4 max-w-[560px] text-[26px] leading-[1.45] tracking-[-0.01em] text-[#5e83af]">
                  {copy.heroDescription}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-10">
                {["Real-time Sync", "Policy Engine", "MQTT Secure"].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-[#8eb3d9] bg-[#dce8f5] px-4 py-1.5 text-[13px] font-medium text-[#3a6fa8]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
