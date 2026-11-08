const express = require('express');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const axios = require('axios');

const INVENTORY_URL = 'http://127.0.0.1:9200';
const ORDERS_URL = 'http://127.0.0.1:9400';
const GATEWAY_SECRET = 'gateway-api-secret-456';

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
      const resOrders = await axios.get(`${ORDERS_URL}/orders/${email}`, {
        headers: { 'X-Gateway-Secret': GATEWAY_SECRET }
      });
      const pedido = resOrders.data.find(p => p.id === id);
      if (!pedido) throw new Error("Pedido no encontrado");

      const resInventory = await axios.get(`${INVENTORY_URL}/products`, {
        headers: { 'X-Gateway-Secret': GATEWAY_SECRET }
      });
      
      const productosDelPedido = resInventory.data.filter(prodInv => 
        pedido.items.some(item => item.id === prodInv.id)
      );

      return {
        ...pedido,
        productos_detallados: productosDelPedido
      };
    }
  }
};

async function startServer() {
  try {
    console.log("1. Iniciando servidor...");
    const app = express();
    app.use(cors());

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