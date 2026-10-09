'use strict';
/* Вся графика игры — векторные SVG-персонажи в одном стиле.
   У каждого персонажа есть «риг»: .eye (моргание), .look (взгляд), .mouth (рот), .jaw (клюв/челюсть). */

const ART = (() => {
  let uid = 0;
  const INK = '#2b2233';
  const mirror = s => `<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;
  const both = s => s + mirror(s);

  function eye(x, y, s = 1) {
    return `<g class="eye">
      <ellipse cx="${x}" cy="${y}" rx="${9 * s}" ry="${11 * s}" fill="${INK}"/>
      <circle cx="${x + 3 * s}" cy="${y - 4 * s}" r="${3.8 * s}" fill="#fff"/>
      <circle cx="${x - 3 * s}" cy="${y + 4.5 * s}" r="${1.7 * s}" fill="#fff" opacity=".8"/></g>`;
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
  const svg = (inner, cls = '') => `<svg class="char ${cls}" viewBox="0 0 200 200" overflow="visible">${inner}</svg>`;

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
    both(`<ellipse cx="46" cy="60" rx="30" ry="18" fill="#e6f6ff" stroke="#bfe3f7" stroke-width="3" transform="rotate(-32 46 60)"/>`) +
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

  /* ---------- фон-сцены ---------- */
  function cloud(x, y, s, cls) {
    return `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})">
      <path d="M20 70 C0 70 0 40 26 40 C30 14 70 6 84 30 C96 10 140 14 140 44 C166 42 170 70 148 70Z" fill="#fff"/>
      <path d="M20 70 C10 70 6 62 8 56 C30 64 120 66 160 58 C162 66 156 70 148 70Z" fill="#e3f1fb"/></g>`;
  }
  function flower(x, y, c) {
    return `<g transform="translate(${x} ${y})"><path d="M0 0 V30" stroke="#3a9a3e" stroke-width="5"/>
      ${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a * Math.PI / 180) * 11}" cy="${Math.sin(a * Math.PI / 180) * 11}" r="9" fill="${c}"/>`).join('')}
      <circle r="7" fill="#ffd23a"/></g>`;
  }
  function tree(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-12" y="40" width="24" height="70" rx="8" fill="#9a6a43"/>
      <circle cx="0" cy="10" r="56" fill="#4fb84a"/><circle cx="-40" cy="40" r="40" fill="#4fb84a"/><circle cx="40" cy="40" r="40" fill="#4fb84a"/>
      <circle cx="-14" cy="-6" r="22" fill="#6fd062" opacity=".8"/><circle cx="24" cy="60" r="7" fill="#ff5a5a"/><circle cx="-30" cy="30" r="7" fill="#ff5a5a"/><circle cx="20" cy="14" r="7" fill="#ff5a5a"/></g>`;
  }
  function barn(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-120 40 L0 -60 L120 40 L120 200 L-120 200Z" fill="#e8483d"/>
      <path d="M-136 50 L0 -76 L136 50 L120 50 L0 -56 L-120 50Z" fill="#7a4a3a"/>
      <rect x="-50" y="80" width="100" height="120" fill="#fff4e2"/><rect x="-42" y="88" width="84" height="112" fill="#b8352c"/>
      <path d="M-42 88 L42 200 M42 88 L-42 200" stroke="#fff4e2" stroke-width="8"/>
      <circle cx="0" cy="10" r="22" fill="#fff4e2"/><circle cx="0" cy="10" r="15" fill="#7a4a3a"/></g>`;
  }
  function fence(y, x0, x1) {
    let s = `<rect x="${x0}" y="${y + 20}" width="${x1 - x0}" height="12" rx="6" fill="#f3e2c2"/><rect x="${x0}" y="${y + 52}" width="${x1 - x0}" height="12" rx="6" fill="#f3e2c2"/>`;
    for (let x = x0 + 10; x < x1; x += 46) s += `<path d="M${x} ${y + 90} V${y + 6} l10 -10 l10 10 V${y + 90}Z" fill="#fff4e2"/>`;
    return s;
  }
  function scene(kind = 'meadow') {
    const sky = { meadow: ['#8ed8ff', '#e2f6ff'], farm: ['#8ed8ff', '#e2f6ff'], picnic: ['#a3dcff', '#fff3d6'], balloons: ['#7cc7ff', '#ffe9f2'], sorter: ['#ffe9c7', '#fff8ec'] }[kind];
    let s = `<svg class="scene-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
      <rect width="1600" height="1000" fill="url(#sky)"/>`;
    if (kind === 'sorter') {
      // светлая игровая комната: стена, окно, пол
      s += `<rect x="0" y="0" width="1600" height="700" fill="#fff1d9"/>
        ${Array.from({ length: 17 }, (_, i) => `<rect x="${i * 100}" y="0" width="50" height="700" fill="#ffe6c2" opacity=".6"/>`).join('')}
        <rect x="1080" y="90" width="340" height="280" rx="24" fill="#fff"/><rect x="1100" y="110" width="300" height="240" rx="14" fill="#9fdcff"/>
        ${cloud(1150, 170, .9, 'c')}<path d="M1250 110 V350 M1100 230 H1400" stroke="#fff" stroke-width="14"/>
        <rect x="0" y="700" width="1600" height="300" fill="#e7b27a"/>
        ${Array.from({ length: 9 }, (_, i) => `<rect x="0" y="${700 + i * 36}" width="1600" height="4" fill="#c98a4f" opacity=".35"/>`).join('')}
        <ellipse cx="800" cy="860" rx="620" ry="110" fill="#ff9fb5" opacity=".55"/><ellipse cx="800" cy="860" rx="520" ry="84" fill="#ffc2d1" opacity=".6"/>`;
      return s + '</svg>';
    }
    s += `<g class="sun" transform="translate(1180 150)"><g class="rays">${Array.from({ length: 12 }, (_, i) => `<path d="M0 -118 L14 -88 L-14 -88Z" fill="#ffd23a" transform="rotate(${i * 30})"/>`).join('')}</g>
        <circle r="80" fill="#ffd23a"/><circle r="66" fill="#ffe066"/>
        <g class="look"><g class="eye"><ellipse cx="-24" cy="-10" rx="8" ry="10" fill="${INK}"/></g><g class="eye"><ellipse cx="24" cy="-10" rx="8" ry="10" fill="${INK}"/></g></g>
        <path d="M-20 18 Q0 34 20 18" stroke="#c9741a" stroke-width="6" fill="none" stroke-linecap="round"/>
        <ellipse cx="-44" cy="14" rx="12" ry="7" fill="#ff8a5a" opacity=".5"/><ellipse cx="44" cy="14" rx="12" ry="7" fill="#ff8a5a" opacity=".5"/></g>
      ${cloud(160, 120, 1.3, 'cloud c1')}${cloud(700, 70, .9, 'cloud c2')}${cloud(1050, 230, .7, 'cloud c3')}
      <path d="M0 600 C220 470 420 500 620 560 C820 620 1000 470 1250 500 C1420 520 1520 560 1600 590 L1600 1000 L0 1000Z" fill="#b4e88a"/>
      <path d="M0 700 C260 610 520 640 760 690 C980 735 1200 620 1600 670 L1600 1000 L0 1000Z" fill="#8fd96b"/>`;
    if (kind === 'farm') s += barn(420, 470, 1) + fence(620, 520, 1600) + tree(1250, 540, .9);
    else if (kind === 'meadow') s += tree(330, 560, 1.1) + tree(1300, 600, .8);
    else if (kind === 'balloons') s += tree(340, 640, .8);
    s += `<path d="M0 820 C300 770 600 790 900 820 C1150 845 1400 790 1600 800 L1600 1000 L0 1000Z" fill="#6cc04a"/>`;
    if (kind === 'picnic') {
      s += `<path d="M260 760 L1340 760 L1500 1000 L100 1000Z" fill="#fff"/>`;
      for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) {
        const t = j / 4, t2 = (j + 1) / 4, l = x => 260 - 160 * x, r = x => 1340 + 160 * x, w = x => (r(x) - l(x)) / 10;
        s += `<path d="M${l(t) + i * w(t)} ${760 + t * 240} L${l(t) + (i + 1) * w(t)} ${760 + t * 240} L${l(t2) + (i + 1) * w(t2)} ${760 + t2 * 240} L${l(t2) + i * w(t2)} ${760 + t2 * 240}Z" fill="#ff6b6b" opacity=".85"/>`;
      }
    }
    s += flower(90, 900, '#ff7aa8') + flower(560, 950, '#b28cff') + flower(1180, 930, '#ff7aa8') + flower(1520, 890, '#7ac8ff') + flower(820, 870, '#ffb02e');
    return s + '</svg>';
  }

  const SHAPE = {
    circle: '<circle cx="50" cy="50" r="44"/>',
    square: '<rect x="8" y="8" width="84" height="84" rx="12"/>',
    triangle: '<path d="M50 8 Q 54 8 57 13 L 94 82 Q 97 90 88 90 L 12 90 Q 3 90 6 82 L 43 13 Q 46 8 50 8 Z"/>',
    star: '<path d="M50 5 L 61.5 36 L 95 37 L 68.5 57.5 L 78 90 L 50 71 L 22 90 L 31.5 57.5 L 5 37 L 38.5 36 Z" stroke-linejoin="round" stroke-width="7"/>',
    heart: '<path d="M50 90 C 18 66 4 48 6 30 C 8 14 22 6 34 8 C 42 9 47 14 50 21 C 53 14 58 9 66 8 C 78 6 92 14 94 30 C 96 48 82 66 50 90 Z"/>',
  };
  function shape(sh, c, face = true) {
    const id = 's' + uid++;
    return `<svg viewBox="0 0 100 100" overflow="visible"><defs><clipPath id="${id}">${SHAPE[sh]}</clipPath></defs>
      <g fill="${c.hex}" stroke="${c.hex}" stroke-width="2">${SHAPE[sh]}</g>
      <g clip-path="url(#${id})"><ellipse cx="50" cy="104" rx="60" ry="30" fill="#000" opacity=".12"/><ellipse cx="34" cy="26" rx="18" ry="9" fill="#fff" opacity=".45" transform="rotate(-25 34 26)"/></g>
      ${face ? `<g class="look">${eye(40, 54, .55)}${eye(60, 54, .55)}</g><path d="M44 66 Q50 71 56 66" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>` : ''}</svg>`;
  }
  function hole(sh, c) {
    return `<svg viewBox="0 0 100 100" overflow="visible"><g fill="${c ? c.hex : '#5a3418'}" fill-opacity="${c ? .35 : .32}" stroke="#7a4a22" stroke-opacity=".45" stroke-width="3" stroke-dasharray="${c ? '0' : '0'}">${SHAPE[sh]}</g></svg>`;
  }
  function balloon(c, face = true) {
    const id = 'b' + uid++;
    return `<svg viewBox="0 0 100 170" overflow="visible"><defs><clipPath id="${id}"><path d="M50 4 C80 4 96 30 96 54 C96 82 72 104 50 108 C28 104 4 82 4 54 C4 30 20 4 50 4Z"/></clipPath></defs>
      <path d="M50 112 q-9 14 0 28 q9 14 0 28" stroke="#8d7b62" stroke-width="2.4" fill="none"/>
      <path d="M50 4 C80 4 96 30 96 54 C96 82 72 104 50 108 C28 104 4 82 4 54 C4 30 20 4 50 4Z" fill="${c.hex}"/>
      <g clip-path="url(#${id})"><ellipse cx="62" cy="112" rx="56" ry="34" fill="#000" opacity=".12"/></g>
      <path d="M44 106 L56 106 L53 115 L47 115 Z" fill="${c.hex}"/>
      <ellipse cx="30" cy="32" rx="8" ry="15" fill="#fff" opacity=".5" transform="rotate(28 30 32)"/>
      ${face ? `<g class="look">${eye(38, 54, .6)}${eye(62, 54, .6)}</g><path d="M42 68 Q50 75 58 68" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>` : ''}</svg>`;
  }

  return { animal: id => A[id](), food: id => F[id](), has: id => !!(A[id] || F[id]), art: id => (A[id] || F[id])(), UI, scene, shape, hole, balloon, eye };
})();
