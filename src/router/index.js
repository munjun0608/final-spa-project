import { createRouter, createWebHistory } from "vue-router";
// 💡 이제 이 HomeView를 아래 routes 명부에서 정상적으로 사용할 것입니다.
import HomeView from "../views/HomeView.vue";
// [12주차 추가] 신규 생성할 영화 상세 페이지 컴포넌트 연결
import MovieDetailView from "../views/MovieDetailView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 💡 [누락 해결] 홈 화면으로 진입했을 때 HomeView 컴포넌트를 보여주도록 명부 등록
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/movies",
      name: "movies",
      component: () => import("../views/MoviesView.vue"),
    },
    {
      path: "/movies/:id",
      name: "movie-detail",
      component: MovieDetailView,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

export default router;
