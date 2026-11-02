
import {
  ArrowRight,
  Brain,
  Dumbbell,
  Sparkles,
  Heart,
  BookOpen,
  Trophy
} from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="memore-container">
          <nav className="navbar">
            <a href="/" className="brand">
              <span className="brand-icon">
                <Sparkles size={23} />
              </span>
              MEMORE
            </a>

            <a href="#funcionalidades" className="nav-link">
              Como funciona
            </a>

            <a href="/entrar" className="nav-button">
            Começar agora
           </a>
          </nav>

          <div className="hero-content">
            <div>
              <div className="hero-label">
                <Sparkles size={15} />
                SUA EVOLUÇÃO COMEÇA AQUI
              </div>

              <h1>
                Cultive seus hábitos.
                <span> Evolua seu pet.</span>
              </h1>

              <p className="hero-description">
                Transforme pequenas atitudes em grandes conquistas.
                Aprenda, treine e evolua ao lado de um companheiro
                que cresce junto com você.
              </p>

              <div className="hero-actions" id="comecar">
                <a href="/entrar" className="primary-button">
                Descobrir o MEMORE
                 <ArrowRight size={19} />
                </a>

                <a href="#funcionalidades" className="secondary-button">
                  Conhecer o jogo
                </a>
              </div>
            </div>

            <div className="pet-stage">
              <div className="pet-glow" />

              <div className="pet-tag top">
                <Sparkles size={15} color="#8257ff" />
                Nível 01
              </div>

              <div className="pet-emoji" role="img" aria-label="Mascote inicial">
                🐣
              </div>

              <div className="pet-tag bottom">
                <Heart size={16} color="#ff58a6" />
                Seu novo companheiro!
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="funcionalidades">
        <div className="memore-container">
          <div className="section-heading">
            <div className="hero-label">
              <Sparkles size={15} />
              MUITO MAIS QUE UM JOGO
            </div>

            <h2>
              Sua rotina pode ser uma aventura.
            </h2>

            <p>
              Cada hábito cultivado fortalece seu mascote.
              Cada conquista aproxima vocês de uma nova evolução.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div
                className="feature-icon"
                style={{ background: "#eee7ff", color: "#8257ff" }}
              >
                <Brain size={29} />
              </div>

              <h3>Treine sua mente</h3>

              <p>
                Leia, estude e compartilhe seus conhecimentos.
                Seu pet desenvolverá inteligência e sabedoria.
              </p>
            </article>

            <article className="feature-card">
              <div
                className="feature-icon"
                style={{ background: "#ffe7f1", color: "#ff58a6" }}
              >
                <Dumbbell size={29} />
              </div>

              <h3>Fortaleça seu corpo</h3>

              <p>
                Transforme exercícios e atividades físicas
                em energia para sua evolução.
              </p>
            </article>

            <article className="feature-card">
              <div
                className="feature-icon"
                style={{ background: "#fff5ce", color: "#d6a600" }}
              >
                <Trophy size={29} />
              </div>

              <h3>Conquiste seu espaço</h3>

              <p>
                Suba de nível, desbloqueie evoluções e
                compartilhe suas conquistas.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="brand" style={{ justifyContent: "center" }}>
          <Sparkles size={22} />
          MEMORE
        </div>

        <p>Cultive seus hábitos. Evolua seu pet.</p>

        <small>© 2026 MEMORE. Todos os direitos reservados.</small>
      </footer>
    </main>
  );
}
