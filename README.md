# keru 🎀

**Tudo o que a gente quer, num lugar só.**

Keru ("quero") é a lista de desejos de um casal: itens, experiências, lugares e viagens, para um presentear o outro sem errar e sem estragar a surpresa.

## O que tem

| Aba | Para quê |
| --- | --- |
| **Meus desejos** | O que você quer ganhar, com preço, link da loja, foto, categoria e prioridade. |
| **Desejos de (seu par)** | A lista do outro. Dá para **reservar em segredo** ("Vou dar esse"), e a pessoa não vê a reserva. |
| **Keremus** | Experiências e presentes para os dois: viagens, passeios, shows, jantares. |
| **Perfis** | Medidas, tamanhos, cores que ama e que evita, gostos, alergias e contagem para o aniversário. |

- **Categorias:** Moda, Beleza, Casa, Tecnologia, Livros & cultura, Comida & bebida, Experiências, Lugares, Viagens, Outros.
- **Faixas de preço:** Mimo (até R$ 100), Presente (R$ 100 a 300), Especial (R$ 300 a 800), Grandão (R$ 800 a 2.000) e Sonho (acima de R$ 2.000). A faixa é calculada pelo preço, e dá para filtrar e ordenar por ela.
- **"Por enquanto, não":** desejos que não são opção agora porque você vai ganhar de outra pessoa, vai comprar ou já tem. Ficam numa seção separada, com o motivo visível para o seu par.
- **"Já ganhei" / "Já fizemos":** histórico do que já se realizou.
- Funciona no computador e no celular, com tema claro e escuro automáticos.

## Experimentar agora (modo demonstração)

Sem configurar nada, o site abre em **modo demonstração**: os dados ficam só no navegador atual, com dois usuários de exemplo (`ana@keru.demo` e `leo@keru.demo`, senha `keru123`).

```bash
python3 -m http.server 8000
```

Depois, abra http://localhost:8000. É preciso usar um servidor local porque o navegador não carrega módulos JavaScript abrindo o arquivo direto com duplo clique.

## Usar nos dois computadores (Firebase, gratuito)

Para os dois verem os mesmos dados, o Keru usa o **Firebase** (Google): login com e-mail e senha e banco de dados Firestore. O plano gratuito (Spark) deve ser suficiente para duas pessoas. Confira os limites atuais em https://firebase.google.com/pricing.

> Os nomes dos menus abaixo podem ter mudado. Se algo não bater, procure a opção equivalente no console.

### 1. Criar o projeto

1. Acesse https://console.firebase.google.com e clique em **Adicionar projeto** (nome sugerido: `keru`). O Google Analytics pode ficar desligado.
2. No menu **Build / Criação**, abra **Authentication**, clique em **Vamos começar**, depois em **Método de login**, e ative **E-mail/senha**.
3. No mesmo menu, abra **Firestore Database** e clique em **Criar banco de dados**. Escolha uma região próxima (por exemplo, `southamerica-east1`, em São Paulo) e o **modo de produção**.

### 2. Colar a configuração no site

1. Clique em ⚙️ **Configurações do projeto**, depois em **Seus apps** e no ícone **`</>`** (Web). Registre o app com o nome `keru`. O Firebase Hosting é opcional.
2. Copie o objeto `firebaseConfig` mostrado e cole no arquivo [`js/config.js`](js/config.js), no lugar dos valores `COLE_AQUI`.
3. No mesmo arquivo, preencha `allowedEmails` com os **dois e-mails** de vocês, em minúsculas.

> A `apiKey` do Firebase não é uma senha: ela pode ficar no código público. Quem protege os dados são as **regras** do passo 3.

### 3. Proteger os dados (importante)

1. Abra [`firestore.rules`](firestore.rules) e troque `voce@email.com` e `namorado@email.com` pelos e-mails de vocês, em minúsculas.
2. No console, vá em **Firestore Database**, depois em **Regras**. Apague o conteúdo, cole o arquivo inteiro e clique em **Publicar**.

Com isso, só vocês dois conseguem ler e escrever. Cada um edita apenas os próprios desejos e o próprio perfil. Os dois editam o Keremus. O par só pode mexer na reserva secreta dos seus desejos.

### 4. Publicar o site

**Opção A: GitHub Pages**

1. No repositório do GitHub, abra **Settings**, depois **Pages**. Em **Source**, escolha **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`, e clique em **Save**.
2. Depois de alguns minutos, o endereço aparece ali (algo como `https://SEU-USUARIO.github.io/keru/`).
3. No Firebase, abra **Authentication**, depois **Configurações**, e em **Domínios autorizados** adicione `SEU-USUARIO.github.io`.

> Pelo que sei, o GitHub Pages é gratuito para repositórios **públicos**. Em repositórios privados, ele costuma exigir um plano pago. Confira em https://docs.github.com/pages. Mesmo com o repositório público, os **dados** continuam protegidos pelas regras do Firestore: o código fica visível, os desejos não.

**Opção B: Firebase Hosting** (funciona com repositório privado)

Instale o Node.js e rode estes comandos dentro da pasta do projeto:

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

```bash
firebase use --add
```

```bash
firebase deploy
```

O endereço será algo como `https://SEU-PROJETO.web.app`. O `firebase deploy` também publica as regras do `firestore.rules`.

### 5. Criar as contas

Cada um abre o site no próprio computador e clica em **Criar conta**, com nome, e-mail liberado e senha. Assim que os dois tiverem conta, a aba **Desejos de (nome)** aparece automaticamente para cada um.

## Detalhes

- **Imagens:** cole o link de uma foto do produto. No site da loja, clique com o botão direito na imagem e escolha "Copiar endereço da imagem". Algumas lojas bloqueiam esse uso. Nesse caso, aparece o ícone da categoria no lugar da foto.
- **Reserva secreta:** a interface nunca mostra ao dono quem reservou o quê. Tecnicamente, porém, a informação fica no banco compartilhado, e alguém que inspecione o código no navegador conseguiria vê-la. É um segredo "de casal", não um cofre.
- **Tecnologia:** HTML, CSS e JavaScript puros, sem etapa de build, com o Firebase JS SDK 10.12.2 carregado pelo CDN oficial do Google.

## Estrutura

```
index.html          página única
css/style.css       identidade visual (cores, tipografia, componentes)
js/config.js        configuração do Firebase + e-mails do casal  ← editar
js/store.js         dados: Firebase ou modo demonstração
js/app.js           telas e interações
assets/favicon.svg  ícone (o laço do Keru)
firestore.rules     regras de segurança  ← editar
firebase.json       configuração do Firebase Hosting (opcional)
```
