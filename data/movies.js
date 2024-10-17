import { ObjectId } from "mongodb";
import getConnection from "./conn.js";


const DATABASE = "sample_mflix";
const MOVIES = "movies";

async function getAllMovies(pageSize, page) {   //EJ: http://localhost:3000/api/movies?pageSize=2&page=6 **** se puede cambiar el parametro de paginacion en la url
  const connectiondb = await getConnection();
  const movies = await connectiondb
    .db(DATABASE)
    .collection(MOVIES)
    .find({})
    .limit(pageSize)
    .skip(pageSize * page)
    .toArray();
  return movies;
}

export async function getMovie(id) {   //EJ: http://localhost:3000/api/movies/573a1391f29313caabcd7915

  if (typeof id !== "string" || id.length !== 24) {
    throw new Error("ID debe ser una cadena hexadecimal de 24 caracteres");
  }

  const clientmongo = await getConnection();
  const movie = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .findOne({ _id: new ObjectId(id) });

  return movie;
}

export async function addMovie(movie) {   //EJ: http://localhost:3000/api/movies ***mandar una movie en el body...
  const clientmongo = await getConnection();

  const result = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .insertOne(movie);
  return result;
}

export async function updateMovie(movie) {
  const clientmongo = await getConnection();
  const query = { _id: new ObjectId(movie._id) }; // Buscar una película por ID y modifica si le pasas el body... http://localhost:3000/api/movies/66fae0a35721d4c39ffbd48e
  const newValues = {
    $set: {
      plot: movie.plot,          // Modifica la sinopsis (plot)
      genres: movie.genres,      // Modifica los géneros
      runtime: movie.runtime,    // Modifica el tiempo de duración
      rated: movie.rated,        // Modifica la clasificación
      cast: movie.cast,          // Modifica el elenco
      poster: movie.poster,      // Modifica el poster
      title: movie.title,        // Modifica el título
      fullplot: movie.fullplot,  // Modifica la sinopsis completa
      languages: movie.languages,// Modifica los idiomas
      year: movie.year           // Modifica el año
    },
  };

  const result = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .updateOne(query, newValues); // Actualiza la película en la colección

  return result;
}

// Función para obtener las películas que han ganado al menos un premio http://localhost:3000/api/movies/winning?limit=5

export async function getWinningMovies(limit) {
  const clientmongo = await getConnection();
  const winningMovies = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .find({
      "awards.wins": { $gt: 0 },
      awards: { $exists: true },
    })
    .project({ title: 1, poster: 1, plot: 1 })
    .limit(limit) // Aplica el límite aquí
    .toArray();

  console.log("Películas ganadoras encontradas:", winningMovies.length);
  return winningMovies;
}


export async function deleteMovie(id) {
  const clientmongo = await getConnection();

  const result = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .deleteOne({ _id: new ObjectId(id) });
  return result;
}

// Función para obtener las películas filtradas por idioma  http://localhost:3000/api/movies/language/English?page=10&limit=3  *** el page es el nro de pag y el limit cuantos queres traer 
export async function getMoviesByLanguage(language, page, limit) {
  const clientmongo = await getConnection();
  const skip = (page - 1) * limit;

  // Se eliminó el .project() para obtener toda la información de las películas
  const movies = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .find({ languages: language })
    .skip(skip)
    .limit(limit)
    .toArray();

  const totalMovies = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .countDocuments({ languages: language });

  console.log("Total de películas encontradas por idioma:", totalMovies);
  return { totalMovies, movies };
}

export async function getMoviesRankedByFresh(page, limit) {
  const clientmongo = await getConnection();
  const skip = (page - 1) * limit;

  // Obtenemos las películas ordenadas por el puntaje "fresh"
  const movies = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .find({ "tomatoes.fresh": { $exists: true } }) // Filtramos solo las que tienen un valor "fresh"
    .sort({ "tomatoes.fresh": -1 }) // Ordenar de mayor a menor por "fresh"
    .skip(skip)
    .limit(limit)
    .toArray();

  const totalMovies = await clientmongo
    .db("sample_mflix")
    .collection("movies")
    .countDocuments({ "tomatoes.fresh": { $exists: true } });

  console.log("Total de películas con puntaje fresh:", totalMovies);
  return { totalMovies, movies };
}


export { getAllMovies };
