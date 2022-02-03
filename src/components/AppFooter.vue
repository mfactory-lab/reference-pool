<template>
  <q-footer :class="$style.footer">
    <div class="container">
      <div class="row q-col-gutter-lg">
        <div class="col justify-between d-flex column">
          <div class="text-caption">
            © Copyright 2021 xxx. All rights reserved.
            <br />
            Powered by
            <a href="https://mfactory.tech/" target="_blank">mFactory GmbH</a>
          </div>
        </div>
        <div class="col col-12 col-md-auto justify-between q-mt-auto d-flex column">
          <div :class="$style.nav" class="row text-caption footer-links">
            <a href="#" target="_blank">Documentation</a>
            <router-link to="/terms">Terms of Service</router-link>
            <router-link to="/impressum">Legal Disclosure</router-link>
            <router-link to="/privacy">Privacy</router-link>
            <router-link to="/pool-info">Pool Info</router-link>
          </div>
        </div>
      </div>
    </div>
  </q-footer>
</template>

<style lang="scss" module>
  .footer {
    background-color: $gray !important;
    color: #fff !important;
    padding: 2rem 0 1rem;
    @media (max-width: $breakpoint-sm) {
      text-align: center;
    }

    a {
      color: #fff;
      text-decoration: none;
    }
  }

  .nav {
    justify-content: center;
    text-align: center;

    a {
      margin: 0 0.5em;
    }
  }
</style>
<style lang="scss" scope>
  .contact-title {
    text-align: right;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    padding-right: 93px;
    margin-top: -15px;
    margin-bottom: -10px;

    @media (max-width: $breakpoint-sm) {
      text-align: center;
      margin-bottom: 5px;
      padding-right: 0;
    }
  }

  .footer-links {
    @media (max-width: $breakpoint-sm) {
      margin-top: 10px;
    }
  }
</style>
