import Link from "next/link";
import { LayoutDashboard, ReceiptText, ShieldCheck, Zap, BarChart3, LogOut, User } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  const user = session?.user;


  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Plenty <span className="text-blue-500">Hub</span></span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user.name}</span>
                <span className="text-xs text-slate-500 capitalize">{(user as any).role}</span>
              </div>
              <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <form action={async () => { "use server"; await signOut(); }}>
                <button className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-medium transition-all hover:ring-2 hover:ring-blue-500/50"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-8 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8 animate-fade-in">
          <Zap className="h-3 w-3" />
          <span>v1.0 Ahora con Sincronización Offline</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-[1.1]">
          Escale su empresa con <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Inteligencia Operativa
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          La plataforma integral para empresas modernas en Panamá.
          Facturación avanzada, analítica en tiempo real y seguridad de grado bancario en un solo Hub.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-1"
          >
            {user ? "Entrar al Dashboard" : "Comenzar Ahora"}
          </Link>
          <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-lg transition-all">
            Ver Demo
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full">
          {[
            {
              icon: ReceiptText,
              title: "Facturación Advanced",
              desc: "Emisión de facturas con cálculos robustos e impuestos automáticos."
            },
            {
              icon: BarChart3,
              title: "BI & Analytics",
              desc: "Dashboards en tiempo real para decisiones basadas en datos."
            },
            {
              icon: ShieldCheck,
              title: "Seguridad RBAC",
              desc: "Control granular de accesos y cifrado de datos sensibles (PII)."
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all hover:bg-slate-900">
              <div className="bg-slate-800 p-3 rounded-xl w-fit mb-6 group-hover:bg-blue-600 transition-colors">
                <feature.icon className="h-6 w-6 text-blue-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-left">{feature.title}</h3>
              <p className="text-slate-400 text-left leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 px-8 py-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-bold">Plenty Hub</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Plenty Hub . Diseñado para la excelencia empresarial.
          </p>
          <div className="flex gap-6 text-slate-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
