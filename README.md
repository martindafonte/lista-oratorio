# lista-oratorio
Herramienta para el pasaje de lista de oratorios utilizando Trello

[![Build Status](https://travis-ci.org/martindafonte/lista-oratorio.svg?branch=master)](https://travis-ci.org/martindafonte/lista-oratorio) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/069b3051f09544afafdd56ec2b32e7fd)](https://www.codacy.com/app/martindafonte/lista-oratorio?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=martindafonte/lista-oratorio&amp;utm_campaign=Badge_Grade) [![codebeat badge](https://codebeat.co/badges/04886549-ef93-46a9-b2cf-70e4bf78b01b)](https://codebeat.co/projects/github-com-martindafonte-lista-oratorio-master)

# Estructura del proyecto

## public
Contiene los archivos que se envían al usuario para desplegarse en el navegador. Incluye HTML estático, CSS y JS

## src
Carpeta con el código fuente del servidor. 

app.js es el punto de inicio de la misma. 
board-manager.js contiene la lógica de manejo de un tablero

- **helpers** Utilitarios 
- **models** Modelo de datos y acceso a la base de datos
- **routes** Rutas servida por Express
- **tests** Archivos de pruebas a ejecuta por mocha
- **views** Vistas generadas con el framework Marko
- **.env** Archivo que contiene variables de ambiente y secretos de la aplicación (no commitear)

## Welcome to the Glitch BETA

Click `Show` in the header to see your app live. Updates to your code will instantly deploy and update live.

**Glitch** is the friendly community where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).
