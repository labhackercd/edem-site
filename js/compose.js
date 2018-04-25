var OPTIONAL_FIELDS = ['site_name', 'site_logo', 'email_host_user', 'email_host_password']

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getFormData() {
  var form = $('.js-compose-form');
  var data = {};
  var error = [];

  $(form.serializeArray()).each(function () {
    var notOptional = OPTIONAL_FIELDS.indexOf(this.name) < 0;
    if (notOptional && this.value !== '') {
      data[this.name] = this.value;
    } else if (notOptional && this.value === '') {
      error.push(this.name);
    } else {
      data[this.name] = this.value;
    }
  })

  data['email_use_tls'] = capitalize($('#email_use_tls')[0].checked.toString())
  data['wikilegis_enabled'] = capitalize($('#wikilegis_enabled')[0].checked.toString())
  data['audiencias_enabled'] = capitalize($('#audiencias_enabled')[0].checked.toString())
  data['discourse_enabled'] = capitalize($('#discourse_enabled')[0].checked.toString())

  if (error.length > 0) {
    return null;
  } else {
    return data;
  }
}

function randomPassword(length) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
    var passwd = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        passwd += chars.charAt(i);
    }
    return passwd;
}

function downloadCompose() {
  var text = generateComposeString();
  var filename = 'docker-compose.yml';
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
}


$('.js-compose-form').on('submit', function() {
  downloadCompose();
  return false;
})


function generateComposeString() {
  var data = getFormData();
  var wikilegisAPIKey = randomPassword(Math.floor(Math.random() * 30 + 50));
  var audienciasAPIKey = randomPassword(Math.floor(Math.random() * 30 + 50));
  var discourseSSOSecret = randomPassword(Math.floor(Math.random() * 30 + 50));
  var compose = `
version: '2'

services:
  nginx:
    image: labhackercd/nginx-edemocracia
    depends_on:
      - edemocracia
      - audienciasweb
    volumes:
      - edemocracia:/var/labhacker/edemocracia/src/public/
      - wikilegis:/var/labhacker/wikilegis/wikilegis/public/
      - audiencias:/var/labhacker/audiencias/public/
      - discourse:/var/www/discourse
    ports:
      - "8000:80"
    links:
      - edemocracia
    environment:
      NAME_RESOLVER: '127.0.0.11'

  db:
    image: postgres:9.6
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: root
      POSTGRES_DB: root
      PGDATA : /var/lib/postgresql/data/
    volumes:
     - pg_data:/var/lib/postgresql/data/

  redis:
    image: redis:alpine

  edemocracia:
    image: labhackercd/edemocracia:1.2.0
    volumes:
      - edemocracia:/var/labhacker/edemocracia/src/public/:z
    command: ./runserver-production
    expose:
      - "8000"
    links:
      - db
    depends_on:
      - db
    environment:
      ADMIN_EMAIL: ${data.admin_email}
      ADMIN_PASSWORD: ${data.admin_password}
      ADMIN_USERNAME: ${data.admin_username}
      SITE_NAME: ${data.site_name}
      SITE_LOGO: ${data.site_logo}
      SITE_URL: https://${data.site_url}
      DEBUG: 'False'
      SECRET_KEY: ${randomPassword(Math.floor(Math.random() * 30 + 50))}
      RECAPTCHA_SITE_KEY: ${data.recaptcha_site_key}
      RECAPTCHA_PRIVATE_KEY: ${data.recaptcha_private_key}
      ALLOWED_HOSTS: ${data.site_url}
      DATABASE_ENGINE: postgresql_psycopg2
      DATABASE_NAME: edemocracia
      DATABASE_USER: root
      DATABASE_PASSWORD: root
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      SOCIAL_AUTH_GOOGLE_OAUTH2_KEY: ${data.google_oauth2_key}
      SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET:  ${data.google_oauth2_secret}
      SOCIAL_AUTH_FACEBOOK_KEY: ${data.facebook_key}
      SOCIAL_AUTH_FACEBOOK_SECRET: ${data.facebook_secret}
      SOCIAL_AUTH_REDIRECT_IS_HTTPS: 'True'
      EMAIL_HOST: ${data.email_host}
      EMAIL_PORT: ${data.email_port}
      EMAIL_HOST_USER: ${data.email_host_user}
      EMAIL_HOST_PASSWORD: ${data.email_host_password}
      EMAIL_USE_TLS: '${data.email_use_tls}'
      EMAIL_BACKEND: django.core.mail.backends.smtp.EmailBackend
      DEFAULT_FROM_EMAIL: '"Portal e-Democracia" <${data.admin_email}>'
      WIKILEGIS_ENABLED: '${data.wikilegis_enabled}'
      WIKILEGIS_UPSTREAM: http://wikilegis:8000
      WIKILEGIS_API_URL: '/api/v1/'
      WIKILEGIS_API_KEY: ${wikilegisAPIKey}
      AUDIENCIAS_ENABLED: '${data.audiencias_enabled}'
      AUDIENCIAS_UPSTREAM: http://audienciasweb:8000/audiencias
      AUDIENCIAS_API_URL:
      AUDIENCIAS_API_KEY: ${audienciasAPIKey}
      DISCOURSE_ENABLED: '${data.discourse_enabled}'
      DISCOURSE_UPSTREAM: http://discourse:8080/expressao
      DISCOURSE_SSO_SECRET: ${discourseSSOSecret}

  wikilegis:
    image: labhackercd/wikilegis:2.0.0
    command: ./start.sh
    links:
      - db
    depends_on:
      - db
    volumes:
      - wikilegis:/var/labhacker/wikilegis/wikilegis/public/:z
    environment:
      ADMIN_EMAIL: ${data.admin_email}
      ADMIN_PASSWORD: ${data.admin_password}
      ADMIN_USERNAME: ${data.admin_username}
      SECRET_KEY: ${randomPassword(Math.floor(Math.random() * 30 + 50))}
      API_KEY: ${wikilegisAPIKey}
      FORCE_SCRIPT_NAME: /wikilegis
      DEBUG: 'False'
      ALLOWED_HOSTS: '*'
      LOGIN_URL: /
      LOGIN_REDIRECT_URL: /
      AUTH_USER_MODEL: accounts.User
      ENABLE_REMOTE_USER: 'True'
      SESSION_COOKIE_NAME: wikilegis_session
      EMAIL_HOST: ${data.email_host}
      EMAIL_PORT: ${data.email_port}
      EMAIL_HOST_USER: ${data.email_host_user}
      EMAIL_HOST_PASSWORD: ${data.email_host_password}
      EMAIL_USE_TLS: '${data.email_use_tls}'
      DEFAULT_FROM_EMAIL: '"Portal e-Democracia[Wikilegis]" <${data.admin_email}>'
      LANGUAGE_CODE: pt-br
      TIME_ZONE: America/Sao_Paulo
      STATIC_URL: /wikilegis/static/
      MEDIA_URL: /wikilegis/media/
      DATABASE_ENGINE: postgresql_psycopg2
      DATABASE_NAME: wikilegis
      DATABASE_PASSWORD: root
      DATABASE_USER: root
      DATABASE_HOST: db
      DATABASE_PORT: 5432
    expose:
      - "8000"

  audienciasweb:
    image: labhackercd/audiencias-publicas:2.1.0
    command: ./start-web.sh
    restart: on-failure
    links:
      - db
      - redis
    volumes:
      - audiencias:/var/labhacker/audiencias/public/:z
    environment:
      ADMIN_EMAIL: ${data.admin_email}
      ADMIN_PASSWORD: ${data.admin_password}
      ADMIN_USERNAME: ${data.admin_username}
      SITE_NAME: ${data.site_name}
      SITE_DOMAIN: ${data.site_url}
      EMAIL_HOST: ${data.email_host}
      EMAIL_PORT: ${data.email_port}
      EMAIL_HOST_USER: ${data.email_host_user}
      EMAIL_HOST_PASSWORD: ${data.email_host_password}
      EMAIL_USE_TLS: '${data.email_use_tls}'
      DEFAULT_FROM_EMAIL: '"Portal e-Democracia[audiencias]" <${data.admin_email}>'
      DJANGO_SECRET_KEY: ${audienciasAPIKey}
      DEBUG: 'False'
      ENABLE_REMOTE_USER: 'True'
      URL_PREFIX: audiencias
      FORCE_SCRIPT_NAME: /audiencias
      STATIC_URL: /audiencias/static/
      SESSION_COOKIE_NAME: audiencias_session
      LOGIN_URL: /home
      LOGIN_REDIRECT_URL: /home
      LOGOUT_REDIRECT_URL: /home
      ALLOWED_HOSTS: '${data.site_url}, audienciasweb, localhost, 127.0.0.1'
      DATABASE_ENGINE: postgresql_psycopg2
      DATABASE_NAME: audiencias
      DATABASE_PASSWORD: root
      DATABASE_USER: root
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      REDIS_SERVER: redis
      WEBSERVICE_URL:
      COMPRESS_OFFLINE: 'True'
    expose:
      - "8000"
    depends_on:
      - db
      - redis

  audienciasworker:
    image: labhackercd/audiencias-publicas:2.1.0
    command: ./start-worker.sh
    links:
      - redis
      - db
    environment:
      ADMIN_EMAIL: ${data.admin_email}
      ADMIN_PASSWORD: ${data.admin_password}
      ADMIN_USERNAME: ${data.admin_username}
      SITE_NAME: ${data.site_name}
      SITE_DOMAIN: ${data.site_url}
      EMAIL_HOST: ${data.email_host}
      EMAIL_PORT: ${data.email_port}
      EMAIL_HOST_USER: ${data.email_host_user}
      EMAIL_HOST_PASSWORD: ${data.email_host_password}
      EMAIL_USE_TLS: '${data.email_use_tls}'
      DEFAULT_FROM_EMAIL: '"Portal e-Democracia[audiencias]" <${data.admin_email}>'
      DJANGO_SECRET_KEY: ${audienciasAPIKey}
      DEBUG: 'False'
      ENABLE_REMOTE_USER: 'True'
      URL_PREFIX: audiencias
      FORCE_SCRIPT_NAME: /audiencias
      STATIC_URL: /audiencias/static/
      SESSION_COOKIE_NAME: audiencias_session
      LOGIN_URL: /home
      LOGIN_REDIRECT_URL: /home
      LOGOUT_REDIRECT_URL: /home
      ALLOWED_HOSTS: '${data.site_url}, audienciasweb, audienciasworker, localhost, 127.0.0.1'
      DATABASE_ENGINE: postgresql_psycopg2
      DATABASE_NAME: audiencias
      DATABASE_PASSWORD: root
      DATABASE_USER: root
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      REDIS_SERVER: redis
      WEBSERVICE_URL:
      COMPRESS_OFFLINE: 'True'
    volumes:
      - audiencias:/var/labhacker/audiencias/public/:z
    depends_on:
      - 'audienciasweb'

  discourse:
    image: labhackercd/discourse-docker
    command: ./start-web.sh
    volumes:
      - discourse:/var/www/discourse:z
    expose:
      - "8080"
    depends_on:
      - db
      - redis
    environment:
      ADMIN_EMAIL: ${data.admin_email}
      ADMIN_PASSWORD: ${data.admin_password}
      ADMIN_USERNAME: ${data.admin_username}
      RAILS_ENV: 'production'
      DISCOURSE_DB_HOST: db
      DISCOURSE_DB_PORT: '5432'
      DISCOURSE_DB_NAME: 'discourse'
      DISCOURSE_DB_USERNAME: 'root'
      DISCOURSE_DB_PASSWORD: 'root'
      DISCOURSE_HOSTNAME: '${data.site_url}'
      DISCOURSE_SMTP_ADDRESS: ${data.email_host}
      DISCOURSE_SMTP_PORT: ${data.email_port}
      DISCOURSE_SMTP_USER_NAME: ${data.email_host_user}
      DISCOURSE_SMTP_PASSWORD: ${data.email_host_password}
      DISCOURSE_REDIS_HOST: 'redis'
      DISCOURSE_REDIS_PORT: 6379
      DISCOURSE_RELATIVE_URL_ROOT: '/expressao'
      DISCOURSE_CONTACT_EMAIL: ${data.admin_email}
      DISCOURSE_CONTACT_URL: '${data.site_url}'
      DISCOURSE_NOTIFICATION_EMAIL: '${data.admin_email}'
      DISCOURSE_SSO_URL: 'http:\/\/${data.site_url}'
      DISCOURSE_SSO_SECRET: '${discourseSSOSecret}'
      DISCOURSE_FORCE_HOSTNAME: '${data.site_url}'

volumes:
  pg_data:
    driver: local
  edemocracia:
    driver: local
  audiencias:
    driver: local
  wikilegis:
    driver: local
  discourse:
    driver: local
  `
  return compose;
}