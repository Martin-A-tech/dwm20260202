export const initCatalog = () => {
  const productoBase = { id: 1, nombre: 'Pan Amasado', precio: 1200, categoria: 'Panes' };
  const productoDetalles = { origen: 'Chile', stock: 50, disponible: true };

  const productoCompleto = { ...productoBase, ...productoDetalles };
  console.log('Producto fusionado con Spread:', productoCompleto);

  const productoEnOferta = Object.assign({}, productoBase, { precio: 990, enOferta: true });
  console.log('Producto con Object.assign:', productoEnOferta);
};