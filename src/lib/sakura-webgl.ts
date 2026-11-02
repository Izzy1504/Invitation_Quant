const vertexSource = `
attribute vec2 a_corner;
attribute vec4 a_seed;
uniform float u_time;
uniform float u_aspect;
uniform float u_arrival;
uniform vec2 u_pointer;
varying vec2 v_uv;
varying float v_depth;
varying float v_light;
void main() {
  float depth = mix(3.0, 13.0, a_seed.z) - u_arrival * 0.8;
  float halfHeight = depth * 0.57735;
  float phase = fract(a_seed.y + u_time * mix(0.025, 0.055, a_seed.w));
  float x = (a_seed.x * 2.0 - 1.0) * halfHeight * u_aspect * 1.35;
  x += sin(u_time * 0.38 + a_seed.y * 30.0) * 0.4;
  x += u_pointer.x * (13.0 - depth) * 0.025;
  float y = mix(halfHeight * 1.3, -halfHeight * 1.3, phase);
  y += u_pointer.y * (13.0 - depth) * 0.018;
  float spin = u_time * mix(0.4, 1.1, a_seed.w) + a_seed.x * 30.0;
  float tilt = u_time * 0.8 + a_seed.y * 25.0;
  float size = mix(0.07, 0.17, a_seed.w);
  vec3 local = vec3(a_corner.x * 0.68, a_corner.y, 0.2 * a_corner.x * a_corner.x) * size;
  local = vec3(local.x * cos(tilt) + local.z * sin(tilt), local.y, -local.x * sin(tilt) + local.z * cos(tilt));
  local.xy = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * local.xy;
  float z = depth + local.z;
  gl_Position = vec4((x + local.x) * 1.73205 / u_aspect, (y + local.y) * 1.73205, 0.0, z);
  v_uv = a_corner;
  v_depth = a_seed.z;
  v_light = 0.8 + 0.2 * cos(tilt);
}`;

const fragmentSource = `
precision mediump float;
varying vec2 v_uv;
varying float v_depth;
varying float v_light;
void main() {
  vec2 petal = vec2(v_uv.x * (1.0 + v_uv.y * 0.25), v_uv.y);
  float edge = dot(petal, petal);
  float notch = length(v_uv - vec2(0.0, 1.02));
  float alpha = (1.0 - smoothstep(mix(0.74, 0.9, v_depth), 1.0, edge));
  alpha *= smoothstep(0.10, 0.20, notch);
  alpha *= mix(0.72, 0.32, v_depth);
  if (alpha < 0.01) discard;
  vec3 pink = mix(vec3(0.91, 0.50, 0.67), vec3(1.0, 0.86, 0.88), (v_uv.y + 1.0) * 0.5);
  float vein = (1.0 - smoothstep(0.0, 0.06, abs(v_uv.x))) * 0.07;
  gl_FragColor = vec4(pink * v_light + vein, alpha);
}`;

export interface SakuraRenderer {
  resize: (width: number, height: number, pixelRatio: number) => void;
  render: (time: number, pointerX: number, pointerY: number, arrival: number) => void;
  dispose: () => void;
}

export function createSakuraRenderer(canvas: HTMLCanvasElement, count: number): SakuraRenderer {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL is unavailable.");
  const shaders: WebGLShader[] = [];
  const buffers: WebGLBuffer[] = [];
  let program: WebGLProgram | null = null;
  const dispose = () => {
    buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    shaders.forEach((shader) => gl.deleteShader(shader));
    if (program) gl.deleteProgram(program);
  };
  try {
    function shader(type: number, source: string) {
      const result = gl!.createShader(type);
      if (!result) throw new Error("Unable to allocate sakura shader.");
      shaders.push(result);
      gl!.shaderSource(result, source);
      gl!.compileShader(result);
      if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS)) {
        throw new Error(`Sakura shader failed: ${gl!.getShaderInfoLog(result)}`);
      }
      return result;
    }
    program = gl.createProgram();
    if (!program) throw new Error("Unable to allocate sakura program.");
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Sakura program failed: ${gl.getProgramInfoLog(program)}`);
    }
    gl.useProgram(program);
    const corners = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    const geometry: number[] = [];
    for (let index = 0; index < count; index++) {
      const seeds = [Math.random(), Math.random(), 1 - index / count, Math.random()];
      for (let vertex = 0; vertex < 6; vertex++) {
        geometry.push(corners[vertex * 2], corners[vertex * 2 + 1], ...seeds);
      }
    }
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Unable to allocate sakura geometry.");
    buffers.push(buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry), gl.STATIC_DRAW);
    const corner = gl.getAttribLocation(program, "a_corner");
    const seed = gl.getAttribLocation(program, "a_seed");
    gl.enableVertexAttribArray(corner);
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(seed);
    gl.vertexAttribPointer(seed, 4, gl.FLOAT, false, 24, 8);
    const timeUniform = gl.getUniformLocation(program, "u_time");
    const aspectUniform = gl.getUniformLocation(program, "u_aspect");
    const pointerUniform = gl.getUniformLocation(program, "u_pointer");
    const arrivalUniform = gl.getUniformLocation(program, "u_arrival");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    return {
      resize(width, height, pixelRatio) {
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(aspectUniform, width / height);
      },
      render(time, pointerX, pointerY, arrival) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(timeUniform, time);
        gl.uniform2f(pointerUniform, pointerX, pointerY);
        gl.uniform1f(arrivalUniform, arrival);
        gl.drawArrays(gl.TRIANGLES, 0, count * 6);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
