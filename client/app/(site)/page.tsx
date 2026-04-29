import HomeCatalog from "../components/HomeCatalog";
import NoticeModal from "../components/NoticeModal";
import { fetchNoticePage } from "../../lib/api/customer-service";
import type { NoticeSummary } from "../../types/customer-service";

async function loadHomeNotices() {
  try {
    const page = await fetchNoticePage(0, 8);
    return { notices: page.content ?? [], error: null as string | null };
  } catch (e) {
    return {
      notices: [] as NoticeSummary[],
      error: e instanceof Error ? e.message : "공지를 불러오지 못했습니다.",
    };
  }
}

export default async function HomePage() {
  const { notices, error: homeNoticesError } = await loadHomeNotices();

  return (
    <main className="page" id="top">
      <NoticeModal />

      <HomeCatalog homeNotices={notices} homeNoticesError={homeNoticesError} />
    </main>
  );
}
