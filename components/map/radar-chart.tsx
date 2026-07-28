interface RadarChartProps {
  eixos: { nome: string; nomeCurto: string; percentual: number }[];
  size?: number;
}

/**
 * Gráfico radar (heptágono) dos 7 eixos do IDT-LGBT, em SVG puro.
 * Valores esperados em percentual (0–100).
 */
export function RadarChart({ eixos, size = 260 }: RadarChartProps) {
  const centro = size / 2;
  const labelOffset = 30;
  const raio = centro - labelOffset;
  const total = eixos.length; // 7

  const angulo = (i: number) => (i * 2 * Math.PI) / total - Math.PI / 2;
  const ponto = (i: number, proporcao: number) => {
    const a = angulo(i);
    return {
      x: centro + Math.cos(a) * raio * proporcao,
      y: centro + Math.sin(a) * raio * proporcao,
    };
  };
  const paraString = (pontos: { x: number; y: number }[]) =>
    pontos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const aneis = [0.25, 0.5, 0.75, 1];
  const poligonoDados = paraString(
    eixos.map((eixo, i) => ponto(i, Math.max(0, Math.min(100, eixo.percentual)) / 100))
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Radar dos eixos do IDT-LGBT"
      className="mx-auto"
    >
      {/* Anéis de referência */}
      {aneis.map((proporcao) => (
        <polygon
          key={proporcao}
          points={paraString(eixos.map((_, i) => ponto(i, proporcao)))}
          fill={proporcao === 1 ? "rgb(148 163 184 / 0.08)" : "none"}
          stroke="rgb(148 163 184 / 0.35)"
          strokeWidth={1}
        />
      ))}

      {/* Eixos */}
      {eixos.map((_, i) => {
        const p = ponto(i, 1);
        return (
          <line
            key={i}
            x1={centro}
            y1={centro}
            x2={p.x}
            y2={p.y}
            stroke="rgb(148 163 184 / 0.3)"
            strokeWidth={1}
          />
        );
      })}

      {/* Polígono de dados */}
      <polygon
        points={poligonoDados}
        fill="rgb(150 200 242 / 0.35)"
        stroke="#8fe5d0"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {eixos.map((eixo, i) => {
        const p = ponto(i, Math.max(0, Math.min(100, eixo.percentual)) / 100);
        return <circle key={`ponto-${i}`} cx={p.x} cy={p.y} r={3.5} fill="#f7a1c2" />;
      })}

      {/* Rótulos */}
      {eixos.map((eixo, i) => {
        const a = angulo(i);
        const p = ponto(i, 1);
        const x = centro + Math.cos(a) * (raio + 16);
        const y = centro + Math.sin(a) * (raio + 14);
        const anchor =
          Math.abs(p.x - centro) < raio * 0.35
            ? "middle"
            : p.x > centro
              ? "start"
              : "end";
        return (
          <text
            key={eixo.nome}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-[#64748b]"
            fontSize={10}
            fontWeight={700}
          >
            {eixo.nomeCurto}
          </text>
        );
      })}
    </svg>
  );
}
