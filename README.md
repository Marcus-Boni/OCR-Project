# OPTSOLV OCR - Sistema Inteligente de Análise de Anotações

🚀 **Aplicação web completa para transformar anotações manuscritas em tarefas e notas organizadas usando IA**

## 🎯 Visão Geral

OPTSOLV OCR é uma solução moderna e completa que permite:

1. 📸 **Upload de Imagens** - Fotos de cadernos ou anotações manuscritas
2. 🔍 **OCR Inteligente** - Extração de texto usando Google Gemini Vision
3. 🤖 **Análise de IA** - Classificação automática em tarefas e notas
4. 📊 **Organização** - Gestão completa de tarefas e anotações

## ✨ Características

- ✅ **Design Moderno** - Interface limpa e profissional
- ✅ **Tema Orange** - Cor primária customizada
- ✅ **Dark Mode** - Modo escuro completo e elegante
- ✅ **Multilíngue** - Português (PT-BR) e Inglês (EN-US)
- ✅ **TypeScript Strict** - Código 100% tipado
- ✅ **Segurança First** - Autenticação e validação em todas as camadas
- ✅ **Performance** - Server Components + React Query + Caching

## 🛠️ Stack Tecnológica

### Frontend/Fullstack

- **Next.js 15+** - App Router com Server Components
- **TypeScript** - Modo strict habilitado
- **TailwindCSS** - Estilização utility-first
- **ShadcnUI** - Componentes de UI modernos

### Backend (BaaS)

- **Supabase** - PostgreSQL + Authentication + Storage
- **Google Gemini** - Vision (OCR) + Generative AI (Análise)

### State Management

- **TanStack Query** - Cache e sincronização de dados do servidor
- **Zustand** - Estado global de UI (sidebar, locale, etc)

### Outros

- **Zod** - Validação de schemas
- **next-intl** - Internacionalização
- **next-themes** - Gerenciamento de tema
- **sonner** - Toast notifications

## 📋 Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Google Gemini API Key ([obter aqui](https://aistudio.google.com/app/apikey))

## 🚀 Instalação Rápida

```bash
# Clone o repositório
git clone <seu-repo>
cd opts-ocr-app

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

# Execute em desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

## ⚙️ Configuração Completa

Para configurar o Supabase (banco de dados, storage, autenticação), siga o guia detalhado em:

📚 **[SETUP.md](./SETUP.md)** - Guia completo de configuração

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── [locale]/              # Rotas internacionalizadas
│   │   ├── auth/             # Login e registro
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── upload/           # Upload de imagens
│   │   ├── tasks/            # Gerenciamento de tarefas
│   │   └── notes/            # Gerenciamento de notas
│   └── api/                  # API Routes
│       ├── upload/           # Upload para Supabase
│       ├── ocr/              # Extração de texto
│       └── analyze/          # Análise de IA
├── components/
│   ├── ui/                   # Componentes ShadcnUI
│   └── providers/            # Context Providers
├── lib/
│   ├── supabase/            # Cliente Supabase
│   ├── store/               # Zustand stores
│   ├── validations/         # Schemas Zod
│   └── utils.ts             # Utilitários
├── i18n/                    # Configuração i18n
└── types/                   # TypeScript types
```

## 🎨 Princípios de Arquitetura

### 1. TypeScript Strict

- Zero uso de `any`
- Tipos derivados de schemas Zod com `z.infer`
- Validação em tempo de compilação

### 2. State Management

- **Server State:** React Query para dados do Supabase
- **UI State:** Zustand para estado global de UI
- **No useState/useEffect** para data fetching

### 3. Segurança

- Autenticação em todas as API Routes
- Row Level Security (RLS) no Supabase
- Validação com Zod em todos os endpoints
- Chaves de API apenas no servidor

### 4. Performance

- Server Components por padrão
- Client Components apenas quando necessário (Princípio da Ilha)
- Otimização de imagens com Next.js
- Cache inteligente com React Query

## 🔐 Segurança

- ✅ Autenticação Supabase em todas as rotas
- ✅ Row Level Security (RLS) nas tabelas
- ✅ Validação de entrada com Zod
- ✅ TypeScript strict mode
- ✅ Variáveis de ambiente seguras
- ✅ Limite de upload (10MB)
- ✅ Apenas formatos de imagem permitidos

## 🌐 Internacionalização

A aplicação suporta:

- 🇧🇷 **Português (PT-BR)** - Idioma padrão
- 🇺🇸 **English (EN-US)**

Troca de idioma via botão no header ou configurações.

## 📝 Fluxo de Uso

1. **Autenticação** → Login ou registro via Supabase Auth
2. **Upload** → Enviar imagem de anotação manuscrita
3. **OCR** → Gemini Vision extrai o texto automaticamente
4. **Análise** → Gemini AI classifica em tarefas e notas
5. **Gestão** → Visualize, edite e organize suas tarefas/notas

## 🛤️ Roadmap

- [ ] Upload via câmera (mobile)
- [ ] Edição inline de tarefas/notas
- [ ] Filtros e busca avançada
- [ ] Export para PDF/CSV
- [ ] Integração com calendário
- [ ] App mobile (React Native)

## 📚 Documentação

- [SETUP.md](./SETUP.md) - Configuração completa do Supabase
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Detalhes da implementação

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido com

- ❤️ Paixão por código limpo
- 🧠 Arquitetura de software sólida
- 🎨 Design moderno e acessível
- 🚀 Performance em mente

---

**OPTSOLV** - Transformando anotações em produtividade! 🚀✨
