import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useMovieStore = defineStore("movie", () => {
  // [1] State (상태 관리 구역)
  const movies = ref([]);

  // [세션 스토리지 적용]
  const favorites = ref(JSON.parse(sessionStorage.getItem("favorites")) || []);

  // [2] UX 및 예외 처리를 위한 핵심 방어 상태 변수
  const isLoading = ref(false);
  const errorMessage = ref("");

  // [12주차 추가] 단일 영화 상세 정보 저장을 위한 전역 상태 변수(selectedMovie) 추가
  const selectedMovie = ref(null);

  // [3] Actions: 외부 서버 통신 함수 (async/await 적용)
  const fetchMovies = async () => {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      const API_KEY = "1ca625d796fcbad75a660feac714f6e9";

      const movieParams = {
        api_key: API_KEY,
        language: "ko-KR",
        region: "KR",
        sort_by: "popularity.desc",
        include_adult: false,
        "release_date.gte": "2025-01-01",
        with_release_type: "2|3",
        page: 1,
      };

      const response = await axios.get(
        "https://api.themoviedb.org/3/discover/movie",
        {
          params: movieParams,
        },
      );

      const fetchedMovies = response.data.results;

      // [세션 스토리지 상태 동기화]
      fetchedMovies.forEach((movie) => {
        const isAlreadyFavorite = favorites.value.some(
          (fav) => fav.id === movie.id,
        );
        movie.isFavorite = isAlreadyFavorite;
      });

      movies.value = fetchedMovies;
    } catch (error) {
      console.error("API 통신 에러 상세 내역:", error);
      errorMessage.value =
        "영화 데이터를 불러오는 데 실패했습니다. 통신 상태나 API Key를 확인해 주세요.";
    } finally {
      isLoading.value = false;
    }
  };

  // [찜하기 토글 및 세션 스토리지 반영 로직 - 홈 화면 해제 버그 수정]
  const toggleFavorite = (movieId) => {
    // 1. 먼저 현재 불러온 전체 영화 목록(movies)에서 해당 영화를 찾기
    const movie = movies.value.find((m) => m.id === movieId);

    if (movie) {
      // 목록에 영화가 존재하면 기존처럼 토글 처리하여 favorites 배열에 추가/제거를 수행
      movie.isFavorite = !movie.isFavorite;

      if (movie.isFavorite) {
        favorites.value.push(movie);
      } else {
        favorites.value = favorites.value.filter((m) => m.id !== movieId);
      }
    } else {
      // 2. [예외 조치] 홈 화면처럼 movies 배열이 비어있는 상태에서 찜 해제를 눌렀을 때의 방어선
      // 전역 찜 목록(favorites)에서 직접 해당 영화를 찾아내어 리스트에서 즉시 제거
      const favoriteMovie = favorites.value.find((m) => m.id === movieId);
      if (favoriteMovie) {
        favorites.value = favorites.value.filter((m) => m.id !== movieId);
      }
    }

    // 최종적으로 가공된 찜 목록 상태 배열을 브라우저 세션 스토리지에 동기화
    sessionStorage.setItem("favorites", JSON.stringify(favorites.value));
  };

  // [12주차 추가] 특정 영화 단일 상세 정보 API 호출 함수 구현 및 예외 처리
  const fetchMovieDetail = async (movieId) => {
    isLoading.value = true;
    errorMessage.value = "";
    selectedMovie.value = null;
    try {
      const API_KEY = "1ca625d796fcbad75a660feac714f6e9";
      const url = `https://api.themoviedb.org/3/movie/${movieId}`;
      const response = await axios.get(url, {
        params: {
          api_key: API_KEY,
          language: "ko-KR",
        },
      });
      selectedMovie.value = response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        errorMessage.value = "존재하지 않거나 삭제된 영화 정보입니다.";
      } else {
        errorMessage.value = "서버 통신 중 에러가 발생했습니다.";
      }
    } finally {
      isLoading.value = false;
    }
  };

  // [4] 컴포넌트가 사용할 수 있도록 상태와 함수들을 반환
  return {
    movies,
    favorites,
    isLoading,
    errorMessage,
    fetchMovies,
    toggleFavorite,
    // [12주차 추가] 외부 공개 명부에 주입
    selectedMovie,
    fetchMovieDetail,
  };
});
