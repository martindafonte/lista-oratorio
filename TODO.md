# WebHooks

[] Al actualizar una tarjeta: si se cambia el nombre se debe cambiar el nombre en los checklist para poder encontrarla
[x] Al crear una tarjeta se debe agregar al checklist
[x] Al borrar/archivar una tarjeta: Se debe sacar de la lista actual
[x] Al mover una tarjeta: Se debe sacar de la lista actual y agregar a la nueva
[] Mantener las marcas de una tarjeta que se mueva o cambie el nombre
- Generar cambios más específicos para reaccionar a un web hook a partir de los datos del mismo

# Manejo de checklist

- Ver que pasa si muevo una tarjeta que tiene una lista con marca y no está cerrada

# Paquete Node Trello 

- Cambiar la declaración de export de Trello para el final, así funciona mejor intelisense

# Paquete trello web hook types

- Agregar tipos faltantes
- Ej: archivar tarjeta, mover tarjeta de otro tablero, editar custom field?


# Ver unhandled promise errors

(node:10692) UnhandledPromiseRejectionWarning: StatusCodeError: 400 - "invalid value for name"
warning.js:18
    at new StatusCodeError (c:\Develop\Villa\lista-oratorio\node_modules\request-promise-core\lib\errors.js:32:15)
    at Request.plumbing.callback (c:\Develop\Villa\lista-oratorio\node_modules\request-promise-core\lib\plumbing.js:104:33)
    at Request.RP$callback [as _callback] (c:\Develop\Villa\lista-oratorio\node_modules\request-promise-core\lib\plumbing.js:46:31)
    at Request.self.callback (c:\Develop\Villa\lista-oratorio\node_modules\request\request.js:186:22)
    at Request.emit (events.js:180:13)
    at Request.<anonymous> (c:\Develop\Villa\lista-oratorio\node_modules\request\request.js:1163:10)
    at Request.emit (events.js:180:13)
    at IncomingMessage.<anonymous> (c:\Develop\Villa\lista-oratorio\node_modules\request\request.js:1085:12)
    at Object.onceWrapper (events.js:272:13)
    at IncomingMessage.emit (events.js:185:15)
(node:10692) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
warning.js:18
(node:10692) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.