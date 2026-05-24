import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import * as THREE from "three";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

// ─── ZOD SCHEMAS ─────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const registerSchema = z.object({
  firstName: z.string().min(2, "Too short"),
  lastName: z.string().min(2, "Too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const courseSchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().min(10, "Description too short"),
  price: z.coerce.number().min(0, "Must be positive"),
  imageUrl: z.string().url("Enter a valid URL").or(z.literal("")),
});
const editCourseSchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().min(10, "Description too short"),
  price: z.coerce.number().min(0, "Must be positive"),
});

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function InjectStyles() {
  useEffect(() => {
    if (document.getElementById("cv-styles")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.id = "cv-styles";
    style.textContent = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html,body,#root{min-height:100%}
      body{font-family:'DM Sans',sans-serif;background:#0d0500;overflow-x:hidden;color:#f5e6d8}
      ::-webkit-scrollbar{width:4px}
      ::-webkit-scrollbar-thumb{background:#7A2A08;border-radius:2px}
      ::selection{background:rgba(232,98,26,0.35)}
      @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      @keyframes spinSlow{to{transform:rotate(360deg)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
      @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      @keyframes pulseRing{0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.6);opacity:0}}
      .afu{animation:fadeUp 0.7s ease-out forwards}
      .afi{animation:fadeIn 0.5s ease-out forwards}
      .asi{animation:scaleIn 0.4s ease-out forwards}
      .d1{animation-delay:0.1s}.d2{animation-delay:0.2s}.d3{animation-delay:0.3s}.d4{animation-delay:0.4s}
      .op0{opacity:0}
      .hero-title{font-family:'Bebas Neue',sans-serif;line-height:0.88;letter-spacing:-0.01em}
      .bebas{font-family:'Bebas Neue',sans-serif}
      .card-hover{transition:transform 0.3s,box-shadow 0.3s,border-color 0.3s}
      .card-hover:hover{transform:translateY(-6px);box-shadow:0 24px 60px rgba(0,0,0,0.5),0 0 40px rgba(232,98,26,0.15);border-color:rgba(232,98,26,0.5)!important}
      .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn 0.2s}
      .modal{background:linear-gradient(145deg,#1a0700,#0d0500);border:1px solid rgba(232,98,26,0.25);border-radius:20px;padding:2rem;width:100%;max-height:90vh;overflow-y:auto;animation:scaleIn 0.25s ease-out}
      .fi{background:rgba(255,255,255,0.04);border:1px solid rgba(232,98,26,0.2);border-radius:10px;padding:0.65rem 0.9rem;color:#f5e6d8;font-family:'DM Sans',sans-serif;font-size:0.9rem;outline:none;width:100%;transition:border-color 0.2s,background 0.2s}
      .fi:focus{border-color:rgba(232,98,26,0.6)!important;background:rgba(232,98,26,0.05)!important}
      .fi::placeholder{color:rgba(245,162,99,0.3)}
      .fi-err{border-color:rgba(248,113,113,0.5)!important;background:rgba(248,113,113,0.04)!important}
      .spinner{width:32px;height:32px;border:2px solid rgba(232,98,26,0.2);border-top-color:#E8621A;border-radius:50%;animation:spinSlow 0.7s linear infinite}
      .mq-track{animation:marquee 22s linear infinite}
      .sidebar-link{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;color:rgba(245,162,99,0.6);font-size:0.875rem;cursor:pointer;transition:all 0.2s;border:none;background:transparent;width:100%;text-align:left;font-family:'DM Sans',sans-serif}
      .sidebar-link:hover{color:#F5A263;background:rgba(232,98,26,0.1)}
      .sidebar-link.active{color:#E8621A;background:rgba(232,98,26,0.15);border-left:2px solid #E8621A}
      .tab-btn{padding:0.5rem 1.2rem;border-radius:8px;font-size:0.875rem;cursor:pointer;transition:all 0.2s;border:none;font-family:'DM Sans',sans-serif;background:transparent;color:rgba(245,162,99,0.5)}
      .tab-btn.active{background:linear-gradient(135deg,#E8621A,#C94B10);color:#fff;box-shadow:0 0 16px rgba(232,98,26,0.4)}
      .tab-btn:hover:not(.active){color:#F5A263;background:rgba(232,98,26,0.1)}
      @media(max-width:768px){
        .dash-grid{grid-template-columns:1fr!important}
        .sidebar-col{display:none!important}
        .hero-pad{padding:0 1.2rem!important}
        .f2col{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

// ─── THREE.JS HERO ────────────────────────────────────────────────────────────
function useHeroScene(ref) {
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.z = 5;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0xC94B10, emissive: 0x7A2A08, roughness: 0.15, metalness: 0.6 })
    );
    sphere.position.set(1.8, -0.2, -1); scene.add(sphere);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.015, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0xF5A263, transparent: true, opacity: 0.4 })
    );
    ring.position.copy(sphere.position); ring.rotation.x = Math.PI / 2.5; scene.add(ring);
    const count = 1200; const pos = new Float32Array(count * 3); const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]=(Math.random()-0.5)*22; pos[i*3+1]=(Math.random()-0.5)*14; pos[i*3+2]=(Math.random()-0.5)*10;
      const t=Math.random(); col[i*3]=0.8+t*0.2; col[i*3+1]=0.3+t*0.3; col[i*3+2]=0.05+t*0.1;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.6 })));
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1),
      new THREE.MeshStandardMaterial({ color: 0xF5A263, wireframe: true, transparent: true, opacity: 0.25 }));
    ico.position.set(-3.5, 1.5, -1); scene.add(ico);
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xF5A263, emissiveIntensity: 1.5 }));
    star.position.set(-2.2, 0.5, 0.5); scene.add(star);
    scene.add(new THREE.AmbientLight(0x3D1204, 6));
    const pl1 = new THREE.PointLight(0xE8621A, 15, 12); pl1.position.set(2,1,3); scene.add(pl1);
    const pl2 = new THREE.PointLight(0xF5A263, 8, 8); pl2.position.set(-3,2,1); scene.add(pl2);
    let mouse = { x:0, y:0 };
    const onMouse = e => { mouse.x=(e.clientX/window.innerWidth-0.5)*2; mouse.y=-(e.clientY/window.innerHeight-0.5)*2; };
    window.addEventListener("mousemove", onMouse);
    let raf;
    const tick = t => {
      raf=requestAnimationFrame(tick);
      sphere.rotation.y=t*0.0003; sphere.rotation.x=t*0.0001;
      ring.rotation.z=t*0.0002; ico.rotation.x=t*0.0005; ico.rotation.y=t*0.0004;
      star.rotation.x=t*0.001; star.rotation.y=t*0.0015; star.position.y=0.5+Math.sin(t*0.002)*0.2;
      camera.position.x+=(mouse.x*0.5-camera.position.x)*0.03;
      camera.position.y+=(mouse.y*0.3-camera.position.y)*0.03;
      renderer.render(scene, camera);
    };
    raf=requestAnimationFrame(tick);
    const onResize=()=>{ camera.aspect=canvas.offsetWidth/canvas.offsetHeight; camera.updateProjectionMatrix(); renderer.setSize(canvas.offsetWidth,canvas.offsetHeight); };
    window.addEventListener("resize", onResize);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("mousemove",onMouse); window.removeEventListener("resize",onResize); renderer.dispose(); };
  }, []);
}

function useMiniLogo(ref) {
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(2); renderer.setSize(38, 38);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 20); cam.position.z=2.8;
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0),
      new THREE.MeshStandardMaterial({ color:0xE8621A, emissive:0x7A2A08, metalness:0.8, roughness:0.2 }));
    scene.add(mesh); scene.add(new THREE.AmbientLight(0xff6622, 4));
    const pl=new THREE.PointLight(0xF5A263,10,8); pl.position.set(2,2,2); scene.add(pl);
    let raf;
    const tick=t=>{ raf=requestAnimationFrame(tick); mesh.rotation.x=t*0.0009; mesh.rotation.y=t*0.0013; renderer.render(scene,cam); };
    raf=requestAnimationFrame(tick);
    return ()=>{ cancelAnimationFrame(raf); renderer.dispose(); };
  }, []);
}

function CourseHero3D() {
  const ref = useRef();
  useEffect(() => {
    const canvas=ref.current; if(!canvas) return;
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(canvas.offsetWidth,canvas.offsetHeight);
    const scene=new THREE.Scene();
    const cam=new THREE.PerspectiveCamera(65,canvas.offsetWidth/canvas.offsetHeight,0.1,50); cam.position.z=4;
    const sphere=new THREE.Mesh(new THREE.SphereGeometry(1.2,32,32),
      new THREE.MeshStandardMaterial({color:0xC94B10,emissive:0x7A2A08,roughness:0.2,metalness:0.7}));
    sphere.position.set(1,0,0); scene.add(sphere);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.6,0.012,8,80),
      new THREE.MeshBasicMaterial({color:0xF5A263,transparent:true,opacity:0.35}));
    ring.rotation.x=Math.PI/2.2; ring.position.copy(sphere.position); scene.add(ring);
    const count=400; const pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){pos[i*3]=(Math.random()-0.5)*10;pos[i*3+1]=(Math.random()-0.5)*6;pos[i*3+2]=(Math.random()-0.5)*4;}
    const pg=new THREE.BufferGeometry(); pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
    scene.add(new THREE.Points(pg,new THREE.PointsMaterial({size:0.04,color:0xF5A263,transparent:true,opacity:0.5})));
    scene.add(new THREE.AmbientLight(0x3D1204,5));
    const pl=new THREE.PointLight(0xE8621A,12,10); pl.position.set(1,2,3); scene.add(pl);
    let raf;
    const tick=t=>{raf=requestAnimationFrame(tick);sphere.rotation.y=t*0.0005;ring.rotation.z=t*0.0003;renderer.render(scene,cam);};
    raf=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(raf);renderer.dispose();};
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />;
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{display:"flex",justifyContent:"center",padding:"4rem"}}>
    <div className="spinner" />
  </div>
);

function Alert({ type, msg }) {
  if (!msg) return null;
  const ok = type !== "error";
  return (
    <div style={{padding:"0.75rem 1rem",borderRadius:10,fontSize:"0.875rem",marginBottom:"1rem",
      background:ok?"rgba(63,185,80,0.1)":"rgba(200,40,30,0.12)",
      border:`1px solid ${ok?"rgba(63,185,80,0.25)":"rgba(200,40,30,0.3)"}`,
      color:ok?"#4ade80":"#f87171",display:"flex",alignItems:"center",gap:8}}>
      {ok?"✓":"⚠"} {msg}
    </div>
  );
}

const FieldErr = ({ message }) => message
  ? <p style={{color:"#f87171",fontSize:"0.76rem",marginTop:5,display:"flex",alignItems:"center",gap:4}}>⚠ {message}</p>
  : null;

function Field({ label, children }) {
  return (
    <div style={{marginBottom:"1rem"}}>
      <label style={{display:"block",fontSize:"0.78rem",color:"rgba(245,162,99,0.55)",marginBottom:"0.4rem",letterSpacing:"0.06em",textTransform:"uppercase"}}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant="primary", full, lg, sm, disabled, style:s }) {
  const base={fontFamily:"'DM Sans',sans-serif",fontWeight:500,cursor:"pointer",borderRadius:lg?12:9,outline:"none",
    display:"inline-flex",alignItems:"center",gap:6,justifyContent:"center",transition:"all 0.22s",
    width:full?"100%":"auto",border:"none",
    padding:lg?"0.85rem 2rem":sm?"0.35rem 0.9rem":"0.55rem 1.25rem",
    fontSize:lg?"1rem":sm?"0.8rem":"0.875rem",opacity:disabled?0.45:1,pointerEvents:disabled?"none":"auto",...s};
  const V={
    primary:{background:"linear-gradient(135deg,#E8621A,#C94B10)",color:"#fff",boxShadow:"0 0 22px rgba(232,98,26,0.4)"},
    outline:{background:"transparent",color:"#F5A263",border:"1px solid rgba(232,98,26,0.35)"},
    ghost:{background:"transparent",color:"rgba(245,162,99,0.6)"},
    danger:{background:"rgba(200,40,30,0.12)",color:"#f87171",border:"1px solid rgba(200,40,30,0.25)"},
    green:{background:"rgba(63,185,80,0.12)",color:"#4ade80",border:"1px solid rgba(63,185,80,0.25)"},
    purple:{background:"rgba(139,92,246,0.12)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.25)"},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{...base,...V[variant]}}
      onMouseEnter={e=>{if(variant==="primary")e.currentTarget.style.boxShadow="0 0 40px rgba(232,98,26,0.7)";}}
      onMouseLeave={e=>{if(variant==="primary")e.currentTarget.style.boxShadow="0 0 22px rgba(232,98,26,0.4)";}}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:wide?600:460}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <h2 className="bebas" style={{fontSize:"1.6rem",letterSpacing:"0.05em",
            background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {title}
          </h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(245,162,99,0.5)",cursor:"pointer",fontSize:"1.25rem",lineHeight:1}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Divider = () => <div style={{height:1,background:"rgba(232,98,26,0.12)",margin:"1rem 0"}} />;

function TypeBadge({ type }) {
  const cfg = {
    paid:     {label:"💳 Paid",     bg:"rgba(232,98,26,0.12)", color:"#F5A263", border:"rgba(232,98,26,0.25)"},
    free:     {label:"🆓 Free",     bg:"rgba(63,185,80,0.1)",  color:"#4ade80", border:"rgba(63,185,80,0.25)"},
    external: {label:"🔗 Udemy",    bg:"rgba(139,92,246,0.1)", color:"#a78bfa", border:"rgba(139,92,246,0.25)"},
  };
  const c = cfg[type] || cfg.paid;
  return (
    <span style={{fontSize:"0.7rem",padding:"0.2rem 0.65rem",borderRadius:999,
      background:c.bg,color:c.color,border:`1px solid ${c.border}`,fontWeight:500,whiteSpace:"nowrap"}}>
      {c.label}
    </span>
  );
}

function SortSelect({ value, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:"0.78rem",color:"rgba(245,162,99,0.45)"}}>Sort:</span>
      <select className="fi" value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"auto",padding:"0.4rem 0.8rem",fontSize:"0.82rem"}}>
        <option value="newest">Newest</option>
        <option value="alpha">A → Z</option>
        <option value="price-low">Price: Low → High</option>
        <option value="price-high">Price: High → Low</option>
      </select>
    </div>
  );
}

const sortList = (list, sortBy) => {
  const copy = [...list];
  if (sortBy==="alpha")      return copy.sort((a,b)=>a.title.localeCompare(b.title));
  if (sortBy==="price-low")  return copy.sort((a,b)=>(a.price||0)-(b.price||0));
  if (sortBy==="price-high") return copy.sort((a,b)=>(b.price||0)-(a.price||0));
  return copy.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
};

// ─── COURSE CARD ──────────────────────────────────────────────────────────────
function CourseCard({ course, onClick }) {
  const initials = course.title.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const isFree = course.type==="free";
  const isExt  = course.type==="external";
  return (
    <div className="card-hover" onClick={()=>onClick(course)}
      style={{background:"linear-gradient(145deg,rgba(30,10,2,0.9),rgba(13,5,0,0.95))",
        border:"1px solid rgba(232,98,26,0.18)",borderRadius:16,overflow:"hidden",cursor:"pointer"}}>
      {course.imageUrl
        ? <img src={course.imageUrl} alt={course.title}
            style={{width:"100%",height:180,objectFit:"cover",display:"block"}}
            onError={e=>e.target.style.display="none"} />
        : <div style={{height:180,background:"linear-gradient(135deg,#1a0700,#7A2A08)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.5rem",color:"rgba(232,98,26,0.35)"}}>
            {initials}
          </div>
      }
      <div style={{padding:"1.25rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:"0.5rem"}}>
          <div className="bebas" style={{fontSize:"1.1rem",letterSpacing:"0.03em",color:"#f5e6d8",lineHeight:1.2,flex:1}}>
            {course.title}
          </div>
          <TypeBadge type={course.type||"paid"} />
        </div>
        <div style={{fontSize:"0.82rem",color:"rgba(245,162,99,0.5)",lineHeight:1.6,marginBottom:"1rem",
          display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
          {course.description}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {isFree
            ? <span className="bebas" style={{fontSize:"1.2rem",color:"#4ade80",letterSpacing:"0.05em"}}>FREE</span>
            : isExt
              ? <span className="bebas" style={{fontSize:"1.2rem",color:"#a78bfa",letterSpacing:"0.05em"}}>${course.price||"—"}</span>
              : <span className="bebas" style={{fontSize:"1.2rem",letterSpacing:"0.05em",
                  background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                  ${course.price}
                </span>
          }
          <span style={{fontSize:"0.72rem",padding:"0.2rem 0.65rem",borderRadius:999,
            background:"rgba(232,98,26,0.1)",border:"1px solid rgba(232,98,26,0.22)",color:"#F5A263"}}>
            {course.content?.length>0 ? `${course.content.length} lessons` : course.platform||"Course"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── COURSE DETAIL ────────────────────────────────────────────────────────────
function CourseDetail({ course, onClose, onPurchase, isPurchased, auth, setModal }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({type:"",text:""});
  const isFree = course.type==="free";
  const isExt  = course.type==="external";

  const buy = async () => {
    if (!auth||auth.role!=="user") { setModal("login-user"); return; }
    setLoading(true); setMsg({type:"",text:""});
    try {
      await api(`/courses/purchase/${course._id}`,{method:"POST"});
      setMsg({type:"ok",text:"Enrolled! Find it in My Courses."});
      onPurchase(course._id);
    } catch(e) { setMsg({type:"error",text:e.message}); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:600}}>
        <div style={{position:"relative",height:260,borderRadius:14,overflow:"hidden",marginBottom:"1.5rem"}}>
          <CourseHero3D />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,#1a0700 0%,transparent 55%)"}} />
          <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.5)",
            border:"none",color:"rgba(245,162,99,0.7)",cursor:"pointer",borderRadius:8,padding:"6px 10px"}}>✕</button>
          <div style={{position:"absolute",bottom:"1.25rem",left:"1.25rem",right:"1.25rem"}}>
            <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}>
              <TypeBadge type={course.type||"paid"} />
              {course.platform&&<span style={{fontSize:"0.7rem",color:"rgba(245,162,99,0.5)"}}>{course.platform}</span>}
            </div>
            <div className="bebas" style={{fontSize:"1.6rem",color:"#fff",marginBottom:6}}>{course.title}</div>
            <span className="bebas" style={{fontSize:"1.4rem",
              background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              {isFree?"FREE":`$${course.price}`}
            </span>
          </div>
        </div>

        <p style={{color:"rgba(245,162,99,0.6)",lineHeight:1.75,marginBottom:"1.25rem",fontSize:"0.9rem"}}>
          {course.description}
        </p>

        {course.tags?.length>0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1.25rem"}}>
            {course.tags.map((tag,i)=>(
              <span key={i} style={{fontSize:"0.72rem",padding:"0.2rem 0.6rem",borderRadius:999,
                background:"rgba(232,98,26,0.08)",border:"1px solid rgba(232,98,26,0.15)",color:"rgba(245,162,99,0.6)"}}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <Alert type={msg.type==="ok"?"success":"error"} msg={msg.text} />

        {isFree && course.videoUrl && (
          <a href={course.videoUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <Btn variant="green" full lg>▶ Watch Free on YouTube</Btn>
          </a>
        )}
        {isExt && course.externalUrl && (
          <a href={course.externalUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <Btn variant="purple" full lg>🔗 Go to {course.platform||"Udemy"} →</Btn>
          </a>
        )}
        {!isFree && !isExt && (
          isPurchased
            ? <div style={{padding:"0.85rem 1rem",borderRadius:10,background:"rgba(63,185,80,0.1)",
                border:"1px solid rgba(63,185,80,0.25)",color:"#4ade80",display:"flex",alignItems:"center",gap:8}}>
                ✓ You already own this course
              </div>
            : <Btn variant="primary" full lg onClick={buy} disabled={loading}>
                {loading?"Processing…":`Enroll for $${course.price}`}
              </Btn>
        )}

        {course.content?.length>0 && (
          <>
            <Divider />
            <div style={{fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.1em",
              color:"rgba(245,162,99,0.4)",marginBottom:"0.75rem"}}>Course Content</div>
            {course.content.map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"0.75rem 1rem",
                border:"1px solid rgba(232,98,26,0.12)",borderRadius:10,marginBottom:6,background:"rgba(232,98,26,0.04)"}}>
                <span style={{width:26,height:26,borderRadius:"50%",background:"rgba(232,98,26,0.12)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.72rem",
                  color:"#E8621A",flexShrink:0,fontWeight:600}}>{i+1}</span>
                <span style={{flex:1,fontSize:"0.875rem",color:"rgba(245,162,99,0.8)"}}>{item.title}</span>
                {isPurchased&&<span style={{color:"#E8621A",fontSize:"0.75rem"}}>▶</span>}
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
  const {register,handleSubmit,formState:{errors}} = useForm({resolver:zodResolver(loginSchema)});
  const [apiErr,setApiErr]=useState(""); const [loading,setLoading]=useState(false);
  const onSubmit = async data => {
    setApiErr(""); setLoading(true);
    try {
      const endpoint = role === "admin" ? "/admin" : "/users";
      await api(`${endpoint}/login`,{method:"POST",body:JSON.stringify(data)});
      onSuccess();
    }
    catch(e) { setApiErr(e.message); }
    setLoading(false);
  };
  return (
    <Modal title={`Sign in as ${role==="user"?"Student":"Instructor"}`} onClose={onClose}>
      <Alert type="error" msg={apiErr} />
      <Field label="Email">
        <input type="email" placeholder="you@example.com" className={`fi ${errors.email?"fi-err":""}`} {...register("email")} />
        <FieldErr message={errors.email?.message} />
      </Field>
      <Field label="Password">
        <input type="password" placeholder="••••••••" className={`fi ${errors.password?"fi-err":""}`} {...register("password")} />
        <FieldErr message={errors.password?.message} />
      </Field>
      <Btn variant="primary" full lg onClick={handleSubmit(onSubmit)} disabled={loading}>
        {loading?"Signing in…":"Sign in"}
      </Btn>
    </Modal>
  );
}

function RegisterModal({ role, onClose, onSuccess }) {
  const {register,handleSubmit,formState:{errors}} = useForm({resolver:zodResolver(registerSchema)});
  const [apiErr,setApiErr]=useState(""); const [ok,setOk]=useState(""); const [loading,setLoading]=useState(false);
  const onSubmit = async data => {
    setApiErr(""); setLoading(true);
    try {
      const endpoint = role === "admin" ? "/admin" : "/users";
      await api(`${endpoint}/register`,{method:"POST",body:JSON.stringify(data)});
      setOk("Account created! Signing you in…");
      setTimeout(()=>onSuccess(), 1200);
    }
    catch(e) { setApiErr(e.message); }
    setLoading(false);
  };
  return (
    <Modal title={`Create ${role==="user"?"Student":"Instructor"} Account`} onClose={onClose}>
      <Alert type="error" msg={apiErr} />
      <Alert type="success" msg={ok} />
      <div className="f2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
        <Field label="First name">
          <input className={`fi ${errors.firstName?"fi-err":""}`} {...register("firstName")} />
          <FieldErr message={errors.firstName?.message} />
        </Field>
        <Field label="Last name">
          <input className={`fi ${errors.lastName?"fi-err":""}`} {...register("lastName")} />
          <FieldErr message={errors.lastName?.message} />
        </Field>
      </div>
      <Field label="Email">
        <input type="email" className={`fi ${errors.email?"fi-err":""}`} {...register("email")} />
        <FieldErr message={errors.email?.message} />
      </Field>
      <Field label="Password">
        <input type="password" className={`fi ${errors.password?"fi-err":""}`} {...register("password")} />
        <FieldErr message={errors.password?.message} />
      </Field>
      <Btn variant="primary" full lg onClick={handleSubmit(onSubmit)} disabled={loading}>
        {loading?"Creating…":"Create account"}
      </Btn>
    </Modal>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, auth, setAuth, setModal }) {
  const logoRef=useRef(); useMiniLogo(logoRef);
  const logout = async () => {
    try { await api(`/${auth.role}s/logout`,{method:"POST"}); } catch {}
    setAuth(null); setPage("home");
  };
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(13,5,0,0.8)",
      backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(232,98,26,0.12)",
      display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 2rem",height:64}}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setPage("home")}>
        <canvas ref={logoRef} width={38} height={38} style={{borderRadius:8}} />
        <span className="bebas" style={{fontSize:"1.4rem",letterSpacing:"0.1em",
          background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          CourseVault
        </span>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        <Btn variant="ghost" onClick={()=>setPage("explore")}>Explore</Btn>
        {!auth ? (
          <>
            <Btn variant="ghost" onClick={()=>setModal("login-user")}>Sign in</Btn>
            <Btn variant="primary" onClick={()=>setModal("register-user")}>Get started</Btn>
            <Btn variant="outline" sm onClick={()=>setModal("login-admin")}>⬡ Instructor Login</Btn>
            <Btn variant="ghost" sm onClick={()=>setModal("register-admin")}
              style={{fontSize:"0.75rem",color:"rgba(245,162,99,0.45)"}}>
              Register as Instructor
            </Btn>
          </>
        ) : (
          <>
            <Btn variant="ghost" onClick={()=>setPage(auth.role==="admin"?"admin":"dashboard")}>
              {auth.role==="admin"?"Dashboard":"My Courses"}
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
  const canvasRef=useRef(); useHeroScene(canvasRef);
  return (
    <div style={{position:"relative",height:"100vh",overflow:"hidden",display:"flex",alignItems:"center"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
      <div style={{position:"absolute",inset:0,
        background:"radial-gradient(ellipse 90% 70% at 65% 45%,rgba(201,75,16,0.55) 0%,rgba(122,42,8,0.4) 40%,rgba(13,5,0,0.95) 80%)"}} />
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"30%",background:"linear-gradient(to top,#0d0500,transparent)"}} />
      <div className="hero-pad" style={{position:"relative",zIndex:2,width:"100%",padding:"0 3rem"}}>
        <div className="afu op0" style={{display:"inline-flex",alignItems:"center",gap:10,
          background:"rgba(232,98,26,0.1)",border:"1px solid rgba(232,98,26,0.25)",
          borderRadius:999,padding:"0.4rem 1.1rem",marginBottom:"1.5rem"}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#E8621A",
            boxShadow:"0 0 10px #E8621A",animation:"pulseRing 1.5s ease-out infinite"}} />
          <span style={{fontSize:"0.78rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#F5A263"}}>
            Free · Paid · Instructor Courses — All in One Place
          </span>
        </div>
        <h1 className="hero-title afu d1 op0" style={{fontSize:"clamp(5rem,14vw,11rem)",color:"#fff",maxWidth:900}}>
          COURSE<br />
          <span style={{background:"linear-gradient(135deg,#F5A263 20%,#E8621A 60%,#C94B10 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>VAULT</span>
        </h1>
        <p className="afu d3 op0" style={{fontSize:"1.1rem",color:"rgba(245,162,99,0.75)",
          marginTop:"1.5rem",marginBottom:"2.5rem",maxWidth:480,lineHeight:1.7}}>
          Search free YouTube courses, Udemy links, and instructor-uploaded content — all in one place.
        </p>
        <div className="afu d4 op0" style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <Btn variant="primary" lg onClick={()=>setPage("explore")}>Explore Courses</Btn>
          <Btn variant="outline" lg onClick={()=>setModal("register-user")}>Start for free →</Btn>
        </div>
      </div>
      <div style={{position:"absolute",bottom:"2rem",left:"50%",transform:"translateX(-50%)",
        display:"flex",flexDirection:"column",alignItems:"center",gap:6,animation:"floatY 2.5s ease-in-out infinite"}}>
        <div style={{width:1,height:44,background:"linear-gradient(to bottom,#E8621A,transparent)"}} />
        <span style={{fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(232,98,26,0.5)"}}>scroll</span>
      </div>
    </div>
  );
}

// ─── MARQUEE ──────────────────────────────────────────────────────────────────
function Marquee() {
  const items=["Python","Machine Learning","React","Node.js","Cybersecurity","Data Science","Deep Learning","Docker","System Design","TypeScript","LangChain","Kubernetes","Blockchain","Flutter","UI/UX","PostgreSQL","RAG","Transformers","Rust","Go"];
  const doubled=[...items,...items];
  return (
    <div style={{overflow:"hidden",borderTop:"1px solid rgba(232,98,26,0.15)",borderBottom:"1px solid rgba(232,98,26,0.15)",padding:"1rem 0",background:"rgba(232,98,26,0.04)"}}>
      <div className="mq-track" style={{display:"flex",gap:"3rem",width:"max-content"}}>
        {doubled.map((item,i)=>(
          <span key={i} className="bebas" style={{fontSize:"1.1rem",letterSpacing:"0.1em",
            color:i%3===0?"#E8621A":"rgba(245,162,99,0.35)",whiteSpace:"nowrap"}}>
            {item} {i%2===0?"◆":"✦"}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHead({ emoji, title, count, color="#F5A263" }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.25rem",marginTop:"2.5rem"}}>
      <span style={{fontSize:"1.3rem"}}>{emoji}</span>
      <h3 className="bebas" style={{fontSize:"1.4rem",letterSpacing:"0.05em",color}}>{title}</h3>
      <span style={{fontSize:"0.72rem",padding:"0.2rem 0.6rem",borderRadius:999,
        background:"rgba(232,98,26,0.1)",border:"1px solid rgba(232,98,26,0.2)",color:"rgba(245,162,99,0.6)"}}>
        {count}
      </span>
    </div>
  );
}

// ─── EXPLORE PAGE ─────────────────────────────────────────────────────────────
function ExplorePage({ auth, setModal }) {
  const [resources, setResources] = useState([]);   // free + external from resourceModel
  const [adminCourses, setAdminCourses] = useState([]); // paid from courseModel (public preview)
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(null);
  const [purchased, setPurchased] = useState(new Set());

 useEffect(() => {
  api("/courses/preview-courses")
    .then(d => { setResources(d.courses||[]); setLoading(false); })
    .catch(()=>setLoading(false));
},[]);

  useEffect(() => {
    if (auth?.role==="user") {
      api("/users/purchased-courses",{method:"POST"})
        .then(d=>setPurchased(new Set((d.courses||[]).map(p=>p.courseId?._id||p.courseId))))
        .catch(()=>{});
    }
  },[auth]);

  const doSearch = async () => {
    const q=search.trim();
    if (!q) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const d=await api(`/courses/search?q=${encodeURIComponent(q)}`);
      setSearchResults(d);
    } catch { setSearchResults(null); }
    setSearching(false);
  };

  const free     = resources.filter(r=>r.type==="free");
  const external = resources.filter(r=>r.type==="external");

const allCombined = resources; // now includes paid too from backend

const displayed = sortList(
  activeTab==="free"     ? allCombined.filter(c=>c.type==="free") :
  activeTab==="external" ? allCombined.filter(c=>c.type==="external") :
  activeTab==="paid"     ? allCombined.filter(c=>c.type==="paid") :
  allCombined,
  sortBy
);

  const CourseGridInner = ({ list, emptyMsg }) => list.length===0
    ? <div style={{textAlign:"center",padding:"3rem",border:"1px dashed rgba(232,98,26,0.12)",borderRadius:12}}>
        <div style={{fontSize:"2rem",opacity:0.2,marginBottom:"0.5rem"}}>📭</div>
        <div className="bebas" style={{fontSize:"1.1rem",color:"rgba(245,162,99,0.35)",letterSpacing:"0.05em"}}>{emptyMsg}</div>
      </div>
    : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:"1.25rem"}}>
        {list.map(c=><CourseCard key={c._id} course={c} onClick={setSelected} />)}
      </div>;

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"2.5rem 2rem"}}>
      {/* Page header */}
      <div style={{marginBottom:"2rem"}}>
        <div style={{fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.12em",color:"#E8621A",marginBottom:"0.5rem"}}>Explore</div>
        <h1 className="bebas" style={{fontSize:"clamp(2rem,4vw,2.8rem)",letterSpacing:"0.03em",color:"#fff",marginBottom:"0.2rem"}}>
          All Courses
        </h1>
        <p style={{color:"rgba(245,162,99,0.4)",fontSize:"0.875rem"}}>
          🆓 Free YouTube &nbsp;·&nbsp; 🔗 Udemy/Coursera &nbsp;·&nbsp; 🎓 Instructor Uploads
        </p>
      </div>

      {/* Search */}
      <div style={{display:"flex",gap:10,marginBottom:"2rem",flexWrap:"wrap"}}>
        <input className="fi" placeholder="Search Python, Machine Learning, React…"
          value={search} onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&doSearch()}
          style={{flex:1,minWidth:240}} />
        <Btn variant="primary" onClick={doSearch} disabled={searching}>
          {searching?"…":"🔍 Search"}
        </Btn>
        {searchResults&&<Btn variant="ghost" onClick={()=>{setSearchResults(null);setSearch("");}}>✕ Clear</Btn>}
      </div>

      {/* ── SEARCH RESULTS ── */}
      {searchResults ? (
        <div>
          <div style={{marginBottom:"1.5rem",padding:"0.75rem 1rem",borderRadius:10,
            background:"rgba(232,98,26,0.06)",border:"1px solid rgba(232,98,26,0.15)"}}>
            <span style={{color:"rgba(245,162,99,0.6)",fontSize:"0.875rem"}}>
              Results for <strong style={{color:"#F5A263"}}>"{searchResults.query||search}"</strong>
              {" — "}
              <span style={{color:"#4ade80"}}>{searchResults.free?.length||0} free</span>
              {" · "}
              <span style={{color:"#a78bfa"}}>{searchResults.external?.length||0} external</span>
            </span>
          </div>

          {searchResults.free?.length>0 && (
            <>
              <SectionHead emoji="🆓" title="Free Courses" count={searchResults.free.length} color="#4ade80" />
              <CourseGridInner list={sortList(searchResults.free,sortBy)} emptyMsg="None" />
            </>
          )}
          {searchResults.external?.length>0 && (
            <>
              <SectionHead emoji="🔗" title="External (Udemy/Coursera)" count={searchResults.external.length} color="#a78bfa" />
              <CourseGridInner list={sortList(searchResults.external,sortBy)} emptyMsg="None" />
            </>
          )}
          {(searchResults.free?.length||0)+(searchResults.external?.length||0)===0 && (
            <div style={{textAlign:"center",padding:"5rem"}}>
              <div style={{fontSize:"3rem",opacity:0.2,marginBottom:"0.75rem"}}>🔍</div>
              <div className="bebas" style={{fontSize:"1.5rem",color:"rgba(245,162,99,0.4)",letterSpacing:"0.05em"}}>
                No results found
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tabs + Sort */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem"}}>
            <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(232,98,26,0.12)",borderRadius:10,padding:3}}>
              {[
                {key:"all",      label:"All"},
                {key:"free",     label:"🆓 Free"},
                {key:"external", label:"🔗 External"},
                {key:"paid",     label:"🎓 Instructor"},
              ].map(t=>(
                <button key={t.key} className={`tab-btn${activeTab===t.key?" active":""}`} onClick={()=>setActiveTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>

        {loading ? <Spinner /> : (
  <>
    {/* Tabs + Sort */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem"}}>
      <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(232,98,26,0.12)",borderRadius:10,padding:3}}>
        {[
          {key:"all",      label:"All"},
          {key:"free",     label:"🆓 Free"},
          {key:"external", label:"🔗 External"},
          {key:"paid",     label:"🎓 Instructor"},
        ].map(t=>(
          <button key={t.key} className={`tab-btn${activeTab===t.key?" active":""}`} onClick={()=>setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <SortSelect value={sortBy} onChange={setSortBy} />
    </div>

    {/* ONE GRID — all courses together */}
    {displayed.length === 0
      ? <div style={{textAlign:"center",padding:"4rem"}}>
          <div style={{fontSize:"3rem",opacity:0.2,marginBottom:"0.75rem"}}>📭</div>
          <div className="bebas" style={{fontSize:"1.3rem",color:"rgba(245,162,99,0.4)",letterSpacing:"0.05em"}}>
            No courses yet
          </div>
        </div>
      : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:"1.25rem"}}>
          {displayed.map(c=><CourseCard key={c._id} course={c} onClick={setSelected} />)}
        </div>
    }
  </>
)}
        </>
      )}

      {selected && (
        <CourseDetail course={selected} onClose={()=>setSelected(null)}
          onPurchase={id=>setPurchased(p=>new Set([...p,id]))}
          isPurchased={purchased.has(selected._id)}
          auth={auth} setModal={setModal} />
      )}
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ auth, setModal, setPage }) {
  return (
    <>
      <Hero setModal={setModal} setPage={setPage} />
      <Marquee />
      <div style={{background:"rgba(232,98,26,0.04)",borderBottom:"1px solid rgba(232,98,26,0.1)",padding:"2.5rem 2rem"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"2rem",textAlign:"center"}}>
          {[
            {label:"Free Courses",    value:"100+",    sub:"YouTube videos"},
            {label:"Paid Links",      value:"25+",     sub:"Udemy & Coursera"},
            {label:"Instructors",     value:"Growing", sub:"Upload your own"},
            {label:"Tech Topics",     value:"19+",     sub:"All domains"},
          ].map((s,i)=>(
            <div key={i}>
              <div className="bebas" style={{fontSize:"2rem",letterSpacing:"0.05em",
                background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                {s.value}
              </div>
              <div style={{color:"#f5e6d8",fontSize:"0.875rem",fontWeight:500,marginBottom:"0.2rem"}}>{s.label}</div>
              <div style={{color:"rgba(245,162,99,0.4)",fontSize:"0.78rem"}}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function UserDashboard({ auth }) {
  const [courses,setCourses]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [sortBy,setSortBy]=useState("newest");

  useEffect(()=>{
    api("/users/purchased-courses",{method:"POST"})
      .then(d=>{setCourses((d.courses||[]).map(p=>p.courseId).filter(Boolean));setLoading(false);})
      .catch(()=>setLoading(false));
  },[]);

  const sorted = sortList(courses, sortBy);

  return (
    <div style={{padding:"2.5rem",maxWidth:1100,margin:"0 auto"}}>
      <h1 className="bebas" style={{fontSize:"2.5rem",letterSpacing:"0.05em",marginBottom:"0.25rem",
        background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
        My Learning
      </h1>
      <p style={{color:"rgba(245,162,99,0.45)",marginBottom:"2.5rem",fontSize:"0.9rem"}}>Your enrolled courses</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"1rem",marginBottom:"2.5rem"}}>
        {[
          {label:"Enrolled",      value:courses.length},
          {label:"Total Lessons", value:courses.reduce((a,c)=>a+(c.content?.length||0),0)},
          {label:"In Progress",   value:courses.length},
        ].map((s,i)=>(
          <div key={i} style={{background:"rgba(232,98,26,0.06)",border:"1px solid rgba(232,98,26,0.15)",borderRadius:14,padding:"1.25rem"}}>
            <div style={{fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(245,162,99,0.5)",marginBottom:"0.4rem"}}>{s.label}</div>
            <div className="bebas" style={{fontSize:"2rem",letterSpacing:"0.05em",
              background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"1.25rem"}}>
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>
      {loading ? <Spinner /> : courses.length===0 ? (
        <div style={{textAlign:"center",padding:"4rem"}}>
          <div style={{fontSize:"3rem",opacity:0.25,marginBottom:"0.75rem"}}>🎓</div>
          <div className="bebas" style={{fontSize:"1.5rem",color:"rgba(245,162,99,0.4)",letterSpacing:"0.05em"}}>No courses yet</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:"1.25rem"}}>
          {sorted.map(c=><CourseCard key={c._id} course={c} onClick={setSelected} />)}
        </div>
      )}
      {selected&&<CourseDetail course={selected} onClose={()=>setSelected(null)} isPurchased auth={auth} setModal={()=>{}} onPurchase={()=>{}} />}
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function CreateCourseModal({ onClose, onCreated }) {
  const {register,handleSubmit,formState:{errors}} = useForm({resolver:zodResolver(courseSchema),defaultValues:{imageUrl:""}});
  const [lessons,setLessons]=useState([]);
  const [lesson,setLesson]=useState({title:"",videoUrl:""});
  const [lessonErr,setLessonErr]=useState("");
  const [apiErr,setApiErr]=useState(""); const [loading,setLoading]=useState(false);

  const addLesson=()=>{
    if(!lesson.title.trim()){setLessonErr("Lesson title required");return;}
    if(!lesson.videoUrl.trim()){setLessonErr("Video URL required");return;}
    setLessonErr(""); setLessons(p=>[...p,{...lesson}]); setLesson({title:"",videoUrl:""});
  };

  const onSubmit=async data=>{
    setApiErr(""); setLoading(true);
    try {
      const res=await api("/admin/create-course",{method:"POST",body:JSON.stringify({...data,content:lessons})});
      onCreated(res.courseId);
    } catch(e){setApiErr(e.message);}
    setLoading(false);
  };

  return (
    <Modal title="Create Course" onClose={onClose} wide>
      <Alert type="error" msg={apiErr} />
      <Field label="Course title">
        <input className={`fi ${errors.title?"fi-err":""}`} placeholder="e.g. Complete React Mastery" {...register("title")} />
        <FieldErr message={errors.title?.message} />
      </Field>
      <Field label="Description">
        <textarea className={`fi ${errors.description?"fi-err":""}`} placeholder="What will students learn?"
          style={{minHeight:80,resize:"vertical"}} {...register("description")} />
        <FieldErr message={errors.description?.message} />
      </Field>
      <div className="f2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
        <Field label="Price ($)">
          <input type="number" className={`fi ${errors.price?"fi-err":""}`} placeholder="29.99" {...register("price")} />
          <FieldErr message={errors.price?.message} />
        </Field>
        <Field label="Image URL (optional)">
          <input className={`fi ${errors.imageUrl?"fi-err":""}`} placeholder="https://…" {...register("imageUrl")} />
          <FieldErr message={errors.imageUrl?.message} />
        </Field>
      </div>
      <Divider />
      <div style={{fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.1em",color:"rgba(245,162,99,0.4)",marginBottom:"0.75rem"}}>Lessons</div>
      {lessons.map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"0.65rem 0.9rem",
          border:"1px solid rgba(232,98,26,0.12)",borderRadius:9,marginBottom:5,background:"rgba(232,98,26,0.04)"}}>
          <span style={{width:24,height:24,borderRadius:"50%",background:"rgba(232,98,26,0.12)",display:"flex",
            alignItems:"center",justifyContent:"center",fontSize:"0.7rem",color:"#E8621A",fontWeight:600,flexShrink:0}}>{i+1}</span>
          <span style={{flex:1,fontSize:"0.85rem",color:"rgba(245,162,99,0.8)"}}>{item.title}</span>
          <Btn variant="danger" sm onClick={()=>setLessons(p=>p.filter((_,j)=>j!==i))}>✕</Btn>
        </div>
      ))}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"0.5rem",marginTop:"0.5rem"}}>
        <input className="fi" placeholder="Lesson title" value={lesson.title} onChange={e=>setLesson(p=>({...p,title:e.target.value}))} />
        <input className="fi" placeholder="Video URL" value={lesson.videoUrl} onChange={e=>setLesson(p=>({...p,videoUrl:e.target.value}))} />
        <Btn variant="outline" onClick={addLesson}>+</Btn>
      </div>
      {lessonErr&&<p style={{color:"#f87171",fontSize:"0.76rem",marginTop:4}}>⚠ {lessonErr}</p>}
      <Divider />
      <Btn variant="primary" full lg onClick={handleSubmit(onSubmit)} disabled={loading}>
        {loading?"Publishing…":"Publish Course"}
      </Btn>
    </Modal>
  );
}

function EditCourseModal({ course, onClose, onUpdated }) {
  const {register,handleSubmit,formState:{errors}} = useForm({
    resolver:zodResolver(editCourseSchema),
    defaultValues:{title:course.title,description:course.description,price:course.price},
  });
  const [apiErr,setApiErr]=useState(""); const [loading,setLoading]=useState(false);
  const onSubmit=async data=>{
    setApiErr(""); setLoading(true);
    try { await api(`/admin/edit-course/${course._id}`,{method:"PUT",body:JSON.stringify(data)}); onUpdated(); }
    catch(e){setApiErr(e.message);}
    setLoading(false);
  };
  return (
    <Modal title="Edit Course" onClose={onClose}>
      <Alert type="error" msg={apiErr} />
      <Field label="Title">
        <input className={`fi ${errors.title?"fi-err":""}`} {...register("title")} />
        <FieldErr message={errors.title?.message} />
      </Field>
      <Field label="Description">
        <textarea className={`fi ${errors.description?"fi-err":""}`} style={{minHeight:80,resize:"vertical"}} {...register("description")} />
        <FieldErr message={errors.description?.message} />
      </Field>
      <Field label="Price ($)">
        <input type="number" className={`fi ${errors.price?"fi-err":""}`} {...register("price")} />
        <FieldErr message={errors.price?.message} />
      </Field>
      <Btn variant="primary" full lg onClick={handleSubmit(onSubmit)} disabled={loading}>
        {loading?"Saving…":"Save changes"}
      </Btn>
    </Modal>
  );
}

function AdminDashboard() {
  const [courses,setCourses]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);
  const [editing,setEditing]=useState(null);
  const [sortBy,setSortBy]=useState("newest");

  const load=useCallback(()=>{
    setLoading(true);
    api("/admin/courses").then(d=>{setCourses(d.courses||[]);setLoading(false);}).catch(()=>setLoading(false));
  },[]);
  useEffect(()=>{load();},[load]);

  const sorted=sortList(courses,sortBy);

  return (
    <div style={{padding:"2.5rem",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2.5rem",flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <h1 className="bebas" style={{fontSize:"2.5rem",letterSpacing:"0.05em",marginBottom:"0.25rem",
            background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Instructor Dashboard
          </h1>
          <p style={{color:"rgba(245,162,99,0.45)",fontSize:"0.9rem"}}>Your paid courses</p>
        </div>
        <Btn variant="primary" onClick={()=>setModal("create")}>+ New Course</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"1rem",marginBottom:"2.5rem"}}>
        {[
          {label:"Total Courses", value:courses.length},
          {label:"Total Lessons", value:courses.reduce((a,c)=>a+(c.content?.length||0),0)},
          {label:"Avg Price",     value:`$${courses.length?Math.round(courses.reduce((a,c)=>a+c.price,0)/courses.length):0}`},
        ].map((s,i)=>(
          <div key={i} style={{background:"rgba(232,98,26,0.06)",border:"1px solid rgba(232,98,26,0.15)",borderRadius:14,padding:"1.25rem"}}>
            <div style={{fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(245,162,99,0.5)",marginBottom:"0.4rem"}}>{s.label}</div>
            <div className="bebas" style={{fontSize:"2rem",letterSpacing:"0.05em",
              background:"linear-gradient(135deg,#F5A263,#E8621A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"1.25rem"}}>
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      {loading ? <Spinner /> : courses.length===0 ? (
        <div style={{textAlign:"center",padding:"4rem"}}>
          <div style={{fontSize:"3rem",opacity:0.25,marginBottom:"0.75rem"}}>✏️</div>
          <div className="bebas" style={{fontSize:"1.5rem",color:"rgba(245,162,99,0.4)",letterSpacing:"0.05em",marginBottom:"1.5rem"}}>
            No courses yet
          </div>
          <Btn variant="primary" onClick={()=>setModal("create")}>Create your first course</Btn>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {sorted.map(c=>(
            <div key={c._id} style={{background:"rgba(30,10,2,0.7)",border:"1px solid rgba(232,98,26,0.15)",
              borderRadius:14,padding:"1.1rem 1.4rem",display:"flex",gap:"1.25rem",alignItems:"center",
              flexWrap:"wrap",transition:"border-color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(232,98,26,0.4)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(232,98,26,0.15)"}>
              <div style={{width:52,height:52,borderRadius:10,background:"linear-gradient(135deg,#1a0700,#7A2A08)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",color:"rgba(232,98,26,0.5)",flexShrink:0}}>
                {c.title.slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="bebas" style={{fontSize:"1.05rem",letterSpacing:"0.03em",color:"#f5e6d8",
                  marginBottom:"0.2rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div>
                <div style={{color:"rgba(245,162,99,0.45)",fontSize:"0.8rem",display:"flex",gap:"1rem",flexWrap:"wrap"}}>
                  <span>${c.price}</span>
                  <span>{c.content?.length||0} lessons</span>
                  <span style={{color:"rgba(245,162,99,0.25)"}}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Btn variant="outline" sm onClick={()=>setEditing(c)}>✏ Edit</Btn>
            </div>
          ))}
        </div>
      )}

      {modal==="create"&&<CreateCourseModal onClose={()=>setModal(null)} onCreated={()=>{setModal(null);load();}} />}
      {editing&&<EditCourseModal course={editing} onClose={()=>setEditing(null)} onUpdated={()=>{setEditing(null);load();}} />}
    </div>
  );
}

// ─── SIDEBAR LAYOUT ───────────────────────────────────────────────────────────
function SidebarLayout({ auth, page, setPage, children }) {
  const isAdmin=auth?.role==="admin";
  const SLink=({label,icon,target})=>(
    <button className={`sidebar-link${page===target?" active":""}`} onClick={()=>setPage(target)}>
      <span>{icon}</span>{label}
    </button>
  );
  return (
    <div className="dash-grid" style={{display:"grid",gridTemplateColumns:"210px 1fr",minHeight:"100vh",paddingTop:64}}>
      <aside className="sidebar-col" style={{background:"rgba(13,5,0,0.8)",borderRight:"1px solid rgba(232,98,26,0.1)",
        padding:"1.75rem 0.75rem",display:"flex",flexDirection:"column",gap:"0.2rem",
        position:"sticky",top:64,height:"calc(100vh - 64px)",overflowY:"auto"}}>
        <div style={{fontSize:"0.65rem",textTransform:"uppercase",letterSpacing:"0.1em",
          color:"rgba(245,162,99,0.3)",padding:"0.5rem 0.75rem 0.3rem"}}>Navigation</div>
        <SLink label="Home"       icon="◎" target="home" />
        <SLink label="Explore All" icon="⊞" target="explore" />
        {!isAdmin&&<SLink label="My Courses" icon="◈" target="dashboard" />}
        {isAdmin && <SLink label="My Courses" icon="◈" target="admin" />}
        <Divider />
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

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [auth,setAuthRaw]=useState(()=>{
    try { return JSON.parse(localStorage.getItem("cv_auth")||"null"); } catch { return null; }
  });
  const [page,setPage]=useState("home");
  const [modal,setModal]=useState(null);

  const setAuth=a=>{ setAuthRaw(a); a?localStorage.setItem("cv_auth",JSON.stringify(a)):localStorage.removeItem("cv_auth"); };
  const loginSuccess=role=>{ setAuth({role}); setModal(null); setPage(role==="admin"?"admin":"dashboard"); };
  const regSuccess=role=>{ setModal(`login-${role}`); };

  const renderPage=()=>{
    if (page==="explore")
      return <SidebarLayout auth={auth} page={page} setPage={setPage}><ExplorePage auth={auth} setModal={setModal} /></SidebarLayout>;
    if (page==="dashboard"&&auth?.role==="user")
      return <SidebarLayout auth={auth} page={page} setPage={setPage}><UserDashboard auth={auth} /></SidebarLayout>;
    if (page==="admin"&&auth?.role==="admin")
      return <SidebarLayout auth={auth} page={page} setPage={setPage}><AdminDashboard /></SidebarLayout>;
    return <HomePage auth={auth} setModal={setModal} setPage={setPage} />;
  };

  return (
    <AuthCtx.Provider value={auth}>
      <InjectStyles />
      <div style={{background:"#0d0500",minHeight:"100vh"}}>
        <Navbar page={page} setPage={setPage} auth={auth} setAuth={setAuth} setModal={setModal} />
        {renderPage()}
      </div>
      {modal==="login-user"     && <LoginModal    role="user"  onClose={()=>setModal(null)} onSuccess={()=>loginSuccess("user")} />}
      {modal==="login-admin"    && <LoginModal    role="admin" onClose={()=>setModal(null)} onSuccess={()=>loginSuccess("admin")} />}
      {modal==="register-user"  && <RegisterModal role="user"  onClose={()=>setModal(null)} onSuccess={()=>regSuccess("user")} />}
      {modal==="register-admin" && <RegisterModal role="admin" onClose={()=>setModal(null)} onSuccess={()=>regSuccess("admin")} />}
    </AuthCtx.Provider>
  );
}