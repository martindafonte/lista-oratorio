async function llamarPrueba() {
  let res = await prueba();
  console.log('Valores: '+res);
  return res;
}

function prueba() {
  return failedPromise().then((x) => {
    console.log('Funcionó correctamente');
    return x;
  });
}

function failedPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // resolve(1);
      reject('Error de prueba');
    }, 250);
  });
}

llamarPrueba()
  .then((x) => console.log('Todo terminó '+x))
  .catch(err =>console.log(err));