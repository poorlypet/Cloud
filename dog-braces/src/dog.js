/* Dog pictogram used in place of photography: body-area markers and "where it fits" product diagrams. */
var DOG = (function () {
  function leg(d, w) { return '<path d="' + d + '" fill="none" stroke-width="' + (w || 19) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  var fp = leg('M203 200 L214 200', 15), rp = leg('M97 200 L110 200', 15);
  /* each entry is drawn in the highlight colour on top of the dog */
  var Z = {
    /* body areas */
    wrist: leg('M200.500 172 L202 196') + fp,
    elbow: leg('M202 126 L200.500 154'),
    back: '<path d="M116 77 L182 73 L182 143 L116 139 Z"/>',
    hip: '<ellipse cx="97" cy="106" rx="27" ry="29"/>',
    knee: leg('M107 138 L118 160 L107 170'),
    hock: leg('M104 173 L92 184 L94 193'),
    rearpaw: leg('M93 190 L96 198') + rp,
    whole: '<path d="M112 77.500 L128 76.500 L128 139.800 L112 138.800 Z"/><path d="M168 74 L184 73 L184 143.200 L168 142.200 Z"/>' +
      '<path d="M120 76 V58 Q120 50 128 50 H168 Q176 50 176 58 V74" fill="none" stroke-width="7" stroke-linecap="round"/>',
    /* product fits */
    'carpal-wrap': leg('M200.700 175 L201.700 190'),
    'carpal-brace': leg('M200.400 164 L202 194'),
    'carpal-splint': leg('M200.400 160 L202 196') + fp,
    'bootie': leg('M200.200 150 L202 196') + fp,
    'hock-wrap': leg('M99 178 L92 184 L93 190'),
    'hock-brace': leg('M106 171 L92 184 L94 195'),
    'rear-splint': leg('M111 166 L92 184 L96 198') + rp,
    rearlift: '<path d="M84 80 L112 77.500 L112 138.800 L84 137 Z"/><path d="M90 78 V60 Q90 52 98 52 H100 Q108 52 108 60 V76" fill="none" stroke-width="7" stroke-linecap="round"/>',
    bag: '<path d="M60 96 Q58 78 84 78 L150 75 L150 141 L84 139 Q70 150 74 196 Q76 210 100 208 L112 206 Q118 190 108 150 Z"/>'
  };
  var FIT = {
    'carpal-brace': ['carpal-brace'], 'carpal-wrap': ['carpal-wrap'], 'carpal-splint': ['carpal-splint'], 'leg-bootie-splint': ['bootie'],
    'elbow-brace': ['elbow'], 'back-brace': ['back'], 'hip-brace': ['hip'], 'knee-brace': ['knee'],
    'hock-brace': ['hock-brace'], 'hock-wrap': ['hock-wrap'], 'rear-leg-splint': ['rear-splint'],
    'rear-lift-harness': ['rearlift'], 'full-body-lift-harness': ['whole'], 'drag-bag': ['bag']
  };
  var THEMES = {
    light: { dog: '#D3D1EE', far: '#BBB8E3', hi: '#4B43A8', ink: '#29283C', ground: 'rgba(41,40,60,.08)' },
    onbrand: { dog: '#7A73CC', far: '#655EBD', hi: '#BFE9D5', ink: '#1F1E33', ground: 'rgba(0,0,0,.16)' },
    ondark: { dog: '#5F5B86', far: '#4D4A71', hi: '#BFE9D5', ink: '#15141F', ground: 'rgba(0,0,0,.25)' },
    onmint: { dog: '#FFFFFF', far: '#E3F4EC', hi: '#4B43A8', ink: '#29283C', ground: 'rgba(41,40,60,.10)' }
  };
  function svg(o) {
    o = o || {};
    var t = THEMES[o.theme || 'light'];
    var zones = [].concat(o.zone || []);
    var s = '<svg class="dog" viewBox="' + (o.box || '20 14 290 204') + '" aria-hidden="true">';
    if (o.shadow !== false) s += '<ellipse cx="150" cy="208" rx="112" ry="6" fill="' + t.ground + '"/>';
    s += '<g fill="none" stroke="' + t.far + '" stroke-linecap="round" stroke-linejoin="round"><path d="M178 128 L177 198" stroke-width="18"/><path d="M178 200 L190 200" stroke-width="14"/>' +
      '<path d="M82 132 L96 160 L70 184 L73 198" stroke-width="18"/><path d="M74 200 L87 200" stroke-width="14"/></g>';
    s += '<g fill="' + t.dog + '" stroke="' + t.dog + '" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M72 94 Q46 86 38 58" fill="none" stroke-width="12"/>' +
      '<path d="M98 78 L196 72 A36 36 0 0 1 196 144 L98 138 A30 30 0 0 1 98 78 Z" stroke-width="0"/>' +
      '<path d="M206 92 L234 58" fill="none" stroke-width="40"/>' +
      '<circle cx="242" cy="52" r="24" stroke-width="0"/><path d="M250 59 L277 61" fill="none" stroke-width="23"/>' +
      '<path d="M202 126 L200 160 L202 196" fill="none" stroke-width="19"/><path d="M203 200 L214 200" fill="none" stroke-width="15"/>' +
      '<path d="M100 126 L118 160 L92 184 L96 198" fill="none" stroke-width="19"/><path d="M97 200 L110 200" fill="none" stroke-width="15"/></g>';
    if (zones.length) s += '<g class="dog-z" fill="' + t.hi + '" stroke="' + t.hi + '">' + zones.map(function (z) { return Z[z] || ''; }).join('') + '</g>';
    s += '<path d="M228 32 Q213 52 222 78 Q238 72 240 42 Z" fill="' + t.far + '"/><circle cx="254" cy="46" r="3.200" fill="' + t.ink + '"/><ellipse cx="286" cy="55" rx="5" ry="4.200" fill="' + t.ink + '"/>';
    return s + '</svg>';
  }
  /* fill every <span data-dog="zone[,zone]" data-theme="..."> placeholder */
  function mount(root) {
    [].forEach.call((root || document).querySelectorAll('[data-dog]'), function (el) {
      var z = el.getAttribute('data-dog');
      el.innerHTML = svg({ zone: z ? z.split(',') : [], theme: el.getAttribute('data-theme') || 'light', shadow: el.getAttribute('data-shadow') !== '0' });
    });
  }
  return { svg: svg, fit: FIT, mount: mount };
})();
