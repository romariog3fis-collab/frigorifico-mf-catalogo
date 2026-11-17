/**
 * FRIGORÍFICO MF - APLICAÇÃO PRINCIPAL & INTERATIVIDADE
 * Gerencia renderização da vitrine, busca em tempo real, filtros de categoria,
 * modais de detalhes e sincronização com o carrinho/WhatsApp.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Estado da Aplicação
  const state = {
    currentCategory: "todos",
    searchQuery: "",
    sortBy: "featured",
    productQuantities: {} // Armazena quantidades dos cards na vitrine
  };

  // Referências DOM Principais
  const categoriesContainer = document.getElementById("categories-container");
  const productsGrid = document.getElementById("products-grid");
  const productsCount = document.getElementById("products-count");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const sortSelect = document.getElementById("sort-select");

  // Drawer / Carrinho
  const cartDrawer = document.getElementById("cart-drawer");
  const openCartBtn = document.getElementById("open-cart-btn");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartEmptyState = document.getElementById("cart-empty-state");
  const cartFooter = document.getElementById("cart-footer");
  const cartBadge = document.getElementById("cart-badge");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartWeightEl = document.getElementById("cart-weight");
  const whatsappCheckoutBtn = document.getElementById("whatsapp-checkout-btn");

  // Inputs do Cliente no Checkout
  const clientNameInput = document.getElementById("client-name");
  const deliveryTypeRadios = document.querySelectorAll('input[name="delivery-type"]');
  const deliveryAddressContainer = document.getElementById("delivery-address-container");
  const clientAddressInput = document.getElementById("client-address");
  const clientNeighborhoodInput = document.getElementById("client-neighborhood");
  const paymentMethodSelect = document.getElementById("payment-method");
  const clientNotesInput = document.getElementById("client-notes");

  // Modal Quick View
  const quickViewModal = document.getElementById("quickview-modal");
  const closeQuickViewBtn = document.getElementById("close-quickview-btn");
  const quickViewContent = document.getElementById("quickview-content");

  // Toast Container
  const toastContainer = document.getElementById("toast-container");

  // =========================================================================
  // INICIALIZAÇÃO DOS COMPONENTES
  // =========================================================================

  function init() {
    renderCategories();
    renderProducts();
    setupEventListeners();
    setupScrollObserver();
    window.cartManager.subscribe(updateCartUI);
  }

  // =========================================================================
  // RENDERIZAÇÃO DE CATEGORIAS
  // =========================================================================

  function renderCategories() {
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = window.CATEGORIES.map(cat => {
      const isActive = cat.id === state.currentCategory;
      return `
        <button 
          data-category="${cat.id}" 
          class="filter-btn px-5 py-2.5 rounded-full text-xs md:text-sm font-medium tracking-wide flex items-center gap-2 ${isActive ? 'active' : ''}"
        >
          <span>${cat.name}</span>
        </button>
      `;
    }).join("");

    // Adiciona evento aos botões de categoria
    categoriesContainer.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const catId = btn.getAttribute("data-category");
        setCategory(catId);
      });
    });
  }

  function setCategory(catId) {
    state.currentCategory = catId;
    categoriesContainer.querySelectorAll("button").forEach(btn => {
      if (btn.getAttribute("data-category") === catId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    renderProducts();
  }

  // =========================================================================
  // RENDERIZAÇÃO DA VITRINE DE PRODUTOS
  // =========================================================================

  function filterAndSortProducts() {
    let list = [...window.PRODUCTS_DATA];

    // Filtro por Categoria
    if (state.currentCategory !== "todos") {
      list = list.filter(p => p.category === state.currentCategory || p.subCategory === state.currentCategory);
    }

    // Filtro por Busca (Nome, Descrição e Tags)
    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const inName = p.name.toLowerCase().includes(q);
        const inDesc = p.sensoryDescription.toLowerCase().includes(q);
        const inTags = p.tags ? p.tags.some(t => t.toLowerCase().includes(q)) : false;
        return inName || inDesc || inTags;
      });
    }

    // Ordenação
    if (state.sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }

  function renderProducts() {
    const products = filterAndSortProducts();

    if (productsCount) {
      productsCount.textContent = `${products.length} ${products.length === 1 ? 'corte nobre disponível' : 'cortes nobres disponíveis'}`;
    }

    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div class="col-span-full py-16 text-center text-stone-400">
          <div class="inline-block p-4 rounded-full bg-stone-900 border border-stone-800 mb-4 text-amber-500">
            <svg class="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="font-display text-xl text-stone-200 mb-2">Nenhum corte encontrado</h3>
          <p class="text-sm max-w-md mx-auto mb-6">Não encontramos nenhum produto com o termo "${state.searchQuery}". Tente buscar por picanha, ancho, costela ou limpe os filtros.</p>
          <button id="reset-filter-btn" class="px-5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-sm font-semibold transition">
            Limpar Busca e Filtros
          </button>
        </div>
      `;

      const resetBtn = document.getElementById("reset-filter-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.searchQuery = "";
          searchInput.value = "";
          state.currentCategory = "todos";
          renderCategories();
          renderProducts();
        });
      }
      return;
    }

    productsGrid.innerHTML = products.map(product => {
      const qty = state.productQuantities[product.id] || 1;
      const formattedPrice = product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const priceUnit = product.priceType === "kg" ? "/ kg" : "/ un";

      let badgeHtml = "";
      if (product.badge) {
        const badgeClass = product.badgeType === "ruby" ? "badge-ruby" : 
                           product.badgeType === "green" ? "badge-green" : "badge-gold";
        badgeHtml = `<span class="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full ${badgeClass}">${product.badge}</span>`;
      }

      return `
        <article class="product-card flex flex-col justify-between group reveal-item" data-id="${product.id}">
          <!-- Topo: Imagem 4:3 com Badges -->
          <div>
            <div class="aspect-4-3 cursor-pointer" onclick="window.openProductModal('${product.id}')">
              <img 
                src="${product.image}" 
                alt="${product.name}" 
                loading="lazy"
                onerror="this.onerror=null; this.src='public/images/produtos/picanha.jpg'"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-70"></div>
              
              <!-- Selo Flutuante -->
              <div class="absolute top-3 left-3 z-10">
                ${badgeHtml}
              </div>

              <!-- Botão Olho Quick View no Hover -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 backdrop-blur-[2px]">
                <span class="px-4 py-2 rounded-full bg-stone-900/90 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  Ver Detalhes
                </span>
              </div>
            </div>

            <!-- Conteúdo Descritivo -->
            <div class="p-5">
              <div class="flex items-center justify-between text-xs text-amber-500/90 font-medium mb-1.5">
                <span class="tracking-widest uppercase">${product.averageWeight}</span>
                <span class="text-stone-400">Selagem Nobre</span>
              </div>

              <h3 
                class="font-display text-lg md:text-xl font-bold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                onclick="window.openProductModal('${product.id}')"
              >
                ${product.name}
              </h3>

              <p class="text-xs text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                ${product.sensoryDescription}
              </p>
            </div>
          </div>

          <!-- Rodapé do Card: Preço + Seletor de Quantidade + Botão Adicionar -->
          <div class="px-5 pb-5 pt-2 border-t border-white/[0.06] bg-stone-900/50">
            <div class="flex items-baseline justify-between mb-3">
              <div>
                <span class="text-[10px] uppercase text-stone-400 block tracking-wider font-semibold">Valor Estimado</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-xs text-amber-400 font-bold">R$</span>
                  <span class="font-display text-2xl font-black text-amber-400">${formattedPrice}</span>
                  <span class="text-xs text-stone-400">${priceUnit}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Seletor de Quantidade -->
              <div class="flex items-center bg-stone-950 border border-stone-800 rounded-lg overflow-hidden h-10 px-1">
                <button 
                  onclick="window.changeProductCardQty('${product.id}', -1)"
                  class="w-7 h-full flex items-center justify-center text-stone-400 hover:text-stone-100 active:scale-95 transition"
                  aria-label="Diminuir quantidade"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"></path></svg>
                </button>
                <span id="qty-val-${product.id}" class="w-8 text-center text-xs font-bold text-stone-200">${qty}</span>
                <button 
                  onclick="window.changeProductCardQty('${product.id}', 1)"
                  class="w-7 h-full flex items-center justify-center text-stone-400 hover:text-stone-100 active:scale-95 transition"
                  aria-label="Aumentar quantidade"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>

              <!-- Botão Adicionar à Lista -->
              <button 
                onclick="window.addProductFromCard('${product.id}', this)"
                class="flex-1 h-10 px-3 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 border border-stone-700/70 text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <svg class="w-4 h-4 text-amber-400 group-hover:text-stone-950 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Adicionar
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    setupScrollObserver();
  }

  // =========================================================================
  // CONTROLADORES GLOBAIS DE QUANTIDADE NA VITRINE
  // =========================================================================

  window.changeProductCardQty = function(productId, delta) {
    const current = state.productQuantities[productId] || 1;
    const newQty = Math.max(1, current + delta);
    state.productQuantities[productId] = newQty;
    const label = document.getElementById(`qty-val-${productId}`);
    if (label) label.textContent = newQty;
  };

  window.addProductFromCard = function(productId, buttonElement) {
    const product = window.PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const qty = state.productQuantities[productId] || 1;
    window.cartManager.addItem(product, qty);

    // Efeito visual no botão
    if (buttonElement) {
      const originalHtml = buttonElement.innerHTML;
      buttonElement.innerHTML = `✓ Adicionado!`;
      buttonElement.classList.add("bg-emerald-600", "text-white", "border-emerald-500");
      setTimeout(() => {
        buttonElement.innerHTML = originalHtml;
        buttonElement.classList.remove("bg-emerald-600", "text-white", "border-emerald-500");
      }, 1000);
    }

    showToast(`🥩 <b>${product.name}</b> (${qty}x) adicionado à sua lista!`);
  };

  // =========================================================================
  // MODAL QUICK VIEW (DETALHES DO CORTE & PREPARO)
  // =========================================================================

  window.openProductModal = function(productId) {
    const product = window.PRODUCTS_DATA.find(p => p.id === productId);
    if (!product || !quickViewContent) return;

    const formattedPrice = product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const priceUnit = product.priceType === "kg" ? "/ kg" : "/ un";

    quickViewContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <!-- Foto 4:3 e Badges -->
        <div class="aspect-4-3 rounded-xl overflow-hidden border border-stone-800 relative bg-stone-900">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
          <div class="absolute top-3 left-3">
            <span class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full badge-gold">${product.badge || 'Corte Nobre'}</span>
          </div>
        </div>

        <!-- Especificações Gastronômicas -->
        <div class="flex flex-col justify-between">
          <div>
            <span class="text-xs text-amber-500 font-semibold tracking-widest uppercase block mb-1">
              ${product.averageWeight} &bull; Padrão Nobre
            </span>
            <h2 class="font-display text-2xl font-bold text-stone-100 mb-3">${product.name}</h2>
            
            <p class="text-sm text-stone-300 leading-relaxed mb-4">
              ${product.sensoryDescription}
            </p>

            <!-- Card de Dica do Mestre Churrasqueiro -->
            <div class="bg-stone-900/90 border border-stone-800 rounded-xl p-4 mb-4 space-y-2 text-xs">
              <div class="flex items-start gap-2">
                <span class="text-amber-400 font-bold">🔥 Modo de Preparo:</span>
                <span class="text-stone-300">${product.idealPreparation}</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-amber-400 font-bold">🍷 Harmonização:</span>
                <span class="text-stone-300">${product.pairing}</span>
              </div>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-6">
              ${(product.tags || []).map(t => `<span class="px-2.5 py-1 text-[11px] rounded bg-stone-800/80 text-stone-400 border border-stone-700/50">#${t}</span>`).join("")}
            </div>
          </div>

          <!-- Rodapé do Modal com Preço e Ação -->
          <div class="border-t border-stone-800 pt-4 flex items-center justify-between gap-4">
            <div>
              <span class="text-[10px] text-stone-400 uppercase tracking-wider block">Preço</span>
              <div class="flex items-baseline gap-1">
                <span class="text-amber-400 font-bold">R$</span>
                <span class="font-display text-3xl font-black text-amber-400">${formattedPrice}</span>
                <span class="text-xs text-stone-400">${priceUnit}</span>
              </div>
            </div>

            <button 
              onclick="window.addProductFromModal('${product.id}')"
              class="px-6 py-3 rounded-xl btn-gold text-stone-950 font-bold text-sm tracking-wide uppercase flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 active:scale-95 transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Adicionar à Lista
            </button>
          </div>
        </div>
      </div>
    `;

    quickViewModal.classList.add("open");
  };

  window.addProductFromModal = function(productId) {
    const product = window.PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    window.cartManager.addItem(product, 1);
    showToast(`🥩 <b>${product.name}</b> adicionado ao pedido!`);
    closeQuickViewModal();
  };

  function closeQuickViewModal() {
    if (quickViewModal) {
      quickViewModal.classList.remove("open");
    }
  }

  if (closeQuickViewBtn) {
    closeQuickViewBtn.addEventListener("click", closeQuickViewModal);
  }

  // =========================================================================
  // ATUALIZAÇÃO DA UI DO CARRINHO (DRAWER)
  // =========================================================================

  function updateCartUI(cart) {
    const totalCount = cart.getTotalCount();
    const totalVal = cart.getEstimatedTotal();
    const totalWeight = cart.getEstimatedWeight();

    // Atualiza badges
    if (cartBadge) {
      cartBadge.textContent = totalCount;
      if (totalCount > 0) {
        cartBadge.classList.remove("hidden");
        cartBadge.classList.add("flex");
      } else {
        cartBadge.classList.add("hidden");
        cartBadge.classList.remove("flex");
      }
    }

    // Atualiza Totais do Drawer
    if (cartSubtotalEl) {
      cartSubtotalEl.textContent = `R$ ${totalVal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (cartWeightEl) {
      cartWeightEl.textContent = `~${totalWeight.toFixed(2).replace(".", ",")} kg`;
    }

    // Alterna entre estado vazio e lista de itens
    if (totalCount === 0) {
      if (cartEmptyState) cartEmptyState.classList.remove("hidden");
      if (cartItemsContainer) cartItemsContainer.classList.add("hidden");
      if (cartFooter) cartFooter.classList.add("opacity-50", "pointer-events-none");
    } else {
      if (cartEmptyState) cartEmptyState.classList.add("hidden");
      if (cartItemsContainer) {
        cartItemsContainer.classList.remove("hidden");
        renderCartItems(cart);
      }
      if (cartFooter) cartFooter.classList.remove("opacity-50", "pointer-events-none");
    }

    updateWhatsAppCheckoutLink(cart);
  }

  function renderCartItems(cart) {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = cart.items.map(item => {
      let subtotalStr = "";
      if (item.priceType === "kg") {
        const itemWeight = (item.unitMultiplier * item.quantity).toFixed(2).replace(".", ",");
        const itemTotal = (item.price * item.unitMultiplier * item.quantity).toFixed(2).replace(".", ",");
        subtotalStr = `~${itemWeight}kg &bull; R$ ${itemTotal}`;
      } else {
        const itemTotal = (item.price * item.quantity).toFixed(2).replace(".", ",");
        subtotalStr = `R$ ${itemTotal}`;
      }

      return `
        <div class="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-3">
          <!-- Imagem Miniatura -->
          <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover border border-stone-700/60" />

          <!-- Detalhes do Item -->
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-stone-100 truncate">${item.name}</h4>
            <p class="text-[11px] text-amber-500 font-medium mt-0.5">${subtotalStr}</p>
            <span class="text-[10px] text-stone-500 block truncate">${item.averageWeight}</span>
          </div>

          <!-- Controle de Quantidade -->
          <div class="flex items-center bg-stone-950 border border-stone-800 rounded-lg overflow-hidden h-8">
            <button 
              onclick="window.cartManager.updateQuantity('${item.id}', -1)"
              class="w-6 h-full flex items-center justify-center text-stone-400 hover:text-stone-100 transition"
              aria-label="Diminuir"
            >
              -
            </button>
            <span class="w-6 text-center text-xs font-bold text-stone-200">${item.quantity}</span>
            <button 
              onclick="window.cartManager.updateQuantity('${item.id}', 1)"
              class="w-6 h-full flex items-center justify-center text-stone-400 hover:text-stone-100 transition"
              aria-label="Aumentar"
            >
              +
            </button>
          </div>

          <!-- Botão Remover -->
          <button 
            onclick="window.cartManager.removeItem('${item.id}')"
            class="p-1.5 text-stone-500 hover:text-rose-400 transition"
            title="Remover corte"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `;
    }).join("");
  }

  function updateWhatsAppCheckoutLink(cart) {
    if (!whatsappCheckoutBtn) return;

    const selectedDeliveryMethod = document.querySelector('input[name="delivery-type"]:checked')?.value || "retirada";
    const customerData = {
      name: clientNameInput ? clientNameInput.value : "",
      deliveryMethod: selectedDeliveryMethod,
      address: clientAddressInput ? clientAddressInput.value : "",
      neighborhood: clientNeighborhoodInput ? clientNeighborhoodInput.value : "",
      paymentMethod: paymentMethodSelect ? paymentMethodSelect.value : "PIX",
      generalNotes: clientNotesInput ? clientNotesInput.value : ""
    };

    const link = cart.generateWhatsAppLink(customerData);
    if (link) {
      whatsappCheckoutBtn.href = link;
    } else {
      whatsappCheckoutBtn.href = "#";
    }
  }

  // =========================================================================
  // GESTÃO DO DRAWER (ABRIR / FECHAR)
  // =========================================================================

  function openDrawer() {
    if (cartDrawer) {
      cartDrawer.classList.add("open");
      document.body.classList.add("overflow-hidden");
    }
  }

  function closeDrawer() {
    if (cartDrawer) {
      cartDrawer.classList.remove("open");
      document.body.classList.remove("overflow-hidden");
    }
  }

  // =========================================================================
  // SISTEMA DE TOAST (NOTIFICAÇÃO FLUTUANTE)
  // =========================================================================

  function showToast(messageHtml) {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "px-4 py-3 rounded-xl bg-stone-900 border border-amber-500/40 text-stone-100 text-xs shadow-2xl flex items-center gap-2 transform translate-y-4 opacity-0 transition-all duration-300";
    toast.innerHTML = `
      <span class="status-pulse"></span>
      <div>${messageHtml}</div>
    `;

    toastContainer.appendChild(toast);

    // Animação de entrada
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    });

    // Animação de saída
    setTimeout(() => {
      toast.classList.add("translate-y-4", "opacity-0");
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  // =========================================================================
  // EVENT LISTENERS & DELEGATION
  // =========================================================================

  function setupEventListeners() {
    // Abrir/Fechar Carrinho
    if (openCartBtn) openCartBtn.addEventListener("click", openDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeDrawer);

    // Fechar ao clicar no backdrop escuro
    if (cartDrawer) {
      cartDrawer.addEventListener("click", (e) => {
        if (e.target === cartDrawer) closeDrawer();
      });
    }

    if (quickViewModal) {
      quickViewModal.addEventListener("click", (e) => {
        if (e.target === quickViewModal) closeQuickViewModal();
      });
    }

    // Tecla ESC fecha modais e drawer
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeDrawer();
        closeQuickViewModal();
      }
    });

    // Busca com Debounce
    let searchTimeout;
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          state.searchQuery = e.target.value;
          if (clearSearchBtn) {
            if (e.target.value) {
              clearSearchBtn.classList.remove("hidden");
            } else {
              clearSearchBtn.classList.add("hidden");
            }
          }
          renderProducts();
        }, 200);
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        state.searchQuery = "";
        clearSearchBtn.classList.add("hidden");
        renderProducts();
      });
    }

    // Ordenação
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        renderProducts();
      });
    }

    // Alternar campos de Delivery vs Retirada
    deliveryTypeRadios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "delivery") {
          if (deliveryAddressContainer) deliveryAddressContainer.classList.remove("hidden");
        } else {
          if (deliveryAddressContainer) deliveryAddressContainer.classList.add("hidden");
        }
        updateWhatsAppCheckoutLink(window.cartManager);
      });
    });

    // Reagir a inputs do formulário do cliente para atualizar a mensagem do WhatsApp
    [clientNameInput, clientAddressInput, clientNeighborhoodInput, paymentMethodSelect, clientNotesInput].forEach(inp => {
      if (inp) {
        inp.addEventListener("input", () => {
          updateWhatsAppCheckoutLink(window.cartManager);
        });
      }
    });

    // Botão Limpar Carrinho
    const clearCartBtn = document.getElementById("clear-cart-btn");
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => {
        if (confirm("Deseja realmente esvaziar todos os itens da sua lista?")) {
          window.cartManager.clearCart();
        }
      });
    }

    // Navegação suave para catálogo ao clicar no CTA Hero
    const heroCtaBtn = document.getElementById("hero-catalog-cta");
    if (heroCtaBtn) {
      heroCtaBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById("catalogo-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }

  // =========================================================================
  // REVEAL ON SCROLL (INTERSECTION OBSERVER)
  // =========================================================================

  function setupScrollObserver() {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll(".reveal-item:not(.revealed)").forEach(item => {
      observer.observe(item);
    });
  }

  // Inicializa a aplicação
  init();
});
