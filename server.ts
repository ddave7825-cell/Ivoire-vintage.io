import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, Order, UserAccount } from "./src/types";

// Seed data imported or reconstructed directly to avoid circular ESM issues
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Robe d'été Jaune Vintage",
    price: 6500,
    originalPrice: 18000,
    description: "Une superbe robe longue jaune soleil, idéale pour les sorties ensoleillées à Assinie. Tissu léger et fluide, coupe très flatteuse.",
    category: "Femme",
    size: "M",
    brand: "Zara Vintage",
    state: "Très bon état",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600"],
    sellerName: "Awa de Cocody",
    sellerPhone: "0708091011",
    sellerCity: "Cocody, Abidjan",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    title: "Veste Bomber en Cuir Marron",
    price: 15000,
    originalPrice: 45000,
    description: "Veste vintage en cuir véritable de couleur marron foncé. Coupe décontractée style rétro 90s, robuste et pleine de caractère.",
    category: "Homme",
    size: "L",
    brand: "Schott Vintage",
    state: "Comme neuf",
    images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600"],
    sellerName: "Junior le Chiffonnier",
    sellerPhone: "0544556677",
    sellerCity: "Marcory, Abidjan",
    createdAt: new Date().toISOString(),
    isPopular: true
  },
  {
    id: "prod-3",
    title: "Chemise en Soie Motif Tropical",
    price: 4500,
    originalPrice: 12500,
    description: "Chemise à manches courtes ultra-stylée pour vos soirées branchées en Zone 4. Douce sur la peau et très respirante.",
    category: "Homme",
    size: "M",
    brand: "H&M Trend",
    state: "Très bon état",
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600"],
    sellerName: "Boutique Blaise Vintage",
    sellerPhone: "0102030405",
    sellerCity: "Plateau, Abidjan",
    createdAt: new Date().toISOString()
  }
];

const DB_PATH = path.join(process.cwd(), "db.json");

// Structure of our persistent local JSON database
interface LocalDatabase {
  products: Product[];
  orders: Order[];
  accounts: (UserAccount & { password?: string })[];
}

// Ensure database file exists
function initDatabase(): LocalDatabase {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(content) as LocalDatabase;
    } catch (err) {
      console.error("Error reading db.json, recreating...", err);
    }
  }

  // Generate initial database
  const initialDb: LocalDatabase = {
    products: INITIAL_PRODUCTS,
    orders: [],
    accounts: [
      {
        id: "usr-admin-1",
        fullName: "Soro David (Admin)",
        email: "davsdavid45@gmail.com",
        phone: "0556470423",
        role: "admin",
        password: "admin225",
        createdAt: new Date().toISOString()
      },
      {
        id: "usr-client-demo",
        fullName: "Kouamé Koffi Marc",
        email: "client@example.com",
        phone: "0708091011",
        role: "client",
        password: "password123",
        createdAt: new Date().toISOString(),
        commune: "Cocody",
        address: "Cité des Arts, Batiment E"
      }
    ]
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), "utf-8");
  return initialDb;
}

// Write helper
function saveDatabase(db: LocalDatabase) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize DB instance
  const dbStore = initDatabase();

  // --- API ROUTING ENPOINTS ---

  // Get active directory of articles
  app.get("/api/products", (req, res) => {
    res.json(dbStore.products);
  });

  // Create/publish a new clothes article
  app.post("/api/products", (req, res) => {
    try {
      const prodData = req.body as Product;
      if (!prodData.title || !prodData.price) {
        return res.status(400).json({ error: "Le titre et le prix sont obligatoires" });
      }
      
      const newProduct: Product = {
        ...prodData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      dbStore.products.unshift(newProduct);
      saveDatabase(dbStore);
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: "Erreur serveur lors de la publication" });
    }
  });

  // Delete article
  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const index = dbStore.products.findIndex(p => p.id === id);
    if (index !== -1) {
      dbStore.products.splice(index, 1);
      saveDatabase(dbStore);
      return res.json({ success: true, message: "Article supprimé avec succès" });
    }
    res.status(404).json({ error: "Article non trouvé" });
  });

  // Get active client orders (Admin only, or matched to cell phone)
  app.get("/api/orders", (req, res) => {
    const { phone } = req.query;
    if (phone) {
      const clientOrders = dbStore.orders.filter(o => o.customerPhone === phone);
      return res.json(clientOrders);
    }
    res.json(dbStore.orders);
  });

  // Initiate purchase checkout
  app.post("/api/orders", (req, res) => {
    try {
      const orderInput = req.body as Omit<Order, "id" | "createdAt" | "status">;
      if (!orderInput.customerName || !orderInput.customerPhone || !orderInput.items || orderInput.items.length === 0) {
        return res.status(400).json({ error: "Informations de livraison incomplètes" });
      }

      const newOrder: Order = {
        ...orderInput,
        id: `CMD-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      dbStore.orders.unshift(newOrder);
      saveDatabase(dbStore);
      res.status(201).json(newOrder);
    } catch (err) {
      res.status(500).json({ error: "Impossible d'initier la commande" });
    }
  });

  // Assign dispatcher/update order status
  app.put("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = dbStore.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      saveDatabase(dbStore);
      return res.json(order);
    }
    res.status(404).json({ error: "Commande non trouvée" });
  });

  // Drop orders if needed (Admin action)
  app.delete("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    const index = dbStore.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      dbStore.orders.splice(index, 1);
      saveDatabase(dbStore);
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Commande introuvable" });
  });

  // Get collective registered accounts list (Admin verification)
  app.get("/api/accounts", (req, res) => {
    // Strip passwords before returning
    const safeAccounts = dbStore.accounts.map(({ password, ...acc }) => acc);
    res.json(safeAccounts);
  });

  // Login connection endpoint
  app.post("/api/accounts/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Veuillez renseigner votre email et mot de passe." });
    }

    const matchedUser = dbStore.accounts.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (matchedUser) {
      const { password: _, ...safeUser } = matchedUser;
      return res.json({ success: true, user: safeUser });
    }

    res.status(401).json({ error: "Identifiants incorrects. Veuillez réessayer." });
  });

  // Create new user with password (Registration backend)
  app.post("/api/accounts", (req, res) => {
    const { fullName, email, phone, role, password, city, commune, address } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: "Champs obligatoires manquants." });
    }

    const alreadyExists = dbStore.accounts.some(a => a.email.toLowerCase() === email.toLowerCase());
    if (alreadyExists) {
      return res.status(400).json({ error: "Cet email est déjà lié à un compte." });
    }

    const newUser: UserAccount & { password?: string } = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      phone,
      role: role || "client",
      password,
      city,
      commune,
      address,
      createdAt: new Date().toISOString()
    };

    dbStore.accounts.unshift(newUser);
    saveDatabase(dbStore);

    const { password: _, ...safeUser } = newUser;
    res.status(211).json(safeUser);
  });

  // Handle client-side asset delivery for production index or local dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Ivoire Vintage Server] Running happily on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical failure booting server:", err);
});
