<script setup>
import { onMounted, ref, computed } from "vue";
import { useMovieStore } from "../stores/movieStore";

const store = useMovieStore();

// --- 🕹️ 추가 미션 제어를 위한 순수 자바스크립트 반응형 상태(State) 선언 ---
const searchQuery = ref(""); // [선택 2] 검색창 입력값 상태 변수
const sortBy = ref("popularity"); // [선택 1] 정렬 기준 상태 변수 (기본값: 인기순)
const currentPage = ref(1); // [선택 4] 페이지네이션 현재 페이지 번호
const itemsPerPage = 8; // [선택 4] 한 페이지에 노출할 영화 개수

onMounted(() => {
  store.fetchMovies();
});

// --- 🔍 [선택 2: 검색] 자바스크립트 순수 filter 메서드 연산 논리 ---
const filteredMovies = computed(() => {
  if (!searchQuery.value.trim()) {
    return store.movies;
  }
  // 사용자가 입력한 검색어와 영화 제목을 모두 소문자로 변환 후 포함 여부(includes) 필터링
  return store.movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// --- 🔤 [선택 1: 정렬] 자바스크립트 순수 sort 메서드 연산 논리 ---
const sortedMovies = computed(() => {
  // 원본 배열인 store.movies의 훼손을 방지하기 위해 얕은 복사([...스프레드 연산자]) 후 정렬 진행
  const baseMovies = [...filteredMovies.value];

  if (sortBy.value === "title") {
    // 문자열 정렬: localeCompare 순수 메서드를 사용하여 한국어/영어 제목 순 정렬
    return baseMovies.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === "release") {
    // 개봉일 정렬: 문자열 날짜를 Date 객체 정수로 변환하여 최신순(내림차순) 정렬
    return baseMovies.sort(
      (a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0),
    );
  } else if (sortBy.value === "rating") {
    // 평점 정렬: vote_average 수치를 비교하여 평점 높은 순(내림차순) 정렬
    return baseMovies.sort((a, b) => b.vote_average - a.vote_average);
  }

  // 기본값(popularity): 스토어 원본(인기순) 배열 반환
  return baseMovies;
});

// --- 🔢 [선택 4: 페이지네이션] 자바스크립트 순수 slice 메서드 연산 논리 ---
const totalPages = computed(() => {
  // 필터링 및 정렬이 완료된 전체 데이터 개수를 페이지당 개수로 나누어 올림(Math.ceil) 처리
  return Math.ceil(sortedMovies.value.length / itemsPerPage) || 1;
});

const paginatedMovies = computed(() => {
  // 검색 요건 변동으로 인해 현재 페이지가 총 페이지 수를 초과할 경우 1페이지로 안전 방어
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
  // 순수 slice 메서드에 적용할 시작(start) 인덱스와 끝(end) 인덱스 계산
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedMovies.value.slice(start, end);
});

// 페이지 변경 핸들러 함수
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" }); // 페이지 이동 시 최상단 스크롤 제어
  }
};
</script>

<template>
  <main class="page">
    <div class="header-section">
      <h1>🍿 국내 극장 화제작 (인기순)</h1>
      <p class="sub-title">2025년 이후 국내 정식 개봉한 실시간 인기 상영작</p>
    </div>

    <div class="control-panel">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="영화 제목을 입력하세요..."
          class="search-input"
        />
      </div>
      <div class="sort-filter">
        <select v-model="sortBy" class="sort-select">
          <option value="popularity">🔥 인기순</option>
          <option value="title">🔤 제목순</option>
          <option value="release">📅 개봉일순</option>
          <option value="rating">⭐ 평점순</option>
        </select>
      </div>
    </div>

    <div v-if="store.isLoading" class="status-message loading">
      ⏳ 실시간 국내 개봉작 데이터를 싣고 오는 중입니다...
    </div>

    <div v-else-if="store.errorMessage" class="status-message error">
      🚨 {{ store.errorMessage }}
    </div>

    <div v-else-if="paginatedMovies.length === 0" class="status-message empty">
      🔍 검색 결과에 부합하는 영화 데이터가 존재하지 않습니다.
    </div>

    <div v-else>
      <div class="movie-list">
        <div
          v-for="movie in paginatedMovies"
          :key="movie.id"
          class="movie-card"
        >
          <img
            v-if="movie.poster_path"
            :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
            :alt="movie.title"
            class="poster"
          />
          <div v-else class="poster-placeholder">이미지 준비 중</div>
          <div class="card-content">
            <h3 class="title">{{ movie.title }}</h3>
            <p class="release-date" v-if="movie.release_date">
              📅 개봉일: {{ movie.release_date }}
            </p>
            <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }} / 10</p>
            <p class="overview">
              {{
                movie.overview
                  ? movie.overview.substring(0, 60) + "..."
                  : "국내에 등록된 줄거리 요약 정보가 없습니다."
              }}
            </p>

            <RouterLink
              :to="`/movies/${movie.id}`"
              class="stretched-link"
              :aria-label="`${movie.title} 상세 정보 보기`"
            ></RouterLink>

            <button
              @click="store.toggleFavorite(movie.id)"
              :class="{ active: movie.isFavorite }"
              class="fav-btn"
            >
              {{ movie.isFavorite ? "❤️ 찜 해제" : "🤍 찜하기" }}
            </button>
          </div>
        </div>
      </div>

      <div class="pagination-wrapper">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-arrow-btn"
        >
          이전
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          @click="changePage(page)"
          :class="{ active: page === currentPage }"
          class="page-num-btn"
        >
          {{ page }}
        </button>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-arrow-btn"
        >
          다음
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page {
  padding: 40px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.header-section {
  margin-bottom: 30px;
  text-align: center;
  color: #2c3e50;
}
.sub-title {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 5px;
}

/* 🕹️ 추가 미션 컨트롤 레이아웃 스타일 디자인 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: #ffffff;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  gap: 15px;
}
.search-bar {
  flex: 1;
  max-width: 400px;
}
.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.search-input:focus {
  border-color: #3498db;
}
.sort-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.status-message {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  padding: 20px;
  border-radius: 12px;
}
.loading {
  color: #3498db;
  background-color: #e3f2fd;
}
.error {
  color: #e74c3c;
  background-color: #fdeaea;
}
.empty {
  color: #7f8c8d;
  background-color: #f5f6fa;
  font-size: 16px;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}
.movie-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  text-align: left;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}
.movie-card:hover {
  transform: translateY(-5px);
}
.poster {
  width: 100%;
  height: 380px;
  object-fit: cover;
}
.poster-placeholder {
  width: 100%;
  height: 380px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-weight: bold;
}
.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.title {
  font-size: 18px;
  color: #333;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}
.release-date {
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 10px;
  font-weight: 500;
}
.rating {
  font-weight: bold;
  color: #f39c12;
  margin-bottom: 10px;
  font-size: 16px;
}
.overview {
  font-size: 13px;
  color: #555;
  line-height: 1.4;
  margin-bottom: 20px;
  flex-grow: 1;
}
.fav-btn {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 12px;
  cursor: pointer;
  border: none;
  background: #ecf0f1;
  color: #333;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  transition: 0.3s;
  margin-top: auto;
}
.fav-btn.active {
  background: #ff4757;
  color: white;
}
.stretched-link {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* 🔢 페이지네이션 컨트롤 UI 디자인 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 40px;
}
.page-arrow-btn,
.page-num-btn {
  padding: 8px 14px;
  border: 1px solid #e1e8ed;
  background-color: #fff;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.page-arrow-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-num-btn.active {
  background-color: #3498db;
  color: #fff;
  border-color: #3498db;
}
.page-arrow-btn:hover:not(:disabled),
.page-num-btn:hover:not(.active) {
  background-color: #f1f2f6;
}
</style>
