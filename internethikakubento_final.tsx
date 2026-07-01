import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Monitor,
  Home,
  Wifi,
  Cpu,
  Users,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Coins,
  Truck,
  Sparkles
} from 'lucide-react';

// 12ヶ月〜36ヶ月の「実質月額料金」マッピングデータベース
const REAL_PRICING_DATABASE = {
  12: 100, 13: 414, 14: 683, 15: 916, 16: 1120, 17: 1300, 18: 1460, 19: 1603, 
  20: 1732, 21: 1849, 22: 1955, 23: 2051, 24: 2140, 25: 2222, 26: 2297, 
  27: 2367, 28: 2431, 29: 2492, 30: 2548, 31: 2601, 32: 2650, 33: 2696, 
  34: 2740, 35: 2781, 36: 2820
};

const BROAD_WIMAX_DATABASE = {
  12: 626, 13: 946, 14: 1220, 15: 1458, 16: 1666, 17: 1849, 18: 2013, 19: 2158,
  20: 2290, 21: 2409, 22: 2517, 23: 2615, 24: 2706, 25: 2789, 26: 2866,
  27: 2937, 28: 3003, 29: 3064, 30: 3122, 31: 3175, 32: 3225, 33: 3273,
  34: 3317, 35: 3359, 36: 3399
};

const JCOM_DATABASE = {
  12: 3080, 13: 3317, 14: 3520, 15: 3696, 16: 3850, 17: 3986, 18: 4107, 19: 4215,
  20: 4312, 21: 4400, 22: 4480, 23: 4553, 24: 4620, 25: 4682, 26: 4738,
  27: 4791, 28: 4840, 29: 4885, 30: 4928, 31: 4968, 32: 5005, 33: 5040,
  34: 5073, 35: 5104, 36: 5133
};

const DOCOMO_HIKARI_DATABASE = {
  12: 3150, 13: 3270, 14: 3390, 15: 3510, 16: 3630, 17: 3750, 18: 3870, 19: 3990,
  20: 4110, 21: 4230, 22: 4350, 23: 4470, 24: 4590, 25: 4670, 26: 4750,
  27: 4830, 28: 4910, 29: 4990, 30: 5070, 31: 5150, 32: 5230, 33: 5310,
  34: 5390, 35: 5470, 36: 5550
};

// 最新TOP5 ランキングデータ
const RANKING_DATA = [
  { id: 'mobareco', name: 'モバレコAir', type: 'ホームルーター', speed: '4.5', delivery: '最短翌日', popular: true, carrier: 'SoftBank / Y!mobile', construction: 'なし' },
  { id: 'broadwimax', name: 'BroadWiMAX', type: 'ポケット型WiFi、ホームルーター', speed: '4.8', delivery: '最短翌日', popular: false, carrier: 'au / UQ', construction: 'なし' },
  { id: 'jcom', name: 'J:COM', type: '固定回線（光回線）', speed: '4.9', delivery: '1ヶ月程度', popular: false, carrier: 'au / UQ', construction: 'あり' },
  { id: 'softbankhikari', name: 'SoftBank光', type: '固定回線（光回線）', speed: '5.0', delivery: '1ヶ月程度', popular: false, carrier: 'SoftBank / Y!mobile', construction: 'あり' },
  { id: 'docomohikari', name: 'ドコモ光', type: '固定回線（光回線）', speed: '5.0', delivery: '1ヶ月程度', popular: false, carrier: 'docomo', construction: 'あり' },
];

const SCENES = [
  { title: '一人暮らし', icon: <Monitor className="w-5 h-5" />, desc: 'コスパ重視' },
  { title: '家族・戸建て', icon: <Home className="w-5 h-5" />, desc: '安定性重視' },
  { title: '外出先利用', icon: <Wifi className="w-5 h-5" />, desc: 'モバイル重視' },
  { title: 'オンラインゲーム', icon: <Cpu className="w-5 h-5" />, desc: '超低遅延・極大容量' },
  { title: 'テレワーク・在宅', icon: <Users className="w-5 h-5" />, desc: 'ビデオ会議・大容量' },
  { title: '店舗・ビジネス', icon: <TrendingUp className="w-5 h-5" />, desc: '複数人・来客用' },
];

const INFRASTRUCTURE_DETAILS = {
  fiber: {
    title: '光回線 (固定回線)',
    speed: '〜 1Gbps / 10Gbps (実測：約 300〜600Mbps)',
    target: 'オンラインゲームを快適に楽しみたい方、家族みんなで同時接続する方、完全なる安定を求める方',
    pros: [
      '通信制限が一切なく、24時間いつでも完全に無制限で超高速通信が可能',
      '応答速度（Ping値）が極めて低く、FPSなどのゲームでも遅延・カクつきがゼロに',
      '天候や周囲の遮蔽物に影響されない、物理光ファイバーによる絶対的な安定性'
    ],
    cons: [
      '開通にあたって室内の宅内工事が必要（賃貸の場合は大家の許可が必要）',
      '申し込みから利用開始までに、通常2週間〜1ヶ月程度の期間がかかる'
    ]
  },
  home: {
    title: 'ホームルーター (置き型WiFi)',
    speed: '〜 4.2Gbps (実測：約 100〜250Mbps)',
    target: '工事をしたくない賃貸住まいの方、引っ越しが多い方、届いたその日からすぐに爆速WiFiを使いたい方',
    pros: [
      '工事は1秒も不要。専用の端末を部屋のコンセントに挿すだけですぐ開通',
      '5G対応モデルであれば、光回線に匹敵するレベル of 高速ダウンロードも可能',
      '引っ越し時の手続きもオンラインのみで簡単。新居でもコンセントに挿すだけ'
    ],
    cons: [
      '電波環境（基地局からの距離など）により、夕方〜夜間の混雑時に速度制限がかかる場合がある',
      '光回線と比較すると応答速度（Ping値）が若干高いため、競技型ゲームには不向き'
    ]
  },
  mobile: {
    title: 'ポケット型WiFi (WiMAX・モバイルルーター)',
    speed: '〜 2.7Gbps (実測：約 30〜100Mbps)',
    target: '外出先や移動中にPC・タブレットを使う方、ノマドワークをする方、家と外の通信費を1本にまとめたい方',
    pros: [
      '手のひらサイズでどこにでも持ち運べるため、カフェや新幹線でも安全な専用回線を確保',
      'スマホのテザリングよりバッテリー消費が少なく、データ容量も大幅に節約できる',
      '月額料金が比較的安価に抑えられており、家と外の通信をすべてこれ1台に統合可能'
    ],
    cons: [
      '遮蔽物（コンクリートの建物内、地下、山間部）において電波が弱まりやすい',
      '一度に多人数で同時に接続すると、接続台数オーバーで通信が著しく遅くなる'
    ]
  }
};

const CARRIER_RECOMMENDATIONS = {
  'docomo': {
    discount: '毎月最大 ¥1,100 OFF',
    desc: 'ドコモをお使いなら、セットでスマホ代もお得になります。実質月額も格安な「ドコモ光」が公式のスマホセット割に完全対応しています。',
    targetIds: ['docomohikari']
  },
  'au': {
    discount: '毎月最大 ¥1,100 OFF',
    desc: 'au/UQユーザーは、スマートバリューや自宅セット割で回線費用を強力に浮かせることができます。',
    targetIds: ['broadwimax', 'jcom']
  },
  'SoftBank': {
    discount: '毎月最大 ¥1,100 OFF',
    desc: 'おうち割で毎月通信費が最大カット！最安100円のモバレコAirや、爆速のSoftBank光がベスト相性です。',
    targetIds: ['mobareco', 'softbankhikari']
  },
  'Rakuten': {
    discount: 'スマホ代そのまま',
    desc: 'セット割自体はありませんが、純粋に実質月額が最も安い回線（モバレコAirやBroadWiMAX）を選ぶのが最適解です。',
    targetIds: ['mobareco', 'broadwimax']
  },
  '格安SIM': {
    discount: '基本割引なし（縛りフリー）',
    desc: 'キャリアの縛りがないため、無駄なく「実質月額」が安いモバレコAir、BroadWiMAXで組むのが最安の王道です。',
    targetIds: ['mobareco', 'broadwimax']
  }
};

const GlassCard = ({ children, className = "", title = "", subtitle = "", id = "" }) => (
  <div id={id} className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all hover:bg-white/10 ${className}`}>
    {(title || subtitle) && (
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
        <p className="text-xl font-bold text-white">{subtitle}</p>
      </div>
    )}
    {children}
  </div>
);

const App = () => {
  // 'home' | 'guide' | 'cancellation' | 'speed'
  const [page, setPage] = useState('home'); 
  const [months, setMonths] = useState(12); // デフォルト12ヶ月
  const [carrier, setCarrier] = useState('SoftBank'); // 初期値をSoftBankに
  const [activeModal, setActiveModal] = useState(null); // 'fiber' | 'home' | 'mobile' | null
  const [highlightedIds, setHighlightedIds] = useState([]); // ハイライト対象ID

  const [diagStep, setDiagStep] = useState(0);
  const [answers, setAnswers] = useState({
    location: '',     // Q1: 利用場所
    purpose: '',      // Q2: 目的
    urgency: '',      // Q3: 納期
    carrier: '',      // Q4: スマホキャリア
    preference: ''    // Q5: こだわり
  });

  // ページ変更時に一番上へスクロール
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const getDynamicPrice = (id, currentMonths) => {
    if (id === 'mobareco') return REAL_PRICING_DATABASE[currentMonths] || 2820;
    if (id === 'broadwimax') return BROAD_WIMAX_DATABASE[currentMonths] || 3399;
    if (id === 'jcom') return JCOM_DATABASE[currentMonths] || 5133;
    if (id === 'softbankhikari') {
      if (currentMonths === 12) return 3203;
      return Math.round(3203 + (currentMonths - 12) * 55); 
    }
    if (id === 'docomohikari') return DOCOMO_HIKARI_DATABASE[currentMonths] || 5550;
    return 0;
  };

  const handleAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setDiagStep(prev => prev + 1);
  };

  const resetDiagnostic = () => {
    setAnswers({ location: '', purpose: '', urgency: '', carrier: '', preference: '' });
    setDiagStep(0);
  };

  const recommendation = useMemo(() => {
    if (diagStep < 5) return null;

    const { location, purpose, urgency, carrier: userCarrier, preference } = answers;

    if (location === 'outside') {
      return {
        service: 'BroadWiMAX',
        reason: '外出先での利用がメインのあなたには、データ無制限かつ持ち運び可能な「BroadWiMAX」が最適です。au / UQモバイルとのセット割引も適用されます。'
      };
    }

    if (preference === 'no_construction' || urgency === 'now' || urgency === 'days') {
      if (userCarrier === 'softbank') {
        return {
          service: 'モバレコAir',
          reason: '工事不要かつ即日開通をお望みで、SoftBank/Y!mobileスマホをお使いなら「モバレコAir」が一択です。スマホ代が毎月最大1,100円割引され、実質月額も最安クラスです。'
        };
      }
      return {
        service: 'BroadWiMAX',
        reason: '工事なしで急ぎでネット環境が必要な場合、最短即日発送の「BroadWiMAX」ホームルータープランがおすすめです。au・UQのスマートバリューに対応しています。'
      };
    }

    if (preference === 'fiber_ok' || purpose === 'game') {
      if (userCarrier === 'au_uq') {
        return {
          service: 'auひかり (または J:COM)',
          reason: '速度・安定性を最重視するau・UQユーザーであれば、公式スマートバリューでお得になる高品質な「J:COM」または固定回線が極めてお奨めです。'
        };
      }
      if (userCarrier === 'softbank') {
        return {
          service: 'SoftBank光',
          reason: 'オンラインゲームや大容量通信を安定して行いたいSoftBankユーザーなら、おうち割が適用可能な「SoftBank光」が最適です。'
        };
      }
      if (userCarrier === 'docomo') {
        return {
          service: 'ドコモ光',
          reason: '安定した高速光回線環境をお求めのドコモユーザーなら、公式セット割引が適用可能な「ドコモ光」のプロバイダパックプランが最適です。'
        };
      }
    }

    if (userCarrier === 'softbank') {
      return {
        service: 'モバレコAir',
        reason: '初期工事の手間がなく、お持ちのSoftBank/Y!mobileスマホとのセット割引を適用して、最も安く使い始められる「モバレコAir」をおすすめします。'
      };
    }

    return {
      service: 'BroadWiMAX',
      reason: '手軽にスタートでき、通信品質と費用のバランスが取れた「BroadWiMAX」が万人におすすめできる優秀な選択肢です。'
    };
  }, [diagStep, answers]);

  const simulatedPricing = useMemo(() => {
    const mobarecoEff = REAL_PRICING_DATABASE[months] || 2820;
    const mobarecoTotal = mobarecoEff * months;

    const wimaxEff = BROAD_WIMAX_DATABASE[months] || 3399;
    const wimaxTotal = wimaxEff * months;

    const jcomEff = JCOM_DATABASE[months] || 5133;
    const jcomTotal = jcomEff * months;

    return {
      mobareco: { monthly: mobarecoEff.toLocaleString(), total: mobarecoTotal.toLocaleString() },
      wimax: { monthly: wimaxEff.toLocaleString(), total: wimaxTotal.toLocaleString() },
      jcom: { monthly: jcomEff.toLocaleString(), total: jcomTotal.toLocaleString() }
    };
  }, [months]);

  const scrollToTable = () => {
    const element = document.getElementById('comparison-matrix');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const triggerHighlight = (carrierKey) => {
    const recs = CARRIER_RECOMMENDATIONS[carrierKey]?.targetIds || [];
    setHighlightedIds(recs);
    scrollToTable();
    setTimeout(() => {
      setHighlightedIds([]);
    }, 4000);
  };

  const triggerFilter = (type) => {
    setActiveModal(null);
    scrollToTable();
  };

  if (page === 'guide') {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-4 md:p-8 selection:bg-cyan-500/30">
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">  <script>
    dataLayer = [];

  </script>

    <script>
      // Unique Script ID: 4vMgHahVCwA=
      dataLayer.push({"user_role":"employee","oauth":"cw","user_usertype":"individual","company_name":"","released_job_offer_count":0});
    </script>

  <script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-5DSGFK');</script>



          <button 
            onClick={() => setPage('home')} 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft size={14} /> メインコンソールに戻る
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="text-cyan-400 w-5 h-5" />
            <span className="text-xs font-bold text-slate-400">BEGINNER\'S GUIDE</span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto space-y-8 pb-20">
          <div className="text-center md:text-left space-y-3 border-b border-b-white/5 pb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              初心者向けインターネット回線<br className="md:hidden" />
              失敗しないための完全選び方ガイド
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              「種類が多すぎてわからない」「騙されたくない」という初心者の方向けに、業界の裏事情から実質料金のカラクリまで、絶対損をしないための4つの鉄則をプロがどこよりも優しく図解します。
            </p>
          </div>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0">
                1
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-black tracking-wider uppercase">RULE 01</span>
                <h2 className="text-xl font-bold text-white">「初月だけ」に騙されない！実質支払総額での計算方法</h2>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              ネット回線の広告でよく見かける「月額100円！」や「業界最安級！」という言葉。実はこれ、<strong className="text-cyan-400 font-semibold">最初の数ヶ月だけの超短期割引だったり、高額なオプション加入が条件になっていることがほとんど</strong>です。
            </p>
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="bg-white/5 p-4 rounded-xl text-center border border-dashed border-white/10">
                <p className="text-xs text-slate-400 mb-1">実質月額料金 ＝</p>
                <p className="text-sm md:text-lg font-bold text-white font-mono leading-normal">
                  ( 毎月の基本料金 of 累計 ＋ 初期費用/事務手数料 ) － キャッシュバック還元額
                </p>
                <div className="border-t border-white/10 my-2 pt-2">
                  <p className="text-xs text-slate-400">÷ 利用する予定 of 総月数</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                当コンソールの料金シミュレーターは、この数式に則って12ヶ月〜36ヶ月先の「本当に支払う平均額」を自動計算しています。
              </p>
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0">
                2
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-black tracking-wider uppercase">RULE 02</span>
                <h2 className="text-xl font-bold text-white">「工事の有無」がライフスタイルを決定する</h2>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              自宅への回線引き込み（光工事）が必要かどうかは、手続きの難易度や納期に天と地ほどの差を生み出します。
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 space-y-2">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-bold rounded text-[9px]">工事なし（ホーム・ポケット）</span>
                <p className="text-white font-bold text-sm">とにかく手軽 ＆ 即日導入</p>
                <p className="text-slate-400 leading-relaxed">
                  コンセントに挿すだけ、または届いたその日からネットが繋がります。賃貸アパートで壁に穴を開けたくない方や、引っ越しが多い単身の方、来週からすぐにテレワークを開始したい方にベスト。
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-bold rounded text-[9px]">工事あり（光回線）</span>
                <p className="text-white font-bold text-sm">速度・安定性が完全無制限</p>
                <p className="text-slate-400 leading-relaxed">
                  工事が必要で開通までに2週間〜1ヶ月程度かかりますが、応答速度（Ping値）が圧倒的に速いため、オンラインゲームを一切カクつかずに楽しみたい方や、家族全員で同時接続しても速度低下を気にしたくない方に最適。
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0">
                3
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-black tracking-wider uppercase">RULE 03</span>
                <h2 className="text-xl font-bold text-white">「完全無制限」と「速度制限条件」の落とし穴</h2>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              「ギガ使い放題」「完全無制限」と謳う回線であっても、実は裏に細かい利用規約が隠されているケースがあります。
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start text-xs p-4 rounded-xl bg-black/40 border border-white/5">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold">混雑時間帯の制限リスク</p>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    多くのホームルーターやポケット型WiFiでは、夜間などアクセスが集中する時間帯に「ネットワーク保護のための自動速度低下」がかかる場合があります。
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start text-xs p-4 rounded-xl bg-black/40 border border-white/5">
                <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold">光回線には原則として上限規制なし</p>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    物理的な光ケーブルを直接自宅に引き込む「固定光回線」であれば、一日中どんなにYouTubeを流しっぱなしにしても、大容量のゲームデータをダウンロードしても、制限がかかることは一切ありません。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0">
                4
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-black tracking-wider uppercase">RULE 04</span>
                <h2 className="text-xl font-bold text-white">通信費全体を賢く削減！スマホキャリアセット割引</h2>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              実はインターネット回線を最も安く選ぶコツは、回線単体の安さではなく、<strong className="text-cyan-400 font-semibold">お持ちのスマホの契約会社と「セット割」を適用させること</strong>です。
            </p>
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">SoftBank / Y!mobile</span>
                    <span className="text-slate-400">「おうち割 光セット」適用対象</span>
                  </div>
                  <span className="text-sm font-black text-cyan-400 font-mono">スマホ1台につき月1,100円割引</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">au / UQ mobile</span>
                    <span className="text-slate-400">「auスマートバリュー」/「自宅セット割」適用対象</span>
                  </div>
                  <span className="text-sm font-black text-cyan-400 font-mono">スマホ1台につき月1,100円割引</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">docomo</span>
                    <span className="text-slate-400">「ドコモ光セット割」適用対象</span>
                  </div>
                  <span className="text-sm font-black text-cyan-400 font-mono">スマホ1台につき月1,100円割引</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                ※この家族割引は同居するご家族、場合によっては遠方の家族を含め、最大10回線まで対象に加算できるため、ネット料金が実質的にタダ同然になる家庭もあります。
              </p>
            </div>
          </section>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-center space-y-4">
            <h3 className="text-lg font-black text-white">あなたのライフスタイルに最適な回線を見つけましょう</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              これで基本は完璧です。さっそくメインコンソールに戻り、5ステップのセルフ診断や3社並列リアルタイム比較スライダーを使って、あなただけのベストなネット回線を選んでみてください。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button 
                onClick={() => setPage('home')} 
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-2xl text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                メインコンソールに戻る
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (page === 'cancellation') {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-4 md:p-8 selection:bg-cyan-500/30 animate-in fade-in duration-300">
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">  <script>
    dataLayer = [];

  </script>

    <script>
      // Unique Script ID: C+GMAD6KdRg=
      dataLayer.push({"user_role":"employee","oauth":"cw","user_usertype":"individual","company_name":"","released_job_offer_count":0});
    </script>

  <script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-5DSGFK');</script>



          <button 
            onClick={() => setPage('home')} 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft size={14} /> メインコンソールに戻る
          </button>
          <div className="flex items-center gap-2">
            <Coins className="text-green-400 w-5 h-5" />
            <span className="text-xs font-bold text-slate-400">CANCELLATION SUPPORT RANKING</span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto space-y-8 pb-20">
          <div className="text-center md:text-left space-y-3 border-b border-b-white/5 pb-8">
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              乗り換え違約金サポート・全額還元キャンペーン<br />
              対応インターネット回線ランキング
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              他社からの解約時に発生する「契約解除金」や「回線撤去工事費」、「工事費の分割払い残債」を、公式キャンペーンで代わりに全額、または超高額キャッシュバックで補填・カバーしてくれる回線の最新優秀ランキングです。
            </p>
          </div>

          <div className="space-y-6">
            {/* 1位: モバレコAir / SoftBank光 */}
            <div className="bg-white/5 border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-cyan-500 text-black text-[10px] font-black px-2 py-1 rounded-full">第 1 位</span>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-slate-400">ホームルーター / 固定回線</span>
                <h3 className="text-2xl font-black text-white">モバレコAir ＆ SoftBank光</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">違約金還元上限額</span>
                  <strong className="text-xl font-bold text-green-400 font-mono">最大10万円まで満額</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">工事費残債のカバー</span>
                  <strong className="text-xl font-bold text-white">全額補填</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">還元対象回線</span>
                  <strong className="text-xl font-bold text-cyan-400">他社ほぼすべての回線</strong>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                ソフトバンクが提供する「SoftBankあんしん査定」により、他社インターネット回線（モバイル、ADSL、光コラボなど）から移行した際の解約費用を最大10万円まで完全にキャッシュバック補填。10万円を超える違約金請求はほぼ実態として無いため、実質完全に「違約金・解約金リスク0円」での乗り換えが可能です。
              </p>
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>申請も他社の解約請求証明（明細書など）を専用のマイページにWEBアップロードするだけで極めてスムーズ！</span>
              </div>
            </div>

            {/* 2位: ドコモ光 */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-white/10 text-slate-400 text-[10px] font-black px-2 py-1 rounded-full">第 2 位</span>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-slate-400">固定回線（光回線）</span>
                <h3 className="text-2xl font-black text-white">ドコモ光</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">違約金還元補助額</span>
                  <strong className="text-xl font-bold text-green-400 font-mono">一律 ¥15,000〜¥20,000</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">プラス特典</span>
                  <strong className="text-xl font-bold text-white">新規工事代金完全無料</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">スマホセット割引</span>
                  <strong className="text-xl font-bold text-cyan-400">docomoスマホが対象</strong>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                プロバイダ窓口のキャンペーンにより、他社回線からの乗り換え（解約）を証明することで、最大2万円相当のキャッシュバックが追加還元されます。ドコモ光はこれにプラスして「新規宅内光工事費が完全に無料」になるキャンペーンを通年実施しているため、初期開通の初期費用負担が最も少なくて済む強力なメリットがあります。
              </p>
            </div>

            {/* 3位: BroadWiMAX */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-white/10 text-slate-400 text-[10px] font-black px-2 py-1 rounded-full">第 3 位</span>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-slate-400">ポケット型WiFi、ホームルーター</span>
                <h3 className="text-2xl font-black text-white">BroadWiMAX</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">違約金乗り換えサポート</span>
                  <strong className="text-xl font-bold text-green-400 font-mono">最大 ¥19,000 補填</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">他社乗り換え対象</span>
                  <strong className="text-xl font-bold text-white">他社のモバイルルーター・ADSL等</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">発送までの期間</span>
                  <strong className="text-xl font-bold text-cyan-400">最短翌日発送</strong>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                BroadWiMAXでは、他社インターネットサービスから契約変更をする場合に発生する解約違約金を、最大19,000円までキャッシュバック還元の形でカバーしてくれます。「今使っている他社ポケットWiFiやモバイル回線の更新月がまだ先だけど、速度に不満がありすぐ替えたい」というお悩みの方に、圧倒的におすすめです。
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/30 text-center">
            <h3 className="text-lg font-black text-white mb-2">現在の回線への解約違約金が気になるあなたへ</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed mb-6">
              どの回線も、お申し込み後に「解約を証明する明細やはがきの写真」をアップロードするだけで違約金還元手続きが完了します。自己負担を実質0円にして、最もお得で速い回線へ移行しましょう。
            </p>
            <button 
              onClick={() => setPage('home')} 
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-2xl text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              比較コンソールに戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (page === 'speed') {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-4 md:p-8 selection:bg-cyan-500/30 animate-in fade-in duration-300">
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">  <script>
    dataLayer = [];

  </script>

    <script>
      // Unique Script ID: Jf0R1qPrOdc=
      dataLayer.push({"user_role":"employee","oauth":"cw","user_usertype":"individual","company_name":"","released_job_offer_count":0});
    </script>

  <script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-5DSGFK');</script>



          <button 
            onClick={() => setPage('home')} 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft size={14} /> メインコンソールに戻る
          </button>
          <div className="flex items-center gap-2">
            <Truck className="text-cyan-400 w-5 h-5" />
            <span className="text-xs font-bold text-slate-400">NO CONSTRUCTION SPEEDY RUN</span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto space-y-8 pb-20">
          <div className="text-center md:text-left space-y-3 border-b border-b-white/5 pb-8">
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              【お急ぎ・すぐ使いたい方向け】工事完全不要！<br />
              最短翌日届いてすぐ使えるネット回線ランキング
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              「明日から新生活・テレワークが始まる」「賃貸マンションで物理的な光回線の開通工事が許可されなかった」といった状況でも、開通手続き・宅内工事が1秒もいらず、コンセントに挿すか端末の電源を入れるだけですぐにデータ無制限インターネットを開始できる最速回線ランキングです。
            </p>
          </div>

          <div className="space-y-6">
            {/* 1位: モバレコAir */}
            <div className="bg-white/5 border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-cyan-500 text-black text-[10px] font-black px-2 py-1 rounded-full">第 1 位</span>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-slate-400">ホームルーター (置くだけWiFi)</span>
                <h3 className="text-2xl font-black text-white">モバレコAir</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">開通までの日数</span>
                  <strong className="text-xl font-bold text-green-400 font-mono">最短翌日開通 (工事なし)</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">接続の初期設定</span>
                  <strong className="text-xl font-bold text-white">コンセントに挿すだけ</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">お急ぎ発送体制</span>
                  <strong className="text-xl font-bold text-cyan-400">最短即日スピード発送</strong>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                とにかくスピード開通を求めるユーザーにとって、モバレコAirは圧倒的なメリットがあります。物理的な部屋への引き込み工事は一切不要。契約完了後、最短翌日には本体が自宅に到着し、部屋のコンセントに電源プラグを差し込むだけで数秒で高音質な5GネットワークのWiFiが立ち上がります。
              </p>
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-cyan-400">
                <Sparkles size={14} className="shrink-0" />
                <span>データ容量も「完全無制限」で、映画も仕事のビデオ通話もギガを気にせず楽しめます！</span>
              </div>
            </div>

            {/* 2位: BroadWiMAX */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-white/10 text-slate-400 text-[10px] font-black px-2 py-1 rounded-full">第 2 位</span>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-slate-400">ポケット型WiFi、ホームルーター</span>
                <h3 className="text-2xl font-black text-white">BroadWiMAX</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">開通までの日数</span>
                  <strong className="text-xl font-bold text-green-400 font-mono">最短翌日開通 (工事なし)</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">利用場所の自由度</span>
                  <strong className="text-xl font-bold text-white">自宅 ＆ 外出先すべて</strong>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 block">発送タイミング</span>
                  <strong className="text-xl font-bold text-cyan-400">13時までの受付で即日発送</strong>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                BroadWiMAXでは、お急ぎの方のために非常に速い商品手配を行っており、平日はもちろん土曜日・日曜日・祝日であっても即日発送に対応。モバイル対応ルータープランであれば、持ち歩きも自由で家でも外でもすぐに安全なインターネットが開始できます。
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-center">
            <h3 className="text-lg font-black text-white mb-2">来週や明日からネットをすぐに使い始めたい方へ</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed mb-6">
              通常の固定光回線は、工事の予約や調整で開通までに1ヶ月〜最悪2ヶ月以上かかる場合があります。お急ぎであれば、最短翌日に届いてすぐ繋がる「工事不要な端末」を選択するのが確実に賢い選択です。
            </p>
            <button 
              onClick={() => setPage('home')} 
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-2xl text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              比較コンソールに戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-4 md:p-8 selection:bg-cyan-500/30">
      {/* Header Area */}
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">インターネット比較.com</h1>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <a href="#comparison-matrix" className="hover:text-white transition-colors">ランキング</a>
          <a href="#diagnostic-anchor" className="hover:text-white transition-colors">無料診断</a>
          <a href="#simulator-anchor" className="hover:text-white transition-colors">料金比較</a>
          <button onClick={() => setPage('guide')} className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-bold">
            <BookOpen size={14} /> 初心者向け解説ガイド
          </button>
        </nav>
      </header>

      {/* Main Bento Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* 1. セルフ診断 (5ステップ) */}
        <GlassCard 
          id="diagnostic-anchor" 
          className="md:col-span-4 md:row-span-2 flex flex-col justify-between group border-cyan-500/20" 
          title="Consential AI" 
          subtitle="3秒判定セルフ診断"
        >
          <div className="mt-4 flex-grow flex flex-col justify-center">
            {diagStep === 0 && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> STEP 1 / 5
                </div>
                <p className="text-white font-bold text-base mb-3">Q1. 主にどこで使いますか？</p>
                <button 
                  onClick={() => handleAnswer('location', 'house')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">戸建て（一軒家）</span>
                    <span className="text-[10px] text-slate-400">家族利用や安定回線を重視したい方</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('location', 'mansion')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">集合住宅（マンション・アパート）</span>
                    <span className="text-[10px] text-slate-400">配線方式や建物の規約を気にする方</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('location', 'outside')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">外出先・移動中</span>
                    <span className="text-[10px] text-slate-400">カフェやオフィス、旅行先でも使いたい方</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              </div>
            )}

            {diagStep === 1 && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> STEP 2 / 5
                </div>
                <p className="text-white font-bold text-base mb-3">Q2. 主な利用目的は何ですか？</p>
                <button 
                  onClick={() => handleAnswer('purpose', 'game')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">オンラインゲーム・仕事（大容量）</span>
                    <span className="text-[10px] text-slate-400">FPSゲームの遅延解消、ビデオ会議の安定</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('purpose', 'video')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">動画視聴・SNS（標準利用）</span>
                    <span className="text-[10px] text-slate-400">YouTube、Netflix、Instagram、日常の検索</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('purpose', 'light')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">ウェブ閲覧・メール（ライト利用）</span>
                    <span className="text-[10px] text-slate-400">最低限使えればOK、何よりも安さ重視</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              </div>
            )}

            {diagStep === 2 && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> STEP 3 / 5
                </div>
                <p className="text-white font-bold text-base mb-3">Q3. いつまでに必要ですか？</p>
                <button 
                  onClick={() => handleAnswer('urgency', 'now')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">今すぐ（最短明日から）</span>
                    <span className="text-[10px] text-slate-400">引っ越し直後や即座にネット環境がほしい</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('urgency', 'days')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">3日〜1週間以内</span>
                    <span className="text-[10px] text-slate-400">できれば早めに準備を終えたい</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('urgency', 'slow')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">急いでいない（1ヶ月以内程度）</span>
                    <span className="text-[10px] text-slate-400">工事などの開通待ち期間があっても問題ない</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              </div>
            )}

            {diagStep === 3 && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> STEP 4 / 5
                </div>
                <p className="text-white font-bold text-base mb-3">Q4. お使いのスマホは何ですか？</p>
                <button 
                  onClick={() => handleAnswer('carrier', 'softbank')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">SoftBank / Y!mobile</span>
                    <span className="text-[10px] text-slate-400">おうち割で毎月最大1,100円/台引き対象</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('carrier', 'au_uq')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">au / UQ mobile</span>
                    <span className="text-[10px] text-slate-400">スマートバリュー等で毎月割引対象</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('carrier', 'docomo')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">docomo</span>
                    <span className="text-[10px] text-slate-400">ドコモ光セット割で毎月割引対象</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('carrier', 'other')} 
                  className="w-full p-3 rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-center text-xs font-bold text-slate-300"
                >
                  その他（格安SIM） / セット割を希望しない
                </button>
              </div>
            )}

            {diagStep === 4 && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> STEP 5 / 5
                </div>
                <p className="text-white font-bold text-base mb-3">Q5. 回線タイプにこだわりはありますか？</p>
                <button 
                  onClick={() => handleAnswer('preference', 'no_construction')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">工事なしが良い（置くだけ・ポケット）</span>
                    <span className="text-[10px] text-slate-400">賃貸だから穴を開けたくない、引越しが多い</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('preference', 'fiber_ok')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">工事しても良い（速度最重視）</span>
                    <span className="text-[10px] text-slate-400">多少時間がかかっても光回線の速さを引き出したい</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleAnswer('preference', 'none')} 
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <span className="block font-bold text-white text-sm">こだわりなし・プロのおすすめに任せる</span>
                    <span className="text-[10px] text-slate-400">状況に合う一番最適な回線を推薦してほしい</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              </div>
            )}

            {diagStep === 5 && recommendation && (
              <div className="animate-in scale-in duration-300 space-y-3">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                  <span className="inline-block text-[9px] text-cyan-400 font-bold tracking-wider uppercase mb-1 px-2 py-0.5 bg-cyan-500/20 rounded">DIAGNOSTIC RESULT</span>
                  <p className="text-slate-400 text-xs mb-1">あなたに最適なのは</p>
                  <p className="text-2xl font-black text-white">{recommendation.service}</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                  {recommendation.reason}
                </p>
                <div className="pt-2 space-y-2">
                  <button 
                    onClick={scrollToTable} 
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/10"
                  >
                    TOP5の徹底比較表で納得する <ChevronRight size={14} />
                  </button>
                  <button 
                    onClick={resetDiagnostic} 
                    className="w-full py-2 text-slate-500 hover:text-white transition-all text-xs flex items-center justify-center gap-1"
                  >
                    <RefreshCw size={12} /> もう一度やり直す
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
            <span>ライフスタイル優先のインテリジェント選定</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === diagStep 
                      ? 'w-6 bg-cyan-500' 
                      : i < diagStep 
                        ? 'w-1.5 bg-cyan-500/50' 
                        : 'w-1.5 bg-white/10'
                  }`} 
                />
              ))}
            </div>
          </div>
        </GlassCard>

        {/* 2. 価格シミュレーター */}
        <GlassCard 
          id="simulator-anchor" 
          className="md:col-span-8 md:row-span-2" 
          title="Cost Simulator" 
          subtitle="期間別・実質月額料金比較"
        >
          <div className="mt-4 space-y-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2 italic">
                利用想定期間: <span className="text-white font-bold text-lg">{months}ヶ月</span>
              </label>
              <input 
                type="range"
                min="12" 
                max="36" 
                value={months} 
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>12ヶ月</span>
                <span>18ヶ月</span>
                <span>24ヶ月</span>
                <span>30ヶ月</span>
                <span>36ヶ月</span>
              </div>
            </div>

            {/* 3社リアルタイム比較カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* モバレコAir */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 relative animate-in fade-in duration-500">
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[9px] font-bold rounded">BEST</span>
                <p className="text-xs text-slate-400 mb-1">モバレコAir (1位)</p>
                <p className="text-2xl font-black text-white">
                  ¥{simulatedPricing.mobareco.monthly}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">/月</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-2">期間総額: ¥{simulatedPricing.mobareco.total}</p>
              </div>

              {/* BroadWiMAX */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 animate-in fade-in duration-500 delay-100">
                <p className="text-xs text-slate-400 mb-1">BroadWiMAX (2位)</p>
                <p className="text-2xl font-black text-white">
                  ¥{simulatedPricing.wimax.monthly}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">/月</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-2">期間総額: ¥{simulatedPricing.wimax.total}</p>
              </div>

              {/* J:COM */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 animate-in fade-in duration-500 delay-200">
                <p className="text-xs text-slate-400 mb-1">J:COM (3位)</p>
                <p className="text-2xl font-black text-white">
                  ¥{simulatedPricing.jcom.monthly}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">/月</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-2">期間総額: ¥{simulatedPricing.jcom.total}</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-white/5 pt-2">
              ※実質月額料金の計算：（支払い総額-キャッシュバック）÷利用期間で計算した実質月額料金です。
            </p>
          </div>
        </GlassCard>

        {/* 3. 今月のおすすめネット回線 */}
        <GlassCard 
          className="md:col-span-4 md:row-span-2 border-cyan-500/30 bg-cyan-500/5 relative group" 
          title="RECOMMENDED" 
          subtitle="今月のおすすめネット回線"
        >
          <div className="absolute top-4 right-4 bg-cyan-500 text-black text-[10px] font-black px-2 py-1 rounded-full">RECOMMENDED</div>
          <div className="mt-6">
            <h4 className="text-4xl font-black text-white tracking-tight">モバレコAir</h4>
            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-white">ホームルーター</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-white">5G対応</span>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-xs text-slate-400">初月料金</span>
                <span className="text-2xl font-bold text-cyan-400">¥100</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-xs text-slate-400">キャッシュバック</span>
                <span className="text-lg text-white">¥34,000</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <span className="text-xs text-slate-400">端末代金</span>
                <span className="text-lg text-white">実質¥0</span>
              </div>
            </div>
            <button className="w-full mt-8 bg-white text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2">
              詳細をチェック <ChevronRight size={18} />
            </button>
          </div>
        </GlassCard>

        {/* 4. 利用シーン別ランキング */}
        <GlassCard 
          className="md:col-span-8 md:row-span-2 flex flex-col justify-between" 
          title="Scene Rankings" 
          subtitle="利用シーン別ランキング"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 flex-grow">
            {SCENES.map((scene, i) => (
              <div 
                key={i} 
                className="group/scene relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-cyan-500/30 flex flex-col justify-between h-full cursor-pointer"
              >
                <div>
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-3 text-cyan-500 group-hover/scene:text-cyan-400 group-hover/scene:scale-110 transition-all">
                    {scene.icon}
                  </div>
                  <h4 className="font-bold text-white mb-1 text-sm">{scene.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{scene.desc}</p>
                </div>
                <div className="text-[11px] font-bold text-cyan-500 group-hover/scene:text-cyan-400 flex items-center gap-1 mt-auto">
                  個別ランキングを見る
                  <ChevronRight size={12} className="transform group-hover/scene:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 5. TOP5 徹底比較表 */}
        <GlassCard id="comparison-matrix" className="md:col-span-12 overflow-x-auto" title="Comparison Matrix" subtitle="最新TOP5 徹底比較表">
          <table className="w-full mt-6 text-sm text-left">
            <thead>
              <tr className="text-slate-500 border-b border-white/10">
                <th className="pb-4 font-medium text-xs">順位</th>
                <th className="pb-4 font-medium">サービス名</th>
                <th className="pb-4 font-medium">タイプ</th>
                <th className="pb-4 font-medium">工事有無</th>
                <th className="pb-4 font-medium">対応セット割引</th>
                <th className="pb-4 font-medium">実質月額料金</th>
                <th className="pb-4 font-medium">通信速度(実測)</th>
                <th className="pb-4 font-medium">開通まで</th>
                <th className="pb-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {RANKING_DATA.map((item, index) => {
                const isHighlighted = highlightedIds.includes(item.id);

                return (
                  <tr 
                    key={item.id} 
                    className={`border-b border-white/5 transition-all duration-500 ${
                      item.popular ? 'bg-cyan-500/5' : ''
                    } ${
                      isHighlighted 
                        ? 'bg-cyan-500/20 border-cyan-500/60 shadow-lg scale-[1.01] translate-x-1' 
                        : ''
                    }`}
                  >
                    <td className="py-4">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${index === 0 ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-400'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-white flex items-center gap-2">
                      {item.name}
                      {isHighlighted && (
                        <span className="animate-pulse px-2 py-0.5 bg-cyan-500 text-black text-[9px] font-extrabold rounded-md">
                          おすすめ!
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-slate-400 text-xs">{item.type}</td>
                    <td className="py-4 text-xs font-semibold">
                      <span className={`px-2 py-0.5 rounded border ${
                        item.construction === 'なし' 
                          ? 'border-green-500/30 text-green-400 bg-green-500/5' 
                          : 'border-red-500/30 text-red-400 bg-red-500/5'
                      }`}>
                        {item.construction}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-semibold text-cyan-400">{item.carrier}</td>
                    <td className="py-4 font-mono">¥{getDynamicPrice(item.id, months).toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${(parseFloat(item.speed) / 5) * 100}%` }} />
                        </div>
                        <span className="text-xs font-mono">{item.speed}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        item.delivery === '最短翌日' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/5' : 'border-slate-500/50 text-slate-400 bg-white/5'
                      }`}>
                        {item.delivery}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-cyan-500 hover:text-cyan-400 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 italic">
            <div className="flex items-center gap-2">
              <AlertCircle size={12} />
              <span>選定基準: 実測通信速度・月額平均・解約条件の3軸から算出 (更新日: 2026.05.19)</span>
            </div>
          </div>
        </GlassCard>

        {/* 6. 回線タイプ別比較・ナビゲーション */}
        <GlassCard 
          id="infrastructure-hub" 
          className="md:col-span-6 border-cyan-500/10" 
          title="Infrastructure Hub" 
          subtitle="回線タイプ別比較・ナビゲーション"
        >
          <p className="text-xs text-slate-400 leading-relaxed mb-6 mt-2">
            あなたに合う回線システムはどれ？ 各タイプをタップしてメリット・デメリットを確認し、専用ランキングを絞り込めます。
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveModal('fiber')}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-left flex justify-between items-center group/infra"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">光回線 (固定回線)</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 font-bold rounded-full">速度最重視</span>
                </div>
                <p className="text-[11px] text-slate-500">圧倒的な通信速度と完全無制限の安定環境</p>
              </div>
              <span className="text-xs font-bold text-cyan-400 group-hover/infra:translate-x-1 transition-transform flex items-center gap-1">
                解説＆ランキング <ChevronRight size={14} />
              </span>
            </button>

            <button 
              onClick={() => setActiveModal('home')}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-left flex justify-between items-center group/infra"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">ホームルーター (置き型WiFi)</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 font-bold rounded-full">工事不要・最短翌日から</span>
                </div>
                <p className="text-[11px] text-slate-500">コンセントに挿すだけですぐにギガ放題開始</p>
              </div>
              <span className="text-xs font-bold text-cyan-400 group-hover/infra:translate-x-1 transition-transform flex items-center gap-1">
                解説＆ランキング <ChevronRight size={14} />
              </span>
            </button>

            <button 
              onClick={() => setActiveModal('mobile')}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-left flex justify-between items-center group/infra"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">ポケット型WiFi (モバイルルーター)</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 font-bold rounded-full">持ち運び・外でも利用可</span>
                </div>
                <p className="text-[11px] text-slate-500">家の中でも外出先でも、どこでも無制限通信</p>
              </div>
              <span className="text-xs font-bold text-cyan-400 group-hover/infra:translate-x-1 transition-transform flex items-center gap-1">
                解説＆ランキング <ChevronRight size={14} />
              </span>
            </button>
          </div>
        </GlassCard>

        {/* 7. 初心者向けインターネット回線の選び方 */}
        <GlassCard 
          id="beginner-guide" 
          className="md:col-span-6 flex flex-col justify-between" 
          title="Beginner's Guide" 
          subtitle="初心者向けインターネット回線の選び方"
        >
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-red-400 mb-2 font-bold text-sm">
                  <AlertCircle size={16} /> 失敗例
                </div>
                <ul className="text-[10px] text-slate-400 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1">
                    <span>・</span>
                    <span>月額料金の「初月だけ」の安さだけで飛びついてしまう。</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span>・</span>
                    <span>回線速度が一番速いやつを選んで結果的に高額なインターネット料金を支払ってしまう。</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span>・</span>
                    <span>安さだけで判断して通信容量が低容量のものを選んでしまいすぐに通信制限がかかってしまう。</span>
                  </li>
                </ul>
              </div>
              <p className="text-[9px] text-red-400/60 mt-4 font-mono">※短期解約時は思わぬ出費に</p>
            </div>
            <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-green-400 mb-2 font-bold text-sm">
                  <CheckCircle2 size={16} /> 成功例
                </div>
                <ul className="text-[10px] text-slate-400 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1">
                    <span>・</span>
                    <span>「2年間の実質支払総額（キャッシュバック引き後）」で判断する。</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span>・</span>
                    <span>申し込みから開通までの期間（工事の有無）を確認する。</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span>・</span>
                    <span>データ容量無制限のものを選ぶ。</span>
                  </li>
                </ul>
              </div>
              <p className="text-[9px] text-green-400/60 mt-4 font-mono">※賢くセット割を最大活用</p>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <span className="text-[10px] text-slate-500 text-center sm:text-left leading-normal">
              「実質総額」や「スマホセット割引」の仕組みを詳しく解説。
            </span>
            <button 
              onClick={() => setPage('guide')} 
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 shrink-0 bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50"
            >
              選び方完全ガイドを読む <ChevronRight size={14} />
            </button>
          </div>
        </GlassCard>

        {/* 8. スマホセット割チェッカー */}
        <GlassCard className="md:col-span-4" title="Smartphone Bundle" subtitle="スマホセット割">
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Object.keys(CARRIER_RECOMMENDATIONS).map(c => (
              <button 
                key={c} 
                onClick={() => setCarrier(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  carrier === c 
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/25' 
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-5 text-sm">
            {carrier ? (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold block">
                      {carrier}ユーザー特典
                    </span>
                    <p className="text-white font-extrabold text-lg">
                      {CARRIER_RECOMMENDATIONS[carrier].discount}
                    </p>
                  </div>
                  <span className="text-[9px] bg-white/10 text-slate-300 px-2 py-1 rounded">
                    家族全員対象
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {CARRIER_RECOMMENDATIONS[carrier].desc}
                </p>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                    相性抜群のTOP5該当プラン：
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {RANKING_DATA.filter(item => 
                      CARRIER_RECOMMENDATIONS[carrier].targetIds.includes(item.id)
                    ).map((match, i) => {
                      const rankIndex = RANKING_DATA.findIndex(x => x.id === match.id) + 1;
                      return (
                        <span key={match.id} className="text-[11px] font-extrabold text-white bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                          {rankIndex}位：{match.name}
                        </span>
                      );
                    })}
                    {CARRIER_RECOMMENDATIONS[carrier].targetIds.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">
                        どのプランでも損せず選べます
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => triggerHighlight(carrier)}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    このセット割引回線を比較表で光らせる <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">キャリアを選択して相性の良い回線をチェック</p>
            )}
          </div>
        </GlassCard>

        {/* 9. 乗り換え違約金サポート（他社解約金実質0円） */}
        <GlassCard className="md:col-span-4" title="Cancellation Support" subtitle="乗り換え時の違約金対策">
          <div className="mt-4 space-y-4 flex flex-col justify-between h-[calc(100%-2rem)]">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/20 flex gap-3 items-start">
              <Coins className="text-green-400 shrink-0 w-6 h-6 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">他社解約金を最大10万円還元</p>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  モバレコAirやSoftBank光では、現在契約中の回線の解約違約金や工事費残債を全額（最大10万円）カバー。自己負担0円で乗り換えられます。
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setPage('cancellation')}
              className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-95"
            >
              乗り換え違約金がある回線ランキングをみる <ChevronRight size={14} />
            </button>
          </div>
        </GlassCard>

        {/* 10. お急ぎの方はこちら（工事不要最短翌日開通） */}
        <GlassCard className="md:col-span-4" title="Immediate Opening" subtitle="お急ぎの方はこちら">
          <div className="mt-4 space-y-4 flex flex-col justify-between h-[calc(100%-2rem)]">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex gap-3 items-start">
              <Truck className="text-cyan-400 shrink-0 w-6 h-6 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">工事不要！最短翌日から即時利用</p>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  「来週からすぐに仕事で使いたい」「開通を1日も待ちたくない」という場合は、配送スピードが速くコンセントに差し込むだけですぐ繋がる回線が正解です。
                </p>
              </div>
            </div>

            <button 
              onClick={() => setPage('speed')}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-95"
            >
              工事不要・最短翌日回線ランキングをみる <ChevronRight size={14} />
            </button>
          </div>
        </GlassCard>

      </div>

      {/* --- Popups --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d]/90 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 text-xl font-bold"
            >
              ✕
            </button>
            
            <span className="text-xs text-cyan-400 font-bold tracking-wider uppercase">IN DEPTH ANALYSIS</span>
            <h3 className="text-2xl font-black text-white mt-1 mb-4">{INFRASTRUCTURE_DETAILS[activeModal].title}</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">実測速度目安</h4>
                <p className="text-sm font-semibold text-white">{INFRASTRUCTURE_DETAILS[activeModal].speed}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">こんな人におすすめ</h4>
                <p className="text-sm text-slate-300">{INFRASTRUCTURE_DETAILS[activeModal].target}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                  <h5 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> 主要なメリット
                  </h5>
                  <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                    {INFRASTRUCTURE_DETAILS[activeModal].pros.map((pro, i) => (
                      <li key={i} className="flex gap-1"><span>•</span><span>{pro}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <h5 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} /> 注意すべきデメリット
                  </h5>
                  <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                    {INFRASTRUCTURE_DETAILS[activeModal].cons.map((con, i) => (
                      <li key={i} className="flex gap-1"><span>•</span><span>{con}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-5 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white font-medium text-xs transition-colors"
              >
                閉じる
              </button>
              <button 
                onClick={() => {
                  const typeFilterMap = { fiber: 'Fiber', home: 'Home', mobile: 'Mobile/Home' };
                  triggerFilter(typeFilterMap[activeModal]);
                }}
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs flex items-center gap-1 transition-all shadow-lg shadow-cyan-500/10"
              >
                この回線の専用ランキングを見る <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-20 pt-12 border-t border-white/5 pb-12 text-center">
        <p className="text-xs text-slate-600 uppercase tracking-widest mb-4">Produced by Professional Internet Comparison Console</p>
        <div className="flex justify-center gap-8 text-xs text-slate-500">
          <a href="#" className="hover:text-white">運営会社</a>
          <a href="#" className="hover:text-white">免責事項</a>
          <a href="#" className="hover:text-white">ランキングの根拠</a>
          <a href="#" className="hover:text-white">プライバシーポリシー</a>
        </div>
        <p className="mt-8 text-[10px] text-slate-700 font-mono">© 2026 Internet-Hikaku.com All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;