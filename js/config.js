// ─────────────────────────────────────────────────────────────
//  Configuração do Keru
//  Enquanto o apiKey estiver como "COLE_AQUI", o site roda em
//  MODO DEMONSTRAÇÃO (dados salvos só no navegador atual).
//  Siga o passo a passo do README.md para compartilhar entre
//  os dois computadores.
// ─────────────────────────────────────────────────────────────

// 1) Firebase Console → ⚙ Configurações do projeto → Seus apps → </> Web → "Configuração do SDK"
export const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// 2) Os dois e-mails que podem usar o Keru, em letras minúsculas.
//    Use os mesmos e-mails no arquivo firestore.rules.
export const allowedEmails = [
  // "voce@email.com",
  // "namorado@email.com",
];
