import React from "react";
import { Button, InputText } from "primereact";
import { AuthConsumer } from "../../role-access/authContext";
import Loading from "../../components/customComponent/loading";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [state, setState] = React.useState({
    username: "",
    password: "",
    loading: false,
  });

  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-screen">
      {state.loading ? (
        <Loading />
      ) : (
        <AuthConsumer>
          {({ _handleLogin }) => (
            <AnimatePresence mode="wait">
              <motion.form
                key="login-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  _handleLogin(state);
                }}
                className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url("/img/background.png")` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* overlay */}
                <div className="absolute inset-0 bg-slate-950/55" />
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-slate-950/30 to-pink-950/20" />

                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 lg:px-8">
                  <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
                    {/* Left branding panel */}
                    <motion.div
                      className="hidden flex-col justify-between bg-gradient-to-br from-slate-950/80 via-slate-900/75 to-pink-950/70 p-10 text-white lg:flex"
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                      <div>
                        <div className="mb-6 flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-lg">
                            <img
                              src="/img/track-logo.png"
                              alt="Korat Secare"
                              className="h-11 w-11 object-contain"
                            />
                          </div>
                          <div>
                            <div className="text-2xl font-bold tracking-tight">
                              ระบบบริหารงานโครงการ
                            </div>

                          </div>
                        </div>

                        <div className="max-w-md">
                          <h1 className="text-4xl font-bold leading-tight">
                            ระบบบริหารงานโครงการ
                            <br />
                            องค์การบริหารส่วนจังหวัดนครราชสีมา
                          </h1>
                          <p className="mt-4 text-sm leading-7 text-slate-300">
                            ติดตามโครงการตั้งแต่อนุมัติโครงการ จัดซื้อจัดจ้าง ตรวจรับ จนถึงการเบิกจ่ายเงิน (Korat PAO Project Tracking)
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Monitoring
                          </div>
                          <div className="mt-2 text-lg font-semibold">
                            5 ขั้นตอน
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Security
                          </div>
                          <div className="mt-2 text-lg font-semibold">
                            ไม่ต้องใช้ฐานข้อมูล
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Right form panel */}
                    <motion.div
                      className="bg-white/90 p-6 backdrop-blur-xl sm:p-10 lg:p-12"
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                      <div className="mx-auto flex max-w-md flex-col justify-center">
                        {/* Mobile logo */}
                        <motion.div
                          className="mb-8 flex flex-col items-center text-center lg:hidden"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <div className="flex h-20 w-20 items-center justify-center">
                            <img
                              src="/img/track-logo.png"
                              alt="Logo"
                              className="h-20 w-20 object-contain"
                            />
                          </div>
                          <div className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                            ระบบบริหารงานโครงการ
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            Sign in to continue
                          </div>
                        </motion.div>

                        <motion.div
                          className="mb-8"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.15 }}
                        >
                          <div className="hidden lg:block">
                            <div className="text-sm font-medium uppercase tracking-[0.18em] text-pink-600">
                              Welcome Back
                            </div>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                              เข้าสู่ระบบ
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                              กรุณาเข้าสู่ระบบเพื่อใช้งานระบบบริหารงานโครงการ
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="space-y-5"
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.25 }}
                        >
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              ชื่อผู้ใช้งาน
                            </label>
                            <div className="group flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-100">
                              <i className="pi pi-user mr-3 text-slate-400" />
                              <InputText
                                value={state.username}
                                className="w-full border-none bg-transparent text-slate-800 outline-none shadow-none"
                                placeholder="กรอกชื่อผู้ใช้งาน"
                                unstyled
                                onChange={(e) =>
                                  setState({ ...state, username: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              รหัสผ่าน
                            </label>
                            <div className="group flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-100">
                              <i className="pi pi-lock mr-3 text-slate-400" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={state.password}
                                className="w-full border-none bg-transparent text-slate-800 outline-none"
                                placeholder="กรอกรหัสผ่าน"
                                onChange={(e) =>
                                  setState({ ...state, password: e.target.value })
                                }
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="ml-3 text-slate-400 transition hover:text-slate-700"
                              >
                                <i
                                  className={`pi ${
                                    showPassword ? "pi-eye-slash" : "pi-eye"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="mt-8"
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.35 }}
                        >
                          <Button
                            label="เข้าสู่ระบบ"
                            type="submit"
                            className="h-14 w-full rounded-2xl border-none text-base font-semibold shadow-lg shadow-pink-200 transition hover:opacity-95"
                            style={{
                              background:
                                "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                            }}
                          />
                        </motion.div>

                        <motion.div
                          className="mt-6 text-center text-xs text-slate-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.45 }}
                        >
                          บัญชีทดสอบ: admin / user / purchase / supplies / contract / finance / executive (รหัสผ่าน 1234)
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.form>
            </AnimatePresence>
          )}
        </AuthConsumer>
      )}
    </div>
  );
};

export default Login;