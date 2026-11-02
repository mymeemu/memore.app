
type MemorePetProps = {
  name?: string;
  level?: number;
  energy?: number;
  evolutionPath?: string;
};

export default function MemorePet({
  name = "Memorex",
  level = 1,
  energy = 30,
  evolutionPath = "balanced",
}: MemorePetProps) {
  const mood =
    energy >= 20 ? "happy" :
    energy >= 10 ? "sleepy" : "tired";

  const evolution =
    level >= 10 ? "master" :
    level >= 5 ? "growing" : "baby";

  const moodLabel =
    mood === "happy" ? "Estou radiante!" :
    mood === "sleepy" ? "Preciso descansar..." :
    "Estou sem energia...";

  return (
    <div className={`memore-pet mood-${mood} evolution-${evolution}`}>
      <style>{`
        .memore-pet {
          width: 100%;
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .memore-pet .pet-aura {
          position: absolute;
          width: 175px;
          height: 175px;
          border-radius: 50%;
          background: radial-gradient(circle, #ffe78d 0%, #ffe78d55 48%, transparent 72%);
          z-index: -1;
          animation: memoreAura 3s ease-in-out infinite;
        }

        .memore-pet .pet-svg {
          width: 190px;
          max-width: 75%;
          overflow: visible;
          animation: memoreBounce 3s ease-in-out infinite;
          filter: drop-shadow(0 10px 5px #55402a20);
        }

        .memore-pet .pet-shadow {
          width: 100px;
          height: 15px;
          border-radius: 50%;
          background: #705b8530;
          margin-top: -4px;
          animation: memoreShadow 3s ease-in-out infinite;
        }

        .memore-pet .pet-face {
          transform-origin: center;
        }

        .memore-pet .pet-eyes {
          transition: opacity .2s ease;
        }

        .memore-pet.mood-sleepy .pet-eyes,
        .memore-pet.mood-tired .pet-eyes {
          opacity: 0;
        }

        .memore-pet .sleep-eyes {
          opacity: 0;
        }

        .memore-pet.mood-sleepy .sleep-eyes,
        .memore-pet.mood-tired .sleep-eyes {
          opacity: 1;
        }

        .memore-pet .pet-mouth {
          transition: all .2s ease;
        }

        .memore-pet .pet-name {
          margin-top: 10px;
          color: #59476f;
          font-size: 15px;
          font-weight: 1000;
        }

        .memore-pet .pet-mood {
          margin-top: 3px;
          color: #a18caf;
          font-size: 10px;
          font-weight: 800;
        }

        .memore-pet .pet-crown {
          opacity: 0;
          transform-origin: center;
        }

        .memore-pet.evolution-growing .pet-crown,
        .memore-pet.evolution-master .pet-crown {
          opacity: 1;
        }

        .memore-pet.evolution-master .pet-aura {
          background: radial-gradient(circle, #b8a0ff 0%, #b8a0ff55 48%, transparent 72%);
        }

        .memore-pet.evolution-master .pet-svg {
          filter: drop-shadow(0 10px 8px #8257ff45);
        }

        .memore-pet .pet-sparkle {
          position: absolute;
          color: #ffc84d;
          font-size: 19px;
          animation: memoreSparkle 2.5s ease-in-out infinite;
        }

        .memore-pet .sparkle-one { left: 17%; top: 25%; }
        .memore-pet .sparkle-two { right: 17%; top: 34%; animation-delay: .8s; }

        @keyframes memoreBounce {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-9px) rotate(2deg); }
        }

        @keyframes memoreShadow {
          0%, 100% { transform: scaleX(1); opacity: .8; }
          50% { transform: scaleX(.75); opacity: .4; }
        }

        @keyframes memoreAura {
          0%, 100% { transform: scale(.92); opacity: .7; }
          50% { transform: scale(1.12); opacity: 1; }
        }

        @keyframes memoreSparkle {
          0%, 100% { transform: scale(.7) rotate(0); opacity: .45; }
          50% { transform: scale(1.2) rotate(25deg); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .memore-pet * { animation: none !important; }
        }
      `}</style>

      <div className="pet-aura" />
      <span className="pet-sparkle sparkle-one">✦</span>
      <span className="pet-sparkle sparkle-two">✧</span>

      <svg
        className="pet-svg"
        viewBox="0 0 240 240"
        role="img"
        aria-label={`Mascote ${name}, nível ${level}`}
      >
        <defs>
          <linearGradient id="chickBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE879" />
            <stop offset="100%" stopColor="#FFB928" />
          </linearGradient>
          <linearGradient id="eggShell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E8E1F2" />
          </linearGradient>
          <linearGradient id="eggInside" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9C9F0" />
            <stop offset="100%" stopColor="#BDA6DF" />
          </linearGradient>
        </defs>

        {/* Corpo do pintinho */}
        <ellipse cx="120" cy="143" rx="58" ry="63" fill="url(#chickBody)" />
        <ellipse cx="120" cy="155" rx="34" ry="39" fill="#FFF0A9" opacity=".65" />

        {/* Penugem do topo */}
        <path d="M105 83 Q91 56 108 61 Q117 63 119 77 Q130 49 140 61 Q148 73 132 88"
          fill="#FFD94E" stroke="#E9A91F" strokeWidth="3" strokeLinecap="round" />

        {/* Asas */}
        <path d="M66 132 Q38 122 48 151 Q56 169 78 162"
          fill="#FFD14B" stroke="#E6A421" strokeWidth="3" />
        <path d="M174 132 Q202 122 192 151 Q184 169 162 162"
          fill="#FFD14B" stroke="#E6A421" strokeWidth="3" />

        {/* Rosto */}
        <g className="pet-face">
          <g className="pet-eyes">
            <ellipse cx="101" cy="126" rx="6" ry="9" fill="#44334D" />
            <ellipse cx="139" cy="126" rx="6" ry="9" fill="#44334D" />
            <circle cx="103" cy="123" r="2.5" fill="white" />
            <circle cx="141" cy="123" r="2.5" fill="white" />
          </g>

          <g className="sleep-eyes" stroke="#59445A" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M94 128 Q101 134 108 128" />
            <path d="M132 128 Q139 134 146 128" />
          </g>

          <ellipse cx="88" cy="143" rx="8" ry="5" fill="#FF9B85" opacity=".65" />
          <ellipse cx="152" cy="143" rx="8" ry="5" fill="#FF9B85" opacity=".65" />

          <path className="pet-mouth" d="M112 140 Q120 150 128 140 Q120 157 112 140"
            fill="#F28B36" stroke="#D87528" strokeWidth="1.5" />
        </g>

        {/* Casca quebrada */}
        <path d="M65 165 L77 157 L88 166 L101 156 L115 166 L128 155 L142 166 L155 157 L168 166 L181 159 L188 179 Q181 207 153 211 L87 211 Q59 203 53 180 Z"
          fill="url(#eggShell)" stroke="#D8CDE5" strokeWidth="3" strokeLinejoin="round" />

        <path d="M65 165 L77 157 L88 166 L101 156 L115 166 L128 155 L142 166 L155 157 L168 166 L181 159"
          fill="none" stroke="url(#eggInside)" strokeWidth="7" strokeLinecap="round" />

        {/* Textura da casca */}
        <path d="M76 185 Q86 179 95 188 M145 188 Q156 179 166 185"
          stroke="#D8CDE5" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Patinhas */}
        <path d="M101 207 L99 218 M99 218 L90 221 M99 218 L107 221"
          stroke="#EF963A" strokeWidth="5" strokeLinecap="round" />
        <path d="M139 207 L141 218 M141 218 L133 221 M141 218 L150 221"
          stroke="#EF963A" strokeWidth="5" strokeLinecap="round" />

        {/* Coroa de evolução */}
        <g className="pet-crown">
          <path d="M99 75 L105 57 L119 69 L135 54 L141 77 Z"
            fill="#FFD84D" stroke="#E9A91F" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="120" cy="63" r="4" fill="#FF8DBB" />
        </g>

        {/* Brilho especial do mestre */}
        {evolution === "master" && (
          <circle cx="120" cy="135" r="77" fill="none"
            stroke="#A88BFF" strokeWidth="2" strokeDasharray="5 9" />
        )}
      </svg>

      <div className="pet-shadow" />
      <div className="pet-name">{name} · Nv. {level}</div>
      <div className="pet-mood">{moodLabel}</div>
    </div>
  );
}
