import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  MoviesSeries,
  MoviesSeriesForm,
  MoviesSeriesWithResults,
} from "../types/moviesSeries.type";
import axios, { AxiosError } from "axios";
import { API_URL } from "../config/api.config";
import { auth } from "../config/firebase.config";

const initialState: {
  favouritesPage: number;
  recommendationsPage: number;
  error: string | undefined;
  loadingLike: boolean;
  loadingMovieSeries: boolean;
  loadingFavourites: boolean;
  loadingMoviesSeriesRecommendations: boolean;
  moviesSeriesRecommendations: MoviesSeriesWithResults | undefined;
  movieSeries: MoviesSeries | undefined;
  favouriteMoviesSeries: MoviesSeriesWithResults | undefined;
  moviesSeriesForm: MoviesSeriesForm | undefined;
  favouriteMoviesSeriesForm: { search?: string } | undefined;
} = {
  favouritesPage: 0,
  recommendationsPage: 0,
  error: undefined,
  loadingLike: false,
  loadingMovieSeries: false,
  loadingFavourites: false,
  loadingMoviesSeriesRecommendations: false,
  moviesSeriesRecommendations: undefined,
  movieSeries: undefined,
  favouriteMoviesSeries: undefined,
  moviesSeriesForm: undefined,
  favouriteMoviesSeriesForm: undefined,
};

// Get movies_series
export const getMoviesSeriesRecommendation = createAsyncThunk<
  MoviesSeriesWithResults | undefined,
  MoviesSeriesForm & { page: number }
>("movies-series/recommend", async (formData, { rejectWithValue }) => {
  try {
    const user = auth.currentUser;
    const idToken = await user?.getIdToken();

    const response = await axios.post(
      `${API_URL}/movies-series/recommend`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.data as MoviesSeriesWithResults;
  } catch (error) {
    if (error instanceof AxiosError) {
      rejectWithValue(error.response?.data);
    } else {
      rejectWithValue("Error getting movies/series recommendation");
    }
  }
});

// Like a movie_series
export const likeMovieSeries = createAsyncThunk<
  MoviesSeries | undefined,
  { id: number; content: "movie" | "series" }
>("movies-series/like", async ({ id, content }, { rejectWithValue }) => {
  try {
    const user = auth.currentUser;
    const idToken = await user?.getIdToken();

    const response = await axios.post(
      `${API_URL}/movies-series/like`,
      { id, content },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return response.data as MoviesSeries | undefined;
  } catch (error) {
    if (error instanceof AxiosError) {
      rejectWithValue(error.response?.data);
    } else {
      rejectWithValue("Error liking/disliking movies/series");
    }
  }
});

// Get favourite movies_series
export const getFavouriteMoviesSeries = createAsyncThunk<
  MoviesSeriesWithResults | undefined,
  { page: number; search?: string }
>(
  "/movies-series/favourites",
  async ({ page, search }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken(true);

      const response = await axios.get(
        `${API_URL}/movies-series/favouriteMoviesSeries?page=${page}${
          search ? `&search=${search}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      return response.data as MoviesSeriesWithResults | undefined;
    } catch (error) {
      if (error instanceof AxiosError) {
        rejectWithValue(error.response?.data);
      } else {
        rejectWithValue("Error getting favourite movies/series");
      }
    }
  }
);

// Get movie_series
export const getMovieSeries = createAsyncThunk<
  MoviesSeries | undefined,
  { id: number; content: "movie" | "series" }
>(
  "/movie-series/id/get?content",
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const response = await axios.get(
        `${API_URL}/movies-series/${id}/get?content=${content}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      return response.data as MoviesSeries | undefined;
    } catch (error) {
      if (error instanceof AxiosError) {
        rejectWithValue(error.response?.data);
      } else {
        rejectWithValue("Error getting favourite movies/series");
      }
    }
  }
);

const moviesSeriesSlice = createSlice({
  name: "moviesSeries",
  initialState,
  reducers: {
    setFavouritesPage: (state, action) => {
      state.favouritesPage = action.payload;
    },
    setRecommendationsPage: (state, action) => {
      state.recommendationsPage = action.payload;
    },
    clearMoviesSeriesRecommendations: (state) => {
      state.moviesSeriesRecommendations = undefined;
      state.moviesSeriesForm = undefined;
    },
    clearMovieSeries: (state) => {
      state.movieSeries = undefined;
    },
    clearFavourites: (state) => {
      state.favouriteMoviesSeries = undefined;
    },
    setFormData: (state, action) => {
      state.moviesSeriesForm = action.payload;
    },
    setFavouritesFromData: (state, action) => {
      state.favouriteMoviesSeriesForm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMoviesSeriesRecommendation.pending, (state) => {
        state.loadingMoviesSeriesRecommendations = true;
      })
      .addCase(getMoviesSeriesRecommendation.fulfilled, (state, action) => {
        state.loadingMoviesSeriesRecommendations = false;
        state.moviesSeriesRecommendations = action.payload;
      })
      .addCase(getMoviesSeriesRecommendation.rejected, (state, action) => {
        state.loadingMoviesSeriesRecommendations = false;
        state.error = action.payload as string;
      })
      .addCase(likeMovieSeries.pending, (state) => {
        state.loadingLike = true;
      })
      .addCase(likeMovieSeries.fulfilled, (state, action) => {
        state.loadingLike = false;

        const likedMovieSeries = action.payload;

        if (!likedMovieSeries) {
          return;
        }

        if (state.movieSeries) {
          state.movieSeries = likedMovieSeries;
        }

        if (state.favouriteMoviesSeries?.results) {
          state.favouriteMoviesSeries.results =
            state.favouriteMoviesSeries.results.map((movieSeries) => {
              return movieSeries.id === likedMovieSeries.id
                ? { ...movieSeries, liked: likedMovieSeries.liked }
                : movieSeries;
            });
        }

        if (state.moviesSeriesRecommendations?.results) {
          state.moviesSeriesRecommendations.results =
            state.moviesSeriesRecommendations.results.map((movieSeries) => {
              return movieSeries.id === likedMovieSeries.id
                ? { ...movieSeries, liked: likedMovieSeries.liked }
                : movieSeries;
            });
        }
      })
      .addCase(likeMovieSeries.rejected, (state, action) => {
        state.loadingLike = false;
        state.error = action.payload as string;
      })
      .addCase(getFavouriteMoviesSeries.pending, (state) => {
        state.loadingFavourites = true;
      })
      .addCase(getFavouriteMoviesSeries.fulfilled, (state, action) => {
        state.loadingFavourites = false;
        state.favouriteMoviesSeries = action.payload;
      })
      .addCase(getFavouriteMoviesSeries.rejected, (state, action) => {
        state.loadingFavourites = false;
        state.error = action.payload as string;
      })
      .addCase(getMovieSeries.pending, (state) => {
        state.loadingMovieSeries = true;
      })
      .addCase(getMovieSeries.fulfilled, (state, action) => {
        state.loadingMovieSeries = false;
        state.movieSeries = action.payload;
      })
      .addCase(getMovieSeries.rejected, (state, action) => {
        state.loadingMovieSeries = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFavouritesPage,
  setRecommendationsPage,
  setFavouritesFromData,
  setFormData,
  clearMovieSeries,
  clearMoviesSeriesRecommendations,
  clearFavourites,
} = moviesSeriesSlice.actions;
export default moviesSeriesSlice.reducer;
