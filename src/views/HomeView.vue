<script setup>
import { useMovieStore } from "../stores/movieStore";

const store = useMovieStore();
</script>

<template>
  <main class="page">
    <div class="home-header">
      <h1>🏠 우리만의 영화 리뷰 사이트</h1>
      <p class="sub-title">최종 프로젝트의 메인 페이지입니다. 환영합니다!</p>
    </div>

    <section class="favorite-section">
      <div class="section-title-box">
        <h2>❤️ 내가 찜한 시네마 룸</h2>
        <p v-if="store.favorites.length > 0" class="fav-summary">
          현재 총 <strong>{{ store.favorites.length }}편</strong>의 영화를
          저장하셨습니다.
        </p>
      </div>

      <div v-if="store.favorites.length === 0" class="empty-favorites">
        <span class="empty-icon">🎬</span>
        <p>아직 찜한 영화가 없습니다.</p>
        <p class="empty-hint">
          영화 목록 페이지에서 마음에 드는 작품에 '찜하기'를 눌러보세요!
        </p>
        <RouterLink to="/movies" class="go-movies-btn"
          >영화 보러 가기</RouterLink
        >
      </div>

      <div v-else class="movie-list">
        <div
          v-for="movie in store.favorites"
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

            <RouterLink
              :to="`/movies/${movie.id}`"
              class="stretched-link"
              :aria-label="`${movie.title} 상세 정보 보기`"
            ></RouterLink>

            <button
              @click="store.toggleFavorite(movie.id)"
              class="fav-btn active"
            >
              ❤️ 찜 해제
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  padding: 40px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.home-header {
  margin-bottom: 40px;
  text-align: center;
  color: #2c3e50;
}
.sub-title {
  font-size: 15px;
  color: #7f8c8d;
  margin-top: 5px;
}

/* 🤍 찜 목록 섹션 스타일링 */
.favorite-section {
  background: #ffffff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 1200px;
  margin: 0 auto;
}
.section-title-box {
  border-bottom: 2px solid #edf2f7;
  padding-bottom: 15px;
  margin-bottom: 30px;
}
.section-title-box h2 {
  color: #2c3e50;
  font-size: 22px;
  font-weight: bold;
}
.fav-summary {
  font-size: 14px;
  color: #4a5568;
  margin-top: 5px;
}
.fav-summary strong {
  color: #ff4757;
  font-weight: bold;
}

/* 텅 빈 상태 UI */
.empty-favorites {
  text-align: center;
  padding: 60px 20px;
  color: #a4b0be;
}
.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}
.empty-hint {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 5px;
  margin-bottom: 25px;
}
.go-movies-btn {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.2s;
}
.go-movies-btn:hover {
  background-color: #2980b9;
}

/* 영화 카드 그리드 (기존 스타일 정합성 유지) */
.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 25px;
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
  border: 1px solid #edf2f7;
}
.movie-card:hover {
  transform: translateY(-5px);
}
.poster {
  width: 100%;
  height: 320px;
  object-fit: cover;
}
.poster-placeholder {
  width: 100%;
  height: 320px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-weight: bold;
}
.card-content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.title {
  font-size: 16px;
  color: #333;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}
.release-date {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 8px;
}
.rating {
  font-weight: bold;
  color: #f39c12;
  margin-bottom: 15px;
  font-size: 15px;
}
.fav-btn {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 10px;
  cursor: pointer;
  border: none;
  background: #ecf0f1;
  color: #333;
  border-radius: 6px;
  font-weight: bold;
  font-size: 13px;
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
</style>
