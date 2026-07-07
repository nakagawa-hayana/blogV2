<script setup lang="ts">
useSiteMeta({
  title: 'ardririyの足跡',
  description: '日記や競プロのことなどをゆるゆると更新します',
  path: '/',
})
</script>

<template>
  <section class="container-wide pt-10 pb-24">
    <FadeIn>
      <div class="hero">
        <div class="hero__ornament" aria-hidden="true">
          <span class="dot dot--a" />
          <span class="dot dot--b" />
          <span class="dot dot--c" />
        </div>
        <h1 class="hero__title">
          ardririyの<br>足跡へようこそ
        </h1>
        <p class="hero__lead">
          日記や競プロのことなどを、<br class="sm:hidden">ゆるゆると綴っています。
        </p>
      </div>
    </FadeIn>

    <FadeIn :delay="150">
      <div class="link-grid">
        <NuxtLink to="/list" class="link-card link-card--primary">
          <span class="link-card__label">記事をさがす</span>
          <span class="link-card__arrow" aria-hidden="true">→</span>
        </NuxtLink>
        <a
          href="https://twitter.com/ardririy"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card link-card--secondary"
        >
          <span class="link-card__label">Twitter (@ardririy)</span>
          <span class="link-card__arrow" aria-hidden="true">↗</span>
        </a>
        <a
          href="https://github.com/ardRiriy"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card link-card--secondary"
        >
          <span class="link-card__label">GitHub (ardRiriy)</span>
          <span class="link-card__arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </FadeIn>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 48px 8px 40px;
  text-align: center;
}
.hero__title {
  font-family: var(--font-heading);
  font-size: clamp(32px, 6vw, 44px);
  line-height: 1.35;
  letter-spacing: 0.02em;
}
.hero__lead {
  margin-top: 18px;
  color: var(--color-sub);
  font-size: 14px;
  line-height: 1.9;
}
.hero__ornament {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.dot {
  position: absolute;
  border-radius: 999px;
  opacity: 0.7;
}
.dot--a {
  width: 80px; height: 80px;
  background: var(--color-acc-soft);
  top: -20px; left: 8%;
}
.dot--b {
  width: 40px; height: 40px;
  background: var(--color-acc2-soft);
  top: 30px; right: 12%;
}
.dot--c {
  width: 24px; height: 24px;
  background: var(--color-acc);
  bottom: 20px; right: 30%;
  opacity: 0.4;
}

.link-grid {
  margin-top: 24px;
  display: grid;
  gap: 14px;
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
}

.link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-radius: 16px;
  font-size: 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.link-card__arrow {
  font-family: var(--font-mono);
  font-size: 13px;
  opacity: 0.7;
}
.link-card--primary {
  background: var(--color-acc);
  color: #fff;
  box-shadow: 0 12px 28px -20px rgba(194, 110, 140, 0.9);
}
.link-card--primary:hover {
  transform: translateY(-1px);
  background: var(--color-acc-ink);
}
.link-card--secondary {
  background: #fff;
  color: var(--color-ink);
  border: 1px solid var(--color-line);
}
.link-card--secondary:hover {
  transform: translateY(-1px);
  background: var(--color-acc-soft);
  color: var(--color-acc-ink);
}
</style>
