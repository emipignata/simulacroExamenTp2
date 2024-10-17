import "dotenv/config";
import express from "express";
import moviesRouter from "./routes/movies.js";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB;
const client = new MongoClient(uri);
let instance = null;

async function connectToDatabase() {
  try {
    instance = await client.connect();
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use("/api/movies", moviesRouter);

// Conectar a la base de datos antes de iniciar el servidor
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log("Servidor Web en el puerto:", PORT);
  });
});
