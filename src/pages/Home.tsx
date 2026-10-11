import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard, Transparency } from "../components";
import { products } from "../model";

export function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow accent">The everyday collection / 2026</p>
          <h1>
            Less, but
            <br />
            better.
          </h1>
          <p className="hero-copy">
            Good things deserve a place in your daily routine. Discover useful
            essentials to refill, carry and use again.
          </p>
          <Link className="button" to="/shop">
            Explore the collection <ArrowRight size={18} />
          </Link>
          <p className="hero-footnote">Small rituals. Better essentials.</p>
        </div>
        <div className="hero-art photo-hero">
          <img
            src="/photos/30382341.webp"
            alt="A natural canvas tote filled with books and dried flowers on soft linen"
            width="1000"
            height="1250"
          />
          <Link className="hero-caption" to="/product/canvas-tote">
            <span>
              <small>01 / DAILY CARRY</small>
              <strong>Room for the everyday.</strong>
            </span>
            <ArrowRight size={22} />
          </Link>
        </div>
      </section>
      <div className="values-strip">
        <span>Refill. Reuse. Repeat.</span>
        <span>Materials & care, made clear</span>
        <span>Thoughtful choices start here</span>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow accent">Find your everyday</p>
          <h2>Small rituals. Better essentials.</h2>
        </div>
      </div>
      <nav className="categories" aria-label="Shop by category">
        {[
          ["Reusables", "Carry a little lighter", "9869067"],
          ["Home & garden", "Make room for green", "6964562"],
          ["Kitchen", "A more mindful kitchen", "8580724"],
          ["Personal care", "Care, simply", "7055302"],
        ].map(([c, label, photo], i) => (
          <Link
            key={c}
            className="category-tile"
            to={`/shop?category=${encodeURIComponent(c)}`}
          >
            <img
              src={`/photos/${photo}.webp`}
              alt=""
              width="400"
              height="300"
              loading="lazy"
            />
            <div>
              <span className="caption muted">
                0{i + 1} / {c}
              </span>
              <strong>{label}</strong>
              <ArrowRight size={18} />
            </div>
          </Link>
        ))}
      </nav>
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">The considered edit</p>
            <h2>Everyday essentials</h2>
          </div>
          <Link className="text-link" to="/shop">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="home-note">
        <div>
          <p className="eyebrow accent">A little more intention</p>
          <h2>
            Choose well.
            <br />
            Use it again.
          </h2>
        </div>
        <div>
          <p>
            Better everyday habits start with things you actually use. Explore
            materials, care instructions and our proposed Eco-Score before
            making a choice.
          </p>
          <Link className="text-link" to="/impact">
            Understand your impact <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <Transparency />
    </>
  );
}
