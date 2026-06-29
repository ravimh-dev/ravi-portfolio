import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  ExternalLink,
  Code2,
  Terminal,
  Github,
  Linkedin,
  Check,
  Copy,
  Sun,
  Moon,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  FileText,
  X,
  Database,
  Server,
  Cpu,
  Layers,
  Activity,
  Play,
  ChevronRight,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

// Framer motion animation configurations for staggered entries
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }
  }
};

interface QueryOption {
  id: string;
  label: string;
  sql: string;
  type: "postgres" | "redis" | "bullmq";
  result: any;
  logs: string[];
  executionTime: string;
}

const dbQueries: QueryOption[] = [
  {
    id: "get-tenants",
    label: "SELECT * FROM tenants LIMIT 3;",
    sql: "SELECT tenant_id, shop_name, tier, region, active_connections \nFROM farms_tenants \nWHERE is_active = true \nLIMIT 3;",
    type: "postgres",
    executionTime: "1.4ms",
    logs: [
      "[CONNECT] Establishing transactional session with pool Node-0...",
      "[DB] Query parsed. PostgreSQL optimizer generated SCAN nodes...",
      "[DB] Filter constraint (is_active = true) applied directly via RLS.",
      "[OK] 3 rows fetched from storage blocks."
    ],
    result: [
      { tenant_id: "t_01ae94", shop_name: "Gujarat AgriFert Retail", tier: "enterprise", region: "Surat", active_connections: 8 },
      { tenant_id: "t_4bf120", shop_name: "Mahavir Agro Services", tier: "professional", region: "Rajkot", active_connections: 4 },
      { tenant_id: "t_c3a4e9", shop_name: "Patel Seed Agency", tier: "basic", region: "Baroda", active_connections: 2 }
    ]
  },
  {
    id: "explain-inventory",
    label: "EXPLAIN ANALYZE SELECT inventory...",
    sql: "EXPLAIN ANALYZE SELECT product_id, stock_qty, warning_level \nFROM farms_inventory \nWHERE shop_id = 't_01ae94' AND stock_qty < warning_level \nORDER BY stock_qty ASC;",
    type: "postgres",
    executionTime: "3.2ms",
    logs: [
      "[CONNECT] Connecting to multi-tenant replica cluster-A...",
      "[DB] Planning statement. Tenant Row Level Security (RLS) policies injected.",
      "[PLAN] Index Scan using idx_farms_inventory_shop on farms_inventory  (cost=0.15..12.40 rows=2 width=32)",
      "[PLAN]   Index Cond: (shop_id = 't_01ae94'::text)",
      "[PLAN]   Filter: (stock_qty < warning_level)",
      "[OK] Query processing complete. Planning Time: 0.12ms, Execution Time: 3.08ms"
    ],
    result: [
      { product_id: "prod_fertilizer_n7", stock_qty: 12, warning_level: 50, status: "CRITICAL_LOW" },
      { product_id: "prod_cotton_seed_p3", stock_qty: 4, warning_level: 15, status: "CRITICAL_LOW" }
    ]
  },
  {
    id: "redis-session",
    label: "HGETALL session:active",
    sql: "HGETALL farms:tenant:t_01ae94:session:usr_94a02",
    type: "redis",
    executionTime: "0.2ms",
    logs: [
      "[CACHE] Redis Cluster connection established on port 6379...",
      "[CACHE] Command: HGETALL farms:tenant:t_01ae94:session:usr_94a02",
      "[CACHE] Cache hit! (Key retrieved in 0.18ms)"
    ],
    result: {
      user_id: "usr_94a02",
      role: "shop_owner",
      ip_address: "152.168.1.14",
      last_active: "2026-06-26T12:14:02Z",
      token_hash: "sha256:d8a9e403fa8",
      session_ttl_sec: 1800
    }
  },
  {
    id: "bullmq-queue",
    label: "BullMQ Queue Inspection",
    sql: "BullMQ.getQueue('diamond-sync-pipeline').getJobs(['active', 'completed'])",
    type: "bullmq",
    executionTime: "2.1ms",
    logs: [
      "[QUEUE] Connecting to Redis instance for BullMQ queue descriptor...",
      "[QUEUE] Processing state streams for 'diamond-sync-pipeline'...",
      "[QUEUE] Found 1 completed job, 0 active, 0 failed."
    ],
    result: [
      { jobId: "job_94103", name: "sync_vendor_pricing", state: "completed", progress: 100, attemptsMade: 1 }
    ]
  }
];

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  // Interactive Contact Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalData, setContactModalData] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Resume Download & Terminal Compiler States
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadLogs, setDownloadLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const activeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll Tracking State
  const [scrollPercent, setScrollPercent] = useState(0);

  // --- MOUSE TRACKING & GLOBAL CLICK RIPPLES ---
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  interface Ripple {
    id: number;
    x: number;
    y: number;
    color: string;
  }
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGlobalClick = (e: React.MouseEvent) => {
    const colors = [
      "rgba(16, 185, 129, 0.45)", // emerald
      "rgba(245, 158, 11, 0.45)", // amber
      "rgba(168, 85, 247, 0.45)", // purple
      "rgba(59, 130, 246, 0.45)", // blue
      "rgba(236, 72, 153, 0.45)"  // pink
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newRipple = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      color: randomColor
    };
    setRipples(prev => [...prev, newRipple].slice(-10));
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples(prev => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // --- NEW PORTFOLIO INTERACTIVE STATE ENGINE ---
  // FARMS Interactive RLS State
  const [farmsTenant, setFarmsTenant] = useState<"gujarat" | "mahavir" | "patel">("gujarat");
  
  // SplitMate Debt Settlement Simulation State
  const [splitmateStep, setSplitmateStep] = useState<"initial" | "processing" | "solved">("initial");
  const [splitmateLogs, setSplitmateLogs] = useState<string[]>([]);
  
  // NotifyFlow BullMQ Simulation State
  const [notifyFlowState, setNotifyFlowState] = useState<"idle" | "running" | "complete">("idle");
  const [notifyJobs, setNotifyJobs] = useState<Array<{
    id: string;
    type: "SMS" | "Email" | "Webhook";
    target: string;
    status: "waiting" | "active" | "completed";
    progress: number;
  }>>([
    { id: "job_01", type: "SMS", target: "+91-98765-X4210", status: "waiting", progress: 0 },
    { id: "job_02", type: "Email", target: "billing@mahaviragro.in", status: "waiting", progress: 0 },
    { id: "job_03", type: "Webhook", target: "https://api.patel.org/callback", status: "waiting", progress: 0 }
  ]);
  const [notifyLogs, setNotifyLogs] = useState<string[]>([]);

  const runDebtOptimizer = () => {
    if (splitmateStep === "processing") return;
    setSplitmateStep("processing");
    setSplitmateLogs(["[HEAP] Fetching transaction ledger matrix...", "[HEAP] Mapping net balances for Alice, Bob, Charlie, David..."]);
    
    setTimeout(() => {
      setSplitmateLogs(prev => [
        ...prev,
        "[CALC] Alice: +$66.67 (Creditor)",
        "[CALC] Bob: -$20.00 (Debtor)",
        "[CALC] Charlie: -$26.67 (Debtor)",
        "[CALC] David: -$20.00 (Debtor)"
      ]);
    }, 600);

    setTimeout(() => {
      setSplitmateLogs(prev => [
        ...prev,
        "[MINIMIZE] Initiating greedy max-flow credit-debt matching...",
        "[RESOLVE] Matching Alice credit to Charlie ($26.67)...",
        "[RESOLVE] Matching Alice credit to Bob ($20.00)...",
        "[RESOLVE] Matching Alice credit to David ($20.00)..."
      ]);
    }, 1300);

    setTimeout(() => {
      setSplitmateLogs(prev => [
        ...prev,
        "[SUCCESS] Optimized! Transactions reduced from 4 original down to 3 minimized routes.",
        "[HEAP] Cache invalidated. New ledger synced to Postgres store."
      ]);
      setSplitmateStep("solved");
    }, 2100);
  };

  const resetDebtOptimizer = () => {
    setSplitmateStep("initial");
    setSplitmateLogs([]);
  };

  // Live Dashboard Simulated Query state
  const [sysTerminalLogs, setSysTerminalLogs] = useState<string[]>([
    "// Systems online. Port 3000 mapping active.",
    "// Select a tenant below and click 'Trigger Query' to see PostgreSQL RLS logs:"
  ]);
  const [isSimulatingQuery, setIsSimulatingQuery] = useState(false);
  const [activeDashboardTenant, setActiveDashboardTenant] = useState<"gujarat" | "mahavir" | "patel">("gujarat");

  const runSimulatedQuery = (tenantId: string) => {
    if (isSimulatingQuery) return;
    setIsSimulatingQuery(true);
    setSysTerminalLogs([`[API] INITIATED: GET /api/v1/tenant/retailers · Host: localhost:3000`]);
    
    setTimeout(() => {
      setSysTerminalLogs(prev => [
        ...prev, 
        `[AUTH] JWT Claims verified successfully for role "tenant_admin"`
      ]);
    }, 350);

    setTimeout(() => {
      setSysTerminalLogs(prev => [
        ...prev, 
        `[DB_RLS] Row-Level Security active: Applying tenant_id = '${tenantId}'`
      ]);
    }, 750);

    setTimeout(() => {
      setSysTerminalLogs(prev => [
        ...prev, 
        `[CACHE] Querying local Redis cluster key "cache:${tenantId}:retailers"...`
      ]);
    }, 1150);

    setTimeout(() => {
      setSysTerminalLogs(prev => [
        ...prev, 
        `[CACHE] Cache MISS · Accessing PostgreSQL transaction-safe pool...`,
        `[DB] EXECUTING: SELECT * FROM farms_retailers WHERE tenant_id = '${tenantId}'`
      ]);
    }, 1550);

    setTimeout(() => {
      const recordsCount = tenantId === "gujarat" ? "24" : tenantId === "mahavir" ? "12" : "19";
      setSysTerminalLogs(prev => [
        ...prev, 
        `[DB] RESOLVED: ${recordsCount} rows returned from partitioned node (4.1ms)`,
        `[CACHE] Populated Redis key "cache:${tenantId}:retailers" (TTL: 180s)`,
        `[SUCCESS] 200 OK · Payload size: 4.8KB · Total dynamic latency: 12.5ms`
      ]);
      setIsSimulatingQuery(false);
    }, 1950);
  };

  const runNotifyFlowQueue = () => {
    if (notifyFlowState === "running") return;
    setNotifyFlowState("running");
    setNotifyLogs(["[BULLMQ] Spawning queue manager 'diamonds-sync-alert'...", "[REDIS] Connection pooled to redis://127.0.0.1:6379/db1"]);
    
    // Reset jobs
    setNotifyJobs([
      { id: "job_01", type: "SMS", target: "+91-98765-X4210", status: "waiting", progress: 0 },
      { id: "job_02", type: "Email", target: "billing@mahaviragro.in", status: "waiting", progress: 0 },
      { id: "job_03", type: "Webhook", target: "https://api.patel.org/callback", status: "waiting", progress: 0 }
    ]);

    // Job 1 processing
    setTimeout(() => {
      setNotifyJobs(prev => prev.map((j, i) => i === 0 ? { ...j, status: "active", progress: 35 } : j));
      setNotifyLogs(prev => [...prev, "[WORKER-0] Selected Job 01 (SMS). Resolving target gateway routing..."]);
    }, 400);

    setTimeout(() => {
      setNotifyJobs(prev => prev.map((j, i) => i === 0 ? { ...j, status: "active", progress: 80 } : j));
    }, 800);

    setTimeout(() => {
      setNotifyJobs(prev => prev.map((j, i) => i === 0 ? { ...j, status: "completed", progress: 100 } : j));
      setNotifyLogs(prev => [...prev, "[SUCCESS] Job 01 delivered. Gateway response 200 OK."]);
    }, 1200);

    // Job 2 processing
    setTimeout(() => {
      setNotifyJobs(prev => prev.map((j, i) => i === 1 ? { ...j, status: "active", progress: 40 } : j));
      setNotifyLogs(prev => [...prev, "[WORKER-1] Selected Job 02 (Email). Compiling HTML template from JSON metadata..."]);
    }, 1500);

    setTimeout(() => {
      setNotifyJobs(prev => prev.map((j, i) => i === 1 ? { ...j, status: "completed", progress: 100 } : j));
      setNotifyLogs(prev => [...prev, "[SUCCESS] Job 02 dispatched via SMTP relay. Thread released."]);
    }, 2200);

    // Job 3 processing
    setTimeout(() => {
      setNotifyJobs(prev => prev.map((j, i) => i === 2 ? { ...j, status: "active", progress: 50 } : j));
      setNotifyLogs(prev => [...prev, "[WORKER-0] Selected Job 03 (Webhook). Preparing POST callback payload with SHA256 HMAC signature..."]);
    }, 2500);

    setTimeout(() => {
      setNotifyJobs(prev => prev.map((j, i) => i === 2 ? { ...j, status: "completed", progress: 100 } : j));
      setNotifyLogs(prev => [...prev, "[SUCCESS] Webhook acknowledged. Response status: 201 Created."]);
      setNotifyFlowState("complete");
    }, 3200);
  };


  // Live Server Telemetry State
  const [cpuLoad, setCpuLoad] = useState(3.4);
  const [memoryUsed, setMemoryUsed] = useState(48.2);
  const [activeConnections, setActiveConnections] = useState(16);
  const [redisKeys, setRedisKeys] = useState(142);
  const [bullJobs, setBullJobs] = useState(0);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "[SYSTEM] Server cluster Node-0 online on port 3000.",
    "[SYSTEM] PostgreSQL socket connected. Redis database selected: db0"
  ]);

  // Database Query Console State
  const [selectedQueryId, setSelectedQueryId] = useState<string>("get-tenants");
  const [consoleLogs, setConsoleLogs] = useState<string[]>(dbQueries[0].logs);
  const [consoleResult, setConsoleResult] = useState<any>(dbQueries[0].result);
  const [consoleExecTime, setConsoleExecTime] = useState<string>(dbQueries[0].executionTime);
  const [isConsoleExecuting, setIsConsoleExecuting] = useState<boolean>(false);

  // Dynamic fluctuations for Server Telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isStressTesting) {
        setCpuLoad(parseFloat((2.5 + Math.random() * 3.1).toFixed(1)));
        setMemoryUsed(parseFloat((48.1 + Math.random() * 0.9).toFixed(1)));
        setActiveConnections(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const newVal = prev + change;
          return newVal >= 12 && newVal <= 22 ? newVal : prev;
        });
        if (Math.random() > 0.7) {
          setRedisKeys(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [isStressTesting]);

  // Scroll Event Listener
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollPercent(pct);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerStressTest = () => {
    if (isStressTesting) return;
    setIsStressTesting(true);
    setTelemetryLogs(prev => [
      ...prev, 
      `[${new Date().toLocaleTimeString()}] [WARN] Initiating multi-tenant transactional stress test...`
    ]);
    
    // Step 1: Raise CPU & Active connections
    setCpuLoad(62.8);
    setMemoryUsed(84.3);
    setBullJobs(12);

    setTimeout(() => {
      setTelemetryLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] [ETL] Syncing 15,000 diamond record updates from third-party SFTP...`
      ]);
      setCpuLoad(84.6);
      setMemoryUsed(112.5);
      setRedisKeys(prev => prev + 15);
    }, 700);

    setTimeout(() => {
      setTelemetryLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] [DB] Planner selected partial index 'idx_inventory_shop_status'. Query cost minimized.`
      ]);
      setCpuLoad(95.4);
      setMemoryUsed(146.1);
      setBullJobs(28);
    }, 1400);

    setTimeout(() => {
      setTelemetryLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] [SUCCESS] Batch sync finished. 0 transactional conflicts. Cache flushed.`
      ]);
      setCpuLoad(4.2);
      setMemoryUsed(49.6);
      setBullJobs(0);
      setIsStressTesting(false);
    }, 3200);
  };

  const handleQuerySelect = (id: string) => {
    const q = dbQueries.find(item => item.id === id);
    if (!q) return;
    setSelectedQueryId(id);
    setIsConsoleExecuting(true);
    setConsoleLogs(["[INIT] Spawning process context...", `[SYS] EXECUTING_QUERY_IDENTIFIER: ${q.id.toUpperCase()}`]);
    setConsoleResult(null);

    let step = 0;
    const interval = setInterval(() => {
      if (step < q.logs.length) {
        setConsoleLogs(prev => [...prev, q.logs[step]]);
        step++;
      } else {
        clearInterval(interval);
        setConsoleResult(q.result);
        setConsoleExecTime(q.executionTime);
        setIsConsoleExecuting(false);
      }
    }, 220);
  };

  // Sync dark class on root html tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  // Set default theme from system preference
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Clean up compile timer on unmount
  useEffect(() => {
    return () => {
      if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("ravimh.dev@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => {
      setCopiedEmail(false);
    }, 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormFeedback({
        type: "error",
        message: "Please fill out all fields before sending."
      });
      return;
    }

    setIsSending(true);
    setFormFeedback(null);

    // 1. Instantly show the success popup modal & feedback
    const successMsg = "Thank you! Your message has been sent successfully.";
    setFormFeedback({
      type: "success",
      message: successMsg
    });
    setContactModalData({
      type: "success",
      message: successMsg
    });
    setShowContactModal(true);

    // Capture form values for background task
    const currentName = name;
    const currentEmail = email;
    const currentMessage = message;

    // Clear form inputs immediately
    setName("");
    setEmail("");
    setMessage("");
    setIsSending(false);

    // 2. Dispatch SMTP API request in the background
    fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: currentName,
        email: currentEmail,
        message: currentMessage
      })
    })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        console.error("[SMTP] Background email delivery failed:", data.error || "Unknown error");
      } else {
        console.log("[SMTP] Background email successfully dispatched!");
      }
    })
    .catch((err) => {
      console.error("[SMTP] Background connection error:", err);
    });

    // 3. Automatically hide the popup modal after 2.5 seconds
    setTimeout(() => {
      setShowContactModal(false);
    }, 2500);
  };

  // actual PDF download from public directory
  const downloadResumePDF = () => {
    const link = document.createElement("a");
    link.href = "/mahavadiya_ravi_nodejs_dev.docx.pdf";
    link.download = "Ravi_Mahavadiya_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerInteractiveDownload = () => {
    if (isCompiling) return;
    
    setIsCompiling(true);
    setShowDownloadModal(true);
    setDownloadProgress(0);
    setDownloadLogs(["[INIT] Connecting to secure resume payload cluster..."]);

    const steps = [
      { prg: 15, log: "[CONNECT] TLS v1.3 handshake successful. Port 3000 established." },
      { prg: 35, log: "[FETCH] Re-indexing career metrics & relational multi-tenant schemas..." },
      { prg: 52, log: "[PARSE] Generating highly compressed JSON document tree..." },
      { prg: 70, log: "[SECURITY] Validating HMAC checksum & applying SHA-256 signature..." },
      { prg: 85, log: "[COMPILE] Packing vectorized content streams into Helvetica binary block..." },
      { prg: 98, log: "[OK] PDF compilation finished cleanly with 0 warnings." },
      { prg: 100, log: "[FINISHED] File stream downloaded successfully." }
    ];

    let currentStep = 0;
    
    if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);

    activeIntervalRef.current = setInterval(() => {
      if (currentStep < steps.length) {
        const stepInfo = steps[currentStep];
        setDownloadProgress(stepInfo.prg);
        setDownloadLogs(prev => [...prev, stepInfo.log]);
        currentStep++;
      } else {
        if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);
        downloadResumePDF();
        setIsCompiling(false);
        // Autoclose modal with a small delayed transition
        setTimeout(() => {
          setShowDownloadModal(false);
        }, 1200);
      }
    }, 400);
  };

  const skipAndDownloadNow = () => {
    if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);
    downloadResumePDF();
    setIsCompiling(false);
    setShowDownloadModal(false);
  };

  return (
    <div className="port relative min-h-screen" onClick={handleGlobalClick}>
      
      {/* SCROLL STREAM PROGRESS BUFFER */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[var(--surface-2)] z-[100] overflow-hidden">
        <div 
          className="h-full bg-[var(--accent)] transition-all duration-100 ease-out" 
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* INTERACTIVE CURSOR GLOW */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(500px at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.06), rgba(16, 185, 129, 0.04), rgba(59, 130, 246, 0.03), transparent 80%)`
        }}
      />

      {/* CLICK RIPPLES */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ transform: "translate(-50%, -50%) scale(0)", opacity: 1 }}
            animate={{ transform: "translate(-50%, -50%) scale(10)", opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed pointer-events-none z-50 rounded-full border"
            style={{
              left: ripple.x,
              top: ripple.y,
              borderColor: ripple.color,
              width: "24px",
              height: "24px",
              boxShadow: `0 0 15px ${ripple.color}`
            }}
          />
        ))}
      </AnimatePresence>

      {/* MULTI-COLOR AMBIENT BACKGROUND WITH SCROLL & CURSOR INFLUENCE */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-50 dark:opacity-30">
        <div 
          className="absolute inset-0 bg-grid-ambient" 
          style={{ transform: `translateY(-${scrollPercent * 0.1}px)` }} 
        />
        {/* Violet to Blue sphere top left */}
        <div 
          className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full filter blur-[120px] transition-transform duration-500 ease-out bg-gradient-to-tr from-purple-500/20 to-indigo-500/10"
          style={{ transform: `translate3d(${scrollPercent * 0.4}px, ${scrollPercent * 0.15}px, 0) rotate(${scrollPercent * 0.05}deg)` }}
        />
        {/* Emerald to Teal sphere bottom right */}
        <div 
          className="absolute -bottom-[10%] -right-[10%] w-[45vw] h-[45vw] rounded-full filter blur-[100px] transition-transform duration-500 ease-out bg-gradient-to-bl from-emerald-500/15 to-cyan-500/10"
          style={{ transform: `translate3d(${-scrollPercent * 0.3}px, ${-scrollPercent * 0.25}px, 0) rotate(${-scrollPercent * 0.1}deg)` }}
        />
        {/* Amber to Rose middle sphere */}
        <div 
          className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full filter blur-[130px] transition-transform duration-500 ease-out bg-gradient-to-r from-amber-500/10 to-rose-500/10"
          style={{ transform: `translate3d(${-scrollPercent * 0.1}px, ${scrollPercent * 0.2}px, 0)` }}
        />
      </div>
      
      {/* HEADER NAV */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 py-4 px-10 -mx-10 flex items-center justify-between bg-[var(--bg)]/85 backdrop-blur-md transition-all duration-200"
      >
        <div className="flex items-center">
          <span className="nav-name font-semibold tracking-tight text-[var(--text-primary)]">Ravi Mahavadiya</span>
        </div>
        <div className="nav-links">
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
          
          {/* Subtle Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded-md hover:bg-[var(--surface-1)] transition-colors cursor-pointer flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <motion.div 
        className="hero text-left max-w-4xl py-16 mb-24 mt-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="hero-eyebrow">
          <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" /> 
          <span>Backend Systems Architect</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Building <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">scalable</span> systems<br />
          that power SaaS products.
        </h1>
        <p className="hero-desc text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mb-8">
          2+ years designing multi-tenant architectures, ETL pipelines, and REST APIs using Node.js, PostgreSQL, and Redis. Currently building FARMS — a B2B SaaS platform for agricultural retail in India.
        </p>
        
        <div className="hero-ctas">
          <a className="btn-primary" href="#contact">
            <Mail className="w-3.5 h-3.5" /> Get in touch
          </a>
          <a className="btn-ghost" href="#projects">
            <Code2 className="w-3.5 h-3.5" /> View projects
          </a>
          <button onClick={triggerInteractiveDownload} className="btn-ghost flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download Resume
          </button>
        </div>
        
        <div className="hero-badges mt-8">
          <span className="badge flex items-center gap-1.5">
            <i className="ti ti-brand-nodejs text-[#339933]"></i> Node.js
          </span>
          <span className="badge flex items-center gap-1.5">
            <i className="ti ti-brand-typescript text-[#3178c6]"></i> TypeScript
          </span>
          <span className="badge flex items-center gap-1.5">
            <i className="ti ti-database text-[#4169e1]"></i> PostgreSQL
          </span>
          <span className="badge flex items-center gap-1.5">
            <i className="ti ti-brand-redis text-[#dc382d]"></i> Redis
          </span>
          <span className="badge">Multi-tenant SaaS</span>
          <span className="badge">REST APIs</span>
          <span className="badge">ETL pipelines</span>
        </div>
      </motion.div>

      {/* EXPERIENCE & SKILLS SECTIONS - SIDE BY SIDE FOR FULL SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start text-left">
        {/* EXPERIENCE COLUMN */}
        <div className="lg:col-span-6">
          <section id="experience" className="h-full">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded" />
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400 block leading-none mb-1">01 / EXPERIENCE</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    Professional Experience
                  </h2>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded uppercase self-start sm:self-auto">
                THREAD_STATE: STABLE
              </span>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-120px" }}
              className="flex flex-col gap-12"
            >
              <motion.div variants={itemVariants} className="exp-item relative pl-4 border-l border-[var(--accent)]">
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--accent)] -left-[5.5px] top-[26px]"></div>
                <div className="exp-header">
                  <span className="exp-role text-lg font-bold">Backend Developer</span>
                  <span className="exp-date text-xs text-[var(--text-muted)] font-mono">Feb 2024 – May 2026</span>
                </div>
                <div className="exp-company flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] mb-4">
                  <i className="ti ti-building text-base" /> Codezee Solutions, Surat
                </div>
                <ul className="exp-bullets space-y-3">
                  <li>
                    <strong>SaaS Architecture:</strong> Built and maintained highly optimized multi-tenant backends for diamond/jewelry B2B products using shared schema design models.
                  </li>
                  <li>
                    <strong>REST API Pipeline:</strong> Developed over 25+ transaction-safe REST APIs featuring dynamic pricing matrix structures, custom authorization logic, and reporting triggers.
                  </li>
                  <li>
                    <strong>Optimization & Profiling:</strong> Slashed API response times by up to 60% through custom indexes, composite keys, PostgreSQL profile adjustments, and comprehensive Redis cache setups.
                  </li>
                  <li>
                    <strong>ETL & Sync Jobs:</strong> Created custom scheduled workers in BullMQ and Redis handling 10,000+ synchronized diamond updates from SFTP/external vendors safely.
                  </li>
                  <li>
                    <strong>Deployments:</strong> Administered PM2 daemon tasks, Git workflows, and direct server deployments in secure Linux environments.
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </section>
        </div>

        {/* SKILLS COLUMN */}
        <div className="lg:col-span-6">
          <section id="skills" className="h-full">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 rounded" />
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 block leading-none mb-1">02 / TECH STACK</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    Core Tech Spectrum
                  </h2>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded uppercase self-start sm:self-auto">
                SYSTEM_METRICS: ACTIVE
              </span>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-120px" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {/* Languages */}
              <motion.div variants={itemVariants} className="skill-card hover:shadow-[0_4px_20px_rgba(49,120,198,0.08)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="skill-cat flex items-center gap-2 border-b border-[var(--border)] pb-2.5 mb-3.5">
                    <Code2 className="w-4 h-4 text-blue-500" />
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-[var(--text-primary)]">Languages</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#f7df1e]/40 hover:bg-[#f7df1e]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#f7df1e] transition-colors leading-tight">JavaScript (ES6+)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#3178c6]/40 hover:bg-[#3178c6]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#3178c6] transition-colors leading-tight">TypeScript</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Backend */}
              <motion.div variants={itemVariants} className="skill-card hover:shadow-[0_4px_20px_rgba(51,153,51,0.08)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="skill-cat flex items-center gap-2 border-b border-[var(--border)] pb-2.5 mb-3.5">
                    <Server className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-[var(--text-primary)]">Backend Architecture</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#339933]/40 hover:bg-[#339933]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#339933] transition-colors leading-tight">Node.js</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#828282]/40 hover:bg-[#828282]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#ccc] transition-colors leading-tight">Express.js</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#00bcd4]/40 hover:bg-[#00bcd4]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#00bcd4] transition-colors leading-tight">REST APIs</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#ff5722]/40 hover:bg-[#ff5722]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#ff5722] transition-colors leading-tight">BullMQ</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Databases */}
              <motion.div variants={itemVariants} className="skill-card hover:shadow-[0_4px_20px_rgba(65,105,225,0.08)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="skill-cat flex items-center gap-2 border-b border-[var(--border)] pb-2.5 mb-3.5">
                    <Database className="w-4 h-4 text-sky-500" />
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-[var(--text-primary)]">Databases & Caching</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#4169e1]/40 hover:bg-[#4169e1]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#4169e1] transition-colors leading-tight">PostgreSQL</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#dc382d]/40 hover:bg-[#dc382d]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#dc382d] transition-colors leading-tight">Redis Store</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#47a248]/40 hover:bg-[#47a248]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#47a248] transition-colors leading-tight">MongoDB</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Infrastructure */}
              <motion.div variants={itemVariants} className="skill-card hover:shadow-[0_4px_20px_rgba(36,150,237,0.08)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="skill-cat flex items-center gap-2 border-b border-[var(--border)] pb-2.5 mb-3.5">
                    <HardDrive className="w-4 h-4 text-amber-500" />
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-[var(--text-primary)]">Infrastructure & DevOps</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#2496ed]/40 hover:bg-[#2496ed]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#2496ed] transition-colors leading-tight">Docker</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#00bcd4]/40 hover:bg-[#00bcd4]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#00bcd4] transition-colors leading-tight">PM2 Daemon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Concepts */}
              <motion.div variants={itemVariants} className="skill-card hover:shadow-[0_4px_20px_rgba(156,39,176,0.08)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="skill-cat flex items-center gap-2 border-b border-[var(--border)] pb-2.5 mb-3.5">
                    <Layers className="w-4 h-4 text-purple-500" />
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-[var(--text-primary)]">Architectural Concepts</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#9c27b0]/40 hover:bg-[#9c27b0]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#9c27b0] transition-colors leading-tight">Multi-Tenant Isolation</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#009688]/40 hover:bg-[#009688]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#009688] transition-colors leading-tight">ETL Pipelines</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Testing & Tools */}
              <motion.div variants={itemVariants} className="skill-card hover:shadow-[0_4px_20px_rgba(244,67,54,0.08)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="skill-cat flex items-center gap-2 border-b border-[var(--border)] pb-2.5 mb-3.5">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-[var(--text-primary)]">Testing & Dev Tools</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#c21325]/40 hover:bg-[#c21325]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#c21325] transition-colors leading-tight">Jest Testing</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#85ea2d]/40 hover:bg-[#85ea2d]/5 transition-all group">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#85ea2d] transition-colors leading-tight">Swagger OpenAPI</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </div>

      {/* PROJECTS SECTION WITH STAGGERED GRID REVEALS */}
      {/* PROJECTS SECTION WITH STAGGERED GRID REVEALS */}
      <section id="projects" className="mb-20">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 rounded" />
            <div>
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400 block leading-none mb-1">03 / SHOWCASE</span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Systems & SaaS Products
              </h2>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded uppercase self-start sm:self-auto">
            TOTAL_PRODUCTS: 2
          </span>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
        >
          <div className="flex flex-col gap-6">
            
            {/* FARMS Card */}
            <motion.div 
              variants={itemVariants} 
              className="border border-[var(--border)] rounded-2xl bg-[var(--surface-1)] overflow-hidden hover:border-emerald-500/30 transition-all duration-300 group shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.03)] text-left"
            >
              {/* Header */}
              <div className="bg-[var(--surface-2)] px-5 py-3 border-b border-[var(--border)] flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-500 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Featured SaaS Product
                </span>
                {/* <a className="p-1 rounded bg-[var(--bg)] hover:bg-[var(--border)] transition-colors text-[var(--text-muted)] hover:text-emerald-500" href="#projects" title="SaaS Core Architecture">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a> */}
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)] mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  FARMS
                </h3>
                <span className="text-[11px] font-mono text-[var(--text-muted)] block mb-3">Farming & Retail Management</span>

                <div className="proj-stack flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Progress
                  </span>
                  <a 
                    href="#projects" 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Live Link
                  </a>
                  <a 
                    href="https://github.com/ravimh-dev/farms-backend" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-neutral-500/10 text-neutral-300 border border-neutral-500/20 hover:bg-neutral-500/20 transition-all cursor-pointer"
                  >
                    <Github className="w-3 h-3" />
                    GitHub Repo
                  </a>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                  Advanced B2B SaaS platform targeting agricultural retail businesses in India, starting with Gujarat. Implements shared-schema multi-tenancy with strict Postgres Row-Level Security (RLS) filters, a dynamic authorization matrix, and a robust three-tier role hierarchy.
                </p>

                {/* Engineering Highlights */}
                <div className="border-t border-[var(--border)]/60 pt-4 space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider block mb-1">Key Engineering Highlights</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug"><strong>Tenant Isolation:</strong> Zero accidental leaks. Strict RLS ensures isolation of owner seeds, transactions, and client lists.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug"><strong>Dynamic RBAC:</strong> Multi-tenant system manages store-specific inventory, billing histories, and employees.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--border)] flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5 font-mono">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  Isolation: PostgreSQL RLS
                </span>
                <span className="font-mono text-[9px] text-[var(--text-muted)]">SCHEMA: PUBLIC</span>
              </div>
            </motion.div>

            {/* SplitMate Card */}
            <motion.div 
              variants={itemVariants} 
              className="border border-[var(--border)] rounded-2xl bg-[var(--surface-1)] overflow-hidden hover:border-amber-500/30 transition-all duration-300 group shadow-sm hover:shadow-[0_8px_30px_rgba(245,158,11,0.03)] text-left"
            >
              {/* Header */}
              <div className="bg-[var(--surface-2)] px-5 py-3 border-b border-[var(--border)] flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold tracking-wider text-amber-500 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Settlement Engine
                </span>
                {/* <a 
                  className="p-1 rounded bg-[var(--bg)] hover:bg-[var(--border)] transition-colors text-[var(--text-muted)] hover:text-amber-500" 
                  href="https://github.com/ravimh-dev/splitmates" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Github className="w-3.5 h-3.5" />
                </a> */}
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)] mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  SplitMate
                </h3>
                <span className="text-[11px] font-mono text-[var(--text-muted)] block mb-3">Debt Optimization Engine</span>

                <div className="proj-stack flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Live
                  </span>
                  <a 
                    href="http://161.97.183.209:3002/login" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Live Link
                  </a>
                  <a 
                    href="https://github.com/ravimh-dev/splitmates" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-neutral-500/10 text-neutral-300 border border-neutral-500/20 hover:bg-neutral-500/20 transition-all cursor-pointer"
                  >
                    <Github className="w-3 h-3" />
                    GitHub Repo
                  </a>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                  High-performance expense-sharing backend featuring a heap-based debt minimization algorithm, Redis-backed ledger balances caching, and 100% test coverage with Jest.
                </p>

                {/* Engineering Highlights */}
                <div className="border-t border-[var(--border)]/60 pt-4 space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider block mb-1">Key Engineering Highlights</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug"><strong>Debt Minimization:</strong> Greedy min-flow max-heap solver reducing raw transactions to the absolute minimum settlement vectors.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug"><strong>Redis Cache:</strong> Instant ledger state lookups and balance updates synchronized via standard Redis memory structures.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--border)] flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5 font-mono">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Algorithm: Greedy Min-Flow
                </span>
                <span className="font-mono text-[9px] text-[var(--text-muted)]">COVERAGE: 100%</span>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* CONTACT SECTION */}
      <motion.section 
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-20"
      >
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-gradient-to-b from-purple-500 via-pink-500 to-rose-500 rounded" />
            <div>
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-purple-400 block leading-none mb-1">04 / DISPATCH</span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Contact Port
              </h2>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded uppercase self-start sm:self-auto">
            LINK_SECURE: PASS
          </span>
        </div>
        <p className="contact-intro">
          Open to backend roles at product startups and funded SaaS companies. Remote-friendly, based in Surat, India.
        </p>
        
        {/* Contact Links */}
        <div className="contact-row mb-6">
          <button 
            className="contact-link" 
            onClick={copyToClipboard}
            title="Click to copy email address"
          >
            <Mail className="w-3.5 h-3.5" /> 
            <span>{copiedEmail ? "Copied address!" : "ravimh.dev@gmail.com"}</span>
            {copiedEmail ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3 text-[var(--text-muted)]" />}
          </button>
          
          <a 
            className="contact-link" 
            href="https://github.com/ravimh-dev" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Github className="w-3.5 h-3.5" /> github.com/ravimh-dev
          </a>
          
          <a 
            className="contact-link" 
            href="https://linkedin.com/in/ravi-mahavadiya" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
          </a>
        </div>

        {/* Elegant Contact Message Form */}
        <div className="contact-form-container">
          <div className="section-label" style={{ fontSize: "10px", marginBottom: "1rem" }}>Send a secure message</div>
          
          <form onSubmit={handleContactSubmit} className="contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="form-name">Name</label>
                <input
                  id="form-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="form-email">Email Address</label>
                <input
                  id="form-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="form-message">Message</label>
              <textarea
                id="form-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let's build something scalable."
                className="form-textarea"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: "fit-content", alignSelf: "flex-start", marginTop: "0.5rem" }}
              disabled={isSending}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? "Sending..." : "Send Message"}</span>
            </button>
          </form>

          {/* Form feedback notifications */}
          <AnimatePresence>
            {formFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 rounded-lg flex items-center gap-2.5 text-xs font-medium"
                style={{
                  background: formFeedback.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: `0.5px solid ${formFeedback.type === "success" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                  color: formFeedback.type === "success" ? "var(--success)" : "#ef4444"
                }}
              >
                {formFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{formFeedback.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="footer">
        <span className="footer-text">Ravi Mahavadiya · Backend Engineer · Surat, India</span>
        <span className="footer-text">ravimh.dev@gmail.com</span>
      </footer>

      {/* SYSTEM RESUME COMPILER TERMINAL MODAL */}
      <AnimatePresence>
        {showDownloadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] shadow-xl"
            >
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
                  </div>
                  <span className="font-mono text-xs font-semibold tracking-tight text-[var(--text-primary)]">
                    ravimh-compiler.sh
                  </span>
                </div>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  aria-label="Close compilation console"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Terminal Log Stream */}
              <div className="p-5 font-mono text-xs">
                <div className="mb-4 rounded-lg bg-[#0c0c0d] p-4 text-emerald-400 overflow-y-auto max-h-[180px] space-y-1.5 border border-emerald-950/40 text-left">
                  {downloadLogs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.12 }}
                      className="leading-relaxed"
                    >
                      <span className="text-emerald-600 mr-1.5">$</span>
                      {log}
                    </motion.div>
                  ))}
                  <div className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5" />
                </div>

                {/* Progress Indicators */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1.5 font-medium">
                    <span className="flex items-center gap-1.5">
                      {downloadProgress < 100 ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                      )}
                      {downloadProgress < 100 ? "Compiling PDF data streams..." : "PDF payload delivered!"}
                    </span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)] border border-[var(--border)] p-[1px]">
                    <motion.div
                      className="h-full rounded-full bg-[var(--accent)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                      transition={{ ease: "easeInOut", duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Footer buttons to Skip/Instant Download */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    SECURE TRANSACT IO v2.6
                  </span>
                  <div className="flex items-center gap-2">
                    {downloadProgress < 100 && (
                      <button
                        onClick={skipAndDownloadNow}
                        className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                      >
                        Skip & Download
                      </button>
                    )}
                    <button
                      onClick={() => setShowDownloadModal(false)}
                      className="rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all border border-[var(--border)] cursor-pointer"
                    >
                      {downloadProgress < 100 ? "Cancel" : "Close"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SYSTEM CONTACT STATUS MODAL */}
      <AnimatePresence>
        {showContactModal && contactModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${contactModalData.type === "success" ? "bg-[var(--success)] animate-pulse" : "bg-red-500 animate-pulse"}`} />
                  <span className="font-mono text-xs font-semibold tracking-tight text-[var(--text-primary)]">
                    {contactModalData.type === "success" ? "system-dispatch.ok" : "system-dispatch.err"}
                  </span>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  aria-label="Close message modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 text-center flex flex-col items-center">
                {contactModalData.type === "success" ? (
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 animate-bounce">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                )}
                
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 font-mono">
                  {contactModalData.type === "success" ? "TRANSMISSION SUCCESSFUL" : "TRANSMISSION FAILED"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 max-w-[280px]">
                  {contactModalData.message}
                </p>

                <button
                  onClick={() => setShowContactModal(false)}
                  className={`w-full rounded-md py-2 text-xs font-medium font-mono border transition-all cursor-pointer ${
                    contactModalData.type === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                      : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  }`}
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
