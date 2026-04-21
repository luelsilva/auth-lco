<script lang="ts">
  import { onMount } from 'svelte';

  const services = [
    {
      title: "Projetos Elétricos",
      desc: "Desenvolvimento de projetos de baixa e média tensão com foco em eficiência e conformidade técnica.",
      icon: "⚡"
    },
    {
      title: "Automação",
      desc: "Soluções inteligentes para processos industriais e residenciais, integrando tecnologia de ponta.",
      icon: "🤖"
    },
    {
      title: "IOT (Internet das Coisas)",
      desc: "Conectividade avançada para monitoramento e controle remoto de sistemas complexos.",
      icon: "🌐"
    },
    {
      title: "Placas Solares",
      desc: "Sistemas fotovoltaicos completos e circuitos afins para geração de energia sustentável.",
      icon: "☀️"
    },
    {
      title: "SPDA",
      desc: "Sistemas de Proteção contra Descargas Atmosféricas para garantir a segurança de estruturas.",
      icon: "🌩️"
    },
    {
      title: "Aterramento",
      desc: "Soluções robustas de aterramento elétrico para proteção de equipamentos e pessoas.",
      icon: "🔌"
    },
    {
      title: "Material Didático",
      desc: "Elaboração de conteúdo técnico especializado para capacitação em engenharia e tecnologia.",
      icon: "📚"
    }
  ];

  let scrolled = $state(false);

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 50;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<!-- Header -->
<header class="header {scrolled ? 'scrolled' : ''}">
  <div class="container nav-container">
    <div class="logo-area">
      <img src="/lco-brand-logo.svg" alt="LCO Systems Logo" class="logo-img" />
      <span class="logo-text">LCO Systems</span>
    </div>
    <nav class="nav">
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#services">Serviços</a></li>
        <li><a href="#about">Sobre</a></li>
        <li><a href="#contact">Contato</a></li>
      </ul>
    </nav>
    <a href="#contact" class="btn btn-primary btn-sm">Solicitar Orçamento</a>
  </div>
</header>

<!-- Hero Section -->
<section id="home" class="hero">
  <div class="hero-bg" style="background-image: linear-gradient(rgba(10, 37, 64, 0.8), rgba(10, 37, 64, 0.8)), url('/hero.png');"></div>
  <div class="container hero-content">
    <div class="hero-text">
       <h1>Engenharia de <span class="highlight">Precisão</span> para o Futuro</h1>
       <p>Soluções completas em projetos elétricos, automação, IOT e energias renováveis com a marca LCO Systems.</p>
       <div class="hero-actions">
         <a href="#services" class="btn btn-primary">Nossos Serviços</a>
         <a href="#about" class="btn btn-outline">Saiba Mais</a>
       </div>
    </div>
  </div>
</section>

<!-- Services Grid -->
<section id="services" class="services">
  <div class="container">
    <div class="section-title">
      <h2>Especialidades</h2>
      <div class="underline"></div>
      <p style="margin-top: 15px; color: #666;">Conheça nossas frentes de atuação em engenharia e tecnologia.</p>
    </div>

    <div class="services-grid">
      {#each services as service}
        <div class="service-card">
          <div class="service-icon">{service.icon}</div>
          <h3>{service.title}</h3>
          <p>{service.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- About Section -->
<section id="about" class="about">
  <div class="container about-container">
    <div class="about-image">
      <div class="image-overlay"></div>
      <!-- Placeholder for about image or generate one -->
      <div class="about-stats">
        <div class="stat">
          <h4>10+</h4>
          <p>Anos de Experiência</p>
        </div>
        <div class="stat">
          <h4>500+</h4>
          <p>Projetos Entregues</p>
        </div>
      </div>
    </div>
    <div class="about-text">
      <h2>LCO Systems</h2>
      <div class="underline" style="margin: 0 0 20px 0;"></div>
      <p>A LCO Systems nasceu com o propósito de integrar o conhecimento técnico da engenharia elétrica às inovações tecnológicas do IOT e da Automação. Nosso foco é entregar resultados que aliem segurança, economia e sustentabilidade.</p>
      <p style="margin-top: 20px;">Trabalhamos desde a base do aterramento e SPDA até sistemas complexos de energia solar e automação inteligente, sempre com compromisso e rigor técnico.</p>
      <a href="#contact" class="btn btn-primary" style="margin-top: 30px;">Conheça Nossa Equipe</a>
    </div>
  </div>
</section>

<!-- Contact Section -->
<section id="contact" class="contact">
  <div class="container">
    <div class="contact-card">
      <div class="contact-info">
        <h3>Vamos tirar seu projeto do papel?</h3>
        <p>Entre em contato com nossos especialistas e receba uma consultoria inicial para sua necessidade.</p>
        <div class="contact-details">
          <p>📧 contato@lco.com.br</p>
          <p>📍 São Paulo - Brasil</p>
          <p>🌐 www.lco.com.br</p>
        </div>
      </div>
      <form class="contact-form">
        <div class="form-group">
          <input type="text" placeholder="Seu Nome" required />
        </div>
        <div class="form-group">
          <input type="email" placeholder="Seu E-mail" required />
        </div>
        <div class="form-group">
          <textarea placeholder="Como podemos ajudar?" rows="4" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Enviar Mensagem</button>
      </form>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-brand">
        <img src="/lco-brand-logo.svg" alt="Logo" class="logo-img" />
        <span>LCO Systems</span>
      </div>
      <p>&copy; 2026 LCO Systems. Todos os direitos reservados. lco.com.br</p>
    </div>
  </div>
</footer>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background: transparent;
    transition: all 0.4s ease;
    padding: 20px 0;
  }

  .header.scrolled {
    background: var(--primary);
    padding: 10px 0;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-img {
    height: 60px;
    width: auto;
    object-fit: contain;
  }

  .logo-text {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -1px;
  }

  .nav ul {
    display: flex;
    gap: 30px;
  }

  .nav a {
    color: var(--text);
    font-weight: 500;
    transition: color 0.3s;
    opacity: 0.8;
  }

  .nav a:hover {
    color: var(--secondary);
    opacity: 1;
  }

  .btn-sm {
    padding: 0.5rem 1.5rem;
    font-size: 0.9rem;
  }

  /* Hero */
  .hero {
    position: relative;
    height: 100vh;
    display: flex;
    align-items: center;
    color: var(--text);
    overflow: hidden;
  }

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    z-index: -1;
    transform: scale(1.1);
    animation: zoomOut 10s forwards;
  }

  @keyframes zoomOut {
    to { transform: scale(1); }
  }

  .hero-content {
    z-index: 1;
  }

  .hero-text h1 {
    font-size: 4rem;
    line-height: 1.1;
    margin-bottom: 20px;
    color: var(--text);
  }

  .hero-text p {
    font-size: 1.25rem;
    max-width: 600px;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  .highlight {
    color: var(--secondary);
  }

  .hero-actions {
    display: flex;
    gap: 20px;
  }

  /* Services */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }

  .service-card {
    background: var(--bg-alt);
    padding: 40px;
    border-radius: 20px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }

  .service-card:hover {
    transform: translateY(-10px);
    background: white;
    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    border-color: var(--secondary);
  }

  .service-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .service-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: var(--primary);
  }

  /* About */
  .about-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .about-image {
    position: relative;
    height: 500px;
    background: var(--primary) url('/about.png') center/cover;
    border-radius: 30px;
    box-shadow: 20px 20px 60px rgba(0,0,0,0.1);
  }

  .about-stats {
    position: absolute;
    bottom: -30px;
    right: -30px;
    background: var(--secondary);
    padding: 30px;
    border-radius: 20px;
    display: flex;
    gap: 30px;
  }

  .stat h4 {
    font-size: 2rem;
    color: var(--primary);
  }

  /* Contact */
  .contact-card {
    background: var(--primary);
    border-radius: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
    color: var(--text);
  }

  .contact-info {
    padding: 60px;
    background: rgba(255,255,255,0.05);
  }

  .contact-info h3 {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }

  .contact-details {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .contact-form {
    padding: 60px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group input, .form-group textarea {
    width: 100%;
    padding: 15px 20px;
    border-radius: 12px;
    border: none;
    background: rgba(255,255,255,0.1);
    color: white;
    font-size: 1rem;
  }

  .footer {
    padding: 40px 0;
    background: #051422;
    color: rgba(255,255,255,0.5);
    text-align: center;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
    color: white;
    font-weight: 700;
  }

  @media (max-width: 968px) {
    .hero-text h1 { font-size: 3rem; }
    .about-container, .contact-card { grid-template-columns: 1fr; }
    .about-image { height: 300px; margin-bottom: 50px; }
    .header .nav, .header .btn { display: none; }
  }
</style>
