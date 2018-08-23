# WebHooks

[] Al actualizar una tarjeta: si se cambia el nombre se debe cambiar el nombre en los checklist para poder encontrarla
[x] Al crear una tarjeta se debe agregar al checklist
[x] Al borrar/archivar una tarjeta: Se debe sacar de la lista actual
[x] Al mover una tarjeta: Se debe sacar de la lista actual y agregar a la nueva
[] Mantener las marcas de una tarjeta que se mueva o cambie el nombre
[] Generar cambios más específicos para reaccionar a un web hook a partir de los datos del mismo

# Manejo de checklist

[] Ver que pasa si muevo una tarjeta que tiene una lista con marca y no está cerrada

# Paquete Node Trello 

[] Cambiar la declaración de export de Trello para el final, así funciona mejor intelisense

# Paquete trello web hook types

[] Agregar tipos faltantes
[] Ej: archivar tarjeta, mover tarjeta de otro tablero, editar custom field?


# Ver unhandled promise errors

[] (node:10692) UnhandledPromiseRejectionWarning: StatusCodeError: 400 - "invalid value for name" warning.js:18b (node:10692) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
[] Convertir el código de Trello API Client para que devuelva {err: ,data: }

# Proyecto

[ ] Correr tslint y agregarlo al proceso de build