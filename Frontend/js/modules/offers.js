export const initOffers = () => {
  const offerTitle = document.getElementById('offer-title');
  if (!offerTitle) return;

  const ofertas = [
    'Oferta del día: Pan amasado recién horneado',
    'Oferta del día: Torta de chocolate 20% OFF',
    'Oferta del día: Docena de facturas a $3.500',
    'Oferta del día: Pan de campo artesanal'
  ];

  let indexOferta = 0;

  setInterval(() => {
    indexOferta = (indexOferta + 1) % ofertas.length;
    offerTitle.textContent = ofertas[indexOferta];
  }, 4000);
};