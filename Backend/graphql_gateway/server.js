const express = require('express');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const axios = require('axios');

const INVENTORY_URL = 'http://127.0.0.1:9200';
const ORDERS_URL = 'http://127.0.0.1:9400';
const GATEWAY_SECRET = process.env.GATEWAY_SECRET;

const typeDefs = gql`
  type Producto {
    id: ID!
    nombre: String!
    precio: Int!
    stock: Int!
  }

  type ItemPedido {
    id: String!
    nombre: String!
    precio: Int!
  }

  type Pedido {
    id: ID!
    cliente_email: String!
    total: Int!
    estado: String!
    items: [ItemPedido]
    productos_detallados: [Producto] 
  }

  type Query {
    getProductos: [Producto]
    getPedidosCliente(email: String!): [Pedido]
    getPedidoConDetalles(id: String!, email: String!): Pedido
  }
`;

const resolvers = {
  Query: {
    getProductos: async () => {
      const res = await axios.get(`${INVENTORY_URL}/products`, {
        headers: { 'X-Gateway-Secret': GATEWAY_SECRET }
      });
      return res.data;
    },
    getPedidosCliente: async (_, { email }) => {
      const res = await axios.get(`${ORDERS_URL}/orders/${email}`, {
        headers: { 'X-Gateway-Secret': GATEWAY_SECRET }
      });
      return res.data;
    },
        getPedidoConDetalles: async (_, { id, email }) => {
      try {
        // 1. Buscamos los pedidos del cliente
        const resOrders = await axios.get(`${ORDERS_URL}/orders/${email}`, {
          headers: { 'X-Gateway-Secret': GATEWAY_SECRET }
        });
        
        const pedido = resOrders.data.find(p => p.id === id);
        if (!pedido) throw new Error("Pedido no encontrado para este cliente");

        // 2. Buscamos los productos de inventory
        const resInventory = await axios.get(`${INVENTORY_URL}/products`, {
          headers: { 'X-Gateway-Secret': GATEWAY_SECRET }
        });
        
        // 3. Filtramos los productos que están en el pedido
        const productosDelPedido = resInventory.data.filter(prodInv => 
          pedido.items.some(item => String(item.id) === String(prodInv.id))
        );

        return {
          ...pedido,
          productos_detallados: productosDelPedido
        };
      } catch (error) {
        // Si hay un error (como 404), mandamos un error limpio a GraphQL
        console.error("Error en resolver:", error.message);
        throw new Error("No se pudo obtener el pedido: " + error.message);
      }
    }
  }
};

async function startServer() {
  try {
    console.log("1. Iniciando servidor...");
    const app = express();
    app.use(cors());

        // --- MIDDLEWARE DE SEGURIDAD ---
    app.use('/graphql', (req, res, next) => {
      const providedSecret = (req.headers['x-gateway-secret'] || '').trim();
      const expectedSecret = (process.env.GATEWAY_SECRET || '').trim();
      
      console.log("-> Secreto recibido:", providedSecret);
      console.log("-> Secreto esperado:", expectedSecret);

      if (!providedSecret || providedSecret !== expectedSecret) {
        console.log(`[BLOQUEADO] Intento de acceso directo al GraphQL Gateway sin secreto.`);
        return res.status(403).json({ 
          error: "Acceso directo denegado. Se requiere X-Gateway-Secret." 
        });
      }
      next(); 
    });

    const server = new ApolloServer({ typeDefs, resolvers });
    
    console.log("2. Iniciando Apollo Server...");
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    app.listen(8090, () => {
      console.log("=========================================");
      console.log(" Puede verlo en: http://localhost:8090/graphql");
      console.log("=========================================");
    });
  } catch (error) {
    console.error("ERROR AL INICIAR EL SERVIDOR:", error);
  }
}

startServer();