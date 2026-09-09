const express = require('express');
const mongoose = require('mongoose');  // <-- corregido: moongoose → mongoose
const cors = require('cors');

const { ApolloServer, gql } = require('apollo-server-express');  // <-- corregido: apolloServer → ApolloServer
const Usuario = require('./models/usuario');

mongoose.connect('mongodb://localhost:27017/graphql_so');

const typeDefs = gql`
    type Usuario {
        id: ID!
        nombre: String!
        pass: String!
    }
    input UsuarioInput {
        nombre: String!
        pass: String!
    }
    type Alert {
        message: String!
    }
    type Query {
        getUsuarios: [Usuario]
        getUsuarioById(id: ID!): Usuario
    }
    type Mutation {
        addUsuario(input: UsuarioInput): Usuario
        updUsuario(id: ID!, input: UsuarioInput): Usuario
        delUsuario(id: ID!): Alert
    }
`;

const resolvers = {
    Query: {
        async getUsuarios() {
            const usuarios = await Usuario.find();
            return usuarios;
        },
        async getUsuarioById(_, { id }) {
            const usuarioBus = await Usuario.findById(id);
            if (usuarioBus == null) {
                return null;
            } else {
                return usuarioBus;
            }
        }
    },
    Mutation: {
        async addUsuario(_, { input }) {
            const usuario = new Usuario(input);
            await usuario.save();
            return usuario;
        },
        async updUsuario(_, { id, input }) {
            const usuario = await Usuario.findByIdAndUpdate(id, input, { new: true });
            return usuario;
        },
        async delUsuario(_, { id }) {
            await Usuario.findByIdAndDelete(id);
            return { message: "Usuario eliminado" };
        }
    }
};

const app = express();  // <-- movido ANTES de usarlo

const corsOption = {
    origin: 'http://localhost:8090',
    credentials: false
};
app.use(cors(corsOption));  // <-- agregado: aplicar cors a express

let apolloServer = null;

async function startServer() {
    apolloServer = new ApolloServer({ typeDefs, resolvers });  // <-- quitado corsOption de aquí
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
}

startServer();

app.listen(8090, function() {
    console.log(`GraphQL iniciando en http://localhost:8090/graphql`);
});
