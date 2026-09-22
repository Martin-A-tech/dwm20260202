export const initCatalog = () => {
  const productoBase = {
    id: 1,
    nombre: 'Pan Amasado',
    precio: 1200,
    categoria: 'Panes'
  };

  const productoDetalles = {
    origen: 'Chile',
    stock: 50,
    disponible: true
  };

  const productoCompleto = { ...productoBase, ...productoDetalles };
  console.log('Producto fusionado con Spread:', productoCompleto);

  const productoEnOferta = Object.assign({}, productoBase, { precio: 990, enOferta: true });
  console.log('Producto con Object.assign:', productoEnOferta);

  const catalogo = {
    pan: { id: 1, nombre: 'Pan Amasado', precio: 1200 },
    pastel: { id: 2, nombre: 'Torta de Chocolate', precio: 12000 },
    factura: { id: 3, nombre: 'Factura de Crema', precio: 500 },
    empanada: { id: 4, nombre: 'Empanada de Pino', precio: 2500 }
  };

  console.log('--- Catálogo (Object.values) ---');
  Object.values(catalogo).forEach(item => {
    console.log(`Producto: ${item.nombre} | Precio: $${item.precio}`);
  });

  console.log('--- Catálogo (Object.entries) ---');
  for (const [key, value] of Object.entries(catalogo)) {
    console.log(`Categoría: ${key} -> ${value.nombre}`);
  }

  console.log('--- Categorías (for...in) ---');
  for (const key in catalogo) {
    console.log(`Categoría registrada: ${key}`);
  }
};