/**
 * FRIGORÍFICO MF | BOI & BRASA - CONFIGURAÇÕES OFICIAIS
 * Dados extraídos diretamente do Cardápio Oficial e Perfil Comercial.
 */

const STORE_CONFIG = {
  // Informações da Marca
  brandName: "Frigorífico MF | Boi & Brasa",
  shortName: "Frigorífico MF",
  badgeText: "Boi & Brasa &bull; Churrasco & Assados",
  slogan: "O Melhor Churrasco, Assados no Bafo e Quentinhas de Fortaleza",
  bioDescription: "Referência em assados na brasa, cortes nobres, carnes no bafo, guarnições típicas e quentinhas executivas com sabor autêntico.",

  // Contato e Integração WhatsApp Oficial
  whatsappNumber: "5585996928975",
  whatsappFormatted: "(85) 99692-8975",
  whatsappDefaultMsgIntro: "🥩 Olá, equipe do Frigorífico MF Boi & Brasa! Gostaria de fazer o seguinte pedido pelo Cardápio Digital:",

  // Redes Sociais e Links Oficiais
  instagramUrl: "https://www.instagram.com/frigorifico.mf/",
  instagramHandle: "@frigorifico.mf",
  digitalMenuUrl: "https://heyzine.com/flip-book/cff3c708b4.html",

  // Localização e Horários Oficiais
  address: "R. Benjamim Brasil, 1090",
  neighborhood: "Jardim Cearense",
  cityState: "Fortaleza - CE, CEP 60712-003",
  fullAddress: "R. Benjamim Brasil, 1090 - Jardim Cearense, Fortaleza - CE, 60712-003",
  googleMapsUrl: "https://maps.google.com/?q=R.+Benjamim+Brasil,+1090+-+Jardim+Cearense,+Fortaleza+-+CE",
  
  operatingHours: {
    weekdays: "Segunda a Sábado: 07:30 às 19:00",
    sundays: "Domingos: 07:30 às 14:00 (Assados e Almoço)"
  },

  // Políticas de Entrega
  delivery: {
    available: true,
    pickupAvailable: true,
    estimatedTime: "Consulte taxa e tempo de entrega para o seu bairro no WhatsApp.",
    infoNotice: "Taxa de entrega calculada de acordo com o seu bairro na confirmação via WhatsApp."
  },

  // Aviso de Privacidade & LGPD
  lgpdNotice: "Privacidade & LGPD: Seus dados preenchidos neste catálogo (nome, endereço e itens) são utilizados estritamente para estruturar a mensagem de atendimento no seu próprio WhatsApp. Não armazenamos informações sensíveis de clientes em servidores externos."
};

window.STORE_CONFIG = STORE_CONFIG;
