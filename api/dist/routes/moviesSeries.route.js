import { Router } from "express";
import { validate, validateQuery, validateQueryParams, } from "../middleware/validate.middleware.js";
import { submitGetFavouriteMoviesSeries, submitGetMovieSeries, submitMoviesSeriesRecommendation, sumbitLikeMovieSeries, } from "../controllers/moviesSeries.controller.js";
import { verifyToken, verifyTokenOptional, } from "../middleware/verifyToken.middleware.js";
import { getFavouriteMoviesSeriesSchema, getMovieSeriesSchema, likeMovieSeriesSchema, moviesSeriesSchema, } from "../validation/moviesSeries.validation.js";
export const moviesSeriesRouter = Router();
moviesSeriesRouter.post("/recommend", verifyTokenOptional, validate(moviesSeriesSchema), submitMoviesSeriesRecommendation);
moviesSeriesRouter.post("/like", verifyToken, validate(likeMovieSeriesSchema), sumbitLikeMovieSeries);
moviesSeriesRouter.get("/:id/get", verifyTokenOptional, validateQueryParams(getMovieSeriesSchema), submitGetMovieSeries);
moviesSeriesRouter.get("/favouriteMoviesSeries", verifyToken, validateQuery(getFavouriteMoviesSeriesSchema), submitGetFavouriteMoviesSeries);
