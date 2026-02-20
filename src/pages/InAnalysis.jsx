import { useMemo, useState } from "react";
import "../css/InAnalysis.css";

export default function InAnalysis() {
  const [activeTab, setActiveTab] = useState("summary");
  const data = useMemo(() => mockReport(), []);
  const [openQ, setOpenQ] = useState(0);

  return (
    <div className="iaPage iaNoScroll">
      <main className="iaMain iaMainFixed">
        <header className="iaTop">
          <h1 className="iaTopTitle">면접 결과</h1>
          <div className="iaTopActions">
            <button
              className="iaBtn"
              type="button"
              onClick={() => alert("PDF(더미)")}
            >
              PDF로 결과 확인하기
            </button>
          </div>
        </header>

        <nav className="iaTabs" aria-label="결과 탭">
          <TabBtn
            label="요약"
            active={activeTab === "summary"}
            onClick={() => setActiveTab("summary")}
          />
          <TabBtn
            label="문서 분석"
            active={activeTab === "docs"}
            onClick={() => setActiveTab("docs")}
          />
          <TabBtn
            label="면접 분석"
            active={activeTab === "interview"}
            onClick={() => setActiveTab("interview")}
          />
          <TabBtn
            label="분포/비교"
            active={activeTab === "compare"}
            onClick={() => setActiveTab("compare")}
          />
          <TabBtn
            label="역량/액션"
            active={activeTab === "capability"}
            onClick={() => setActiveTab("capability")}
          />
        </nav>

        <section className="iaCard iaPanel">
          <HeaderMeta data={data} />

          <div className="iaPanelBody">
            {activeTab === "summary" && <SummaryPanel data={data} />}
            {activeTab === "docs" && <DocsPanel data={data} />}
            {activeTab === "interview" && (
              <InterviewPanel data={data} openQ={openQ} setOpenQ={setOpenQ} />
            )}
            {activeTab === "compare" && <ComparePanel data={data} />}
            {activeTab === "capability" && <CapabilityPanel data={data} />}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------------- Common UI ---------------- */

function TabBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`iaTab ${active ? "on" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div className="iaSectionRow">
      <h2 className="iaSectionH2">{title}</h2>
      <div className="iaSectionSub">{sub}</div>
    </div>
  );
}

function HeaderMeta({ data }) {
  return (
    <div className="iaHeaderCard compact">
      <div className="iaHeaderLeft">
        <div className="iaName">{data.user.name}</div>
        <div className="iaMeta">
          <span>지원직무: {data.user.job}</span>
          <span className="dot">·</span>
          <span>지원회사: {data.user.company}</span>
          <span className="dot">·</span>
          <span>면접일: {data.user.date}</span>
        </div>
      </div>

      <div className="iaHeaderRight compact">
        <MiniInfo icon="🧩" label="직무군" value={data.user.jobGroup} />
        <MiniInfo icon="📒" label="자소서" value={data.user.docsCoverLetter} />
        <MiniInfo icon="🧾" label="이력서" value={data.user.docsResume} />
        <MiniInfo
          icon="🗂️"
          label="포트폴리오"
          value={data.user.docsPortfolio}
        />
        <MiniInfo icon="✅" label="상태" value={data.user.status} />
      </div>
    </div>
  );
}

function MiniInfo({ icon, label, value }) {
  return (
    <div className="iaMiniInfo compact">
      <div className="iaMiniIcon">{icon}</div>
      <div className="iaMiniLabel">{label}</div>
      <div className="iaMiniValue">{value}</div>
    </div>
  );
}

function calcGrade(score) {
  if (score >= 85) return { label: "최우수" };
  if (score >= 70) return { label: "우수" };
  if (score >= 55) return { label: "보통" };
  return { label: "미흡" };
}

/* ---------------- Summary ---------------- */

function SummaryPanel({ data }) {
  return (
    <>
      <SectionTitle title="요약" sub="종합/문서/면접 핵심 점수 + 주요 지표" />

      <div className="iaKpiStrip">
        <KpiCard
          title="종합 점수"
          score={data.scores.overall}
          meta={`백분위 ${data.scores.percentile}% · 상위 ${data.scores.topRate}%`}
        />
        <KpiCard
          title="문서 분석"
          score={data.scores.docs}
          meta="자소서·이력서·포트폴리오 기반"
        />
        <KpiCard
          title="면접 분석"
          score={data.scores.interview}
          meta="STT 기반 답변 분석"
        />
      </div>

      <div className="iaSummaryGrid">
        <div className="iaBox iaBoxTight center">
          <div className="iaBoxTitle">면접 총 응시시간</div>
          <RingTime minutes={data.summary.totalTimeMin} />
        </div>

        <div className="iaBox iaBoxTight">
          <div className="iaBoxTitle">문항/속도</div>
          <BarMeter value={data.summary.questionCount} max={12} suffix="개" />
          <div className="iaHint">
            문항별 평균 답변시간 {data.summary.avgAnswerSec}초
          </div>
          <div className="iaKpis">
            <Kpi label="평균 발화 속도" value={`${data.summary.wpm} wpm`} />
            <Kpi
              label="문항별 평균 어절"
              value={`${data.summary.avgTokens}개`}
            />
          </div>
        </div>

        <div className="iaBox iaBoxTight">
          <div className="iaBoxTitle">자주 언급한 단어 TOP3</div>
          <div className="iaChips">
            {data.summary.topWords.map((w) => (
              <span className="iaChip" key={w}>
                {w}
              </span>
            ))}
          </div>
          <div className="iaHint">
            면접 답변에는 직무 키워드(React/상태관리/성능)를 더 명시해도
            좋습니다.
          </div>
        </div>
      </div>

      <div className="iaBox iaBoxTight" style={{ marginTop: 12 }}>
        <div className="iaBoxTitle">한줄 결론</div>
        <div className="iaHint" style={{ marginTop: 6 }}>
          {data.summaryConclusion}
        </div>

        <div className="iaBoxTitle" style={{ marginTop: 12 }}>
          가장 우선 개선 3가지
        </div>
        <ul className="iaActionList compact">
          {data.priorityActions.map((t, i) => (
            <li key={i}>
              <span className="iaActionNo">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function KpiCard({ title, score, meta }) {
  const grade = calcGrade(score);
  return (
    <div className="iaKpiCard">
      <div className="iaKpiTop">
        <div className="iaKpiTitle">{title}</div>
        <div className="iaGradePill">{grade.label}</div>
      </div>
      <div className="iaKpiScore">{score}</div>
      <div className="iaKpiMeta">{meta}</div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="iaKpi">
      <div className="iaKpiLabel">{label}</div>
      <div className="iaKpiValue">{value}</div>
    </div>
  );
}

/* ---------------- Docs ---------------- */

function DocsPanel({ data }) {
  return (
    <>
      <SectionTitle
        title="문서 분석"
        sub="자소서 · 이력서 · 포트폴리오 점수 및 피드백"
      />

      <div className="iaDocGrid">
        {(data.docs?.items ?? []).map((d) => (
          <div className="iaBox iaBoxTight" key={d.type}>
            <div className="iaDocTop">
              <div className="iaDocTitle">{d.type}</div>
              <div className="iaDocScore">{d.score}</div>
            </div>

            <div className="iaHint" style={{ marginTop: 6 }}>
              {d.summary}
            </div>

            <div className="iaDocCols">
              <div>
                <div className="iaBoxTitle">강점</div>
                <ul className="iaBullet">
                  {(d.strengths ?? []).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="iaBoxTitle">보완</div>
                <ul className="iaBullet">
                  {(d.improvements ?? []).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="iaBoxTitle" style={{ marginTop: 10 }}>
              키워드
            </div>
            <div className="iaChips">
              {(d.keywords ?? []).map((k) => (
                <span className="iaChip" key={k}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Interview ---------------- */

function InterviewPanel({ data, openQ, setOpenQ }) {
  return (
    <>
      <SectionTitle title="면접 분석" sub="질문별 상세 + 피드백 + 개선 예시" />

      <div className="iaBox iaBoxTight">
        <div className="iaBoxTitle">면접 텍스트 지표</div>
        <div className="iaKpis" style={{ marginTop: 8 }}>
          <Kpi label="총 답변 어절" value={`${data.summary.totalTokens}개`} />
          <Kpi label="문항 수" value={`${data.summary.questionCount}개`} />
          <Kpi
            label="평균 답변 시간"
            value={`${data.summary.avgAnswerSec}초`}
          />
        </div>
        <div className="iaHint" style={{ marginTop: 8 }}>
          단순 길이보다 “결론→근거→성과(수치)” 형태로 구조를 고정하는 게 점수
          상승에 유리합니다.
        </div>
      </div>

      <div className="iaQList" style={{ marginTop: 12 }}>
        {data.questions.map((q, idx) => {
          const open = openQ === idx;
          return (
            <div className={`iaQItem ${open ? "open" : ""}`} key={q.id}>
              <button
                className="iaQHead"
                type="button"
                onClick={() => setOpenQ(open ? -1 : idx)}
              >
                <div className="iaQHeadLeft">
                  <div className="iaQNo">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="iaQTitle">{q.question}</div>
                    <div className="iaQMeta">
                      점수 {q.score} · 키워드 {q.keywords.join(", ")}
                    </div>
                  </div>
                </div>
                <div className="iaQToggle">{open ? "−" : "+"}</div>
              </button>

              {open && (
                <div className="iaQBody">
                  <div className="iaQBGrid">
                    <div className="iaQBCard">
                      <div className="iaBoxTitle">내 답변(요약)</div>
                      <p className="iaText">{q.answer}</p>
                    </div>
                    <div className="iaQBCard">
                      <div className="iaBoxTitle">피드백</div>
                      <ul className="iaBullet">
                        {q.feedback.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="iaBoxTitle" style={{ marginTop: 12 }}>
                    개선된 답변 구조 예시
                  </div>
                  <div className="iaTemplate">
                    <div>
                      <b>결론</b> — {q.template.conclusion}
                    </div>
                    <div>
                      <b>근거</b> — {q.template.evidence}
                    </div>
                    <div>
                      <b>마무리</b> — {q.template.close}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Compare ---------------- */

function ComparePanel({ data }) {
  const history = data?.overall?.scoreHistory ?? data?.scoreHistory ?? [];

  return (
    <>
      <SectionTitle
        title="분포/비교"
        sub="점수 분포(비교군 포함) + 역량 레이더 비교"
      />

      <div className="iaOverallGrid">
        {/* 좌측 박스 */}
        <div className="iaBox iaBoxTight">
          <div className="iaBoxTitle">응시자 점수 분포 및 내 위치</div>

          <LineDistribution
            values={data.overall.distribution}
            peerValues={data.overall.peerDistribution}
            myScore={data.overall.score}
          />

          <div className="iaLegend">
            <span className="iaDot me" /> 내 점수
            <span className="iaDot line" /> 전체 분포
            <span className="iaDot peer" /> 비교군 평균
          </div>

          {/* 여기부터 추가 */}
          <div className="iaDivider" />

          <div className="iaBoxTitle">내 이전 면접 점수 추이</div>

          <ScoreHistoryChart
            history={history}
            currentScore={data.overall.score}
          />
        </div>

        {/* 우측 박스 */}
        <div className="iaBox iaBoxTight">
          <div className="iaBoxTitle">역량 레이더(비교군)</div>
          <Radar
            labels={data.radar.labels}
            values={data.radar.values}
            peerValues={data.radar.peerValues}
            max={100}
          />
          <div className="iaLegend" style={{ marginTop: 10 }}>
            <span className="iaDot line" /> 내 역량
            <span className="iaDot peer" /> 비교군 평균
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Capability ---------------- */

function CapabilityPanel({ data }) {
  const labels = data?.radar?.labels ?? [];
  const values = data?.radar?.values ?? [];
  const peerValues = data?.radar?.peerValues ?? [];

  return (
    <>
      <SectionTitle title="역량/액션" sub="항목별 코멘트 + 항목별 개선 액션" />

      <div className="iaTwinGrid">
        <div className="iaBox iaBoxTight">
          <div className="iaBoxTitle">역량 레이더</div>
          <Radar
            labels={labels}
            values={values}
            peerValues={peerValues}
            max={100}
          />

          <div className="iaLegend" style={{ marginTop: 10 }}>
            <span className="iaDot line" /> 내 역량
            <span className="iaDot peer" /> 비교군 평균
          </div>
        </div>

        <div className="iaBox iaBoxTight">
          <div className="iaBoxTitle">항목별 개선 액션</div>

          <div className="iaActionByComp">
            {labels.map((label) => (
              <div className="iaActionGroup" key={label}>
                <div className="iaActionGroupTitle">{label}</div>

                <div className="iaCompComment">
                  <div className="good">
                    👍 {data?.commentsByCompetency?.[label]?.good ?? "—"}
                  </div>
                  <div className="bad">
                    ⚠️ {data?.commentsByCompetency?.[label]?.bad ?? "—"}
                  </div>
                </div>

                <ul className="iaActionList compact">
                  {(data?.actionsByCompetency?.[label] ?? ["(액션 없음)"]).map(
                    (t, i) => (
                      <li key={i}>
                        <span className="iaActionNo">{i + 1}</span>
                        <span>{t}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>

          {labels.length === 0 && (
            <div className="iaHint" style={{ marginTop: 10 }}>
              radar.labels가 비어있습니다. mockReport()의 radar.labels를
              확인하세요.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------------- Charts ---------------- */

function RingTime({ minutes }) {
  const max = 15;
  const pct = Math.max(0, Math.min(1, minutes / max));
  const r = 46;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div className="iaRing big">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className="iaRingBg" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="iaRingFg"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="iaRingCenter">
        <div className="iaRingValue">{minutes}분</div>
        <div className="iaRingLabel">총 시간</div>
      </div>
    </div>
  );
}

function BarMeter({ value, max, suffix }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div>
      <div className="iaBar">
        <div className="iaBarFill" style={{ width: `${pct}%` }} />
      </div>
      <div className="iaBarText">
        <b>{value}</b>
        {suffix}{" "}
        <span className="iaMuted">
          / {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function LineDistribution({ values, peerValues, myScore }) {
  const w = 420;
  const h = 170;
  const pad = 16;
  const maxY = 100;

  const toPts = (arr) =>
    arr.map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (arr.length - 1);
      const y = pad + ((maxY - v) * (h - pad * 2)) / 100;
      return [x, y];
    });

  const toPath = (pts) =>
    pts
      .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
      .join(" ");

  const ptsMain = toPts(values);
  const dMain = toPath(ptsMain);

  const ptsPeer = peerValues ? toPts(peerValues) : null;
  const dPeer = ptsPeer ? toPath(ptsPeer) : null;

  const xMy = pad + (myScore * (w - pad * 2)) / 100;
  const yMy = pad + ((maxY - 55) * (h - pad * 2)) / 100;

  return (
    <div className="iaChart">
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="점수 분포 그래프"
      >
        <g className="iaGrid">
          {[0, 25, 50, 75, 100].map((t) => {
            const y = pad + ((maxY - t) * (h - pad * 2)) / 100;
            return <line key={t} x1={pad} x2={w - pad} y1={y} y2={y} />;
          })}
        </g>

        {dPeer && <path d={dPeer} className="iaLine peer" />}
        <path d={dMain} className="iaLine main" />

        <line x1={xMy} x2={xMy} y1={pad} y2={h - pad} className="iaMyLine" />
        <circle cx={xMy} cy={yMy} r="5" className="iaMyDot" />

        <rect
          x={Math.min(w - 90, Math.max(0, xMy - 34))}
          y={pad + 6}
          width="78"
          height="22"
          rx="8"
          className="iaTag"
        />
        <text
          x={Math.min(w - 52, Math.max(20, xMy + 4))}
          y={pad + 22}
          className="iaTagText"
        >
          내 점수 {myScore}
        </text>
      </svg>
    </div>
  );
}
function ScoreHistoryChart({ history, currentScore }) {
  const base = Array.isArray(history) ? history : [];

  const withCurrent =
    base.length === 0 ? [{ date: "이번", score: currentScore }] : base;

  const n = withCurrent.length;

  const w = 420; // 분포 그래프와 동일 폭
  const h = 120; // 박스 내부용 컴팩트 높이
  const pad = 16;
  const maxY = 100;

  const toPt = (i, score) => {
    const x = n === 1 ? w / 2 : pad + (i * (w - pad * 2)) / (n - 1);
    const y = pad + ((maxY - score) * (h - pad * 2)) / maxY;
    return [x, y];
  };

  const pts = withCurrent.map((d, i) => toPt(i, d.score));

  const dPath = pts
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");

  return (
    <div className="iaChartMini">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
        {n >= 2 && <path d={dPath} className="iaLine history" />}

        {pts.map(([x, y], i) => {
          const isLast = i === pts.length - 1;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isLast ? 5 : 4}
                className={isLast ? "iaHistoryDot last" : "iaHistoryDot"}
              />
              <text
                x={x}
                y={h - 4}
                className="iaHistoryTick"
                textAnchor="middle"
              >
                {withCurrent[i].date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Radar({ labels, values, peerValues, max }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;

  const n = labels.length;
  const angle0 = -Math.PI / 2;

  const toXY = (i, val, radius) => {
    const ang = angle0 + (2 * Math.PI * i) / n;
    const rr = (val / max) * radius;
    return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
  };

  const poly = values
    .map((v, i) => {
      const [x, y] = toXY(i, v, r);
      return `${x},${y}`;
    })
    .join(" ");

  const peerPoly = peerValues
    ? peerValues
        .map((v, i) => {
          const [x, y] = toXY(i, v, r);
          return `${x},${y}`;
        })
        .join(" ")
    : null;

  return (
    <div className="iaRadar">
      <svg
        width="100%"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="역량 레이더 차트"
      >
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <polygon
            key={k}
            className="iaRadarRing"
            points={Array.from({ length: n })
              .map((_, i) => {
                const [x, y] = toXY(i, max * k, r);
                return `${x},${y}`;
              })
              .join(" ")}
          />
        ))}

        {labels.map((lab, i) => {
          const [x, y] = toXY(i, max, r);
          return (
            <g key={lab}>
              <line x1={cx} y1={cy} x2={x} y2={y} className="iaRadarAxis" />
              <text
                x={x}
                y={y}
                className="iaRadarLabel"
                textAnchor={x < cx ? "end" : x > cx ? "start" : "middle"}
                dominantBaseline={y < cy ? "ideographic" : "hanging"}
              >
                {lab}
              </text>
            </g>
          );
        })}

        {peerPoly && (
          <>
            <polygon points={peerPoly} className="iaRadarPeerPoly" />
            <polygon points={peerPoly} className="iaRadarPeerFill" />
          </>
        )}

        <polygon points={poly} className="iaRadarPoly" />
        <polygon points={poly} className="iaRadarFill" />
      </svg>
    </div>
  );
}

/* ---------------- Mock ---------------- */

function mockReport() {
  return {
    user: {
      name: "홍길동",
      job: "프론트엔드(React)",
      company: "CareerTalk",
      date: "2026-02-15",
      jobGroup: "IT/개발",
      docsCoverLetter: "업로드 완료",
      docsResume: "업로드 완료",
      docsPortfolio: "업로드 완료",
      status: "완료",
    },

    scores: {
      overall: 74,
      docs: 71,
      interview: 76,
      percentile: 72,
      topRate: 30,
    },

    summary: {
      totalTimeMin: 8,
      questionCount: 10,
      avgAnswerSec: 47,
      topWords: ["협업", "도전", "기획"],
      totalTokens: 668,
      avgTokens: 66,
      wpm: 253,
    },

    summaryConclusion:
      "문서 분석은 키워드 매칭이 양호하지만 성과·수치 근거가 부족합니다. 면접 답변은 논리 흐름은 안정적이나 구체성 보완 시 점수 상승 여지가 큽니다.",

    priorityActions: [
      "각 답변을 ‘결론 → 근거 → 수치/역할 → 마무리’로 고정하기",
      "문서/면접 모두에서 성과를 수치(%, ms, 건수)로 표현하기",
      "직무 키워드(React, 상태관리, 성능) 1~2개를 매 답변에 명시하기",
    ],

    docs: {
      items: [
        {
          type: "자소서",
          score: 73,
          summary: "경험-성과 구조는 좋으나 수치 근거가 부족합니다.",
          strengths: ["직무 연관 경험 제시", "흐름(도입-전개-마무리) 안정"],
          improvements: ["성과를 수치로 보강", "기여도(역할) 명확화"],
          keywords: ["React", "협업", "성능"],
        },
        {
          type: "이력서",
          score: 69,
          summary: "기술스택은 적절하나 프로젝트 임팩트 표현이 약합니다.",
          strengths: ["기술 스택 명확", "프로젝트 경험 존재"],
          improvements: [
            "성과/지표 중심 문장 재구성",
            "핵심 프로젝트 2개로 압축",
          ],
          keywords: ["Spring", "MyBatis", "AWS"],
        },
        {
          type: "포트폴리오",
          score: 72,
          summary: "구현 설명은 좋으나 문제-해결-결과 흐름이 더 필요합니다.",
          strengths: ["기능 설명 구체적", "기술 선택 근거 존재"],
          improvements: ["Before/After 비교 추가", "트러블슈팅 섹션 강화"],
          keywords: ["Vite", "Redux", "Nginx"],
        },
      ],
    },

    overall: {
      score: 74,
      percentile: 72,
      topRate: 30,
      distribution: [6, 10, 18, 28, 40, 55, 66, 72, 68, 54, 38],
      peerDistribution: [4, 8, 14, 22, 33, 48, 60, 66, 63, 50, 36],
      scoreHistory: [
        { date: "2025-12-20", score: 61 },
        { date: "2026-01-05", score: 66 },
        { date: "2026-01-22", score: 70 },
        { date: "2026-02-15", score: 74 },
      ],
    },

    radar: {
      labels: ["명료도", "논리성", "직무적합", "구체성", "자신감", "일관성"],
      values: [78, 72, 70, 64, 74, 69],
      peerValues: [70, 68, 66, 60, 69, 64],
    },
    scoreHistory: [
      { date: "2025-12-20", score: 61 },
      { date: "2026-01-05", score: 66 },
      { date: "2026-01-22", score: 70 },
      { date: "2026-02-15", score: 74 },
    ],
    commentsByCompetency: {
      명료도: {
        good: "핵심 문장이 먼저 나옴",
        bad: "문장이 길어질 때 호흡이 끊김",
      },
      논리성: { good: "근거 제시가 빠름", bad: "예시가 짧아 설득력 약함" },
      직무적합: {
        good: "키워드 매칭 양호",
        bad: "기술 디테일(성능/상태) 언급 부족",
      },
      구체성: { good: "사례 선택은 적절", bad: "수치/역할/성과가 빠짐" },
      자신감: { good: "속도 안정", bad: "마무리 문장이 추상적" },
      일관성: {
        good: "메시지 반복이 있음",
        bad: "주체 표현이 ‘우리’로 흐려짐",
      },
    },

    actionsByCompetency: {
      명료도: [
        "답변 첫 문장은 결론 한 줄로 고정하기",
        "한 문장 길이를 20~25자 수준으로 분할하기",
      ],
      논리성: [
        "결론 → 근거 → 예시 순서를 모든 문항에 적용하기",
        "근거는 2개 이내로 제한하고 우선순위 붙이기",
      ],
      직무적합: [
        "React/상태관리/성능 키워드 1~2개를 매 답변에 명시하기",
        "프로젝트 역할을 ‘내가 한 일’로 분리해 말하기",
      ],
      구체성: [
        "성과는 수치(%, ms, 건수)로 표현하기",
        "기여도를 ‘범위/기간/역할/결과’로 쪼개기",
      ],
      자신감: [
        "말끝을 흐리는 표현(아마/같습니다)을 줄이기",
        "호흡 지점(쉼표)을 미리 넣고 끊어 말하기",
      ],
      일관성: [
        "자기소개/지원동기에서 동일 핵심 메시지 1개 반복",
        "경험 사례를 2개만 고정하고 모든 질문에 재사용하기",
      ],
    },

    questions: [
      {
        id: 1,
        question: "자기소개를 1분 내로 해주세요.",
        score: 72,
        keywords: ["요약", "강점", "직무"],
        answer:
          "React 기반 프로젝트 경험을 중심으로, 사용자 경험 개선과 협업을 강조했습니다.",
        feedback: [
          "결론은 좋지만 ‘성과(수치)’가 비어 있습니다.",
          "직무 키워드(React, 상태관리, 성능) 명시를 추천합니다.",
        ],
        template: {
          conclusion:
            "React 기반 웹 프로젝트를 주도하며 사용자 경험을 개선한 지원자입니다.",
          evidence:
            "상태관리/라우팅을 설계하고 성능 개선을 통해 체감 지연을 줄였습니다(수치 삽입).",
          close:
            "실무에서도 문제를 구조화해 끝까지 해결하는 방식으로 기여하겠습니다.",
        },
      },
      {
        id: 2,
        question: "협업 중 갈등이 있었던 경험을 말해보세요.",
        score: 78,
        keywords: ["소통", "조율", "합의"],
        answer:
          "요구사항 충돌 시 기준을 문서화하고 우선순위를 합의해 해결했습니다.",
        feedback: [
          "갈등의 ‘원인’과 ‘전환점’을 한 문장으로 명확히 해보세요.",
          "합의 결과가 어떤 지표로 개선됐는지 덧붙이면 좋습니다.",
        ],
        template: {
          conclusion: "요구사항 충돌을 문서화+우선순위 합의로 해결했습니다.",
          evidence:
            "정의서/회의록으로 기준을 고정하고, 일정/리스크를 비교해 합의했습니다.",
          close:
            "이후 변경 요청이 줄고 개발 속도가 안정화되었습니다(정량/정성).",
        },
      },
      {
        id: 3,
        question: "지원한 직무를 선택한 이유는 무엇인가요?",
        score: 70,
        keywords: ["동기", "경험", "기여"],
        answer:
          "사용자 문제를 빠르게 검증하고 UI로 풀어내는 과정이 재밌어 선택했습니다.",
        feedback: [
          "‘재밌다’ 대신 ‘어떤 문제를 어떻게 풀었는지’로 구체화하세요.",
          "회사/직무 요구사항과 연결하면 설득력이 올라갑니다.",
        ],
        template: {
          conclusion:
            "사용자 문제를 데이터/피드백 기반으로 개선하는 과정에 강점이 있습니다.",
          evidence:
            "프로젝트에서 사용성 이슈를 발견하고 UI/상태 흐름을 개선했습니다.",
          close: "동일한 방식으로 제품 경험 개선에 기여하겠습니다.",
        },
      },
    ],
  };
}
