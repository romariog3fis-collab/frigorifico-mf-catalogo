# Frigorífico MF — Catálogo Digital & Boutique de Carnes Nobres

Catálogo Web moderno, responsivo, performático e de alta conversão desenvolvido para o **Frigorífico MF** (`@frigorifico.mf`), aplicando as melhores práticas de Direção de Arte, UX/UI gastronômica e integração direta com o WhatsApp via API oficial (`wa.me`), em total conformidade com a LGPD.

---

## 🎨 1. Guia de Estilo & Identidade Visual Extraída

| Elemento | Especificação | Aplicação Visual |
| :--- | :--- | :--- |
| **Fundo Principal (Mineral)** | `#0C0A09` (Stone 950) | Atmosfera de brasa, carvão mineral escuro e sofisticação noturna |
| **Superfície dos Cards** | `#1C1917` (Stone 900) | Contraste sutil e elegante para destacar as fotografias 4:3 dos cortes |
| **Cor Secundária (Vinho Nobre)** | `#881337` / `#991B1B` | Evoca o rubi da carne nobre, a suculência e o fogo do churrasco |
| **Cor de Destaque / Ouro** | `#F59E0B` / `#FDE68A` | Selos de nobreza (*Corte Nobre*, *Mais Pedido*, *Angus Certificado*) |
| **Cor de Conversão / WhatsApp** | `#22C55E` / `#16A34A` | Botões de checkout e call-to-action de alta visibilidade e confiança |
| **Tipografia Display (Títulos)** | `Cinzel` & `Playfair Display` | Serifada aristocrática e marcante, tradicional de boutiques de carnes |
| **Tipografia UI (Leitura/Dados)**| `Plus Jakarta Sans` | Alta legibilidade para pesos, gramaturas, preços e formulários |
| **Tom de Voz** | Gourmet, Apetitoso & Artesanal | Foco em maciez, marmoreio, maturação de precisão e atendimento consultivo |

---

## 📂 2. Arquitetura e Estrutura de Arquivos

```
FrigorificoMF catalogo digital/
├── index.html                   # Estrutura semântica HTML5 completa
├── README.md                    # Documentação do projeto e guia de customização
├── css/
│   └── style.css                # Tokens de design, microanimações, glassmorphism e badges
├── js/
│   ├── config.js                # Configuração central: WhatsApp, horários, endereço e bio
│   ├── products.js              # Base de produtos, categorias, tags, fotos e pesos
│   ├── cart.js                  # Gerenciador do carrinho, persistência e compilador do WhatsApp
│   └── app.js                   # Interatividade: filtros, busca em tempo real, modais e UI
└── public/
    └── images/
        ├── marca/
        │   ├── logo.svg         # Logotipo vetorial oficial em alta definição
        │   └── favicon.svg      # Ícone do navegador estilizado
        └── produtos/
            └── README.md        # Mapeamento para substituição fácil das fotos locais
```

---

## 🚀 3. Como Rodar o Projeto Localmente

O catálogo foi desenvolvido com tecnologia nativa **Zero-Dependency** (HTML5 + Tailwind CDN + Vanilla JS ES6 modular), sem necessidade de instalação pesada de pacotes npm.

### Opção 1: Abertura Direta no Navegador
Basta dar **duplo clique no arquivo `index.html`** no seu explorador de arquivos. Ele abrirá instantaneamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

### Opção 2: Servidor Local (Recomendado para simulação real de HTTP)
No terminal, dentro da pasta do projeto, execute qualquer uma das opções:

**Via Python:**
```bash
python -m http.server 3000
# Acesse no navegador: http://localhost:3000
```

**Via Node.js (npx):**
```bash
npx serve .
# Acesse a URL indicada no terminal
```

---

## ⚙️ 4. Como Personalizar o WhatsApp e Dados da Loja

Toda a parametrização do estabelecimento é feita de forma simples e centralizada no arquivo `js/config.js`:

```javascript
const STORE_CONFIG = {
  brandName: "Frigorífico MF",
  // Insira o número oficial com DDI (55) + DDD + Telefone:
  whatsappNumber: "5585999999999", 
  
  // Link oficial do Instagram:
  instagramUrl: "https://www.instagram.com/frigorifico.mf/",
  
  // Endereço e Horários:
  address: "Av. dos Especialistas em Carnes, 1500 - Setor Gastronômico",
  operatingHours: {
    weekdays: "Segunda a Sábado: 07:30 às 19:30",
    sundays: "Domingos e Feriados: 07:30 às 13:30"
  }
};
```

---

## 🥩 5. Como Adicionar ou Modificar Produtos

Para alterar preços, pesos ou adicionar novos cortes, edite o arquivo `js/products.js`:

```javascript
{
  id: "picanha-prime-angus",
  name: "Picanha Prime Angus Certificada",
  category: "bovinos-nobres",
  price: 139.90,
  priceType: "kg",              // 'kg' para preço por quilo ou 'un' para unidade
  averageWeight: "Peça ~1,2kg a 1,4kg",
  unitMultiplier: 1.25,         // Peso aproximado para cálculo no carrinho
  badge: "Mais Pedido",
  badgeType: "gold",            // 'gold', 'ruby' ou 'green'
  sensoryDescription: "Capa de gordura espessa e marmorização nível 5+...",
  idealPreparation: "Fogo forte na grelha ou espeto...",
  pairing: "Cerveja artesanal Amber Ale ou Vinho Malbec...",
  image: "https://...",         // URL fotográfica ou caminho local 'public/images/produtos/...'
}
```

---

## 🔒 6. Segurança, Privacidade e LGPD

1. **Sem Banco de Dados Externo:** O sistema não armazena nem transmite dados sensíveis de clientes para servidores de terceiros.
2. **Checkout Seguro via WhatsApp:** Os dados preenchidos no Drawer (Nome, Endereço de Entrega, Tipo de Pagamento e Observações) são compilados no lado do cliente (Client-Side) e enviados diretamente para o aplicativo oficial do WhatsApp através do protocolo `https://wa.me/`.
3. **Imagens Seguras (Sem Hotlinking do Instagram):** Toda a estrutura de imagens utiliza diretórios locais e URLs estáveis de alta gastronomia, garantindo que o catálogo nunca sofra com links quebrados ou bloqueios de API.
