import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import * as THREE from "three";

// ─── API ──────────────────────────────────────────────────────────────────────
const API = "http://localhost:3000/api";
const api = async (path, opts = {}) => {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ─── TAILWIND INJECTOR (CDN) ──────────────────────────────────────────────────
function InjectTailwind() {
  useEffect(() => {
    if (document.getElementById("tw-cdn")) return;
    const s = document.createElement("script");
    s.id = "tw-cdn";
    s.src = "https://cdn.tailwindcss.com";
    s.onload = () => {
      if (window.tailwind) {
        window.tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                display: ["'Bebas Neue'", "sans-serif"],
                body: ["'DM Sans'", "sans-serif"],
              },
              colors: {
                amber: {
                  warm: "#E8621A",
                  mid: "#C94B10",
                  dark: "#7A2A08",
                  light: "#F5A263",
                  glow: "#FF8C42",
                },
              },
            },
          },
        };
      }
    };
    document.head.appendChild(s);

    // Fonts
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);

    // Global overrides
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { min-height: 100%; }
      body { font-family: 'DM Sans', sans-serif; background: #0d0500; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: #7A2A08; border-radius: 2px; }
      ::selection { background: rgba(232,98,26,0.35); }
      @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      @keyframes spinSlow { to{transform:rotate(360deg)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes scaleIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
      @keyframes slideLeft { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
      .animate-float { animation: floatY 4s ease-in-out infinite; }
      .animate-fade-up { animation: fadeUp 0.7s ease-out forwards; }
      .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      .animate-scale-in { animation: scaleIn 0.4s ease-out forwards; }
      .animate-slide-left { animation: slideLeft 0.5s ease-out forwards; }
      .animate-marquee { animation: marquee 18s linear infinite; }
      .delay-100 { animation-delay: 0.1s; }
      .delay-200 { animation-delay: 0.2s; }
      .delay-300 { animation-delay: 0.3s; }
      .delay-400 { animation-delay: 0.4s; }
      .delay-500 { animation-delay: 0.5s; }
      .opacity-0-start { opacity: 0; }
      .card-hover { transition: transform 0.3s, box-shadow 0.3s; }
      .card-hover:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(232,98,26,0.15); }
      .btn-glow { box-shadow: 0 0 24px rgba(232,98,26,0.45); }
      .btn-glow:hover { box-shadow: 0 0 40px rgba(232,98,26,0.7); }
      .text-gradient { background: linear-gradient(135deg, #F5A263, #E8621A, #C94B10); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .bg-hero { background: radial-gradient(ellipse 80% 60% at 60% 40%, #C94B10 0%, #7A2A08 35%, #3D1204 65%, #0d0500 100%); }
      .glass { background: rgba(13,5,0,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(232,98,26,0.15); }
      .glass-light { background: rgba(232,98,26,0.07); backdrop-filter: blur(12px); border: 1px solid rgba(232,98,26,0.2); }
      .hero-title { font-family: 'Bebas Neue', sans-serif; line-height: 0.88; letter-spacing: -0.01em; }
      .course-card { background: linear-gradient(145deg, rgba(30,10,2,0.9), rgba(13,5,0,0.95)); border: 1px solid rgba(232,98,26,0.18); border-radius: 16px; overflow: hidden; }
      .course-card:hover { border-color: rgba(232,98,26,0.5); }
      .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
      .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; color: rgba(245,162,99,0.6); font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border: none; background: transparent; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; }
      .sidebar-link:hover { color: #F5A263; background: rgba(232,98,26,0.1); }
      .sidebar-link.active { color: #E8621A; background: rgba(232,98,26,0.15); border-left: 2px solid #E8621A; }
      input, textarea, select { background: rgba(255,255,255,0.04) !important; border: 1px solid rgba(232,98,26,0.2) !important; border-radius: 10px !important; padding: 0.65rem 0.9rem !important; color: #f5e6d8 !important; font-family: 'DM Sans', sans-serif !important; font-size: 0.9rem !important; outline: none !important; width: 100%; transition: border-color 0.2s !important; }
      input:focus, textarea:focus { border-color: rgba(232,98,26,0.6) !important; background: rgba(232,98,26,0.05) !important; }
      input::placeholder, textarea::placeholder { color: rgba(245,162,99,0.35) !important; }
      label { display: block; font-size: 0.8rem; color: rgba(245,162,99,0.6); margin-bottom: 0.4rem; letter-spacing: 0.04em; text-transform: uppercase; }
      .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.2s; }
      .modal { background: linear-gradient(145deg, #1a0700, #0d0500); border: 1px solid rgba(232,98,26,0.25); border-radius: 20px; padding: 2rem; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; animation: scaleIn 0.25s ease-out; }
      .spinner { width: 32px; height: 32px; border: 2px solid rgba(232,98,26,0.2); border-top-color: #E8621A; border-radius: 50%; animation: spinSlow 0.7s linear infinite; }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

// ─── THREE.JS: HERO SCENE ─────────────────────────────────────────────────────
function useHeroScene(ref) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.z = 5;

    // Warm glowing sphere (the "O" orb like in Diroxi)
    const sphereGeo = new THREE.SphereGeometry(1.6, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xC94B10, emissive: 0x7A2A08, roughness: 0.15, metalness: 0.6,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(1.8, -0.2, -1);
    scene.add(sphere);

    // Wireframe ring around sphere
    const ringGeo = new THREE.TorusGeometry(2.1, 0.015, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xF5A263, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(sphere.position);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // Floating particles
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random()-0.5)*22;
      pos[i*3+1] = (Math.random()-0.5)*14;
      pos[i*3+2] = (Math.random()-0.5)*10;
      const t = Math.random();
      col[i*3] = 0.8 + t*0.2;
      col[i*3+1] = 0.3 + t*0.3;
      col[i*3+2] = 0.05 + t*0.1;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.6 })));

    // Floating icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(0.7, 1);
    const icoMat = new THREE.MeshStandardMaterial({ color: 0xF5A263, wireframe: true, transparent: true, opacity: 0.25 });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(-3.5, 1.5, -1);
    scene.add(ico);

    // 4-pointed star (diamond spark like in Diroxi logo)
    const starGeo = new THREE.OctahedronGeometry(0.22, 0);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xF5A263, emissiveIntensity: 1.5 });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(-2.2, 0.5, 0.5);
    scene.add(star);

    // Lights
    scene.add(new THREE.AmbientLight(0x3D1204, 6));
    const pl1 = new THREE.PointLight(0xE8621A, 15, 12); pl1.position.set(2, 1, 3); scene.add(pl1);
    const pl2 = new THREE.PointLight(0xF5A263, 8, 8); pl2.position.set(-3, 2, 1); scene.add(pl2);
    const pl3 = new THREE.PointLight(0xff3300, 6, 6); pl3.position.set(0, -3, 0); scene.add(pl3);

    let mouse = { x: 0, y: 0 };
    const onMouse = e => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    let raf;
    const tick = t => {
      raf = requestAnimationFrame(tick);
      sphere.rotation.y = t * 0.0003;
      sphere.rotation.x = t * 0.0001;
      ring.rotation.z = t * 0.0002;
      ico.rotation.x = t * 0.0005;
      ico.rotation.y = t * 0.0004;
      star.rotation.x = t * 0.001;
      star.rotation.y = t * 0.0015;
      star.position.y = 0.5 + Math.sin(t * 0.002) * 0.2;
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.03;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMouse); window.removeEventListener("resize", onResize); renderer.dispose(); };
  }, []);
}

// ─── THREE.JS: LOGO MINI ──────────────────────────────────────────────────────
function useMiniLogo(ref) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(2); renderer.setSize(38, 38);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 20);
    cam.position.z = 2.8;
    const geo = new THREE.OctahedronGeometry(0.9, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xE8621A, emissive: 0x7A2A08, metalness: 0.8, roughness: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    scene.add(new THREE.AmbientLight(0xff6622, 4));
    const pl = new THREE.PointLight(0xF5A263, 10, 8); pl.position.set(2, 2, 2); scene.add(pl);
    let raf;
    const tick = t => { raf = requestAnimationFrame(tick); mesh.rotation.x = t*0.0009; mesh.rotation.y = t*0.0013; renderer.render(scene, cam); };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); renderer.dispose(); };
  }, []);
}

// ─── THREE.JS: COURSE CARD HERO ───────────────────────────────────────────────
function CourseHero3D() {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(65, canvas.offsetWidth/canvas.offsetHeight, 0.1, 50);
    cam.position.z = 4;
    const sg = new THREE.SphereGeometry(1.2,32,32);
    const sm = new THREE.MeshStandardMaterial({ color:0xC94B10, emissive:0x7A2A08, roughness:0.2, metalness:0.7 });
    const sphere = new THREE.Mesh(sg, sm);
    sphere.position.set(1, 0, 0);
    scene.add(sphere);
    const rg = new THREE.TorusGeometry(1.6, 0.012, 8, 80);
    const rm = new THREE.MeshBasicMaterial({ color:0xF5A263, transparent:true, opacity:0.35 });
    const ring = new THREE.Mesh(rg, rm);
    ring.rotation.x = Math.PI/2.2;
    ring.position.copy(sphere.position);
    scene.add(ring);
    const count=400; const pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){pos[i*3]=(Math.random()-0.5)*10;pos[i*3+1]=(Math.random()-0.5)*6;pos[i*3+2]=(Math.random()-0.5)*4;}
    const pg=new THREE.BufferGeometry(); pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({size:0.04,color:0xF5A263,transparent:true,opacity:0.5})));
    scene.add(new THREE.AmbientLight(0x3D1204,5));
    const pl=new THREE.PointLight(0xE8621A,12,10); pl.position.set(1,2,3); scene.add(pl);
    let raf;
    const tick=t=>{raf=requestAnimationFrame(tick);sphere.rotation.y=t*0.0005;ring.rotation.z=t*0.0003;renderer.render(scene,cam);};
    raf=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(raf);renderer.dispose();};
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />;
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:"4rem"}}>
    <div className="spinner" />
  </div>
);

function Alert({ type, msg }) {
  if (!msg) return null;
  const isErr = type === "error";
  return (
    <div style={{
      padding:"0.75rem 1rem", borderRadius:10, fontSize:"0.875rem", marginBottom:"1rem",
      background: isErr ? "rgba(200,40,30,0.12)" : "rgba(63,185,80,0.1)",
      border: `1px solid ${isErr ? "rgba(200,40,30,0.3)" : "rgba(63,185,80,0.25)"}`,
      color: isErr ? "#f87171" : "#4ade80"
    }}>{msg}</div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: wide ? 580 : 460 }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.6rem",letterSpacing:"0.05em",
            background:"linear-gradient(135deg,#F5A263,#E8621A)"  ,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(245,162,99,0.5)",cursor:"pointer",fontSize:"1.25rem",padding:"4px"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", full, lg, sm, disabled, style: s }) {
  const base = {
    fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:"pointer",
    border:"none", borderRadius: lg ? 12 : 9, outline:"none",
    display:"inline-flex", alignItems:"center", gap:6, justifyContent:"center",
    transition:"all 0.22s", width: full ? "100%" : "auto",
    padding: lg ? "0.85rem 2rem" : sm ? "0.35rem 0.9rem" : "0.55rem 1.25rem",
    fontSize: lg ? "1rem" : sm ? "0.8rem" : "0.875rem",
    opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto",
    ...s,
  };
  const variants = {
    primary: { background:"linear-gradient(135deg,#E8621A,#C94B10)", color:"#fff", boxShadow:"0 0 22px rgba(232,98,26,0.4)" },
    outline: { background:"transparent", color:"#F5A263", border:"1px solid rgba(232,98,26,0.35)" },
    ghost: { background:"transparent", color:"rgba(245,162,99,0.6)", border:"none" },
    danger: { background:"rgba(200,40,30,0.12)", color:"#f87171", border:"1px solid rgba(200,40,30,0.25)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (variant==="primary") e.currentTarget.style.boxShadow="0 0 40px rgba(232,98,26,0.7)"; }}
      onMouseLeave={e => { if (variant==="primary") e.currentTarget.style.boxShadow="0 0 22px rgba(232,98,26,0.4)"; }}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return <div style={{marginBottom:"1rem"}}><label>{label}</label>{children}</div>;
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, auth, setAuth, setModal }) {
  const logoRef = useRef();
  useMiniLogo(logoRef);

  const logout = async () => {
    try { await api(`/${auth.role}s/logout`, { method:"POST" }); } catch {}
    setAuth(null); setPage("home");
  };

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"rgba(13,5,0,0.75)", backdropFilter:"blur(24px)",
      borderBottom:"1px solid rgba(232,98,26,0.12)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 2.5rem", height:64,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setPage("home")}>
        <canvas ref={logoRef} width={38} height={38} style={{borderRadius:8}} />
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:"0.1em",
          background:"linear-gradient(135deg,#F5A263,#E8621A)"  ,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          CourseVault
        </span>
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <Btn variant="ghost" onClick={()=>setPage("home")}>Explore</Btn>
        {!auth ? (
          <>
            <Btn variant="ghost" onClick={()=>setModal("login-user")}>Sign in</Btn>
            <Btn variant="primary" onClick={()=>setModal("register-user")}>Get started</Btn>
            <Btn variant="outline" sm onClick={()=>setModal("login-admin")}>⬡ Instructor</Btn>
          </>
        ) : (
          <>
            <Btn variant="ghost" onClick={()=>setPage(auth.role==="admin"?"admin":"dashboard")}>
              {auth.role==="admin" ? "Dashboard" : "My Courses"}
            </Btn>
            <Btn variant="outline" sm onClick={logout}>Sign out</Btn>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ setModal, setPage }) {
  const canvasRef = useRef();
  useHeroScene(canvasRef);

  return (
    <div style={{ position:"relative", height:"100vh", overflow:"hidden", display:"flex", alignItems:"center" }}>
      {/* BG canvas */}
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />

      {/* Gradient overlays */}
      <div style={{ position:"absolute", inset:0,
        background:"radial-gradient(ellipse 90% 70% at 65% 45%, rgba(201,75,16,0.55) 0%, rgba(122,42,8,0.4) 40%, rgba(13,5,0,0.95) 80%)"
      }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"30%",
        background:"linear-gradient(to top, #0d0500, transparent)" }} />

      {/* Content */}
      <div style={{ position:"relative", zIndex:2, width:"100%", padding:"0 3rem" }}>
        {/* Eyebrow */}
        <div className="animate-fade-up opacity-0-start" style={{
          display:"inline-flex", alignItems:"center", gap:10,
          background:"rgba(232,98,26,0.1)", border:"1px solid rgba(232,98,26,0.25)",
          borderRadius:999, padding:"0.4rem 1.1rem", marginBottom:"1.5rem",
        }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#E8621A",
            boxShadow:"0 0 10px #E8621A", display:"inline-block",
            animation:"pulse-ring 1.5s ease-out infinite" }} />
          <span style={{ fontSize:"0.78rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#F5A263" }}>
            Live Platform · Expert Instructors
          </span>
        </div>

        {/* Giant title like DIROXI */}
        <h1 className="hero-title animate-fade-up delay-100 opacity-0-start"
          style={{ fontSize:"clamp(5rem,14vw,11rem)", color:"#fff", maxWidth:900, lineHeight:0.88 }}>
          COURSE
          <br />
          <span style={{ background:"linear-gradient(135deg,#F5A263 20%,#E8621A 60%,#C94B10 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            VAULT
          </span>
        </h1>

        <p className="animate-fade-up delay-300 opacity-0-start"
          style={{ fontSize:"1.1rem", color:"rgba(245,162,99,0.75)", marginTop:"1.5rem",
            marginBottom:"2.5rem", maxWidth:440, lineHeight:1.7 }}>
          World-class courses taught by industry experts. Learn skills that shape your future — at your own pace.
        </p>

        <div className="animate-fade-up delay-400 opacity-0-start" style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <Btn variant="primary" lg onClick={()=>setPage("home")}>Browse Courses</Btn>
          <Btn variant="outline" lg onClick={()=>setModal("register-user")}>Start for free →</Btn>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position:"absolute", bottom:"2rem", left:"50%", transform:"translateX(-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:6,
        animation:"floatY 2.5s ease-in-out infinite" }}>
        <div style={{ width:1, height:44, background:"linear-gradient(to bottom,#E8621A,transparent)" }} />
        <span style={{ fontSize:"0.68rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(232,98,26,0.5)" }}>scroll</span>
      </div>
    </div>
  );
}

// ─── MARQUEE STRIP ────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const items = ["Web Development","Data Science","UI/UX Design","Machine Learning","Photography","3D Modeling","Video Editing","Business Strategy","Mobile Apps","Cybersecurity"];
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow:"hidden", borderTop:"1px solid rgba(232,98,26,0.15)", borderBottom:"1px solid rgba(232,98,26,0.15)", padding:"1rem 0", background:"rgba(232,98,26,0.04)" }}>
      <div className="animate-marquee" style={{ display:"flex", gap:"3rem", width:"max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", letterSpacing:"0.1em",
            color: i%3===0 ? "#E8621A" : "rgba(245,162,99,0.35)", whiteSpace:"nowrap" }}>
            {item} {i%2===0 ? "◆" : "✦"}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── COURSE CARD ──────────────────────────────────────────────────────────────
function CourseCard({ course, onClick }) {
  const initials = course.title.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  return (
    <div className="course-card card-hover" style={{ cursor:"pointer" }} onClick={()=>onClick(course)}>
      {course.imageUrl
        ? <img src={course.imageUrl} alt={course.title}
            style={{ width:"100%", height:180, objectFit:"cover", display:"block" }}
            onError={e=>e.target.style.display="none"} />
        : (
          <div style={{ height:180, background:"linear-gradient(135deg,#1a0700,#7A2A08)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.5rem", letterSpacing:"0.05em",
            color:"rgba(232,98,26,0.35)" }}>
            {initials}
          </div>
        )
      }
      <div style={{ padding:"1.25rem" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.15rem", letterSpacing:"0.03em",
          color:"#f5e6d8", marginBottom:"0.5rem", lineHeight:1.2 }}>{course.title}</div>
        <div style={{ fontSize:"0.82rem", color:"rgba(245,162,99,0.5)", lineHeight:1.6, marginBottom:"1rem",
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {course.description}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:"0.05em",
            background:"linear-gradient(135deg,#F5A263,#E8621A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            ${course.price}
          </span>
          <span style={{ fontSize:"0.72rem", padding:"0.2rem 0.65rem", borderRadius:999,
            background:"rgba(232,98,26,0.1)", border:"1px solid rgba(232,98,26,0.22)", color:"#F5A263" }}>
            {course.content?.length||0} lessons
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── COURSE DETAIL ────────────────────────────────────────────────────────────
function CourseDetail({ course, onClose, onPurchase, isPurchased, auth, setModal }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type:"", text:"" });

  const buy = async () => {
    if (!auth || auth.role!=="user") { setModal("login-user"); return; }
    setLoading(true); setMsg({ type:"", text:"" });
    try {
      await api(`/courses/purchase/${course._id}`, { method:"POST" });
      setMsg({ type:"ok", text:"Enrolled! Find this course in My Courses." });
      onPurchase(course._id);
    } catch(e) { setMsg({ type:"error", text:e.message }); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:600 }}>
        {/* 3D hero */}
        <div style={{ position:"relative", height:260, borderRadius:14, overflow:"hidden", marginBottom:"1.5rem" }}>
          <CourseHero3D />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,#1a0700 0%,transparent 55%)" }} />
          <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.5)",
            border:"none", color:"rgba(245,162,99,0.7)", cursor:"pointer", borderRadius:8, padding:"6px 10px", fontSize:"1rem" }}>✕</button>
          <div style={{ position:"absolute", bottom:"1.25rem", left:"1.25rem", right:"1.25rem" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.6rem", letterSpacing:"0.03em", color:"#fff", marginBottom:6 }}>
              {course.title}
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem",
                background:"linear-gradient(135deg,#F5A263,#E8621A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                ${course.price}
              </span>
              <span style={{ fontSize:"0.72rem", padding:"0.2rem 0.6rem", borderRadius:999,
                background:"rgba(232,98,26,0.12)", border:"1px solid rgba(232,98,26,0.25)", color:"#F5A263" }}>
                {course.content?.length||0} lessons
              </span>
            </div>
          </div>
        </div>

        <p style={{ color:"rgba(245,162,99,0.6)", lineHeight:1.75, marginBottom:"1.5rem", fontSize:"0.9rem" }}>
          {course.description}
        </p>

        <Alert type={msg.type==="ok"?"success":"error"} msg={msg.text} />

        {isPurchased ? (
          <div style={{ padding:"0.85rem 1rem", borderRadius:10, fontSize:"0.875rem",
            background:"rgba(63,185,80,0.1)", border:"1px solid rgba(63,185,80,0.25)", color:"#4ade80",
            display:"flex", alignItems:"center", gap:8 }}>
            ✓ You already own this course
          </div>
        ) : (
          <Btn variant="primary" full lg onClick={buy} disabled={loading}>
            {loading ? "Processing…" : `Enroll for $${course.price}`}
          </Btn>
        )}

        {course.content?.length > 0 && (
          <>
            <div style={{ height:1, background:"rgba(232,98,26,0.12)", margin:"1.5rem 0" }} />
            <div style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em",
              color:"rgba(245,162,99,0.4)", marginBottom:"0.75rem" }}>Course Content</div>
            {course.content.map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"0.75rem 1rem",
                border:"1px solid rgba(232,98,26,0.12)", borderRadius:10, marginBottom:6,
                background:"rgba(232,98,26,0.04)" }}>
                <span style={{ width:26, height:26, borderRadius:"50%", background:"rgba(232,98,26,0.12)",
                  border:"1px solid rgba(232,98,26,0.2)", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"0.72rem", color:"#E8621A", flexShrink:0, fontWeight:600 }}>
                  {i+1}
                </span>
                <span style={{ flex:1, fontSize:"0.875rem", color:"rgba(245,162,99,0.8)" }}>{item.title}</span>
                {isPurchased && <span style={{ color:"#E8621A", fontSize:"0.75rem" }}>▶</span>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── AUTH MODALS ──────────────────────────────────────────────────────────────
function LoginModal({ role, onClose, onSuccess }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const submit = async () => {
    setErr(""); setLoading(true);
    try { await api(`/${role}s/login`,{method:"POST",body:JSON.stringify(form)}); onSuccess(); }
    catch(e) { setErr(e.message); }
    setLoading(false);
  };
  const label = role==="user" ? "Student" : "Instructor";
  return (
    <Modal title={`Sign in as ${label}`} onClose={onClose}>
      <Alert type="error" msg={err} />
      <Field label="Email"><input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} /></Field>
      <Field label="Password"><input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} /></Field>
      <Btn variant="primary" full lg onClick={submit} disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Btn>
    </Modal>
  );
}

function RegisterModal({ role, onClose, onSuccess }) {
  const [form, setForm] = useState({ email:"", password:"", firstName:"", lastName:"" });
  const [err, setErr] = useState(""); const [ok, setOk] = useState(""); const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      await api(`/${role}s/register`,{method:"POST",body:JSON.stringify(form)});
      setOk("Account created! Signing you in…");
      setTimeout(()=>onSuccess(),1200);
    } catch(e) { setErr(e.message); }
    setLoading(false);
  };
  return (
    <Modal title={`Create ${role==="user"?"Student":"Instructor"} Account`} onClose={onClose}>
      <Alert type="error" msg={err} />
      <Alert type="success" msg={ok} />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
        <Field label="First name"><input value={form.firstName} onChange={set("firstName")} /></Field>
        <Field label="Last name"><input value={form.lastName} onChange={set("lastName")} /></Field>
      </div>
      <Field label="Email"><input type="email" value={form.email} onChange={set("email")} /></Field>
      <Field label="Password"><input type="password" value={form.password} onChange={set("password")} /></Field>
      <Btn variant="primary" full lg onClick={submit} disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </Btn>
    </Modal>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ auth, setModal }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [purchased, setPurchased] = useState(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    api("/courses/preview-courses").then(d=>{setCourses(d.courses||[]);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  useEffect(() => {
    if (auth?.role==="user") {
      api("/users/purchased-courses",{method:"POST"}).then(d=>{
        setPurchased(new Set((d.courses||[]).map(p=>p.courseId?._id||p.courseId)));
      }).catch(()=>{});
    }
  },[auth]);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Hero setModal={setModal} setPage={()=>{}} />
      <MarqueeStrip />

      {/* Course grid */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"5rem 2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"3rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <div style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.12em",
              color:"#E8621A", marginBottom:"0.6rem" }}>All Courses</div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2rem,4vw,2.8rem)",
              letterSpacing:"0.03em", color:"#fff", lineHeight:1 }}>
              Explore {courses.length} courses
            </h2>
          </div>
          <input placeholder="Search courses…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:260, background:"rgba(232,98,26,0.06) !important",
              border:"1px solid rgba(232,98,26,0.2) !important" }} />
        </div>

        {loading ? <Spinner /> : filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"5rem 1rem" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem", opacity:0.3 }}>📚</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", color:"rgba(245,162,99,0.5)", letterSpacing:"0.05em" }}>
              {search ? "No courses found" : "No courses yet"}
            </div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1.5rem" }}>
            {filtered.map(c=><CourseCard key={c._id} course={c} onClick={setSelected} />)}
          </div>
        )}
      </div>

      {selected && (
        <CourseDetail course={selected} onClose={()=>setSelected(null)}
          onPurchase={id=>setPurchased(p=>new Set([...p,id]))}
          isPurchased={purchased.has(selected._id)} auth={auth} setModal={setModal} />
      )}
    </>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function UserDashboard({ auth }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api("/users/purchased-courses",{method:"POST"})
      .then(d=>{setCourses((d.courses||[]).map(p=>p.courseId).filter(Boolean));setLoading(false);})
      .catch(()=>setLoading(false));
  },[]);

  const StatCard = ({label,value}) => (
    <div style={{ background:"rgba(232,98,26,0.06)", border:"1px solid rgba(232,98,26,0.15)", borderRadius:14, padding:"1.25rem" }}>
      <div style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(245,162,99,0.5)", marginBottom:"0.4rem" }}>{label}</div>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem", letterSpacing:"0.05em",
        background:"linear-gradient(135deg,#F5A263,#E8621A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding:"2.5rem", maxWidth:1100, margin:"0 auto" }}>
      <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.5rem", letterSpacing:"0.05em",
        background:"linear-gradient(135deg,#F5A263,#E8621A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        marginBottom:"0.25rem" }}>My Learning</h1>
      <p style={{ color:"rgba(245,162,99,0.45)", marginBottom:"2.5rem", fontSize:"0.9rem" }}>Your enrolled courses</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"1rem", marginBottom:"3rem" }}>
        <StatCard label="Enrolled" value={courses.length} />
        <StatCard label="In Progress" value={courses.length} />
        <StatCard label="Total Lessons" value={courses.reduce((a,c)=>a+(c.content?.length||0),0)} />
      </div>

      {loading ? <Spinner /> : courses.length===0 ? (
        <div style={{ textAlign:"center", padding:"4rem" }}>
          <div style={{ fontSize:"3rem", marginBottom:"1rem", opacity:0.25 }}>🎓</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", color:"rgba(245,162,99,0.4)", letterSpacing:"0.05em" }}>
            No courses yet
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1.5rem" }}>
          {courses.map(c=><CourseCard key={c._id} course={c} onClick={setSelected} />)}
        </div>
      )}
      {selected && <CourseDetail course={selected} onClose={()=>setSelected(null)} isPurchased auth={auth} setModal={()=>{}} onPurchase={()=>{}} />}
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function CreateCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title:"", description:"", price:"", imageUrl:"", content:[] });
  const [lesson, setLesson] = useState({ title:"", videoUrl:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const addLesson = () => {
    if (!lesson.title||!lesson.videoUrl) return;
    setForm(p=>({...p,content:[...p.content,{...lesson}]}));
    setLesson({title:"",videoUrl:""});
  };

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const res = await api("/admin/create-course",{method:"POST",body:JSON.stringify({...form,price:Number(form.price)})});
      onCreated(res.courseId);
    } catch(e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <Modal title="Create Course" onClose={onClose} wide>
      <Alert type="error" msg={err} />
      <Field label="Course title"><input value={form.title} onChange={set("title")} placeholder="e.g. Complete React Mastery" /></Field>
      <Field label="Description"><textarea value={form.description} onChange={set("description")} placeholder="What will students learn?" style={{minHeight:80}} /></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
        <Field label="Price ($)"><input type="number" value={form.price} onChange={set("price")} placeholder="29.99" /></Field>
        <Field label="Thumbnail URL"><input value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://…" /></Field>
      </div>

      <div style={{height:1,background:"rgba(232,98,26,0.12)",margin:"1rem 0"}} />
      <div style={{fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.1em",color:"rgba(245,162,99,0.4)",marginBottom:"0.75rem"}}>Add Lessons</div>

      {form.content.map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"0.65rem 0.9rem",
          border:"1px solid rgba(232,98,26,0.12)",borderRadius:9,marginBottom:5,background:"rgba(232,98,26,0.04)"}}>
          <span style={{width:24,height:24,borderRadius:"50%",background:"rgba(232,98,26,0.12)",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:"0.7rem",color:"#E8621A",flexShrink:0,fontWeight:600}}>{i+1}</span>
          <span style={{flex:1,fontSize:"0.85rem",color:"rgba(245,162,99,0.8)"}}>{item.title}</span>
          <Btn variant="danger" sm onClick={()=>setForm(p=>({...p,content:p.content.filter((_,j)=>j!==i)}))}>✕</Btn>
        </div>
      ))}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"0.5rem",marginTop:"0.5rem"}}>
        <input placeholder="Lesson title" value={lesson.title} onChange={e=>setLesson(p=>({...p,title:e.target.value}))} />
        <input placeholder="Video URL" value={lesson.videoUrl} onChange={e=>setLesson(p=>({...p,videoUrl:e.target.value}))} />
        <Btn variant="outline" onClick={addLesson}>+</Btn>
      </div>

      <div style={{height:1,background:"rgba(232,98,26,0.12)",margin:"1rem 0"}} />
      <Btn variant="primary" full lg onClick={submit} disabled={loading}>
        {loading ? "Publishing…" : "Publish Course"}
      </Btn>
    </Modal>
  );
}

function EditCourseModal({ course, onClose, onUpdated }) {
  const [form, setForm] = useState({ title:course.title, description:course.description, price:course.price });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const submit = async () => {
    setErr(""); setLoading(true);
    try { await api(`/admin/edit-course/${course._id}`,{method:"PUT",body:JSON.stringify({...form,price:Number(form.price)})}); onUpdated(); }
    catch(e) { setErr(e.message); }
    setLoading(false);
  };
  return (
    <Modal title="Edit Course" onClose={onClose}>
      <Alert type="error" msg={err} />
      <Field label="Title"><input value={form.title} onChange={set("title")} /></Field>
      <Field label="Description"><textarea value={form.description} onChange={set("description")} style={{minHeight:80}} /></Field>
      <Field label="Price ($)"><input type="number" value={form.price} onChange={set("price")} /></Field>
      <Btn variant="primary" full lg onClick={submit} disabled={loading}>{loading?"Saving…":"Save changes"}</Btn>
    </Modal>
  );
}

function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api("/admin/courses").then(d=>{setCourses(d.courses||[]);setLoading(false);}).catch(()=>setLoading(false));
  },[]);
  useEffect(()=>{load();},[load]);

  const StatCard = ({label,value}) => (
    <div style={{background:"rgba(232,98,26,0.06)",border:"1px solid rgba(232,98,26,0.15)",borderRadius:14,padding:"1.25rem"}}>
      <div style={{fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(245,162,99,0.5)",marginBottom:"0.4rem"}}>{label}</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2rem",letterSpacing:"0.05em",
        background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding:"2.5rem", maxWidth:1100, margin:"0 auto" }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2.5rem",flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.5rem",letterSpacing:"0.05em",
            background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"0.25rem"}}>
            Instructor Dashboard
          </h1>
          <p style={{color:"rgba(245,162,99,0.45)",fontSize:"0.9rem"}}>Manage your courses</p>
        </div>
        <Btn variant="primary" onClick={()=>setModal("create")}>+ New Course</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"1rem",marginBottom:"3rem"}}>
        <StatCard label="Total Courses" value={courses.length} />
        <StatCard label="Total Lessons" value={courses.reduce((a,c)=>a+(c.content?.length||0),0)} />
        <StatCard label="Avg Price" value={`$${courses.length?Math.round(courses.reduce((a,c)=>a+c.price,0)/courses.length):0}`} />
      </div>

      {loading ? <Spinner /> : courses.length===0 ? (
        <div style={{textAlign:"center",padding:"4rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"1rem",opacity:0.25}}>✏️</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.5rem",color:"rgba(245,162,99,0.4)",letterSpacing:"0.05em",marginBottom:"1.5rem"}}>No courses yet</div>
          <Btn variant="primary" onClick={()=>setModal("create")}>Create your first course</Btn>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {courses.map(c=>(
            <div key={c._id} style={{background:"rgba(30,10,2,0.7)",border:"1px solid rgba(232,98,26,0.15)",
              borderRadius:14,padding:"1.1rem 1.4rem",display:"flex",gap:"1.25rem",alignItems:"center",flexWrap:"wrap",
              transition:"border-color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(232,98,26,0.4)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(232,98,26,0.15)"}>
              <div style={{width:52,height:52,borderRadius:10,background:"linear-gradient(135deg,#1a0700,#7A2A08)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:"0.05em",
                color:"rgba(232,98,26,0.5)",flexShrink:0}}>
                {c.title.slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.05rem",letterSpacing:"0.03em",
                  color:"#f5e6d8",marginBottom:"0.2rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div>
                <div style={{color:"rgba(245,162,99,0.45)",fontSize:"0.8rem",display:"flex",gap:"1rem"}}>
                  <span>${c.price}</span><span>{c.content?.length||0} lessons</span>
                </div>
              </div>
              <Btn variant="outline" sm onClick={()=>setEditing(c)}>✏ Edit</Btn>
            </div>
          ))}
        </div>
      )}

      {modal==="create" && <CreateCourseModal onClose={()=>setModal(null)} onCreated={()=>{setModal(null);load();}} />}
      {editing && <EditCourseModal course={editing} onClose={()=>setEditing(null)} onUpdated={()=>{setEditing(null);load();}} />}
    </div>
  );
}

// ─── SIDEBAR LAYOUT ───────────────────────────────────────────────────────────
function SidebarLayout({ auth, page, setPage, children }) {
  const isAdmin = auth?.role==="admin";
  const SLink = ({label,icon,target}) => (
    <button className={`sidebar-link${page===target?" active":""}`} onClick={()=>setPage(target)}>
      <span>{icon}</span> {label}
    </button>
  );
  return (
    <div style={{display:"grid",gridTemplateColumns:"210px 1fr",minHeight:"100vh",paddingTop:64}}>
      <aside style={{background:"rgba(13,5,0,0.8)",borderRight:"1px solid rgba(232,98,26,0.1)",
        padding:"1.75rem 0.75rem",display:"flex",flexDirection:"column",gap:"0.2rem",
        position:"sticky",top:64,height:"calc(100vh - 64px)",overflowY:"auto"}}>
        <div style={{fontSize:"0.65rem",textTransform:"uppercase",letterSpacing:"0.1em",
          color:"rgba(245,162,99,0.3)",padding:"0.5rem 0.75rem 0.3rem"}}>Navigation</div>
        <SLink label="Explore" icon="◎" target="home" />
        {!isAdmin && <SLink label="My Courses" icon="◈" target="dashboard" />}
        {isAdmin && <SLink label="My Courses" icon="◈" target="admin" />}
        <div style={{height:1,background:"rgba(232,98,26,0.08)",margin:"0.75rem 0"}} />
        <div style={{fontSize:"0.65rem",textTransform:"uppercase",letterSpacing:"0.1em",
          color:"rgba(245,162,99,0.3)",padding:"0.5rem 0.75rem 0.3rem"}}>Account</div>
        <div className="sidebar-link" style={{cursor:"default",pointerEvents:"none"}}>
          <span>◉</span>
          <span style={{fontSize:"0.8rem"}}>{isAdmin?"Instructor":"Student"}</span>
        </div>
      </aside>
      <main style={{background:"#0d0500",minHeight:"calc(100vh - 64px)"}}>{children}</main>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuthRaw] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("cv_auth")||"null"); } catch { return null; }
  });
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);

  const setAuth = a => { setAuthRaw(a); a ? localStorage.setItem("cv_auth",JSON.stringify(a)) : localStorage.removeItem("cv_auth"); };
  const loginSuccess = role => { setAuth({role}); setModal(null); setPage(role==="admin"?"admin":"dashboard"); };
  const regSuccess = role => { setModal(`login-${role}`); };

  const renderPage = () => {
    if (page==="dashboard" && auth?.role==="user") return <SidebarLayout auth={auth} page={page} setPage={setPage}><UserDashboard auth={auth} /></SidebarLayout>;
    if (page==="admin" && auth?.role==="admin") return <SidebarLayout auth={auth} page={page} setPage={setPage}><AdminDashboard /></SidebarLayout>;
    return <HomePage auth={auth} setModal={setModal} />;
  };

  return (
    <AuthCtx.Provider value={auth}>
      <InjectTailwind />
      <div style={{background:"#0d0500",minHeight:"100vh"}}>
        <Navbar page={page} setPage={setPage} auth={auth} setAuth={setAuth} setModal={setModal} />
        {renderPage()}
      </div>
      {modal==="login-user" && <LoginModal role="user" onClose={()=>setModal(null)} onSuccess={()=>loginSuccess("user")} />}
      {modal==="login-admin" && <LoginModal role="admin" onClose={()=>setModal(null)} onSuccess={()=>loginSuccess("admin")} />}
      {modal==="register-user" && <RegisterModal role="user" onClose={()=>setModal(null)} onSuccess={()=>regSuccess("user")} />}
      {modal==="register-admin" && <RegisterModal role="admin" onClose={()=>setModal(null)} onSuccess={()=>regSuccess("admin")} />}
    </AuthCtx.Provider>
  );
}
