import { storeMoviesSeries } from "../database/data/moviesSeries.data";
import {
  createFavouriteMoviesSeriesTable,
  createMoviesSeriesTable,
} from "../database/migrations/moviesseries.migration";
import { createStatusTable } from "../database/migrations/status.migration";

export const startApi = async () => {
  const { POSTGRES_ADMIN_URL } = process.env;

  if (!POSTGRES_ADMIN_URL) {
    throw new Error("Environmental variables not found");
  }

  try {
    await createStatusTable();
    await createMoviesSeriesTable();
    await createFavouriteMoviesSeriesTable();

    await storeMoviesSeries(2000);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Error starting api");
    }
  }
};
