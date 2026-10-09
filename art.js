'use strict';
/* Вся графика игры — векторные SVG-персонажи в одном стиле.
   У каждого персонажа есть «риг»: .eye (моргание), .look (взгляд), .mouth (рот), .jaw (клюв/челюсть). */

const ART = (() => {
  let uid = 0;
  const INK = '#2b2233';
  const mirror = s => `<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;
  const both = s => s + mirror(s);

  // глаз: обычный (.eo) и «счастливый» дугой (.eh) — переключается классом .happy
  function eye(x, y, s = 1) {
    return `<g class="eye"><g class="eo">
      <ellipse cx="${x}" cy="${y}" rx="${9 * s}" ry="${11 * s}" fill="${INK}"/>
      <circle cx="${x + 3 * s}" cy="${y - 4 * s}" r="${3.8 * s}" fill="#fff"/>
      <circle cx="${x - 3 * s}" cy="${y + 4.5 * s}" r="${1.7 * s}" fill="#fff" opacity=".8"/></g>
      <path class="eh" d="M${x - 9 * s} ${y + 3 * s} Q${x} ${y - 10 * s} ${x + 9 * s} ${y + 3 * s}" stroke="${INK}" stroke-width="${5 * s}" fill="none" stroke-linecap="round"/></g>`;
  }
  const eyes = (x1, x2, y, s) => `<g class="look">${eye(x1, y, s)}${eye(x2, y, s)}</g>`;
  function mouth(x, y, w = 12) {
    return `<g class="mouth">
      <path class="m-closed" d="M${x - w} ${y} Q${x} ${y + w * .9} ${x + w} ${y}" fill="none" stroke="#5b2b30" stroke-width="5" stroke-linecap="round"/>
      <g class="m-open">
        <path d="M${x - w} ${y - 2} Q${x} ${y + w * 1.7} ${x + w} ${y - 2} Z" fill="#7a2335"/>
        <ellipse cx="${x}" cy="${y + w * .85}" rx="${w * .5}" ry="${w * .3}" fill="#ff7a8a"/></g></g>`;
  }
  const cheeks = (x1, x2, y, r = 11) => `<ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r * .62}" fill="#ff7f9a" opacity=".42"/><ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r * .62}" fill="#ff7f9a" opacity=".42"/>`;
  // голова с мягкой тенью снизу и бликом сверху
  function head(shape, color) {
    const id = 'h' + uid++;
    return `<defs><clipPath id="${id}">${shape}</clipPath></defs>
      <g fill="${color}">${shape}</g>
      <g clip-path="url(#${id})"><ellipse cx="100" cy="205" rx="120" ry="62" fill="#000" opacity=".07"/>
      <ellipse cx="72" cy="58" rx="34" ry="18" fill="#fff" opacity=".22" transform="rotate(-20 72 58)"/></g>`;
  }
  const whiskers = (y, c = '#6b4a3a') => both(`<path d="M68 ${y} L38 ${y - 6} M68 ${y + 7} L36 ${y + 9}" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".45"/>`);
  const svg = inner => inner; // головы — внутренняя разметка; обёртку дают char() / head()

  const A = {};
  A.cow = () => svg(
    both(`<path d="M62 56 q-16 -20 -2 -32 q4 14 14 22z" fill="#f3e2c2"/>`) +
    both(`<g class="ear"><ellipse cx="36" cy="82" rx="24" ry="12" fill="#fffaf2" transform="rotate(-18 36 82)"/><ellipse cx="38" cy="82" rx="14" ry="6" fill="#ffc4bb" transform="rotate(-18 38 82)"/></g>`) +
    head('<path d="M100 40 C142 40 162 66 162 102 C162 142 140 172 100 172 C60 172 38 142 38 102 C38 66 58 40 100 40Z"/>', '#fffaf2') +
    `<path d="M118 44 c20 0 36 14 38 34 c-12 8 -30 2 -36 -12 c-4 -10 -6 -16 -2 -22z" fill="#3a3340"/>
     <path d="M50 96 c-8 -16 4 -30 18 -26 c8 10 2 26 -18 26z" fill="#3a3340"/>
     <ellipse cx="100" cy="140" rx="48" ry="31" fill="#ffb8b0"/>
     <ellipse cx="84" cy="133" rx="5" ry="7" fill="#d9787a"/><ellipse cx="116" cy="133" rx="5" ry="7" fill="#d9787a"/>` +
    eyes(76, 124, 98) + mouth(100, 152, 12));
  A.cat = () => svg(
    both(`<g class="ear"><path d="M46 84 L50 26 L94 58 Z" fill="#ffa94d"/><path d="M56 72 L58 42 L82 60Z" fill="#ffc6b8"/></g>`) +
    head('<ellipse cx="100" cy="112" rx="68" ry="60"/>', '#ffad57') +
    `<path d="M100 56 v16 M86 58 l4 12 M114 58 l-4 12" stroke="#e8842a" stroke-width="6" stroke-linecap="round"/>
     <ellipse cx="86" cy="134" rx="17" ry="13" fill="#fff1e0"/><ellipse cx="114" cy="134" rx="17" ry="13" fill="#fff1e0"/>
     <path d="M92 122 h16 l-8 9z" fill="#ff7a8a" stroke="#ff7a8a" stroke-width="3" stroke-linejoin="round"/>` +
    whiskers(130) + eyes(76, 124, 104) + cheeks(60, 140, 128) + mouth(100, 141, 9));
  A.dog = () => svg(
    both(`<g class="ear"><path d="M54 58 C30 58 20 100 28 132 C34 154 58 144 62 122 C66 100 70 66 54 58Z" fill="#8b5a3c"/></g>`) +
    head('<ellipse cx="100" cy="106" rx="60" ry="62"/>', '#e2ab6f') +
    `<ellipse cx="126" cy="96" rx="19" ry="21" fill="#c98f55"/>
     <ellipse cx="100" cy="140" rx="38" ry="27" fill="#fbe4c6"/>
     <ellipse cx="100" cy="126" rx="13" ry="9.5" fill="${INK}"/><ellipse cx="96" cy="123" rx="4" ry="2.5" fill="#fff" opacity=".6"/>` +
    eyes(78, 124, 98) + mouth(100, 147, 11));
  A.duck = () => svg(
    `<path d="M98 50 q-8 -20 6 -26 q-2 12 4 16 q4 -12 14 -10 q-10 6 -12 18z" fill="#ffc933"/>` +
    head('<ellipse cx="100" cy="110" rx="66" ry="62"/>', '#ffd84d') +
    cheeks(60, 140, 120) + eyes(78, 122, 96) +
    `<path class="jaw" d="M66 132 Q100 162 134 132 Q100 142 66 132Z" fill="#f07f12"/>
     <path d="M58 128 Q100 106 142 128 Q100 148 58 128Z" fill="#ff9a2e"/>
     <ellipse cx="88" cy="122" rx="4" ry="2.5" fill="#d96d00"/><ellipse cx="112" cy="122" rx="4" ry="2.5" fill="#d96d00"/>`);
  A.frog = () => svg(
    `<circle cx="66" cy="62" r="28" fill="#7fd35a"/><circle cx="134" cy="62" r="28" fill="#7fd35a"/>` +
    head('<ellipse cx="100" cy="120" rx="80" ry="54"/>', '#7fd35a') +
    `<circle cx="66" cy="62" r="20" fill="#fff"/><circle cx="134" cy="62" r="20" fill="#fff"/>
     <circle cx="54" cy="104" r="5" fill="#5fb840"/><circle cx="150" cy="98" r="4" fill="#5fb840"/><circle cx="142" cy="110" r="3" fill="#5fb840"/>` +
    eyes(66, 134, 63, .95) + cheeks(50, 150, 126, 13) + mouth(100, 126, 34));
  A.pig = () => svg(
    both(`<g class="ear"><path d="M42 74 L48 30 L88 54Z" fill="#ff9fb5"/><path d="M48 44 L48 30 L62 38Z" fill="#ff7f9c"/></g>`) +
    head('<ellipse cx="100" cy="112" rx="68" ry="62"/>', '#ffb6c8') +
    `<ellipse cx="100" cy="130" rx="32" ry="23" fill="#ff8fab"/>
     <ellipse cx="90" cy="130" rx="5" ry="8" fill="#d9667f"/><ellipse cx="110" cy="130" rx="5" ry="8" fill="#d9667f"/>` +
    eyes(74, 126, 96) + cheeks(56, 144, 130) + mouth(100, 159, 10));
  A.sheep = () => {
    const puffs = [[60, 70], [80, 50], [100, 44], [120, 50], [140, 70], [152, 96], [48, 96], [56, 124], [144, 124]];
    return svg(
      both(`<g class="ear"><ellipse cx="38" cy="104" rx="22" ry="10" fill="#e7c9ad" transform="rotate(22 38 104)"/></g>`) +
      puffs.map(([x, y]) => `<circle cx="${x}" cy="${y + 4}" r="24" fill="#e9e1d3"/>`).join('') +
      puffs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="#fffdf8"/>`).join('') +
      head('<ellipse cx="100" cy="120" rx="42" ry="48"/>', '#f0d4b8') +
      `<circle cx="86" cy="76" r="15" fill="#fffdf8"/><circle cx="100" cy="70" r="16" fill="#fffdf8"/><circle cx="114" cy="76" r="15" fill="#fffdf8"/>
       <path d="M94 134 h12 l-6 6z" fill="#c98a7a" stroke="#c98a7a" stroke-width="3" stroke-linejoin="round"/>` +
      eyes(85, 115, 112, .85) + cheeks(72, 128, 134, 9) + mouth(100, 148, 9));
  };
  A.horse = () => svg(
    both(`<g class="ear"><path d="M62 54 L68 14 L92 46Z" fill="#b0703a"/><path d="M68 46 L70 26 L84 44Z" fill="#e8b98a"/></g>`) +
    head('<path d="M100 30 C140 30 152 62 150 102 C148 142 142 178 100 178 C58 178 52 142 50 102 C48 62 60 30 100 30Z"/>', '#b8763e') +
    `<path d="M100 48 q10 34 0 74 q-10 -40 0 -74z" fill="#fff" opacity=".85"/>
     <path d="M78 34 q8 -18 26 -10 q16 -6 22 10 q-12 0 -16 12 q-8 -10 -18 0 q-4 -10 -14 -12z" fill="#5a3518"/>
     <ellipse cx="100" cy="150" rx="42" ry="29" fill="#e8b98a"/>
     <ellipse cx="85" cy="146" rx="5" ry="7" fill="#8a5a36"/><ellipse cx="115" cy="146" rx="5" ry="7" fill="#8a5a36"/>` +
    eyes(72, 128, 92) + mouth(100, 165, 11));
  A.rooster = () => svg(
    `<path d="M72 56 q-4 -28 18 -24 q4 -24 24 -10 q20 -8 20 16 q14 8 4 22z" fill="#ff4b4b"/>` +
    head('<ellipse cx="100" cy="110" rx="62" ry="60"/>', '#fff4e2') +
    cheeks(60, 140, 120) + eyes(78, 122, 98) +
    `<path d="M93 134 q-6 24 7 28 q12 -4 7 -28z" fill="#ff4b4b"/>
     <path class="jaw" d="M89 122 L111 122 L100 144Z" fill="#f08c00" stroke="#f08c00" stroke-width="4" stroke-linejoin="round"/>
     <path d="M84 114 L116 114 L100 136Z" fill="#ffb02e" stroke="#ffb02e" stroke-width="4" stroke-linejoin="round"/>`);
  A.mouse = () => svg(
    both(`<g class="ear"><circle cx="50" cy="58" r="36" fill="#b9b6c8"/><circle cx="52" cy="60" r="23" fill="#ffc2d1"/></g>`) +
    head('<ellipse cx="100" cy="118" rx="60" ry="56"/>', '#c9c6d8') +
    `<circle cx="100" cy="134" r="9" fill="#ff7a9a"/>` + whiskers(136) +
    eyes(80, 120, 110) + cheeks(64, 136, 132) + mouth(100, 150, 9));
  A.bee = () => svg(
    `<g class="wingf">${both(`<ellipse cx="46" cy="60" rx="30" ry="18" fill="#e6f6ff" stroke="#bfe3f7" stroke-width="3" transform="rotate(-32 46 60)"/>`)}</g>` +
    both(`<path d="M84 52 Q76 30 66 22" stroke="#3a3340" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="64" cy="20" r="8" fill="#3a3340"/>`) +
    head('<circle cx="100" cy="112" r="64"/>', '#ffd23a') +
    `<path d="M40 82 Q100 56 160 82 L164 96 Q100 70 36 96Z" fill="#3a3340"/>` +
    eyes(78, 122, 112) + cheeks(60, 140, 132) + mouth(100, 140, 11));
  A.owl = () => svg(
    both(`<path d="M44 62 L38 22 L78 46Z" fill="#8a5a36"/>`) +
    head('<ellipse cx="100" cy="110" rx="68" ry="66"/>', '#a8774b') +
    `<circle cx="74" cy="98" r="30" fill="#f4e1c1"/><circle cx="126" cy="98" r="30" fill="#f4e1c1"/>
     <circle cx="74" cy="98" r="20" fill="#ffb547"/><circle cx="126" cy="98" r="20" fill="#ffb547"/>
     <path d="M74 150 q8 8 16 0 M110 150 q8 8 16 0 M92 162 q8 8 16 0" stroke="#8a5a36" stroke-width="4" fill="none" stroke-linecap="round"/>` +
    eyes(74, 126, 98, 1.25) +
    `<path class="jaw" d="M94 120 L106 120 L100 134Z" fill="#e58a14"/><path d="M90 112 L110 112 L100 130Z" fill="#ffa62b" stroke="#ffa62b" stroke-width="3" stroke-linejoin="round"/>`);
  A.rabbit = () => svg(
    `<g class="ear"><path d="M68 74 C54 44 56 2 76 2 C96 2 94 44 90 74Z" fill="#f2eeee"/><path d="M72 66 C64 42 66 14 76 14 C86 14 86 42 84 66Z" fill="#ffc2d1"/></g>` +
    `<g class="ear r"><path d="M110 74 C106 44 104 2 124 2 C144 2 146 44 132 74Z" fill="#f2eeee"/><path d="M116 66 C114 42 114 14 124 14 C134 14 136 42 128 66Z" fill="#ffc2d1"/></g>` +
    head('<ellipse cx="100" cy="122" rx="62" ry="56"/>', '#f6f2f2') +
    `<path d="M93 126 h14 l-7 8z" fill="#ff8fab" stroke="#ff8fab" stroke-width="3" stroke-linejoin="round"/>` +
    eyes(80, 120, 112) + cheeks(62, 138, 134) + mouth(100, 141, 9));
  A.bear = () => svg(
    both(`<g class="ear"><circle cx="50" cy="56" r="24" fill="#8e6040"/><circle cx="52" cy="58" r="13" fill="#d9a77c"/></g>`) +
    head('<ellipse cx="100" cy="112" rx="66" ry="62"/>', '#9a6a43') +
    `<ellipse cx="100" cy="136" rx="32" ry="24" fill="#e3b98d"/>
     <ellipse cx="100" cy="125" rx="12" ry="8.5" fill="${INK}"/><ellipse cx="96" cy="122" rx="4" ry="2.2" fill="#fff" opacity=".6"/>` +
    eyes(76, 124, 102) + cheeks(58, 142, 128) + mouth(100, 143, 9));
  A.monkey = () => svg(
    both(`<g class="ear"><circle cx="36" cy="108" r="22" fill="#8b5a3c"/><circle cx="38" cy="108" r="13" fill="#f0c9a0"/></g>`) +
    head('<circle cx="100" cy="106" r="64"/>', '#8b5a3c') +
    `<path d="M88 44 q12 -16 24 -2 q-12 0 -12 10z" fill="#6e432a"/>
     <path d="M100 78 C112 62 148 68 146 98 C146 122 132 158 100 158 C68 158 54 122 54 98 C52 68 88 62 100 78Z" fill="#f0c9a0"/>
     <circle cx="94" cy="122" r="3.4" fill="#8b5a3c"/><circle cx="106" cy="122" r="3.4" fill="#8b5a3c"/>` +
    eyes(80, 120, 102) + cheeks(66, 134, 126, 9) + mouth(100, 136, 15));
  A.squirrel = () => svg(
    `<g class="tail"><path d="M136 160 C196 156 206 80 172 46 C148 24 114 38 126 62 C150 60 172 84 160 114 C150 136 126 136 136 160Z" fill="#c76e27"/>
     <path d="M150 140 C182 130 186 86 166 64 C176 90 170 116 150 140Z" fill="#e8964a"/></g>` +
    both(`<g class="ear"><path d="M54 68 L56 26 L90 52Z" fill="#d9853b"/><path d="M56 30 q-4 -12 4 -16 q2 8 6 10z" fill="#c76e27"/></g>`) +
    head('<ellipse cx="96" cy="112" rx="60" ry="58"/>', '#e08b3f') +
    `<ellipse cx="76" cy="132" rx="22" ry="16" fill="#fff1e0"/><ellipse cx="116" cy="132" rx="22" ry="16" fill="#fff1e0"/>
     <ellipse cx="96" cy="122" rx="7" ry="5" fill="#5b2b30"/>` +
    eyes(76, 118, 102) + mouth(96, 138, 8));
  A.parrot = () => svg(
    `<path d="M92 46 q-14 -30 -2 -40 q6 18 12 30z" fill="#ffd23a"/><path d="M102 42 q2 -32 18 -36 q-4 18 -8 34z" fill="#ff9a2e"/><path d="M84 52 q-26 -18 -22 -34 q12 14 26 22z" fill="#2fb6ff"/>` +
    head('<circle cx="100" cy="104" r="64"/>', '#ff5a4e') +
    `<ellipse cx="74" cy="92" rx="24" ry="22" fill="#fff"/><ellipse cx="126" cy="92" rx="24" ry="22" fill="#fff"/>` +
    eyes(76, 124, 92, .95) +
    `<g class="jaw"><path d="M84 132 Q100 158 116 132 Q100 140 84 132Z" fill="#c99a4a"/></g>
     <path d="M76 114 Q100 94 124 114 Q120 138 100 152 Q80 138 76 114Z" fill="#fbe2a6"/>
     <path d="M92 142 Q100 152 108 142 Q104 154 100 156 Q96 154 92 142Z" fill="#3a3340"/>
     <ellipse cx="90" cy="112" rx="3" ry="2" fill="#c99a4a"/><ellipse cx="110" cy="112" rx="3" ry="2" fill="#c99a4a"/>`, 'parrot');

  /* ---------- еда ---------- */
  const F = {};
  const shine = (x, y, rx, ry, rot = -25) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".45" transform="rotate(${rot} ${x} ${y})"/>`;
  const fsvg = inner => `<svg class="food-art" viewBox="0 0 200 200" overflow="visible">${inner}</svg>`;
  F.carrot = () => fsvg(
    `<path d="M100 52 q-16 -30 -6 -44 q8 18 10 40z" fill="#4cc35a"/><path d="M100 52 q2 -36 22 -44 q-6 22 -18 46z" fill="#3aa84a"/><path d="M98 54 q-30 -20 -34 -38 q20 10 36 34z" fill="#5fd36a"/>
     <path d="M66 62 Q100 46 134 62 Q140 70 134 86 L108 182 Q100 196 92 182 L66 86 Q60 70 66 62Z" fill="#ff8a2a"/>
     <path d="M76 92 h16 M84 122 h14 M102 104 h18 M96 150 h10" stroke="#e8701a" stroke-width="5" stroke-linecap="round"/>` + shine(82, 76, 8, 16, 0));
  F.banana = () => fsvg(
    `<path d="M48 40 C34 120 100 186 176 136 C176 128 170 124 164 126 C110 154 64 116 66 44Z" fill="#ffd93d"/>
     <path d="M66 44 C64 116 110 154 164 126 C120 140 80 110 72 46Z" fill="#f2c200"/>
     <path d="M46 40 l2 -16 l18 2 l0 18z" fill="#8a6a2a"/><circle cx="176" cy="132" r="5" fill="#6b4a1e"/>` + shine(58, 96, 6, 26, 10));
  F.honey = () => fsvg(
    `<path d="M48 84 Q36 176 100 178 Q164 176 152 84Z" fill="#d18a3d"/>
     <path d="M48 110 Q100 124 152 110 L150 128 Q100 142 50 128Z" fill="#b8722a"/>
     <rect x="42" y="64" width="116" height="26" rx="13" fill="#e8a256"/>
     <path d="M54 72 Q60 96 66 72 Q72 108 80 72 Q100 82 120 72 Q126 100 134 72Z" fill="#ffc21a"/>
     <path d="M118 30 l6 46" stroke="#a86a2a" stroke-width="8" stroke-linecap="round"/><ellipse cx="116" cy="28" rx="12" ry="8" fill="#a86a2a"/>` + shine(70, 140, 8, 20, 10));
  F.bone = () => fsvg(
    `<g transform="rotate(-25 100 100)"><circle cx="48" cy="80" r="24" fill="#fff6e8"/><circle cx="48" cy="120" r="24" fill="#fff6e8"/>
     <circle cx="152" cy="80" r="24" fill="#fff6e8"/><circle cx="152" cy="120" r="24" fill="#fff6e8"/>
     <rect x="48" y="82" width="104" height="36" fill="#fff6e8"/><path d="M48 114 h104" stroke="#e8d8c0" stroke-width="6"/></g>`);
  F.milk = () => fsvg(
    `<path d="M76 44 h48 v20 q22 16 22 42 v70 q0 12 -12 12 h-68 q-12 0 -12 -12 v-70 q0 -26 22 -42z" fill="#fff"/>
     <rect x="72" y="26" width="56" height="22" rx="8" fill="#2f8cf0"/>
     <path d="M54 110 h92 v44 h-92z" fill="#cfe9ff"/>
     <path d="M86 122 c8 -6 18 0 14 8 c-6 6 -16 2 -14 -8z M110 136 c6 -4 14 2 10 8 c-4 4 -12 0 -10 -8z" fill="#3a3340"/>
     <path d="M54 106 q46 -10 92 0" stroke="#e6eef5" stroke-width="4" fill="none"/>` + shine(66, 90, 6, 16, 0));
  F.cheese = () => fsvg(
    `<path d="M24 138 L176 138 L176 96 L64 58Z" fill="#ffc933"/><path d="M24 138 L64 58 L176 96 L24 96Z" fill="#ffdc5e" opacity="0"/>
     <path d="M24 138 L176 138 L176 172 L24 172Z" fill="#f2b000"/><path d="M24 138 L64 58 L176 96 L176 138Z" fill="#ffd84d"/>
     <ellipse cx="80" cy="152" rx="10" ry="8" fill="#d99a00"/><ellipse cx="140" cy="158" rx="7" ry="6" fill="#d99a00"/>
     <ellipse cx="110" cy="104" rx="12" ry="7" fill="#e8b000"/><ellipse cx="72" cy="96" rx="7" ry="4" fill="#e8b000"/><ellipse cx="150" cy="120" rx="8" ry="5" fill="#e8b000"/>`);
  F.nut = () => fsvg(
    `<ellipse cx="100" cy="122" rx="48" ry="56" fill="#d9a066"/><path d="M100 178 q-6 8 0 14 q6 -6 0 -14z" fill="#b07a3e"/>
     <path d="M44 92 Q100 40 156 92 Q160 104 148 106 Q100 96 52 106 Q40 104 44 92Z" fill="#8a5a2c"/>
     <path d="M60 86 l10 10 M80 76 l10 12 M100 72 l8 14 M120 76 l6 14 M140 86 l2 12" stroke="#6e4420" stroke-width="4" stroke-linecap="round"/>
     <path d="M100 58 q4 -18 16 -22" stroke="#6e4420" stroke-width="7" stroke-linecap="round" fill="none"/>` + shine(80, 128, 9, 18, 10));
  F.apple = () => fsvg(
    `<path d="M100 60 C70 36 26 56 30 104 C34 152 70 186 100 172 C130 186 166 152 170 104 C174 56 130 36 100 60Z" fill="#ff4b4b"/>
     <path d="M100 172 C130 186 166 152 170 104 C164 140 134 168 100 172Z" fill="#d9302f"/>
     <path d="M100 62 q-2 -26 10 -40" stroke="#7a4a22" stroke-width="7" stroke-linecap="round" fill="none"/>
     <path d="M108 36 q30 -18 46 4 q-26 14 -46 -4z" fill="#4cc35a"/>` + shine(62, 88, 12, 22));
  F.strawberry = () => fsvg(
    `<path d="M100 64 C60 52 28 76 40 110 C52 146 84 182 100 186 C116 182 148 146 160 110 C172 76 140 52 100 64Z" fill="#ff3d57"/>
     ${[[70, 92], [100, 88], [130, 92], [60, 120], [88, 116], [116, 116], [142, 120], [76, 146], [104, 144], [128, 146], [100, 168]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="5" fill="#ffe08a"/>`).join('')}
     <path d="M100 66 L72 48 L90 58 L84 36 L100 54 L116 36 L110 58 L128 48Z" fill="#3aa84a" stroke="#3aa84a" stroke-width="6" stroke-linejoin="round"/>` + shine(66, 104, 7, 16, 20));
  F.cookie = () => fsvg(
    `<circle cx="100" cy="104" r="72" fill="#c98a4a"/><circle cx="100" cy="100" r="72" fill="#e3a764"/>
     ${[[70, 72], [118, 66], [140, 104], [86, 110], [112, 134], [64, 138], [96, 84], [132, 144]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="${9 - i % 3}" ry="${7 - i % 3}" fill="#5a3318"/>`).join('')}` + shine(72, 60, 14, 7, -20));

  /* ---------- предметы интерфейса ---------- */
  const UI = {
    home: `<svg viewBox="0 0 100 100"><path d="M50 16 L88 48 L80 48 L80 84 L20 84 L20 48 L12 48Z" fill="#ff6b5b" stroke="#ff6b5b" stroke-width="6" stroke-linejoin="round"/>
      <rect x="40" y="58" width="20" height="26" rx="4" fill="#fff"/></svg>`,
    play: `<svg viewBox="0 0 100 100"><path d="M36 22 L80 50 L36 78Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/></svg>`,
    star: (on = true) => `<svg viewBox="0 0 100 100"><path d="M50 6 L62 37 L95 38 L69 58 L79 90 L50 71 L21 90 L31 58 L5 38 L38 37Z" fill="${on ? '#ffd23a' : '#fff'}" stroke="${on ? '#f0a800' : '#d8e4ee'}" stroke-width="6" stroke-linejoin="round"/>
      ${on ? '<ellipse cx="40" cy="40" rx="8" ry="5" fill="#fff" opacity=".6" transform="rotate(-30 40 40)"/>' : ''}</svg>`,
    note: on => `<svg viewBox="0 0 100 100"><path d="M40 70 V24 L78 16 V62" stroke="#fff" stroke-width="9" fill="none" stroke-linejoin="round"/>
      <ellipse cx="30" cy="72" rx="13" ry="10" fill="#fff"/><ellipse cx="68" cy="64" rx="13" ry="10" fill="#fff"/>
      ${on ? '' : '<path d="M14 14 L86 86" stroke="#ff5a5a" stroke-width="10" stroke-linecap="round"/>'}</svg>`,
    crown: `<svg viewBox="0 0 100 100"><path d="M14 74 L10 30 L32 48 L50 20 L68 48 L90 30 L86 74Z" fill="#ffd23a" stroke="#f0a800" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="50" cy="56" r="7" fill="#ff5a7a"/><circle cx="28" cy="62" r="5" fill="#2fb6ff"/><circle cx="72" cy="62" r="5" fill="#4cc35a"/></svg>`,
    magnifier: `<svg viewBox="0 0 200 200"><path d="M128 128 L178 178" stroke="#8a5a36" stroke-width="26" stroke-linecap="round"/>
      <circle cx="88" cy="88" r="62" fill="#cfefff" stroke="#ff9a2e" stroke-width="16"/><ellipse cx="66" cy="66" rx="20" ry="11" fill="#fff" opacity=".8" transform="rotate(-35 66 66)"/></svg>`,
    hand: `<svg viewBox="0 0 100 120"><path d="M38 60 V18 a8 8 0 0 1 16 0 V52 V44 a8 8 0 0 1 16 0 V56 V50 a8 8 0 0 1 15 0 V80 C85 100 72 114 54 114 C38 114 30 104 22 90 L10 70 a8 8 0 0 1 13 -9 L38 76Z"
      fill="#fff" stroke="#3a3340" stroke-width="5" stroke-linejoin="round"/></svg>`,
  };

  /* ---------- тела: персонажи в полный рост ----------
     Голова (риг выше) сажается на тело. Части с классами для анимации:
     .body-root (дыхание), .head-g (наклон), .tail (виляет), .arm (руки/крылья), .leg (ноги). */
  function shade(shape, color) {
    const id = 'b' + uid++;
    return `<defs><clipPath id="${id}">${shape}</clipPath></defs><g fill="${color}">${shape}</g>
      <g clip-path="url(#${id})"><ellipse cx="100" cy="256" rx="96" ry="44" fill="#000" opacity=".1"/>
      <ellipse cx="76" cy="168" rx="20" ry="11" fill="#fff" opacity=".22" transform="rotate(-25 76 168)"/></g>`;
  }
  function leg(x, y1, y2, w, c, hoof, cls = '') {
    const id = 'l' + uid++, r = `<rect x="${x - w / 2}" y="${y1}" width="${w}" height="${y2 - y1}" rx="${w / 2}"/>`;
    return `<g class="leg ${cls}"><defs><clipPath id="${id}">${r}</clipPath></defs><g fill="${c}">${r}</g>
      ${hoof ? `<g clip-path="url(#${id})"><rect x="${x - w}" y="${y2 - 10}" width="${w * 2}" height="12" fill="${hoof}"/></g>` : ''}</g>`;
  }
  const BODY = {
    cow:      { t: 'quad', body: '#fffaf2', belly: '#f3e8da', leg: '#fffaf2', hoof: '#6b5a52' },
    cat:      { t: 'quad', body: '#ffad57', belly: '#fff1e0', leg: '#ffad57', hoof: '#fff1e0' },
    dog:      { t: 'quad', body: '#e2ab6f', belly: '#fbe4c6', leg: '#e2ab6f', hoof: '#fbe4c6' },
    pig:      { t: 'quad', body: '#ffb6c8', belly: '#ffd2de', leg: '#ffb6c8', hoof: '#ff8fab' },
    horse:    { t: 'quad', body: '#b8763e', belly: '#e8b98a', leg: '#b8763e', hoof: '#5a3518' },
    sheep:    { t: 'sheep', body: '#fffdf8', leg: '#5a4a44' },
    mouse:    { t: 'biped', body: '#c9c6d8', belly: '#efedf6', foot: '#ffc2d1' },
    rabbit:   { t: 'biped', body: '#f6f2f2', belly: '#ffffff', foot: '#ece6e6' },
    bear:     { t: 'biped', body: '#9a6a43', belly: '#e3b98d', foot: '#8e6040' },
    monkey:   { t: 'biped', body: '#8b5a3c', belly: '#f0c9a0', foot: '#f0c9a0' },
    squirrel: { t: 'biped', body: '#e08b3f', belly: '#fff1e0', foot: '#c76e27' },
    duck:     { t: 'bird', body: '#ffd84d', belly: '#ffe680', wing: '#ffc933', foot: '#ff9a2e' },
    rooster:  { t: 'bird', body: '#fff4e2', belly: '#ffffff', wing: '#efd8b8', foot: '#ffb02e' },
    owl:      { t: 'bird', body: '#a8774b', belly: '#f4e1c1', wing: '#8a5a36', foot: '#ffa62b' },
    parrot:   { t: 'bird', body: '#ff5a4e', belly: '#ff8a5a', wing: '#2fb6ff', foot: '#8c8c9a' },
    frog:     { t: 'frog', body: '#7fd35a', belly: '#d4f5b0' },
    bee:      { t: 'bee', body: '#ffd23a' },
  };
  const TAIL = {
    cow: () => `<g class="tail"><path d="M140 194 C158 190 166 176 164 160" stroke="#fffaf2" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M164 164 q-9 -12 1 -19 q9 6 5 19z" fill="#3a3340"/></g>`,
    cat: () => `<g class="tail"><path d="M136 214 C174 212 178 170 160 148" stroke="#ffad57" stroke-width="13" fill="none" stroke-linecap="round"/><circle cx="160" cy="149" r="6.5" fill="#e8842a"/></g>`,
    dog: () => `<g class="tail"><path d="M136 200 C156 196 166 180 168 160" stroke="#c98f55" stroke-width="12" fill="none" stroke-linecap="round"/></g>`,
    pig: () => `<g class="tail"><path d="M142 196 c10 -2 14 -12 6 -16 c-8 -4 -12 6 -4 10 c8 4 16 -2 16 -10" stroke="#ff8fab" stroke-width="5" fill="none" stroke-linecap="round"/></g>`,
    horse: () => `<g class="tail"><path d="M140 188 C172 184 178 214 166 242 C158 222 150 210 140 204Z" fill="#5a3518"/></g>`,
    sheep: () => `<circle cx="148" cy="200" r="13" fill="#fffdf8"/>`,
    mouse: () => `<g class="tail"><path d="M134 224 C172 230 180 196 162 184" stroke="#ffb3c6" stroke-width="5" fill="none" stroke-linecap="round"/></g>`,
    rabbit: () => `<circle cx="140" cy="224" r="13" fill="#fff"/>`,
    monkey: () => `<g class="tail"><path d="M134 222 C174 232 188 190 168 176 C156 168 146 182 160 188" stroke="#8b5a3c" stroke-width="9" fill="none" stroke-linecap="round"/></g>`,
    duck: () => `<g class="tail"><path d="M138 208 q20 -6 22 -24 q-14 6 -26 10z" fill="#ffc933"/></g>`,
    rooster: () => `<g class="tail"><path d="M136 200 C148 158 180 148 188 170 C172 168 156 184 146 208Z" fill="#ff5a3a"/>
      <path d="M138 206 C160 174 192 176 192 198 C178 192 160 200 146 214Z" fill="#2faa5a"/>
      <path d="M138 212 C162 196 188 206 184 224 C170 214 156 216 144 220Z" fill="#ff9a2e"/></g>`,
    parrot: () => `<path d="M90 222 L82 256 Q100 262 118 256 L110 222Z" fill="#2fb6ff"/><path d="M96 224 L94 256 Q100 258 106 256 L104 224Z" fill="#ffd23a"/>`,
  };
  const TORSO = {
    quad: (c, id) => `<g class="back" style="filter:brightness(.9)">${leg(66, 190, 238, 17, c.leg, c.hoof, 'l')}${leg(134, 190, 238, 17, c.leg, c.hoof, 'r')}</g>
      ${shade('<ellipse cx="100" cy="188" rx="48" ry="40"/>', c.body)}
      <ellipse cx="100" cy="202" rx="28" ry="21" fill="${c.belly}"/>
      ${id === 'cow' ? '<path d="M64 178 c8 -12 26 -8 26 6 c0 12 -18 14 -26 -6z" fill="#3a3340"/><path d="M122 200 c6 -9 22 -7 22 4 c-2 11 -18 11 -22 -4z" fill="#3a3340"/>' : ''}
      ${leg(82, 204, 244, 19, c.leg, c.hoof, 'l')}${leg(118, 204, 244, 19, c.leg, c.hoof, 'r')}`,
    biped: c => `${shade('<ellipse cx="100" cy="196" rx="42" ry="40"/>', c.body)}
      <ellipse cx="100" cy="204" rx="27" ry="26" fill="${c.belly}"/>
      <g class="leg l"><ellipse cx="80" cy="236" rx="18" ry="11" fill="${c.foot}"/></g><g class="leg r"><ellipse cx="120" cy="236" rx="18" ry="11" fill="${c.foot}"/></g>
      <g class="arm l"><ellipse cx="62" cy="194" rx="12" ry="24" fill="${c.body}" transform="rotate(18 62 194)"/></g>
      <g class="arm r"><ellipse cx="138" cy="194" rx="12" ry="24" fill="${c.body}" transform="rotate(-18 138 194)"/></g>`,
    bird: (c, id) => `${shade('<path d="M100 142 C134 142 146 176 146 204 C146 228 126 240 100 240 C74 240 54 228 54 204 C54 176 66 142 100 142Z"/>', c.body)}
      <ellipse cx="100" cy="208" rx="29" ry="26" fill="${c.belly}"/>
      ${id === 'owl' ? '<path d="M86 200 q6 6 12 0 M102 200 q6 6 12 0 M94 214 q6 6 12 0" stroke="#c9a77c" stroke-width="3.5" fill="none" stroke-linecap="round"/>' : ''}
      <g class="arm l"><path d="M60 164 C38 176 34 214 52 230 C62 214 68 194 68 170Z" fill="${c.wing}"/></g>
      <g class="arm r"><path d="M140 164 C162 176 166 214 148 230 C138 214 132 194 132 170Z" fill="${c.wing}"/></g>
      <g class="leg l"><path d="M86 236 v6 l-8 5 M86 242 v7 M86 242 l8 5" stroke="${c.foot}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>
      <g class="leg r"><path d="M114 236 v6 l-8 5 M114 242 v7 M114 242 l8 5" stroke="${c.foot}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`,
    sheep: c => {
      const puffs = [[66, 184], [80, 164], [100, 158], [120, 164], [134, 184], [132, 208], [100, 218], [68, 208], [100, 190]];
      return `${leg(72, 196, 238, 12, c.leg, null, 'l')}${leg(128, 196, 238, 12, c.leg, null, 'r')}
        ${puffs.map(([x, y]) => `<circle cx="${x}" cy="${y + 4}" r="23" fill="#e9e1d3"/>`).join('')}${puffs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="23" fill="${c.body}"/>`).join('')}
        ${leg(88, 212, 244, 12, c.leg, null, 'l')}${leg(112, 212, 244, 12, c.leg, null, 'r')}`;
    },
    frog: c => `<g class="leg l"><ellipse cx="56" cy="222" rx="26" ry="17" fill="${c.body}"/><ellipse cx="42" cy="238" rx="17" ry="7" fill="#5fb840"/></g>
      <g class="leg r"><ellipse cx="144" cy="222" rx="26" ry="17" fill="${c.body}"/><ellipse cx="158" cy="238" rx="17" ry="7" fill="#5fb840"/></g>
      ${shade('<ellipse cx="100" cy="204" rx="50" ry="38"/>', c.body)}
      <ellipse cx="100" cy="214" rx="31" ry="23" fill="${c.belly}"/>
      <ellipse cx="80" cy="238" rx="13" ry="7" fill="#5fb840"/><ellipse cx="120" cy="238" rx="13" ry="7" fill="#5fb840"/>`,
    bee: c => {
      const id = 'e' + uid++, sh = '<ellipse cx="100" cy="196" rx="36" ry="34"/>';
      return `<path d="M84 224 l-6 12 M116 224 l6 12" stroke="#3a3340" stroke-width="4" stroke-linecap="round"/>
        <path d="M93 226 L100 246 L107 226Z" fill="#3a3340"/>
        <defs><clipPath id="${id}">${sh}</clipPath></defs><g fill="${c.body}">${sh}</g>
        <g clip-path="url(#${id})"><rect x="50" y="186" width="100" height="12" fill="#3a3340"/><rect x="50" y="210" width="100" height="12" fill="#3a3340"/>
        <ellipse cx="100" cy="240" rx="50" ry="18" fill="#000" opacity=".1"/></g>`;
    },
  };
  const HEAD_DY = { quad: 17, biped: 23, bird: 13, sheep: 7, frog: 29, bee: 21 };
  function char(id) {
    const c = BODY[id];
    if (!c) return headSvg(id);
    return `<svg class="char full${id === 'parrot' ? ' parrot' : ''}${c.t === 'bee' ? ' flyer' : ''}" viewBox="0 0 200 250" overflow="visible">
      <ellipse class="shadow" cx="100" cy="245" rx="54" ry="8" fill="#1e3c1e" opacity=".16"/>
      <g class="body-root">${TAIL[id] ? TAIL[id](c) : ''}${TORSO[c.t](c, id)}
      <g transform="translate(17 ${HEAD_DY[c.t]}) scale(.83)"><g class="head-g">${A[id]()}</g></g></g></svg>`;
  }
  const headSvg = id => `<svg class="char head${id === 'parrot' ? ' parrot' : ''}" viewBox="0 0 200 200" overflow="visible">${A[id]()}</svg>`;

  /* ---------- реквизит сцен ---------- */
  const P = {};
  P.sun = `<svg viewBox="-130 -130 260 260" overflow="visible"><g class="rays">${Array.from({ length: 12 }, (_, i) => `<path d="M0 -122 L15 -90 L-15 -90Z" fill="#ffc93c" transform="rotate(${i * 30})"/>`).join('')}</g>
    <circle r="84" fill="#ffd23a"/><circle r="70" fill="#ffe066"/><ellipse cx="-26" cy="-34" rx="22" ry="12" fill="#fff" opacity=".35" transform="rotate(-30 -26 -34)"/>
    <g class="look">${''}<g class="eye"><g class="eo"><ellipse cx="-24" cy="-8" rx="8" ry="10" fill="${INK}"/><circle cx="-21" cy="-12" r="3" fill="#fff"/></g><path class="eh" d="M-32 -6 Q-24 -16 -16 -6" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/></g>
    <g class="eye"><g class="eo"><ellipse cx="24" cy="-8" rx="8" ry="10" fill="${INK}"/><circle cx="27" cy="-12" r="3" fill="#fff"/></g><path class="eh" d="M16 -6 Q24 -16 32 -6" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/></g></g>
    <path d="M-20 18 Q0 36 20 18" stroke="#c9741a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="-46" cy="14" rx="13" ry="8" fill="#ff8a5a" opacity=".45"/><ellipse cx="46" cy="14" rx="13" ry="8" fill="#ff8a5a" opacity=".45"/></svg>`;
  P.cloud = `<svg viewBox="0 0 170 80" overflow="visible"><path d="M20 72 C0 72 0 42 26 42 C30 14 70 6 84 30 C96 10 140 14 140 46 C166 44 170 72 148 72Z" fill="#fff"/>
    <path d="M20 72 C10 72 4 64 8 56 C30 66 120 68 162 58 C164 68 156 72 148 72Z" fill="#dcecf8"/></svg>`;
  P.tree = (c = '#4fb84a', fruit = '#ff5a5a') => `<svg viewBox="-100 -90 200 220" overflow="visible"><path d="M-14 20 Q-10 90 -22 126 L22 126 Q10 90 14 20Z" fill="#9a6a43"/><path d="M4 30 Q8 90 0 124 L22 126 Q10 90 14 20Z" fill="#7a4f30" opacity=".5"/>
    <g class="crown"><circle cx="0" cy="-10" r="62" fill="${c}"/><circle cx="-48" cy="24" r="44" fill="${c}"/><circle cx="48" cy="24" r="44" fill="${c}"/>
    <circle cx="0" cy="40" r="40" fill="#000" opacity=".08"/><circle cx="-18" cy="-30" r="26" fill="#fff" opacity=".14"/>
    ${fruit ? `<circle cx="26" cy="44" r="8" fill="${fruit}"/><circle cx="-34" cy="22" r="8" fill="${fruit}"/><circle cx="22" cy="0" r="8" fill="${fruit}"/><circle cx="-8" cy="36" r="8" fill="${fruit}"/>` : ''}</g></svg>`;
  P.pine = `<svg viewBox="-50 -110 100 160" overflow="visible"><rect x="-7" y="20" width="14" height="28" rx="4" fill="#7a4f30"/>
    <path d="M0 -106 L40 -40 L22 -40 L48 6 L28 6 L54 30 L-54 30 L-28 6 L-48 6 L-22 -40 L-40 -40Z" fill="#3f9a52"/><path d="M0 -106 L40 -40 L22 -40 L48 6 L28 6 L54 30 L0 30Z" fill="#000" opacity=".1"/></svg>`;
  P.flower = c => `<svg viewBox="-30 -30 60 90" overflow="visible"><path d="M0 4 Q4 30 0 58" stroke="#3a9a3e" stroke-width="5" fill="none"/><path d="M0 40 q-18 -6 -20 -18 q14 0 20 12z" fill="#4fb84a"/>
    <g class="petals">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-13" rx="9" ry="13" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="8" fill="#ffd23a"/><circle cx="-2" cy="-2" r="3" fill="#fff" opacity=".6"/></g></svg>`;
  P.bush = `<svg viewBox="0 0 240 140" overflow="visible"><circle cx="60" cy="90" r="56" fill="#5cbf4c"/><circle cx="130" cy="70" r="66" fill="#5cbf4c"/><circle cx="196" cy="96" r="48" fill="#5cbf4c"/>
    <circle cx="110" cy="120" r="60" fill="#4fae40"/><circle cx="118" cy="44" r="26" fill="#fff" opacity=".12"/>
    <circle cx="80" cy="70" r="6" fill="#ff8ab3"/><circle cx="150" cy="56" r="6" fill="#fff"/><circle cx="190" cy="84" r="6" fill="#ff8ab3"/><circle cx="120" cy="96" r="6" fill="#fff"/></svg>`;
  P.butterfly = c => `<svg viewBox="-30 -24 60 48" overflow="visible"><g class="wing l"><ellipse cx="-12" cy="-8" rx="13" ry="11" fill="${c}"/><ellipse cx="-10" cy="10" rx="9" ry="8" fill="${c}" opacity=".85"/><circle cx="-14" cy="-9" r="4" fill="#fff" opacity=".6"/></g>
    <g class="wing r"><ellipse cx="12" cy="-8" rx="13" ry="11" fill="${c}"/><ellipse cx="10" cy="10" rx="9" ry="8" fill="${c}" opacity=".85"/><circle cx="14" cy="-9" r="4" fill="#fff" opacity=".6"/></g>
    <ellipse rx="3.5" ry="14" fill="#3a3340"/><path d="M-2 -13 q-6 -10 -10 -10 M2 -13 q6 -10 10 -10" stroke="#3a3340" stroke-width="2" fill="none"/></svg>`;
  P.barn = `<svg viewBox="-150 -90 300 300" overflow="visible">
    <path d="M-120 40 L0 -60 L120 40 L120 200 L-120 200Z" fill="#e8483d"/><path d="M40 -26 L120 40 L120 200 L40 200Z" fill="#000" opacity=".08"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M-120 ${50 + i * 20} H120" stroke="#c93a30" stroke-width="3" opacity=".5"/>`).join('')}
    <path d="M-138 52 L0 -78 L138 52 L118 52 L0 -56 L-118 52Z" fill="#7a4a3a"/>
    <rect x="-52" y="80" width="104" height="120" rx="4" fill="#fff4e2"/><rect x="-44" y="88" width="88" height="112" fill="#b8352c"/>
    <path d="M-44 88 L44 200 M44 88 L-44 200" stroke="#fff4e2" stroke-width="8"/><path d="M0 88 V200" stroke="#fff4e2" stroke-width="6"/>
    <circle cx="0" cy="10" r="24" fill="#fff4e2"/><circle cx="0" cy="10" r="16" fill="#5a3418"/><path d="M-16 10 H16 M0 -6 V26" stroke="#fff4e2" stroke-width="4"/></svg>`;
  P.windmill = `<svg viewBox="-80 -90 160 220" overflow="visible"><path d="M-22 120 L-12 -10 L12 -10 L22 120Z" fill="#fff4e2"/><path d="M0 -10 L12 -10 L22 120 L4 120Z" fill="#000" opacity=".07"/>
    <path d="M-18 -10 L0 -34 L18 -10Z" fill="#e8483d"/><rect x="-8" y="86" width="16" height="34" rx="8" fill="#b8763e"/>
    <g class="blades" transform="translate(0 -14)">${[0, 90, 180, 270].map(a => `<g transform="rotate(${a})"><rect x="-5" y="-78" width="10" height="72" rx="4" fill="#b8763e"/><rect x="5" y="-74" width="18" height="56" rx="3" fill="#fff" stroke="#d8c7ae" stroke-width="2"/></g>`).join('')}<circle r="8" fill="#7a4a3a"/></g></svg>`;
  P.hay = `<svg viewBox="0 0 120 80" overflow="visible"><rect x="4" y="10" width="112" height="66" rx="14" fill="#f2c94c"/><rect x="4" y="10" width="112" height="22" rx="10" fill="#ffe08a"/>
    <path d="M30 14 V74 M90 14 V74" stroke="#c99a2e" stroke-width="5"/><path d="M14 40 l8 -6 M50 52 l8 -6 M70 30 l8 -6 M100 56 l8 -6" stroke="#d9ac3a" stroke-width="3"/></svg>`;
  P.basket = `<svg viewBox="0 0 160 130" overflow="visible"><path d="M30 50 Q80 -20 130 50" stroke="#a86a2a" stroke-width="10" fill="none"/>
    <path d="M12 50 H148 L134 122 H26Z" fill="#d18a3d"/>${[0, 1, 2].map(i => `<path d="M16 ${66 + i * 18} H144" stroke="#b8722a" stroke-width="5"/>`).join('')}
    <path d="M10 46 H150 V58 H10Z" fill="#e8a256"/><path d="M40 46 q20 -26 44 -4 q16 -18 36 4z" fill="#ff6b6b"/><path d="M52 44 q8 -10 18 0z" fill="#fff" opacity=".5"/></svg>`;
  P.hab = `<svg viewBox="-60 -70 120 170" overflow="visible"><path d="M0 -66 C40 -66 56 -36 56 -10 C56 22 26 40 14 54 L-14 54 C-26 40 -56 22 -56 -10 C-56 -36 -40 -66 0 -66Z" fill="#ff6b6b"/>
    <path d="M0 -66 C18 -66 22 -36 22 -10 C22 22 10 40 6 54 L-6 54 C-10 40 -22 22 -22 -10 C-22 -36 -18 -66 0 -66Z" fill="#ffd23a"/>
    <path d="M-14 54 L-12 74 M14 54 L12 74" stroke="#8a6a4a" stroke-width="2"/><rect x="-14" y="72" width="28" height="22" rx="4" fill="#b8763e"/></svg>`;
  P.plate = `<svg viewBox="0 0 200 80" overflow="visible"><ellipse cx="100" cy="46" rx="94" ry="30" fill="#d8e2ee"/><ellipse cx="100" cy="40" rx="94" ry="30" fill="#fff"/><ellipse cx="100" cy="40" rx="66" ry="19" fill="#eef3f9"/></svg>`;

  // зелёный холм на всю ширину; верх — фигурный, низ уходит за экран
  function hill(d, c1, c2) {
    const id = 'g' + uid++;
    return `<svg viewBox="0 0 1000 300" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><path d="${d}" fill="url(#${id})"/></svg>`;
  }
  const scallop = (y, step = 50, dip = 16) => { let d = `M0 ${y}`; for (let x = 0; x < 1000; x += step) d += ` Q${x + step / 2} ${y - dip} ${x + step} ${y}`; return d + ' L1000 300 L0 300Z'; };
  const at = (cls, style, inner, tap) => `<div class="prop ${cls}" style="${style}"${tap ? ` data-tap="${tap}"` : ''}>${inner}</div>`;
  const FLOWER_C = ['#ff7aa8', '#b28cff', '#ffb02e', '#7ac8ff', '#ff6b6b', '#ffffff'];

  function scene(kind = 'meadow') {
    if (kind === 'sorter') return room();
    let s = `<div class="sc sc-${kind}"><div class="sky"></div><div class="glow"></div>`;
    s += at('sun', '', P.sun, 'sun');
    s += [[8, -10, 1], [20, -55, .7], [4, -80, .85], [28, -30, .55]].map(([top, d, sc]) =>
      at('cloud', `top:${top}%;--cd:${d}s;--cs:${sc}`, P.cloud, 'cloud')).join('');
    s += `<div class="birds"><svg viewBox="0 0 120 40"><path d="M0 14 Q10 4 20 14 Q30 4 40 14 M50 26 Q58 18 66 26 Q74 18 82 26 M86 8 Q93 1 100 8 Q107 1 114 8" stroke="#5a6a8a" stroke-width="3" fill="none" stroke-linecap="round"/></svg></div>`;
    if (kind === 'balloons') s += at('hab', '', P.hab, 'hab');
    s += `<div class="layer far">${hill('M0 150 C150 60 300 80 450 120 C600 160 780 40 1000 90 L1000 300 L0 300Z', '#cdeec0', '#b8e3a4')}</div>`;
    s += at('pine far-tree', 'left:58%;bottom:36%;width:6vmin', P.pine) + at('pine far-tree', 'left:63%;bottom:35%;width:5vmin', P.pine) + at('pine far-tree', 'left:20%;bottom:38%;width:5.5vmin', P.pine);
    if (kind === 'farm' || kind === 'meadow') s += at('windmill', 'right:14%;bottom:33%;width:13vmin', P.windmill, 'windmill');
    s += `<div class="layer mid">${hill('M0 90 C200 30 380 50 560 80 C740 110 860 40 1000 60 L1000 300 L0 300Z', '#a8e486', '#8fd96b')}</div>`;
    if (kind === 'farm') {
      s += at('barn', 'left:2%;bottom:20%;width:36vmin', P.barn, 'barn');
      s += `<div class="fence"></div>`;
      s += at('hay', 'right:4%;bottom:15%;width:16vmin', P.hay, 'hay');
      s += at('tree', 'right:26%;bottom:24%;width:22vmin', P.tree(), 'tree');
    } else if (kind === 'meadow') {
      s += at('tree', 'left:3%;bottom:20%;width:26vmin', P.tree(), 'tree') + at('tree', 'right:2%;bottom:22%;width:20vmin', P.tree('#5cbf4c', '#ffb02e'), 'tree');
    } else if (kind === 'picnic') {
      s += at('tree', 'left:-2%;bottom:24%;width:30vmin', P.tree(), 'tree') + at('tree', 'right:-1%;bottom:26%;width:22vmin', P.tree('#5cbf4c', '#ffb02e'), 'tree');
    } else if (kind === 'balloons') {
      s += at('tree', 'left:4%;bottom:14%;width:18vmin', P.tree(), 'tree');
    }
    s += `<div class="layer near">${hill(scallop(60, 40, 14), '#86d465', '#6cc04a')}</div>`;
    if (kind === 'picnic') {
      let q = '';
      for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) {
        const t = j / 4, t2 = (j + 1) / 4, l = x => 120 - 120 * x, w = x => (1000 - 2 * l(x)) / 10;
        q += `<path d="M${l(t) + i * w(t)} ${t * 300} L${l(t) + (i + 1) * w(t)} ${t * 300} L${l(t2) + (i + 1) * w(t2)} ${t2 * 300} L${l(t2) + i * w(t2)} ${t2 * 300}Z" fill="#ff6b6b"/>`;
      }
      s += `<div class="blanket"><svg viewBox="0 0 1000 300" preserveAspectRatio="none"><path d="M120 0 L880 0 L1000 300 L0 300Z" fill="#fff8f0"/>${q}<path d="M120 0 L880 0" stroke="#fff" stroke-width="6"/></svg></div>`;
      s += at('basket', 'right:3%;bottom:24%;width:20vmin', P.basket, 'basket');
    }
    const fl = kind === 'picnic' ? [[3, 2], [94, 4]] : [[4, 3], [16, 12], [30, 4], [47, 14], [63, 3], [78, 11], [92, 4], [70, 17]];
    s += fl.map(([x, y], i) => at('flower', `left:${x}%;bottom:${y}%;--fd:${-i * .7}s`, P.flower(FLOWER_C[i % FLOWER_C.length]), 'flower')).join('');
    s += at('bfly b1', '', P.butterfly('#ff8ad8'), 'bfly') + at('bfly b2', '', P.butterfly('#7ac8ff'), 'bfly');
    if (kind === 'meadow') s += at('bush fg l', '', P.bush) + at('bush fg r', '', P.bush);
    return s + '</div>';
  }
  function room() {
    return `<div class="sc sc-room"><div class="wall"></div>
      <div class="window" data-tap="cloud"><div class="pane">${P.cloud}</div></div>
      <div class="shelf"><div class="plank"></div><div class="toy t1">${headSvg('bear')}</div><div class="toy t2">${shape('circle', { hex: '#2f8cf0', dark: '#1557a8' }, false)}</div><div class="toy t3">${shape('triangle', { hex: '#ffd23a', dark: '#d99a00' }, false)}</div></div>
      <div class="frame-pic">${P.sun}</div>
      <div class="floor"></div><div class="rug"></div>
      ${at('flower pot', 'left:4%;bottom:26%;--fd:-1s', P.flower('#ff7aa8'), 'flower')}</div>`;
  }

  const SHAPE = {
    circle: '<circle cx="50" cy="50" r="44"/>',
    square: '<rect x="8" y="8" width="84" height="84" rx="12"/>',
    triangle: '<path d="M50 8 Q 54 8 57 13 L 94 82 Q 97 90 88 90 L 12 90 Q 3 90 6 82 L 43 13 Q 46 8 50 8 Z"/>',
    star: '<path d="M50 5 L 61.5 36 L 95 37 L 68.5 57.5 L 78 90 L 50 71 L 22 90 L 31.5 57.5 L 5 37 L 38.5 36 Z" stroke-linejoin="round" stroke-width="7"/>',
    heart: '<path d="M50 90 C 18 66 4 48 6 30 C 8 14 22 6 34 8 C 42 9 47 14 50 21 C 53 14 58 9 66 8 C 78 6 92 14 94 30 C 96 48 82 66 50 90 Z"/>',
  };
  // деревянная фигурка с лицом: тёмная кромка, блик, тень снизу
  function shape(sh, c, face = true) {
    const id = 's' + uid++;
    return `<svg class="char toy" viewBox="0 0 100 100" overflow="visible"><defs><clipPath id="${id}">${SHAPE[sh]}</clipPath></defs>
      <g transform="translate(0 4)" fill="${c.dark || c.hex}" stroke="${c.dark || c.hex}" stroke-width="3" stroke-linejoin="round">${SHAPE[sh]}</g>
      <g fill="${c.hex}" stroke="${c.hex}" stroke-width="3" stroke-linejoin="round">${SHAPE[sh]}</g>
      <g clip-path="url(#${id})"><ellipse cx="50" cy="106" rx="62" ry="30" fill="#000" opacity=".12"/><ellipse cx="34" cy="24" rx="20" ry="9" fill="#fff" opacity=".5" transform="rotate(-25 34 24)"/></g>
      ${face ? `<g class="look">${eye(40, 54, .55)}${eye(60, 54, .55)}</g><g class="mouth"><path class="m-closed" d="M44 66 Q50 72 56 66" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><g class="m-open"><path d="M43 64 Q50 78 57 64Z" fill="#7a2335"/></g></g>
        <ellipse cx="33" cy="64" rx="5" ry="3" fill="#ff7f9a" opacity=".45"/><ellipse cx="67" cy="64" rx="5" ry="3" fill="#ff7f9a" opacity=".45"/>` : ''}</svg>`;
  }
  // гнездо в доске: тёмная глубина и внутренняя тень сверху
  function hole(sh, c) {
    const id = 'o' + uid++;
    return `<svg viewBox="0 0 100 100" overflow="visible"><defs><clipPath id="${id}">${SHAPE[sh]}</clipPath></defs>
      <g fill="#6b3d17" stroke="#6b3d17" stroke-width="3" stroke-linejoin="round" opacity=".55">${SHAPE[sh]}</g>
      <g clip-path="url(#${id})">${c ? `<rect width="100" height="100" fill="${c.hex}" opacity=".85"/>` : ''}
      <g transform="translate(0 9)" fill="#c98a4f" opacity=".55">${SHAPE[sh]}</g></g>
      <g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.5" transform="translate(0 1.5)">${SHAPE[sh]}</g></svg>`;
  }
  function balloon(c, face = true) {
    const id = 'b' + uid++;
    return `<svg class="char toy" viewBox="0 0 100 170" overflow="visible"><defs><clipPath id="${id}"><path d="M50 4 C80 4 96 30 96 54 C96 82 72 104 50 108 C28 104 4 82 4 54 C4 30 20 4 50 4Z"/></clipPath></defs>
      <path class="string" d="M50 112 q-9 14 0 28 q9 14 0 28" stroke="#8d7b62" stroke-width="2.4" fill="none"/>
      <path d="M50 4 C80 4 96 30 96 54 C96 82 72 104 50 108 C28 104 4 82 4 54 C4 30 20 4 50 4Z" fill="${c.hex}"/>
      <g clip-path="url(#${id})"><ellipse cx="64" cy="112" rx="58" ry="36" fill="#000" opacity=".14"/></g>
      <path d="M44 106 L56 106 L53 115 L47 115 Z" fill="${c.dark || c.hex}"/>
      <ellipse cx="30" cy="32" rx="8" ry="16" fill="#fff" opacity=".55" transform="rotate(28 30 32)"/><circle cx="40" cy="18" r="3.5" fill="#fff" opacity=".6"/>
      ${face ? `<g class="look">${eye(38, 54, .6)}${eye(62, 54, .6)}</g><g class="mouth"><path class="m-closed" d="M42 68 Q50 75 58 68" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><g class="m-open"><path d="M41 66 Q50 82 59 66Z" fill="#7a2335"/></g></g>` : ''}</svg>`;
  }

  return {
    char, head: headSvg, food: id => F[id](), art: id => (A[id] ? char(id) : F[id]()), isAnimal: id => !!A[id],
    UI, P, scene, shape, hole, balloon, eye,
  };
})();
