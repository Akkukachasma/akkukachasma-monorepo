import ArticleForm from "@/components/articles/ArticleForm";
import Header from "@/components/articles/header/NewArticleHeader";
import PageWrapper from "@/components/wrappers/PageWrapper";

const page = () => {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header />
      <PageWrapper>
        <ArticleForm />
      </PageWrapper>
    </div>
  );
};
export default page;
