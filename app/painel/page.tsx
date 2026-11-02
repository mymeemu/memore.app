
import Link from "next/link";
import { redirect } from "next/navigation";
import MemorePet from "@/components/MemorePet";
import EnergyCard from "./energy-card";
import {
  Sparkles, Heart, Zap, Trophy, Brain, Home, Users,
  PawPrint, Shirt, ShoppingBag, Target, Medal,
  Settings, ChevronRight, Star, Flame, Gift, Lock,
  ArrowUpRight, Crown
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SairButton from "./sair-button";

export default async function PainelPage() {
  const supabase = createClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/entrar");

  const [
    { data: profile },
    { data: pet },
    { data: ranking }
  ] = await Promise.all([
    supabase
      .from("users")
      .select("username, energy")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("pets")
      .select("name, level, xp, evolution_path, current_skin")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("rankings")
      .select("total_xp, weekly_xp")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  const username = profile?.username ?? "Jogador";
  const energy = profile?.energy ?? 30;
  const level = pet?.level ?? 1;
  const xp = pet?.xp ?? 0;
  const totalXp = ranking?.total_xp ?? 0;
  const weeklyXp = ranking?.weekly_xp ?? 0;
  const progress = Math.min(100, (xp % 100));

  const menu = [
    { label: "Início", icon: Home, href: "#inicio", active: true },
    { label: "Amigos", icon: Users, href: "#amigos" },
    { label: "Ranking", icon: Trophy, href: "#ranking" },
    { label: "Meus pets", icon: PawPrint, href: "#pets" },
    { label: "Personalização", icon: Shirt, href: "#skins" },
    { label: "Loja", icon: ShoppingBag, href: "#loja" },
    { label: "Missões", icon: Target, href: "#missoes" },
    { label: "Conquistas", icon: Medal, href: "#conquistas" }
  ];

  return (
    <main className="memore-shell">
      <aside className="sidebar">
        <Link href="/painel" className="brand">
          <span className="brand-icon"><Sparkles size={23} /></span>
          <span>MEMORE</span>
        </Link>

        <div className="sidebar-label">SEU UNIVERSO</div>

        <nav className="side-menu">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`menu-item ${item.active ? "active" : ""}`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.active && <span className="active-dot" />}
              </a>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <div className="promo-star"><Star size={17} fill="currentColor" /></div>
            <strong>Seu universo está só começando!</strong>
            <p>Crie hábitos, conquiste XP e descubra novas possibilidades.</p>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar">{username.slice(0, 1).toUpperCase()}</div>
            <div className="user-info">
              <strong>{username}</strong>
              <span>Explorador iniciante</span>
            </div>
            <SairButton />
          </div>
        </div>
      </aside>

      <section className="main-area" id="inicio">
        <header className="topbar">
          <div>
            <span className="eyebrow">SEGUNDA-FEIRA • SEU NOVO COMEÇO</span>
            <h1>Olá, {username}! <span>✦</span></h1>
            <p>Pequenos passos hoje. Grandes evoluções amanhã.</p>
          </div>
          <div className="topbar-badge">
            <span className="online-dot" />
            Universo ativo
          </div>
        </header>

        <section className="welcome-banner">
          <div className="banner-content">
            <span className="banner-tag"><Sparkles size={14} /> SUA JORNADA COMEÇA AQUI</span>
            <h2>Uma nova versão<br />de você está nascendo.</h2>
            <p>Cuide de si, complete missões e ajude seu companheiro a evoluir.</p>
            <a href="#missoes" className="banner-button">
              Explorar missões <ChevronRight size={17} />
            </a>
          </div>
          <div className="banner-decoration">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="banner-spark spark-one">✦</div>
            <div className="banner-spark spark-two">✧</div>
            <div className="banner-pet">🐣</div>
            <div className="banner-platform" />
            <div className="banner-level">LV. {level}</div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            icon={<Zap size={21} />}
            label="ENERGIA"
            value={`${energy}/30`}
            detail="Disponível hoje"
            color="yellow"
            percent={(energy / 30) * 100}
          />
          <StatCard
            icon={<Star size={21} />}
            label="EXPERIÊNCIA"
            value={`${totalXp} XP`}
            detail="Sua jornada acumulada"
            color="purple"
            percent={Math.min(100, totalXp % 100)}
          />
          <StatCard
            icon={<Brain size={21} />}
            label="NÍVEL DO PET"
            value={`${level}`}
            detail="Nível atual"
            color="pink"
            percent={progress}
          />
          <StatCard
            icon={<Flame size={21} />}
            label="XP DA SEMANA"
            value={`${weeklyXp} XP`}
            detail="Conquistas recentes"
            color="mint"
            percent={Math.min(100, weeklyXp % 100)}
          />
        </section>

        <div className="section-heading">
          <div>
            <span className="eyebrow">SEU MELHOR AMIGO</span>
            <h2>Seu companheiro</h2>
          </div>
          <span className="level-pill"><Crown size={14} /> NÍVEL {level}</span>
        </div>

        <section className="pet-card" id="pets">
          <div className="pet-visual">
            <div className="pet-glow" />
            <div className="pet-stars">✦　·　✧</div>
            <MemorePet
  name={pet?.name ?? "Memorex"}
  level={level}
  energy={energy}
  evolutionPath={pet?.evolution_path ?? "balanced"}
/>
            <div className="pet-shadow" />
            <div className="pet-caption">SEU PRIMEIRO COMPANHEIRO</div>
          </div>

          <div className="pet-details">
            <span className="pet-status"><span /> PRONTO PARA AVENTURAS</span>
            <h3>{pet?.name ?? "Memorex"}</h3>
            <p>Seu companheiro está esperando suas próximas conquistas. Cuide dos seus hábitos e cresçam juntos!</p>

            <div className="xp-label">
              <strong>Progresso do nível</strong>
              <span>{progress}/100 XP</span>
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="pet-bottom">
              <span><Star size={16} /> {xp} XP acumulados</span>
              <span className="evolution-label">Evolução: {pet?.evolution_path ?? "balanced"}</span>
            </div>

            <a href="#skins" className="customize-link">
              <Shirt size={17} /> Personalizar companheiro <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <div className="section-heading mission-heading" id="missoes">
          <div>
            <span className="eyebrow">SEU PRÓXIMO PASSO</span>
            <h2>Missões diárias</h2>
          </div>
          <span className="coming-label">EM DESENVOLVIMENTO</span>
        </div>

        <section className="mission-grid">
          <MissionCard
            icon={<Brain size={23} />}
            title="Treine sua mente"
            description="Aprenda algo novo e fortaleça sua inteligência."
            color="purple"
            reward="XP de mente"
          />
          <MissionCard
            icon={<Heart size={23} />}
            title="Cuide do seu corpo"
            description="Movimente-se e construa hábitos saudáveis."
            color="pink"
            reward="XP de corpo"
          />
          <MissionCard
            icon={<Sparkles size={23} />}
            title="Expanda seu saber"
            description="Explique o que aprendeu com suas próprias palavras."
            color="mint"
            reward="XP de sabedoria"
          />
        </section>

        <div className="section-heading community-heading">
          <div>
            <span className="eyebrow">UM UNIVERSO COMPARTILHADO</span>
            <h2>Explore mais do MEMORE</h2>
          </div>
        </div>

        <section className="features-grid">
          <FeatureCard
            id="amigos"
            icon={<Users size={22} />}
            title="Amigos"
            description="Convide pessoas e acompanhe suas jornadas."
            color="purple"
          />
          <FeatureCard
            id="ranking"
            icon={<Trophy size={22} />}
            title="Rankings"
            description="Compare suas conquistas com amigos e jogadores."
            color="yellow"
          />
          <FeatureCard
            id="skins"
            icon={<Shirt size={22} />}
            title="Skins e acessórios"
            description="Dê uma aparência única ao seu companheiro."
            color="pink"
          />
          <FeatureCard
            id="loja"
            icon={<ShoppingBag size={22} />}
            title="Loja e inventário"
            description="Descubra itens e recompensas para sua coleção."
            color="mint"
          />
          <FeatureCard
            id="conquistas"
            icon={<Medal size={22} />}
            title="Conquistas"
            description="Desbloqueie medalhas ao longo da sua jornada."
            color="yellow"
          />
          <FeatureCard
            id="galeria"
            icon={<PawPrint size={22} />}
            title="Galeria de pets"
            description="Descubra criaturas e futuras evoluções."
            color="purple"
          />
        </section>

        <footer className="footer">
          <Sparkles size={15} />
          MEMORE — Cultive seus hábitos. Evolua seu pet.
          <span>Feito para evoluir com você.</span>
        </footer>
      </section>

      <style>{`
        * { box-sizing: border-box; }
        .memore-shell {
          min-height: 100vh;
          display: flex;
          background: #f7f5fc;
          color: #29213f;
          font-family: Nunito, Arial, sans-serif;
        }
        .sidebar {
          width: 250px;
          min-width: 250px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #eeeaf5;
          padding: 28px 17px 20px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #29213f;
          text-decoration: none;
          font-size: 23px;
          font-weight: 1000;
          letter-spacing: -1px;
          padding: 0 10px;
          margin-bottom: 47px;
        }
        .brand-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 13px;
          color: white;
          background: linear-gradient(135deg,#8257ff,#b16cff);
          box-shadow: 0 5px 12px #8257ff40;
        }
        .sidebar-label, .eyebrow {
          font-size: 10px;
          font-weight: 1000;
          letter-spacing: 1.5px;
          color: #a39bb5;
        }
        .sidebar-label { padding: 0 12px; margin-bottom: 13px; }
        .side-menu { display: grid; gap: 6px; }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 46px;
          padding: 0 13px;
          border-radius: 13px;
          color: #777087;
          font-size: 13px;
          font-weight: 850;
          text-decoration: none;
          transition: .2s ease;
        }
        .menu-item:hover { background: #f6f2ff; color: #8257ff; }
        .menu-item.active {
          color: #8257ff;
          background: #f0eaff;
        }
        .active-dot {
          margin-left: auto;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8257ff;
        }
        .sidebar-bottom { margin-top: auto; }
        .sidebar-promo {
          padding: 17px;
          border-radius: 17px;
          background: linear-gradient(145deg,#f2edff,#fff0f7);
          margin-bottom: 20px;
        }
        .promo-star {
          color: #8257ff;
          margin-bottom: 9px;
        }
        .sidebar-promo strong { font-size: 12px; line-height: 1.4; display: block; }
        .sidebar-promo p { font-size: 11px; line-height: 1.5; color: #827990; margin: 7px 0 0; }
        .sidebar-user {
          border-top: 1px solid #f0edf5;
          padding: 17px 3px 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .user-avatar {
          width: 36px; height: 36px; border-radius: 12px;
          background: #eee7ff; color: #8257ff;
          display: grid; place-items: center; font-weight: 1000;
        }
        .user-info { min-width: 0; display: grid; gap: 2px; flex: 1; }
        .user-info strong { font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
        .user-info span { font-size: 10px; color: #9b94a9; }
        .main-area { width: 100%; max-width: 1450px; padding: 34px 44px 25px; margin: 0 auto; }
        .topbar { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 27px; }
        .topbar h1 { font-size: 29px; font-weight: 1000; letter-spacing: -1px; margin: 5px 0 2px; }
        .topbar h1 span { color: #ffbf3d; }
        .topbar p { margin: 0; font-size: 13px; color: #8b849b; font-weight: 650; }
        .topbar-badge {
          display: flex; align-items: center; gap: 8px; padding: 10px 14px;
          background: white; border: 1px solid #eeeaf5; border-radius: 30px;
          font-size: 11px; font-weight: 850; color: #777087;
        }
        .online-dot, .pet-status span { width: 7px; height: 7px; border-radius: 50%; background: #4bd9a2; }
        .welcome-banner {
          min-height: 235px; overflow: hidden; position: relative;
          border-radius: 25px; padding: 30px 36px;
          background: linear-gradient(110deg,#7750ef 0%,#9462f8 55%,#c17cf4 100%);
          color: white; box-shadow: 0 9px 0 #6843d8, 0 18px 35px #8257ff20;
        }
        .banner-content { position: relative; z-index: 2; max-width: 470px; }
        .banner-tag { display: inline-flex; align-items: center; gap: 7px; font-size: 9px; font-weight: 1000; letter-spacing: 1.4px; opacity: .9; }
        .banner-content h2 { font-size: clamp(25px,3vw,36px); line-height: 1.1; letter-spacing: -1px; margin: 13px 0 9px; font-weight: 1000; }
        .banner-content p { font-size: 12px; max-width: 340px; line-height: 1.6; opacity: .88; margin: 0 0 17px; }
        .banner-button {
          display: inline-flex; align-items: center; gap: 7px; background: white; color: #7950e9;
          border-radius: 11px; padding: 11px 15px; text-decoration: none; font-size: 11px; font-weight: 1000;
          box-shadow: 0 4px 0 #d9caff;
        }
        .banner-decoration { position: absolute; right: 8%; top: 0; width: 330px; height: 100%; display: grid; place-items: center; }
        .banner-pet { position: relative; z-index: 2; font-size: 112px; filter: drop-shadow(0 12px 8px #39216a55); animation: float 3s ease-in-out infinite; }
        .banner-platform { position: absolute; bottom: 27px; width: 175px; height: 28px; border-radius: 50%; background: #5636b5; box-shadow: 0 8px 0 #4b2da4; }
        .orbit { position: absolute; border: 1px solid #ffffff40; border-radius: 50%; }
        .orbit-one { width: 235px; height: 150px; transform: rotate(-22deg); }
        .orbit-two { width: 285px; height: 190px; transform: rotate(35deg); }
        .banner-spark { position: absolute; color: #ffe17c; font-size: 25px; }
        .spark-one { top: 35px; right: 55px; }
        .spark-two { bottom: 55px; left: 25px; }
        .banner-level {
          position: absolute; z-index: 3; right: 30px; top: 33px; background: #ffdc58;
          color: #6245bd; border-radius: 20px; padding: 7px 12px; font-size: 10px; font-weight: 1000;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; margin: 27px 0 35px; }
        .stat-card { padding: 17px; background: white; border: 1px solid #f0edf6; border-radius: 17px; box-shadow: 0 5px 18px #30234d08; }
        .stat-top { display: flex; justify-content: space-between; align-items: center; }
        .stat-icon { width: 39px; height: 39px; display: grid; place-items: center; border-radius: 12px; }
        .stat-icon.yellow { background: #fff4d5; color: #e2a800; }
        .stat-icon.purple { background: #f0eaff; color: #8257ff; }
        .stat-icon.pink { background: #ffe9f2; color: #f15c9d; }
        .stat-icon.mint { background: #e3fbf1; color: #2ebc8c; }
        .stat-label { font-size: 9px; letter-spacing: 1px; font-weight: 1000; color: #a29bad; margin-top: 13px; }
        .stat-value { font-size: 23px; font-weight: 1000; margin-top: 2px; }
        .stat-detail { font-size: 10px; color: #aaa3b5; margin-top: 2px; }
        .stat-line { height: 4px; background: #f0edf5; border-radius: 9px; margin-top: 13px; overflow: hidden; }
        .stat-line div { height: 100%; border-radius: 9px; }
        .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin: 0 0 14px; }
        .section-heading h2 { margin: 4px 0 0; font-size: 21px; font-weight: 1000; letter-spacing: -.5px; }
        .level-pill, .coming-label { display: inline-flex; align-items: center; gap: 6px; border-radius: 20px; padding: 7px 11px; font-size: 9px; font-weight: 1000; }
        .level-pill { color: #a87800; background: #fff4d4; }
        .coming-label { color: #9b8bbd; background: #eee9f8; letter-spacing: .7px; }
        .pet-card { display: grid; grid-template-columns: 40% 1fr; background: white; border: 1px solid #f0edf6; border-radius: 21px; overflow: hidden; box-shadow: 0 6px 22px #30234d08; }
        .pet-visual { min-height: 265px; position: relative; display: grid; place-items: center; overflow: hidden; background: radial-gradient(circle at 50% 43%,#fff 0%,#f7eaff 46%,#fce8f2 100%); }
        .pet-glow { position: absolute; width: 180px; height: 180px; border-radius: 50%; background: #c8a5ff55; filter: blur(25px); }
        .pet-character { position: relative; z-index: 2; font-size: 108px; filter: drop-shadow(0 12px 8px #604a8022); animation: float 3.4s ease-in-out infinite; }
        .pet-stars { position: absolute; top: 35px; color: #b28aff; font-size: 23px; }
        .pet-shadow { position: absolute; bottom: 57px; width: 115px; height: 19px; background: #a98acb30; border-radius: 50%; }
        .pet-caption { position: absolute; bottom: 22px; font-size: 9px; font-weight: 1000; letter-spacing: 1.5px; color: #a18abf; }
        .pet-details { padding: 27px 30px; }
        .pet-status { display: inline-flex; align-items: center; gap: 7px; color: #35b98d; font-size: 9px; font-weight: 1000; letter-spacing: .8px; }
        .pet-details h3 { font-size: 27px; font-weight: 1000; margin: 8px 0 5px; }
        .pet-details > p { color: #8e879d; font-size: 12px; line-height: 1.6; max-width: 440px; margin: 0 0 22px; }
        .xp-label { display: flex; justify-content: space-between; gap: 10px; font-size: 10px; margin-bottom: 8px; }
        .xp-label strong { color: #625a72; }
        .xp-label span { color: #8e7ac0; font-weight: 900; }
        .xp-track { height: 9px; border-radius: 10px; background: #eeeaf5; overflow: hidden; }
        .xp-fill { height: 100%; border-radius: 10px; background: linear-gradient(90deg,#8257ff,#c17cf4); }
        .pet-bottom { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 10px; color: #9690a4; font-size: 10px; }
        .pet-bottom span:first-child { display: inline-flex; align-items: center; gap: 5px; color: #9273d8; font-weight: 900; }
        .evolution-label { text-transform: capitalize; }
        .customize-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 19px; padding: 10px 13px; background: #f1ebff; color: #8257ff; border-radius: 10px; text-decoration: none; font-size: 10px; font-weight: 1000; }
        .mission-heading { margin-top: 37px; }
        .mission-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
        .mission-card { background: white; border: 1px solid #f0edf6; border-radius: 17px; padding: 19px; min-height: 150px; position: relative; overflow: hidden; }
        .mission-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 13px; }
        .mission-icon.purple { background: #f0eaff; color: #8257ff; }
        .mission-icon.pink { background: #ffe9f2; color: #f15c9d; }
        .mission-icon.mint { background: #e3fbf1; color: #2ebc8c; }
        .mission-card h3 { font-size: 13px; font-weight: 1000; margin: 12px 0 4px; }
        .mission-card p { font-size: 10px; color: #928ba0; line-height: 1.5; margin: 0; max-width: 250px; }
        .mission-reward { margin-top: 12px; color: #8b72c9; font-size: 9px; font-weight: 1000; }
        .community-heading { margin-top: 38px; }
        .features-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 13px; }
        .feature-card { display: flex; align-items: flex-start; gap: 12px; background: white; border: 1px solid #f0edf6; border-radius: 15px; padding: 17px; min-height: 95px; }
        .feature-icon { width: 39px; height: 39px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; }
        .feature-icon.purple { background: #f0eaff; color: #8257ff; }
        .feature-icon.yellow { background: #fff4d5; color: #d9a000; }
        .feature-icon.pink { background: #ffe9f2; color: #f15c9d; }
        .feature-icon.mint { background: #e3fbf1; color: #2ebc8c; }
        .feature-card h3 { font-size: 12px; font-weight: 1000; margin: 1px 0 4px; }
        .feature-card p { font-size: 10px; color: #9690a4; line-height: 1.5; margin: 0; }
        .footer { display: flex; align-items: center; justify-content: center; gap: 7px; flex-wrap: wrap; color: #a49daf; font-size: 10px; margin-top: 40px; padding: 20px 0; border-top: 1px solid #ebe7f1; }
        .footer span { width: 100%; text-align: center; font-size: 9px; }
        @keyframes float { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
        @media (max-width: 1050px) {
          .sidebar { width: 215px; min-width: 215px; }
          .main-area { padding: 28px 25px; }
          .stats-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
        }
        @media (max-width: 760px) {
          .memore-shell { display: block; padding-bottom: 20px; }
          .sidebar { width: 100%; min-width: 0; min-height: auto; height: auto; position: relative; padding: 15px 16px; border-right: 0; border-bottom: 1px solid #eeeaf5; }
          .brand { margin: 0; font-size: 21px; }
          .sidebar-label, .side-menu, .sidebar-promo, .sidebar-user { display: none; }
          .main-area { padding: 24px 16px; }
          .topbar { align-items: flex-start; }
          .topbar h1 { font-size: 25px; }
          .topbar-badge { font-size: 9px; padding: 8px 10px; }
          .welcome-banner { padding: 25px 22px; min-height: 255px; }
          .banner-content { max-width: 65%; }
          .banner-content h2 { font-size: 26px; }
          .banner-content p { font-size: 11px; }
          .banner-decoration { width: 45%; right: -5%; opacity: .9; }
          .banner-pet { font-size: 78px; }
          .banner-platform { width: 120px; }
          .orbit-one { width: 160px; height: 110px; }
          .orbit-two { width: 190px; height: 140px; }
          .stats-grid { gap: 10px; margin: 24px 0 30px; }
          .stat-card { padding: 13px; }
          .stat-value { font-size: 20px; }
          .pet-card { grid-template-columns: 1fr; }
          .pet-visual { min-height: 210px; }
          .pet-character { font-size: 90px; }
          .pet-details { padding: 22px; }
          .mission-grid { grid-template-columns: 1fr; }
          .mission-card { min-height: auto; }
          .features-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .section-heading h2 { font-size: 19px; }
        }
        @media (max-width: 390px) {
          .features-grid { grid-template-columns: 1fr; }
          .topbar-badge { display: none; }
          .banner-content { max-width: 72%; }
          .banner-decoration { right: -13%; }
        }
      `}</style>
    </main>
  );
}

function StatCard({
  icon, label, value, detail, color, percent
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  color: string;
  percent: number;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
      <div className="stat-line">
        <div
          style={{
            width: `${Math.max(0, Math.min(100, percent))}%`,
            background: color === "yellow" ? "#f2c34c" :
              color === "purple" ? "#9874ff" :
              color === "pink" ? "#f27eae" : "#57d5a9"
          }}
        />
      </div>
    </article>
  );
}

function MissionCard({
  icon, title, description, color, reward
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  reward: string;
}) {
  return (
    <article className="mission-card">
      <div className={`mission-icon ${color}`}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="mission-reward">✦ {reward} • EM BREVE</div>
    </article>
  );
}

function FeatureCard({
  id, icon, title, description, color
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <article className="feature-card" id={id}>
      <div className={`feature-icon ${color}`}>{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
