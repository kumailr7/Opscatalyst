import { QuartzComponent, QuartzComponentConstructor } from "./types"

const AURORA_SCRIPT = `
(function () {
  const VERT = \`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}\`;

  const FRAG = \`#version 300 es
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 c0 = uColorStops[0];
  vec3 c1 = uColorStops[1];
  vec3 c2 = uColorStops[2];
  vec3 rampColor = uv.x < 0.5
    ? mix(c0, c1, uv.x * 2.0)
    : mix(c1, c2, (uv.x - 0.5) * 2.0);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  float midPoint  = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  vec3  auroraColor = intensity * rampColor;
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}\`;

  function hexToRgb(hex) {
    const h = hex.replace('#','');
    return [
      parseInt(h.slice(0,2),16)/255,
      parseInt(h.slice(2,4),16)/255,
      parseInt(h.slice(4,6),16)/255
    ];
  }

  function initAurora(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl2', { alpha:true, premultipliedAlpha:true, antialias:true });
    if (!gl) { container.remove(); return; }

    gl.clearColor(0,0,0,0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function mkShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,   VERT));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime       = gl.getUniformLocation(prog, 'uTime');
    const uAmplitude  = gl.getUniformLocation(prog, 'uAmplitude');
    const uColorStops = gl.getUniformLocation(prog, 'uColorStops');
    const uResolution = gl.getUniformLocation(prog, 'uResolution');
    const uBlend      = gl.getUniformLocation(prog, 'uBlend');

    const colorStops  = ['#7cff67','#B19EEF','#5227FF'];
    const colorData   = new Float32Array(colorStops.flatMap(hexToRgb));

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      gl.viewport(0,0,w,h);
      gl.uniform2f(uResolution, w, h);
    }
    window.addEventListener('resize', resize);
    resize();

    let animId;
    function update(t) {
      animId = requestAnimationFrame(update);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t * 0.001 * 1.0);
      gl.uniform1f(uAmplitude, 1.0);
      gl.uniform3fv(uColorStops, colorData);
      gl.uniform1f(uBlend, 0.5);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    animId = requestAnimationFrame(update);
  }

  function mount() {
    const el = document.getElementById('aurora-bg');
    if (el) initAurora(el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
`

const AuroraBackground: QuartzComponent = () => {
  return (
    <>
      <div id="aurora-bg" />
      <script dangerouslySetInnerHTML={{ __html: AURORA_SCRIPT }} />
    </>
  )
}

AuroraBackground.css = `
#aurora-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  opacity: 0.28;
}
#aurora-bg canvas {
  width: 100%;
  height: 100%;
  display: block;
}
/* Lift all page content above the aurora */
#quartz-root {
  position: relative;
  z-index: 1;
}
`

export default (() => AuroraBackground) satisfies QuartzComponentConstructor
