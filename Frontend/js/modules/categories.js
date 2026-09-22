export const initCategories = () => {
  const categoriaPanes = document.getElementById('cat-panes');
  const categoriaPasteles = document.getElementById('cat-pasteles');
  const categoriaFacturas = document.getElementById('cat-facturas');

  const mostrarCategoria = (nombreCategoria) => {
    alert(`Explorando la categoría: ${nombreCategoria}`);
  };

  if (categoriaPanes) categoriaPanes.addEventListener('click', () => mostrarCategoria('Panes'));
  if (categoriaPasteles) categoriaPasteles.addEventListener('click', () => mostrarCategoria('Pasteles'));
  if (categoriaFacturas) categoriaFacturas.addEventListener('click', () => mostrarCategoria('Facturas'));
};