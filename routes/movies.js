import express from "express";
import { addMovie, getAllMovies, getMovie, updateMovie, deleteMovie, getWinningMovies, getMoviesByLanguage, getMoviesRankedByFresh } from "../data/movies.js";

const router = express.Router();

router.get("/ranked", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getMoviesRankedByFresh(page, limit);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener el ranking de películas:", error);
    res.status(500).json({ message: "Error al obtener el ranking de películas" });
  }
});

router.get("/", async (req, res) => {
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
  const page = req.query.page ? parseInt(req.query.page) : 0;

  res.json(await getAllMovies(pageSize, page));
});
// Endpoint para obtener películas ganadoras
router.get("/winning", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Por defecto, devolverá 10 si no se especifica
  try {
    const movies = await getWinningMovies(limit);
    res.json(movies);
  } catch (error) {
    console.error("Error al obtener películas ganadoras:", error);
    res.status(500).send("Error al obtener películas ganadoras");
  }
});

router.get("/:id", async (req, res) => {
  console.log("ID recibido:", req.params.id); // Agrega esto para depuración
  try {
    const movie = await getMovie(req.params.id);
    res.json(movie);
  } catch (error) {
    console.error("Error al obtener la película:", error);
    res.status(400).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const movie = req.body;
  const result = await addMovie(movie);
  res.json(result);
});

router.put("/:id", async (req, res) => {
  try {
    // Asegúrate de incluir el _id en el cuerpo de la solicitud
    const movieToUpdate = { ...req.body, _id: req.params.id }; // Agregar el _id a partir de los parámetros de la URL

    // Llamar a la función de actualización de la capa de datos
    const result = await updateMovie(movieToUpdate);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Movie not found or no changes made." });
    }

    // Recuperar la película actualizada para confirmación
    const updatedMovie = await getMovie(req.params.id);

    return res.status(200).json(updatedMovie); // Devuelve la película actualizada
  } catch (error) {
    console.error(error); // Log de error para depuración
    return res.status(500).json({ message: error.message }); // Respuesta de error
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const movieId = req.params.id; // Obtener el ID de la película de los parámetros de la URL

    // Llamar a la función de eliminación de la capa de datos
    const result = await deleteMovie(movieId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Movie not found." });
    }

    return res.status(200).json({ message: "Movie deleted successfully." });
  } catch (error) {
    console.error(error); // Log de error para depuración
    return res.status(500).json({ message: error.message });
  }
});

// Endpoint para obtener películas filtradas por idioma
router.get("/language/:language", async (req, res) => {
  const { language } = req.params; // Obtener el idioma de los parámetros de la URL
  const page = parseInt(req.query.page) || 1; // Obtener la página de la consulta, predeterminado a 1
  const limit = parseInt(req.query.limit) || 10; // Obtener el límite de resultados, predeterminado a 10

  try {
    const { totalMovies, movies } = await getMoviesByLanguage(language, page, limit); // Llamar a la función de acceso a datos
    const totalPages = Math.ceil(totalMovies / limit); // Calcular el total de páginas

    res.json({
      totalMovies,
      currentPage: page,
      totalPages,
      movies, // Retornar las películas encontradas
    });
  } catch (error) {
    console.error("Error al obtener las películas:", error);
    res.status(500).json({ error: "Error al obtener las películas" });
  }
});


export default router;
