// ─────────────────────────────────────────────────────────────
//  Configuração do Keru
//  Enquanto o apiKey estiver como "COLE_AQUI", o site roda em
//  MODO DEMONSTRAÇÃO (dados salvos só no navegador atual).
//  Siga o passo a passo do README.md para compartilhar entre
//  os dois computadores.
// ─────────────────────────────────────────────────────────────

// 1) Firebase Console → ⚙ Configurações do projeto → Seus apps → </> Web → "Configuração do SDK"
export const firebaseConfig = {
  apiKey: "AIzaSyBqkSJ9RDKuxYYx56ksNETGZGl6p2D7SiE",
  authDomain: "keru-5007a.firebaseapp.com",
  projectId: "keru-5007a",
  storageBucket: "keru-5007a.firebasestorage.app",
  messagingSenderId: "176714393583",
  appId: "1:176714393583:web:e8e002b4be54e00e8af81a",
};

// 2) Os dois e-mails que podem usar o Keru, em letras minúsculas.
//    Use os mesmos e-mails no arquivo firestore.rules.
export const allowedEmails = [
  // "voce@email.com",
  // "namorado@email.com",
];
