import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Clock,
  Download,
  Home as HomeIcon,
  Heart,
  Leaf,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Empty, Modal } from "./components";
import {
  Bag,
  Checkout,
  Confirmation,
  Home,
  Impact,
  ProductDetail,
  Shop,
} from "./pages";
import { useStore } from "./store";
import { Wishlist, Orders } from "./pages/Extras";
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export default function App() {
  const { cart, storageError } = useStore();
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const [search, setSearch] = useState("");
  const [about, setAbout] = useState(false);
  const [installHelp, setInstallHelp] = useState(false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const location = useLocation();
  const navigate = useNavigate();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    const onInstall = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    };
    const online = () => setOffline(false);
    const offline = () => setOffline(true);
    const installed = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Everyday goods, considered.",
      "/shop": "The collection",
      "/bag": "Your bag",
      "/checkout": "Checkout",
      "/impact": "Our impact",
      "/wishlist": "Your wishlist",
      "/orders": "Your orders",
    };
    document.title = `ReLoop — ${titles[location.pathname] || (location.pathname.startsWith("/product/") ? "Product details" : "Order details")}`;
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  const searchSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(
      "/shop" +
        (search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""),
    );
  };
  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    } else setInstallHelp(true);
  };
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="ReLoop home">
          reloop.
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink className="nav-link" to="/shop">
            Shop
          </NavLink>
          <NavLink className="nav-link" to="/impact">
            Our impact
          </NavLink>
          <NavLink className="nav-link" to="/wishlist">
            Saved
          </NavLink>
          <NavLink className="nav-link" to="/bag">
            Bag ({count})
          </NavLink>
        </nav>
        <form className="header-search" role="search" onSubmit={searchSubmit}>
          <label className="sr-only" htmlFor="header-search">
            Search considered goods
          </label>
          <input
            type="search"
            id="header-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bottles, totes & more"
            enterKeyHint="search"
          />
          <button className="icon-button" aria-label="Search">
            <Search size={18} />
          </button>
        </form>
        <Link
          className="mobile-bag icon-button"
          to="/bag"
          aria-label={`Shopping bag, ${count} items`}
        >
          <ShoppingBag size={22} />
          {count > 0 && <span className="bag-badge">{count}</span>}
        </Link>
      </header>
      {offline && (
        <p className="connection-notice" role="status">
          You’re offline. Your saved bag and this collection still work.
        </p>
      )}
      {storageError && (
        <p className="connection-notice" role="status">
          Browser storage is unavailable. Your current session works, but
          changes may not be saved after closing.
        </p>
      )}
      <main id="main" tabIndex={-1} ref={main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route
            path="/product/:id"
            element={<ProductDetail key={location.pathname} />}
          />
          <Route path="/bag" element={<Bag />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<Orders />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
          <Route path="/impact" element={<Impact />} />
          <Route
            path="*"
            element={
              <Empty
                title="A little off the path."
                body="We couldn’t find that page. Let’s get you back to the collection."
              />
            }
          />
        </Routes>
      </main>
      <footer className="site-footer commerce-footer">
        <div className="footer-grid">
          <section className="footer-brand" aria-label="ReLoop">
            <Link className="wordmark" to="/">
              <Leaf size={27} aria-hidden="true" />
              reloop.
            </Link>
            <p>
              Everyday essentials, thoughtfully chosen. Refill, reuse and make
              room for a little less waste.
            </p>
            <button className="footer-action" onClick={() => setAbout(true)}>
              Our story <ArrowRight size={16} />
            </button>
          </section>
          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact">Contact us</h2>
            <div className="footer-detail">
              <Phone size={18} />
              <div>
                <span>+91 00000 00000</span>
                <small>Sample customer care number</small>
              </div>
            </div>
            <div className="footer-detail">
              <Mail size={18} />
              <div>
                <span>hello@reloop.example</span>
                <small>Sample contact address</small>
              </div>
            </div>
            <div className="footer-detail">
              <Clock size={18} />
              <div>
                <span>Mon–Fri: 9 AM–6 PM</span>
                <small>Sat: 10 AM–2 PM · Sample hours</small>
              </div>
            </div>
          </section>
          <section aria-labelledby="footer-location">
            <h2 id="footer-location">Our location</h2>
            <div className="footer-detail">
              <MapPin size={18} />
              <div>
                <span>ReLoop Studio · Vashi</span>
                <span>Navi Mumbai, Maharashtra 400703</span>
                <small>Concept location · no public store</small>
              </div>
            </div>
            <p className="footer-location-note">
              Designed around everyday routines and more considered choices.
            </p>
          </section>
          <nav aria-label="Footer quick links">
            <h2>Quick links</h2>
            <Link to="/shop">Product catalog</Link>
            <Link to="/impact">Our impact</Link>
            <Link to="/wishlist">Your wishlist</Link>
            <Link to="/orders">Your orders</Link>
            <button className="footer-action" onClick={install}>
              <Download size={16} />
              Install ReLoop
            </button>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} ReLoop. Everyday goods, considered.
          </span>
          <div>
            <button className="footer-action" onClick={() => setAbout(true)}>
              About ReLoop
            </button>
            <a href="/photo-credits.html" target="_blank" rel="noreferrer">
              Photo credits
            </a>
            <a
              href="https://www.figma.com/design/dheQsHggvMFP4XUWhjAURe?node-id=32-2"
              target="_blank"
              rel="noreferrer"
            >
              View design
            </a>
          </div>
        </div>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[
          { to: "/", label: "Home", icon: HomeIcon },
          { to: "/shop", label: "Shop", icon: Store },
          {
            to: "/bag",
            label: `Bag${count ? " (" + count + ")" : ""}`,
            icon: ShoppingBag,
          },
          { to: "/wishlist", label: "Saved", icon: Heart },
          { to: "/impact", label: "Impact", icon: Leaf },
        ].map(({ to, label, icon: Icon }) => (
          <NavLink end={to === "/"} key={to} to={to}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {about && (
        <Modal title="About ReLoop" onClose={() => setAbout(false)}>
          <p>
            ReLoop is a Product Design (HSSM301) project by SY Computer
            Engineering students at FCRIT Vashi, exploring sustainable everyday
            shopping through a responsive website and installable PWA.
          </p>
          <p>
            All products, scores, prices and environmental inputs are fictional
            demonstration data. No research findings, certifications, real
            merchants or measured environmental savings are claimed. This app
            has no backend, payment processing or real fulfilment.
          </p>
          <p>
            Your bag and order history stay in this browser’s local storage.
            Delivery details are neither stored nor transmitted. To reset
            orders, use “Clear order history” on the Impact page. To remove all
            app data, clear this site’s browser storage.
          </p>
          <button className="button full" onClick={() => setAbout(false)}>
            Back to ReLoop
          </button>
        </Modal>
      )}
      {installHelp && (
        <Modal title="Keep ReLoop close" onClose={() => setInstallHelp(false)}>
          <p>
            Use a supported browser on HTTPS or localhost. On Android, open the
            browser menu and choose “Install app” or “Add to home screen”. On
            iPhone or iPad, use Safari’s Share menu → “Add to Home Screen”. On
            desktop, look for the install icon in the address bar.
          </p>
          <p>
            If ReLoop is already installed, open it from your home screen or app
            launcher. Visit online once to cache the app before trying it
            offline.
          </p>
          <button className="button full" onClick={() => setInstallHelp(false)}>
            Got it
          </button>
        </Modal>
      )}
    </>
  );
}
