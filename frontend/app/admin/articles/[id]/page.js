import ArticleEditor from '@/components/admin/ArticleEditor';

export const metadata = { title: 'Edit article' };

export default async function EditArticlePage({ params }) {
  const { id } = await params;
  return <ArticleEditor id={id} />;
}
