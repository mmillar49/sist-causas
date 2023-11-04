import { MongoClient } from 'mongodb';

const connectionUrl = "mongodb+srv://usrcausa:causajacinta@cluster0.hpwofky.mongodb.net/";

const client = new MongoClient(connectionUrl);

let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}

let db = conn.db("Causas");

export default db;