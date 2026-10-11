/* little fox — hero "ripple" shader.
   A domain-warped height field shaded like a glossy tub of lavender-ripple ice cream.
   The cursor stirs it (a decaying swirl around the pointer). */
window.Ripple = (canvas, opts = {}) => {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const deriv = !!gl.getExtension('OES_standard_derivatives');
  const frag = `${deriv ? '#extension GL_OES_standard_derivatives : enable\n#define DERIV 1' : ''}
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uStir; uniform float uFade;
uniform vec3 uDeep, uBase, uLilac, uCream, uMint;

vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1. + 2. * fract(sin(p) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(dot(h2(i), f), dot(h2(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
             mix(dot(h2(i + vec2(0, 1)), f - vec2(0, 1)), dot(h2(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 4; i++){ v += a * noise(p); p = m * p; a *= .5; } return v; }

float field(vec2 p, float t){
  vec2 q = vec2(fbm(p + vec2(0., t * .05)), fbm(p + vec2(5.2, 1.3) - t * .04));
  vec2 r = vec2(fbm(p + 2. * q + vec2(1.7, 9.2) + t * .035), fbm(p + 2. * q + vec2(8.3, 2.8) - t * .025));
  return fbm(p + 2. * r);
}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  const float SC = 1.12;
  vec2 p = (uv - .5) * vec2(asp, 1.) * SC;
  vec2 m = (uMouse - .5) * vec2(asp, 1.) * SC;
  vec2 d = p - m; float dist = length(d);
  float sw = exp(-dist * dist * 9.) * uStir;
  p = m + rot(sw * 2.4) * d;
  float t = uTime;

  float h = field(p, t);
#ifdef DERIV
  float k = .24 * uRes.y / SC;
  vec3 n = normalize(vec3(-dFdx(h) * k, -dFdy(h) * k, 1.));
#else
  float e = .008;
  vec3 n = normalize(vec3(-(field(p + vec2(e, 0.), t) - h) / e * .24, -(field(p + vec2(0., e), t) - h) / e * .24, 1.));
#endif

  // ripple bands
  vec3 col = mix(uDeep, uBase, smoothstep(-.34, .02, h));
  float rib = smoothstep(.1, .14, h) * (1. - smoothstep(.22, .26, h));
  col = mix(col, uLilac, rib * .8);
  float rib2 = smoothstep(.3, .33, h) * (1. - smoothstep(.37, .41, h));
  col = mix(col, uCream, rib2 * .85);
  col = mix(col, uMint, smoothstep(-.18, -.3, h) * .22);

  // soft creamy light
  vec3 L = normalize(vec3(-.45, .55, .75));
  float dif = .72 + .38 * dot(n, L);
  vec3 H = normalize(L + vec3(0., 0., 1.));
  float spec = pow(max(dot(n, H), 0.), 30.) * .34;
  float sheen = pow(1. - n.z, 2.) * .25;
  col = col * dif + spec + sheen * uLilac * .5;

  // vignette into deep periwinkle
  float v = smoothstep(1.25, .25, length((uv - .5) * vec2(asp * .9, 1.)));
  col = mix(uDeep * .85, col, .55 + .45 * v);
  col = mix(uBase, col, uFade);
  gl_FragColor = vec4(col, 1.);
}`;

  function sh(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = sh(gl.VERTEX_SHADER, vert), fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = n => gl.getUniformLocation(prog, n);
  const u = { res: U('uRes'), time: U('uTime'), mouse: U('uMouse'), stir: U('uStir'), fade: U('uFade') };
  const hex = h => { const v = parseInt(h.slice(1), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
  const pal = Object.assign({ uDeep: '#2E3A86', uBase: '#4455A1', uLilac: '#CCA1CA', uCream: '#FBEED7', uMint: '#9CCEBF' }, opts.palette);
  Object.entries(pal).forEach(([k, v]) => gl.uniform3fv(U(k), hex(v)));

  const scale = opts.scale || .5;
  const state = { mx: .62, my: .55, tx: .62, ty: .55, stir: 0, fade: 0, running: false, t0: performance.now(), raf: 0, last: 0 };

  function resize() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(2, Math.round(r.width * dpr * scale));
    canvas.height = Math.max(2, Math.round(r.height * dpr * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.res, canvas.width, canvas.height);
  }
  function frame(now) {
    state.raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - (state.last || now)) / 1000); state.last = now;
    state.mx += (state.tx - state.mx) * .06; state.my += (state.ty - state.my) * .06;
    state.stir *= Math.pow(.25, dt); // decays over ~1s
    gl.uniform1f(u.time, opts.still ? 8 : (now - state.t0) / 1000);
    gl.uniform2f(u.mouse, state.mx, state.my);
    gl.uniform1f(u.stir, state.stir);
    gl.uniform1f(u.fade, state.fade);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  const api = {
    start() { if (state.running) return; state.running = true; state.last = 0; state.raf = requestAnimationFrame(frame); },
    stop() { state.running = false; cancelAnimationFrame(state.raf); },
    pointer(x, y, speed) {
      const r = canvas.getBoundingClientRect();
      state.tx = (x - r.left) / r.width; state.ty = 1 - (y - r.top) / r.height;
      state.stir = Math.min(1.4, state.stir + speed * .0022);
    },
    resize, state
  };
  resize();
  addEventListener('resize', resize);
  return api;
};
