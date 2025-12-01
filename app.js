/* 
   VARIABLES Y SELECTORES
Se obtienen referencias a los formularios y elementos HTML
para poder manipularlos desde JavaScript.
*/
const registroForm = document.getElementById("registroForm");
const loginForm = document.getElementById("loginForm");
const recuperarForm = document.getElementById("recuperarForm");

const registroMensaje = document.getElementById("registroMensaje");
const loginMensaje = document.getElementById("loginMensaje");
const recuperarMensaje = document.getElementById("recuperarMensaje");

const sectionRecuperar = document.getElementById("recuperar");
const linkRecuperar = document.getElementById("linkRecuperar");

/* 
   EXPRESIONES REGULARES*/
/*
regexNombre:
Permie solo letras (mayúsculas, minúsculas), acentos y espacios.
Evita números y simbolos en el nombre
*/
const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;

/*
regexCorreo:
Valida que el correo tenga un formato estádar:
texto@dominio.extensión
*/
const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/*
regexPassword:
Valida que la contraseña sea segura:
 Al menos una letra minúscula
Al menos una letra mayúscula
Al menos un número
Al menos un símbolo
 Mínimo 6 caracteres
*/
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

/*
regexCelular:
Acepta solo números, con una longitud entre 7 y 12 dígitos.
*/
const regexCelular = /^[0-9]{7,12}$/;

/* 
   MOSTRAR / OCULTAR CONTRASEÑA */
/*
Esta función permite mostrar u ocultar la contraseña
cambiando el tipo del input entre "password" y "text".
*/
function togglePassword(checkId, inputId) {
  const check = document.getElementById(checkId);
  const input = document.getElementById(inputId);

  check.addEventListener("change", () => {
    input.type = check.checked ? "text" : "password";
  });
}

/* Se aplica la función a los tres campos de contraseña */
togglePassword("mostrarRegPass", "regPassword");
togglePassword("mostrarLoginPass", "loginPassword");
togglePassword("mostrarNuevaPass", "nuevaPassword");

/* 
   REGISTRO
 */
/*
Valida los datos ingresados usando expresiones regulares.
Si todo es correcto, guarda el usuario en localStorage
*/
registroForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = regNombre.value.trim();
  const email = regEmail.value.trim();
  const celular = regCelular.value.trim();
  const password = regPassword.value;

  /* Validación del nombre */
  if (!regexNombre.test(nombre)) {
    mostrarMensaje(registroMensaje, "Nombre inválido", true);
    return;
  } 

  /* Validación del correo */
  if (!regexCorreo.test(email)) {
    mostrarMensaje(registroMensaje, "Correo inválido", true);
    return;
  }

  /* Validación del número de celular */
  if (!regexCelular.test(celular)) {
    mostrarMensaje(registroMensaje, "Celular inválido", true);
    return;
  }

  /* Validación de contraseña segura */
  if (!regexPassword.test(password)) {
    mostrarMensaje(registroMensaje, "Contraseña insegura", true);
    return;
  }

  /*
  Se crea el objeto usuario.
  intentos: lleva el conteo de intentos fallidos.
  bloqueado: indica si la cuenta está bloqueada
  */
  const usuario = {
    nombre,
    email,
    celular,
    password,
    intentos: 0,
    bloqueado: false
  };

  /* Se guarda el usuario en localStorage */
  localStorage.setItem("usuario", JSON.stringify(usuario));

  mostrarMensaje(registroMensaje, "Registro exitoso", false);
  registroForm.reset();
});

/* 
   LOGIN
 */
/*
Controla el inicio de sesión y el bloqueo por intentos fallidos.
*/
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  /* Verifica si el usuario existe y el correo coincide */
  if (!usuario || usuario.email !== email) {
    mostrarMensaje(loginMensaje, "Usuario o contraseña incorrectos", true);
    return;
  }

  /* Si la cuenta está bloqueada, no permite el acceso */
  if (usuario.bloqueado) {
    mostrarMensaje(loginMensaje, "Cuenta bloqueada por intentos fallidos.", true);
    sectionRecuperar.style.display = "block";
    return;
  }

  /* Manejo de intentos fallidos */
  if (usuario.password !== password) {
    usuario.intentos++;

    /*
    Si el usuario falla 3 veces,
    la cuenta se bloquea automáticamente
    */
    if (usuario.intentos >= 3) {
      usuario.bloqueado = true;
      mostrarMensaje(loginMensaje, "Cuenta bloqueada por intentos fallidos.", true);
      sectionRecuperar.style.display = "block";
    } else {
      mostrarMensaje(loginMensaje, "Usuario o contraseña incorrectos", true);
    }

    localStorage.setItem("usuario", JSON.stringify(usuario));
    return;
  }

  /* Si el login es corrcto, se reinician los intentos */
  usuario.intentos = 0;
  localStorage.setItem("usuario", JSON.stringify(usuario));

  mostrarMensaje(loginMensaje, `Bienvenido al sistema, ${usuario.nombre}`, false);
  loginForm.reset();
});

/* 
   MOSTRAR RECUPERACIÓN
 */
/*
Muestra la sección de recuperación de contraseña.
*/
linkRecuperar.addEventListener("click", (e) => {
  e.preventDefault();
  sectionRecuperar.style.display = "block";
});

/* 
   RECUPERAR CONTRASEÑA
 */
/*
Verifica que los datos ingresados coincidan con
los almacenados y permite actualizar la contraseña
*/
recuperarForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = recNombre.value.trim();
  const email = recEmail.value.trim();
  const celular = recCelular.value.trim();
  const nuevaPass = nuevaPassword.value;

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  /* Validación de identidad del usuario */
  if (
    !usuario ||
    usuario.nombre !== nombre ||
    usuario.email !== email ||
    usuario.celular !== celular
  ) {
    mostrarMensaje(
      recuperarMensaje,
      "Los datos no coinciden con la cuenta registrada.",
      true
    );
    return;
  }

  /* Validación de la nueva contraseña */
  if (!regexPassword.test(nuevaPass)) {
    mostrarMensaje(recuperarMensaje, "Contraseña insegura", true);
    return;
  }

  /*
  Se actualiza la contraseña,
  se desbloquea la cuenta y
  se reinician los intentos fallidos
  */
  usuario.password = nuevaPass;
  usuario.intentos = 0;
  usuario.bloqueado = false;

  localStorage.setItem("usuario", JSON.stringify(usuario));

  mostrarMensaje(
    recuperarMensaje,
    "Contraseña actualizada. Ahora puede iniciar sesión.",
    false
  );

  recuperarForm.reset();
});

/* 
   FUNCIÓN MENSAJES
 */
/*
Muestra mensajes en pantalla.
Recibe si el mensaje es de erro o éxito
*/
function mostrarMensaje(elemento, texto, esError) {
  elemento.textContent = texto;
  elemento.className = esError ? "error" : "success";
}
