import React, { useEffect, useRef, useState } from 'react';
import heroBg from '../assets/images/India_s_Sunrise_of_Progress_7e866435.png';

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
    v_texCoord = (a_position + 1.0) * 0.5;
    // Invert Y for texture coordinates
    v_texCoord.y = 1.0 - v_texCoord.y;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision mediump float;

uniform sampler2D u_image;
uniform vec2 u_resolution;       // Canvas width & height in CSS pixels
uniform vec2 u_imageResolution;  // Image natural width & height (1847.0, 852.0)
uniform float u_time;

varying vec2 v_texCoord;         // 0.0 to 1.0 in canvas space

// High-speed pseudo-random generator for light drizzle streaks
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    // Exact object-cover object-center mapping from canvas coordinates to image UV
    float containerAspect = u_resolution.x / u_resolution.y;
    float imageAspect = u_imageResolution.x / u_imageResolution.y;
    
    vec2 imgUV;
    if (containerAspect > imageAspect) {
        float scale = containerAspect / imageAspect;
        imgUV = vec2(v_texCoord.x, (v_texCoord.y - 0.5) / scale + 0.5);
    } else {
        float scale = imageAspect / containerAspect;
        imgUV = vec2((v_texCoord.x - 0.5) / scale + 0.5, v_texCoord.y);
    }

    vec2 sampleUV = imgUV;
    float lightDelta = 0.0;

    // Only displace inside valid image coordinates
    if (imgUV.x >= 0.0 && imgUV.x <= 1.0 && imgUV.y >= 0.0 && imgUV.y <= 1.0) {
        
        // =========================================================================
        // 1. LARGE INDIAN NATIONAL FLAG — REALISTIC OUTDOOR BREEZE
        // =========================================================================
        // Pole center is at x ≈ 0.0540, right edge of pole at x ≈ 0.0570.
        // Fabric hoist edge attaches at x ≈ 0.0575.
        // Flag cloth extends to x ≈ 0.252.
        float flagTop = 0.052 + (imgUV.x - 0.0575) * 0.65;
        float flagBottom = 0.280 + (imgUV.x - 0.0575) * 0.42;
        
        // STRICT RULE: At flagpole (x <= 0.0575), displacement is MATHEMATICALLY ZERO.
        // The metal pole, base, finial ball, and eyelet rings stay 100% rigid and stationary.
        float flagMaskX = smoothstep(0.0575, 0.076, imgUV.x) * (1.0 - smoothstep(0.250, 0.262, imgUV.x));
        float flagMaskY = smoothstep(flagTop - 0.015, flagTop + 0.015, imgUV.y) * (1.0 - smoothstep(flagBottom - 0.015, flagBottom + 0.018, imgUV.y));
        float flagMask = flagMaskX * flagMaskY;

        if (flagMask > 0.0) {
            // Distance along the flag from the flagpole
            float distFromPole = max(0.0, (imgUV.x - 0.0575) / 0.190);
            // Non-linear amplitude: firm attachment at pole, gradual billowing to free fly edge
            float amp = pow(distFromPole, 1.35) * flagMask;
            
            // Traveling wave phases (simulating natural outdoor breeze passing from left to right)
            float phase1 = (imgUV.x - 0.0575) * 32.0 - u_time * 3.2;
            float phase2 = (imgUV.x - 0.0575) * 56.0 - u_time * 5.4 + imgUV.y * 6.0;
            float phase3 = (imgUV.x - 0.0575) * 16.0 - u_time * 1.8;
            
            // Vertical natural ripples (primary billow + gentle flutter harmonics)
            float waveY = (sin(phase1) * 0.0050 + sin(phase2) * 0.0018 + cos(phase3) * 0.0012) * amp;
            
            // Horizontal fabric compression along wave crests (preserves aspect and chakra)
            float waveX = (cos(phase1 * 0.95 + imgUV.y * 7.0) * 0.0022 + sin(phase2 * 0.8) * 0.0008) * amp;
            
            sampleUV.x += waveX;
            sampleUV.y += waveY;
            
            // Subtle 3D fabric fold lighting (highlights on wave peaks, soft ambient in troughs)
            lightDelta += (-cos(phase1) * 0.048 + sin(phase2) * 0.018) * amp;
        }

        // =========================================================================
        // 2. CROPS IN FARMER'S HANDS — NATURAL SUBTLE MOVEMENT
        // =========================================================================
        // Farmer's hands and fingers grip the stalk base at x ≈ 0.140-0.160, y ≈ 0.65-0.74.
        // His hands, arms, body, turban, and face must remain COMPLETELY STATIONARY.
        // Only the grain ear tips and upper leaves extending outward (x: 0.160-0.225, y: 0.54-0.68) sway.
        float farmerCropsX = smoothstep(0.158, 0.176, imgUV.x) * (1.0 - smoothstep(0.220, 0.230, imgUV.x));
        float farmerCropsY = smoothstep(0.540, 0.565, imgUV.y) * (1.0 - smoothstep(0.670, 0.690, imgUV.y));
        float farmerCropsMask = farmerCropsX * farmerCropsY;

        if (farmerCropsMask > 0.0) {
            // Distance outward from the farmer's grip
            float gripDist = max(0.0, (imgUV.x - 0.158) / 0.065);
            float stalkAmp = pow(gripDist, 1.3) * farmerCropsMask;
            
            // Delicate breeze sway on the wheat/paddy heads
            float cropPhase = u_time * 2.5 + imgUV.y * 18.0;
            float cropSwayX = (sin(cropPhase) * 0.0015 + sin(cropPhase * 1.9 + 0.6) * 0.0006) * stalkAmp;
            float cropSwayY = -abs(cos(cropPhase)) * 0.0004 * stalkAmp;
            
            sampleUV.x += cropSwayX;
            sampleUV.y += cropSwayY;
        }

        // =========================================================================
        // 3. GREEN GRASS AND CROPS ACROSS THE FIELD (Traveling Wind Waves)
        // =========================================================================
        // Soil, road, farmer, schoolboy, buildings, and sky stay stationary.
        
        // Midground crops between schoolboy and road: x in [0.29, 0.57], y in [0.70, 0.81]
        float midCropsX = smoothstep(0.290, 0.320, imgUV.x) * (1.0 - smoothstep(0.550, 0.580, imgUV.x));
        float midCropsY = smoothstep(0.700, 0.725, imgUV.y) * (1.0 - smoothstep(0.785, 0.815, imgUV.y));
        float midCrops = midCropsX * midCropsY;

        // Foreground bush/grass foliage near road: x in [0.48, 0.64], y in [0.76, 0.92]
        float fgBushX = smoothstep(0.480, 0.510, imgUV.x) * (1.0 - smoothstep(0.620, 0.650, imgUV.x));
        float fgBushY = smoothstep(0.760, 0.785, imgUV.y) * (1.0 - smoothstep(0.900, 0.930, imgUV.y));
        float fgBush = fgBushX * fgBushY;

        // Far-left field behind farmer: x in [0.0, 0.065], y in [0.70, 0.82]
        float leftFieldX = (1.0 - smoothstep(0.055, 0.070, imgUV.x));
        float leftFieldY = smoothstep(0.700, 0.730, imgUV.y) * (1.0 - smoothstep(0.800, 0.830, imgUV.y));
        float leftField = leftFieldX * leftFieldY;

        float fieldGrassMask = max(midCrops, max(fgBush, leftField));

        if (fieldGrassMask > 0.0) {
            // Natural wind gusts traveling across the landscape from left to right at varied times
            float windPhase1 = u_time * 1.6 - imgUV.x * 15.0;
            float windPhase2 = u_time * 2.8 - imgUV.x * 26.0 + 1.4;
            float fieldSwayX = (sin(windPhase1) * 0.0016 + sin(windPhase2) * 0.0006) * fieldGrassMask;
            float fieldSwayY = -abs(cos(windPhase1)) * 0.0004 * fieldGrassMask;
            
            sampleUV.x += fieldSwayX;
            sampleUV.y += fieldSwayY;
        }

        // =========================================================================
        // 4. SMALL PARLIAMENT ROOF FLAG (Subtle ripple)
        // =========================================================================
        float smallPoleX = 0.803;
        float smallFlagX = smoothstep(smallPoleX, smallPoleX + 0.005, imgUV.x) * (1.0 - smoothstep(0.838, 0.846, imgUV.x));
        float smallFlagY = smoothstep(0.260, 0.275, imgUV.y) * (1.0 - smoothstep(0.325, 0.340, imgUV.y));
        float smallMask = smallFlagX * smallFlagY;
        
        if (smallMask > 0.0) {
            float sPhase = (imgUV.x - smallPoleX) * 85.0 - u_time * 3.8;
            float sAmp = max(0.0, (imgUV.x - smallPoleX) / 0.035);
            sampleUV.y += sin(sPhase) * 0.0022 * sAmp * smallMask;
            sampleUV.x += cos(sPhase) * 0.0008 * sAmp * smallMask;
        }
    }

    vec4 color = texture2D(u_image, sampleUV);
    color.rgb += vec3(lightDelta);

    // =========================================================================
    // 5. OPTIONAL VERY LIGHT SUN-SHOWER DRIZZLE (Fine semi-transparent streaks)
    // =========================================================================
    // Subtle, sparse raindrops moving diagonally downward with the light breeze.
    // Preserves the warm golden morning light and welcoming atmosphere.
    vec2 drizzleCoord = vec2(v_texCoord.x * 1.7 + v_texCoord.y * 0.40, v_texCoord.y);
    vec2 gridPos = vec2(drizzleCoord.x * 140.0, drizzleCoord.y * 30.0 - u_time * 7.5);
    vec2 cellId = floor(gridPos);
    vec2 cellFrac = fract(gridPos) - 0.5;

    float rnd = hash(cellId);
    // Sparse distribution: only ~10% of cells have a fine droplet streak
    if (rnd > 0.90) {
        float streakX = 1.0 - smoothstep(0.0, 0.06, abs(cellFrac.x));
        float streakY = 1.0 - smoothstep(0.0, 0.46, abs(cellFrac.y));
        float drop = streakX * streakY;
        
        // Keep it ultra-fine and translucent (~6% max intensity)
        float drizzleAlpha = drop * 0.065 * ((rnd - 0.90) / 0.10);
        
        // Soften slightly in the center to keep title and search bar 100% crisp
        float distFromCenter = length(v_texCoord - vec2(0.5, 0.5));
        float centerFade = smoothstep(0.12, 0.42, distFromCenter);
        drizzleAlpha *= (0.45 + 0.55 * centerFade);
        
        // Soft golden-white sunlit raindrop color
        color.rgb += vec3(0.98, 0.97, 0.92) * drizzleAlpha;
    }

    gl_FragColor = color;
}
`;

export const AnimatedHeroBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Respect user's accessibility preference: no animation if reduced motion is requested
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance'
      }) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    } catch {
      // Graceful fallback to static img
      return;
    }

    if (!gl) return;

    // Helper to compile shader
    const createShader = (type: number, source: string) => {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uImageResolution = gl.getUniformLocation(program, 'u_imageResolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uImage = gl.getUniformLocation(program, 'u_image');

    // Create & upload texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let animationFrameId: number;
    let isVisible = true;
    const startTime = performance.now();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = heroBg;

    img.onload = () => {
      if (!gl) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      // Inform parent that canvas has rendered initial frame
      resizeCanvas();
      render(startTime);
      setIsReady(true);
    };

    const resizeCanvas = () => {
      if (!canvas || !container || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform2f(uResolution, width, height);
      gl.uniform2f(uImageResolution, img.naturalWidth || 1847, img.naturalHeight || 852);
    };

    const render = (now: number) => {
      if (!gl || !isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTime) / 1000.0;
      gl.useProgram(program);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1i(uImage, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    // Pause animation when scrolled away to save 100% CPU/battery
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Pristine original image always present as reliable fallback, SEO anchor, and initial paint */}
      <img
        src={heroBg}
        alt="TANSHU ONLINE Digital India Hub with Flag, Farmer, Student and Parliament at Sunrise"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* Hardware-accelerated animated canvas smoothly layered on top */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
