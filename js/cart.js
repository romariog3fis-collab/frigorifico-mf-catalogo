/**
 * FRIGORÍFICO MF - GERENCIADOR DO CARRINHO & CHECKOUT WHATSAPP
 * Gerencia o estado dos itens, persistência em localStorage e compilação do pedido
 * para a API Oficial do WhatsApp (sem necessidade de banco de dados, em conformidade com LGPD).
 */

class CartManager {
  constructor() {
    this.storageKey = "frigorifico_mf_cart_v2";
    this.items = this.loadCart();
    this.listeners = [];
  }

  // Carrega itens salvos na sessão local do navegador
  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Não foi possível carregar carrinho local:", e);
      return [];
    }
  }

  // Salva itens no navegador
  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      this.notifyListeners();
    } catch (e) {
      console.warn("Erro ao salvar carrinho:", e);
    }
  }

  // Adiciona ou incrementa um corte no carrinho
  addItem(product, quantity = 1, customNotes = "") {
    const existingIndex = this.items.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
      if (customNotes) {
        this.items[existingIndex].notes = customNotes;
      }
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        priceType: product.priceType,
        averageWeight: product.averageWeight,
        unitMultiplier: product.unitMultiplier || 1.0,
        image: product.image,
        quantity: quantity,
        notes: customNotes
      });
    }

    this.saveCart();
    return true;
  }

  // Altera a quantidade de um item
  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.saveCart();
    }
  }

  // Remove um item do carrinho
  removeItem(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.saveCart();
  }

  // Limpa todo o carrinho
  clearCart() {
    this.items = [];
    this.saveCart();
  }

  // Retorna quantidade total de itens
  getTotalCount() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  // Calcula o valor estimado total em Reais
  getEstimatedTotal() {
    return this.items.reduce((acc, item) => {
      // Se for por kg, calcula preço * peso médio unitário * quantidade
      if (item.priceType === "kg") {
        const itemEstimatedWeight = item.unitMultiplier * item.quantity;
        return acc + (item.price * itemEstimatedWeight);
      }
      // Se for por unidade
      return acc + (item.price * item.quantity);
    }, 0);
  }

  // Calcula o peso total estimado em Kg
  getEstimatedWeight() {
    return this.items.reduce((acc, item) => {
      return acc + (item.unitMultiplier * item.quantity);
    }, 0);
  }

  // Registra callbacks de atualização da UI
  subscribe(callback) {
    this.listeners.push(callback);
    callback(this);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this));
  }

  // Compila e formata a mensagem para envio direto pelo WhatsApp
  generateWhatsAppLink(customerData = {}) {
    const {
      name = "Cliente",
      deliveryMethod = "retirada", // 'delivery' ou 'retirada'
      address = "",
      neighborhood = "",
      paymentMethod = "PIX",
      generalNotes = ""
    } = customerData;

    if (this.items.length === 0) return null;

    const config = window.STORE_CONFIG || {};
    const phone = config.whatsappNumber || "5585999999999";

    // Data e Hora do Pedido
    const now = new Date();
    const dataHoraFormatada = now.toLocaleDateString("pt-BR") + " às " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Montagem do texto elegante e estruturado
    let message = `🥩 *NOVO PEDIDO - ${config.brandName || "FRIGORÍFICO MF"}* 🥩\n`;
    message += `📅 _Realizado em: ${dataHoraFormatada}_\n`;
    message += `──────────────────────\n\n`;

    message += `👤 *DADOS DO CLIENTE*\n`;
    message += `• *Nome:* ${name.trim() || "Não informado"}\n`;
    message += `• *Modalidade:* ${deliveryMethod === "delivery" ? "🛵 Entrega / Delivery" : "🏪 Retirada no Balcão"}\n`;

    if (deliveryMethod === "delivery") {
      message += `• *Endereço:* ${address.trim() || "A combinar"}\n`;
      if (neighborhood.trim()) {
        message += `• *Bairro/Região:* ${neighborhood.trim()}\n`;
      }
    }

    message += `• *Forma de Pagamento Prevista:* ${paymentMethod}\n`;

    if (generalNotes.trim()) {
      message += `• *Observações Gerais:* ${generalNotes.trim()}\n`;
    }

    message += `\n──────────────────────\n`;
    message += `🛒 *CORTES SELECIONADOS:*\n\n`;

    this.items.forEach((item, index) => {
      let itemTotalStr = "";
      if (item.priceType === "kg") {
        const approxWeight = (item.unitMultiplier * item.quantity).toFixed(2).replace(".", ",");
        const approxPrice = (item.price * item.unitMultiplier * item.quantity).toFixed(2).replace(".", ",");
        itemTotalStr = `~${approxWeight}kg | Aprox. R$ ${approxPrice}`;
      } else {
        const totalPrice = (item.price * item.quantity).toFixed(2).replace(".", ",");
        itemTotalStr = `R$ ${totalPrice}`;
      }

      message += `*${index + 1}. ${item.name}*\n`;
      message += `   ↳ Qtd: *${item.quantity} un* (${item.averageWeight})\n`;
      message += `   ↳ Valor: ${itemTotalStr}\n`;
      if (item.notes) {
        message += `   ↳ _Obs do corte: ${item.notes}_\n`;
      }
      message += `\n`;
    });

    const totalEstimado = this.getEstimatedTotal().toFixed(2).replace(".", ",");
    const pesoEstimado = this.getEstimatedWeight().toFixed(2).replace(".", ",");

    message += `──────────────────────\n`;
    message += `📦 *Total de Itens:* ${this.getTotalCount()} peças/bandejas\n`;
    message += `⚖️ *Peso Total Estimado:* ~${pesoEstimado} kg\n`;
    message += `💰 *VALOR ESTIMADO:* *R$ ${totalEstimado}*\n`;
    message += `_(O valor exato pode variar ligeiramente de acordo com a pesagem precisa na balança)_\n\n`;

    message += `✨ *Por favor, confirme a disponibilidade e o prazo de entrega!*\n`;
    message += `_Pedido gerado via Catálogo Digital Oficial ${config.brandName}_`;

    // Codifica para URL segura
    const encodedText = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedText}`;
  }
}

window.cartManager = new CartManager();
