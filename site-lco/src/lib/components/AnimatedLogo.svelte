<script lang="ts">
  import { onMount } from 'svelte';

  export let src = '/lco-brand-logo-3d.png';
  export let alt = 'LCO 3D Logo';
  export let size = '400px';

  let container: HTMLDivElement;
  let rotateX = 0;
  let rotateY = 0;
  let shineX = 0;
  let isHovered = false;

  function handleMouseMove(e: MouseEvent) {
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate tilt (max 15 degrees)
    rotateY = ((x - centerX) / centerX) * 15;
    rotateX = ((centerY - y) / centerY) * 15;
    
    // Calculate shine position
    shineX = (x / rect.width) * 100;
    isHovered = true;
  }

  function handleMouseLeave() {
    rotateX = 0;
    rotateY = 0;
    isHovered = false;
  }
</script>

<div 
  class="logo-container" 
  bind:this={container}
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
  style:--size={size}
  role="presentation"
>
  <div 
    class="logo-wrapper"
    style="transform: rotateX({rotateX}deg) rotateY({rotateY}deg) scale({isHovered ? 1.05 : 1})"
  >
    <!-- The main 3D image -->
    <img {src} {alt} class="main-logo" />

    <!-- Shine effect layer -->
    <div 
      class="shine-layer"
      style="opacity: {isHovered ? 0.6 : 0}; background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 55%, transparent 80%); left: {shineX - 50}%"
    ></div>

    <!-- Glow Pulse layer -->
    <div class="glow-pulse"></div>
  </div>
</div>

<style>
  .logo-container {
    width: var(--size);
    height: auto;
    perspective: 1000px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin: 2rem auto;
  }

  .logo-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.15s cubic-bezier(0.23, 1, 0.32, 1);
    transform-style: preserve-3d;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: floating 6s ease-in-out infinite;
  }

  .main-logo {
    width: 100%;
    height: auto;
    display: block;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
    z-index: 1;
    pointer-events: none;
  }

  .shine-layer {
    position: absolute;
    top: -50%;
    width: 200%;
    height: 200%;
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.3s ease;
    mix-blend-mode: overlay;
    transform: rotateZ(25deg);
  }

  .glow-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 20%;
    z-index: 0;
    animation: neonPulse 4s ease-in-out infinite;
    filter: blur(40px);
    opacity: 0.3;
  }

  @keyframes floating {
    0%, 100% { transform: translateY(0) rotateX(0); }
    50% { transform: translateY(-15px) rotateX(2deg); }
  }

  @keyframes neonPulse {
    0%, 100% {
      box-shadow: 0 0 40px rgba(255, 0, 0, 0.4), 
                  0 0 80px rgba(0, 0, 255, 0.2);
    }
    33% {
      box-shadow: 0 0 50px rgba(255, 255, 0, 0.4), 
                  0 0 90px rgba(255, 0, 0, 0.2);
    }
    66% {
      box-shadow: 0 0 60px rgba(0, 0, 255, 0.4), 
                  0 0 100px rgba(255, 255, 0, 0.2);
    }
  }
</style>
