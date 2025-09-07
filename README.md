# 🚀 Guia de Configuração e Execução do Projeto Angular

Este projeto foi desenvolvido com **Angular** e este guia mostra como configurar e rodar o ambiente em **Windows** usando **PowerShell**.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org) (recomendado: versão **LTS**)
- NPM (vem junto com o Node.js)

Verifique se estão instalados corretamente:

```bash
node -v
npm -v
```

⚙️ 1. Permitir execução de scripts no PowerShell

Caso receba o erro:
```bash
npm.ps1 não pode ser carregado porque a execução de scripts está desabilitada neste sistema.
```

Execute o comando abaixo no PowerShell:
```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Digite S e pressione Enter quando solicitado.

📦 2. Instalar o Angular CLI

Se o comando ng não for reconhecido, instale a Angular CLI globalmente:

```bash
npm install -g @angular/cli
```

📁 3. Instalar dependências do projeto

Navegue até o diretório do projeto e instale as dependências:

```bash
npm install
```

▶️ 4. Rodar a aplicação Angular

Para iniciar o servidor de desenvolvimento:

```bash
ng serve --open
```

O navegador abrirá automaticamente em:
👉 http://localhost:4200
