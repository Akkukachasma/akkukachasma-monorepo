import ArticleForm from "@/components/articles/ArticleForm";
import Header from "@/components/articles/header/NewArticleHeader";
import PageWrapper from "@/components/wrappers/PageWrapper";
interface PageProps {
  params: Promise<{ id: string }>;
}
const page = async ({ params }: PageProps) => {
  const { id } = await params;
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header />
      <PageWrapper>
        <ArticleForm id={id} />
      </PageWrapper>
    </div>
  );
};
export default page;
